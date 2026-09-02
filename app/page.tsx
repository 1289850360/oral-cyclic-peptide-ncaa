"use client";

import { useEffect, useMemo, useState } from "react";
import { groups, type EvidenceLevel, type Residue } from "./residue-data";
import { experimentData, getDesignGuide, patentTierByEnglish, patentTierMeta, supportScope } from "./v22-data";
import { ccdEntryUrl, ccdImageUrl, getStructures, structureNotesByEnglish } from "./structure-data";
import { propertyEvidenceMasterRecords, type MasterRecord } from "./master-records";
import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";
import Link from "next/link";
import { deepReviewRecords } from "./deep-review-data";
import { allUnifiedRecords, reviewOnlyRecords } from "./unified-records";

type DatabaseRecord = MasterRecord;
type Insight = { takeaway: string; caution: string };
type PortalView = "home" | "evidence" | "about";
type HomeSearchTarget = "catalog" | "ncaa" | "evidence";
type EvidenceCollection = "all" | "ncaa" | "special";
type CcdIdentityPayload = { records: Array<{ primaryCcdId: string; ccdIds: string[]; componentClass: { id: string } }> };

const reviewGradeMeta = {
  A: { label: "环肽直接使用", category: "环肽应用记录", description: "有直接环肽或宏环使用证据。" },
  B: { label: "肽中使用", category: "肽中使用候选", description: "确认进入过肽，但尚无直接环肽证据。" },
  C: { label: "特殊构件", category: "特殊构件", description: "只适合连接、末端修饰或其他受限情境。" },
  EXCLUDE: { label: "不可作为独立单体", category: "排除记录", description: "深审后确认不应作为普通氨基酸单体使用。" },
} as const;

type UnifiedEvidenceTier = "direct-effect" | "whole-molecule" | "use-confirmed" | "design-lead" | "excluded";

const unifiedEvidenceMeta: Record<UnifiedEvidenceTier, { number: string; label: string; shortLabel: string; description: string }> = {
  "direct-effect": { number: "1级", label: "直接效果证据", shortLabel: "直接效果", description: "有同骨架对照、单点替换或明确骨架改造实验，能够比较该改造对性质的影响。" },
  "whole-molecule": { number: "2级", label: "完整分子证据", shortLabel: "完整分子", description: "该结构存在于有渗透性、口服暴露或临床资料的完整环肽中，但效果不能归因于单个残基。" },
  "use-confirmed": { number: "3级", label: "已确认实际使用", shortLabel: "实际使用", description: "论文、PDB或人工审核确认它进入过肽或环肽，但没有足够的性质对照实验。" },
  "design-lead": { number: "4级", label: "设计线索", shortLabel: "设计线索", description: "来自专利、特殊构件或有限资料，可用于提出候选，尚不能证明实际效果。" },
  excluded: { number: "排除", label: "非独立单体", shortLabel: "非独立单体", description: "有资料可追溯，但不是可按普通氨基酸理解的独立单体，不纳入常规残基候选。" },
};

const masterEvidenceTier = (level: EvidenceLevel): UnifiedEvidenceTier => level === "直接证据" || level === "改造证据" ? "direct-effect" : level === "骨架证据" || level === "临床骨架" ? "whole-molecule" : level === "实际使用证据" ? "use-confirmed" : "design-lead";
const reviewEvidenceTier = (grade: keyof typeof reviewGradeMeta): UnifiedEvidenceTier => grade === "A" || grade === "B" ? "use-confirmed" : grade === "C" ? "design-lead" : "excluded";
const evidenceTierForItem = (item: (typeof allUnifiedRecords)[number]): UnifiedEvidenceTier => {
  if (item.kind === "review") return reviewEvidenceTier(item.record.grade);
  const baseTier = masterEvidenceTier(item.record.level);
  if (!item.review || baseTier === "direct-effect" || baseTier === "whole-molecule") return baseTier;
  return reviewEvidenceTier(item.review.grade);
};
const propertyEvidenceMasterIds = new Set(propertyEvidenceMasterRecords.map((record) => record.id));
const propertyEvidenceRecords = allUnifiedRecords.filter((item) => item.kind === "master" && propertyEvidenceMasterIds.has(item.record.id));

