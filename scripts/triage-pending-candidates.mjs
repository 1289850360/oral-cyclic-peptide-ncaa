import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const catalog = JSON.parse(await readFile(join(publicDir, "ccd-unified-structure-catalog.json"), "utf8"));
const targets = catalog.records.filter((record) => record.componentClass?.id === "candidate-pending");

const statusMeta = {
  "likely-independent-monomer": "结构上较像可独立偶联的氨基酸单体",
  "special-reactive-candidate": "带特殊反应基团，需按设计用途核查",
  "strong-nonmonomer-signal": "存在较强的非普通单体信号",
  unresolved: "现有结构字段不足以进一步判断",
};

const reactivePattern = /\b(azid|alkyn|ethyn|propargyl|boron|boronic|aldehyd|formyl|keto|ketone|thiol|mercapto|phosphon|tetrazol|hydraz|aminooxy|haloacet|chloroacet|bromoacet|maleimid|vinyl|allyl)\w*/i;
const nonMonomerPattern = /\b(coenzyme|cofactor|dinucleotide|nucleotide|nucleoside|adenosine|guanosine|cytidine|uridine|thymidine|flavin|heme|porphyrin|glutathione|phosphocreatine|lipopolysaccharide|oligosaccharide|glycoside|antibiotic complex|bound form|protected form|protecting group|conjugate|adduct)\b/i;
const peptideNamePattern = /\b(di|tri|tetra|penta|hexa|hepta|octa|nona|deca)peptide\b|\bpeptide\b/i;
const protectingPattern = /\b(Boc|Fmoc|Cbz)-|tert-butoxycarbonyl|fluorenylmethoxycarbonyl|benzyloxycarbonyl/i;
const metalFormulaPattern = /\b(Fe|Co|Ni|Cu|Zn|Mn|Mo|W|Pt|Pd|Ru|Rh|Ir|Au|Ag|Cd|Hg)\b/;

function inspect(record) {
  const text = [record.name, ...(record.synonyms ?? []), ...(record.tags ?? [])].join(" ");
  const linkageText = (record.linkageTypes ?? []).join(" ").toLowerCase();
  const weight = Number(record.formulaWeight) || 0;
  const reasons = [];
  let status = "unresolved";

  if (
    nonMonomerPattern.test(text) ||
    peptideNamePattern.test(text) ||
    protectingPattern.test(text) ||
    metalFormulaPattern.test(record.formula ?? "") ||
    weight > 700
  ) {
    status = "strong-nonmonomer-signal";
    if (nonMonomerPattern.test(text)) reasons.push("名称含辅因子、核苷／核苷酸、缀合物或其他非普通单体词");
    if (peptideNamePattern.test(text)) reasons.push("名称提示其本身可能是完整肽或多残基结构");
    if (protectingPattern.test(text)) reasons.push("名称提示为保护态衍生物，而非裸单体身份");
    if (metalFormulaPattern.test(record.formula ?? "")) reasons.push("分子式含金属元素，需排除配合物或辅因子身份");
    if (weight > 700) reasons.push(`分子量 ${weight.toFixed(1)} Da，明显高于常见单残基范围`);
  } else if (reactivePattern.test(text)) {
    status = "special-reactive-candidate";
    reasons.push("名称提示带点击、交联、亲电或其他特殊反应基团");
    reasons.push("可能有设计价值，但需核对保护策略、化学稳定性与位点选择性");
  } else if (/peptide linking/.test(linkageText) && weight > 0 && weight <= 450) {
    status = "likely-independent-monomer";
    reasons.push("CCD连接类型含 peptide linking");
    reasons.push(`分子量 ${weight.toFixed(1)} Da，处于保守的单残基初筛范围内`);
  } else {
    if (!/peptide linking/.test(linkageText)) reasons.push("CCD未给出明确 peptide linking 类型");
    if (!weight) reasons.push("缺少可用于分子量初筛的字段");
    else if (weight > 450) reasons.push(`分子量 ${weight.toFixed(1)} Da，需人工排除复杂衍生物或多片段结构`);
    if (!reasons.length) reasons.push("仅凭现有结构字段无法进一步分层");
  }

  const priority = status === "strong-nonmonomer-signal" ? "exclude-first" : status === "unresolved" ? "identity-first" : status === "special-reactive-candidate" ? "use-case-first" : "synthesis-first";
  return {
    id: record.id,
    ccdId: record.primaryCcdId,
    name: record.name,
    status,
    statusLabel: statusMeta[status],
    priority,
    reasons,
    method: "基于CCD名称、连接类型、分子式和分子量的保守规则分层",
    reviewBoundary: "该结果用于安排人工审核顺序，不等同于已确认可购、可用于SPPS/LPPS、进入过环肽或具有口服暴露。",
    reviewedAt: "2026-08-31",
  };
}

const records = targets.map(inspect);
const statusCounts = Object.fromEntries(Object.keys(statusMeta).map((status) => [status, records.filter((record) => record.status === status).length]));
const payload = {
  metadata: {
    reviewedAt: "2026-08-31",
    count: records.length,
    statusMeta,
    statusCounts,
    method: "Conservative structural-field triage of the candidate-pending class. No literature or supplier confirmation is inferred.",
  },
  records,
};

const fields = ["ccdId", "name", "status", "statusLabel", "priority", "reasons", "method", "reviewBoundary"];
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csvRows = records.map((record) => ({ ...record, reasons: record.reasons.join("；") }));
const csv = [fields, ...csvRows.map((record) => fields.map((field) => record[field]))].map((row) => row.map(escape).join(",")).join("\n");
await Promise.all([
  writeFile(join(publicDir, "ccd-pending-candidate-triage.json"), `${JSON.stringify(payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-candidate-triage.csv"), `\uFEFF${csv}\n`, "utf8"),
]);
console.log(JSON.stringify(payload.metadata, null, 2));
