"use client";

import { useState } from "react";

type Residue = {
  name: string;
  english: string;
  effect: string;
  evidence: string;
  paper: string;
  href: string;
  level: "直接证据" | "骨架证据";
};

type ResidueGroup = {
  id: string;
  title: string;
  english: string;
  summary: string;
  residues: Residue[];
};

const groups: ResidueGroup[] = [
  {
    id: "n-methyl",
    title: "N-甲基氨基酸",
    english: "N-methyl amino acids",
    summary: "减少骨架氢键供体并改变局部构象；这是口服环肽中证据最充分的一类改造，但效果高度依赖位置。",
    residues: [
      {
        name: "N-甲基-D-亮氨酸",
        english: "N-Me-D-Leu",
        effect: "同时引入 D-构型与骨架 N-甲基化，可降低暴露极性、限制构象，并提高抗蛋白酶能力。",
        evidence: "含 N-Me-D-Leu 的环六肽同时包含 N-Me-Leu 与 N-Me-Tyr，在大鼠中达到 28% 口服生物利用度。该结果支持把 N-Me-D-Leu 作为高优先级候选，但不能把整分子的口服效果归因于单一残基。",
        paper: "White et al., Nature Chemical Biology, 2011",
        href: "https://pubmed.ncbi.nlm.nih.gov/21946276/",
        level: "骨架证据",
      },
      {
        name: "N-甲基亮氨酸",
        english: "N-Me-Leu",
        effect: "保留亮氨酸疏水侧链，同时去除一个骨架 NH；适合连接或扩大连续疏水表面。",
        evidence: "代表性环六肽 Leu–N-Me-D-Leu–N-Me-Leu–Leu–D-Pro–N-Me-Tyr 的 RRCK Papp 为 13.0 × 10⁻⁶ cm/s，是同系列中渗透性最高的骨架之一。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基异亮氨酸",
        english: "N-Me-Ile",
        effect: "支链疏水侧链有利于膜分配；N-甲基化进一步降低骨架去溶剂化代价。",
        evidence: "在同一环六肽骨架中以 N-Me-Ile 替换 N-Me-Leu 后，RRCK Papp 为 8.9 × 10⁻⁶ cm/s，证明该残基可支持较高被动渗透。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基丙氨酸",
        english: "N-Me-Ala / D-N-Me-Ala",
        effect: "体积小，适合在不显著增加疏水体积的情况下屏蔽一个骨架 NH，并重新组织大环构象。",
        evidence: "环十肽中将 D-Pro 改为 D-N-Me-Ala，仅减少一个侧链亚甲基，就形成新的鞍形低介电构象，使 4 个骨架 NH 被屏蔽并得到高渗透骨架。",
        paper: "Kelly et al., Journal of the American Chemical Society, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38330910/",
        level: "直接证据",
      },
      {
        name: "N-甲基苏氨酸",
        english: "N-Me-Thr",
        effect: "兼具极性侧链与骨架 NH 屏蔽，可用于尝试在溶解度与渗透性之间取得平衡。",
        evidence: "在相同环六肽骨架的单点替换系列中，N-Me-Thr 类似物的 RRCK Papp 为 4.7 × 10⁻⁶ cm/s，优于 N-Me-Ser、N-Me-Lys 和 N-Me-Asp 类似物。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基酪氨酸",
        english: "N-Me-Tyr",
        effect: "芳香侧链可作为膜结合疏水锚点；N-甲基化同时屏蔽骨架供氢能力。",
        evidence: "N-Me-Tyr 出现在 28% 大鼠口服生物利用度的环六肽以及多个可渗透类似物中。现有数据支持它作为渗透骨架的一部分，但没有证明它单独即可提高吸收。",
        paper: "White et al., Nature Chemical Biology, 2011",
        href: "https://pubmed.ncbi.nlm.nih.gov/21946276/",
        level: "骨架证据",
      },
    ],
  },
  {
    id: "d-amino",
    title: "D-氨基酸",
    english: "D-amino acids",
    summary: "反转立体化学以改变转角和蛋白酶识别；适合放在构象控制位，不宜盲目替换直接参与靶点结合的残基。",
    residues: [
      {
        name: "D-脯氨酸",
        english: "D-Pro",
        effect: "是强转角诱导单元，可在 β-turn 的 i+1 位稳定 β-hairpin，同时减少构象自由度和蛋白酶识别。",
        evidence: "在环十肽骨架的 β-turn i+1 位引入 D-Pro，同时改善渗透性与清除性质，并获得良好的口服暴露。",
        paper: "Fouché et al., ChemMedChem, 2016",
        href: "https://pubmed.ncbi.nlm.nih.gov/27154275/",
        level: "直接证据",
      },
      {
        name: "D-丙氨酸",
        english: "D-Ala",
        effect: "可诱导特定 II 型 β-turn，并与邻位 N-甲基化协同形成较紧凑、低暴露极性的骨架。",
        evidence: "在 54 个环六肽中，高 Caco-2 渗透模板均围绕 D-Ala 组织转角；N-甲基化 D-Ala 或其邻位是形成高渗透模板的关键条件。",
        paper: "Beck et al., Journal of the American Chemical Society, 2012",
        href: "https://pubmed.ncbi.nlm.nih.gov/22737969/",
        level: "骨架证据",
      },
    ],
  },
  {
    id: "alpha-disubstituted",
    title: "α,α-二取代氨基酸",
    english: "α,α-disubstituted amino acids",
    summary: "通过 α-碳双取代限制主链构象；目前与口服环肽最直接相关的代表是 Aib。",
    residues: [
      {
        name: "α-氨基异丁酸",
        english: "Aib · α-aminoisobutyric acid",
        effect: "促进 γ-turn 和鞍形构象，稳定分子内氢键，并减少从水相进入膜环境所需的构象重排。",
        evidence: "对多个 6–8 元环肽进行 Pro→Aib 替换后，柔性骨架的被动渗透性最高提高约 8 倍，并在小鼠中提高口服生物利用度；已高度预组织的骨架则未必受益。",
        paper: "Raj et al., Journal of Medicinal Chemistry, 2026",
        href: "https://pubmed.ncbi.nlm.nih.gov/41797579/",
        level: "直接证据",
      },
    ],
  },
  {
    id: "gamma-amino",
    title: "γ-氨基酸",
    english: "γ-amino acids",
    summary: "延长主链并重塑分子内氢键网络；适合同时优化溶解度、渗透性和代谢稳定性。",
    residues: [
      {
        name: "Statine",
        english: "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid",
        effect: "延长骨架并提供羟基/支链疏水组合，可重排转角与分子内氢键，增加水溶性并降低代谢暴露位点。",
        evidence: "含 statine 的环六肽通常比对应非-statine 骨架更水溶，许多分子的膜渗透性和肝微粒体稳定性也更高；其中一个化合物的大鼠口服生物利用度为 21%。",
        paper: "Bockus et al., Journal of Medicinal Chemistry, 2015",
        href: "https://pubmed.ncbi.nlm.nih.gov/25950816/",
        level: "直接证据",
      },
    ],
  },
  {
    id: "cyclic-beta",
    title: "环状 β-氨基酸",
    english: "cyclic β²,³-amino acids",
    summary: "刚化大环并提高抗酶解能力；当前证据主要支持稳定性和活性，尚不能直接等同于提高口服吸收。",
    residues: [
      {
        name: "反式-2-氨基环戊烷羧酸",
        english: "(1R,2S)-2-ACPC · β¹",
        effect: "限制 β-骨架构象，可稳定转角/折叠并显著阻碍血清蛋白酶降解。",
        evidence: "含 β¹ 的宏环肽 BM3 和 BM7 对 SARS-CoV-2 Mpro 保持纳摩尔抑制活性，血清半衰期分别达到 48 h 与 >168 h；替换为 Ala 后稳定性和活性均下降。",
        paper: "Miura et al., Bulletin of the Chemical Society of Japan, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38828441/",
        level: "直接证据",
      },
      {
        name: "顺式-2-氨基环己烷羧酸",
        english: "(1S,2S)-2-ACHC · β²",
        effect: "六元环 β-骨架具有强转角诱导能力，可刚化局部构象并提高血清稳定性。",
        evidence: "β² 与 β¹ 一同出现在高活性、高血清稳定性的 BM3/BM7 中；另一项宏环肽研究显示 (1S,2S)-2-ACHC 可诱导两个 γ-turn 并形成稳定 β-sheet。",
        paper: "Miura et al., Bulletin of the Chemical Society of Japan, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38828441/",
        level: "骨架证据",
      },
    ],
  },
  {
    id: "sidechain-hbond",
    title: "侧链-主链氢键型非天然氨基酸",
    english: "side-chain-to-backbone H-bonding residues",
    summary: "用侧链受体遮蔽暴露的骨架 NH，在不单纯增加脂溶性的情况下兼顾溶解度与渗透性。",
    residues: [
      {
        name: "N,N-吡咯烷基谷氨酰胺",
        english: "Pye · N,N-pyrrolidinylglutamine",
        effect: "侧链酰胺是强氢键受体且没有供体，可与暴露的骨架 NH 形成侧链-主链分子内氢键。",
        evidence: "在环六肽非对映体中，特定 Leu→Pye 替换同时显著提高水溶性以及 PAMPA/Caco-2 渗透性，并由结构实验观察到侧链-主链氢键。",
        paper: "Taechalertpaisarn et al., Journal of Medicinal Chemistry, 2022",
        href: "https://pubmed.ncbi.nlm.nih.gov/35275623/",
        level: "直接证据",
      },
    ],
  },
];

