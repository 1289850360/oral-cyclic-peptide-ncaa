export type NaturalParentPropertyReview = {
  status: "具体残基证据" | "同骨架证据" | "完整肽证据" | "同类修饰参考" | "结构规则建议";
  plainMeaning: string;
  preferredPositions: string;
  positionsToAvoid: string;
  evidenceSummary: string;
  boundary: string;
  sources: Array<{ title: string; url: string }>;
};

const nMethylSource = {
  title: "Goetz et al., ACS Med. Chem. Lett. 2014 · 环肽N-甲基化与渗透性",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/",
};
const halogenSource = {
  title: "Gentry et al., Peptides 1999 · 卤代苯丙氨酸肽的稳定性、脂溶性与BBB渗透",
  url: "https://pubmed.ncbi.nlm.nih.gov/10573295/",
};
const fluoroprolineSource = {
  title: "Lin & Horng, Amino Acids 2014 · 氟脯氨酸的位置依赖构象效应",
  url: "https://pubmed.ncbi.nlm.nih.gov/24947982/",
};
const constrainedSource = {
  title: "Kusumoto et al., ACS Med. Chem. Lett. 2022 · α-甲基残基定点替换实验",
  url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9575168/",
};
const aromaticSource = {
  title: "Ramalhete et al., Faraday Discuss. 2017 · 芳香氨基酸卤代与组装性质",
  url: "https://pubmed.ncbi.nlm.nih.gov/28736783/",
};

const family = (
  plainMeaning: string,
  preferredPositions: string,
  positionsToAvoid: string,
  evidenceSummary: string,
  sources: NaturalParentPropertyReview["sources"],
): NaturalParentPropertyReview => ({
  status: "同类修饰参考",
  plainMeaning,
  preferredPositions,
  positionsToAvoid,
  evidenceSummary,
  boundary: "论文支持的是同一种改造思路，不是这个CCD残基在当前肽中的单点对照。它只能用于决定先试哪些位置，不能写成该残基已经确定改善性质。",
  sources,
});

const nMethyl = family(
  "给肽链酰胺氮加甲基，通常用于减少暴露的氢键供体并改变折叠。",
  "优先扫描溶剂暴露、不是关键结合氢键、且靠近D-残基或转角的主链酰胺位置。",
  "不要直接替换承担关键受体氢键、催化作用或必须保持特定顺反构象的位置。",
  "多组环肽实验表明N-甲基化可以提高渗透性，但方向和幅度强烈依赖甲基放在哪里。",
  [nMethylSource],
);
const constrained = family(
  "在α位加碳取代或形成小环，主要作用是限制主链能采取的构象。",
  "优先试在需要固定转角、减少柔性或靠近已知蛋白酶切点的位置。",
  "避免直接放入空间很紧的结合口袋；也不要默认每个位置都会提高稳定性或渗透性。",
  "同骨架定点实验显示，正确位置的α-甲基化可改善稳定性和细胞活性，但换到其他位置可能没有好处。",
  [constrainedSource],
);
const halogenAromatic = family(
  "在芳香侧链上加卤素，用来调整疏水性、电子性质和芳香相互作用。",
  "优先试在原本就是Phe、Tyr、Trp等芳香残基，并朝向疏水口袋、膜界面或溶剂的位置。",
  "如果原侧链羟基或芳环位置承担精确氢键、空间又很拥挤，应先做结构检查再替换。",
  "同系列肽的对照显示，对位氯或溴取代可增加脂溶性并提高体外血脑屏障渗透；氟取代不一定同方向。",
  [halogenSource, aromaticSource],
);
const proline = family(
  "改造脯氨酸环，主要用于改变环皱折、前一肽键的顺反比例和转角形状。",
  "优先试在天然Pro已经形成转角的位置，并根据需要的cis/trans构象选择取代立体化学。",
  "不能脱离三维结构随意替换；相反立体化学可能把稳定作用变成去稳定作用。",
  "氟脯氨酸和羟基脯氨酸研究都显示效应与位置、立体化学和周围序列密切相关。",
  [fluoroprolineSource],
);
const exact = (status: NaturalParentPropertyReview["status"], plainMeaning: string, preferredPositions: string, positionsToAvoid: string, evidenceSummary: string, boundary: string, sources: NaturalParentPropertyReview["sources"]): NaturalParentPropertyReview => ({
  status, plainMeaning, preferredPositions, positionsToAvoid, evidenceSummary, boundary, sources,
});

