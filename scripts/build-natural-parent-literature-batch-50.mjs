import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const batch50CcdIds = [
  "A1A8T", "ABA", "AIB", "3WX", "5JP", "0A1", "A1AWS", "BMT", "FCL", "HY3",
  "SAR", "A1CHA", "02K", "05N", "0AF", "0BN", "0FL", "0LF", "0TD", "0WZ",
  "11Q", "1AC", "1OP", "1PA", "200", "23P", "2AG", "2GX", "2HF", "2LT",
  "2ML", "2QZ", "2R3", "2RA", "33W", "3BY", "3CF", "3CT", "3GL", "3MY",
  "3PX", "3YM", "41H", "4AF", "4CF", "4CY", "4FB", "4FW", "4II", "4IN",
];
const mode = process.argv.includes("--batch=remaining") ? "remaining" : process.argv.includes("--batch=500") ? "500" : process.argv.includes("--batch=200") ? "200" : "50";
const pilotCcdIds = ["03Y", "MLE", "IML", "MAA", "YNM", "MEA", "MVA"];

const analysis = JSON.parse(readFileSync(join(root, "public/natural-parent-derivative-analysis.json"), "utf8")).records;
const catalog = JSON.parse(readFileSync(join(root, "public/ccd-unified-structure-catalog.json"), "utf8")).records;
const analysisByCcd = new Map(analysis.map((record) => [record.ccdId, record]));
const catalogByCcd = new Map(catalog.map((record) => [record.primaryCcdId, record]));
const manualReviewPath = join(root, "public/natural-parent-manual-structure-review.json");
const manualReview = existsSync(manualReviewPath) ? JSON.parse(readFileSync(manualReviewPath, "utf8")).records : [];
const manualReviewByCcd = new Map(manualReview.map((record) => [record.ccdId, record]));

const pnpmFolder = join(root, "node_modules/.pnpm");
const esbuildPackage = readdirSync(pnpmFolder)
  .filter((name) => name.startsWith("esbuild@"))
  .sort()
  .at(-1);
if (!esbuildPackage) throw new Error("Cannot locate the installed esbuild package");
const esbuild = require(join(pnpmFolder, esbuildPackage, "node_modules/esbuild/lib/main.js"));
const temporaryBundle = join(root, "scripts/.tmp-master-records.cjs");
esbuild.buildSync({ entryPoints: [join(root, "app/master-records.ts")], bundle: true, platform: "node", format: "cjs", outfile: temporaryBundle });
const { masterRecords } = require(temporaryBundle);
rmSync(temporaryBundle);
const masterById = new Map(masterRecords.map((record) => [record.id, record]));

const evidenceRank = (level) => level === "直接证据" ? 6 : level === "改造证据" ? 5 : level === "临床骨架" ? 4 : level === "骨架证据" ? 3 : level === "专利证据" ? 2 : level === "实际使用证据" ? 1 : 0;
const elementName = { C: "碳", N: "氮", O: "氧", S: "硫", F: "氟", Cl: "氯", Br: "溴", I: "碘", P: "磷", Se: "硒" };
const signed = (value, unit = "") => Number.isFinite(value) ? `${value > 0 ? "+" : ""}${Number(value.toFixed(3))}${unit}` : "未计算";

function generatedIds(fileName) {
  const path = join(root, "app", fileName);
  if (!existsSync(path)) return [];
  return [...readFileSync(path, "utf8").matchAll(/^  "([^"]+)": \{/gm)].map((match) => match[1]);
}

const batch200CcdIds = generatedIds("natural-parent-review-batch-200.ts");
const batch500CcdIds = generatedIds("natural-parent-review-batch-500.ts");
const batchRemainingCcdIds = generatedIds("natural-parent-review-batch-remaining.ts");
const laterBatchCcdIds = new Set([...pilotCcdIds, ...batch50CcdIds, ...batch500CcdIds, ...batchRemainingCcdIds]);
const recoveredBatch200CcdIds = analysis
  .map((record) => record.ccdId)
  .filter((ccdId) => !laterBatchCcdIds.has(ccdId));
const alreadyReviewed = new Set([...pilotCcdIds, ...batch50CcdIds, ...batch200CcdIds, ...(mode === "remaining" ? batch500CcdIds : [])]);
const rankedCandidates = catalog
    .filter((component) => {
      const structure = analysisByCcd.get(component.primaryCcdId);
      return structure
        && component.componentClass?.id === "evidence-reviewed-residue"
        && !alreadyReviewed.has(component.primaryCcdId);
    })
    .map((component) => ({
      ccdId: component.primaryCcdId,
      structureStatus: analysisByCcd.get(component.primaryCcdId).status,
      evidenceScore: Math.max(0, ...(component.researchEvidence ?? []).map((link) => evidenceRank(masterById.get(link.recordId)?.level))),
    }))
    .sort((a, b) => b.evidenceScore - a.evidenceScore || a.ccdId.localeCompare(b.ccdId));

