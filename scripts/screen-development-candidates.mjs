import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");
const inputPath = path.join(publicDir, "ccd-verified-cores.json");
const outputJsonPath = path.join(publicDir, "ccd-development-screen.json");
const outputCsvPath = path.join(publicDir, "ccd-development-screen.csv");

const payload = JSON.parse(await readFile(inputPath, "utf8"));

const TIER_META = {
  priority: {
    label: "优先研发候选",
    shortLabel: "优先候选",
    description: "结构较像可独立使用的氨基酸残基，且属于口服环肽常用的构象、主链极性或疏水性扫描方向；仍需确认保护策略、供应或合成路线。",
  },
  conditional: {
    label: "条件候选",
    shortLabel: "条件候选",
    description: "可能用于环肽，但用途更依赖具体结合位点、侧链电荷、交联设计或合成条件，不应默认改善口服性质。",
  },
  reference: {
    label: "仅结构参考",
    shortLabel: "仅供参考",
    description: "CCD身份成立，但存在高复杂度、保护/端基状态、过高极性、非典型连接或单体可获得性疑问；不进入默认研发筛选库。",
  },
  exclude: {
    label: "明确排除",
    shortLabel: "排除",
    description: "自动规则识别为整分子缀合物、辅因子/核苷酸/脂质/金属复合物、完整肽、明显保护体或缺少可用于常规肽键形成的羧基。",
  },
};

const highValueCategories = new Set([
  "n-substitution",
  "d-configuration",
  "alpha-substitution",
  "extended-backbone",
  "conformational-constraint",
]);

const metalElements = new Set([
  "Li", "Na", "K", "Mg", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In",
  "Sn", "Sb", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm",
  "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi",
]);

