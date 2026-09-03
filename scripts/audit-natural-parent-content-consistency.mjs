import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const publicDir = join(root, "public");
const pnpmFolder = join(root, "node_modules/.pnpm");
const esbuildPackage = readdirSync(pnpmFolder).filter((name) => name.startsWith("esbuild@")).sort().at(-1);
if (!esbuildPackage) throw new Error("Cannot locate esbuild");
const esbuild = require(join(pnpmFolder, esbuildPackage, "node_modules/esbuild/lib/main.js"));
const temporaryBundle = join(root, "scripts/.tmp-natural-parent-content-audit.cjs");
esbuild.buildSync({
  entryPoints: [join(root, "app/natural-parent-modifications.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: temporaryBundle,
});
const { naturalParentModificationByCcd } = require(temporaryBundle);
rmSync(temporaryBundle);

const analysis = JSON.parse(readFileSync(join(publicDir, "natural-parent-derivative-analysis.json"), "utf8"));
const substitutability = JSON.parse(readFileSync(join(publicDir, "natural-parent-substitutability-audit.json"), "utf8"));
const analysisByCcd = new Map(analysis.records.map((record) => [record.ccdId, record]));
const substitutabilityByCcd = new Map(substitutability.records.map((record) => [record.ccdId, record]));
const directEvidenceStatuses = new Set(["具体残基证据", "同骨架证据", "完整肽证据"]);
const evidenceStatuses = new Set([...directEvidenceStatuses, "同类修饰参考"]);
const parentNameByCcd = {
  ALA: "丙氨酸", ARG: "精氨酸", ASN: "天冬酰胺", ASP: "天冬氨酸", CYS: "半胱氨酸", GLN: "谷氨酰胺",
  GLU: "谷氨酸", GLY: "甘氨酸", HIS: "组氨酸", ILE: "异亮氨酸", LEU: "亮氨酸", LYS: "赖氨酸",
  MET: "甲硫氨酸", PHE: "苯丙氨酸", PRO: "脯氨酸", SER: "丝氨酸", THR: "苏氨酸", TRP: "色氨酸",
  TYR: "酪氨酸", VAL: "缬氨酸", SEC: "硒代半胱氨酸", PYL: "吡咯赖氨酸",
};
const issues = [];
const add = (severity, ccdId, field, message) => issues.push({ severity, ccdId, field, message });

for (const [ccdId, record] of Object.entries(naturalParentModificationByCcd)) {
  const structure = analysisByCcd.get(ccdId);
  const use = substitutabilityByCcd.get(ccdId);
  if (!structure) add("error", ccdId, "structure", "缺少天然母体结构分析记录");
  if (!record.naturalParentCcd) add("error", ccdId, "naturalParentCcd", "天然母体为空");
  if (!record.naturalParent?.trim() || /undefined|null/i.test(record.naturalParent)) add("error", ccdId, "naturalParent", `天然母体名称无效：${record.naturalParent ?? ""}`);
  const expectedParentName = parentNameByCcd[record.naturalParentCcd];
  if (expectedParentName && !record.naturalParent.includes(expectedParentName)) add("error", ccdId, "naturalParent", `母体代码${record.naturalParentCcd}与中文名“${record.naturalParent}”不一致`);
  if (structure && record.naturalParentCcd !== structure.primaryParent) add("error", ccdId, "naturalParentCcd", `页面母体${record.naturalParentCcd}与结构分析${structure.primaryParent}不一致`);
  if (!record.changeLabel?.trim()) add("error", ccdId, "changeLabel", "修饰方式为空");
  if (!record.changedPosition?.trim()) add("error", ccdId, "changedPosition", "改变位置为空");
  if (!record.structuralChange?.trim()) add("error", ccdId, "structuralChange", "结构变化说明为空");
  if (!record.propertyReview) add("error", ccdId, "propertyReview", "性质证据分级为空");
  const status = record.propertyReview?.status;
  const confidence = record.peptideExperiment?.confidence;
  if (status === "结构规则建议" && confidence !== "结构推断") add("error", ccdId, "evidence-level", "页面标为结构规则建议，但实验置信度不是结构推断");
  if (directEvidenceStatuses.has(status) && confidence === "结构推断") add("error", ccdId, "evidence-level", "页面标为具体/同骨架/完整肽证据，但实验结论仍是结构推断");
  if (evidenceStatuses.has(status) && !(record.propertyReview?.sources?.length)) add("error", ccdId, "propertyReview.sources", "有文献结论但没有性质来源");
  if (evidenceStatuses.has(status) && !(record.sources?.length)) add("error", ccdId, "sources", "有文献结论但没有总来源");
  for (const source of [...(record.sources ?? []), ...(record.propertyReview?.sources ?? [])]) {
    if (!/^(https?:\/\/|\/residue\/)/.test(source.url ?? "")) add("warning", ccdId, "source.url", `来源不是可追溯URL：${source.url ?? ""}`);
  }
  if (use?.category === "complex-skeletal-transformation" && record.reviewStatus !== "complex-transformation-resolved") {
    add("warning", ccdId, "reviewStatus", "结构用途审计标为复杂骨架重构，但详情状态未使用复杂重构标签");
  }
  if (confidence !== "结构推断" && /没有找到可归属于该残基|不提供溶解度、渗透性/.test(record.peptideExperiment?.conclusion ?? "")) {
    add("error", ccdId, "peptideExperiment.conclusion", "有实验等级但结论仍写成没有实验");
  }
}

const values = Object.values(naturalParentModificationByCcd);
const summary = {
  generatedAt: new Date().toISOString(),
  recordCount: values.length,
  evidenceRecordCount: values.filter((record) => evidenceStatuses.has(record.propertyReview?.status)).length,
  directOrWholeEvidenceRecordCount: values.filter((record) => directEvidenceStatuses.has(record.propertyReview?.status)).length,
  classReferenceRecordCount: values.filter((record) => record.propertyReview?.status === "同类修饰参考").length,
  structureRuleRecordCount: values.filter((record) => record.propertyReview?.status === "结构规则建议").length,
  reviewStatusCounts: Object.fromEntries([...new Set(values.map((record) => record.reviewStatus ?? "complete"))].sort().map((status) => [status, values.filter((record) => (record.reviewStatus ?? "complete") === status).length])),
  propertyStatusCounts: Object.fromEntries([...new Set(values.map((record) => record.propertyReview?.status ?? "missing"))].sort().map((status) => [status, values.filter((record) => (record.propertyReview?.status ?? "missing") === status).length])),
  issueCounts: Object.fromEntries(["error", "warning"].map((severity) => [severity, issues.filter((issue) => issue.severity === severity).length])),
  boundary: "This audit checks internal consistency, parent alignment, evidence-level logic and source traceability. It does not independently reproduce every experiment in the cited papers.",
};
writeFileSync(join(publicDir, "natural-parent-content-consistency-audit.json"), `${JSON.stringify({ summary, issues }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
for (const issue of issues) console.log(`${issue.severity}\t${issue.ccdId}\t${issue.field}\t${issue.message}`);
if (issues.some((issue) => issue.severity === "error")) process.exitCode = 1;
