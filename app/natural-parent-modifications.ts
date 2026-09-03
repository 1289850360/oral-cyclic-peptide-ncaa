import { naturalParentReviewBatch50 } from "./natural-parent-review-batch-50";
import { naturalParentReviewBatch200 } from "./natural-parent-review-batch-200";
import { naturalParentReviewBatch500 } from "./natural-parent-review-batch-500";
import { naturalParentReviewBatchRemaining } from "./natural-parent-review-batch-remaining";
import { naturalParentPropertyReview50 } from "./natural-parent-property-review-50";
import { buildDefaultPropertyReview } from "./natural-parent-property-review-default";
import { naturalParentEvidenceUpgrades } from "./natural-parent-evidence-upgrades";
import { applyNaturalParentCorrection, naturalParentCorrectionByCcd } from "./natural-parent-corrections";
import substitutabilityJson from "../public/natural-parent-substitutability-audit.json";

export type NaturalParentModification = {
  reviewStatus?: "complete" | "second-pass-complete" | "semantic-resolved" | "complex-transformation-resolved" | "reviewed-unresolved";
  naturalParent: string;
  naturalParentCcd: string;
  relationship: string;
  changeLabel: string;
  changedPosition: string;
  structuralChange: string;
  directlyCausedProperties: string[];
  peptideExperiment: {
    conclusion: string;
    measurement: string;
    attributionBoundary: string;
    confidence: "直接对照" | "同骨架替换" | "完整肽支持" | "结构推断";
  };
  propertyReview?: {
    status: "具体残基证据" | "同骨架证据" | "完整肽证据" | "同类修饰参考" | "结构规则建议";
    plainMeaning: string;
    preferredPositions: string;
    positionsToAvoid: string;
    evidenceSummary: string;
    boundary: string;
    sources: Array<{ title: string; url: string }>;
  };
  sources: Array<{ title: string; url: string; supports: string }>;
};

