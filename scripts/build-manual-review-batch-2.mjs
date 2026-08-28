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
  q("A1APM", "A", "保留为宏环构象限制残基", "α-甲基苯丙氨酸可按保护氨基酸方式进入肽链。", "9BI3直接显示其位于Aβ来源的宏环β-发夹肽中。", "未找到直接口服暴露数据。", "适合刚化局部构象和降低蛋白酶识别；需监测疏水性和闭环收率。", "9BI3"),
  q("EZY", "C", "保留为光控N-取代甘氨酸，不列为通用残基", "文献采用亚单体法在树脂上构建，而不是直接偶联常规Fmoc单体；后续偶联需要triphosgene等强化条件。", "已进入光控Aβ宏环β-发夹肽，但用途是光解保护和控制聚集。", "无口服证据；硝基苄基光敏基团不适合作为常规口服优化单元。", "移入光控/可脱保护特殊构件区。", "6CG3", [["Macrocyclic photocaging study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6361387/", "合成与宏环直接证据"]]),
  q("01B", "B", "保留为AHPBA类蛋白酶抑制残基", "β-羟基-β-高苯丙氨酸类保护体已有肽偶联应用。", "当前直接结构来自线性apstatin等肽样抑制剂，不是宏环。", "未找到直接口服证据。", "适合过渡态模拟和氨肽酶靶点；进入环肽需重新验证构象和偶联。", "1N51"),
  q("1OL", "B", "保留为statine样过渡态模拟残基", "在BACE蛋白酶抑制剂中作为稳定肽样构件使用。", "当前命中主要为线性蛋白酶抑制剂。", "未找到直接口服环肽证据。", "仅在蛋白酶过渡态模拟方向优先，不作为普适增渗残基。", "1FKN"),
  q("JG3", "EXCLUDE", "从单氨基酸库排除，转入肽键等排体库", "JG3是JG-365中Phe-ψ[CH(OH)CH2N]-Pro的羟乙胺肽键等排片段，跨越两个残基。", "用于线性七肽来源HIV蛋白酶抑制剂，不是独立单残基环肽证据。", "无直接口服证据。", "作为蛋白酶抑制剂二残基等排构件保留，不计入NCAA数量。", "2J9J", [["JG-365 identity", "https://pmc.ncbi.nlm.nih.gov/articles/PMC55048/", "二残基等排体证据"]]),
  q("LOV", "B", "保留为疏水statine样残基", "已用于H261等过渡态类似肽抑制剂。", "当前直接证据为线性肽样抑制剂。", "未找到直接口服证据。", "适合酸性蛋白酶抑制方向；高疏水和延长骨架需结合环尺寸评估。", "1GKT"),
  q("Y2Y", "C", "降级为酶反应中间体/末端抑制片段", "结构命中来自caspase ketomethylene抑制剂形成的四面体加合物。", "未找到作为稳定独立内部残基的环肽应用。", "无直接证据。", "不要进入通用合成单体库；仅在caspase机理与末端抑制剂专题中保留。", "6X8I"),
  q("AKZ", "C", "降级为末端醛/水合抑制片段", "4,4-二羟基形态对应醛基末端的水合表达，PDB背景为Ac-DEVD-CMK/caspase体系。", "不是普通内部残基的环肽使用证据。", "无直接证据。", "从通用残基推荐中移出，保留于蛋白酶共价/末端抑制剂区。", "4JR0"),
  q("0UO", "A", "保留为天然宏环肽芳香残基", "4-甲氧基色氨酸存在于argyrin B等天然产物并可随宏环肽完成全合成。", "4FN5直接显示其位于环肽argyrin B。", "未找到该残基对口服吸收的直接归因证据。", "适合芳香结合面与代谢调节；保留天然宏环来源标签。", "4FN5"),
  q("A1A2Y", "B", "保留为芳香氨基酸药效团", "5-甲氧基色氨酸样构件已进入Pin1共价抑制/降解化合物。", "当前证据不是宏环肽，而是肽样/小分子化合物。", "未找到直接口服环肽证据。", "可用于芳香扫描，但不能因PDB短链命中标成环肽验证。", "8VJD", [["Pin1 degrader study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11588135/", "化合物背景"]]),
  q("A1I8R", "A", "保留为膜渗透宏环的N-取代β-氨基酸", "N-甲基β-丙氨酸可作为N-取代延长骨架构件进入宏环。", "9QBT/9QDU为KEAP1膜渗透环肽直接结构证据。", "有膜渗透证据，但尚不能等同于口服暴露。", "优先用于降低骨架供体和调节环尺寸；继续补查PK。", "9QBT"),
  q("PDF", "B", "保留为构象限制含氟脯氨酸", "4,4-二氟脯氨酸可按脯氨酸衍生物进入肽。", "当前结构为线性蛋白酶体肽环氧酮抑制剂。", "未找到直接口服环肽证据。", "适合构象/电子效应扫描；含氟并不自动代表增渗。", "4Y84"),
  q("3WT", "B", "保留为天然产物型N-甲基γ-氨基酸", "该残基位于auristatin/MMAF类肽载荷并有成熟合成应用。", "当前PDB为线性auristatin类肽，不是宏环。", "无直接口服证据；MMAF用途为细胞毒载荷。", "保留于天然产物/ADC载荷残基区，不标为口服候选。", "5J2U"),
  q("APD", "A", "保留为PCSK9宏环芳香残基", "3-甲基苯丙氨酸兼容宏环肽合成。", "6XIE/6XIF直接显示其位于高效PCSK9环肽。", "该系列支持宏环药效，但未证明该残基单独提高口服性。", "适合疏水口袋和芳环定向扫描。", "6XIE"),
  q("KFB", "B", "保留为δ-氨基酸/间隔单元", "5-氨基戊酸有肽合成级原料并常作间隔臂。", "当前PDB为RW16细胞穿透线性肽，不是宏环。", "未找到直接口服证据。", "用于调节间距和环尺寸；柔性较高，不应默认增渗。", "6RQS", [["Peptide-synthesis grade identity", "https://www.sigmaaldrich.com/US/en/product/aldrich/123188", "合成用途"]]),
  q("MKE", "C", "降级为酮酸/蛋白酶反应片段", "结构背景为caspase DEVE肽复合物中的氧代酸表达。", "未找到稳定独立残基进入环肽的证据。", "无直接证据。", "移入caspase底物/反应机理专题，不列入通用单体。", "5IC4"),
  q("OPR", "C", "降级为非水解肽键模拟片段", "OPR位于hirutonin非水解双功能抑制剂中，结构包含Arg样部分与额外酮酸链。", "当前为线性双功能抑制剂，不是普通宏环单体。", "无直接证据。", "保留为肽键等排/连接构件，不进入常规NCAA推荐。", "1IHS", [["Hirutonin context", "https://www.rcsb.org/structure/1IHT", "非水解连接体背景"]]),
  q("TIG", "B", "保留为N-氨乙基色氨酸", "N-氨乙基取代后仍可通过末端胺构建N-取代肽骨架。", "当前直接证据为HLA结合的线性peptidomimetic ELA-2。", "未找到直接口服或宏环证据。", "可用于N-取代和带正电侧链扫描，但需验证闭环与选择性保护。", "3O3D"),
  q("LNT", "EXCLUDE", "从单氨基酸库排除，标为捕获的四面体反应中间体", "LNT是HIV蛋白酶水解NLLTQI时形成的gem-diol四面体中间体片段，并非稳定采购单体。", "不是宏环残基。", "无直接证据。", "仅保留于酶反应机理数据，不计入NCAA。", "3B7V", [["Tetrahedral intermediate study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2546526/", "反应中间体证据"]]),
  q("WEH", "A", "保留为宏环/硫肽中的同谷氨酰胺", "同谷氨酰胺可被重编程遗传密码系统引入肽。", "8WM0为新生硫肽wTP3复合物，支持进入高度修饰宏环肽。", "未找到直接口服证据。", "适合延长侧链和极性扫描；保留生物合成方式标签。", "8WM0"),
  q("45F", "A", "保留为可点击的构象限制脯氨酸", "炔丙氧基脯氨酸可作为保护单体进入肽。", "4Y1C直接显示其位于HIV整合酶结合环六肽。", "未找到直接口服证据。", "适合脯氨酸刚化与后续点击衍生；需验证醚基代谢稳定性。", "4Y1C"),
  q("A1CZ7", "A", "保留为天然环缩酚肽N,O-二甲基丝氨酸", "已有保护单体与coibamide A固相/全合成路线。", "coibamide A为高度N-甲基化环缩酚肽，9YWS给出靶点复合物结构。", "未找到口服暴露证据；天然产物细胞活性不能等同口服。", "高价值天然宏环残基，适合降低供体并调节极性。", "9YWS", [["Coibamide A composition", "https://pmc.ncbi.nlm.nih.gov/articles/PMC2659736/", "天然环缩酚肽直接证据"]]),
  q("A1J0G", "B", "保留为xeno peptide构象单元", "dimethyl-glutamic acid已用于合成xeno peptide并完成NMR结构解析。", "当前证据为非天然线性肽二级结构，不是宏环。", "未找到直接口服证据。", "保留为构象设计候选，后续需验证闭环和合成收率。", "9U2V"),
  q("C67", "A", "保留为环状meditope的Arg侧链扩展残基", "N-羧乙基胍基鸟氨酸已实际进入meditope变体。", "meditope是12残基环肽；结构和结合动力学均有直接数据。", "未找到口服证据。", "适合从环肽表面伸出羧酸把手；高极性，不作为被动增渗单元。", "6AZL", [["Meditope cyclic-peptide study", "https://pubmed.ncbi.nlm.nih.gov/29199990/", "环肽直接证据"]]),
  q("C6D", "A", "保留为环状meditope的羟丙基Arg类似物", "已实际进入meditope变体并完成结构解析。", "12残基环肽中的直接替换证据。", "未找到口服证据。", "可用于水溶性和外露氢键扫描；注意胍基高极性。", "6AZK", [["Meditope cyclic-peptide study", "https://pubmed.ncbi.nlm.nih.gov/29199990/", "环肽直接证据"]]),
  q("GLK", "C", "降级为醛/水合蛋白酶抑制片段", "5,5-二羟基形式代表末端醛的水合表达，背景为HAV 3C蛋白酶肽酮抑制剂。", "不是稳定普通内部残基的宏环证据。", "无直接证据。", "移入末端醛/共价蛋白酶抑制剂区。", "2HAL"),
  q("LYP", "B", "保留为赖氨酸侧链烷基化探针残基", "N6-甲基-N6-丙基赖氨酸已在组蛋白肽中用于LSD1自杀失活研究。", "当前为线性组蛋白肽，不是宏环。", "未找到直接口服证据。", "适合表观遗传读写酶探针；高碱性侧链不利于被动渗透。", "2UXN"),
  q("9RI", "B", "保留为细胞活性甲基赖氨酸模拟物", "该norbornyl/methyl赖氨酸已进入短肽UNC4976。", "UNC4976是线性peptidomimetic，不是环肽。", "具有细胞活性但无口服证据。", "保留为芳香笼靶点和细胞活性侧链模拟物，不标为环肽验证。", "8SII", [["UNC4976 study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6800648/", "短肽/细胞证据"]]),
  q("A1BIE", "B", "保留为赖氨酸甲基丙烯酰化PTM残基", "已在合成组蛋白H3肽中使用并完成读者蛋白结构研究。", "当前为线性PTM肽，不是宏环。", "无直接口服证据。", "适合表观遗传PTM专题，不作为通用口服设计残基。", "9EHI"),
  q("A1IL6", "A", "保留为可钉合4-巯基脯氨酸衍生物", "4-巯基脯氨酸侧链经己基硫醚表达，已有肽-折叠体合成。", "9GFK为MDM2结合钉合foldamer，属于侧链宏环约束直接证据。", "有细胞活性但未找到口服证据。", "适合构建侧链钉合与螺旋预组织；需区分游离巯基前体和最终硫醚。", "9GFK"),
  q("C1J", "A", "保留为环状meditope疏水Arg类似物", "N-octyl胍基鸟氨酸已实际进入meditope变体。", "12残基环肽直接结构和动力学证据。", "未找到口服证据。", "可扫描长疏水侧链，但可能降低溶解度。", "6AXP", [["Meditope cyclic-peptide study", "https://pubmed.ncbi.nlm.nih.gov/29199990/", "环肽直接证据"]]),
  q("C4G", "A", "保留为环状meditope氨丙基Arg类似物", "已实际进入meditope变体。", "12残基环肽直接结构证据。", "未找到口服证据。", "可提供侧链胺把手；额外正电荷通常不利于被动扩散。", "6AYN", [["Meditope cyclic-peptide study", "https://pubmed.ncbi.nlm.nih.gov/29199990/", "环肽直接证据"]]),
  q("ZT1", "B", "保留为CDYL甲基赖氨酸模拟残基", "N6-异丙基/咪唑甲基赖氨酸已进入短肽抑制剂UNC6261。", "当前为线性peptidomimetic，不是宏环。", "未找到直接口服证据。", "适合染色质读者蛋白专题；需验证选择性保护和电荷状态。", "7N27"),
  q("005", "B", "保留为口服小分子肽模拟物中的羟基氨基酸", "该AHPBA立体异构体可作为蛋白酶过渡态模拟构件。", "9IZB中的TMP1不是环肽，而是口服双靶点肽模拟抑制剂。", "TMP1在小鼠报告77.5%口服生物利用度，并有犬PK；这是完整非环状化合物证据。", "保留并标注“非环状口服peptidomimetic证据”，不能直接外推到环肽。", "9IZB", [["TMP1 oral study", "https://pmc.ncbi.nlm.nih.gov/articles/PMC11601862/", "非环状口服证据"]]),
  q("2IQ", "A", "保留为N-己基甘氨酸宏环残基", "N-烷基甘氨酸可作为peptoid样单元进入宏环。", "7WMC直接显示其位于NNMT结合宏环肽1。", "未找到直接口服证据。", "适合降低骨架供体和增加疏水接触；注意长烷基导致溶解度下降。", "7WMC"),
  q("4BA", "B", "保留为芳香β-氨基酸样连接构件", "已用于HIV-1 gp41细胞进入抑制肽。", "当前直接证据为线性抑制肽，不是宏环。", "无直接口服证据。", "可作为芳香刚性连接单元；双羧酸和延长骨架会增加极性。", "1FAV"),
];

