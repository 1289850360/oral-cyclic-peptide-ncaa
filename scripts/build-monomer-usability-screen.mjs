import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");

const [screen, usage, structureSource] = await Promise.all([
  readFile(path.join(publicDir, "ccd-development-screen.json"), "utf8").then(JSON.parse),
  readFile(path.join(publicDir, "ccd-polymer-usage-audit.json"), "utf8").then(JSON.parse),
  readFile(path.join(rootDir, "app", "structure-data.ts"), "utf8"),
]);

// structure-data.ts only lists exact, stereochemically compatible CCD mappings
// for the manually curated evidence records shown on the site.
const evidenceCcdIds = new Set(
  [...structureSource.matchAll(/ccd:\s*"([^"]+)"/g)].map((match) => match[1]),
);
const usageById = new Map();
for (const record of usage.records) {
  for (const ccdId of record.ccdIds) usageById.set(ccdId, record);
}

const STATUS_META = {
  "evidence-backed": {
    label: "人工证据支持",
    description: "CCD结构与网站人工整理的论文、专利或药物骨架证据精确对应；可作为优先核验的肽合成单体。",
    nextAction: "继续核对具体保护形式、偶联方法和供应/合成来源。",
  },
  "short-peptide-observed": {
    label: "已在短肽序列中观察到",
    description: "该CCD进入过不超过50残基的PDB聚合物序列，支持其作为肽残基使用，但尚未逐条确认独立单体来源。",
    nextAction: "查原始论文，确认是预制单体偶联还是翻译后/结构内修饰。",
  },
  "polymer-observed": {
    label: "仅在较长聚合物中观察到",
    description: "该CCD进入过PDB聚合物序列，但目前没有短肽命中，不能直接推断适合常规肽合成。",
    nextAction: "核对残基形成方式及是否存在独立保护单体。",
  },
  "priority-structure-only": {
    label: "优先结构候选，暂无使用命中",
    description: "结构符合优先研发方向，但当前PDB聚合物审计没有命中。",
    nextAction: "查询供应商、合成论文、专利和SPPS/LPPS使用记录。",
  },
  "conditional-structure-only": {
    label: "条件结构候选",
    description: "结构可能是独立非天然氨基酸，但用途或单体可获得性仍依赖人工核实。",
    nextAction: "先核对主链连接几何和独立单体身份，再决定是否查合成证据。",
  },
  "reference-only": {
    label: "仅结构参考",
    description: "复杂度、反应性、极性、端基或保护状态存在明显疑问，不进入默认单体库。",
    nextAction: "除非有明确研究用途，否则不优先审核。",
  },
  excluded: {
    label: "排除",
    description: "自动规则识别为整分子、辅因子、金属复合物、完整肽、保护体或缺少常规偶联羧基。",
    nextAction: "不计入非天然氨基酸单体数量。",
  },
};

function classify(record) {
  const matchedEvidenceIds = record.ccdIds.filter((ccdId) => evidenceCcdIds.has(ccdId));
  if (matchedEvidenceIds.length > 0) return { status: "evidence-backed", matchedEvidenceIds };

  const usageRecord = record.ccdIds.map((ccdId) => usageById.get(ccdId)).find(Boolean);
  if (usageRecord?.status === "short-polymer") return { status: "short-peptide-observed", matchedEvidenceIds: [] };
  if (usageRecord?.status === "polymer-only") return { status: "polymer-observed", matchedEvidenceIds: [] };
  if (record.screening.tier === "priority") return { status: "priority-structure-only", matchedEvidenceIds: [] };
  if (record.screening.tier === "conditional") return { status: "conditional-structure-only", matchedEvidenceIds: [] };
  if (record.screening.tier === "reference") return { status: "reference-only", matchedEvidenceIds: [] };
  return { status: "excluded", matchedEvidenceIds: [] };
}

const records = screen.records.map((record) => {
  const result = classify(record);
  const usageRecord = record.ccdIds.map((ccdId) => usageById.get(ccdId)).find(Boolean);
  return {
    id: record.id,
    ccdIds: record.ccdIds,
    primaryCcdId: record.primaryCcdId,
    name: record.name,
    formula: record.formula,
    formulaWeight: record.formulaWeight,
    category: record.category,
    categoryLabel: record.categoryLabel,
    developmentTier: record.screening.tier,
    monomerStatus: result.status,
    monomerStatusLabel: STATUS_META[result.status].label,
    interpretation: STATUS_META[result.status].description,
    nextAction: STATUS_META[result.status].nextAction,
    exactEvidenceCcdIds: result.matchedEvidenceIds,
    polymerUsageStatus: usageRecord?.status ?? "not-audited",
    polymerEntityCount: usageRecord?.polymerEntityCount ?? null,
    shortPolymerEntityCount: usageRecord?.shortPolymerEntityCount ?? null,
    exampleEntryIds: usageRecord?.exampleEntryIds ?? [],
    cautions: record.screening.cautions,
    sourceUrl: record.sourceUrl,
  };
});

const statusCounts = Object.fromEntries(
  Object.keys(STATUS_META).map((status) => [status, records.filter((record) => record.monomerStatus === status).length]),
);
const output = {
  metadata: {
    generatedDate: screen.metadata.snapshotDate,
    sourceCount: records.length,
    statusCounts,
    statusMeta: STATUS_META,
    highConfidenceCount: statusCounts["evidence-backed"],
    scope: "Evidence-aware monomer-usability triage. Only evidence-backed records have an exact mapping to the manually curated evidence set; PDB sequence occurrence alone does not prove an independently available SPPS/LPPS monomer.",
  },
  records,
};

const quoteCsv = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const headers = ["单体筛选状态", "CCD编号", "名称", "研发分档", "结构类别", "分子式", "分子量", "人工证据CCD", "PDB使用状态", "聚合物实体数", "≤50残基实体数", "示例PDB", "判断边界", "下一步", "风险提示", "CCD链接"];
const csvRows = records.map((record) => [
  record.monomerStatusLabel,
  record.ccdIds.join(" / "),
  record.name,
  record.developmentTier,
  record.categoryLabel,
  record.formula,
  record.formulaWeight,
  record.exactEvidenceCcdIds.join(" / "),
  record.polymerUsageStatus,
  record.polymerEntityCount,
  record.shortPolymerEntityCount,
  record.exampleEntryIds.join(" / "),
  record.interpretation,
  record.nextAction,
  record.cautions.join("；"),
  record.sourceUrl,
]);

await Promise.all([
  writeFile(path.join(publicDir, "ccd-monomer-usability-screen.json"), `${JSON.stringify(output)}\n`, "utf8"),
  writeFile(path.join(publicDir, "ccd-monomer-usability-screen.csv"), `${[headers, ...csvRows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8"),
]);

console.log(JSON.stringify({ records: records.length, statusCounts }, null, 2));