const selectedCcdIds = mode === "50"
  ? batch50CcdIds
  : mode === "200" && recoveredBatch200CcdIds.length === 200
    ? recoveredBatch200CcdIds
    : mode === "200"
    ? rankedCandidates.filter((item) => item.structureStatus === "auto-structure-difference").slice(0, 200).map((item) => item.ccdId)
    : mode === "500" && batch500CcdIds.length === 500
      ? batch500CcdIds
      : mode === "500" ? [
        ...rankedCandidates.filter((item) => item.structureStatus === "auto-structure-difference"),
        ...rankedCandidates.filter((item) => item.structureStatus === "manual-review").slice(0, 86),
      ].map((item) => item.ccdId)
        : mode === "remaining" && batchRemainingCcdIds.length === 353
          ? batchRemainingCcdIds
          : rankedCandidates.map((item) => item.ccdId);

if (mode === "200" && selectedCcdIds.length !== 200) throw new Error(`Expected 200 eligible records, found ${selectedCcdIds.length}`);
if (mode === "500" && selectedCcdIds.length !== 500) throw new Error(`Expected 500 eligible records, found ${selectedCcdIds.length}`);
if (mode === "remaining" && selectedCcdIds.length !== 353) throw new Error(`Expected 353 remaining records, found ${selectedCcdIds.length}`);

function describePosition(record) {
  const attachments = record.mapping?.attachments ?? [];
  if (!attachments.length) return "母体与衍生物的对应原子；具体连接位置仍以CCD二维结构图为准";
  const labels = [...new Set(attachments.map((item) => `${elementName[item.attachedElement] ?? item.attachedElement}原子`))];
  return `新增基团连接到母体的${labels.join("、")}`;
}

function describeStructure(record) {
  const delta = record.descriptorDeltas ?? {};
  return `${record.reason}。相对天然母体：精确分子量${signed(delta.exactmw, " Da")}，氢键供体${signed(delta.NumHBD)}，氢键受体${signed(delta.NumHBA)}，拓扑极性表面积${signed(delta.tpsa, " Å²")}，计算脂水分配系数${signed(delta.CrippenClogP)}。`;
}

