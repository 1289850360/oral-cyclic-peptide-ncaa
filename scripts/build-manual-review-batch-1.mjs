import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const source = JSON.parse(await readFile(path.join(publicDir, "ccd-manual-review-final.json"), "utf8"));
const sourceByCcd = new Map(source.records.flatMap((record) => record.ccdIds.map((ccdId) => [ccdId, record])));

const reviews = [
  {
    ccdId: "STA", grade: "A", conclusion: "保留为高价值候选",
    synthesisEvidence: "已有statine及其保护衍生物的成熟合成与肽偶联应用。",
    cyclicEvidence: "含statine的环六肽系列有直接实验数据。",
    oralEvidence: "同系列一个化合物在大鼠中口服生物利用度为21%；结论属于完整环肽骨架，不能归因于单个残基。",
    recommendation: "优先用于构象预组织、蛋白酶过渡态模拟及溶解度/渗透性平衡设计。",
    sources: [
      ["Bockus et al., J Med Chem (2015)", "https://pubmed.ncbi.nlm.nih.gov/25950816/", "直接环肽/口服证据"],
      ["RCSB PDB 1FIV", "https://www.rcsb.org/structure/1FIV", "结构使用证据"],
    ],
  },
  {
    ccdId: "3WX", grade: "A", conclusion: "保留为临床骨架候选",
    synthesisEvidence: "已在enlicitide的模块化合成和放大路线中实际使用。",
    cyclicEvidence: "是enlicitide复杂宏环/三环骨架中的构象限制残基。",
    oralEvidence: "enlicitide为口服活性PCSK9宏环肽并已有临床人体证据；不能把整体口服性单独归因于2-Me-Pro。",
    recommendation: "优先用于转角、局部刚化和降低骨架氢键供体，但需结合整个大环构象评估。",
    sources: [
      ["Josien et al., J Med Chem (2026)", "https://pubmed.ncbi.nlm.nih.gov/42201324/", "临床宏环骨架"],
      ["MK-0616 Phase 1 report", "https://pubmed.ncbi.nlm.nih.gov/37125593/", "人体口服证据"],
      ["RCSB PDB 10SB", "https://www.rcsb.org/structure/10SB", "精确结构位置"],
    ],
  },
  {
    ccdId: "SOQ", grade: "A", conclusion: "保留，但标记为高极性位置依赖型",
    synthesisEvidence: "N-甲基氨基酸可按常规保护/偶联策略进入环肽；该残基已有宏环结构实例。",
    cyclicEvidence: "在宏环KRAS抑制剂结构中实际出现，并有同骨架环六肽单点替换数据。",
    oralEvidence: "N-Me-Asp环六肽类似物RRCK Papp约0.6×10^-6 cm/s，表现偏低；不能视为增渗残基。",
    recommendation: "只在需要酸性结合点或溶解度时使用，并优先考虑侧链电荷埋藏。",
    sources: [
      ["Goetz et al., ACS Med Chem Lett (2014)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/", "环肽渗透性直接证据"],
      ["RCSB PDB 24HR", "https://www.rcsb.org/structure/24HR", "宏环肽结构证据"],
    ],
  },
  {
    ccdId: "5JP", grade: "A", conclusion: "保留为可用的亲水N-甲基候选",
    synthesisEvidence: "有N-甲基丝氨酸环肽合成和结构使用记录。",
    cyclicEvidence: "在相同环六肽骨架的单点替换系列中被直接测试。",
    oralEvidence: "EPSA为83、RRCK Papp约1.6×10^-6 cm/s；有可测被动渗透，但不是该系列最优残基。",
    recommendation: "适合需要保留羟基和水溶性的位点，不能宣传为普适增渗单元。",
    sources: [["Goetz et al., ACS Med Chem Lett (2014)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/", "环肽渗透性直接证据"]],
  },
  {
    ccdId: "A1CHA", grade: "A", conclusion: "保留为临床骨架交联残基",
    synthesisEvidence: "已在enlicitide的可放大模块化路线中使用。",
    cyclicEvidence: "额外氨甲基参与enlicitide的复杂交联网络。",
    oralEvidence: "所在完整宏环药物具有临床口服活性；额外伯胺本身通常不利于被动扩散。",
    recommendation: "作为侧链桥连/内酰胺化把手使用，不应当作单纯增脂或增渗残基。",
    sources: [
      ["Josien et al., J Med Chem (2026)", "https://pubmed.ncbi.nlm.nih.gov/42201324/", "临床宏环骨架"],
      ["RCSB PDB 10SB", "https://www.rcsb.org/structure/10SB", "精确结构位置"],
    ],
  },
  {
    ccdId: "NMK", grade: "A", conclusion: "保留，但标记为带正电位置依赖型",
    synthesisEvidence: "N-Me-Lys已用于环肽N-甲基化扫描和生长抑素类似物。",
    cyclicEvidence: "NMR结构6HVC为含N-Me-Lys的环状urotensin肽；另有N-甲基环六肽系统数据。",
    oralEvidence: "单点环肽RRCK Papp约0.3×10^-6 cm/s；但含N-Me-Lys的三N-甲基生长抑素类似物约10%口服生物利用度。",
    recommendation: "仅在正电荷参与结合或可被构象埋藏时使用。",
    sources: [
      ["Goetz et al., ACS Med Chem Lett (2014)", "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/", "环肽渗透性直接证据"],
      ["Biron et al., Angew Chem Int Ed (2008)", "https://pubmed.ncbi.nlm.nih.gov/18297660/", "口服环肽骨架"],
      ["RCSB PDB 6HVC", "https://www.rcsb.org/structure/6HVC", "环肽结构证据"],
    ],
  },
  {
    ccdId: "BAL", grade: "B", conclusion: "保留为β-氨基酸/间隔单元",
    synthesisEvidence: "β-丙氨酸可用标准肽化学进入α/β肽，也是天然肽抗生素efrapeptin的组成单元。",
    cyclicEvidence: "存在环肽和环状低聚物应用，但当前CCD命中主要证明肽中使用。",
    oralEvidence: "未找到该残基在可口服环肽中的直接归因证据。",
    recommendation: "用于延长骨架和调节转角；注意柔性增加可能不利于被动渗透。",
    sources: [["RCSB PDB 1EFR / PNAS", "https://www.rcsb.org/structure/1EFR", "天然肽使用证据"]],
  },
  {
    ccdId: "XCP", grade: "B", conclusion: "保留为高价值构象限制β-氨基酸",
    synthesisEvidence: "有全立体异构体的规模化合成，且文献明确说明兼容标准SPPS。",
    cyclicEvidence: "已用于α/β肽、受体配体和RaPID非标准肽库；目前最强证据是稳定螺旋与细胞进入，不是口服宏环。",
    oralEvidence: "未找到直接口服暴露数据。",
    recommendation: "优先用于螺旋稳定、抗蛋白酶和细胞进入设计；口服价值仍需在具体环肽中验证。",
    sources: [
      ["Kawai et al., RSC Chem Biol (2025)", "https://doi.org/10.1039/D5CB00021A", "细胞进入/稳定性"],
      ["Scalable ACPC stereoisomer synthesis", "https://doi.org/10.1021/acs.joc.3c02991", "合成与SPPS兼容性"],
      ["RCSB PDB 25NV", "https://www.rcsb.org/structure/25NV", "肽中使用证据"],
    ],
  },
  {
    ccdId: "ASJ", grade: "C", conclusion: "降级为末端抑制剂/特殊用途片段",
    synthesisEvidence: "结构上可作为β-氨基酸样单元，但当前命中主要来自醛型或末端抑制剂体系。",
    cyclicEvidence: "未找到作为普通内部残基的可靠环肽应用。",
    oralEvidence: "未找到直接证据。",
    recommendation: "不要进入通用残基推荐库；仅在末端醛/半醛及蛋白酶抑制剂专题中保留。",
    sources: [
      ["RCSB PDB 1F1J", "https://www.rcsb.org/structure/1F1J", "caspase肽醛抑制剂结构"],
      ["PubChem CID 1502045", "https://pubchem.ncbi.nlm.nih.gov/compound/1502045", "身份核对"],
    ],
  },
  {
    ccdId: "XPC", grade: "B", conclusion: "保留为构象限制β-氨基酸",
    synthesisEvidence: "已有Fmoc保护体和SPPS进入α/β肽的直接方法。",
    cyclicEvidence: "用于α/β肽螺旋束、细胞穿透肽及环肽类似物研究。",
    oralEvidence: "未找到直接口服证据。",
    recommendation: "适合刚化骨架并提供可衍生的环内氮；需要单独评估碱性和渗透性。",
    sources: [
      ["RSC Org Biomol Chem (2015)", "https://doi.org/10.1039/C5OB00389J", "SPPS与细胞进入证据"],
      ["RCSB PDB 3C3H", "https://www.rcsb.org/structure/3C3H", "α/β肽结构证据"],
    ],
  },
  {
    ccdId: "PSA", grade: "B", conclusion: "保留为蛋白酶过渡态模拟残基",
    synthesisEvidence: "AHPPA/phenylstatine有成熟保护和肽偶联记录。",
    cyclicEvidence: "当前强证据主要是线性肽样蛋白酶抑制剂，不是口服环肽。",
    oralEvidence: "未找到直接证据。",
    recommendation: "适合蛋白酶靶点和过渡态模拟，不应外推为普适口服残基。",
    sources: [
      ["Peptide substrates and inhibitors of HIV-1 protease", "https://doi.org/10.1016/0006-291X(89)90008-9", "肽样抑制剂证据"],
      ["RCSB PDB 1EPL", "https://www.rcsb.org/structure/1EPL", "结构证据"],
    ],
  },
  {
    ccdId: "V7T", grade: "A", conclusion: "保留为宏环蛋白酶抑制剂残基",
    synthesisEvidence: "在MI系列宏环Zika病毒蛋白酶抑制剂中完成合成和优化。",
    cyclicEvidence: "7O55等多条PDB结构直接证明进入宏环抑制剂。",
    oralEvidence: "未找到口服暴露证据。",
    recommendation: "作为高极性、酶口袋定向残基使用；不适合默认用于被动渗透优化。",
    sources: [["Huber et al., J Med Chem (2022) / RCSB 7O55", "https://www.rcsb.org/structure/7O55", "宏环抑制剂直接证据"]],
  },
  {
    ccdId: "L2O", grade: "B", conclusion: "保留为天然肽样抑制剂残基",
    synthesisEvidence: "有光学纯保护衍生物合成，并已与Val-Val-Asp偶联制备amastatin。",
    cyclicEvidence: "当前直接证据为线性四肽amastatin，不是环肽。",
    oralEvidence: "未找到直接证据。",
    recommendation: "适合氨肽酶抑制和过渡态模拟专题，进入环肽需重新验证偶联与构象。",
    sources: [
      ["Rich et al., J Org Chem (1980)", "https://doi.org/10.1021/jo01300a004", "合成与肽偶联"],
      ["RCSB PDB 1BLL", "https://www.rcsb.org/structure/1BLL", "amastatin结构证据"],
    ],
  },
  {
    ccdId: "3FB", grade: "B", conclusion: "保留为疏水β-氨基酸",
    synthesisEvidence: "β-高苯丙氨酸可进入α/β肽和功能性折叠体。",
    cyclicEvidence: "目前主要是α/β螺旋模拟物，不是环肽直接证据。",
    oralEvidence: "未找到直接证据。",
    recommendation: "可用于疏水结合面和抗蛋白酶设计；进入宏环后需重新优化闭环几何。",
    sources: [
      ["RCSB PDB 4A1W / JACS", "https://www.rcsb.org/structure/4A1W", "α/β肽功能结构"],
      ["β-amino acid medicinal chemistry perspective", "https://doi.org/10.1021/jm5010896", "类别证据"],
    ],
  },
  {
    ccdId: "A1CK7", grade: "A", conclusion: "保留为宏环RAS抑制剂残基",
    synthesisEvidence: "已在UM0140401宏环肽中实际合成和结构解析。",
    cyclicEvidence: "9PU1等结构直接证明进入H/KRAS宏环抑制剂。",
    oralEvidence: "未找到口服暴露证据。",
    recommendation: "适合引入β位 gem-二甲基约束；常规偶联可能较困难，需保留专用合成条件。",
    sources: [["RCSB PDB 9PU1 / ACS Med Chem Lett", "https://www.rcsb.org/structure/9PU1", "宏环抑制剂直接证据"]],
  },
  {
    ccdId: "0JY", grade: "B", conclusion: "保留为疏水α-氨基酸",
    synthesisEvidence: "已有商品和设计肽中的实际使用。",
    cyclicEvidence: "当前强证据来自de novo coiled-coil肽，不是环肽。",
    oralEvidence: "未找到直接证据。",
    recommendation: "可作为高疏水侧链扫描单元；需防止溶解度下降和过度脂溶。",
    sources: [["RCSB PDB 4G4L / Protein Science", "https://www.rcsb.org/structure/4G4L", "设计肽使用证据"]],
  },
  {
    ccdId: "CSI", grade: "C", conclusion: "降级为天然肽样抑制剂特殊残基",
    synthesisEvidence: "在chymostatin类肽醛抑制剂中出现，但结构含氨基甲酰化/环状胍特征，不是普通自由α-氨基酸。",
    cyclicEvidence: "未找到可靠的通用环肽单体证据。",
    oralEvidence: "未找到直接证据。",
    recommendation: "从通用单体库移到特殊天然产物残基/端基抑制剂区。",
    sources: [["RCSB PDB 1BCS / J Mol Biol", "https://www.rcsb.org/structure/1BCS", "chymostatin肽醛证据"]],
  },
  {
    ccdId: "UQ4", grade: "EXCLUDE", conclusion: "从氨基酸单体候选中排除",
    synthesisEvidence: "该分子是NBD-β-alanine荧光探针/标签，β-丙氨酸氨基已被NBD取代。",
    cyclicEvidence: "PDB命中来自人工细胞内丝状体等标记体系，不能证明它是普通内部残基。",
    oralEvidence: "无相关证据。",
    recommendation: "仅保留在荧光标签或成像探针专题，不纳入环肽单体库。",
    sources: [
      ["RCSB PDB 6X5I / Cell Reports Physical Science", "https://www.rcsb.org/structure/6X5I", "标记肽结构背景"],
      ["NBD-β-alanine identity", "https://adipogen.com/cdx-n0250-nbd-beta-alanine.html", "用途与身份核对"],
    ],
  },
  {
    ccdId: "ABU", grade: "A", conclusion: "保留为环肽间隔/骨架延长单元",
    synthesisEvidence: "GABA已有标准Fmoc固相肽合成和多肽类似物制备记录。",
    cyclicEvidence: "公开论文和专利均有GABA进入环肽/二硫键环肽的实例。",
    oralEvidence: "未找到直接口服证据。",
    recommendation: "适合间隔和环尺寸调节；柔性增加可能降低被动渗透，需配合其他刚化单元。",
    sources: [
      ["Microcin J25 cyclic derivative (2019)", "https://brieflands.com/journals/ijpr/articles/126167.pdf", "环肽直接证据"],
      ["US20200223889A1", "https://patents.google.com/patent/US20200223889A1/en", "环肽专利证据"],
    ],
  },
  {
    ccdId: "PUK", grade: "EXCLUDE", conclusion: "从单个氨基酸库排除，转入二肽等排体",
    synthesisEvidence: "PUK是Phe-还原键-Phe类型片段，代表两个残基之间的CH2NH肽键等排替换，不是一个普通氨基酸单体。",
    cyclicEvidence: "命中来自H256等线性蛋白酶抑制剂。",
    oralEvidence: "无直接证据。",
    recommendation: "可在肽键等排体/蛋白酶抑制剂构件库中保留，但不计入非天然氨基酸数量。",
    sources: [
      ["RCSB PDB 1GVX", "https://www.rcsb.org/structure/1GVX", "H256线性抑制剂结构"],
      ["Reduced-bond inhibitor comparison", "https://pmc.ncbi.nlm.nih.gov/articles/PMC3943106/", "Phe-reduced-bond-Phe身份"],
    ],
  },
];

