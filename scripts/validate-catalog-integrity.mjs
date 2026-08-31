import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const reportPath = path.join(publicDir, "catalog-integrity-report.json");
const issuesPath = path.join(publicDir, "catalog-integrity-issues.csv");

const issues = [];
const addIssue = (severity, dataset, record, field, message) => {
  issues.push({ severity, dataset, record, field, message });
};

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some(Boolean));
  return values.map((item) => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), item[index] ?? ""])));
};

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const normalizeFormula = (value) => String(value ?? "").replaceAll(" ", "");
const splitCcdIds = (value) => String(value ?? "").split(/\s*\/\s*/).filter(Boolean);
const splitLinks = (value) => String(value ?? "").split(/\s*[；;]\s*/).filter(Boolean);
const validCcdId = (value) => /^[A-Z0-9]{1,5}$/.test(value);
const linksMatchCcdIds = (value, ccdIds, makeUrl) => {
  const links = splitLinks(value);
  return links.length === ccdIds.length && links.every((link, index) => link === makeUrl(ccdIds[index]));
};

const catalog = JSON.parse(await readFile(path.join(publicDir, "ccd-verified-cores.json"), "utf8"));
const catalogCsv = parseCsv(await readFile(path.join(publicDir, "ccd-verified-cores-1687.csv"), "utf8"));
const reviewQueue = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-1805.csv"), "utf8"));
const manualReviewFinal = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-final.json"), "utf8"));
const manualReviewFinalCsv = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-final.csv"), "utf8"));
const manualReviewBatch1 = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-batch-1.json"), "utf8"));
const manualReviewBatch1Csv = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-batch-1.csv"), "utf8"));
const manualReviewBatch2 = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-batch-2.json"), "utf8"));
const manualReviewBatch2Csv = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-batch-2.csv"), "utf8"));
const manualReviewBatch3 = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-batch-3.json"), "utf8"));
const manualReviewBatch3Csv = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-batch-3.csv"), "utf8"));
const manualReview92Final = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-92-final.json"), "utf8"));
const manualReview92FinalCsv = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-92-final.csv"), "utf8"));
const developmentScreen = JSON.parse(await readFile(path.join(publicDir, "ccd-development-screen.json"), "utf8"));
const developmentScreenCsv = parseCsv(await readFile(path.join(publicDir, "ccd-development-screen.csv"), "utf8"));
const unifiedCatalog = JSON.parse(await readFile(path.join(publicDir, "ccd-unified-structure-catalog.json"), "utf8"));
const polymerUsage = JSON.parse(await readFile(path.join(publicDir, "ccd-polymer-usage-audit.json"), "utf8"));
const polymerUsageCsv = parseCsv(await readFile(path.join(publicDir, "ccd-polymer-usage-audit.csv"), "utf8"));

if (catalog.metadata.count !== catalog.records.length) {
  addIssue("error", "catalog-json", "metadata", "count", `Metadata says ${catalog.metadata.count}, but JSON contains ${catalog.records.length} records.`);
}
if (catalogCsv.length !== catalog.records.length) {
  addIssue("error", "catalog-csv", "all", "row-count", `CSV contains ${catalogCsv.length} rows; JSON contains ${catalog.records.length}.`);
}

const recordIds = new Set();
const catalogCcdIds = new Set();
const smilesOwners = new Map();
let sourceUrlMatches = 0;
let imageUrlMatches = 0;