const wholeAdductPattern = /\b(?:coenzyme|cofactor|adenos(?:ine|yl)|uridin(?:e|yl)|guanos(?:ine|yl)|cytidin(?:e|yl)|nucleotide|nucleoside|diphosphate|triphosphate|phosphopantetheine|flavin|porphyrin|heme|glutathione|peptide|cyclopeptide|macrocyclic|glycopeptide|muramoyl|ribosyl|adp|udp|gdp|coa|fatty\s+acid|lipid|gold\s+complex|metal\s+complex)\b/i;
const protectionPattern = /\b(?:fmoc|boc|benzyloxycarbonyl|carbobenzyloxy|cbz|trityl|triphenylmethyl|tert[- ]butoxycarbonyl|n[- ]boc|s[- ]trityl)\b/i;
const blockedBackbonePattern = /^(?:n[- ](?:acetyl|succinyl|malonyl|formyl|carbamoyl)|n-\((?:carboxycarbonyl|oxalyl)|acetylated|succinylated)/i;
const reactiveReagentPattern = /\b(?:diazonium|diazonio|aldehyde|propanal|thioic\s+o-acid|chloromethyl\s+ketone)\b/i;

function parseFormula(formula) {
  const counts = new Map();
  for (const match of formula.matchAll(/([A-Z][a-z]?)\s*(\d*)/g)) {
    counts.set(match[1], Number(match[2] || 1));
  }
  return counts;
}

function textFor(record) {
  return [record.name, ...record.synonyms].join(" ");
}

function hasFreeCarboxyl(smiles) {
  return /C\(=O\)(?:\(=O\))?(?:O|\[O-\])/.test(smiles);
}

function classify(record) {
  const reasons = [];
  const cautions = [];
  const formula = parseFormula(record.formula);
  const text = textFor(record);
  const oxygenCount = formula.get("O") ?? 0;
  const nitrogenCount = formula.get("N") ?? 0;
  const hasMetal = [...formula.keys()].some((element) => metalElements.has(element));
  const hasWholeAdduct = wholeAdductPattern.test(text);
  const hasProtectingGroup = protectionPattern.test(text);
  const hasBlockedBackbone = blockedBackbonePattern.test(text);
  const hasReactiveReagent = reactiveReagentPattern.test(text);
  const lacksFreeCarboxyl = !hasFreeCarboxyl(record.smiles);
  const veryLarge = record.formulaWeight != null && record.formulaWeight > 450;
  const large = record.formulaWeight != null && record.formulaWeight > 300;
  const borderlineLarge = record.formulaWeight != null && record.formulaWeight > 250;
  const highlyHeteroatomRich = oxygenCount >= 7 || nitrogenCount >= 6;
  const phosphorusRich = formula.has("P");
  const siliconContaining = formula.has("Si");
  const genericLinkageOnly = record.linkageTypes.every((type) => type === "peptide linking");
  const hasStandardParent = record.parentIds.length > 0;
  const highValueClass = highValueCategories.has(record.category);
  const polarOnly = record.category === "polar-charged" && record.tags.every((tag) => tag === "极性／带电侧链");

  if (hasMetal) reasons.push("含金属元素，不是常规氨基酸合成单体");
  if (hasWholeAdduct) reasons.push("名称提示核苷酸、辅因子、脂质、完整肽或整分子缀合物");
  if (hasProtectingGroup) reasons.push("CCD记录对应明显保护体，不能把保护体本身当作最终残基");
  if (hasBlockedBackbone) reasons.push("主链氨基被端基化，不能按普通内部残基直接偶联");
  if (lacksFreeCarboxyl) reasons.push("结构中未识别到可用于常规肽键形成的游离羧基");
  if (veryLarge) reasons.push("分子量超过450 Da，优先视为复杂整分子而非通用残基");

  if (reasons.length > 0) {
    return { tier: "exclude", reasons, cautions, manualReviewRequired: false };
  }

  if (large) cautions.push("分子量超过300 Da，单体复杂度和环肽总分子量负担较高");
  if (borderlineLarge && !large) cautions.push("分子量超过250 Da，需关注偶联效率、溶解度和总环肽体积");
  if (highlyHeteroatomRich) cautions.push("杂原子较多，可能增加暴露极性和去溶剂化代价");
  if (phosphorusRich) cautions.push("含磷酸/膦酸相关结构，通常不利于被动跨膜，除非有专门遮蔽设计");
  if (siliconContaining) cautions.push("含硅结构常见于保护或特殊合成中间体，需要人工确认最终残基形态");
  if (hasReactiveReagent) cautions.push("名称提示反应性官能团或中间体，需要确认能否承受偶联和脱保护条件");
  if (genericLinkageOnly) cautions.push("CCD仅标为通用peptide linking，需确认真实主链连接几何");
  if (!hasStandardParent) cautions.push("CCD未指定标准氨基酸母体，需确认它是独立残基而非氨基酸样片段");
  if (polarOnly) cautions.push("以极性/带电特征为主，不宜默认用于提高被动渗透性");

  const referenceRisk = large || highlyHeteroatomRich || phosphorusRich || siliconContaining || hasReactiveReagent;
  if (referenceRisk) {
    return {
      tier: "reference",
      reasons: ["结构身份可保留，但复杂度、反应性或极性风险不适合进入默认研发库"],
      cautions,
      manualReviewRequired: true,
    };
  }

  const hasPolarTag = record.tags.includes("极性／带电侧链");
  const hasHydrophobicOrConstraintTag = record.tags.some((tag) => ["芳香／疏水侧链", "构象限制", "N-取代", "α位取代"].includes(tag));
  const cleanDConfiguration = record.category === "d-configuration"
    && nitrogenCount <= 3
    && oxygenCount <= (hasHydrophobicOrConstraintTag ? 4 : 3)
    && !/carboxymethyl|carboxycarbonyl|oxalyl|sulfo|phosph/i.test(text);
  const strongDesignClass = highValueClass && (record.category !== "d-configuration" || cleanDConfiguration);
  const priorityEligible = strongDesignClass
    && record.formulaWeight != null
    && record.formulaWeight <= 250
    && !polarOnly
    && !(hasPolarTag && oxygenCount >= 5);

  if (priorityEligible) {
    reasons.push(`属于${record.categoryLabel}方向，可用于口服环肽的构象/稳定性/主链极性扫描`);
    if (hasStandardParent) reasons.push("CCD给出标准母体残基，便于设计成对替换实验");
    return { tier: "priority", reasons, cautions, manualReviewRequired: true };
  }

  reasons.push("保留为条件候选；是否有价值取决于具体位点、保护策略和整环性质");
  return { tier: "conditional", reasons, cautions, manualReviewRequired: true };
}

const records = payload.records.map((record) => ({ ...record, screening: classify(record) }));
const tierCounts = Object.fromEntries(Object.keys(TIER_META).map((tier) => [tier, records.filter((record) => record.screening.tier === tier).length]));

const output = {
  metadata: {
    ...payload.metadata,
    generatedDate: payload.metadata.snapshotDate,
    method: "Conservative rule-based first-pass screen for oral cyclic-peptide development relevance; not a substitute for literature, vendor, or synthesis review.",
    tierCounts,
    tierMeta: TIER_META,
  },
  records,
};

const quoteCsv = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const headers = [
  "筛选等级", "CCD编号", "名称", "分子式", "分子量", "CCD类型", "母体CCD", "结构类别",
  "筛选理由", "风险提示", "需要人工复核", "立体化学SMILES", "CCD链接",
];
const csvRows = records.map((record) => [
  TIER_META[record.screening.tier].label,
  record.ccdIds.join(" / "),
  record.name,
  record.formula,
  record.formulaWeight,
  record.linkageTypes.join("；"),
  record.parentIds.join(" / "),
  record.categoryLabel,
  record.screening.reasons.join("；"),
  record.screening.cautions.join("；"),
  record.screening.manualReviewRequired ? "是" : "否",
  record.smiles,
  record.sourceUrl,
]);

await writeFile(outputJsonPath, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(outputCsvPath, `${[headers, ...csvRows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8");

console.log(JSON.stringify({ records: records.length, tierCounts, outputJsonPath, outputCsvPath }, null, 2));
