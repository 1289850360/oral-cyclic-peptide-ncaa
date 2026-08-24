"use client";

import { useMemo, useState } from "react";
import { groups, type EvidenceLevel, type Residue } from "./residue-data";
import { experimentData, getDesignGuide, patentTierByEnglish, patentTierMeta, supportScope } from "./v22-data";

type DatabaseRecord = Residue & { id: string; categoryId: string; category: string };
type Insight = { takeaway: string; caution: string };

const evidenceMeta: Record<EvidenceLevel, { code: string; label: string; description: string }> = {
  "直接证据": { code: "A", label: "直接替换证据", description: "有同骨架对照、单点或明确位置替换，并报告渗透性、稳定性或口服暴露数据。" },
  "改造证据": { code: "A", label: "直接骨架改造证据", description: "改造对象不是常规氨基酸侧链，但有明确对照实验支持其对环肽性质的影响。" },
  "骨架证据": { code: "B", label: "完整骨架证据", description: "该单元存在于高渗透或有口服暴露的环肽中，但效果不能归因于单个残基。" },
  "临床骨架": { code: "C", label: "临床／天然产物参照", description: "存在于环孢素等成功口服骨架中，主要说明设计可行性，不代表单点增渗。" },
  "专利证据": { code: "D", label: "专利设计证据", description: "专利中提出或使用的设计，公开实验细节可能有限，仍需论文或内部实验复核。" },
};

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
};

const modernCyclosporineSources = [
  { paper: "Wang et al., Journal of Medicinal Chemistry, 2018", href: "https://pubmed.ncbi.nlm.nih.gov/29400464/", note: "用NMR与分子模拟研究环孢素构象柔性和跨膜过程。" },
  { paper: "Ono et al., Journal of Chemical Information and Modeling, 2021", href: "https://pubmed.ncbi.nlm.nih.gov/34672629/", note: "现代研究支持环孢素的环境依赖构象与变色龙特性。" },
  { paper: "Limbach et al., Journal of Medicinal Chemistry, 2025", href: "https://pubmed.ncbi.nlm.nih.gov/40077929/", note: "进一步分析环孢素膜渗透所需的构象平衡和能垒。" },
];

const propertyFilters = [
  { id: "all", label: "全部性质", keywords: [] },
  { id: "permeability", label: "渗透性", keywords: ["渗透"] },
  { id: "hydrophobicity", label: "疏水性", keywords: ["疏水", "脂溶"] },
  { id: "solubility", label: "溶解度", keywords: ["水溶", "溶解度"] },
  { id: "stability", label: "稳定性", keywords: ["稳定性", "抗酶解", "蛋白酶"] },
  { id: "polarity", label: "降低极性", keywords: ["极性 ↓", "氢键供体 ↓"] },
  { id: "conformation", label: "构象控制", keywords: ["构象", "转角", "刚性"] },
];

