export type EvidenceLevel = "直接证据" | "骨架证据" | "临床骨架" | "专利证据" | "改造证据";

export type Residue = {
  name: string;
  english: string;
  effect: string;
  evidence: string;
  paper: string;
  href: string;
  level: EvidenceLevel;
  secondary?: {
    paper: string;
    href: string;
    level: EvidenceLevel;
  };
};

export type ResidueGroup = {
  id: string;
  title: string;
  english: string;
  summary: string;
  residues: Residue[];
};

export const groups: ResidueGroup[] = [
  {
    id: "n-methyl",
    title: "N-甲基氨基酸",
    english: "N-methyl amino acids",
    summary: "减少骨架氢键供体并改变局部构象；这是口服环肽中证据最充分的一类改造，但效果高度依赖位置。",
    residues: [
      {
        name: "N-甲基-D-亮氨酸",
        english: "N-Me-D-Leu",
        effect: "疏水性 ↑；骨架氢键供体 ↓；暴露极性与亲水性 ↓；被动渗透性、蛋白酶稳定性通常 ↑。D-构型与 N-甲基化共同限制构象。",
        evidence: "含 N-Me-D-Leu 的环六肽同时包含 N-Me-Leu 与 N-Me-Tyr，在大鼠中达到 28% 口服生物利用度。该结果支持把 N-Me-D-Leu 作为高优先级候选，但不能把整分子的口服效果归因于单一残基。",
        paper: "White et al., Nature Chemical Biology, 2011",
        href: "https://pubmed.ncbi.nlm.nih.gov/21946276/",
        level: "骨架证据",
      },
      {
        name: "N-甲基亮氨酸",
        english: "N-Me-Leu",
        effect: "疏水性 ↑；骨架氢键供体 ↓；亲水性与去溶剂化代价 ↓；膜分配和被动渗透性通常 ↑。适合扩大环肽的连续疏水表面。",
        evidence: "代表性环六肽 Leu–N-Me-D-Leu–N-Me-Leu–Leu–D-Pro–N-Me-Tyr 的 RRCK Papp 为 13.0 × 10⁻⁶ cm/s，是同系列中渗透性最高的骨架之一。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基异亮氨酸",
        english: "N-Me-Ile",
        effect: "疏水性 ↑；骨架氢键供体 ↓；暴露极性 ↓；膜分配与被动渗透性通常 ↑。支链侧链还能限制局部构象。",
        evidence: "在同一环六肽骨架中以 N-Me-Ile 替换 N-Me-Leu 后，RRCK Papp 为 8.9 × 10⁻⁶ cm/s，证明该残基可支持较高被动渗透。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基丙氨酸",
        english: "N-Me-Ala / D-N-Me-Ala",
        effect: "骨架氢键供体 ↓；暴露极性 ↓；构象预组织与被动渗透性可能 ↑；疏水性变化较小。适合在不明显增加脂溶性的情况下屏蔽主链 NH。",
        evidence: "环十肽中将 D-Pro 改为 D-N-Me-Ala，仅减少一个侧链亚甲基，就形成新的鞍形低介电构象，使 4 个骨架 NH 被屏蔽并得到高渗透骨架。",
        paper: "Kelly et al., Journal of the American Chemical Society, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38330910/",
        level: "直接证据",
      },
      {
        name: "N-甲基苏氨酸",
        english: "N-Me-Thr",
        effect: "骨架氢键供体 ↓；侧链羟基保留亲水性；水溶性较疏水 N-甲基残基更好；被动渗透性可适度 ↑。用于平衡溶解度与膜通透。",
        evidence: "在相同环六肽骨架的单点替换系列中，N-Me-Thr 类似物的 RRCK Papp 为 4.7 × 10⁻⁶ cm/s，优于 N-Me-Ser、N-Me-Lys 和 N-Me-Asp 类似物。",
        paper: "Goetz et al., ACS Medicinal Chemistry Letters, 2014",
        href: "https://pubmed.ncbi.nlm.nih.gov/25313332/",
        level: "直接证据",
      },
      {
        name: "N-甲基酪氨酸",
        english: "N-Me-Tyr",
        effect: "疏水性与膜分配 ↑；骨架氢键供体 ↓；暴露极性 ↓；被动渗透性可能 ↑。酚羟基仍保留一定亲水性和靶点氢键能力。",
        evidence: "N-Me-Tyr 出现在 28% 大鼠口服生物利用度的环六肽以及多个可渗透类似物中。现有数据支持它作为渗透骨架的一部分，但没有证明它单独即可提高吸收。",
        paper: "White et al., Nature Chemical Biology, 2011",
        href: "https://pubmed.ncbi.nlm.nih.gov/21946276/",
        level: "骨架证据",
      },
      {
        name: "N-甲基-D-色氨酸",
        english: "N-Me-D-Trp",
        effect: "疏水性与膜分配 ↑；骨架氢键供体 ↓；构象刚性和抗酶解性 ↑；被动渗透性可能 ↑。注意吲哚 NH 仍是氢键供体。",
        evidence: "口服生长抑素类似物 cyclo(-Pro-Phe-N-Me-D-Trp-N-Me-Lys-Thr-N-Me-Phe-) 含该残基；对相关骨架的全 N-甲基扫描得到约 10% 口服生物利用度的三 N-甲基类似物。它适合在保留芳香结合位点的同时进行转角和渗透性优化。",
        paper: "Chatterjee et al., Angewandte Chemie, 2008",
        href: "https://pubmed.ncbi.nlm.nih.gov/18636716/",
        level: "骨架证据",
      },
      {
        name: "N-甲基赖氨酸",
        english: "N-Me-Lys",
        effect: "骨架氢键供体 ↓，但侧链正电荷与亲水性仍高；水溶性通常 ↑；若电荷暴露，被动渗透性可能 ↓。仅适合电荷可被埋藏或参与靶点结合的位置。",
        evidence: "N-Me-Lys 出现在具有口服活性的三 N-甲基生长抑素类似物中，但在另一环六肽单点替换系列中渗透性较低，说明它不是普适增渗残基，而是适合在能把侧链电荷埋藏或参与结合的位置使用。",
        paper: "Beck et al., Journal of the American Chemical Society, 2012",
        href: "https://pubmed.ncbi.nlm.nih.gov/22737969/",
        level: "骨架证据",
      },
      {
        name: "N-甲基苯丙氨酸",
        english: "N-Me-Phe",
        effect: "疏水性与膜分配 ↑；骨架氢键供体和暴露极性 ↓；被动渗透性与抗酶解性通常 ↑；芳环还可参与疏水和 π 相互作用。",
        evidence: "N-Me-Phe 是口服生长抑素类似物中的两个关键芳香 N-甲基单元之一；相关全扫描研究表明，合适的三 N-甲基组合可显著提高代谢稳定性、肠渗透性并达到约 10% 口服生物利用度。",
        paper: "Chatterjee et al., Angewandte Chemie, 2008",
        href: "https://pubmed.ncbi.nlm.nih.gov/18636716/",
        level: "骨架证据",
      },
      {
        name: "N-甲基缬氨酸",
        english: "N-Me-Val",
        effect: "疏水性 ↑；骨架氢键供体 ↓；亲水性与暴露极性 ↓；膜分配、被动渗透性和抗酶解性可能 ↑。适合构建紧凑疏水核心。",
        evidence: "N-Me-Val 位于口服环肽经典参照物环孢素 A 的第 11 位。环孢素 A 含 7 个 N-甲基残基，健康受试者研究报告平均口服生物利用度约 20.8%；该证据证明 N-Me-Val 可兼容口服骨架，但不能证明单独替换即可增渗。",
        paper: "Loor et al., Journal of Medicinal Chemistry, 2002",
        href: "https://pubmed.ncbi.nlm.nih.gov/12361387/",
        level: "临床骨架",
        secondary: {
          paper: "Gupta & Benet, Biopharmaceutics & Drug Disposition, 1989",
          href: "https://pubmed.ncbi.nlm.nih.gov/2611359/",
          level: "临床骨架",
        },
      },
      {
        name: "肌氨酸（N-甲基甘氨酸）",
        english: "Sarcosine · Sar · N-Me-Gly",
        effect: "骨架氢键供体与暴露极性 ↓；抗蛋白酶能力 ↑；若形成紧凑转角，被动渗透性可能 ↑；本身不会明显增加疏水性。可能增加 cis/trans 构象异质性。",
        evidence: "Sar 位于环孢素 A 的第 3 位并参与 Sar–MeLeu 的 II′ 型 β-turn。环孢素的人体口服吸收证明该单元可存在于成功口服骨架中；更适合作为转角扫描残基，而不是被视为独立的增渗基团。",
        paper: "Loosli et al., Helvetica Chimica Acta, 1985",
        href: "https://doi.org/10.1002/hlca.19850680319",
        level: "临床骨架",
        secondary: {
          paper: "Gupta & Benet, Biopharmaceutics & Drug Disposition, 1989",
          href: "https://pubmed.ncbi.nlm.nih.gov/2611359/",
          level: "临床骨架",
        },
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
        effect: "构象刚性、转角形成和蛋白酶稳定性 ↑；通过折叠遮蔽主链极性后，被动渗透性可能 ↑；疏水性变化不大。适合 β-turn 构象控制位。",
        evidence: "在环十肽骨架的 β-turn i+1 位引入 D-Pro，同时改善渗透性与清除性质，并获得良好的口服暴露。",
        paper: "Fouché et al., ChemMedChem, 2016",
        href: "https://pubmed.ncbi.nlm.nih.gov/27154275/",
        level: "直接证据",
      },
      {
        name: "D-丙氨酸",
        english: "D-Ala",
        effect: "蛋白酶稳定性与构象预组织 ↑；形成紧凑转角后暴露极性 ↓、被动渗透性可能 ↑；疏水性基本不变。常与邻位 N-甲基化协同。",
        evidence: "在 54 个环六肽中，高 Caco-2 渗透模板均围绕 D-Ala 组织转角；N-甲基化 D-Ala 或其邻位是形成高渗透模板的关键条件。",
        paper: "Beck et al., Journal of the American Chemical Society, 2012",
        href: "https://pubmed.ncbi.nlm.nih.gov/22737969/",
        level: "骨架证据",
      },
      {
        name: "D-缬氨酸",
        english: "D-Val",
        effect: "疏水性、膜分配和蛋白酶稳定性 ↑；反转立体化学可降低构象自由度与暴露极性；在合适骨架中被动渗透性可能 ↑。",
        evidence: "可渗透八肽 D8.31 由 D-Ala–D-Pro–N-Me-D-Leu–D-Val 重复单元构成；该系列研究共获得 84 个 Papp >1 × 10⁻⁶ cm/s 的 6–12 元大环。专利进一步把 D-氨基酸及 N-甲基-D-氨基酸列为可替换的构象模块。",
        paper: "Bhardwaj et al., Cell, 2022",
        href: "https://pubmed.ncbi.nlm.nih.gov/36041435/",
        level: "骨架证据",
        secondary: {
          paper: "WO2023137326A2, University of Washington",
          href: "https://patents.google.com/patent/WO2023137326A2/en",
          level: "专利证据",
        },
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
        effect: "构象刚性与分子内氢键 ↑；暴露极性和膜去溶剂化代价 ↓；柔性骨架中的被动渗透性、口服暴露和抗酶解性可 ↑；疏水性变化较小。",
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
        effect: "水溶性 ↑；支链维持疏水接触；分子内氢键与构象预组织 ↑；被动渗透性和微粒体稳定性可同时 ↑。羟基有助于避免因过度脂溶而溶解度下降。",
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
        name: "β-高脯氨酸",
        english: "β-homoproline · β-HPro",
        effect: "构象刚性、胃肠蛋白酶稳定性和微粒体稳定性 ↑；在优化骨架中被动渗透性与口服暴露 ↑；疏水性仅轻度变化。可改变小环肽的转角几何。",
        evidence: "β-homoproline 在血栓酶抑制剂的渗透性优化阶段被固定保留；最终五构件环肽 46 同时具有高 PAMPA 渗透性、胃肠/微粒体稳定性，并在大鼠中达到 18.4 ± 1.9% 口服生物利用度。",
        paper: "Merz et al., Nature Chemical Biology, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38155304/",
        level: "直接证据",
      },
      {
        name: "反式-2-氨基环戊烷羧酸",
        english: "(1R,2S)-2-ACPC · β¹",
        effect: "疏水性与构象刚性 ↑；血清蛋白酶稳定性显著 ↑；可能通过紧凑折叠降低暴露极性，但是否直接提高口服渗透性尚未证实。",
        evidence: "含 β¹ 的宏环肽 BM3 和 BM7 对 SARS-CoV-2 Mpro 保持纳摩尔抑制活性，血清半衰期分别达到 48 h 与 >168 h；替换为 Ala 后稳定性和活性均下降。",
        paper: "Miura et al., Bulletin of the Chemical Society of Japan, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38828441/",
        level: "直接证据",
      },
      {
        name: "顺式-2-氨基环己烷羧酸",
        english: "(1S,2S)-2-ACHC · β²",
        effect: "疏水性、局部刚性和转角形成能力 ↑；血清稳定性 ↑；可能减少暴露极性，但直接提高被动渗透性或口服吸收的证据仍不足。",
        evidence: "β² 与 β¹ 一同出现在高活性、高血清稳定性的 BM3/BM7 中；另一项宏环肽研究显示 (1S,2S)-2-ACHC 可诱导两个 γ-turn 并形成稳定 β-sheet。",
        paper: "Miura et al., Bulletin of the Chemical Society of Japan, 2024",
        href: "https://pubmed.ncbi.nlm.nih.gov/38828441/",
        level: "骨架证据",
      },
    ],
  },
  {
    id: "peptoid",
    title: "Peptoid 型 N-取代甘氨酸",
    english: "N-substituted glycine / peptoid residues",
    summary: "把侧链从 α-碳移到酰胺氮，去除一个骨架氢键供体，并提供比单纯 N-甲基化更大的侧链化学空间。",
    residues: [
      {
        name: "N-异丁基甘氨酸",
        english: "NLeu peptoid · N-isobutylglycine",
        effect: "疏水性与膜分配 ↑；骨架氢键供体 ↓；亲水性和去溶剂化代价 ↓；PAMPA/Caco-2 渗透性通常 ↑；对蛋白酶识别也更不敏感。",
        evidence: "在 42 个半肽型大环的 PAMPA/Caco-2 比较中，含 NLeu peptoid 的系列表现出系统性更高的渗透性；作者将其归因于特定位点氢键供体的去除，同时强调个别立体异构体仍可能低渗透。",
        paper: "Furukawa et al., Journal of Medicinal Chemistry, 2021",
        href: "https://doi.org/10.1021/acs.jmedchem.0c02036",
        level: "直接证据",
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
        effect: "水溶性 ↑；侧链-主链分子内氢键 ↑；暴露的骨架 NH 与有效极性 ↓；PAMPA/Caco-2 渗透性 ↑。它不是靠单纯增加脂溶性实现增渗。",
        evidence: "在环六肽非对映体中，特定 Leu→Pye 替换同时显著提高水溶性以及 PAMPA/Caco-2 渗透性，并由结构实验观察到侧链-主链氢键。",
        paper: "Taechalertpaisarn et al., Journal of Medicinal Chemistry, 2022",
        href: "https://pubmed.ncbi.nlm.nih.gov/35275623/",
        level: "直接证据",
      },
    ],
  },
  {
    id: "natural-product-inspired",
    title: "天然产物启发的非蛋白氨基酸",
    english: "natural-product-inspired nonproteinogenic residues",
    summary: "来自已成功口服的环肽天然产物，可作为构象、疏水性和代谢稳定性的参照；属于完整骨架证据而非单点因果证据。",
    residues: [
      {
        name: "MeBmt",
        english: "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine",
        effect: "长烯基使疏水性与膜分配 ↑；N-甲基使骨架氢键供体 ↓；羟基保留一定亲水性；有利于分子内氢键和环境依赖折叠。单独增渗作用尚未证实。",
        evidence: "MeBmt 是环孢素 A 的第 1 位特征非蛋白氨基酸，并被早期构效研究认为是药理活性所需残基之一。环孢素的人体口服吸收证明它可兼容高分子量口服环肽骨架，但不能据此判断 MeBmt 单独提高渗透性。",
        paper: "Wenger, Angewandte Chemie International Edition, 1985",
        href: "https://doi.org/10.1002/anie.198500773",
        level: "临床骨架",
        secondary: {
          paper: "Gupta & Benet, Biopharmaceutics & Drug Disposition, 1989",
          href: "https://pubmed.ncbi.nlm.nih.gov/2611359/",
          level: "临床骨架",
        },
      },
      {
        name: "2-氨基丁酸",
        english: "Abu · L-2-aminobutyric acid",
        effect: "疏水性较 Ala 轻度 ↑、亲水性轻度 ↓；可微调膜分配和疏水表面，但不减少骨架氢键供体；单独提高渗透性或稳定性的证据不足。",
        evidence: "Abu 位于环孢素 A 第 2 位并参与 MeBmt–Abu–Sar 区域的折叠。早期环孢素构效研究将 Abu 列为维持免疫抑制活性的必要残基之一；其价值主要是口服天然产物骨架参照。",
        paper: "Wenger, Angewandte Chemie International Edition, 1985",
        href: "https://doi.org/10.1002/anie.198500773",
        level: "临床骨架",
      },
    ],
  },
  {
    id: "backbone-isosteres",
    title: "骨架等排替换（补充策略）",
    english: "backbone isosteric replacements",
    summary: "严格说不属于新的氨基酸侧链，但与非天然氨基酸扫描高度相关，且已有直接口服或渗透性证据。",
    residues: [
      {
        name: "羟基酸单元（酰胺→酯）",
        english: "hydroxy-acid / depsipeptide substitution",
        effect: "骨架氢键供体、有效极性和去溶剂化代价 ↓；被动渗透性通常 ↑；脂溶性相对 ↑。但酯键可能发生水解，因此需要另外评估胃肠和血浆稳定性。",
        evidence: "模型环六肽中 5 个酰胺→酯类似物的 PAMPA 均显著高于母体，其中 4 个还高于相应 N-甲基类似物；在 8–9 元环中，酯替换也普遍优于恢复为普通酰胺，但与 N-甲基化孰优取决于序列。",
        paper: "Hosono et al., Nature Communications, 2023",
        href: "https://pubmed.ncbi.nlm.nih.gov/36932083/",
        level: "改造证据",
      },
      {
        name: "硫代酰胺化残基（C=O→C=S）",
        english: "thioamide substitution",
        effect: "局部脂溶性与构象刚性 ↑；羰基氢键受体能力和暴露极性 ↓；PAMPA/Caco-2 渗透性、胃肠稳定性及微粒体稳定性均可 ↑。",
        evidence: "单个 O→S 替换使多个 6–8 元大环的 PAMPA/Caco-2 渗透性提高；在疏水环六肽中，优选硫代酰胺类似物口服后的血浆暴露较母体提高约 30、130 或 400 倍，且实验未使用增渗微乳制剂。",
        paper: "Ghosh et al., Nature Communications, 2023",
        href: "https://pubmed.ncbi.nlm.nih.gov/37770425/",
        level: "改造证据",
      },
    ],
  },
];
