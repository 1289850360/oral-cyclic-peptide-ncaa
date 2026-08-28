import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { groups } from "../app/residue-data.ts";
import { additionalStructuresByEnglish, structuresByEnglish } from "../app/structure-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const reviewPayload = JSON.parse(await readFile(join(root, "public", "ccd-manual-review-92-final.json"), "utf8"));
const masterRecords = groups.flatMap((group) => group.residues.map((residue) => ({ group, residue }))).map(({ group, residue }, index) => ({
  id: `OCPR${String(index + 1).padStart(6, "0")}`,
  nameZh: residue.name,
  nameEn: residue.english,
  category: group.title,
}));

const masterByCcd = new Map();
for (const record of masterRecords) {
  const primary = structuresByEnglish[record.nameEn];
  const structures = [...(primary ? [primary] : []), ...(additionalStructuresByEnglish[record.nameEn] ?? [])];
  for (const structure of structures) masterByCcd.set(structure.ccd.toUpperCase(), record);
}

const actionMeta = {
  "enrich-existing": "补充现有研发记录",
  "propose-master": "建议新增至研发主库",
  "candidate-layer": "并入肽中使用候选层",
  "special-fragment": "并入特殊构件层",
  "exclusion-log": "仅保留在排除记录",
};

const records = reviewPayload.records.map((record, index) => {
  const existing = masterByCcd.get(record.ccdId.toUpperCase());
  const action = existing ? "enrich-existing" : record.grade === "A" ? "propose-master" : record.grade === "B" ? "candidate-layer" : record.grade === "C" ? "special-fragment" : "exclusion-log";
  return {
    integrationId: `OCPR-REVIEW-${String(index + 1).padStart(3, "0")}`,
    ccdId: record.ccdId,
    name: record.name,
    reviewGrade: record.grade,
    action,
    actionLabel: actionMeta[action],
    targetRecordId: existing?.id ?? null,
    targetRecordName: existing?.nameZh ?? null,
    conclusion: record.conclusion,
    recommendation: record.recommendation,
    sourceCount: record.sourceCount,
  };
});

const actionCounts = Object.fromEntries(Object.keys(actionMeta).map((action) => [action, records.filter((record) => record.action === action).length]));
const output = {
  metadata: {
    generatedAt: reviewPayload.metadata.auditDate,
    currentMasterCount: masterRecords.length,
    deepReviewCount: records.length,
    matchingRule: "CCD编号完全一致；名称同义词、盐型和立体化学仍需二次结构去重后才能分配新的永久OCPR编号。",
    actionCounts,
    projectedStrictMasterCount: masterRecords.length + actionCounts["propose-master"],
    projectedBroadCandidateCount: masterRecords.length + actionCounts["propose-master"] + actionCounts["candidate-layer"],
    projectedSearchableResourceCount: masterRecords.length + actionCounts["propose-master"] + actionCounts["candidate-layer"] + actionCounts["special-fragment"],
  },
  records,
};

const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const fields = ["integrationId", "ccdId", "name", "reviewGrade", "action", "actionLabel", "targetRecordId", "targetRecordName", "conclusion", "recommendation", "sourceCount"];
const csv = [fields, ...records.map((record) => fields.map((field) => record[field]))].map((row) => row.map(escapeCsv).join(",")).join("\n");

await writeFile(join(root, "public", "deep-review-integration-plan.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
await writeFile(join(root, "public", "deep-review-integration-plan.csv"), `\uFEFF${csv}\n`, "utf8");
console.log(JSON.stringify(output.metadata, null, 2));