const insights: Record<string, Insight> = {
  "N-Me-D-Leu": { takeaway: "适合在疏水位优先扫描：它把D-构型和N-甲基化放在同一个残基上，常用于同时处理渗透性与抗酶解性。", caution: "现有28%口服生物利用度来自完整环六肽，不能把全部改善归因于这一处残基。" },
  "N-Me-Leu": { takeaway: "如果目标是减少主链极性，同时保留亮氨酸的疏水接触，N-Me-Leu通常是最直接的起始候选。", caution: "优先放在不依赖主链NH参与靶点结合的位置；错误位置的N-甲基化可能破坏活性构象。" },
  "N-Me-Ile": { takeaway: "与N-Me-Leu相近，但支链几何不同，适合用于疏水口袋和局部构象的配对扫描。", caution: "它能支持高渗透骨架，但并不保证在所有序列中都优于N-Me-Leu。" },
  "N-Me-Ala / D-N-Me-Ala": { takeaway: "适合希望屏蔽一个主链NH、又不想明显增加分子脂溶性和侧链体积的设计。", caution: "小侧链可能重排整个大环构象，替换时需要同步观察活性、溶解度和构象。" },
  "N-Me-Thr": { takeaway: "它保留羟基带来的亲水性，同时减少一个主链供氢位点，常用于寻找溶解度与渗透性的折中。", caution: "侧链羟基仍会增加极性，因此它通常不是追求最大膜分配时的首选。" },
  "N-Me-Ser": { takeaway: "适合希望保留小型羟基侧链、同时屏蔽一个主链NH的位置；它更偏向溶解度与中等渗透性的折中。", caution: "同骨架 Papp 只有 N-Me-Thr 的约三分之一，不应把所有含羟基的 N-甲基残基视为等效。" },
  "N-Me-Asp": { takeaway: "更适合作为酸性、增溶或极性边界对照，而不是作为常规增渗残基。", caution: "酸性侧链电离后会显著增加去溶剂化代价；同骨架直接数据提示被动渗透性较低。" },
  "N-Me-Tyr": { takeaway: "芳环可提供疏水锚点，酚羟基又保留一定结合能力，适合芳香位点的渗透性优化。", caution: "同骨架单点数据可支持其具有可测渗透性，但数值低于N-Me-Leu、N-Me-Ile等疏水候选，仍需按位置比较。" },
  "N-Me-D-Trp": { takeaway: "适合需要反向转角和芳香疏水锚点的位置，可同时降低主链供氢能力并增强抗酶解性。", caution: "吲哚NH仍是氢键供体，而且体积较大，可能造成溶解度或靶点空间冲突。" },
  "N-Me-Lys": { takeaway: "更适合必须保留碱性侧链或衍生化把手的位点，而不是作为普适增渗残基使用。", caution: "若赖氨酸侧链正电荷暴露，水溶性会提高，但被动膜渗透性往往受到不利影响。" },
  "N-Me-Phe": { takeaway: "适合芳香疏水位：可以增加膜分配、减少主链极性，并保留π相互作用能力。", caution: "连续引入多个芳香疏水残基可能降低水溶性，需要与极性位点或构象遮蔽策略配合。" },
  "N-Me-Val": { takeaway: "侧链比亮氨酸更紧凑，可在空间受限的疏水核心或转角邻位尝试N-甲基化。", caution: "它在环孢素中的存在证明了兼容性，但没有证明单独替换就能提高口服吸收。" },
  "Sarcosine · Sar · N-Me-Gly": { takeaway: "更像一个转角与酰胺构象调节器：不靠增加疏水侧链，而是通过去除主链NH改变折叠。", caution: "无侧链手性中心可能增加cis/trans异构和构象异质性，需要NMR或构象计算辅助判断。" },
  "D-Pro": { takeaway: "是经典的转角控制单元，适合在β-turn位置减少构象自由度并提高蛋白酶稳定性。", caution: "它对渗透性的帮助主要来自整体折叠和极性遮蔽，不是简单的疏水性增加。" },
  "D-Ala": { takeaway: "体积小、构型反转明显，适合在不增加侧链负担的情况下重塑转角和蛋白酶识别。", caution: "高渗透实例通常还依赖邻位N-甲基化，因此不应把D-Ala视为独立增渗开关。" },
  "D-Val": { takeaway: "适合同时需要疏水支链和D-构型转角控制的位置，可与D-Pro或N-Me-D-Leu组合扫描。", caution: "现有证据主要来自组合骨架及专利，单点替换的因果证据仍有限。" },
  "D-Leu": { takeaway: "可在保持亮氨酸疏水体积的同时反转侧链朝向，适合做构象和抗酶解位置扫描。", caution: "直接实验只显示适度渗透性改善，效果主要取决于替换位置和整体折叠。" },
  "D-Ile": { takeaway: "适合在疏水位保留异亮氨酸体积、同时用 D-构型重排转角和增强抗酶解性。", caution: "目前证据来自完整膜穿透序列，不能据此认定 D-Ile 比 L-Ile 更易透膜。" },
  "D-Phe": { takeaway: "适合芳香位的立体化学扫描：保留疏水和 π 相互作用，同时改变芳环朝向与蛋白酶识别。", caution: "由L-Phe改为D-Phe不会增加芳香面积；专利也没有提供该构型变化的单点渗透性因果对照。" },
  "Aib · α-aminoisobutyric acid": { takeaway: "对于仍较柔性的环肽，Aib值得优先尝试；它可促进预组织和分子内氢键，而不必大量增脂。", caution: "已经高度预组织的骨架可能没有收益，甚至因构象被过度固定而损失活性。" },
  "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid": { takeaway: "当渗透性、溶解度和代谢稳定性需要一起优化时，statine提供了少见的多性质平衡机会。", caution: "它会延长主链并引入羟基，可能明显改变靶点结合几何，不适合仅按侧链等排替换理解。" },
  "β-homoproline · β-HPro": { takeaway: "适合小环肽的转角位，可在保留脯氨酸式约束的同时改变环尺寸和局部结合几何。", caution: "18.4%口服生物利用度属于优化后完整分子结果，仍需对具体替换位点进行对照。" },
  "(1R,2S)-2-ACPC · β¹": { takeaway: "主要价值是刚化β-骨架并显著增强血清稳定性，适合稳定性优先的宏环设计。", caution: "当前研究没有直接证明它能提高肠道被动渗透或口服生物利用度。" },
  "(1S,2S)-2-ACHC · β²": { takeaway: "六元环提供更强的疏水体积和转角约束，可用于稳定局部β折叠或γ-turn。", caution: "渗透性和口服吸收仍属于待验证性质，目前更适合作为构象与稳定性模块。" },
  "NLeu peptoid · N-isobutylglycine": { takeaway: "它模拟亮氨酸疏水侧链，却把侧链移到酰胺氮上，是减少骨架NH并扩展化学空间的实用方案。", caution: "peptoid的局部构象与普通α-氨基酸不同，立体异构和放置位置仍会显著影响渗透性。" },
  "Pye · N,N-pyrrolidinylglutamine": { takeaway: "适合不想继续增加脂溶性时使用：Pye可通过侧链—主链氢键同时改善水溶性和膜渗透。", caution: "作用依赖侧链能否准确接近暴露的骨架NH，因此位置和大环构象比残基数量更重要。" },
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": { takeaway: "可把它与Pro和trans-(2S,4R)-4-F-Pro成组扫描，用氟的立体电子效应微调环折叠及前一肽键平衡。", caution: "专利证明了(2S,4S)异构体被实际合成使用，但没有证明它单独提高膜渗透或口服暴露。" },
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": { takeaway: "适合同时需要芳香结合面和侧链桥连把手的位置，完成交联后更有可能体现构象优势。", caution: "未交联的伯胺容易质子化，会增加去溶剂化代价并降低被动扩散。" },
  "Aze · azetidine-2-carboxylic acid": { takeaway: "是 Pro 的小环替代物，适合在空间紧凑的转角位比较不同环尺寸带来的构象变化。", caution: "目前属于专利候选位点，公开资料没有给出 Aze 的独立渗透性或口服药代数据。" },
  "Nva · norvaline": { takeaway: "适合作为 Val、Leu 的直链侧链对照，在不大幅增加体积时微调疏水堆积。", caution: "它不屏蔽主链NH；专利入选主要支持化学空间，而不是普适增渗结论。" },
  "Tle / Tbg · tert-leucine / tert-butylglycine": { takeaway: "适合需要大位阻、疏水占位和代谢屏蔽的位置，常与 Val、Ile、Leu 做小型系列。", caution: "叔丁基会明显推高疏水性，可能带来溶解度下降和非特异结合。" },
  "Cha · cyclohexylalanine": { takeaway: "适合较大的疏水口袋或需要扩大非芳香疏水表面的位点。", caution: "Cha 很容易把分子推向过度疏水；应同步测溶解度、血浆蛋白结合和聚集倾向。" },
  "Pal · pyridylalanine": { takeaway: "可用来替代部分 Phe 位点：保留芳香表面，同时增加一个可用于结合或调节溶解度的杂环氮。", caution: "论文支持它存在于活性且可渗透的候选骨架中，但没有拆分出 Pal 对口服暴露的单独贡献。" },
  "O-Me-Tyr · O-methyl-L-tyrosine": { takeaway: "适合需要保留芳香侧链、但希望去掉酚羟基供氢能力的位置。", caution: "当前最强证据来自 enlicitide 完整临床骨架；增渗作用不能与多重交联及口服制剂分开解释。" },
  "N-substituted 5-F-Trp": { takeaway: "enlicitide中的构件同时利用5-氟取代、吲哚N-取代和交联，兼顾芳香锚定与构象固定。", caution: "公开证据没有拆分氟化、N-取代和交联的各自贡献，不能简化成‘5-F-Trp必然增渗’。" },
  "2-Me-Pro · 2-methyl-L-proline": { takeaway: "是较强的转角锁定单元，适合希望同时去除主链供氢并进一步压缩构象空间的位置。", caution: "约束过强可能把骨架锁在非活性构象；应与 Pro 和 Aib 做成对位置扫描。" },
  "AmPhe · 3-(aminomethyl)-L-phenylalanine": { takeaway: "适合需要芳香结合面并计划在同一位置引入侧链桥连的设计。", caution: "游离氨基会增加亲水性和潜在电荷，优势通常只有在完成内酰胺或其他交联后才体现。" },
  "(3S)-3-hydroxy-L-proline · 3-Hyp": { takeaway: "enlicitide利用3-Hyp羟基形成分子内醚桥，把Pro式局部约束与更高层级交联合并。", caution: "成功证据属于醚桥化后的完整三环骨架，不能据此断言游离3-Hyp本身提高渗透性。" },
  "D-Dap(tail) · side-chain-acylated D-2,3-diaminopropionic acid": { takeaway: "适合用作短小的侧链连接把手，把增溶尾部放到大环的溶剂暴露面。", caution: "季铵盐尾部提高溶解度但不利于被动扩散，属于核心、尾部和制剂协同设计，不是单残基增渗策略。" },
  "3-Cl-Phe · 3-chloro-L-phenylalanine": { takeaway: "可在 Phe 芳香位上小幅增加疏水性并封堵代谢位点，适合与 Phe、F-Phe 做梯度扫描。", caution: "卤代带来的活性改善可能主要来自靶点结合；继续增加卤素也可能快速损害溶解度。" },
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph": { takeaway: "适合需要更深疏水口袋占位的位点，可同时改变芳环距离、脂溶性和代谢稳定性。", caution: "AP0343使用4-CF₃-Hph，而Paluratide/LUNA18公开结构还带3,5-二氟取代；两者不能混写，收益也包含靶点诱导契合。" },
  "Ac5c · 1-aminocyclopentane-1-carboxylic acid": { takeaway: "适合用环状 α,α-二取代来锁定主链，而不依赖 N-甲基化去实现构象预组织。", caution: "Ac5c 的主链 NH 仍然存在；如果暴露在溶剂中，刚化并不会自动降低有效极性。" },
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine": { takeaway: "MeBmt可作为环孢素式疏水锚定和环境响应折叠的天然产物参考单元。", caution: "证据来自完整环孢素骨架；1985年研究支持结构和构效关系，不是现代单点渗透实验。" },
  "Abu · L-2-aminobutyric acid": { takeaway: "可把它看作比丙氨酸稍疏水、但仍较紧凑的微调单元，用于填补小型疏水空腔。", caution: "它不减少主链NH，且单独提高渗透性或稳定性的直接证据不足。" },
  "hydroxy-acid / depsipeptide substitution": { takeaway: "当某个暴露酰胺NH成为主要去溶剂化负担时，酰胺转酯可能比N-甲基化更有效。", caution: "酯键可能带来水解风险，必须同步评估胃肠、血浆和制剂条件下的化学稳定性。" },
  "thioamide substitution": { takeaway: "适合希望同时提高局部脂溶性、渗透性和代谢稳定性的骨架改造，但应作为独立策略评估。", caution: "硫代酰胺会改变羰基几何、氢键和电子性质，可能影响靶点结合，不能只按疏水化处理。" },
  "trans-4-F-Pro · (2S,4R)-4-fluoroproline": { takeaway: "反式 4-F-Pro 用于微调脯氨酸环构象及前一肽键平衡，适合与 Pro 和顺式异构体成组比较。", caution: "专利只支持其进入候选化学空间，尚不能说明它在任意位置都会提高渗透性。" },
  "4-Hyp · trans-4-hydroxy-L-proline": { takeaway: "4-Hyp 保留 Pro 的环状约束，并加入一个可形成氢键的羟基，适合作为 4-F-Pro 的极性对照。", caution: "羟基若持续暴露会增加去溶剂化代价；需要结合整体折叠判断。" },
  "Orn · L-ornithine": { takeaway: "Orn 比 Lys 少一个亚甲基，可用于碱性侧链长度扫描，也可作为侧链交联或衍生化把手。", caution: "未交联的侧链胺通常带正电，不宜直接归类为增渗残基。" },
  "Dap · L-2,3-diaminopropionic acid": { takeaway: "Dap 以较短侧链提供反应性胺，适合构建内酰胺桥或连接增溶尾部。", caution: "其优势主要在完成交联或修饰之后；游离 Dap 会增加电荷和亲水性。" },
  "Hph · L-homophenylalanine": { takeaway: "Hph 在 Phe 与芳环之间增加一个亚甲基，适合比较侧链长度、芳环可达范围和疏水口袋占位。", caution: "增加柔性和疏水面积可能同时损害构象预组织与水溶性。" },
  "2-Nal · 2-naphthylalanine": { takeaway: "2-Nal 可明显扩大芳香疏水表面，适合较深疏水口袋中的 Phe→Nal 梯度扫描。", caution: "较大的芳香表面容易带来低溶解度、聚集和非特异结合。" },
  "5-F-Trp · 5-fluoro-L-tryptophan": { takeaway: "5-F-Trp 保留 Trp 的芳香结合特征，并可通过氟取代微调电子性质和代谢稳定性。", caution: "它与经过 N-取代或交联的 5-F-Trp 构件不是同一种设计，证据需要分开解释。" },
};