const gradeLabels = { A: "A级：有直接环肽/宏环强证据", B: "B级：可进入肽，但缺少口服环肽直接证据", C: "C级：特殊片段，需限制用途", EXCLUDE: "排除：不是普通氨基酸单体" };
const records = reviews.map((review, index) => {
  const base = sourceByCcd.get(review.ccdId);
  if (!base) throw new Error(`CCD ${review.ccdId} not found in final manual-review data.`);
  return {
    batch: 1,
    batchPosition: index + 1,
    ccdId: review.ccdId,
    name: base.name,
    formula: base.formula,
    molecularWeight: base.molecularWeight,
    originalStatus: base.finalStatus,
    originalEvidenceStatus: base.evidenceStatus,
    grade: review.grade,
    gradeLabel: gradeLabels[review.grade],
    conclusion: review.conclusion,
    synthesisEvidence: review.synthesisEvidence,
    cyclicEvidence: review.cyclicEvidence,
    oralEvidence: review.oralEvidence,
    recommendation: review.recommendation,
    sourceCount: review.sources.length,
    sources: review.sources.map(([title, url, evidenceType]) => ({ title, url, evidenceType })),
    ccdUrl: base.ccdLinks,
    pdbExamples: base.exampleEntryIds,
  };
});

const gradeCounts = Object.fromEntries(Object.keys(gradeLabels).map((grade) => [grade, records.filter((record) => record.grade === grade).length]));
const payload = {
  metadata: {
    auditDate: "2026-08-28",
    batch: 1,
    count: records.length,
    selection: "92条优先深审队列中，先取6条网站已有人工证据，再按≤50残基PDB聚合实体命中数和结构评分选择14条。",
    gradeCounts,
    gradeDefinitions: gradeLabels,
    scope: "文献、专利与RCSB结构证据深审。A级不等于单个残基可独立带来口服性；口服结论只适用于被研究的完整环肽骨架。",
  },
  records,
};

const csvHeaders = ["批次", "序号", "CCD编号", "名称", "等级", "等级说明", "结论", "合成/单体证据", "环肽证据", "口服证据", "建议", "来源数", "来源", "CCD链接", "PDB示例"];
const quote = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csvRows = records.map((record) => [record.batch, record.batchPosition, record.ccdId, record.name, record.grade, record.gradeLabel, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, record.sourceCount, record.sources.map((item) => `${item.evidenceType}｜${item.title}｜${item.url}`).join("；"), record.ccdUrl, record.pdbExamples.join(" / ")]);

await writeFile(path.join(publicDir, "ccd-manual-review-batch-1.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(path.join(publicDir, "ccd-manual-review-batch-1.csv"), `\uFEFF${[csvHeaders, ...csvRows].map((row) => row.map(quote).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify(payload.metadata, null, 2));