export const naturalParentPropertyReview50: Record<string, NaturalParentPropertyReview> = {
  "200": exact("具体残基证据", "把Phe芳环对位的氢换成氯，主要增加疏水性并改变膜分配。", "优先考虑原Phe朝向膜界面或疏水口袋的位置。", "避开狭小口袋；不能把血脑屏障结果直接外推到所有环肽。", "对位氯代Phe在同系列脑啡肽中显著提高脂溶性和体外血脑屏障渗透，肽稳定性半衰期超过300分钟。", "这是具体取代类型的同系列肽对照，但肽骨架不是当前所有项目的通用骨架。", [halogenSource]),
  "A1A8T": exact("同骨架证据", "α-甲基缬氨酸用于限制局部主链构象。", "原肽第4位Val在已报道HIV-1宏环骨架中是优先位置。", "其他位置不一定有效，应逐位扫描。", "第4位定点替换改善了人肝S9稳定性和细胞抗病毒活性。", "结果只适用于论文中的同一宏环骨架和替换位置。", [constrainedSource]),
  "ABA": exact("具体残基证据", "把Ala侧链从甲基延长为乙基，可增加一点疏水体积。", "可优先试在蛋白酶切点邻近、且口袋能容纳稍大侧链的位置。", "若Ala位于紧密转角或小口袋，不应直接替换。", "已有GLP-1类似物研究支持该残基可参与提高血浆稳定性。", "完整效果仍与肽序列及其他改造共同相关。", [{ title: "Green et al., Diabetologia 2004 · GLP-1非天然残基稳定性", url: "https://pubmed.ncbi.nlm.nih.gov/15246869/" }]),
  "AIB": exact("具体残基证据", "Aib是α,α-二取代残基，常用来限制构象并阻挡蛋白酶。", "优先试在需要固定螺旋/转角或已知蛋白酶敏感位置。", "位阻较大，紧密结合位点需要逐位验证。", "多项同骨架研究直接测到Aib替换可改善蛋白酶稳定性，部分骨架同时改善口服暴露。", "不能把某一条肽的改善幅度当作Aib的固定数值。", [constrainedSource]),
  "3WX": exact("同骨架证据", "α-甲基脯氨酸同时改变Pro环和α位位阻。", "优先试在已知Pro转角且希望降低柔性的位点。", "避开必须采用相反环皱折或空间紧张的位置。", "同一宏环肽中的定点替换提供了稳定性和活性比较。", "位置依赖，不能推广到所有Pro位点。", [constrainedSource]),
  "5JP": exact("同骨架证据", "N-甲基Ser减少一个主链氢键供体，但保留侧链羟基。", "优先扫描非关键主链供氢位置，同时保留需要Ser羟基的结合点。", "避免主链N-H直接参与关键结合的位置。", "环肽同骨架系列给出了EPSA和RRCK渗透性实测。", "不是Ser与N-Me-Ser的单点母体对照。", [nMethylSource]),
  "BMT": exact("完整肽证据", "BMT是环孢素中的复杂疏水残基，参与完整分子的折叠和膜相互作用。", "只适合在能容纳大侧链并有明确结构设计依据的位置。", "不宜作为普通Thr的直接通用替代。", "环孢素A证明它与口服环肽骨架相容。", "没有Thr→BMT单点临床对照，口服性属于整个环孢素。", [{ title: "Loosli et al., Helv. Chim. Acta 1985 · 环孢素构象", url: "https://doi.org/10.1002/hlca.19850680319" }]),
  "FCL": exact("同骨架证据", "在Phe芳环间位加氯，改变疏水接触和电子分布。", "优先试在芳香侧链面向疏水结合区的位置。", "空间不足或需要原Phe精确堆积时要谨慎。", "LUNA18相关同系列结构研究支持氯代Phe参与提高结合与分子性能。", "结果属于具体药物骨架，不是所有肽的通用增益。", [{ title: "Tanada et al., JACS 2023 · LUNA18宏环设计", url: "https://doi.org/10.1021/jacs.3c03886" }]),
  "SAR": exact("完整肽证据", "Sar是N-甲基甘氨酸，减少主链供氢并增加柔性相关的构象选择。", "优先用于需要去掉主链N-H、但又不希望增加大侧链的位置。", "关键主链氢键位点不应直接替换。", "Sar存在于环孢素等口服天然产物骨架中。", "只能证明相容性，不能把完整分子的口服性归因于Sar。", [{ title: "Loosli et al., Helv. Chim. Acta 1985 · 环孢素构象", url: "https://doi.org/10.1002/hlca.19850680319" }]),

  "2QZ": nMethyl, "3BY": nMethyl,
  "02K": constrained, "1AC": constrained, "2ML": constrained, "41H": constrained,
  "HY3": proline, "05N": proline, "0LF": proline, "11Q": proline, "3PX": proline, "4FB": proline,
  "2HF": halogenAromatic, "2LT": halogenAromatic, "33W": halogenAromatic, "3CT": halogenAromatic, "3MY": halogenAromatic, "4FW": halogenAromatic,
};