const propertyFilters = [
  { id: "all", label: "全部实验性质", scope: null },
  { id: "permeability", label: "渗透性／细胞转运", scope: "渗透性" },
  { id: "solubility", label: "水溶性／溶解度", scope: "溶解度" },
  { id: "stability", label: "蛋白酶／代谢稳定性", scope: "稳定性" },
  { id: "oral-exposure", label: "口服暴露／生物利用度", scope: "口服暴露" },
  { id: "mechanism", label: "构象实验", scope: "构象" },
];

const allRecords: DatabaseRecord[] = propertyEvidenceMasterRecords;
const mappedResearchRecordCount = propertyEvidenceRecords.filter((item) => item.kind === "review" || getStructures(item.record.english).length > 0).length;
const unmappedResearchRecordCount = propertyEvidenceRecords.length - mappedResearchRecordCount;
const linkedResearchCcdCount = new Set(propertyEvidenceRecords.flatMap((item) => item.kind === "review" ? [item.record.ccdId.toUpperCase()] : getStructures(item.record.english).map((structure) => structure.ccd.toUpperCase()))).size;
const evidenceCategoryOptions = groups.map((group) => ({
  id: group.id,
  label: group.title,
  count: propertyEvidenceRecords.filter((item) => item.kind === "master" && item.record.categoryId === group.id).length,
})).filter((item) => item.count > 0);
const propertyFilterOptions = propertyFilters.map((propertyFilter) => ({
  ...propertyFilter,
  count: propertyFilter.scope === null ? propertyEvidenceRecords.length : propertyEvidenceRecords.filter((item) => item.kind === "master" && supportScope(item.record).includes(propertyFilter.scope)).length,
}));
const effectParts = (effect: string) => effect.split("；").map((part) => part.trim()).filter(Boolean);
const sourceYear = (paper: string) => paper.match(/(19|20)\d{2}/)?.[0] ?? "—";
const PAGE_SIZE = 12;