catalog.records.forEach((record, index) => {
  const label = record.primaryCcdId || `row-${index + 1}`;
  if (recordIds.has(record.id)) addIssue("error", "catalog-json", label, "id", `Duplicate record id: ${record.id}`);
  recordIds.add(record.id);
  if (!Array.isArray(record.ccdIds) || record.ccdIds.length === 0) {
    addIssue("error", "catalog-json", label, "ccdIds", "No CCD identifier is attached to this record.");
    return;
  }
  if (record.primaryCcdId !== record.ccdIds[0]) {
    addIssue("error", "catalog-json", label, "primaryCcdId", "Primary CCD identifier is not the first ccdIds value.");
  }
  record.ccdIds.forEach((ccdId) => {
    if (!validCcdId(ccdId)) addIssue("error", "catalog-json", label, "ccdIds", `Malformed CCD identifier: ${ccdId}`);
    if (catalogCcdIds.has(ccdId)) addIssue("error", "catalog-json", label, "ccdIds", `CCD identifier appears in more than one record: ${ccdId}`);
    catalogCcdIds.add(ccdId);
  });
  if (!record.name) addIssue("error", "catalog-json", label, "name", "Missing component name.");
  if (!record.formula) addIssue("error", "catalog-json", label, "formula", "Missing molecular formula.");
  if (!record.smiles) addIssue("error", "catalog-json", label, "smiles", "Missing stereochemical SMILES.");
  if (!(record.formulaWeight > 0)) addIssue("warning", "catalog-json", label, "formulaWeight", "Formula weight is absent or non-positive.");
  if (record.smiles) {
    const previous = smilesOwners.get(record.smiles);
    if (previous && previous !== record.id) addIssue("error", "catalog-json", label, "smiles", `Duplicate stereochemical SMILES also used by ${previous}.`);
    smilesOwners.set(record.smiles, record.id);
  }
  const encodedId = encodeURIComponent(record.primaryCcdId);
  if (record.sourceUrl === `https://www.rcsb.org/ligand/${encodedId}`) sourceUrlMatches += 1;
  else addIssue("error", "catalog-json", label, "sourceUrl", "RCSB link does not match primaryCcdId.");
  if (record.structureImageUrl === `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${encodedId}_500.svg`) imageUrlMatches += 1;
  else addIssue("error", "catalog-json", label, "structureImageUrl", "PDBe image link does not match primaryCcdId.");

  const csvRow = catalogCsv[index];
  if (!csvRow) return;
  if (splitCcdIds(csvRow["CCD编号"]).join("|") !== record.ccdIds.join("|")) {
    addIssue("error", "catalog-cross-check", label, "CCD编号", "CSV and JSON CCD identifiers differ at the same row.");
  }
  if (csvRow["名称"] !== record.name) addIssue("error", "catalog-cross-check", label, "名称", "CSV and JSON names differ at the same row.");
  if (normalizeFormula(csvRow["分子式"]) !== normalizeFormula(record.formula)) {
    addIssue("error", "catalog-cross-check", label, "分子式", "CSV and JSON molecular formulae differ at the same row.");
  }
  if (csvRow["立体化学SMILES"] !== record.smiles) addIssue("error", "catalog-cross-check", label, "立体化学SMILES", "CSV and JSON SMILES differ at the same row.");
});

const reviewIds = new Set();
const priorityCounts = {};
let reviewSourceMatches = 0;
let reviewImageMatches = 0;

reviewQueue.forEach((record, index) => {
  const ccdIds = splitCcdIds(record["CCD编号"]);
  const label = record["CCD编号"] || `row-${index + 1}`;
  if (reviewIds.has(label)) addIssue("error", "review-queue", label, "CCD编号", "Duplicate review-row CCD field.");
  reviewIds.add(label);
  ccdIds.forEach((ccdId) => {
    if (!validCcdId(ccdId)) addIssue("error", "review-queue", label, "CCD编号", `Malformed CCD identifier: ${ccdId}`);
  });
  const tier = record["审核优先级"]?.split("｜")[0] || "missing";
  priorityCounts[tier] = (priorityCounts[tier] ?? 0) + 1;
  if (!record["名称"]) addIssue("error", "review-queue", label, "名称", "Missing component name.");
  if (!record["立体化学SMILES"]) addIssue("error", "review-queue", label, "立体化学SMILES", "Missing stereochemical SMILES.");
  if (linksMatchCcdIds(record["CCD链接"], ccdIds, (ccdId) => `https://www.rcsb.org/ligand/${ccdId}`)) reviewSourceMatches += 1;
  else addIssue("error", "review-queue", label, "CCD链接", "RCSB links do not map one-to-one to the CCD identifiers.");
  if (linksMatchCcdIds(record["结构图链接"], ccdIds, (ccdId) => `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccdId}_500.svg`)) reviewImageMatches += 1;
  else addIssue("error", "review-queue", label, "结构图链接", "PDBe image links do not map one-to-one to the CCD identifiers.");
});