const allRecords: DatabaseRecord[] = groups.flatMap((group) => group.residues.map((residue, index) => ({ ...residue, id: `${group.id}-${index + 1}`, categoryId: group.id, category: group.title })));
const effectParts = (effect: string) => effect.split("；").map((part) => part.trim()).filter(Boolean);
const sourceYear = (paper: string) => paper.match(/(19|20)\d{2}/)?.[0] ?? "—";

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [property, setProperty] = useState("all");
  const [openRecords, setOpenRecords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [literatureOpen, setLiteratureOpen] = useState(false);

  const papers = useMemo(() => {
    const sourceMap = new Map<string, { paper: string; href: string; level: EvidenceLevel; residue: string }>();
    allRecords.forEach((record) => {
      sourceMap.set(record.href, { paper: record.paper, href: record.href, level: record.level, residue: record.name });
      if (record.secondary) sourceMap.set(record.secondary.href, { paper: record.secondary.paper, href: record.secondary.href, level: record.secondary.level, residue: record.name });
    });
    return [...sourceMap.values()];
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const propertyConfig = propertyFilters.find((item) => item.id === property);
    return allRecords.filter((record) => {
      const searchable = [record.name, record.english, record.category, record.effect, record.evidence, record.paper].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (category === "all" || record.categoryId === category)
        && (evidence === "all" || evidenceMeta[record.level].code === evidence)
        && (!propertyConfig || propertyConfig.keywords.length === 0 || propertyConfig.keywords.some((keyword) => record.effect.includes(keyword)));
    });
  }, [query, category, evidence, property]);

  const literatureSources = useMemo(() => [
    ...papers,
    ...modernCyclosporineSources.map((source) => ({
      paper: source.paper,
      href: source.href,
      level: "临床骨架" as EvidenceLevel,
      residue: "环孢素整体机制",
    })),
  ], [papers]);

  const selectedRecords = selected.map((id) => allRecords.find((record) => record.id === id)).filter((record): record is DatabaseRecord => Boolean(record));
  const toggleDetails = (id: string) => setOpenRecords((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleCompare = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? current : [...current, id]);
  const clearFilters = () => { setQuery(""); setCategory("all"); setEvidence("all"); setProperty("all"); };

  const downloadCsv = () => {
    const header = ["中文名", "英文名", "类别", "性质变化", "证据支持范围", "优先替换", "主要目标", "不建议位置", "比较方式", "实验终点", "实验结果", "实验体系", "制剂或证据边界", "证据说明", "证据等级", "专利子等级", "论文或专利", "链接"];
    const rows = allRecords.map((record) => {
      const design = getDesignGuide(record); const experiment = experimentData[record.english]; const patentTier = patentTierByEnglish[record.english];
      return [record.name, record.english, record.category, record.effect, supportScope(record).join("、"), design.replace, design.goal, design.avoid, experiment?.comparison ?? "未报告单残基定量对照", experiment?.endpoint ?? "—", experiment?.result ?? "—", experiment?.system ?? "—", experiment?.formulation ?? "—", record.evidence, `${evidenceMeta[record.level].code}-${evidenceMeta[record.level].label}`, patentTier ? `${patentTier}-${patentTierMeta[patentTier].label}` : "—", record.paper, record.href];
    });
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "oral-cyclic-peptide-residue-database-v2-2.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <main id="top">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回页面顶部"><span className="brand-mark">CP</span><span>口服环肽残基证据库</span></a>
        <nav className="main-nav" aria-label="页面导航"><a href="#database">数据库</a><a href="#compare">残基比较</a><a href="#evidence-guide">证据说明</a><a href="#literature">文献库</a></nav>
        <button className="download-button" onClick={downloadCsv}>导出 CSV</button>
      </header>

      <section className="dashboard-intro">
        <div className="intro-copy">
          <p className="eyebrow">ORAL CYCLIC PEPTIDE · EVIDENCE DATABASE</p>
          <h1>口服环肽<br /><em>非天然残基证据库</em></h1>
          <div className="version-line"><span>数据库版本 V2.2</span><span>最后核对：2026-08-23</span><span>研究用途，非处方建议</span></div>
        </div>
        <div className="stats-grid" aria-label="数据库概况">
          <div><strong>{allRecords.length}</strong><span>候选残基与策略</span></div><div><strong>{groups.length}</strong><span>化学与骨架类别</span></div>
          <div><strong>{literatureSources.length}</strong><span>论文及专利来源</span></div><div><strong>{allRecords.filter((item) => evidenceMeta[item.level].code === "A").length}</strong><span>A级直接证据</span></div>
        </div>
      </section>

      <section className="database-section" id="database" aria-labelledby="database-title">
        <div className="section-heading"><div><p className="eyebrow">SEARCH · FILTER · COMPARE</p><h2 id="database-title">候选数据库</h2></div><p>先按研发目标筛选，再打开条目查看实验边界。最多可选择3项并排比较。</p></div>
        <div className="filter-panel">
          <label className="search-field"><span>搜索名称、缩写、作用或论文</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：N-Me-Leu、Pye、Caco-2、提高溶解度" /></label>
          <label><span>残基类别</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">全部类别</option>{groups.map((group) => <option value={group.id} key={group.id}>{group.title}</option>)}</select></label>
          <label><span>证据等级</span><select value={evidence} onChange={(event) => setEvidence(event.target.value)}><option value="all">全部等级</option><option value="A">A｜直接实验</option><option value="B">B｜完整骨架</option><option value="C">C｜临床／天然产物</option><option value="D">D｜专利</option></select></label>
          <label><span>目标性质</span><select value={property} onChange={(event) => setProperty(event.target.value)}>{propertyFilters.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        </div>
        <div className="category-chips"><button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>全部 {allRecords.length}</button>{groups.map((group) => <button className={category === group.id ? "active" : ""} onClick={() => setCategory(group.id)} key={group.id}>{group.title} {group.residues.length}</button>)}</div>
        <div className="result-bar"><span>找到 <strong>{filtered.length}</strong> 条记录</span>{(query || category !== "all" || evidence !== "all" || property !== "all") && <button onClick={clearFilters}>清除筛选</button>}</div>

        {filtered.length ? <div className="record-grid">{filtered.map((record) => {
          const meta = evidenceMeta[record.level]; const insight = insights[record.english]; const isOpen = openRecords.includes(record.id); const isSelected = selected.includes(record.id);
          const patentTier = patentTierByEnglish[record.english]; const design = getDesignGuide(record); const experiment = experimentData[record.english]; const scope = supportScope(record);
          return <article className={`record-card ${isOpen ? "open" : ""}`} key={record.id}>
            <div className="record-topline"><span className={`evidence-badge level-${meta.code.toLowerCase()}`} title={patentTier ? patentTierMeta[patentTier].description : meta.description}>{patentTier ?? meta.code}｜{patentTier ? patentTierMeta[patentTier].label : meta.label}</span><span className="record-category">{record.category}</span></div>
            <div className="record-title-row"><div><h3>{record.name}</h3><p>{record.english}</p></div><button className={`compare-toggle ${isSelected ? "selected" : ""}`} onClick={() => toggleCompare(record.id)} disabled={!isSelected && selected.length >= 3}>{isSelected ? "已选择" : "加入比较"}</button></div>
            <p className="takeaway">{insight?.takeaway ?? effectParts(record.effect)[0]}</p>
            <div className="property-tags">{effectParts(record.effect).slice(0, 4).map((part) => <span key={part}>{part}</span>)}</div>
            <div className="source-summary"><span>{sourceYear(record.paper)}</span><strong>{record.paper}</strong></div>
            <button className="details-toggle" onClick={() => toggleDetails(record.id)} aria-expanded={isOpen}>{isOpen ? "收起完整记录" : "查看完整记录"}<span>{isOpen ? "−" : "+"}</span></button>
            {isOpen && <div className="record-details">
              <div><h4>这条证据支持什么</h4><div className="scope-tags">{scope.map((item) => <span key={item}>{item}</span>)}</div></div>
              <div className="design-guide"><h4>怎样用于残基扫描</h4><dl><div><dt>优先替换</dt><dd>{design.replace}</dd></div><div><dt>主要目标</dt><dd>{design.goal}</dd></div><div><dt>不建议</dt><dd>{design.avoid}</dd></div></dl></div>
              <div className="experiment-panel"><h4>结构化实验结果</h4>{experiment ? <dl><div><dt>比较方式</dt><dd>{experiment.comparison}</dd></div><div><dt>实验终点</dt><dd>{experiment.endpoint}</dd></div><div><dt>结果</dt><dd><strong>{experiment.result}</strong></dd></div><div><dt>体系</dt><dd>{experiment.system}</dd></div><div><dt>制剂／边界</dt><dd>{experiment.formulation}</dd></div></dl> : <p className="no-metric">原始来源未报告可归属于该单个残基的定量数据。当前条目用于候选生成，不能据此判断替换后的数值变化。</p>}</div>
              <div><h4>为什么可能有用</h4><p>{record.effect}</p></div><div><h4>原始来源记录了什么</h4><p>{record.evidence}</p></div>
              <div className="caution-box"><h4>设计时要注意</h4><p>{insight?.caution ?? "具体效果取决于替换位置、环尺寸、整体构象和实验体系，建议保留母体对照。"}</p></div>
              <div className="record-sources"><a href={record.href} target="_blank" rel="noreferrer"><span>{meta.code}级来源</span><strong>{record.paper}</strong><small>打开原始来源 ↗</small></a>{record.secondary && <a href={record.secondary.href} target="_blank" rel="noreferrer"><span>补充来源</span><strong>{record.secondary.paper}</strong><small>打开补充来源 ↗</small></a>}</div>
            </div>}
          </article>;
        })}</div> : <div className="empty-state"><strong>没有找到匹配记录</strong><p>可以减少筛选条件，或者尝试英文缩写和实验名称。</p><button onClick={clearFilters}>显示全部记录</button></div>}
      </section>

      <section className="comparison-section" id="compare" aria-labelledby="compare-title">
        <div className="section-heading light"><div><p className="eyebrow">SIDE-BY-SIDE REVIEW</p><h2 id="compare-title">残基比较</h2></div><p>{selected.length === 0 ? "在数据库卡片中选择2—3项，即可比较设计定位与证据边界。" : `已选择 ${selected.length}/3 项`}</p></div>
        {selectedRecords.length ? <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th>比较项目</th>{selectedRecords.map((record) => <th key={record.id}>{record.name}<small>{record.english}</small></th>)}</tr></thead><tbody>
          <tr><th>类别</th>{selectedRecords.map((record) => <td key={record.id}>{record.category}</td>)}</tr><tr><th>证据</th>{selectedRecords.map((record) => <td key={record.id}><span className="mini-level">{evidenceMeta[record.level].code}</span>{evidenceMeta[record.level].label}</td>)}</tr>
          <tr><th>设计定位</th>{selectedRecords.map((record) => <td key={record.id}>{insights[record.english]?.takeaway}</td>)}</tr><tr><th>优先替换</th>{selectedRecords.map((record) => <td key={record.id}>{getDesignGuide(record).replace}</td>)}</tr><tr><th>证据支持</th>{selectedRecords.map((record) => <td key={record.id}>{supportScope(record).join("、")}</td>)}</tr><tr><th>性质变化</th>{selectedRecords.map((record) => <td key={record.id}>{effectParts(record.effect).slice(0, 4).join("；")}</td>)}</tr><tr><th>主要限制</th>{selectedRecords.map((record) => <td key={record.id}>{insights[record.english]?.caution}</td>)}</tr>
        </tbody></table><button className="clear-comparison" onClick={() => setSelected([])}>清空比较</button></div> : null}
      </section>

      <section className="evidence-section" id="evidence-guide" aria-labelledby="evidence-title">
        <div className="section-heading evidence-heading"><div><p className="eyebrow">ABOUT THE SOURCES</p><h2 id="evidence-title">资料来源说明</h2></div></div>
        <div className="source-note">
          <div className="source-note-intro">
            <h3>我们主要看两件事</h3>
            <p>一是有没有在同一个环肽骨架上做替换对照，二是论文中的结果能不能归到这个残基本身。网页里的证据标记只是帮助区分这两点，不是给论文质量打分。</p>
          </div>
          <div className="source-note-list">
            <article>
              <h3>有同骨架对照</h3>
              <p>这类数据最适合判断某个替换对渗透性、稳定性或口服暴露产生了什么影响，因此会优先列出具体实验结果。</p>
            </article>
            <article>
              <h3>来自完整分子</h3>
              <p>如果一个残基只出现在高渗透环肽、天然产物或口服药物中，它可以作为候选参考，但不能把整个分子的表现归因于这一处残基。</p>
            </article>
            <article>
              <h3>来自专利</h3>
              <p>专利主要用来补充论文里较少见的候选。已经合成并给出实验数据的实例，参考价值高于只出现在结构范围或权利要求中的残基。</p>
            </article>
          </div>
        </div>
      </section>

      <section className="literature-section" id="literature" aria-labelledby="literature-title">
        <div className="section-heading light literature-heading"><div><p className="eyebrow">PAPERS · PATENTS · PROVENANCE</p><h2 id="literature-title">文献与专利库</h2></div><button className="literature-toggle" onClick={() => setLiteratureOpen((current) => !current)} aria-expanded={literatureOpen} aria-controls="literature-list"><span>{literatureOpen ? "收起文献" : `展开文献（${literatureSources.length}）`}</span><b>{literatureOpen ? "−" : "+"}</b></button></div>
        {literatureOpen && <div className="literature-list" id="literature-list">{literatureSources.map((source, index) => <a href={source.href} target="_blank" rel="noreferrer" key={source.href}><span>{String(index + 1).padStart(2, "0")}</span><strong>{source.paper}</strong><small>{source.residue}</small><em>{evidenceMeta[source.level].code}级</em><b>↗</b></a>)}</div>}
      </section>

      <footer><div><strong>口服环肽非天然残基证据库</strong><span>Version 2.2 · Evidence-curated research database</span></div><p>用于候选生成与实验讨论。任何替换都应保留母体环肽对照，并同步评估活性、PAMPA/Caco-2、溶解度及胃肠/代谢稳定性。</p></footer>
    </main>
  );
}
