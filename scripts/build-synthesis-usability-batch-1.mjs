import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const catalog = JSON.parse(await readFile(join(publicDir, "ccd-unified-structure-catalog.json"), "utf8"));
const source = (title, url, type) => ({ title, url, type });
const dSeries = source("Fmoc-D-amino-acid product series", "https://www.cphi-online.com/product/fmoc-d-pro-oh/", "商业目录");
const standardRisk = "常规Fmoc/tBu流程可作为起点；仍需按序列做偶联完成度、消旋和粗品纯度检查。";
const nMethylRisk = "N-甲基化会降低后续胺的亲核性；常需延长或重复偶联，并用HATU、COMU等高效活化体系监测反应完成度。";

const assessments = {
  "02A": { form: "Fmoc-L-Aze-OH", compatibility: "standard-compatible", guidance: "可按Fmoc-SPPS引入；四元环会显著改变Pro样转角，建议在小规模序列先验证。", risks: "环张力和局部构象可能影响树脂上偶联及最终闭环。", sources: [source("Bachem · Fmoc-L-azetidine-2-carboxylic acid", "https://shop.bachem.com/product/4019052/", "商业目录与肽合成说明")] },
  HYP: { form: "Fmoc-Hyp(tBu)-OH", compatibility: "standard-compatible", guidance: "侧链羟基采用tBu保护，可并入Fmoc/tBu SPPS并在TFA裂解时同步脱保护。", risks: "需确认4位立体化学；Pro样酰胺顺反异构会影响环化和纯化。", sources: [source("Severn Biotech · Fmoc-Hyp(tBu)-OH", "https://severnbiotech.com/peptide-synthesis-reagents-2/fmoc-amino-acids/fmoc-hyptbu-oh/", "商业目录"), source("Fmoc-Hyp(tBu)-OH standard SPPS example", "https://www.rsc.org/suppdata/d5/ob/d5ob00477b/d5ob00477b1.pdf", "公开SPPS条件")] },
  DAL: { form: "Fmoc-D-Ala-OH", compatibility: "standard-compatible", guidance: "通常可按标准Fmoc-SPPS处理；与L-Ala替换时保持其他条件一致便于比较。", risks: standardRisk, sources: [dSeries] },
  AIB: { form: "Fmoc-Aib-OH", compatibility: "compatible-with-caution", guidance: "可用于Fmoc-SPPS；位阻较大时宜延长/重复偶联并进行反应监测。", risks: "α,α-二取代导致偶联位阻，接在N-甲基残基后尤其困难；酸氟化物或强化偶联仅在需要时采用。", sources: [source("Bachem · Fmoc-Aib-OH", "https://shop.bachem.com/product/4013932/", "商业目录与偶联提示"), source("CEM · Fmoc-Aib-OH", "https://cem.com/spps-chem/fmoc-aa/fmoc-aib-oh", "SPPS产品说明")] },
  DPR: { form: "Fmoc-D-Pro-OH", compatibility: "standard-compatible", guidance: "可按Fmoc-SPPS引入；作为二级胺残基时应关注其前后位点的偶联效率。", risks: "顺反异构和环化构象敏感；连接到位阻残基时可能需要强化偶联。", sources: [source("FUJIFILM Wako · Fmoc-D-Pro-OH", "https://labchem-wako.fujifilm.com/jp/product/detail/W01W03K00921.html", "商业目录")] },
  DLE: { form: "Fmoc-D-Leu-OH", compatibility: "standard-compatible", guidance: "可按标准Fmoc-SPPS作为疏水D-残基引入。", risks: standardRisk, sources: [dSeries] },
  DVA: { form: "Fmoc-D-Val-OH", compatibility: "compatible-with-caution", guidance: "可用于Fmoc-SPPS；β-支化位点建议监测偶联或采用重复偶联。", risks: "β-支化增加位阻，特别是在连续支化或N-甲基位点附近。", sources: [dSeries] },
  MVA: { form: "Fmoc-N-Me-Val-OH", compatibility: "compatible-with-caution", guidance: "商业Fmoc保护形式已找到；建议高效活化、延长/重复偶联并做定量监测。", risks: `${nMethylRisk} Val的β-支化会进一步增加位阻。`, sources: [source("Bachem · Fmoc-N-Me-Val-OH SDS/product code 4009586", "https://msds.bachem.com/MSDSSearch/servlet/ext/StreamExtPDF?pdf=4009586", "供应商产品文件")] },
  DPN: { form: "Fmoc-D-Phe-OH", compatibility: "standard-compatible", guidance: "可按标准Fmoc-SPPS引入；疏水序列中注意树脂聚集。", risks: standardRisk, sources: [dSeries] },
  SAR: { form: "Fmoc-Sar-OH", compatibility: "compatible-with-caution", guidance: "可用于Fmoc-SPPS；连续Sar或接入位阻残基时建议优化偶联和抑制二酮哌嗪副反应。", risks: nMethylRisk, sources: [source("Sigma-Aldrich · Fmoc-Sar-OH", "https://www.sigmaaldrich.com/AO/en/product/aldrich/47595", "商业目录与SPPS用途")] },
  DTY: { form: "Fmoc-D-Tyr(tBu)-OH", compatibility: "standard-compatible", guidance: "酚羟基采用tBu保护，可按Fmoc/tBu SPPS处理。", risks: "氧化及疏水聚集需监测；确认D构型和侧链保护完整性。", sources: [dSeries] },
  DLY: { form: "Fmoc-D-Lys(Boc)-OH", compatibility: "standard-compatible", guidance: "侧链胺采用Boc保护，可按Fmoc/tBu SPPS处理；用于侧链环化时改用正交保护形式。", risks: "普通Boc保护不适合需要在树脂上选择性暴露侧链的闭环方案。", sources: [dSeries] },
  DSN: { form: "Fmoc-D-Ser(tBu)-OH", compatibility: "standard-compatible", guidance: "侧链羟基采用tBu保护，可按Fmoc/tBu SPPS处理。", risks: "碱处理时间过长可能增加消除或其他副反应风险；需确认D构型。", sources: [dSeries] },
  MLE: { form: "Fmoc-N-Me-Leu-OH", compatibility: "compatible-with-caution", guidance: "商业Fmoc保护形式已找到；建议用高效活化体系并监测后续位点偶联。", risks: nMethylRisk, sources: [source("APExBIO · Fmoc-N-Me-Leu-OH", "https://www.apexbt.com/fmoc-n-me-leu-oh.html", "商业目录")] },
  DTR: { form: "Fmoc-D-Trp(Boc)-OH", compatibility: "standard-compatible", guidance: "吲哚氮Boc保护形式可用于Fmoc/tBu SPPS并减少酸处理副反应。", risks: "Trp易氧化并可能在强酸裂解中发生副反应，需采用合适清除剂。", sources: [dSeries] },
  DTH: { form: "Fmoc-D-Thr(tBu)-OH", compatibility: "compatible-with-caution", guidance: "侧链羟基tBu保护；β-支化位点建议监测或重复偶联。", risks: "β-支化增加偶联位阻，连续位阻残基时尤其明显。", sources: [source("Bachem catalog · Fmoc-D-Thr(tBu)-OH", "https://shop.bachem.com/catalog-woo/page/135/", "商业目录")] },
  DCY: { form: "Fmoc-D-Cys(Trt)-OH", compatibility: "standard-compatible", guidance: "Trt保护形式可用于常规Fmoc/tBu SPPS；若需选择性成环应改选Acm、StBu等正交保护策略。", risks: "巯基氧化、消旋和错配是主要风险；裂解与氧化步骤应分别记录。", sources: [source("Sigma-Aldrich · Fmoc-D-Cys(Trt)-OH", "https://www.sigmaaldrich.com/US/en/product/sial/08503", "商业目录与SPPS用途")] },
  MEA: { form: "Fmoc-N-Me-Phe-OH", compatibility: "compatible-with-caution", guidance: "商业/实验采购记录与宏环肽SPPS实例均已找到；建议HATU类活化并监测偶联。", risks: `${nMethylRisk} 芳香疏水性还可能加重树脂聚集。`, sources: [source("Fmoc-N-Me-Phe-OH supplier listing", "https://www.techservesolutions.in/en/products/fmoc-n-me-phe-oh-77128-73-5", "商业目录"), source("Macrocyclic peptide SPPS using Fmoc-N(Me)-Phe-OH", "https://www.chem.uci.edu/~jsnowick/groupweb/files/Johnny_Pham_Dissertation.pdf", "公开合成条件")] },
  MAA: { form: "Fmoc-N-Me-Ala-OH", compatibility: "compatible-with-caution", guidance: "Fmoc保护形式与树脂上HATU/DIPEA偶联实例已找到；位阻序列建议延长或重复偶联。", risks: nMethylRisk, sources: [source("Fmoc-N-Me-Ala-OH product and reaction record", "https://www.ambeed.com/products/fmoc-n-me-ala-oh.html", "商业目录与合成条件")] },
  ALC: { form: "Fmoc-Cha-OH", compatibility: "compatible-with-caution", guidance: "商业Fmoc保护形式与标准Fmoc-SPPS实例已找到；疏水位点可降低当量但应延长反应并监测。", risks: "体积大、疏水性高，可能造成偶联位阻、树脂聚集及成品溶解度下降。", sources: [source("TCI · Amino acids and peptide synthesis reagents", "https://www.tcichemicals.com/assets/brochure-pdfs/Brochure_L3013_E.pdf", "商业目录"), source("Fmoc-Cha-OH standard SPPS example", "https://www.rsc.org/suppdata/d0/cb/d0cb00216j/d0cb00216j1.pdf", "公开SPPS条件")] },
};