const expectedPriorities = { P0: 6, P1: 45, P2: 484, P3: 1270 };
for (const [tier, expected] of Object.entries(expectedPriorities)) {
  if (priorityCounts[tier] !== expected) addIssue("error", "review-queue", tier, "row-count", `Expected ${expected}; found ${priorityCounts[tier] ?? 0}.`);
}

const manualStatuses = new Set(["recommended-review", "conditional", "deferred", "excluded"]);
const manualStatusLabels = { "recommended-review": "优先深审", conditional: "条件候选", deferred: "暂缓", excluded: "排除" };
const manualStatusCounts = Object.fromEntries([...manualStatuses].map((status) => [status, 0]));
if (manualReviewFinal.records.length !== reviewQueue.length) {
  addIssue("error", "manual-review-final", "all", "row-count", `Final JSON contains ${manualReviewFinal.records.length} rows; source queue contains ${reviewQueue.length}.`);
}
if (manualReviewFinalCsv.length !== manualReviewFinal.records.length) {
  addIssue("error", "manual-review-final", "all", "csv-row-count", `Final CSV contains ${manualReviewFinalCsv.length} rows; JSON contains ${manualReviewFinal.records.length}.`);
}
manualReviewFinal.records.forEach((record, index) => {
  const source = reviewQueue[index];
  const csvRow = manualReviewFinalCsv[index];
  const label = record.ccdIds?.join(" / ") || `row-${index + 1}`;
  if (!source || splitCcdIds(source["CCD编号"]).join("|") !== record.ccdIds.join("|") || source["名称"] !== record.name || source["立体化学SMILES"] !== record.smiles) {
    addIssue("error", "manual-review-final", label, "source-match", "Final result does not match the source queue at the same row.");
  }
  if (!manualStatuses.has(record.finalStatus)) {
    addIssue("error", "manual-review-final", label, "finalStatus", `Unknown final status: ${record.finalStatus ?? "missing"}.`);
  } else {
    manualStatusCounts[record.finalStatus] += 1;
  }
  if (!record.finalReason) addIssue("error", "manual-review-final", label, "finalReason", "Final result has no stated reason.");
  if (record.finalStatus === "recommended-review" && !["curated-evidence", "short-polymer"].includes(record.evidenceStatus)) {
    addIssue("error", "manual-review-final", label, "evidenceStatus", "Recommended-review record lacks curated or short-polymer evidence.");
  }
  if (record.finalStatus === "excluded" && record.decision !== "排除") addIssue("error", "manual-review-final", label, "decision", "Excluded final record is not excluded by the structure screen.");
  if (csvRow && (csvRow["CCD编号"] !== label || csvRow["名称"] !== record.name || csvRow["最终状态"] !== manualStatusLabels[record.finalStatus])) {
    addIssue("error", "manual-review-final", label, "csv-match", "Final CSV and JSON differ at the same row.");
  }
});
for (const status of manualStatuses) {
  if (manualReviewFinal.metadata.finalStatusCounts?.[status] !== manualStatusCounts[status]) {
    addIssue("error", "manual-review-final", status, "status-count", `Metadata says ${manualReviewFinal.metadata.finalStatusCounts?.[status] ?? "missing"}; counted ${manualStatusCounts[status]}.`);
  }
}

