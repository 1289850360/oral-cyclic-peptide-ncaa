import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const source = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-final.json"), "utf8"));
const sourceByCcd = new Map(source.records.flatMap((record) => record.ccdIds.map((ccdId) => [ccdId, record])));
const gradeLabels = { A: "A级：有直接环肽/宏环强证据", B: "B级：可进入肽，但缺少口服环肽直接证据", C: "C级：特殊片段，需限制用途", EXCLUDE: "排除：不是普通氨基酸单体" };

const q = (ccdId, grade, conclusion, synthesisEvidence, cyclicEvidence, oralEvidence, recommendation, pdbId, extras = []) => ({
  ccdId, grade, conclusion, synthesisEvidence, cyclicEvidence, oralEvidence, recommendation,
  sources: [[`RCSB PDB ${pdbId}`, `https://www.rcsb.org/structure/${pdbId}`, "结构与论文入口"], ...extras],
});

const reviews = [
  q("0JT", "A", "保留为syringolin/glidobactin宏内酰胺残基", "该β-氨基酸样单元已随天然产物及嵌合物完成合成。", "4GK7直接显示其位于syringolin-glidobactin宏环蛋白酶体抑制剂中。", "未找到口服暴露证据。", "保留于天然宏内酰胺残基区；亲脂侧链和亲电药效团需分别评估。", "4GK7", [["Syringolin macrocycle study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2672505/", "宏内酰胺与合成证据"]]),
  q("24M", "B", "保留为环戊基statine样过渡态模拟构件", "已进入NVP-AMK640等BACE肽样抑制剂。", "1YM4为线性肽样蛋白酶抑制剂，不是环肽。", "未找到直接口服证据。", "仅在蛋白酶过渡态模拟方向使用；环化兼容性需单独验证。", "1YM4"),
  q("24O", "B", "保留为含酮环戊基statine样构件", "已进入NVP-AUR200等BACE肽样抑制剂。", "1YM2为线性肽样抑制剂，不是环肽。", "未找到直接口服证据。", "保留为蛋白酶抑制药效构件，不标注为增渗或口服残基。", "1YM2"),
  q("3V8", "A", "保留为可连接的三唑脯氨酸宏环残基", "三唑化脯氨酸已用于DNA编码宏环库命中物的合成优化。", "4WVU为XIAP-BIR2结合宏环拮抗剂的直接结构。", "该系列有体内抗肿瘤活性，但未证明口服暴露。", "适合脯氨酸构象限制及侧链延伸；继续核对具体保护体。", "4WVU", [["XIAP macrocycle study", "https://pubmed.ncbi.nlm.nih.gov/25695766/", "宏环与体内药效证据"]]),
  q("4H0", "C", "限用途保留为底物模拟酮基片段", "其氨基酮结构出现在caspase-6底物模拟物/三元复合物中。", "未找到作为稳定通用内部残基的环肽证据。", "无口服证据。", "移入蛋白酶底物模拟与反应片段区，不作为普通NCAA推荐。", "4HVA", [["Caspase-6 mechanism study", "https://pubmed.ncbi.nlm.nih.gov/23227217/", "底物模拟背景"]]),
  q("6A0", "B", "保留为带羟肟酸侧链的赖氨酸类似物", "已进入基于组蛋白H4的HDAC肽抑制剂。", "5ICN中的直接证据为线性肽抑制剂，不是宏环。", "未找到口服证据。", "适合HDAC金属结合专题；高极性羟肟酸不应被当作通用增渗单元。", "5ICN", [["HDAC complex study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4848466/", "线性肽抑制剂证据"]]),
  q("6L9", "A", "保留为环肽表面的双羧酸/酰胺残基", "该构件已通过合成进入14-3-3结合环肽。", "5JM4明确为含该残基和金刚烷残基的环肽复合物。", "未找到口服证据。", "可用于外露极性和盐桥扫描；多羧酸通常不利于被动渗透。", "5JM4"),
  q("A1G", "A", "保留为金刚烷基甘氨酸宏环残基", "金刚烷基甘氨酸已实际进入14-3-3结合环肽。", "5JM4提供直接环肽结构证据。", "未找到口服证据。", "适合疏水热点填充，但需重点监测溶解度和非特异结合。", "5JM4"),
  q("AFC", "A", "保留为天然环脂肽长链β-氨基酸", "该长链β-氨基酸是bacillomycin Lc等天然脂肽组成单元。", "2IGZ为环状脂肽bacillomycin Lc的NMR结构。", "未找到口服证据。", "保留于天然环脂肽专区；不作为一般口服环肽的常规替换。", "2IGZ"),
  q("CHS", "B", "保留为环己基statine样残基", "已用于天冬氨酸蛋白酶的statine类肽抑制剂。", "2ER0为线性蛋白酶抑制剂复合物。", "未找到直接口服证据。", "仅在蛋白酶过渡态模拟方向优先。", "2ER0"),
  q("CNT", "A", "保留为N-甲基氯代酪氨酸天然宏环残基", "该残基存在于scyptolin A并有天然产物结构证据。", "1OKX为弹性蛋白酶与环状scyptolin A复合物。", "未找到口服证据。", "适合N-甲基化和芳香疏水接触研究；注意卤代芳环代谢。", "1OKX"),
  q("DAV", "A", "保留为δ-氨基戊酸宏环连接单元", "可作为双官能间隔单元进入肽合成。", "7K2P直接显示其用于Nrf2来源KEAP1结合环肽的闭环连接。", "未找到口服证据。", "适合调节环尺寸；高柔性可能削弱预组织，需要构象数据配合。", "7K2P"),
  q("DC0", "EXCLUDE", "从单氨基酸库排除，转入还原二肽等排体库", "其结构为Leu-CH2-NH-Phe型还原肽键，跨越两个残基。", "4GZF来自线性HIV蛋白酶抑制肽，不是独立环肽残基。", "无直接口服证据。", "作为二残基肽键等排构件保存，不计入NCAA单体数量。", "4GZF"),
  q("DMG", "B", "保留为N端二甲基甘氨酸状态，不作为普通内部残基", "5CVD中的DMG表达CENP-A肽的α-N二甲基化N端。", "直接结构为线性底物肽。", "无口服证据。", "保留于N端修饰区，并明确限制为末端状态。", "5CVD", [["NRMT1 substrate study", "https://pubmed.ncbi.nlm.nih.gov/26543159/", "N端甲基化证据"]]),
  q("E7P", "B", "保留为磷酸/磷酸酯等排型谷氨酸类似物", "已进入合成phosphono-MLL肽类似物。", "7S79为HLA结合线性肽，不是宏环。", "未找到口服证据。", "适合磷酸化表位和高电荷识别研究，不作为被动渗透单元。", "7S79"),
  q("EE3", "A", "保留为侧链酰化赖氨酸宏环残基", "含噁唑羰基侧链的赖氨酸已进入AF9 YEATS抑制剂。", "6L5Z标题及结构明确为cyclopeptide inhibitor。", "未找到口服证据。", "适合表观遗传读者蛋白的侧链识别扫描。", "6L5Z"),
  q("GM8", "B", "保留为环己烷约束γ-氨基酸", "已用于α/β/环γ混合骨架foldamer。", "4HJB中的肽为螺旋模拟序列，并非闭合宏环。", "未找到口服证据。", "适合螺旋预组织和蛋白酶稳定性研究；闭环几何需另测。", "4HJB"),
  q("GRN", "B", "保留为α-甲基-α-苯基甘氨酸构象单元", "已进入HLA呈递的合成肽配体。", "4WJ5为线性抗原肽，不是宏环。", "未找到口服证据。", "适合局部刚化和芳香扫描，需关注消旋与偶联效率。", "4WJ5"),
  q("KV6", "A", "保留为iturin天然环脂肽长链β-氨基酸", "长链β-氨基酸是iturin类生物合成与全结构的一部分。", "7TZ3为iturin环脂肽结构。", "未找到口服证据。", "保留于天然环脂肽专区；强疏水性不适合作为普通扫描残基。", "7TZ3"),
  q("LAV", "EXCLUDE", "从单氨基酸库排除，转入还原二肽等排体库", "其结构是Leu-CH2-NH-Val型还原肽键，跨越两个残基。", "4ER4来自线性renin抑制剂。", "无直接口服证据。", "不计入独立NCAA；仅用于蛋白酶抑制剂肽键等排设计。", "4ER4"),
  q("LDO", "B", "保留为末端羟基正亮氨酸", "已进入Zika NS2B-NS3蛋白酶抑制肽MI-2260。", "8AQA为线性抑制剂复合物。", "未找到口服证据。", "可作侧链极性及后续衍生把手；环肽应用需验证。", "8AQA"),
  q("LHE", "EXCLUDE", "从单氨基酸库排除，转入羟乙胺二肽等排体库", "结构同时包含norvaline和氨基羟基异己基两部分，模拟被还原的肽键。", "4TRW为线性BACE1 HEA型抑制剂。", "无直接口服证据。", "作为二残基过渡态模拟构件保存，不计入NCAA单体。", "4TRW"),
  q("LXO", "C", "限用途保留为含吡啶配位头的连接片段", "该结构在Im-N-C4-Phe-Phe中充当吡啶配位头/柔性连接单元。", "8HOU不是环肽，而是P450配体复合物。", "无口服证据。", "移入配位连接体区，不作为普通氨基酸推荐。", "8HOU"),
  q("OUD", "C", "保留为短链寡脲骨架单元", "5N14显示其用于非肽寡脲螺旋结构域。", "当前为蛋白-寡脲复合折叠体，不是传统环肽。", "无口服证据。", "单列为寡脲/折叠体构件，不混入普通NCAA残基。", "5N14"),
  q("OUE", "C", "保留为长链寡脲骨架单元", "5N14显示其用于非肽寡脲螺旋结构域。", "当前不是传统环肽直接证据。", "无口服证据。", "单列为寡脲/折叠体构件，并验证专用固相合成路线。", "5N14"),
  q("PBE", "B", "保留为N端季铵化脯氨酸状态", "5CVE中的PBE表达果蝇H2B肽N端二甲基脯氨酸。", "直接证据为线性底物肽。", "无口服证据。", "仅作为N端永久正电修饰保留，不作为内部残基或增渗单元。", "5CVE", [["NRMT1 substrate study", "https://pubmed.ncbi.nlm.nih.gov/26543159/", "N端甲基化证据"]]),
  q("PRW", "B", "保留为可氧化切割的二羟基氨基酸", "已通过合成装入periodate-cleavable HLA肽。", "2X4T为线性MHC配体，不是宏环。", "无口服证据。", "适合作为可切割化学工具，不作为通用口服优化残基。", "2X4T"),
  q("QF0", "B", "保留为2-萘基β3-高丙氨酸", "已进入PTH1R结合的合成肽配体。", "8D52为线性受体肽配体，不是宏环。", "无口服证据。", "适合芳香热点和β肽扫描；注意疏水性与环尺寸。", "8D52"),
  q("SGK", "B", "保留为吡啶甲基N-取代甘氨酸样构件", "已用于优化细菌DNA滑动夹结合短肽。", "7AZF中的peptide 8为线性短肽，不是宏环。", "无口服证据。", "可用于N端延伸和芳香杂环接触，不标为环肽验证。", "7AZF", [["Sliding-clamp peptide study", "https://doi.org/10.1021/acs.jmedchem.1c00918", "线性短肽证据"]]),
  q("SOW", "C", "限用途保留为还原酰胺/peptoid样片段", "该N-羧甲基甘氨酰胺结构出现在minihepcidin PR73中。", "8DL7为线性minihepcidin复合物，不是普通内部α-氨基酸环肽证据。", "无口服证据。", "单列为肽键等排/peptidomimetic构件，验证具体保护体后再用。", "8DL7"),
  q("T7H", "A", "保留为双羧酸硫醚宏环连接构件", "文献建立了固相硫醚闭环合成路线。", "8DPY直接显示其位于双HBS稳定的宏环β折叠中。", "未找到口服证据。", "适合构建硫醚HBS和β折叠预组织；它更像闭环连接体而非通用侧链。", "8DPY", [["Macrocyclic beta-sheet study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC10592574/", "宏环与固相合成证据"]]),
  q("TVA", "EXCLUDE", "从单氨基酸库排除，转入羟乙胺二肽等排体库", "结构由norvaline与氨基羟基噻吩侧链共同模拟一段肽键。", "4TRZ为线性BACE1 HEA型抑制剂。", "无直接口服证据。", "作为二残基蛋白酶过渡态模拟构件保存。", "4TRZ"),
  q("WGB", "A", "保留为硝基N-甲基苯丙氨酸硫肽残基", "该N-甲基芳香残基已进入新生硫肽wTP3。", "8WM0直接显示其位于高度修饰宏环硫肽中。", "未找到口服证据。", "保留天然产物/重编程宏环标签；硝基芳环需毒理与代谢评估。", "8WM0"),
  q("XZP", "B", "保留为trans-2-氨基环戊烷羧酸构象单元", "ACPC可通过合成装入WW结构域环区。", "5VTI为含ACPC环替换的线性折叠肽，不是闭合环肽。", "未找到口服证据。", "适合β肽与转角刚化；不能仅凭loop一词标成环肽。", "5VTI"),
  q("Y1Y", "C", "限用途保留为AOMK末端战头相关片段", "该糖酸样结构来自caspase-8与AOMK抑制剂形成的四面体加合物。", "不是稳定通用内部残基，也无环肽证据。", "无口服证据。", "移入共价蛋白酶抑制剂/反应中间体区。", "6X8H"),
  q("ZS8", "A", "保留为炔基α-甲基氨基酸闭环把手", "炔基氨基酸已通过合成进入ExoS来源肽。", "5J31为炔烃交联环肽与14-3-3复合物。", "未找到口服证据。", "适合点击/交联闭环和构象限制；需区分游离单体与最终交联状态。", "5J31"),
];