export default function Home() {
  const [openGroups, setOpenGroups] = useState<string[]>(["n-methyl"]);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const allOpen = openGroups.length === groups.length;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="返回页面顶部">
          <span className="brand-mark" aria-hidden="true">CP</span>
          <span>环肽非天然氨基酸库</span>
        </a>
        <span className="header-note">点击大类查看具体残基</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">ORAL CYCLIC PEPTIDE · RESIDUE LIBRARY</p>
        <h1>适用于口服环肽研发的<br /><em>非天然氨基酸实例</em></h1>
        <p className="lede">按大类展开，查看具体氨基酸、可能带来的性质变化，以及对应的原始论文证据。</p>
      </section>

      <section className="library" aria-labelledby="library-title">
        <div className="library-heading">
          <div>
            <p className="eyebrow">EVIDENCE-BACKED EXAMPLES</p>
            <h2 id="library-title">氨基酸大类与具体实例</h2>
          </div>
          <button
            className="expand-control"
            onClick={() => setOpenGroups(allOpen ? [] : groups.map((group) => group.id))}
          >
            {allOpen ? "全部收起" : "全部展开"}
          </button>
        </div>

        <div className="accordion-list">
          {groups.map((group, groupIndex) => {
            const isOpen = openGroups.includes(group.id);
            return (
              <article className={`accordion ${isOpen ? "open" : ""}`} key={group.id}>
                <button
                  className="accordion-trigger"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${group.id}-content`}
                >
                  <span className="group-index">{String(groupIndex + 1).padStart(2, "0")}</span>
                  <span className="group-title">
                    <strong>{group.title}</strong>
                    <small>{group.english}</small>
                  </span>
                  <span className="group-summary">{group.summary}</span>
                  <span className="group-count">{group.residues.length} 个实例</span>
                  <span className="chevron" aria-hidden="true">⌄</span>
                </button>

                {isOpen && (
                  <div className="accordion-content" id={`${group.id}-content`}>
                    {group.residues.map((residue, residueIndex) => (
                      <section className="residue-row" key={residue.english}>
                        <div className="residue-identity">
                          <span>{String(residueIndex + 1).padStart(2, "0")}</span>
                          <h3>{residue.name}</h3>
                          <p>{residue.english}</p>
                        </div>
                        <div className="residue-detail">
                          <div>
                            <h4>主要作用</h4>
                            <p>{residue.effect}</p>
                          </div>
                          <div>
                            <h4>论文证据</h4>
                            <p>{residue.evidence}</p>
                          </div>
                        </div>
                        <a className="paper-link" href={residue.href} target="_blank" rel="noreferrer">
                          <span>{residue.level}</span>
                          <strong>{residue.paper}</strong>
                          <small>打开论文 ↗</small>
                        </a>
                      </section>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <footer>
        <strong>口服环肽非天然氨基酸证据库</strong>
        <span>仅保留有代表性环肽实验依据的候选；具体效果仍取决于替换位置与整体构象。</span>
      </footer>
    </main>
  );
}