const batchGrades = new Set(["A", "B", "C", "EXCLUDE"]);
const batchGradeCounts = Object.fromEntries([...batchGrades].map((grade) => [grade, 0]));
const finalByCcd = new Map(manualReviewFinal.records.flatMap((record) => record.ccdIds.map((ccdId) => [ccdId, record])));
if (manualReviewBatch1.records.length !== 20 || manualReviewBatch1Csv.length !== 20) {
  addIssue("error", "manual-review-batch-1", "all", "row-count", `Expected 20 rows; JSON has ${manualReviewBatch1.records.length}, CSV has ${manualReviewBatch1Csv.length}.`);
}
const batchCcdIds = new Set();
manualReviewBatch1.records.forEach((record, index) => {
  const label = record.ccdId || `row-${index + 1}`;
  if (batchCcdIds.has(label)) addIssue("error", "manual-review-batch-1", label, "ccdId", "Duplicate batch CCD identifier.");
  batchCcdIds.add(label);
  const sourceRecord = finalByCcd.get(label);
  if (!sourceRecord || sourceRecord.finalStatus !== "recommended-review" || sourceRecord.name !== record.name) {
    addIssue("error", "manual-review-batch-1", label, "source-match", "Batch record does not map to a recommended-review source record.");
  }
  if (!batchGrades.has(record.grade)) addIssue("error", "manual-review-batch-1", label, "grade", `Unknown grade: ${record.grade ?? "missing"}.`);
  else batchGradeCounts[record.grade] += 1;
  if (!record.conclusion || !record.recommendation || !record.cyclicEvidence || !record.oralEvidence) addIssue("error", "manual-review-batch-1", label, "evidence", "Batch record is missing a conclusion or evidence field.");
  if (!Array.isArray(record.sources) || record.sources.length === 0 || record.sources.some((item) => !item.title || !item.url)) addIssue("error", "manual-review-batch-1", label, "sources", "Batch record has no complete source citation.");
  const csvRow = manualReviewBatch1Csv[index];
  if (csvRow && (csvRow["CCD编号"] !== label || csvRow["等级"] !== record.grade || csvRow["名称"] !== record.name)) addIssue("error", "manual-review-batch-1", label, "csv-match", "Batch CSV and JSON differ at the same row.");
});
for (const grade of batchGrades) {
  if (manualReviewBatch1.metadata.gradeCounts?.[grade] !== batchGradeCounts[grade]) addIssue("error", "manual-review-batch-1", grade, "grade-count", `Metadata says ${manualReviewBatch1.metadata.gradeCounts?.[grade] ?? "missing"}; counted ${batchGradeCounts[grade]}.`);
}

const batch2GradeCounts = Object.fromEntries([...batchGrades].map((grade) => [grade, 0]));
if (manualReviewBatch2.records.length !== 36 || manualReviewBatch2Csv.length !== 36) {
  addIssue("error", "manual-review-batch-2", "all", "row-count", `Expected 36 rows; JSON has ${manualReviewBatch2.records.length}, CSV has ${manualReviewBatch2Csv.length}.`);
}
manualReviewBatch2.records.forEach((record, index) => {
  const label = record.ccdId || `row-${index + 1}`;
  if (batchCcdIds.has(label)) addIssue("error", "manual-review-batch-2", label, "ccdId", "CCD identifier already appears in batch 1 or earlier in batch 2.");
  batchCcdIds.add(label);
  const sourceRecord = finalByCcd.get(label);
  if (!sourceRecord || sourceRecord.finalStatus !== "recommended-review" || sourceRecord.name !== record.name) {
    addIssue("error", "manual-review-batch-2", label, "source-match", "Batch record does not map to a recommended-review source record.");
  }
  if (!batchGrades.has(record.grade)) addIssue("error", "manual-review-batch-2", label, "grade", `Unknown grade: ${record.grade ?? "missing"}.`);
  else batch2GradeCounts[record.grade] += 1;
  if (!record.conclusion || !record.recommendation || !record.cyclicEvidence || !record.oralEvidence) addIssue("error", "manual-review-batch-2", label, "evidence", "Batch record is missing a conclusion or evidence field.");
  if (!Array.isArray(record.sources) || record.sources.length === 0 || record.sources.some((item) => !item.title || !item.url)) addIssue("error", "manual-review-batch-2", label, "sources", "Batch record has no complete source citation.");
  const csvRow = manualReviewBatch2Csv[index];
  if (csvRow && (csvRow["CCD编号"] !== label || csvRow["等级"] !== record.grade || csvRow["名称"] !== record.name)) addIssue("error", "manual-review-batch-2", label, "csv-match", "Batch CSV and JSON differ at the same row.");
});
for (const grade of batchGrades) {
  if (manualReviewBatch2.metadata.gradeCounts?.[grade] !== batch2GradeCounts[grade]) addIssue("error", "manual-review-batch-2", grade, "grade-count", `Metadata says ${manualReviewBatch2.metadata.gradeCounts?.[grade] ?? "missing"}; counted ${batch2GradeCounts[grade]}.`);
}

