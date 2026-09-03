import type { NaturalParentModification } from "./natural-parent-modifications";
import type { NaturalParentPropertyReview } from "./natural-parent-property-review-50";

const nMethylSource = { title: "Goetz et al., ACS Med. Chem. Lett. 2014 · N-甲基化与环肽渗透性", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4190640/" };
const halogenSource = { title: "Gentry et al., Peptides 1999 · 芳香卤代对肽稳定性、脂溶性和BBB渗透的影响", url: "https://pubmed.ncbi.nlm.nih.gov/10573295/" };
const fluoroprolineSource = { title: "Lin & Horng, Amino Acids 2014 · 氟脯氨酸的位置和立体化学效应", url: "https://pubmed.ncbi.nlm.nih.gov/24947982/" };
const constrainedSource = { title: "Kusumoto et al., ACS Med. Chem. Lett. 2022 · α-甲基残基的定点替换", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9575168/" };

const paperSources = (record: NaturalParentModification) => record.sources
  .filter((source) => !source.title.startsWith("RCSB CCD") && !source.title.startsWith("PDB "))
  .map((source) => ({ title: source.title, url: source.url }));

const fromExistingExperiment = (record: NaturalParentModification): NaturalParentPropertyReview | null => {
  if (record.peptideExperiment.confidence === "结构推断") return null;
  const status = record.peptideExperiment.confidence === "直接对照"
    ? "具体残基证据"
    : record.peptideExperiment.confidence === "同骨架替换"
      ? "同骨架证据"
      : "完整肽证据";
  return {
    status,
    plainMeaning: "该记录已经找到实验资料；结论按实验层级保留，不把完整肽结果拆成固定的单残基增幅。",
    preferredPositions: record.peptideExperiment.confidence === "完整肽支持"
      ? "优先参考论文中的原始序列位置；换到新肽时仍需做逐位替换对照。"
      : "优先从论文已经验证过的对应位置或相似局部环境开始。",
    positionsToAvoid: "承担关键氢键、催化作用或处在紧密结合口袋的位置，不应在没有结构检查时直接替换。",
    evidenceSummary: record.peptideExperiment.measurement,
    boundary: record.peptideExperiment.attributionBoundary,
    sources: paperSources(record),
  };
};

const base = (status: NaturalParentPropertyReview["status"], plainMeaning: string, preferredPositions: string, positionsToAvoid: string, evidenceSummary: string, boundary: string, sources: NaturalParentPropertyReview["sources"] = []): NaturalParentPropertyReview => ({
  status, plainMeaning, preferredPositions, positionsToAvoid, evidenceSummary, boundary, sources,
});

export function buildDefaultPropertyReview(record: NaturalParentModification): NaturalParentPropertyReview {
  const existing = fromExistingExperiment(record);
  if (existing) return existing;

  if (record.reviewStatus === "reviewed-unresolved") {
    return base(
      "结构规则建议",
      "天然母体已经确定，但具体改变发生在哪个原子目前无法唯一定位。",
      "暂不指定肽链替换位置；先结合原始CCD原子表或人工结构叠合确认改造位点。",
      "在修饰位置没有唯一解释前，不应据此设计合成或宣称某种性质会改善。",
      "已完成结构比对和二次核验，但多个原子映射都说得通。",
      "这条记录只能确认母体关系和整体描述符差异，不能给出可靠的位点—性质结论。",
    );
  }

  if (record.reviewStatus === "complex-transformation-resolved") {
    return base(
      "结构规则建议",
      "这条记录不是天然氨基酸的简单单点修饰，而是成环、氧化开环、偶联或较大的骨架重构。",
      "如果要使用，应把它当作完整的特殊构件重新设计肽骨架，不能只指定“替换天然残基的某一个原子”。",
      "不建议把它直接加入普通的逐位氨基酸替换扫描。",
      "母体关系和复杂转化类型已经确认，但没有证明它能在任意肽位置保持相同作用。",
      "结构重构分类不等于性质改善；需要完整构件的合成、构象和性质实验。",
    );
  }

  const text = `${record.naturalParent} ${record.changeLabel} ${record.changedPosition} ${record.structuralChange}`;
  const aromaticParent = /PHE|TYR|TRP|HIS/.test(record.naturalParentCcd);
  const hasHalogen = /新增[^。]*(Cl|Br|F|I)|氟|氯|溴|碘/i.test(text);
  const nModified = /连接到N|氮上|N-甲基|N—CH/.test(text);
  // Atom-count additions alone do not establish a polarity increase: an
  // O-methylation, for example, adds carbon but removes an H-bond donor.
  const extraPolar = /氢键供体\+|氢键受体\+|极性表面积\+/.test(text);
  const moreRigid = /环数\+|可旋转键-/.test(text);

  if (record.naturalParentCcd === "PRO" && hasHalogen) {
    return base(
      "同类修饰参考",
      "脯氨酸环上的卤素会改变环皱折和前一肽键的顺反偏好。",
      "优先在天然Pro已经形成转角的位置试验，并让取代立体化学与目标cis/trans构象匹配。",
      "不要把一种氟脯氨酸在某个位置的结果套到另一立体异构体或另一位置。",
      "同类氟脯氨酸实验确认构象和折叠动力学具有明显的位置依赖性。",
      "这是同类修饰论文，不是当前CCD残基的单点性质实测。",
      [fluoroprolineSource],
    );
  }

  if (nModified) {
    return base(
      "同类修饰参考",
      "氮原子附近的烷基化或酰化通常会减少供氢能力、增加位阻，并改变肽键构象。",
      "优先扫描朝向溶剂、不是关键结合氢键、或靠近转角的主链位置。",
      "关键主链N-H直接参与靶点结合的位置，以及合成上容易发生严重位阻的位置，应避免直接替换。",
      "N-甲基化环肽研究证明这类改造可影响渗透性，但结果取决于修饰类型和所在位置。",
      "当前记录没有本CCD的单点性质对照；同类论文只用于给出筛选方向。",
      [nMethylSource],
    );
  }

  if (hasHalogen && aromaticParent) {
    return base(
      "同类修饰参考",
      "芳香侧链卤代主要调节疏水性、电子分布、芳香堆积和膜分配。",
      "优先试在原本就是芳香残基、并朝向疏水口袋或膜界面的位置。",
      "原侧链承担精确氢键或口袋空间很紧时，应先做结构检查。",
      "同系列肽实验表明氯/溴代可能增加脂溶性和体外膜渗透，但不同卤素并非同一方向。",
      "论文支持芳香卤代这一类策略，不直接证明当前CCD一定改善目标性质。",
      [halogenSource],
    );
  }

  if (record.naturalParentCcd === "PRO") {
    return base(
      "结构规则建议",
      "该改造发生在脯氨酸骨架附近，最可能影响转角、环皱折和肽键顺反比例。",
      "优先考虑天然Pro已经承担转角或构象锁定作用的位置。",
      "没有三维结构或构象数据时，不建议在关键Pro位点直接替换。",
      "结构分析已给出母体和改造差异，但没有当前CCD的修饰前后性质实验。",
      "只能提出构象设计方向，不能写成稳定性、渗透性或活性已经改善。",
    );
  }

  if (moreRigid || /α-碳|alpha|methyl/i.test(text)) {
    return base(
      "同类修饰参考",
      "α位增大、成环或减少可旋转键，通常用于限制局部主链构象。",
      "优先试在需要固定转角、减少柔性或靠近已知蛋白酶切点的位置。",
      "紧密口袋、催化位点及必须保持天然主链构象的位置应谨慎。",
      "α-甲基残基的定点实验显示，正确位置可以改善稳定性或细胞活性，错误位置可能无效。",
      "这是构象限制这一类改造的参考，不是当前CCD的直接实验。",
      [constrainedSource],
    );
  }

  if (extraPolar) {
    return base(
      "结构规则建议",
      "新增极性原子可能增加水相相互作用或形成新的靶点氢键，同时也可能增加跨膜去溶剂化负担。",
      "优先试在朝向溶剂、需要新增氢键或离子作用的侧链位置。",
      "没有配对作用的疏水核心和以被动渗透为首要目标的暴露极性位点应谨慎。",
      "已计算氢键、极性表面积和脂水分配系数变化；尚无该CCD的实验性质对照。",
      "计算描述符只能提示方向，不能等同于实测溶解度、渗透性、稳定性或口服吸收。",
    );
  }

  return base(
    "结构规则建议",
    "该改造主要改变侧链体积、形状或疏水表面，可能影响口袋填充、选择性和整体折叠。",
    "优先试在结构显示还有空间、或天然侧链与靶点接触不足的位置。",
    "空间拥挤的结合核心、催化位点和缺少结构信息的位置不应直接批量替换。",
    "已完成母体—衍生物结构比对和描述符计算，但没有找到该CCD的单点性质实验。",
    "这是一条设计建议，不是性质结论；最终必须用同一肽骨架的母体/衍生物配对实验确认。",
  );
}
