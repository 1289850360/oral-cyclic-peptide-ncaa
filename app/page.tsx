"use client";

import { useMemo, useState } from "react";

type Evidence = {
  name: string;
  english: string;
  examples: string;
  priority: "优先" | "扩展";
  effects: string[];
  mechanism: string;
  value: string;
  caution: string;
  evidenceLevel: string;
  papers: Array<{ label: string; finding: string; href: string }>;
};

const entries: Evidence[] = [
  {
    name: "N-甲基氨基酸",
    english: "N-methyl amino acids",
    examples: "N-Me-Ala、N-Me-Leu、N-Me-Phe",
    priority: "优先",
    effects: ["渗透性", "抗酶解", "构象"],
    mechanism: "N-甲基化去除一个骨架 NH 氢键供体，并可改变局部构象、分子内氢键和疏水表面的连续性。",
    value: "是口服环肽中证据最成熟的改造之一；可提高跨膜与肠道渗透，并常伴随蛋白酶稳定性提升。",
    caution: "效果主要取决于甲基化位置，而不是 N-甲基数量；过度甲基化还可能破坏靶点结合构象。",
    evidenceLevel: "动物口服暴露 + 肠道渗透",
    papers: [
      {
        label: "Ovadia et al., Molecular Pharmaceutics, 2011",
        finding: "54 个环六肽中，9/10 个高渗透分子在 D-Ala 邻位含 N-Me；渗透性与 N-Me 总数不直接相关。",
        href: "https://pubmed.ncbi.nlm.nih.gov/21375270/",
      },
      {
        label: "White et al., Nature Chemical Biology, 2011",
        finding: "一个含 3 个 N-Me、分子量 755 Da 的环六肽在大鼠中达到 28% 口服生物利用度。",
        href: "https://pubmed.ncbi.nlm.nih.gov/21946276/",
      },
    ],
  },
  {
    name: "D-氨基酸",
    english: "D-amino acids",
    examples: "优先关注 D-Pro、D-Ala",
    priority: "优先",
    effects: ["构象", "抗酶解", "渗透性"],
    mechanism: "反转侧链立体化学，改变转角偏好和蛋白酶识别；D-Pro 尤其适合稳定 β-turn / β-hairpin。",
    value: "可同时改善骨架预组织、抗酶解能力和清除性质；也常与邻位 N-甲基化组合使用。",
    caution: "不是所有 L→D 替换都有利；如果替换发生在直接参与靶点结合的位置，活性可能下降。",
    evidenceLevel: "动物口服暴露 + 构象证据",
    papers: [
      {
        label: "Fouché et al., ChemMedChem, 2016",
        finding: "在环十肽 β-turn 的 i+1 位引入 D-Pro，有利于渗透性和清除率，并获得较好的口服暴露。",
        href: "https://pubmed.ncbi.nlm.nih.gov/27154275/",
      },
    ],
  },
  {
    name: "Aib",
    english: "α-aminoisobutyric acid",
    examples: "α,α-二取代氨基酸；常测试 Pro→Aib",
    priority: "优先",
    effects: ["构象", "渗透性", "口服暴露"],
    mechanism: "限制主链构象并促进 γ-turn / 螺旋倾向，可稳定分子内氢键、减少暴露极性表面积。",
    value: "特别适合仍较柔性的环肽骨架，可通过预组织降低从水相进入膜环境时的构象代价。",
    caution: "高度依赖骨架；对于本身已经预组织充分的环肽，Aib 可能没有进一步收益。",
    evidenceLevel: "动物口服暴露 + 多种构象实验",
    papers: [
      {
        label: "Raj et al., Journal of Medicinal Chemistry, 2026",
        finding: "在多个 6–8 元环肽中，Pro→Aib 使柔性骨架的渗透性最高提高约 8 倍，并提高小鼠口服暴露。",
        href: "https://pubmed.ncbi.nlm.nih.gov/41797579/",
      },
    ],
  },
  {
    name: "γ-氨基酸",
    english: "γ-amino acids",
    examples: "Statine 及其类似物",
    priority: "优先",
    effects: ["溶解度", "渗透性", "代谢稳定性"],
    mechanism: "延长骨架并重新组织转角与分子内氢键，使环肽获得不同于常规 α-氨基酸骨架的构象空间。",
    value: "少数能够同时改善水溶性、膜渗透性和肝微粒体稳定性的非天然骨架单元。",
    caution: "会明显改变环尺寸与构象，通常需要重新优化邻近残基和环化位点。",
    evidenceLevel: "大鼠口服生物利用度 + ADME",
    papers: [
      {
        label: "Bockus et al., Journal of Medicinal Chemistry, 2015",
        finding: "含 statine 的环六肽通常更水溶，许多分子的渗透性和微粒体稳定性也更好；一个化合物大鼠口服生物利用度为 21%。",
        href: "https://pubmed.ncbi.nlm.nih.gov/25950816/",
      },
    ],
  },
  {
    name: "Pye",
    english: "N,N-pyrrolidinylglutamine",
    examples: "可优先尝试 Leu→Pye",
    priority: "优先",
    effects: ["溶解度", "渗透性", "分子内氢键"],
    mechanism: "侧链带有强氢键受体但没有氢键供体，可与暴露的骨架 NH 形成侧链—主链分子内氢键。",
    value: "与单纯增加疏水性不同，Pye 有机会同时改善通常相互冲突的水溶性和膜渗透性。",
    caution: "效果对位置和骨架都非常敏感；应做 Leu→Pye 的逐位扫描并保留母体对照。",
    evidenceLevel: "PAMPA + Caco-2 + 结构证据",
    papers: [
      {
        label: "Taechalertpaisarn et al., Journal of Medicinal Chemistry, 2022",
        finding: "特定 Leu→Pye 替换显著提高环六肽水溶性和 PAMPA/Caco-2 渗透性，并观察到侧链—主链氢键。",
        href: "https://pubmed.ncbi.nlm.nih.gov/35275623/",
      },
    ],
  },
  {
    name: "环状 β-氨基酸",
    english: "Cyclic β²,³-amino acids",
    examples: "环戊烷/环己烷 β²,³-AA",
    priority: "扩展",
    effects: ["血清稳定性", "抗酶解", "活性"],
    mechanism: "环状 β-骨架单元可压紧并刚化大环构象，使肽链更难被蛋白酶识别，同时维持靶点结合所需形状。",
    value: "如果候选物的主要瓶颈是胃肠道或血清降解，这类残基很值得作为稳定性改造工具。",
    caution: "稳定性证据很强，但现有代表性论文没有直接证明其能提高口服吸收。",
    evidenceLevel: "血清稳定性 + 活性对照",
    papers: [
      {
        label: "Miura et al., Bulletin of the Chemical Society of Japan, 2024",
        finding: "含环状 β²,³-AA 的大环肽血清半衰期达到 48 h 和 >168 h；替换回 Ala 后活性和稳定性均明显下降。",
        href: "https://pubmed.ncbi.nlm.nih.gov/38828441/",
      },
    ],
  },
  {
    name: "Peptoid 残基",
    english: "N-substituted glycine residues",
    examples: "N-取代甘氨酸",
    priority: "扩展",
    effects: ["构象", "渗透性", "脂溶性"],
    mechanism: "将侧链移到主链氮上，去除一个 NH，并可通过取代基调节刚性、脂溶性和环境依赖构象。",
    value: "适合作为构象工程工具：放在转角位可保持刚性，放在 β-strand 位可产生水相柔性、非极性环境刚性的“变色龙”构象。",
    caution: "严格说属于肽模拟物残基而不是 α-氨基酸；位置效应很大，应与构象分析结合。",
    evidenceLevel: "PAMPA + 构象分析",
    papers: [
      {
        label: "Furukawa et al., Angewandte Chemie International Edition, 2020",
        finding: "在环十肽中，转角和 β-strand 位的 peptoid 替换产生不同刚性与变色龙特征，两类均可获得较高渗透性。",
        href: "https://pubmed.ncbi.nlm.nih.gov/32789999/",
      },
    ],
  },
];