const batch3GradeCounts = Object.fromEntries([...batchGrades].map((grade) => [grade, 0]));
if (manualReviewBatch3.records.length !== 36 || manualReviewBatch3Csv.length !== 36) {
  addIssue("error", "manual-review-batch-3", "all", "row-count", `Expected 36 rows; JSON has ${manualReviewBatch3.records.length}, CSV has ${manualReviewBatch3Csv.length}.`);
}
manualReviewBatch3.records.forEach((record, index) => {
  const label = record.ccdId || `row-${index + 1}`;
  if (batchCcdIds.has(label)) addIssue("error", "manual-review-batch-3", label, "ccdId", "CCD identifier already appears in an earlier batch or earlier in batch 3.");
  batchCcdIds.add(label);
  const sourceRecord = finalByCcd.get(label);
  if (!sourceRecord || sourceRecord.finalStatus !== "recommended-review" || sourceRecord.name !== record.name) addIssue("error", "manual-review-batch-3", label, "source-match", "Batch record does not map to a recommended-review source record.");
  if (!batchGrades.has(record.grade)) addIssue("error", "manual-review-batch-3", label, "grade", `Unknown grade: ${record.grade ?? "missing"}.`);
  else batch3GradeCounts[record.grade] += 1;
  if (!record.conclusion || !record.recommendation || !record.cyclicEvidence || !record.oralEvidence) addIssue("error", "manual-review-batch-3", label, "evidence", "Batch record is missing a conclusion or evidence field.");
  if (!Array.isArray(record.sources) || record.sources.length === 0 || record.sources.some((item) => !item.title || !item.url)) addIssue("error", "manual-review-batch-3", label, "sources", "Batch record has no complete source citation.");
  const csvRow = manualReviewBatch3Csv[index];
  if (csvRow && (csvRow["CCD编号"] !== label || csvRow["等级"] !== record.grade || csvRow["名称"] !== record.name)) addIssue("error", "manual-review-batch-3", label, "csv-match", "Batch CSV and JSON differ at the same row.");
});
for (const grade of batchGrades) {
  if (manualReviewBatch3.metadata.gradeCounts?.[grade] !== batch3GradeCounts[grade]) addIssue("error", "manual-review-batch-3", grade, "grade-count", `Metadata says ${manualReviewBatch3.metadata.gradeCounts?.[grade] ?? "missing"}; counted ${batch3GradeCounts[grade]}.`);
}

const expectedDeepReviewIds = new Set(manualReviewFinal.records.filter((record) => record.finalStatus === "recommended-review").flatMap((record) => record.ccdIds));
if (batchCcdIds.size !== expectedDeepReviewIds.size || [...expectedDeepReviewIds].some((ccdId) => !batchCcdIds.has(ccdId))) {
  addIssue("error", "manual-review-92-final", "all", "coverage", `Three batches cover ${batchCcdIds.size} unique CCD IDs; recommended-review source contains ${expectedDeepReviewIds.size}.`);
}
const combinedBatchRecords = [...manualReviewBatch1.records, ...manualReviewBatch2.records, ...manualReviewBatch3.records];
const final92GradeCounts = Object.fromEntries([...batchGrades].map((grade) => [grade, 0]));
if (manualReview92Final.records.length !== 92 || manualReview92FinalCsv.length !== 92) addIssue("error", "manual-review-92-final", "all", "row-count", `Expected 92 rows; JSON has ${manualReview92Final.records.length}, CSV has ${manualReview92FinalCsv.length}.`);
manualReview92Final.records.forEach((record, index) => {
  const sourceRecord = combinedBatchRecords[index];
  const csvRow = manualReview92FinalCsv[index];
  const label = record.ccdId || `row-${index + 1}`;
  if (!sourceRecord || sourceRecord.ccdId !== label || sourceRecord.grade !== record.grade) addIssue("error", "manual-review-92-final", label, "batch-match", "Final 92-row result differs from its source batch.");
  if (batchGrades.has(record.grade)) final92GradeCounts[record.grade] += 1;
  if (csvRow && (csvRow["CCD编号"] !== label || csvRow["等级"] !== record.grade || csvRow["名称"] !== record.name)) addIssue("error", "manual-review-92-final", label, "csv-match", "Final CSV and JSON differ at the same row.");
});
for (const grade of batchGrades) {
  if (manualReview92Final.metadata.gradeCounts?.[grade] !== final92GradeCounts[grade]) addIssue("error", "manual-review-92-final", grade, "grade-count", `Metadata says ${manualReview92Final.metadata.gradeCounts?.[grade] ?? "missing"}; counted ${final92GradeCounts[grade]}.`);
}