const ccdIdsForEvidenceItem = (item: (typeof allUnifiedRecords)[number]) => item.kind === "review"
  ? [item.record.ccdId.toUpperCase()]
  : getStructures(item.record.english).map((structure) => structure.ccd.toUpperCase());
const collectionForEvidenceItem = (item: (typeof allUnifiedRecords)[number], identityByCcd: Map<string, string>) => ccdIdsForEvidenceItem(item).some((ccdId) => identityByCcd.get(ccdId) === "evidence-reviewed-residue") ? "ncaa" : "special";

export default function Home() {
  const [portalView, setPortalView] = useState<PortalView>("home");
  const [homeQuery, setHomeQuery] = useState("");
  const [homeSearchTarget, setHomeSearchTarget] = useState<HomeSearchTarget>("catalog");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [property, setProperty] = useState("all");
  const [evidenceCollection, setEvidenceCollection] = useState<EvidenceCollection>("ncaa");
  const [identityByCcd, setIdentityByCcd] = useState<Map<string, string> | null>(null);
  const [openRecords, setOpenRecords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [literatureOpen, setLiteratureOpen] = useState(false);
  const [structureOnly, setStructureOnly] = useState(false);
  const [page, setPage] = useState(1);

  const papers = useMemo(() => {
    const sourceMap = new Map<string, { paper: string; href: string; level: EvidenceLevel; residue: string }>();
    propertyEvidenceRecords.forEach((item) => {
      if (item.kind !== "master") return;
      if (evidenceCollection !== "all" && identityByCcd && collectionForEvidenceItem(item, identityByCcd) !== evidenceCollection) return;
      const record = item.record;
      sourceMap.set(record.href, { paper: record.paper, href: record.href, level: record.level, residue: record.name });
      if (record.secondary) sourceMap.set(record.secondary.href, { paper: record.secondary.paper, href: record.secondary.href, level: record.secondary.level, residue: record.name });
    });
    return [...sourceMap.values()];
  }, [evidenceCollection, identityByCcd]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const urlQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    if (["ccd-catalog", "catalog"].includes(hash)) { window.location.replace("catalog/"); return; }
    if (["deep-review", "review"].includes(hash)) { setPortalView("evidence"); setCategory("all"); }
    if (["database", "compare", "evidence"].includes(hash)) { setPortalView("evidence"); if (urlQuery) setQuery(urlQuery); }
    if (["evidence-guide", "literature", "about"].includes(hash)) setPortalView("about");
  }, []);

  useEffect(() => {
    let active = true;
    fetch("ccd-unified-structure-catalog.json")
      .then((response) => response.ok ? response.json() as Promise<CcdIdentityPayload> : Promise.reject(new Error("CCD identity map unavailable")))
      .then((payload) => {
        if (!active) return;
        const next = new Map<string, string>();
        payload.records.forEach((record) => record.ccdIds.forEach((ccdId) => next.set(ccdId.toUpperCase(), record.componentClass.id)));
        setIdentityByCcd(next);
      })
      .catch(() => { if (active) setIdentityByCcd(new Map()); });
    return () => { active = false; };
  }, []);

  const evidenceCollectionCounts = useMemo(() => {
    if (!identityByCcd) return null;
    return propertyEvidenceRecords.reduce((counts, item) => {
      counts[collectionForEvidenceItem(item, identityByCcd)] += 1;
      return counts;
    }, { ncaa: 0, special: 0 });
  }, [identityByCcd]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const propertyConfig = propertyFilters.find((item) => item.id === property);
    return propertyEvidenceRecords.filter((item) => {
      if (evidenceCollection !== "all" && identityByCcd && collectionForEvidenceItem(item, identityByCcd) !== evidenceCollection) return false;
      if (item.kind === "review") {
        const record = item.record;
        const searchable = [record.id, record.ccdId, record.name, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, ...record.sources.flatMap((source) => [source.title, source.evidenceType])].join(" ").toLowerCase();
        const categoryMatch = category === "all" || category === `review-${record.grade}`;
        const propertyMatch = !propertyConfig?.scope;
        return (!normalized || searchable.includes(normalized)) && categoryMatch && propertyMatch;
      }
      const record = item.record;
      const structures = getStructures(record.english);
      const linkedReview = item.review;
      const searchable = [record.name, record.english, record.category, record.effect, record.evidence, record.paper, ...structures.flatMap((structure) => [structure.ccd, structure.label]), structureNotesByEnglish[record.english], linkedReview?.conclusion, linkedReview?.cyclicEvidence, linkedReview?.oralEvidence].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (category === "all" || record.categoryId === category || (linkedReview && category === `review-${linkedReview.grade}`))
        && (!propertyConfig?.scope || supportScope(record).includes(propertyConfig.scope))
        && (!structureOnly || structures.length > 0);
    });
  }, [query, category, property, structureOnly, evidenceCollection, identityByCcd]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, category, property, structureOnly, evidenceCollection]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const literatureSources = papers;

  const selectedRecords = selected.map((id) => allRecords.find((record) => record.id === id)).filter((record): record is DatabaseRecord => Boolean(record));
  const toggleDetails = (id: string) => setOpenRecords((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleCompare = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? current : [...current, id]);
  const clearFilters = () => { setQuery(""); setCategory("all"); setProperty("all"); setEvidenceCollection("ncaa"); setStructureOnly(false); };
  const navigateTo = (view: PortalView, targetId?: string) => {
    setPortalView(view);
    window.history.replaceState(null, "", targetId ? `#${targetId}` : view === "home" ? "#top" : `#${view}`);
    window.setTimeout(() => document.getElementById(targetId ?? "top")?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const searchFromHome = (event: React.FormEvent) => {
    event.preventDefault();
    const encoded = encodeURIComponent(homeQuery.trim());
    if (homeSearchTarget === "catalog") { window.location.href = `catalog/${encoded ? `?q=${encoded}` : ""}`; return; }
    if (homeSearchTarget === "ncaa") { window.location.href = `ncaa/${encoded ? `?q=${encoded}` : ""}`; return; }
    setQuery(homeQuery.trim());
    window.history.replaceState(null, "", `${encoded ? `?q=${encoded}` : ""}#database`);
    setPortalView("evidence");
    window.setTimeout(() => document.getElementById("database")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const downloadCsv = () => {
    const header = ["中文名", "英文名", "类别", "残基简介", "CCD编号", "性质变化", "论文测量范围", "优先替换", "主要目标", "不建议位置", "原始骨架与改造方式", "实验终点", "实验结果", "实验环境", "证据边界", "证据说明", "证据等级", "专利子等级", "论文或专利", "链接"];
    const rows = allRecords.filter((record) => {
      if (evidenceCollection === "all" || !identityByCcd) return true;
      const isNcaa = getStructures(record.english).some((structure) => identityByCcd.get(structure.ccd.toUpperCase()) === "evidence-reviewed-residue");
      return evidenceCollection === "ncaa" ? isNcaa : !isNcaa;
    }).map((record) => {
      const design = getDesignGuide(record); const experiment = experimentData[record.english]; const patentTier = patentTierByEnglish[record.english];
      const structures = getStructures(record.english);
      const tier = masterEvidenceTier(record.level); const tierMeta = unifiedEvidenceMeta[tier];
      return [record.name, record.english, record.category, insights[record.english]?.takeaway ?? effectParts(record.effect)[0], structures.map((item) => item.ccd).join(" / ") || "—", record.effect, supportScope(record).join("、"), design.replace, design.goal, design.avoid, experiment?.comparison ?? "完整分子或候选集合；未报告单残基定量对照", experiment?.endpoint ?? "—", experiment?.result ?? "—", experiment?.system ?? "—", experiment?.formulation ?? "—", record.evidence, `${tierMeta.number}-${tierMeta.label}`, patentTier ? `${patentTier}-${patentTierMeta[patentTier].label}` : "—", record.paper, record.href];
    });
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "oral-cyclic-peptide-property-evidence.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <main id="top">
      <SiteHeader active={portalView} onDownload={downloadCsv} onNavigate={(section) => navigateTo(section, section === "home" ? "top" : "database")} />

      {portalView === "home" && <>
        <section className="portal-hero" aria-labelledby="portal-title">
          <div className="portal-hero-copy">
            <p className="eyebrow">ORAL CYCLIC PEPTIDE · RESIDUE KNOWLEDGEBASE</p>
            <h1 id="portal-title">口服环肽<br /><em>非天然残基数据库</em></h1>
            <p className="portal-summary">收录非天然氨基酸的结构身份、肽中使用记录及环肽性质证据，供残基检索、位点扫描和实验方案设计使用。</p>
          </div>
          <form className="portal-search" onSubmit={searchFromHome}>
            <label htmlFor="portal-search-input">搜索数据库</label>
            <div className="portal-search-controls"><select value={homeSearchTarget} onChange={(event) => setHomeSearchTarget(event.target.value as HomeSearchTarget)} aria-label="选择搜索范围"><option value="catalog">CCD结构库</option><option value="ncaa">非天然氨基酸库</option><option value="evidence">研发证据库</option></select><input id="portal-search-input" value={homeQuery} onChange={(event) => setHomeQuery(event.target.value)} placeholder={homeSearchTarget === "evidence" ? "输入残基名称、CCD、目标性质或证据结论" : "输入英文名、CCD编号、同义词或分子式"} /><button type="submit">搜索</button></div>
            <p>{homeSearchTarget === "evidence" ? "例如：N-Me-Leu、STA、渗透性、环肽直接使用" : "例如：AIB、02A、N-methyl、C8 H9 N O2"}</p>
          </form>
          <div className="version-line"><span>Version 5.1</span><span>最近更新：2026-09-02</span><span>研究用途数据库</span></div>
        </section>

        <section className="portal-stats" aria-label="数据库概览">
          <article><strong>2,065</strong><span>网站收录的全部结构</span><small>身份分为后面三类；PDB和性质数据另外统计</small></article>
          <article><strong>1,844</strong><span>已确认非天然氨基酸／残基</span><small>另有1条身份待确认记录保留在CCD结构库</small></article>
          <article><strong>176</strong><span>特殊用途结构</span><small>多残基融合、反应状态和非典型肽模拟构件等</small></article>
          <article><strong>44</strong><span>非单体／排除项</span><small>缺少单一氨基酸骨架的结构，保留用于追溯</small></article>
          <article><strong>955</strong><span>短PDB聚合物中出现</span><small>在不超过50残基的PDB聚合物序列中命中</small></article>
          <article><strong>{linkedResearchCcdCount}</strong><span>已关联性质实验的CCD</span><small>直接实验与完整分子证据分级显示</small></article>
        </section>

        <section className="portal-body">
          <div className="portal-section-heading"><div><p className="eyebrow">EXPLORE THE DATABASE</p><h2>数据库内容</h2></div><p>结构检索与研发证据分别编目，记录详情保留结构来源、实验条件和结论适用范围。</p></div>
          <div className="portal-entry-grid">
            <button onClick={() => navigateTo("evidence", "database")}><span>01 · 设计决策</span><strong>研发证据库</strong><p>只收录有实验资料支持溶解度、渗透性、稳定性、口服暴露等性质变化的记录。</p><b>浏览{propertyEvidenceRecords.length}条性质证据记录 →</b></button>
            <button onClick={() => { window.location.href = "ncaa/"; }}><span>02 · 核心研究集合</span><strong>非天然氨基酸库</strong><p>集中查看已完成身份核验、具有CCD编号的非天然氨基酸及明确衍生物。</p><b>进入非天然氨基酸专库 →</b></button>
            <button onClick={() => { window.location.href = "catalog/"; }}><span>03 · 完整结构底库</span><strong>CCD结构库</strong><p>浏览结构、五层证据状态、PDB使用与单体可用性线索。</p><b>进入2,065条结构目录 →</b></button>
            <button onClick={() => { window.location.href = "quality/"; }}><span>04 · 方法与质量</span><strong>版本与数据质量</strong><p>查看合并规则、证据等级、排除边界和机器可读文件。</p><b>查看质量说明 →</b></button>
          </div>

          <div className="portal-overview-grid">
            <article className="portal-progress-card"><div><span>结构库分类口径</span><strong>2,065条结构使用同一套CCD主记录</strong></div><ol><li><b>已确认非天然氨基酸／非标准残基</b><span>1,844条；单一母体修饰和明确氨基酸骨架均按身份收录</span></li><li><b>身份待确认</b><span>1条；CCD 96Z仍保留在完整结构库中</span></li><li><b>特殊用途结构</b><span>176条多残基融合、反应状态或非典型构件单独管理</span></li><li><b>非单体／排除项</b><span>44条缺少单一氨基酸骨架的结构保留用于追溯</span></li></ol></article>
            <article className="portal-boundary-card"><span>证据口径</span><h3>记录按证据层级解释</h3><p>CCD记录用于确认化学身份，PDB命中用于确认其在聚合物中的使用。只有在相同或可比环肽骨架中设有实验对照时，才将性质变化归因于具体残基。</p><button onClick={() => { window.location.href = "quality/"; }}>查看证据分级与数据质量 →</button></article>
          </div>
        </section>
      </>}

      {portalView === "evidence" && <>
      <section className="database-section" id="database" aria-labelledby="database-title">
        <div className="section-heading"><div><p className="eyebrow">EXPERIMENTALLY SUPPORTED PROPERTY EVIDENCE</p><h2 id="database-title">性质改善研发证据库</h2></div><p>只收录有实验对照支持性质变化的记录。CCD、PDB出现和单纯身份资料不在这里计数。</p></div>
        <aside className="evidence-integration-status" aria-labelledby="integration-status-title">
          <div><span>PROPERTY-EVIDENCE VIEW</span><strong id="integration-status-title">研发证据库收录{propertyEvidenceRecords.length}条性质证据记录</strong><p>{mappedResearchRecordCount}条已有CCD映射，{unmappedResearchRecordCount}条属于尚无唯一CCD的骨架策略；这里只统计能够支持性质变化判断的实验资料。</p></div>
          <dl><div><dt>{propertyEvidenceRecords.length}</dt><dd>性质证据记录</dd></div><div><dt>{mappedResearchRecordCount}</dt><dd>已有CCD映射</dd></div><div><dt>{linkedResearchCcdCount}</dt><dd>关联CCD结构</dd></div><div><dt>{unmappedResearchRecordCount}</dt><dd>暂无唯一CCD</dd></div></dl>
          <nav><a href="ccd-research-evidence-alignment.csv" download>下载全量审计对应表</a><a href="ccd-manual-review-92-final.csv" download>下载身份审核来源</a></nav>
        </aside>
        <div className="evidence-collection-switch" aria-label="研发证据记录类型">
          <button className={evidenceCollection === "all" ? "active" : ""} onClick={() => setEvidenceCollection("all")}><strong>{propertyEvidenceRecords.length}</strong><span>全部性质证据</span><small>以下两类合计</small></button>
          <button className={evidenceCollection === "ncaa" ? "active ncaa" : "ncaa"} onClick={() => setEvidenceCollection("ncaa")} disabled={!evidenceCollectionCounts}><strong>{evidenceCollectionCounts?.ncaa ?? "—"}</strong><span>具体非天然氨基酸证据</span><small>能够与已确认非天然氨基酸及CCD结构对应</small></button>
          <button className={evidenceCollection === "special" ? "active special" : "special"} onClick={() => setEvidenceCollection("special")} disabled={!evidenceCollectionCounts}><strong>{evidenceCollectionCounts?.special ?? "—"}</strong><span>骨架与改造策略证据</span><small>完整骨架、等排替换或尚无唯一CCD的策略</small></button>
        </div>
        <div className="evidence-collection-note"><strong>收录原则</strong><p>这里只保留能够支持溶解度、渗透性、稳定性、代谢稳定性、口服暴露等性质变化的实验记录。单纯身份确认、PDB出现、肽中使用或专利列举不再作为研发证据收录。</p></div>
        <div className="evidence-judgment-guide">
          <article><span>如何确认是非天然氨基酸</span><strong>先确认化学身份，再确认它能作为残基理解</strong><p>核对CCD编号、名称、分子式和立体化学；同时要求CCD单体类型、标准母体关系或原始论文明确支持其作为独立氨基酸／肽链残基。完整药物、短肽、连接体和反应加合物不会因为“长得像氨基酸”就纳入。</p></article>
          <article><span>如何判断会影响目标性质</span><strong>必须有原始实验和可解释的比较对象</strong><p>优先采用相同或可比骨架中的替换对照，并记录PAMPA、RRCK、Caco-2、溶解度、血浆／蛋白酶稳定性或口服药代等实际终点。只有完整分子有效、但无法归因到具体残基的资料，不记作该残基的直接性质证据。</p></article>
        </div>
        <div className="filter-panel property-evidence-filters">
          <label className="search-field"><span>搜索名称、缩写、作用或论文</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：N-Me-Leu、Pye、Caco-2、提高溶解度" /></label>
          <label><span>证据对象类别</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">全部实际收录类别（{propertyEvidenceRecords.length}）</option>{evidenceCategoryOptions.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
          <label><span>论文实际测量的性质</span><select value={property} onChange={(event) => setProperty(event.target.value)}>{propertyFilterOptions.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
          <label className="structure-filter"><span>结构信息</span><button className={structureOnly ? "active" : ""} onClick={() => setStructureOnly((current) => !current)}>{structureOnly ? "仅显示已核对 CCD" : "显示全部记录"}</button></label>
        </div>
        <div className="property-evidence-definition"><strong>收录门槛</strong><p>必须有可追溯的论文或专利实验资料，并能够比较或判断某项性质发生变化；只有列举结构、没有性质实验的专利不收录。完整分子口服结果若无法归因于具体残基，仅作为来源背景，不计作该残基的直接改善证据。</p></div>
        <div className="result-bar"><span>找到 <strong>{filtered.length}</strong> 条记录 · 第 {page}/{totalPages} 页</span>{(query || category !== "all" || property !== "all" || evidenceCollection !== "all" || structureOnly) && <button onClick={clearFilters}>清除筛选</button>}</div>

        {filtered.length ? <div className="record-grid">{paginatedRecords.map((item) => {
          if (item.kind === "review") {
            const record = item.record; const reviewMeta = reviewGradeMeta[record.grade]; const unifiedTier = evidenceTierForItem(item); const tierMeta = unifiedEvidenceMeta[unifiedTier]; const isOpen = openRecords.includes(record.id); const primarySource = record.sources[0];
            return <article className={`record-card merged-review-card review-card-${record.grade.toLowerCase()} ${isOpen ? "open" : ""}`} key={record.id}>
              <div className="record-topline"><span className={`evidence-badge unified-tier-${unifiedTier}`}>{tierMeta.number}｜{tierMeta.label}</span><span className="record-category">{record.id} · CCD {record.ccdId}</span></div>
              <div className="record-title-row"><div><h3><Link href={`/compound/${record.ccdId.toLowerCase()}/`}>{record.name}</Link></h3><p>中文规范名称待补充</p></div><span className="merged-record-label">CCD 已对齐</span></div>
              <div className="card-overview with-structure"><div><span className="field-label">审核结论</span><p className="takeaway">{record.conclusion}</p><p className="review-card-recommendation">{record.recommendation}</p></div><div className="structure-stack"><a className="structure-preview" href={ccdEntryUrl(record.ccdId)} target="_blank" rel="noreferrer"><img src={ccdImageUrl(record.ccdId)} alt={`${record.name}二维结构`} /><span>CCD {record.ccdId} · 打开RCSB ↗</span></a></div></div>
              <div className="property-tags"><span>{reviewMeta.label}</span><span>{record.grade === "A" ? "环肽证据已核对" : record.grade === "B" ? "肽中使用已核对" : record.grade === "C" ? "受限使用" : "不建议作为单体"}</span></div>
              <div className="source-summary"><span>{sourceYear(primarySource?.title ?? "")}</span><strong>{primarySource?.title ?? "CCD与人工审核记录"}</strong></div>
              <button className="details-toggle" onClick={() => toggleDetails(record.id)} aria-expanded={isOpen}>{isOpen ? "收起完整记录" : "查看完整记录"}<span>{isOpen ? "−" : "+"}</span></button>
              {isOpen && <div className="record-details merged-review-details"><div><h4>记录类别</h4><p>{reviewMeta.description}</p></div><div className="design-guide"><h4>审核结果</h4><dl><div><dt>合成／身份</dt><dd>{record.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{record.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{record.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{record.recommendation}</dd></div></dl></div><div className="caution-box"><h4>适用范围</h4><p>本级别记录结构身份及肽或环肽中的使用情况，不作为单残基改善口服吸收的因果证据。</p></div><div className="record-sources">{record.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div></div>}
            </article>;
          }
          const record = item.record;
          const unifiedTier = evidenceTierForItem(item); const tierMeta = unifiedEvidenceMeta[unifiedTier]; const insight = insights[record.english]; const isOpen = openRecords.includes(record.id); const isSelected = selected.includes(record.id);
          const patentTier = patentTierByEnglish[record.english]; const design = getDesignGuide(record); const experiment = experimentData[record.english]; const scope = supportScope(record); const structures = getStructures(record.english); const structureNote = structureNotesByEnglish[record.english];
          return <article className={`record-card ${isOpen ? "open" : ""}`} key={record.id}>
            <div className="record-topline"><span className={`evidence-badge unified-tier-${unifiedTier}`} title={tierMeta.description}>{tierMeta.number}｜{tierMeta.label}</span><span className="record-category">{record.id} · {record.category}</span></div>
            <div className="record-title-row"><div><h3><Link href={`/residue/${record.slug}/`}>{record.name}</Link></h3><p>{record.english}</p></div><button className={`compare-toggle ${isSelected ? "selected" : ""}`} onClick={() => toggleCompare(record.id)} disabled={!isSelected && selected.length >= 3}>{isSelected ? "已选择" : "加入比较"}</button></div>
            <div className="card-overview with-structure">
              <div><span className="field-label">性质概述</span><p className="takeaway">{effectParts(record.effect).slice(0, 2).join("；")}。</p></div>
              {structures.length > 0 ? <div className={`structure-stack ${structures.length > 1 ? "multiple" : ""}`}>{structures.map((structure) => <a className="structure-preview" href={ccdEntryUrl(structure.ccd)} target="_blank" rel="noreferrer" title={`在 RCSB PDB 查看 CCD ${structure.ccd}`} key={structure.ccd}><img src={ccdImageUrl(structure.ccd)} alt={`${structure.label}二维结构`} /><span>CCD {structure.ccd} · {structure.label} ↗</span></a>)}</div> : <div className="structure-unavailable"><strong>暂无唯一 CCD 结构</strong><p>{structureNote ?? "当前记录尚未找到可与名称和立体化学完全对应的 CCD 单体。"}</p></div>}
            </div>
            <div className="property-tags">{effectParts(record.effect).slice(0, 4).map((part) => <span key={part}>{part}</span>)}{item.review && <span className="linked-review-tag">使用核对｜{reviewGradeMeta[item.review.grade].label}</span>}</div>
            <div className="source-summary"><span>{sourceYear(record.paper)}</span><strong>{record.paper}</strong></div>
            <button className="details-toggle" onClick={() => toggleDetails(record.id)} aria-expanded={isOpen}>{isOpen ? "收起完整记录" : "查看完整记录"}<span>{isOpen ? "−" : "+"}</span></button>
            {isOpen && <div className="record-details">
              <div><h4>论文测量范围</h4><div className="scope-tags">{scope.map((item) => <span key={item}>{item}</span>)}</div></div>
              <div className="design-guide"><h4>残基扫描建议</h4><dl><div><dt>优先替换</dt><dd>{design.replace}</dd></div><div><dt>主要目标</dt><dd>{design.goal}</dd></div><div><dt>限制条件</dt><dd>{design.avoid}</dd></div></dl></div>
              <div className="experiment-panel"><h4>原始骨架与实验环境</h4>{experiment ? <dl><div><dt>骨架／改造</dt><dd>{experiment.comparison}</dd></div><div><dt>观察指标</dt><dd>{experiment.endpoint}</dd></div><div><dt>性质变化</dt><dd><strong>{experiment.result}</strong></dd></div><div><dt>实验环境</dt><dd>{experiment.system}</dd></div><div><dt>证据边界</dt><dd>{experiment.formulation}</dd></div></dl> : <p className="no-metric">来源给出了完整分子、候选集合或权利要求范围，但未公开可归属于该单个残基的定量替换对照。该条目用于扩展候选空间，不用于预测具体数值变化。</p>}</div>
              <div><h4>预期性质影响</h4><p>{record.effect}</p></div><div><h4>原始来源结论</h4><p>{record.evidence}</p></div>
              <div className="caution-box"><h4>设计限制</h4><p>{insight?.caution ?? "具体效果取决于替换位置、环尺寸、整体构象和实验体系，建议保留母体对照。"}</p></div>
              <div className="record-sources"><a href={record.href} target="_blank" rel="noreferrer"><span>{tierMeta.number}来源</span><strong>{record.paper}</strong><small>打开原始来源 ↗</small></a>{record.secondary && <a href={record.secondary.href} target="_blank" rel="noreferrer"><span>补充来源</span><strong>{record.secondary.paper}</strong><small>打开补充来源 ↗</small></a>}</div>
            </div>}
          </article>;
        })}</div> : <div className="empty-state"><strong>没有找到匹配记录</strong><p>可以减少筛选条件，或者尝试英文缩写和实验名称。</p><button onClick={clearFilters}>显示全部记录</button></div>}
        {filtered.length > PAGE_SIZE && <nav className="pagination" aria-label="候选记录分页"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>上一页</button><div>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button className={number === page ? "active" : ""} aria-current={number === page ? "page" : undefined} onClick={() => setPage(number)} key={number}>{number}</button>)}</div><button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>下一页</button></nav>}
      </section>

      <section className="comparison-section" id="compare" aria-labelledby="compare-title">
        <div className="section-heading light"><div><p className="eyebrow">SIDE-BY-SIDE REVIEW</p><h2 id="compare-title">残基比较</h2></div><p>{selected.length === 0 ? "在数据库卡片中选择2—3项，即可比较设计定位与证据边界。" : `已选择 ${selected.length}/3 项`}</p></div>
        {selectedRecords.length ? <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>比较项目</th>{selectedRecords.map((record) => <th key={record.id}>{record.name}<small>{record.english}</small></th>)}</tr></thead><tbody>
          <tr><th>类别</th>{selectedRecords.map((record) => <td key={record.id}>{record.category}</td>)}</tr><tr><th>证据</th>{selectedRecords.map((record) => { const tier = masterEvidenceTier(record.level); return <td key={record.id}><span className="mini-level">{unifiedEvidenceMeta[tier].number}</span>{unifiedEvidenceMeta[tier].label}</td>; })}</tr>
          <tr><th>设计定位</th>{selectedRecords.map((record) => <td key={record.id}>{insights[record.english]?.takeaway}</td>)}</tr><tr><th>优先替换</th>{selectedRecords.map((record) => <td key={record.id}>{getDesignGuide(record).replace}</td>)}</tr><tr><th>论文测量范围</th>{selectedRecords.map((record) => <td key={record.id}>{supportScope(record).join("、")}</td>)}</tr><tr><th>性质变化</th>{selectedRecords.map((record) => <td key={record.id}>{effectParts(record.effect).slice(0, 4).join("；")}</td>)}</tr><tr><th>主要限制</th>{selectedRecords.map((record) => <td key={record.id}>{insights[record.english]?.caution}</td>)}</tr>
        </tbody></table><button className="clear-comparison" onClick={() => setSelected([])}>清空比较</button></div> : null}
      </section>
      </>}

      {portalView === "about" && <>
      <section className="evidence-section" id="evidence-guide" aria-labelledby="evidence-title">
        <div className="section-heading evidence-heading"><div><p className="eyebrow">ABOUT THE SOURCES</p><h2 id="evidence-title">资料来源说明</h2></div></div>
        <div className="source-note">
          <div className="source-note-intro">
            <h3>证据判断依据</h3>
            <p>所有记录统一使用四级证据。等级表示资料目前能够证明到哪一步，不评价论文好坏，也不等同于口服效果评分。</p>
          </div>
          <div className="source-note-list">
            <article>
              <h3>1级 · 直接效果证据</h3>
              <p>有同骨架对照、单点替换或明确骨架改造实验，可以比较该改造对性质的影响。</p>
            </article>
            <article>
              <h3>2级 · 完整分子证据</h3>
              <p>存在于有渗透性、口服或临床资料的完整环肽中，只能证明与该骨架相容，不能把效果归于单个残基。</p>
            </article>
            <article>
              <h3>3级 · 已确认实际使用</h3>
              <p>论文、PDB或人工审核确认它进入过肽或环肽，但没有足够的性质对照实验。</p>
            </article>
            <article>
              <h3>4级 · 设计线索</h3>
              <p>来自专利、特殊构件或有限资料，只适合提出候选，不能据此断言能够改善口服性质。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="literature-section" id="literature" aria-labelledby="literature-title">
        <div className="section-heading light literature-heading"><div><p className="eyebrow">PAPERS · PATENTS · PROVENANCE</p><h2 id="literature-title">证据来源库</h2></div><button className="literature-toggle" onClick={() => setLiteratureOpen((current) => !current)} aria-expanded={literatureOpen} aria-controls="literature-list"><span>{literatureOpen ? "收起来源" : `展开去重来源（${literatureSources.length}）`}</span><b>{literatureOpen ? "−" : "+"}</b></button></div>
        {literatureOpen && <div className="literature-list" id="literature-list">{literatureSources.map((source, index) => { const tier = masterEvidenceTier(source.level); return <a href={source.href} target="_blank" rel="noreferrer" key={source.href}><span>{String(index + 1).padStart(2, "0")}</span><strong>{source.paper}</strong><small>{source.residue}</small><em>{unifiedEvidenceMeta[tier].number}</em><b>↗</b></a>; })}</div>}
      </section>
      </>}

      <SiteFooter />
    </main>
  );
}