const propertyFilters = ["全部", "渗透性", "溶解度", "抗酶解", "代谢稳定性", "构象", "活性"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesFilter = filter === "全部" || entry.effects.some((effect) => effect.includes(filter));
      const haystack = [entry.name, entry.english, entry.examples, entry.mechanism, entry.value, entry.effects.join(" ")].join(" ").toLowerCase();
      return matchesFilter && (!normalized || haystack.includes(normalized));
    });
  }, [query, filter]);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark" aria-hidden="true">CP</span>
          <span>环肽证据库</span>
        </a>
        <nav aria-label="页面导航">
          <a href="#library">候选残基</a>
          <a href="#method">如何使用</a>
          <a href="#sources">证据说明</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">ORAL CYCLIC PEPTIDE · EVIDENCE ATLAS</p>
          <h1>口服环肽<br /><em>非天然氨基酸</em>证据库</h1>
          <p className="lede">快速回答三个问题：<strong>可以引入什么？能获得什么性质？哪篇原始论文支持？</strong></p>
          <div className="stats" aria-label="数据库概览">
            <div><strong>7</strong><span>类候选残基</span></div>
            <div><strong>8</strong><span>篇代表性原始研究</span></div>
            <div><strong>5</strong><span>类优先候选</span></div>
          </div>
        </div>
        <aside className="hero-note">
          <span className="note-index">01</span>
          <p>核心判断</p>
          <h2>位置与构象，通常比“加了多少个非天然氨基酸”更重要。</h2>
          <p className="note-small">所有改造都应保留母体对照，并同步观察活性、渗透性、溶解度和稳定性。</p>
        </aside>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div><p className="eyebrow">RESIDUE LIBRARY</p><h2>候选残基与论文依据</h2></div>
          <p>点击论文标题可直接打开 PubMed 原始记录。</p>
        </div>

        <div className="controls" role="search">
          <label className="search-box">
            <span className="sr-only">搜索候选残基</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、作用或机制，例如 Pye / 渗透性" />
            {query && <button onClick={() => setQuery("")} aria-label="清空搜索">×</button>}
          </label>
          <div className="filters" aria-label="按性质筛选">
            {propertyFilters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
            ))}
          </div>
        </div>

        <p className="result-count">当前显示 {filtered.length} / {entries.length} 类候选</p>

        <div className="card-grid">
          {filtered.map((entry, index) => (
            <article className="residue-card" key={entry.name}>
              <div className="card-topline">
                <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                <span className={`priority ${entry.priority === "优先" ? "primary" : "secondary"}`}>{entry.priority}候选</span>
              </div>
              <div className="card-title">
                <h3>{entry.name}</h3><p>{entry.english}</p><span>{entry.examples}</span>
              </div>
              <div className="tags">{entry.effects.map((effect) => <span key={effect}>{effect}</span>)}</div>
              <dl>
                <div><dt>作用机制</dt><dd>{entry.mechanism}</dd></div>
                <div><dt>口服研发价值</dt><dd>{entry.value}</dd></div>
                <div className="caution"><dt>需要注意</dt><dd>{entry.caution}</dd></div>
              </dl>
              <div className="evidence">
                <div className="evidence-label"><span>证据类型</span><strong>{entry.evidenceLevel}</strong></div>
                {entry.papers.map((paper) => (
                  <a href={paper.href} target="_blank" rel="noreferrer" key={paper.href}>
                    <span className="paper-arrow" aria-hidden="true">↗</span>
                    <strong>{paper.label}</strong><small>{paper.finding}</small>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <strong>没有找到匹配项</strong><p>尝试搜索“N-Me”“稳定性”，或切换到“全部”。</p>
            <button onClick={() => { setQuery(""); setFilter("全部"); }}>重置筛选</button>
          </div>
        )}
      </section>

      <section className="method-section" id="method">
        <div className="section-heading inverse">
          <div><p className="eyebrow">STARTING LIBRARY</p><h2>建议的最小候选库</h2></div>
          <p>先做小规模、可解释的位置扫描，再扩大化学空间。</p>
        </div>
        <div className="steps">
          <article><span>01</span><p>第一层 · 必做</p><h3>N-Me 位置扫描；转角位 Pro→D-Pro 或 Aib；关键疏水位 Leu→Pye。</h3></article>
          <article><span>02</span><p>第二层 · 扩展</p><h3>加入 1 个 statine / γ-氨基酸和 1 个环状 β-氨基酸，观察 ADME 协同变化。</h3></article>
          <article><span>03</span><p>第三层 · 构象探索</p><h3>在转角位与 β-strand 位分别引入 peptoid，比较刚性和环境依赖构象。</h3></article>
        </div>
      </section>

      <section className="source-section" id="sources">
        <p className="eyebrow">HOW TO READ THE EVIDENCE</p>
        <div className="source-layout">
          <h2>网页里的“有用”，<br />不等于“放进去一定有效”。</h2>
          <div>
            <p>证据强度需要区分：动物口服暴露最接近最终目标；PAMPA/Caco-2 主要支持渗透性；血清或微粒体实验主要支持稳定性。不同指标不能相互替代。</p>
            <p>推荐每个改造都保留母体环肽对照，并至少同步测量 <strong>PAMPA/Caco-2、溶解度、SGF/SIF 或血清稳定性、靶点活性</strong>。</p>
          </div>
        </div>
      </section>

      <footer>
        <div><strong>口服环肽非天然氨基酸证据库</strong><span>基于代表性原始研究整理 · 更新于 2026 年 8 月</span></div>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}