const records = reviews.map((review, index) => {
  const base = sourceByCcd.get(review.ccdId);
  if (!base) throw new Error(`CCD ${review.ccdId} not found.`);
  return {
    batch: 3, batchPosition: index + 1, ccdId: review.ccdId, name: base.name, formula: base.formula,
    molecularWeight: base.molecularWeight, originalStatus: base.finalStatus, originalEvidenceStatus: base.evidenceStatus,
    grade: review.grade, gradeLabel: gradeLabels[review.grade], conclusion: review.conclusion,
    synthesisEvidence: review.synthesisEvidence, cyclicEvidence: review.cyclicEvidence, oralEvidence: review.oralEvidence,
    recommendation: review.recommendation, sourceCount: review.sources.length,
    sources: review.sources.map(([title, url, evidenceType]) => ({ title, url, evidenceType })),
    ccdUrl: base.ccdLinks, pdbExamples: base.exampleEntryIds,
  };
});

const gradeCounts = Object.fromEntries(Object.keys(gradeLabels).map((grade) => [grade, records.filter((record) => record.grade === grade).length]));
const payload = { metadata: { auditDate: "2026-08-28", batch: 3, count: records.length, selection: "92条优先深审队列扣除前两批56条后的全部剩余36条。", gradeCounts, gradeDefinitions: gradeLabels, scope: "逐条核对RCSB条目与原始论文；将独立残基、末端状态、反应片段和跨两个残基的肽键等排体分开。A级不等于口服可用。" }, records };
const headers = ["批次", "序号", "CCD编号", "名称", "等级", "等级说明", "结论", "合成/单体证据", "环肽证据", "口服证据", "建议", "来源数", "来源", "CCD链接", "PDB示例"];
const quote = (value) => { const text = value == null ? "" : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const rows = records.map((record) => [record.batch, record.batchPosition, record.ccdId, record.name, record.grade, record.gradeLabel, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, record.sourceCount, record.sources.map((item) => `${item.evidenceType}｜${item.title}｜${item.url}`).join("；"), record.ccdUrl, record.pdbExamples.join(" / ")]);
await writeFile(path.join(publicDir, "ccd-manual-review-batch-3.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(path.join(publicDir, "ccd-manual-review-batch-3.csv"), `\uFEFF${[headers, ...rows].map((row) => row.map(quote).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify(payload.metadata, null, 2));