function makeEntry(ccdId) {
  const structure = analysisByCcd.get(ccdId);
  const component = catalogByCcd.get(ccdId);
  if (!structure || !component) throw new Error(`Missing analysis or catalog record for ${ccdId}`);
  const structurePending = structure.status === "manual-review";
  const secondPass = manualReviewByCcd.get(ccdId);
  const reviewStatus = !structurePending
    ? "complete"
    : secondPass?.status === "second-pass-resolved"
      ? "second-pass-complete"
      : secondPass?.status === "semantic-resolved"
        ? "semantic-resolved"
        : secondPass?.status === "complex-transformation-resolved"
          ? "complex-transformation-resolved"
          : "reviewed-unresolved";
  const evidenceLinks = [...(component.researchEvidence ?? [])]
    .map((link) => ({ link, record: masterById.get(link.recordId) }))
    .filter((item) => item.record)
    .sort((a, b) => evidenceRank(b.record.level) - evidenceRank(a.record.level));
  const best = evidenceLinks[0]?.record;
  const core = component.corePriorityReview;
  const hasPropertyExperiment = best && ["直接证据", "改造证据"].includes(best.level);
  const hasWholeScaffold = best && ["临床骨架", "骨架证据", "专利证据"].includes(best.level);
  const confidence = hasPropertyExperiment ? "同骨架替换" : hasWholeScaffold ? "完整肽支持" : "结构推断";
  const conclusion = best
    ? best.effect
    : core
      ? core.conclusion
      : "已经确认该CCD构件的天然母体和结构变化；目前没有找到可归属于该残基的性质对照实验。";
  const measurement = best
    ? best.evidence
    : core
      ? `${core.synthesisEvidence} ${core.cyclicEvidence}`
      : "当前证据只支持结构身份或在PDB相关体系中的实际使用，不提供溶解度、渗透性、稳定性或口服吸收数值。";
  const boundary = hasPropertyExperiment
    ? "按原论文记录实验对象和比较条件；若实验同时改变多个位点，结果只表示该残基可参与该性质变化，不能拆成固定的单残基增幅。"
    : hasWholeScaffold
      ? "证据属于完整肽、天然产物、临床骨架或专利实例；只能说明该残基与该骨架相容，不能把整分子的性质归因于一个残基。"
      : "目前没有修饰前后性质实验。这里的分子描述符变化是计算结果，不是溶解度、渗透性、稳定性或口服吸收的实测结论。";
  const delta = structure.descriptorDeltas ?? {};
  const sources = [
    { title: `RCSB CCD ${ccdId} · ${structure.name}`, url: structure.sourceUrls?.derivative ?? `https://www.rcsb.org/ligand/${ccdId}`, supports: "确认衍生物名称、结构和CCD天然母体关系" },
    { title: `RCSB CCD ${structure.primaryParent} · 天然母体`, url: structure.sourceUrls?.parent ?? `https://www.rcsb.org/ligand/${structure.primaryParent}`, supports: "确认天然氨基酸母体结构" },
  ];
  if (best) {
    sources.push({ title: best.paper, url: best.href, supports: best.level === "直接证据" || best.level === "改造证据" ? "提供性质实验和比较条件" : "提供完整肽或骨架层面的使用证据" });
    if (best.secondary) sources.push({ title: best.secondary.paper, url: best.secondary.href, supports: "补充完整骨架或临床证据" });
  } else if (core?.sources?.length) {
    for (const source of core.sources.slice(0, 2)) sources.push({ title: source.title, url: source.url, supports: source.evidenceType });
  } else if (component.researchEvidence?.[0]) {
    sources.push({ title: `网站研发证据记录 ${component.researchEvidence[0].recordId}`, url: `/residue/${component.researchEvidence[0].recordId.toLowerCase()}`, supports: "记录PDB实际使用的核查结论与原始结构入口" });
  }
  return {
    reviewStatus,
    naturalParent: `${structure.parentName}（CCD ${structure.primaryParent}）`,
    naturalParentCcd: structure.primaryParent,
    relationship: structurePending
      ? secondPass?.status === "second-pass-resolved"
        ? `CCD明确把${ccdId}关联到${structure.primaryParent}母体；第一轮完整子结构匹配失败后，RDKit最大公共子结构二次核验得到唯一差异解释。`
        : secondPass?.status === "semantic-resolved"
          ? `CCD明确把${ccdId}关联到${structure.primaryParent}母体；已结合官方化学名称和结构叠合确定改造区域，不强行选择化学等价的原子序号。`
          : secondPass?.status === "complex-transformation-resolved"
            ? `CCD把${ccdId}关联到${structure.primaryParent}母体；人工复核确认它涉及成环或较大的骨架重构，不适合描述成天然氨基酸的单点替换。`
            : `CCD明确把${ccdId}关联到${structure.primaryParent}母体；已完成最大公共子结构二次核验，但仍不能可靠解释改造区域。`
      : `CCD明确把${ccdId}关联到${structure.primaryParent}母体；原子级比对显示天然母体重原子骨架完整保留。该关系表示结构衍生，不表示工业生产必须以天然氨基酸为起始原料。`,
    changeLabel: structurePending
      ? secondPass?.status === "second-pass-resolved"
        ? "二次结构核验完成"
        : secondPass?.status === "semantic-resolved"
          ? "化学改造区域已确认"
          : secondPass?.status === "complex-transformation-resolved"
            ? "复杂成环／骨架重构"
            : "已核验 · 改造区域仍不确定"
      : structure.reason.replace("天然母体完整保留；", ""),
    changedPosition: structurePending
      ? secondPass?.semanticResolution ?? secondPass?.changeSummary ?? "尚未得到可靠的化学区域解释"
      : describePosition(structure),
    structuralChange: structurePending && secondPass ? `${secondPass.reason}。${secondPass.changeSummary ?? "未获得唯一原子差异"}。${describeStructure(structure)}` : describeStructure(structure),
    directlyCausedProperties: [
      `结构直接变化：氢键供体${signed(delta.NumHBD)}、氢键受体${signed(delta.NumHBA)}、极性表面积${signed(delta.tpsa, " Å²")}。`,
      `计算趋势：脂水分配系数${signed(delta.CrippenClogP)}、可旋转键${signed(delta.NumRotatableBonds)}、环数${signed(delta.NumRings)}。这些数值用于解释可能的极性、疏水性和刚性变化。`,
      reviewStatus === "reviewed-unresolved"
        ? "本条已经完成二次核验，但改造区域仍无法可靠解释；不能据此指定替换位点。"
        : reviewStatus === "complex-transformation-resolved"
          ? "本条已确定为成环或骨架重构，不应当作天然残基的单点替换来设计或归因。"
          : hasPropertyExperiment ? "下方另列原始论文实验；实验结论仍受肽序列和替换位置限制。" : "尚无单残基性质对照，不能把上述计算变化直接写成渗透性、稳定性或口服吸收改善。",
    ],
    peptideExperiment: { conclusion, measurement, attributionBoundary: boundary, confidence },
    sources,
  };
}

const output = Object.fromEntries(selectedCcdIds.map((ccdId) => [ccdId, makeEntry(ccdId)]));
const target = join(root, `app/natural-parent-review-batch-${mode}.ts`);
mkdirSync(dirname(target), { recursive: true });
const exportName = mode === "50" ? "naturalParentReviewBatch50" : mode === "200" ? "naturalParentReviewBatch200" : mode === "500" ? "naturalParentReviewBatch500" : "naturalParentReviewBatchRemaining";
writeFileSync(target, `// Generated by scripts/build-natural-parent-literature-batch-50.mjs --batch=${mode}\nimport type { NaturalParentModification } from "./natural-parent-modifications";\n\nexport const ${exportName}: Record<string, NaturalParentModification> = ${JSON.stringify(output, null, 2)};\n`);
console.log(JSON.stringify({ target, count: Object.keys(output).length, directOrModificationEvidence: Object.values(output).filter((item) => item.peptideExperiment.confidence === "同骨架替换").length, wholeScaffoldEvidence: Object.values(output).filter((item) => item.peptideExperiment.confidence === "完整肽支持").length, structureOnly: Object.values(output).filter((item) => item.peptideExperiment.confidence === "结构推断").length }, null, 2));