const screeningTiers = new Set(["priority", "conditional", "reference", "exclude"]);
const screeningCounts = Object.fromEntries([...screeningTiers].map((tier) => [tier, 0]));
if (developmentScreen.records.length !== catalog.records.length) {
  addIssue("error", "development-screen", "all", "row-count", `Screen JSON contains ${developmentScreen.records.length} rows; catalog contains ${catalog.records.length}.`);
}
if (developmentScreenCsv.length !== catalog.records.length) {
  addIssue("error", "development-screen", "all", "csv-row-count", `Screen CSV contains ${developmentScreenCsv.length} rows; catalog contains ${catalog.records.length}.`);
}
developmentScreen.records.forEach((record, index) => {
  const source = catalog.records[index];
  const label = record.primaryCcdId || `row-${index + 1}`;
  if (!source || record.id !== source.id || record.smiles !== source.smiles) {
    addIssue("error", "development-screen", label, "source-match", "Screen result does not match the source catalog record at the same row.");
  }
  if (!screeningTiers.has(record.screening?.tier)) {
    addIssue("error", "development-screen", label, "tier", `Unknown screening tier: ${record.screening?.tier ?? "missing"}.`);
  } else {
    screeningCounts[record.screening.tier] += 1;
  }
  if (!Array.isArray(record.screening?.reasons) || record.screening.reasons.length === 0) {
    addIssue("error", "development-screen", label, "reasons", "Screen result has no stated reason.");
  }
  const csvRow = developmentScreenCsv[index];
  if (csvRow && splitCcdIds(csvRow["CCD编号"]).join("|") !== record.ccdIds.join("|")) {
    addIssue("error", "development-screen", label, "CCD编号", "Screen CSV and JSON CCD identifiers differ at the same row.");
  }
});
for (const tier of screeningTiers) {
  if (developmentScreen.metadata.tierCounts?.[tier] !== screeningCounts[tier]) {
    addIssue("error", "development-screen", tier, "tier-count", `Metadata says ${developmentScreen.metadata.tierCounts?.[tier] ?? "missing"}; counted ${screeningCounts[tier]}.`);
  }
}