const records = reviews.map((review, index) => {
  const base = sourceByCcd.get(review.ccdId);
  if (!base) throw new Error(`CCD ${review.ccdId} not found.`);
  return {
    batch: 2, batchPosition: index + 1, ccdId: review.ccdId, name: base.name, formula: base.formula,
    molecularWeight: base.molecularWeight, originalStatus: base.finalStatus, originalEvidenceStatus: base.evidenceStatus,
    grade: review.grade, gradeLabel: gradeLabels[review.grade], conclusion: review.conclusion,
    synthesisEvidence: review.synthesisEvidence, cyclicEvidence: review.cyclicEvidence, oralEvidence: review.oralEvidence,
    recommendation: review.recommendation, sourceCount: review.sources.length,
    sources: review.sources.map(([title, url, evidenceType]) => ({ title, url, evidenceType })),
    ccdUrl: base.ccdLinks, pdbExamples: base.exampleEntryIds,
  };
});

const gradeCounts = Object.fromEntries(Object.keys(gradeLabels).map((grade) => [grade, records.filter((record) => record.grade === grade).length]));
const payload = { metadata: { auditDate: "2026-08-28", batch: 2, count: records.length, selection: "第一批20条之后，按≤50残基PDB聚合实体命中数和结构评分选择下一批36条。", gradeCounts, gradeDefinitions: gradeLabels, scope: "逐条核对RCSB条目、原始论文及必要的专利/身份来源；A级只代表直接环肽/宏环证据，不代表单残基可独立带来口服性。" }, records };
const headers = ["批次", "序号", "CCD编号", "名称", "等级", "等级说明", "结论", "合成/单体证据", "环肽证据", "口服证据", "建议", "来源数", "来源", "CCD链接", "PDB示例"];
const quote = (value) => { const text = value == null ? "" : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const rows = records.map((record) => [record.batch, record.batchPosition, record.ccdId, record.name, record.grade, record.gradeLabel, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, record.sourceCount, record.sources.map((item) => `${item.evidenceType}｜${item.title}｜${item.url}`).join("；"), record.ccdUrl, record.pdbExamples.join(" / ")]);
await writeFile(path.join(publicDir, "ccd-manual-review-batch-2.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(path.join(publicDir, "ccd-manual-review-batch-2.csv"), `\uFEFF${[headers, ...rows].map((row) => row.map(quote).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify(payload.metadata, null, 2));