const ids = Object.keys(assessments);
const records = ids.map((ccdId, index) => {
  const record = catalog.records.find((item) => item.primaryCcdId === ccdId);
  if (!record) throw new Error(`Missing CCD ${ccdId}`);
  const item = assessments[ccdId];
  return { batch: 1, batchPosition: index + 1, id: record.id, ccdId, name: record.name, status: "commercial-listed", statusLabel: "商业保护单体目录已核查", protectedForms: [item.form], compatibility: item.compatibility, compatibilityLabel: item.compatibility === "standard-compatible" ? "标准Fmoc-SPPS可作为起点" : "Fmoc-SPPS可用，需强化偶联或特别监测", guidance: item.guidance, risks: item.risks, sources: item.sources, reviewedAt: "2026-08-31", availabilityBoundary: "供应商目录证明存在相应产品或询价条目，不保证特定地区、包装或日期的实时库存。" };
});
const payload = { metadata: { reviewProgram: "Synthesis-usability review for evidence-reviewed CCD components", batch: 1, count: records.length, statusCounts: { "commercial-listed": records.length, "published-route": 0, "special-context-only": 0, insufficient: 0 }, compatibilityCounts: { "standard-compatible": records.filter((item) => item.compatibility === "standard-compatible").length, "compatible-with-caution": records.filter((item) => item.compatibility === "compatible-with-caution").length }, scope: "Protected-form availability, Fmoc-SPPS compatibility, coupling guidance and risks. Vendor listings are not real-time stock guarantees." }, records };
const fields = ["batchPosition", "ccdId", "name", "statusLabel", "protectedForms", "compatibilityLabel", "guidance", "risks", "availabilityBoundary", "sources"];
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csvRecords = records.map((record) => ({ ...record, protectedForms: record.protectedForms.join(" / "), sources: record.sources.map((item) => `${item.type}｜${item.title}｜${item.url}`).join("；") }));
const csv = [fields, ...csvRecords.map((record) => fields.map((field) => record[field]))].map((row) => row.map(escape).join(",")).join("\n");
await Promise.all([
  writeFile(join(publicDir, "ccd-synthesis-usability-batch-1.json"), `${JSON.stringify(payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-synthesis-usability-batch-1.csv"), `\uFEFF${csv}\n`, "utf8"),
]);
console.log(JSON.stringify(payload.metadata, null, 2));