const unifiedCatalogById = new Map(unifiedCatalog.records.map((record) => [record.id, record]));
const usageStatuses = new Set(["short-polymer", "polymer-only", "no-polymer-hit"]);
const usageCounts = Object.fromEntries([...usageStatuses].map((status) => [status, 0]));
if (polymerUsage.records.length !== unifiedCatalog.records.length) {
  addIssue("error", "polymer-usage", "all", "row-count", `Usage JSON contains ${polymerUsage.records.length} rows; unified catalog contains ${unifiedCatalog.records.length}.`);
}
if (polymerUsageCsv.length !== polymerUsage.records.length) {
  addIssue("error", "polymer-usage", "all", "csv-row-count", `Usage CSV contains ${polymerUsageCsv.length} rows; JSON contains ${polymerUsage.records.length}.`);
}
polymerUsage.records.forEach((record, index) => {
  const source = unifiedCatalogById.get(record.id);
  const label = record.primaryCcdId || `row-${index + 1}`;
  if (!source || source.ccdIds.join("|") !== record.ccdIds.join("|")) {
    addIssue("error", "polymer-usage", label, "source-match", "Usage record does not map to the current unified catalog.");
  }
  if (!usageStatuses.has(record.status)) {
    addIssue("error", "polymer-usage", label, "status", `Unknown usage status: ${record.status ?? "missing"}.`);
  } else {
    usageCounts[record.status] += 1;
  }
  if (!(record.polymerEntityCount >= record.shortPolymerEntityCount && record.shortPolymerEntityCount >= 0)) {
    addIssue("error", "polymer-usage", label, "counts", "Short-polymer count must be non-negative and cannot exceed total polymer count.");
  }
  if (record.status === "short-polymer" && record.shortPolymerEntityCount === 0) addIssue("error", "polymer-usage", label, "status", "Short-polymer status has zero short-polymer hits.");
  if (record.status === "polymer-only" && (record.polymerEntityCount === 0 || record.shortPolymerEntityCount !== 0)) addIssue("error", "polymer-usage", label, "status", "Polymer-only status has inconsistent counts.");
  if (record.status === "no-polymer-hit" && record.polymerEntityCount !== 0) addIssue("error", "polymer-usage", label, "status", "No-hit status has a nonzero polymer count.");
  const csvRow = polymerUsageCsv[index];
  if (csvRow && splitCcdIds(csvRow["CCD编号"]).join("|") !== record.ccdIds.join("|")) {
    addIssue("error", "polymer-usage", label, "CCD编号", "Usage CSV and JSON CCD identifiers differ at the same row.");
  }
});
for (const status of usageStatuses) {
  if (polymerUsage.metadata.statusCounts?.[status] !== usageCounts[status]) {
    addIssue("error", "polymer-usage", status, "status-count", `Metadata says ${polymerUsage.metadata.statusCounts?.[status] ?? "missing"}; counted ${usageCounts[status]}.`);
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  result: issues.some((issue) => issue.severity === "error") ? "failed" : "passed",
  scope: {
    statement: "This report checks local field completeness, uniqueness, cross-file consistency, and deterministic CCD-to-URL mapping. It does not prove peptide-synthesis suitability or property effects.",
    excludedClaims: [
      "The remote SVG was rendered from the chemically correct structure.",
      "The component has been used as an independently synthesizable peptide monomer.",
      "The component improves permeability, stability, or oral exposure.",
    ],
  },
  catalog: {
    jsonRecords: catalog.records.length,
    csvRecords: catalogCsv.length,
    uniqueCoreRecords: recordIds.size,
    uniqueCcdIds: catalogCcdIds.size,
    uniqueStereochemicalSmiles: smilesOwners.size,
    sourceUrlMatches,
    imageUrlMatches,
  },
  reviewQueue: {
    rows: reviewQueue.length,
    uniqueCcdFields: reviewIds.size,
    priorityCounts,
    sourceUrlMatches: reviewSourceMatches,
    imageUrlMatches: reviewImageMatches,
  },
  manualReviewFinal: {
    rows: manualReviewFinal.records.length,
    csvRows: manualReviewFinalCsv.length,
    statusCounts: manualStatusCounts,
  },
  manualReviewBatch1: {
    rows: manualReviewBatch1.records.length,
    csvRows: manualReviewBatch1Csv.length,
    gradeCounts: batchGradeCounts,
  },
  manualReviewBatch2: {
    rows: manualReviewBatch2.records.length,
    csvRows: manualReviewBatch2Csv.length,
    gradeCounts: batch2GradeCounts,
  },
  manualReviewBatch3: {
    rows: manualReviewBatch3.records.length,
    csvRows: manualReviewBatch3Csv.length,
    gradeCounts: batch3GradeCounts,
  },
  manualReview92Final: {
    rows: manualReview92Final.records.length,
    csvRows: manualReview92FinalCsv.length,
    uniqueCcdIds: batchCcdIds.size,
    gradeCounts: final92GradeCounts,
  },
  developmentScreen: {
    rows: developmentScreen.records.length,
    csvRows: developmentScreenCsv.length,
    tierCounts: screeningCounts,
  },
  polymerUsage: {
    rows: polymerUsage.records.length,
    csvRows: polymerUsageCsv.length,
    shortPolymerMaxLength: polymerUsage.metadata.shortPolymerMaxLength,
    statusCounts: usageCounts,
  },
  issues: {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    file: "catalog-integrity-issues.csv",
  },
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
const issueHeader = ["severity", "dataset", "record", "field", "message"];
await writeFile(
  issuesPath,
  `\uFEFF${[issueHeader, ...issues.map((issue) => issueHeader.map((key) => issue[key]))].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`,
  "utf8",
);

console.log(JSON.stringify(report, null, 2));
if (report.result === "failed") process.exitCode = 1;
