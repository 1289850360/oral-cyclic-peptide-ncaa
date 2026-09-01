import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { originalResearchLinks, originalUnmappedResearchRecords } from "./research-evidence-links.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const readJson = async (name) => JSON.parse(await readFile(join(publicDir, name), "utf8"));
const [catalog, deepReview, coreBatch1, coreBatch2] = await Promise.all([
  readJson("ccd-unified-structure-catalog.json"), readJson("ccd-manual-review-92-final.json"),
  readJson("ccd-core-priority-review-batch-1.json"), readJson("ccd-core-priority-review-batch-2.json"),
]);

const originalByRecord = new Map();
for (const link of originalResearchLinks) {
  const current = originalByRecord.get(link.recordId) ?? { recordId: link.recordId, name: link.name, evidenceLevel: link.evidenceLevel, ccdIds: [], origin: "original-curated" };
  current.ccdIds.push(link.ccdId);
  originalByRecord.set(link.recordId, current);
}
for (const record of originalUnmappedResearchRecords) originalByRecord.set(record.recordId, { ...record, ccdIds: [], origin: "original-curated" });

const originalCcdIds = new Set(originalResearchLinks.map((record) => record.ccdId.toUpperCase()));
const deepRecords = deepReview.records.filter((record) => !originalCcdIds.has(record.ccdId.toUpperCase())).map((record) => ({
  recordId: `CCD-${record.ccdId}-REVIEW`, name: record.name, evidenceLevel: `审核${record.grade}`, ccdIds: [record.ccdId], origin: "manual-92-review",
}));
const existingCcdIds = new Set([...originalCcdIds, ...deepReview.records.map((record) => record.ccdId.toUpperCase())]);
const coreRecords = [...coreBatch1.records, ...coreBatch2.records].filter((record) => ["A", "B"].includes(record.grade) && !existingCcdIds.has(record.ccdId.toUpperCase())).map((record) => ({
  recordId: `CCD-${record.ccdId}-CORE`, name: record.name, evidenceLevel: `核心审核${record.grade}`, ccdIds: [record.ccdId], origin: "core-priority-review",
}));
const catalogByCcd = new Map(catalog.records.flatMap((record) => record.ccdIds.map((ccdId) => [ccdId.toUpperCase(), record])));
const records = [...originalByRecord.values(), ...deepRecords, ...coreRecords].map((record) => {
  const mappingStatus = record.ccdIds.length === 0 ? "unmapped-concept" : record.ccdIds.length === 1 ? "mapped-single" : "mapped-multiple";
  const structureClasses = [...new Set(record.ccdIds.map((ccdId) => catalogByCcd.get(ccdId.toUpperCase())?.componentClass.id).filter(Boolean))];
  return { ...record, ccdIds: [...new Set(record.ccdIds)], mappingStatus, structureClasses };
});

const allLinkedCcdIds = new Set(records.flatMap((record) => record.ccdIds.map((ccdId) => ccdId.toUpperCase())));
const missingCcdIds = [...allLinkedCcdIds].filter((ccdId) => !catalogByCcd.has(ccdId));
const catalogLinkedCcdIds = new Set(catalog.records.filter((record) => record.researchEvidence?.length).flatMap((record) => record.ccdIds.map((ccdId) => ccdId.toUpperCase())));
const missingEvidenceAttachments = [...allLinkedCcdIds].filter((ccdId) => !catalogLinkedCcdIds.has(ccdId));
const orphanEvidenceAttachments = [...catalogLinkedCcdIds].filter((ccdId) => !allLinkedCcdIds.has(ccdId));
const mappingCounts = Object.fromEntries(["mapped-single", "mapped-multiple", "unmapped-concept"].map((status) => [status, records.filter((record) => record.mappingStatus === status).length]));
const originCounts = Object.fromEntries(["original-curated", "manual-92-review", "core-priority-review"].map((origin) => [origin, records.filter((record) => record.origin === origin).length]));
const expectedRecordCount = originalByRecord.size + deepRecords.length + coreRecords.length;
const validation = { missingCcdIds, missingEvidenceAttachments, orphanEvidenceAttachments, passed: !missingCcdIds.length && !missingEvidenceAttachments.length && !orphanEvidenceAttachments.length && records.length === expectedRecordCount };
if (!validation.passed) throw new Error(`Research alignment failed: ${JSON.stringify(validation)}`);

const payload = { metadata: { generatedAt: new Date().toISOString(), model: "CCD-first evidence alignment", recordCount: records.length, linkedCcdStructureCount: allLinkedCcdIds.size, mappingCounts, originCounts, validation }, records };
const fields = ["recordId", "name", "evidenceLevel", "origin", "mappingStatus", "ccdIds", "structureClasses"];
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csvRows = records.map((record) => ({ ...record, ccdIds: record.ccdIds.join(" / "), structureClasses: record.structureClasses.join(" / ") }));
const csv = [fields, ...csvRows.map((record) => fields.map((field) => record[field]))].map((row) => row.map(escape).join(",")).join("\n");
await Promise.all([
  writeFile(join(publicDir, "ccd-research-evidence-alignment.json"), `${JSON.stringify(payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-research-evidence-alignment.csv"), `\uFEFF${csv}\n`, "utf8"),
]);
console.log(JSON.stringify(payload.metadata, null, 2));
