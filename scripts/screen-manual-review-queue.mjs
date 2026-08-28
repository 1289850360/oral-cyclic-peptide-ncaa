import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");
const inputPath = path.join(publicDir, "ccd-manual-review-1805.csv");
const outputJsonPath = path.join(publicDir, "ccd-manual-review-screened.json");
const outputCsvPath = path.join(publicDir, "ccd-manual-review-screened.csv");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const [headers, ...values] = rows.filter((item) => item.some(Boolean));
  return values.map((item) => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), item[index] ?? ""])));
}

const quoteCsv = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const splitIds = (value) => String(value ?? "").split(/\s*\/\s*/).filter(Boolean);
const parseFormula = (formula) => new Map([...String(formula).matchAll(/([A-Z][a-z]?)\s*(\d*)/g)].map((match) => [match[1], Number(match[2] || 1)]));
const countPattern = (text, pattern) => [...text.matchAll(pattern)].length;

const metalElements = new Set(["Li", "Na", "K", "Mg", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi"]);
const wholeAdductPattern = /\b(?:coenzyme|cofactor|adenos(?:ine|yl)|uridin(?:e|yl)|guanos(?:ine|yl)|cytidin(?:e|yl)|nucleotide|nucleoside|diphosphate|triphosphate|phosphopantetheine|flavin|porphyrin|heme|glutathione|glycopeptide|muramoyl|ribosyl|adp|udp|gdp|coa|s-adenosyl)\b/i;
const protectingGroupPattern = /\b(?:fmoc|boc|benzyloxycarbonyl|carbobenzyloxy|cbz|trityl|triphenylmethyl|tert[- ]butoxycarbonyl|n[- ]boc|s[- ]trityl)\b/i;
const drugOrIntermediatePattern = /\b(?:inhibitor|antibiotic|intermediate|hydrolyzed|open form|penem|penicillin|cephalosporin|tazobactam|imipenem|faropenem|tolrestat|statin|drug)\b/i;
const blockedBackbonePattern = /^(?:n[- ](?:acetyl|benzoyl|benzenecarbonyl|succinyl|malonyl|formyl|carbamoyl)|n-\((?:carboxycarbonyl|oxalyl)|acetylated|succinylated|1-acetyl)/i;
const namedPeptidePattern = /\b(?:gamma[- ]?glutamyl|aspartyl|alanyl|glycyl|leucyl|valyl|phenylalanyl|lysyl|arginyl|seryl|threonyl|cysteinyl|methionyl|tryptophyl|tyrosyl|prolyl)[ -](?:l-|d-)?(?:alanine|glycine|valine|leucine|isoleucine|proline|serine|threonine|cysteine|methionine|aspartate|glutamate|glutamine|asparagine|lysine|arginine|histidine|phenylalanine|tyrosine|tryptophan|ornithine)\b/i;
const esterRecordPattern = /\b(?:methyl|ethyl|tert[- ]butyl) ester\b/i;
const aminoAcidNamePattern = /(?:amino.*(?:acid|carboxylic)|alanine|glycine|valine|leucine|isoleucine|proline|serine|threonine|cysteine|methionine|aspartic|glutamic|glutamine|asparagine|lysine|arginine|histidine|phenylalanine|tyrosine|tryptophan|ornithine|norvaline|norleucine|homoproline|statine)/i;
const favorableDesignPattern = /(?:n[- ]?methyl|d[- ]|alpha[- ]methyl|β|beta|gamma|fluoro|chloro|bromo|cycloprop|cyclobut|cyclopent|cyclohex|azetidine|proline|norvaline|norleucine|homophenylalanine|naphthylalanine)/i;

function classify(record) {
  const priority = record["审核优先级"].split("｜")[0];
  const ccdIds = splitIds(record["CCD编号"]);
  const name = record["名称"];
  const synonyms = record["同义词"];
  const text = `${name} ${synonyms}`;
  const formula = parseFormula(record["分子式"]);
  const molecularWeight = Number(record["分子量"]) || null;
  const parentIds = splitIds(record["母体CCD"]);
  const smiles = record["立体化学SMILES"];
  const backboneDistance = Number(record["骨架碳距离"]) || null;
  const oxygenCount = formula.get("O") ?? 0;
  const nitrogenCount = formula.get("N") ?? 0;
  const carbonCount = formula.get("C") ?? 0;
  const hasMetal = [...formula.keys()].some((element) => metalElements.has(element));
  const amideCount = countPattern(smiles, /C\(=O\)N/g);
  const carboxylCount = countPattern(smiles, /C\(=O\)(?:O|\[O-\])/g);
  const hardReasons = [];
  const cautions = [];
  const positiveReasons = [];

  if (hasMetal) hardReasons.push("含金属元素，不属于常规肽合成单体");
  if (wholeAdductPattern.test(text)) hardReasons.push("名称提示核苷酸、辅因子或整分子缀合物");
  if (protectingGroupPattern.test(text)) hardReasons.push("记录对应保护体，不能把保护体本身当作最终残基");
  if (drugOrIntermediatePattern.test(text)) hardReasons.push("名称明确提示药物、抗生素或反应中间体");
  if (blockedBackbonePattern.test(text)) hardReasons.push("主链氨基已被端基化，不适合作为普通内部残基");
  if (namedPeptidePattern.test(text)) hardReasons.push("名称明确为二肽/寡肽片段，不是单个氨基酸残基");
  if (esterRecordPattern.test(text)) hardReasons.push("羧基以酯形式封闭，不能直接作为普通肽键偶联单体");
  if (molecularWeight != null && molecularWeight > 500) hardReasons.push("分子量超过500 Da，优先判断为复杂整分子");
  if (amideCount >= 3) hardReasons.push("含多个酰胺键，更像多残基/整分子片段而非独立单体");
  if (carboxylCount === 0) hardReasons.push("未识别到游离羧基");

  let score = priority === "P0" ? 10 : priority === "P1" ? 5 : priority === "P2" ? 3 : 0;
  if (parentIds.length > 0) { score += 2; positiveReasons.push("CCD给出标准氨基酸母体"); }
  if (aminoAcidNamePattern.test(text)) { score += 2; positiveReasons.push("名称与独立氨基酸/非蛋白残基一致"); }
  if (favorableDesignPattern.test(text)) { score += 1; positiveReasons.push("属于常见的构象、立体化学或疏水性扫描方向"); }
  if (molecularWeight != null && molecularWeight <= 250) score += 2;
  else if (molecularWeight != null && molecularWeight <= 300) score += 1;
  else if (molecularWeight != null && molecularWeight > 400) score -= 3;
  else if (molecularWeight != null && molecularWeight > 300) score -= 1;
  if (backboneDistance != null && backboneDistance <= 2) score += 2;
  else if (backboneDistance != null && backboneDistance <= 4) score += 1;
  else score -= 2;
  if (amideCount >= 2) score -= 3;
  else if (amideCount === 1) score -= 1;
  if (oxygenCount >= 8 || nitrogenCount >= 7) score -= 3;
  else if (oxygenCount >= 6 || nitrogenCount >= 5) score -= 1;
  if (formula.has("P")) score -= 2;
  if (carbonCount >= 24) score -= 2;

  if (molecularWeight != null && molecularWeight > 300) cautions.push("分子量超过300 Da，需确认偶联、脱保护和总环肽体积负担");
  if (oxygenCount >= 6 || nitrogenCount >= 5) cautions.push("杂原子较多，可能带来较高极性或多重保护需求");
  if (formula.has("P")) cautions.push("含磷酸/膦酸相关结构，通常不利于被动跨膜");
  if (amideCount >= 1) cautions.push("含预先形成的酰胺键，需确认主链氨基是否仍可偶联");
  if (parentIds.length === 0) cautions.push("CCD未指定标准氨基酸母体");

  let decision;
  let tier;
  let independentMonomer;
  if (hardReasons.length > 0) {
    decision = "排除";
    tier = "exclude";
    independentMonomer = "否";
  } else if (score >= 8) {
    decision = "收录";
    tier = priority === "P0" || score >= 11 ? "priority" : "conditional";
    independentMonomer = score >= 10 ? "较可能" : "需确认";
  } else {
    decision = "暂缓";
    tier = "reference";
    independentMonomer = "需确认";
  }

  const classification = /n[- ]?methyl/i.test(text) ? "N-取代"
    : /\bd[- ]/i.test(text) ? "D-构型"
      : /proline|azetidine|cycloprop|cyclobut|cyclopent|cyclohex/i.test(text) ? "构象限制"
        : /fluoro|chloro|bromo|iodo/i.test(text) ? "卤代/电子调节"
          : /phenyl|naphth|indol|pyrid/i.test(text) ? "芳香/疏水侧链"
            : /beta|β|gamma/i.test(text) ? "延长骨架"
              : "其他候选";
  const reasons = decision === "排除" ? hardReasons : positiveReasons.length > 0 ? positiveReasons : ["结构规则支持氨基酸样骨架，但缺少直接用途证明"];

  return {
    ccdIds,
    priority,
    name,
    synonyms,
    componentType: record["CCD类型"],
    formula: record["分子式"],
    molecularWeight,
    parentIds,
    smiles,
    backboneDistance,
    decision,
    tier,
    classification,
    independentMonomer,
    score,
    reasons,
    cautions,
    ccdLinks: record["CCD链接"],
    structureImageLinks: record["结构图链接"],
  };
}

const sourceRows = parseCsv(await readFile(inputPath, "utf8"));
const records = sourceRows.map(classify);
const decisionCounts = Object.fromEntries(["收录", "暂缓", "排除"].map((decision) => [decision, records.filter((record) => record.decision === decision).length]));
const tierCounts = Object.fromEntries(["priority", "conditional", "reference", "exclude"].map((tier) => [tier, records.filter((record) => record.tier === tier).length]));
const priorityDecisionCounts = Object.fromEntries(["P0", "P1", "P2", "P3"].map((priority) => [priority, Object.fromEntries(["收录", "暂缓", "排除"].map((decision) => [decision, records.filter((record) => record.priority === priority && record.decision === decision).length]))]));

const output = {
  metadata: {
    auditDate: "2026-08-28",
    sourceFile: "ccd-manual-review-1805.csv",
    count: records.length,
    decisionCounts,
    tierCounts,
    priorityDecisionCounts,
    scope: "Conservative structure and monomer-likeness screen. 收录 means suitable for the next evidence-review stage, not proven SPPS compatibility or oral-cyclic-peptide benefit.",
  },
  records,
};

const headers = ["审核优先级", "审核结论", "研发分档", "CCD编号", "名称", "同义词", "分类", "是否可能作为独立单体", "自动评分", "分子式", "分子量", "母体CCD", "CCD类型", "骨架碳距离", "收录/排除理由", "风险提示", "立体化学SMILES", "CCD链接", "结构图链接"];
const rows = records.map((record) => [record.priority, record.decision, record.tier, record.ccdIds.join(" / "), record.name, record.synonyms, record.classification, record.independentMonomer, record.score, record.formula, record.molecularWeight, record.parentIds.join(" / "), record.componentType, record.backboneDistance, record.reasons.join("；"), record.cautions.join("；"), record.smiles, record.ccdLinks, record.structureImageLinks]);
await writeFile(outputJsonPath, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(outputCsvPath, `${[headers, ...rows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify(output.metadata, null, 2));