// Pilot record for reviewing the natural-parent presentation before the model
// is expanded across the full noncanonical-amino-acid catalog.
const naturalParentModificationBaseByCcd: Record<string, NaturalParentModification> = {
  ...naturalParentReviewBatch50,
  ...naturalParentReviewBatch200,
  ...naturalParentReviewBatch500,
  ...naturalParentReviewBatchRemaining,
  "03Y": {
    naturalParent: "L-半胱氨酸（L-cysteine）",
    naturalParentCcd: "CYS",
    relationship: "CCD将03Y明确关联到CYS母体；这里表示结构由半胱氨酸骨架衍生，不表示生产时一定以天然半胱氨酸为原料。",
    changeLabel: "α位增加甲基\nCα—H → Cα—CH₃",
    changedPosition: "α-碳原子（同时连接氨基、羧基和含硫侧链的中心碳）",
    structuralChange: "把L-半胱氨酸α-碳上的一个氢换成甲基（—CH₃），形成α-甲基-L-半胱氨酸；巯基侧链保持不变，分子式净增加CH₂，分子量约增加14.03 Da。",
    directlyCausedProperties: [
      "α-碳不再带氢并成为四取代中心，局部位阻增大，肽链主链构象自由度下降。",
      "巯基仍然保留，因此仍可参与含硫化学；α-甲基带来的邻近位阻会改变酰胺与硫之间的酰基转移反应性。",
      "这些结构变化不能直接证明渗透性、溶解度或口服吸收改善；当前直接证据主要是肽合成和蛋白连接反应。",
    ],
    peptideExperiment: {
      conclusion: "α-甲基-L-半胱氨酸可进入Fmoc合成肽，并可在肽C端充当原位硫酯前体以促进蛋白连接。",
      measurement: "论文报告α-甲基半胱氨酸肽在连接条件下快速、干净地生成产物；普通半胱氨酸对照24小时后仅形成少量产物，而α-甲基半胱氨酸体系约10分钟即可达到相当程度。",
      attributionBoundary: "该证据证明的是C端连接反应性和合成兼容性，不证明该残基能够提高膜渗透性、稳定性或口服生物利用度。",
      confidence: "直接对照",
    },
    sources: [
      { title: "RCSB CCD 03Y · 2-methyl-L-cysteine", url: "https://www.rcsb.org/ligand/03Y", supports: "确认名称、结构、L-肽连接类型及CYS母体关系" },
      { title: "RCSB CCD CYS · L-cysteine", url: "https://www.rcsb.org/ligand/CYS", supports: "确认天然半胱氨酸母体结构" },
      { title: "Macmillan et al., Chemical Science, 2014", url: "https://doi.org/10.1039/C3SC52140K", supports: "Fmoc合成兼容性、α-甲基半胱氨酸与普通半胱氨酸连接反应的直接对照" },
    ],
  },
  MLE: {
    naturalParent: "L-亮氨酸（L-leucine）",
    naturalParentCcd: "LEU",
    relationship: "明确的结构母体关系；这里表示结构由亮氨酸骨架衍生，不表示生产时一定以天然亮氨酸为原料。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把亮氨酸氨基氮上的一个氢换成一个甲基（—CH₃）；亮氨酸的异丁基侧链和L-构型保持不变。",
    directlyCausedProperties: [
      "少一个主链N—H，因此少一个氢键供体，暴露极性和跨膜前的去溶剂化负担可能降低。",
      "多出的甲基增加局部位阻并改变酰胺键的顺反倾向及肽链折叠；实际结果高度依赖替换位置。",
      "疏水表面略有增加，但不能只凭这一点断言水溶性、渗透性或口服吸收一定改善。",
    ],
    peptideExperiment: {
      conclusion: "N-甲基-L-亮氨酸能够存在于具有较高被动渗透性的环肽骨架中。",
      measurement: "代表性环六肽的RRCK Papp为13.0 × 10⁻⁶ cm/s。",
      attributionBoundary: "该环六肽还含N-Me-D-Leu、N-Me-Tyr、D-Pro等改造，没有只改变Leu→N-Me-Leu的单点母体对照，因此不能把13.0全部归因于这一处N-甲基化。",
      confidence: "完整肽支持",
    },
    sources: [
      { title: "RCSB CCD MLE · N-methyl-L-leucine", url: "https://www.rcsb.org/ligand/MLE", supports: "确认非天然氨基酸的名称、结构与立体化学" },
      { title: "RCSB CCD LEU · L-leucine", url: "https://www.rcsb.org/ligand/LEU", supports: "确认天然亮氨酸母体结构" },
      { title: "Goetz et al., ACS Med. Chem. Lett. 2014", url: "https://pubmed.ncbi.nlm.nih.gov/25313332/", supports: "支持环肽暴露极性、N-甲基化与RRCK渗透性数据；不是单残基因果对照" },
    ],
  },
  IML: {
    naturalParent: "L-异亮氨酸（L-isoleucine）",
    naturalParentCcd: "ILE",
    relationship: "CCD给出的天然母体为ILE；这里表示保留了L-异亮氨酸骨架，不表示生产时一定直接以天然异亮氨酸为原料。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把L-异亮氨酸氨基氮上的一个氢换成甲基（—CH₃）；支链仲丁基和L-构型保持不变。与天然母体相比，分子式净增加CH₂，分子量约增加14.02 Da。",
    directlyCausedProperties: [
      "少一个主链N—H，因此少一个氢键供体；计算结构描述符显示极性表面积下降约13.99 Å²。",
      "增加一个甲基和局部位阻，可改变酰胺顺反倾向及环肽折叠；结果取决于它放在肽链的哪个位置。",
      "仅凭单体结构不能断言渗透性一定提高；需要同一肽骨架的实验对照。",
    ],
    peptideExperiment: {
      conclusion: "N-甲基-L-异亮氨酸可替代同一环六肽位置上的N-甲基-L-亮氨酸，并保持较高的被动渗透性。",
      measurement: "Goetz等人的同骨架系列中，N-Me-Ile类似物的RRCK Papp为8.9 × 10⁻⁶ cm/s；对应N-Me-Leu类似物为13.0 × 10⁻⁶ cm/s。",
      attributionBoundary: "这是N-Me-Leu→N-Me-Ile的同骨架侧链替换，不是天然Ile→N-Me-Ile的单点对照，因此能证明IML适用于高渗透环肽骨架，但不能单独算出N-甲基化带来的增量。",
      confidence: "同骨架替换",
    },
    sources: [
      { title: "RCSB CCD IML · N-methyl-L-isoleucine", url: "https://www.rcsb.org/ligand/IML", supports: "确认衍生物名称、结构与ILE母体关系" },
      { title: "RCSB CCD ILE · L-isoleucine", url: "https://www.rcsb.org/ligand/ILE", supports: "确认天然异亮氨酸母体结构" },
      { title: "Goetz et al., ACS Med. Chem. Lett. 2014", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/", supports: "同一环六肽系列的EPSA与RRCK被动渗透性实验" },
    ],
  },
  MAA: {
    naturalParent: "L-丙氨酸（L-alanine）",
    naturalParentCcd: "ALA",
    relationship: "CCD给出的天然母体为ALA；衍生物保留L-丙氨酸的碳骨架与立体化学。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把L-丙氨酸氨基氮上的一个氢换成甲基（—CH₃）；丙氨酸侧链甲基和L-构型保持不变。分子式净增加CH₂，分子量约增加14.02 Da。",
    directlyCausedProperties: [
      "少一个主链氢键供体，增加局部位阻，并可能使肽链采用不同折叠。",
      "因为丙氨酸侧链很小，N-甲基化可在侧链体积变化较小的情况下调节主链极性。",
      "实验显示效果强烈依赖甲基化位置：不能把N-Me-Ala写成必然增渗。",
    ],
    peptideExperiment: {
      conclusion: "N-Me-Ala在环六肽中可以产生高渗透骨架，但放置位置比甲基数量本身更重要。",
      measurement: "Ovadia等人合成54个含1–5个N-甲基位点的聚丙氨酸环六肽；多数Papp低于1 × 10⁻⁶ cm/s，但10个类似物高于1 × 10⁻⁵ cm/s，且9/10的高渗透分子在D-Ala邻位带N-甲基。",
      attributionBoundary: "这是一组位置和数量同时变化的环肽对照，不是只比较一处Ala→N-Me-Ala；它证明可行性和位置依赖性，不能给每个具体位点一个固定增幅。",
      confidence: "同骨架替换",
    },
    sources: [
      { title: "RCSB CCD MAA · N-methyl-L-alanine", url: "https://www.rcsb.org/ligand/MAA", supports: "确认衍生物结构及ALA母体关系" },
      { title: "RCSB CCD ALA · L-alanine", url: "https://www.rcsb.org/ligand/ALA", supports: "确认天然丙氨酸母体结构" },
      { title: "Ovadia et al., Molecular Pharmaceutics, 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21375270/", supports: "54个聚丙氨酸环六肽的N-甲基位置、数量与Caco-2渗透性实验" },
    ],
  },
  YNM: {
    naturalParent: "L-酪氨酸（L-tyrosine）",
    naturalParentCcd: "TYR",
    relationship: "CCD给出的天然母体为TYR；酚羟基、芳香侧链和L-构型均被保留。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把L-酪氨酸氨基氮上的一个氢换成甲基（—CH₃）；侧链芳环和酚羟基不变。分子式净增加CH₂，分子量约增加14.02 Da。",
    directlyCausedProperties: [
      "主链少一个氢键供体，但侧链酚羟基仍能形成氢键。",
      "甲基增加局部位阻并影响环肽折叠；芳香侧链仍可参与疏水和π相互作用。",
      "是否改善渗透性取决于整条肽能否把剩余极性基团藏起来。",
    ],
    peptideExperiment: {
      conclusion: "N-Me-Tyr可进入可测被动渗透性的环肽，也存在于具有大鼠口服暴露的环六肽中。",
      measurement: "Goetz同骨架系列的N-Me-Tyr类似物EPSA为100、RRCK Papp为1.3 × 10⁻⁶ cm/s；White等人的三N-甲基环六肽在大鼠中的口服生物利用度为28%。",
      attributionBoundary: "RRCK结果是与其他N-甲基侧链的同骨架替换；28%是含多个改造的完整肽结果。两者都不能证明单独把天然Tyr换成N-Me-Tyr就会得到相同改善。",
      confidence: "同骨架替换",
    },
    sources: [
      { title: "RCSB CCD YNM · N-methyl-L-tyrosine", url: "https://www.rcsb.org/ligand/YNM", supports: "确认衍生物结构及TYR母体关系" },
      { title: "RCSB CCD TYR · L-tyrosine", url: "https://www.rcsb.org/ligand/TYR", supports: "确认天然酪氨酸母体结构" },
      { title: "Goetz et al., ACS Med. Chem. Lett. 2014", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/", supports: "同一环六肽系列的EPSA与RRCK实验" },
      { title: "White et al., Nature Chemical Biology, 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21946276/", supports: "含N-Me-Tyr的完整环六肽大鼠口服生物利用度；非单残基归因" },
    ],
  },
  MEA: {
    naturalParent: "L-苯丙氨酸（L-phenylalanine）",
    naturalParentCcd: "PHE",
    relationship: "CCD给出的天然母体为PHE；苄基侧链和L-构型保持不变。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把L-苯丙氨酸氨基氮上的一个氢换成甲基（—CH₃）；芳香侧链不变。分子式净增加CH₂，分子量约增加14.02 Da。",
    directlyCausedProperties: [
      "少一个主链氢键供体，疏水表面略增，并会改变酰胺顺反倾向。",
      "芳环仍可参与疏水和π相互作用，因此这种改造常用于保留芳香结合位点同时调整主链。",
      "当前证据证明它能用于环肽和口服候选骨架，但缺少Phe→N-Me-Phe单点性质对照。",
    ],
    peptideExperiment: {
      conclusion: "N-Me-Phe可进入具有肠渗透性和口服暴露的生长抑素环六肽骨架。",
      measurement: "Biron等人对环六肽进行N-甲基扫描，合适的三N-甲基组合获得约10%的口服生物利用度；该骨架同时含N-Me-D-Trp、N-Me-Lys和N-Me-Phe。",
      attributionBoundary: "这是多个N-甲基位点共同变化的完整肽结果，没有只改变Phe→N-Me-Phe的配对实验，不能把约10%的口服暴露归因于MEA一处。",
      confidence: "完整肽支持",
    },
    sources: [
      { title: "RCSB CCD MEA · N-methyl-L-phenylalanine", url: "https://www.rcsb.org/ligand/MEA", supports: "确认衍生物结构及PHE母体关系" },
      { title: "RCSB CCD PHE · L-phenylalanine", url: "https://www.rcsb.org/ligand/PHE", supports: "确认天然苯丙氨酸母体结构" },
      { title: "Biron et al., Angewandte Chemie Int. Ed. 2008", url: "https://pubmed.ncbi.nlm.nih.gov/18297660/", supports: "N-甲基扫描环六肽的渗透、稳定性和大鼠口服暴露；非单残基归因" },
      { title: "RCSB PDB 1H0I · argifin", url: "https://www.rcsb.org/structure/1H0I", supports: "确认N-Me-Phe存在于天然环五肽结构中；不提供口服性质" },
    ],
  },
  MVA: {
    naturalParent: "L-缬氨酸（L-valine）",
    naturalParentCcd: "VAL",
    relationship: "CCD给出的天然母体为VAL；异丙基侧链和L-构型保持不变。",
    changeLabel: "氮上增加甲基\nN—H → N—CH₃",
    changedPosition: "α-氨基的氮原子（进入肽链后对应主链酰胺氮）",
    structuralChange: "把L-缬氨酸氨基氮上的一个氢换成甲基（—CH₃）；异丙基侧链不变。分子式净增加CH₂，分子量约增加14.02 Da。",
    directlyCausedProperties: [
      "少一个主链氢键供体，局部疏水性和位阻略增。",
      "可改变肽键顺反平衡和宏环折叠，实际性质由它与其他残基共同决定。",
      "环孢素的口服性只能证明这种残基与成功口服骨架相容，不能证明MVA单独造成口服吸收。",
    ],
    peptideExperiment: {
      conclusion: "N-Me-Val存在于经典口服环肽环孢素A中，也存在于actinomycin类环状depsipeptide中。",
      measurement: "人体研究报告环孢素A平均口服生物利用度约20.8%；环孢素同时含多个N-甲基残基并具有特殊的溶剂依赖折叠。",
      attributionBoundary: "没有VAL→MVA单点配对的临床实验。20.8%属于完整环孢素分子，不能作为MVA自身的口服生物利用度。",
      confidence: "完整肽支持",
    },
    sources: [
      { title: "RCSB CCD MVA · N-methyl-L-valine", url: "https://www.rcsb.org/ligand/MVA", supports: "确认衍生物结构及VAL母体关系" },
      { title: "RCSB CCD VAL · L-valine", url: "https://www.rcsb.org/ligand/VAL", supports: "确认天然缬氨酸母体结构" },
      { title: "Loosli et al., Helvetica Chimica Acta, 1985", url: "https://doi.org/10.1002/hlca.19850680319", supports: "环孢素A结构与N-甲基残基环境" },
      { title: "Gupta & Benet, 1989", url: "https://pubmed.ncbi.nlm.nih.gov/2611359/", supports: "环孢素A人体口服生物利用度；属于完整分子证据" },
      { title: "RCSB PDB 1A7Y · actinomycin D", url: "https://www.rcsb.org/structure/1A7Y", supports: "确认N-Me-Val存在于环状depsipeptide中；不提供单残基性质归因" },
    ],
  },
};

const deltaPhrase = (rawValue: string, unit = "") => {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return "方向未计算";
  if (value > 0) return `增加${Number(value.toFixed(3))}${unit}`;
  if (value < 0) return `降低${Number(Math.abs(value).toFixed(3))}${unit}`;
  return "无变化";
};

const directionFromDelta = (value: number) => value > 0 ? "增强" : value < 0 ? "降低" : "无变化";

const descriptorDelta = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
};

const clarifyDescriptorWording = (text: string) => text
  .replace(/精确分子量([+-]?\d+(?:\.\d+)?)\s*Da/g, (_, value: string) => `精确分子量${deltaPhrase(value, " Da")}`)
  .replace(/氢键供体([+-]?\d+(?:\.\d+)?)/g, (_, value: string) => `氢键供体数量${deltaPhrase(value, "个")}`)
  .replace(/氢键受体([+-]?\d+(?:\.\d+)?)/g, (_, value: string) => `氢键受体数量${deltaPhrase(value, "个")}`)
  .replace(/(?:拓扑)?极性表面积([+-]?\d+(?:\.\d+)?)\s*Å²/g, (_, value: string) => `拓扑极性表面积${deltaPhrase(value, " Å²")}`)
  .replace(/(?:计算)?脂水分配系数([+-]?\d+(?:\.\d+)?)/g, (_, value: string) => `计算脂水分配系数${deltaPhrase(value)}`)
  .replace(/可旋转键([+-]?\d+(?:\.\d+)?)/g, (_, value: string) => `可旋转键数量${deltaPhrase(value, "个")}`)
  .replace(/环数([+-]?\d+(?:\.\d+)?)/g, (_, value: string) => `环结构数量${deltaPhrase(value, "个")}`);

type SubstitutabilityAuditRecord = {
  ccdId: string;
  category: "direct-substitutable-residue" | "conditional-specialized-residue" | "backbone-terminally-modified" | "complex-skeletal-transformation" | "special-adduct-or-label";
};

const substitutabilityByCcd = new Map(
  (substitutabilityJson.records as SubstitutabilityAuditRecord[]).map((record) => [record.ccdId, record]),
);

function withStructuralSafetyBoundary(ccdId: string, record: NaturalParentModification): NaturalParentModification {
  const category = substitutabilityByCcd.get(ccdId)?.category;
  if (category !== "complex-skeletal-transformation") return record;
  return {
    ...record,
    reviewStatus: "complex-transformation-resolved",
    relationship: `${record.relationship} 结构审计将它归为复杂骨架重构：这里的天然母体只表示CCD的结构关联，不表示能由该母体经过一次普通单点修饰直接得到。`,
    changeLabel: "复杂骨架重构（不是单点修饰）",
    changedPosition: "涉及多个原子和键的整体变化，不能可靠归为肽链上的一个替换原子",
    structuralChange: `${record.structuralChange} 以上只是在比较两个结构的差异，不是合成反应路线，也不能据此声称存在唯一的改造步骤。`,
    directlyCausedProperties: [
      "这条记录不能把整体描述符变化归因于一个修饰位点；若要使用，应把完整特殊构件单独做合成和性质实验。",
      ...record.directlyCausedProperties,
    ],
  };
}

function withDirectionalPropertyWording(record: NaturalParentModification): NaturalParentModification {
  const descriptorText = `${record.structuralChange} ${record.directlyCausedProperties.join(" ")}`;
  const hbd = descriptorDelta(descriptorText, /氢键供体([+-]?\d+(?:\.\d+)?)/);
  const hba = descriptorDelta(descriptorText, /氢键受体([+-]?\d+(?:\.\d+)?)/);
  const tpsa = descriptorDelta(descriptorText, /(?:拓扑)?极性表面积([+-]?\d+(?:\.\d+)?)/);
  const logP = descriptorDelta(descriptorText, /(?:计算)?脂水分配系数([+-]?\d+(?:\.\d+)?)/);
  const rotatable = descriptorDelta(descriptorText, /可旋转键([+-]?\d+(?:\.\d+)?)/);
  const rings = descriptorDelta(descriptorText, /环数([+-]?\d+(?:\.\d+)?)/);
  const directionalLines: string[] = [];

  if (hbd !== null) directionalLines.push(`氢键供体能力：${directionFromDelta(hbd)}（供体数量${deltaPhrase(String(hbd), "个")}；结构计算）`);
  if (hba !== null) directionalLines.push(`氢键受体能力：${directionFromDelta(hba)}（受体数量${deltaPhrase(String(hba), "个")}；结构计算）`);
  if (tpsa !== null) directionalLines.push(`极性指标：${directionFromDelta(tpsa)}（拓扑极性表面积${deltaPhrase(String(tpsa), " Å²")}；结构计算）`);
  if (logP !== null) directionalLines.push(`脂溶性指标：${directionFromDelta(logP)}（计算logP${deltaPhrase(String(logP))}；结构计算）`);
  if (rotatable !== null) directionalLines.push(`分子柔性：${directionFromDelta(rotatable)}（可旋转键数量${deltaPhrase(String(rotatable), "个")}；结构计算）`);
  if (rings !== null) directionalLines.push(`成环约束：${directionFromDelta(rings)}（环结构数量${deltaPhrase(String(rings), "个")}；结构计算）`);

  const nonDescriptorLines = record.directlyCausedProperties
    .filter((line) => !line.startsWith("结构直接变化：") && !line.startsWith("计算趋势："))
    .map((line) => line.startsWith("尚无单残基性质对照")
      ? "溶解度、渗透性、稳定性和口服吸收：方向不确定（尚无天然母体与该残基的同骨架单点对照实验）。"
      : clarifyDescriptorWording(line));

  if (record.peptideExperiment.confidence === "结构推断" && !nonDescriptorLines.some((line) => line.includes("方向不确定"))) {
    nonDescriptorLines.push("溶解度、渗透性、稳定性和口服吸收：方向不确定（目前只有结构计算，没有直接性质实验）。");
  } else if (record.peptideExperiment.confidence === "直接对照") {
    nonDescriptorLines.push(`实验比较方向（直接对照）：${record.peptideExperiment.conclusion}`);
  } else if (record.peptideExperiment.confidence === "同骨架替换") {
    nonDescriptorLines.push(`实验比较方向（仅限论文中的同骨架条件）：${record.peptideExperiment.conclusion}`);
  } else if (record.peptideExperiment.confidence === "完整肽支持") {
    nonDescriptorLines.push(`完整肽观察（不能当作该残基单独造成的增强或降低）：${record.peptideExperiment.conclusion}`);
  }

  return {
    ...record,
    structuralChange: clarifyDescriptorWording(record.structuralChange),
    directlyCausedProperties: directionalLines.length > 0 ? [...directionalLines, ...nonDescriptorLines] : nonDescriptorLines.length > 0 ? nonDescriptorLines : record.directlyCausedProperties,
  };
}

export const naturalParentModificationByCcd: Record<string, NaturalParentModification> = Object.fromEntries(
  Object.entries(naturalParentModificationBaseByCcd).map(([ccdId, record]) => {
    const parentCorrection = naturalParentCorrectionByCcd[ccdId];
    const correctedRecord = parentCorrection ? applyNaturalParentCorrection(record, parentCorrection) : record;
    const evidenceUpgrade = naturalParentEvidenceUpgrades[ccdId];
    const evidenceAlignedRecord: NaturalParentModification = evidenceUpgrade
      ? {
          ...correctedRecord,
          peptideExperiment: evidenceUpgrade.peptideExperiment,
          sources: [...correctedRecord.sources, ...evidenceUpgrade.sources],
        }
      : correctedRecord;
    const upgradedRecord = withStructuralSafetyBoundary(ccdId, evidenceAlignedRecord);
    return [
      ccdId,
      withDirectionalPropertyWording({
        ...upgradedRecord,
        propertyReview: evidenceUpgrade?.propertyReview ?? naturalParentPropertyReview50[ccdId] ?? buildDefaultPropertyReview(upgradedRecord),
      }),
    ];
  }),
);
