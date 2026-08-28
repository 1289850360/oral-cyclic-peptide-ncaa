import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const batches = await Promise.all([1, 2, 3].map(async (batch) => JSON.parse(await readFile(path.join(publicDir, `ccd-manual-review-batch-${batch}.json`), "utf8"))));
const records = batches.flatMap((payload) => payload.records);
const gradeOrder = ["A", "B", "C", "EXCLUDE"];
const gradeCounts = Object.fromEntries(gradeOrder.map((grade) => [grade, records.filter((record) => record.grade === grade).length]));
const payload = {
  metadata: {
    auditDate: "2026-08-28",
    count: records.length,
    batches: batches.map((item) => ({ batch: item.metadata.batch, count: item.metadata.count, gradeCounts: item.metadata.gradeCounts })),
    gradeCounts,
    usableSummary: { directMacrocycleEvidence: gradeCounts.A, peptideUsableButNoDirectMacrocycleEvidence: gradeCounts.B, restrictedSpecialFragments: gradeCounts.C, excludedNonMonomers: gradeCounts.EXCLUDE },
    scope: "92条优先深审候选的三批人工证据审核汇总。等级描述证据强度和用途边界，不代表任何单个残基能够独立带来口服性。",
  },
  records,
};
const headers = ["批次", "批内序号", "CCD编号", "名称", "等级", "等级说明", "结论", "合成/单体证据", "环肽证据", "口服证据", "建议", "来源数", "来源", "CCD链接", "PDB示例"];
const quote = (value) => { const text = value == null ? "" : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const rows = records.map((record) => [record.batch, record.batchPosition, record.ccdId, record.name, record.grade, record.gradeLabel, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, record.sourceCount, record.sources.map((item) => `${item.evidenceType}｜${item.title}｜${item.url}`).join("；"), record.ccdUrl, record.pdbExamples.join(" / ")]);
await writeFile(path.join(publicDir, "ccd-manual-review-92-final.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(path.join(publicDir, "ccd-manual-review-92-final.csv"), `\uFEFF${[headers, ...rows].map((row) => row.map(quote).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify(payload.metadata, null, 2));
