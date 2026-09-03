"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import catalogJson from "../public/ccd-unified-structure-catalog.json";
import analysisJson from "../public/natural-parent-derivative-analysis.json";
import substitutabilityJson from "../public/natural-parent-substitutability-audit.json";
import { naturalAminoAcidParentByCcd, naturalAminoAcidParents } from "./natural-amino-acid-parents";
import { naturalParentModificationByCcd } from "./natural-parent-modifications";
import { ccdDisplayCorrectionById, displayNameForCcd } from "./ccd-display-corrections";

type CatalogRecord = {
  id: string;
  primaryCcdId: string;
  name: string;
  synonyms: string[];
  formula: string;
  parentIds: string[];
  structureImageUrl: string;
  componentClass: { id: string };
};

const allRecords = catalogJson.records as CatalogRecord[];
const catalogRecordByCcd = new Map(allRecords.map((record) => [record.primaryCcdId, record]));
const parentCodes = new Set(naturalAminoAcidParents.map((parent) => parent.ccd));
const records = allRecords.filter((record) => record.componentClass.id === "evidence-reviewed-residue" && record.parentIds.some((parent) => parentCodes.has(parent.toUpperCase())));
type StructureAnalysis = { ccdId: string; status: "auto-structure-difference" | "manual-review"; reason: string; evidenceBoundary?: string };
type SubstitutabilityRecord = { ccdId: string; category: "direct-substitutable-residue" | "conditional-specialized-residue" | "backbone-terminally-modified" | "complex-skeletal-transformation" | "special-adduct-or-label"; reason: string };
const structureAnalysisByCcd = new Map((analysisJson.records as StructureAnalysis[]).map((analysis) => [analysis.ccdId, analysis]));
const substitutabilityByCcd = new Map((substitutabilityJson.records as SubstitutabilityRecord[]).map((record) => [record.ccdId, record]));
const automaticStructureCount = (analysisJson.records as StructureAnalysis[]).filter((analysis) => analysis.status === "auto-structure-difference").length;
const manualStructureCount = (analysisJson.records as StructureAnalysis[]).filter((analysis) => analysis.status === "manual-review").length;
const detailedAnalysisCount = Object.keys(naturalParentModificationByCcd).length;
const detailedSecondPassCount = Object.values(naturalParentModificationByCcd).filter((record) => record.reviewStatus === "second-pass-complete").length;
const detailedUnresolvedCount = Object.values(naturalParentModificationByCcd).filter((record) => record.reviewStatus === "reviewed-unresolved").length;
const detailedSemanticCount = Object.values(naturalParentModificationByCcd).filter((record) => record.reviewStatus === "semantic-resolved").length;
const detailedComplexCount = Object.values(naturalParentModificationByCcd).filter((record) => record.reviewStatus === "complex-transformation-resolved").length;
const directPropertyEvidenceCount = Object.values(naturalParentModificationByCcd).filter((record) => record.propertyReview && ["具体残基证据", "同骨架证据"].includes(record.propertyReview.status)).length;
const contextualPropertyEvidenceCount = Object.values(naturalParentModificationByCcd).filter((record) => record.propertyReview && ["完整肽证据", "同类修饰参考"].includes(record.propertyReview.status)).length;
const propertyRuleCount = Object.values(naturalParentModificationByCcd).filter((record) => record.propertyReview?.status === "结构规则建议").length;
const PAGE_SIZE = 12;

const modificationOptions = ["N-取代／酰化", "α位取代／构象限制", "立体化学改变", "卤代", "羟基化／氧化还原", "侧链延长／增大", "极性或带电基团", "构象限制型成环", "复杂骨架重构", "末端封闭／骨架等排", "标记／加合物／配合物", "其他官能团替换"];
const propertyOptions = ["渗透性", "稳定性／抗酶解", "溶解度", "口服吸收", "构象／刚性", "活性／结合", "极性／脂溶性", "合成／反应性", "尚无明确性质结论"];

function modificationTagsFor(ccdId: string) {
  const record = naturalParentModificationByCcd[ccdId];
  const audit = substitutabilityByCcd.get(ccdId);
  if (!record) return ["其他官能团替换"];
  if (audit?.category === "complex-skeletal-transformation") return ["复杂骨架重构"];
  if (audit?.category === "backbone-terminally-modified") return ["末端封闭／骨架等排"];
  if (audit?.category === "special-adduct-or-label") return ["标记／加合物／配合物"];
  const text = `${record.changeLabel} ${record.changedPosition} ${record.structuralChange}`;
  const identityText = `${catalogRecordByCcd.get(ccdId)?.name ?? ""} ${(catalogRecordByCcd.get(ccdId)?.synonyms ?? []).join(" ")}`;
  const tags = new Set<string>();
  if (/连接到N|氮上|N[-—~^]|酰胺氮|氨基.*甲基/i.test(text)) tags.add("N-取代／酰化");
  if (/α|alpha|二取代|构象限制|环数\+|可旋转键-/i.test(text)) tags.add("α位取代／构象限制");
  if (/立体中心|立体化学|D-构型|构型反转/i.test(text) || /allo/i.test(identityText)) tags.add("立体化学改变");
  if (/新增[^。]*(Cl|Br|F|I)|氟|氯|溴|碘/i.test(text)) tags.add("卤代");
  if (/羟基|羟化|氧化|还原|新增[^。]*O|少了[^。]*O/i.test(text)) tags.add("羟基化／氧化还原");
  if (/新增[2-9]\d*个C|新增1[0-9]+个C|侧链.*延|苯基|烷基/i.test(text)) tags.add("侧链延长／增大");
  if (/新增[^。]*(N|O|S|P|B)|胍|磷|硼|叠氮|腈|羧/i.test(text)) tags.add("极性或带电基团");
  if (/成环|环化|环数\+/i.test(text)) tags.add("构象限制型成环");
  if (!tags.size) tags.add("其他官能团替换");
  return [...tags];
}

export function propertyTagsFor(ccdId: string) {
  const record = naturalParentModificationByCcd[ccdId];
  if (!record) return ["尚无明确性质结论"];
  const tags = new Set<string>();
  const structuralText = record.directlyCausedProperties
    .filter((line) => !/(方向不确定|尚无|未找到|没有|不提供|不能|无法|不代表|不证明|无变化|不是合成反应路线)/.test(line))
    .join(" ");
  const hasUsableStructuralDescriptors = !/(RDKit无法读取|描述符.*未计算|氢键供体未计算|极性表面积未计算|脂水分配系数未计算)/.test(record.structuralChange);

  // 结构计算只能支持描述符和构象方向，不能自动升级为药代或实验性质。
  if (hasUsableStructuralDescriptors) {
    if (/分子柔性：|成环约束：|可旋转键数量|环结构数量|构象刚性|顺反|转角/i.test(structuralText)) tags.add("构象／刚性");
    if (/氢键供体能力：|氢键受体能力：|极性指标：|脂溶性指标：|拓扑极性表面积|计算logP|脂水分配系数/i.test(structuralText)) tags.add("极性／脂溶性");
  }

  // 立体化学改变本身不会改变二维描述符，但仍可能改变残基的三维构象。
  if (modificationTagsFor(ccdId).includes("立体化学改变")) tags.add("构象／刚性");

  if (record.peptideExperiment.confidence !== "结构推断") {
    const affirmativeExperimentalStatements = `${record.peptideExperiment.conclusion}。${record.peptideExperiment.measurement}`
      .split(/[。；]/)
      .filter((sentence) => sentence && !/(方向不确定|目前没有.*实验|尚无.*实验|未找到.*实验|不提供.*数值|未提供.*(?:结果|对照|数据|比较|贡献|结论)|未给出.*(?:结果|对照|数据|比较|贡献|结论)|没有把.*(?:结果|贡献|对应)|结果不支持|不能据此|不代表|不证明|不等于)/.test(sentence));
    const cleanedExperimentalStatements = affirmativeExperimentalStatements.map((sentence) => sentence
      .replace(/多种其他活性氧/g, "其他氧化物种")
      .replace(/(?:热)?稳定性(?:无显著改变|无差异|未改变)/g, "")
      .replace(/并未测得[^，。；]*(?:稳定性|熔点)[^，。；]*|并未测得[^，。；]*热稳定性变化/g, "")
      .replace(/(?:神经毒性|细胞毒性|催化活性|生物活性)(?:没有显著改变|无显著改变|无差异|未改变)/g, ""));
    const affirmativeExperimentalText = cleanedExperimentalStatements.join(" ");
    if (/渗透|Papp|跨膜|膜分配|细胞进入(?:能力|量)|进入量|进入.{0,20}(?:HeLa|细胞核)|blood.brain|BBB/i.test(affirmativeExperimentalText)) tags.add("渗透性");
    const stabilityProperty = /稳定性|半衰期|抗酶|耐受性|抗蛋白酶|蛋白酶稳定|血浆稳定|血清稳定|肝S9稳定|抗降解|降解速率|蛋白酶处理|熔解温度|熔点/i;
    const measuredStabilityOutcome = /↑|↓|提高|改善|增强|降低|延长|缩短|保持|耐受|抗|超过|剩余|改变|微调|稳定化|半衰期.{0,20}\d|熔点.{0,20}\d|熔解温度.{0,20}\d/i;
    if (cleanedExperimentalStatements.some((sentence) => stabilityProperty.test(sentence) && measuredStabilityOutcome.test(sentence))) tags.add("稳定性／抗酶解");
    if (/溶解|水溶|solub/i.test(affirmativeExperimentalText)) tags.add("溶解度");
    const positiveOralStatements = cleanedExperimentalStatements.filter((sentence) => !/(不是|未给出|没有|尚无|不支持|不能|未拆分|未测|不证明).{0,30}(?:口服|oral)|(?:口服|oral).{0,30}(?:不是|未给出|没有|尚无|不支持|不能|未拆分|未测|不证明)/i.test(sentence));
    if (positiveOralStatements.some((sentence) => /口服生物利用度|口服暴露|人体口服吸收|口服吸收证明|获得可测口服|口服药代|oral bioavailability/i.test(sentence))) tags.add("口服吸收");
    if (/构象|折叠|刚性|环数|可旋转键|顺反|转角/i.test(affirmativeExperimentalText)) tags.add("构象／刚性");
    const activityProperty = /活性|结合|抑制|效力|IC50|EC50|亲和|识别|配体|抗炎|保护作用|黏附|分泌|细胞毒|神经毒|生长|催化|色团/i;
    const measuredActivityOutcome = /↑|↓|提高|改善|增强|降低|保持|保留|获得|产生|失去|消失|恢复|激活|失活|选择性|所需|贡献|促进|阻断|破坏|识别|结合|抑制|抑制剂|亲和|占据|配体|构建|功能|支持|Kd|Ki|IC50|EC50|倍|无活性|有效|作用/i;
    if (cleanedExperimentalStatements.some((sentence) => activityProperty.test(sentence) && measuredActivityOutcome.test(sentence))) tags.add("活性／结合");
    if (/极性|脂水分配|脂溶|疏水|氢键/i.test(affirmativeExperimentalText)) tags.add("极性／脂溶性");
    if (/连接反应|蛋白连接|反应性|反应元件|反应中心|氧化事件|选择性荧光响应|光交联|光照.{0,12}不可逆|点击反应|点击偶联|点击标记|CuAAC|三唑连接|共价加合物|生成产物|分离收率|SPPS|偶联效率|脱保护/i.test(affirmativeExperimentalText)) tags.add("合成／反应性");
  }
  if (!tags.size) tags.add("尚无明确性质结论");
  return [...tags];
}

function evidenceGroupFor(ccdId: string) {
  const status = naturalParentModificationByCcd[ccdId]?.propertyReview?.status;
  if (status === "具体残基证据" || status === "同骨架证据") return "direct";
  if (status === "完整肽证据" || status === "同类修饰参考") return "context";
  return "none";
}

export default function DerivativeCatalog() {
  const [selectedParent, setSelectedParent] = useState("all");
  const [selectedModification, setSelectedModification] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedEvidence, setSelectedEvidence] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const parentCounts = useMemo(() => new Map(naturalAminoAcidParents.map((parent) => [parent.ccd, records.filter((record) => record.parentIds.some((id) => id.toUpperCase() === parent.ccd)).length])), []);
  const modificationCounts = useMemo(() => new Map(modificationOptions.map((option) => [option, records.filter((record) => modificationTagsFor(record.primaryCcdId).includes(option)).length])), []);
  const propertyCounts = useMemo(() => new Map(propertyOptions.map((option) => [option, records.filter((record) => propertyTagsFor(record.primaryCcdId).includes(option)).length])), []);
  const evidenceCounts = useMemo(() => new Map(["direct", "context", "none"].map((group) => [group, records.filter((record) => evidenceGroupFor(record.primaryCcdId) === group).length])), []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesParent = selectedParent === "all" || record.parentIds.some((parent) => parent.toUpperCase() === selectedParent);
      const displayName = displayNameForCcd(record.primaryCcdId, record.name);
      const matchesQuery = !needle || [record.primaryCcdId, record.name, displayName, record.formula, ...record.synonyms].some((value) => value.toLowerCase().includes(needle));
      const matchesModification = selectedModification === "all" || modificationTagsFor(record.primaryCcdId).includes(selectedModification);
      const matchesProperty = selectedProperty === "all" || propertyTagsFor(record.primaryCcdId).includes(selectedProperty);
      const matchesEvidence = selectedEvidence === "all" || evidenceGroupFor(record.primaryCcdId) === selectedEvidence;
      return matchesParent && matchesQuery && matchesModification && matchesProperty && matchesEvidence;
    });
  }, [query, selectedEvidence, selectedModification, selectedParent, selectedProperty]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const chooseParent = (ccd: string) => { setSelectedParent(ccd); setPage(1); };

  return <div className="derivative-catalog">
    <section className="derivative-intro">
      <p className="eyebrow">22 NATURAL AMINO-ACID PARENTS</p>
      <h1>天然氨基酸<br /><em>修饰衍生库</em></h1>
      <p>这里只收录CCD已经明确指向22种天然编码氨基酸之一的非天然氨基酸。天然母体关系、具体修饰位置和性质证据分开记录。</p>
      <div className="derivative-stats"><article><strong>{records.length.toLocaleString()}</strong><span>天然氨基酸修饰相关CCD记录总数</span></article><article><strong>{naturalAminoAcidParents.length}</strong><span>能够对应的天然氨基酸母体</span></article><article><strong>{modificationOptions.length}</strong><span>修饰方式标签；同一条记录可以同时具有多个标签</span></article><article><strong>{directPropertyEvidenceCount} / {contextualPropertyEvidenceCount} / {propertyRuleCount}</strong><span>依次为具体残基或同骨架实验／完整肽或同类修饰参考／没有性质实验（未核验0条）</span></article></div>
      <div className="derivative-training-downloads">
        <div><span>AGENT TRAINING DATA</span><strong>结构化训练数据下载</strong><p>1109条可直接数值训练；A1IPL 1条因特殊硼价态单独保存。Excel内含逐列解释。</p></div>
        <nav>
          <a className="primary" href="/downloads/natural-parent-derivative-agent-training-1110.xlsx" download>下载Excel汇总</a>
          <a href="/downloads/natural-parent-derivative-training-1109.csv" download>CSV · 1109条</a>
          <a href="/downloads/natural-parent-derivative-training-1109.json" download>JSON · 完整字段</a>
          <a href="/downloads/natural-parent-derivative-training-1109.jsonl" download>JSONL · 一行一条</a>
          <a className="special" href="/downloads/natural-parent-derivative-a1ipl-special.json" download>A1IPL单独JSON</a>
        </nav>
        <small>旧版审计文件：<a href="../natural-parent-derivative-analysis.csv" download>首轮结构分析</a> · <a href="../natural-parent-manual-structure-review.csv" download>二次核验结果</a></small>
      </div>
    </section>

    <section className="parent-selector" aria-label="按天然氨基酸母体筛选">
      <button className={selectedParent === "all" ? "active" : ""} onClick={() => chooseParent("all")}><b>全部</b><span>{records.length}</span></button>
      {naturalAminoAcidParents.map((parent) => <button className={selectedParent === parent.ccd ? "active" : ""} onClick={() => chooseParent(parent.ccd)} key={parent.ccd}><i>{parent.symbol}</i><b>{parent.name}</b><small>{parent.ccd}</small><span>{parentCounts.get(parent.ccd) ?? 0}</span></button>)}
    </section>

    <section className="derivative-controls">
      <label className="derivative-search"><span>搜索非天然氨基酸</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="输入名称、CCD编号、同义词或分子式" /></label>
      <label><span>怎么修饰</span><select value={selectedModification} onChange={(event) => { setSelectedModification(event.target.value); setPage(1); }}><option value="all">全部修饰方式（{records.length}）</option>{modificationOptions.map((option) => <option value={option} key={option}>{option}（{modificationCounts.get(option) ?? 0}）</option>)}</select></label>
      <label><span>可能影响的性质</span><select value={selectedProperty} onChange={(event) => { setSelectedProperty(event.target.value); setPage(1); }}><option value="all">全部性质方向（{records.length}）</option>{propertyOptions.map((option) => <option value={option} key={option}>{option}（{propertyCounts.get(option) ?? 0}）</option>)}</select></label>
      <label><span>实验是否直接支持</span><select value={selectedEvidence} onChange={(event) => { setSelectedEvidence(event.target.value); setPage(1); }}><option value="all">全部证据状态（{records.length}）</option><option value="direct">有具体残基／同骨架实验（{evidenceCounts.get("direct") ?? 0}）</option><option value="context">仅完整肽／同类修饰参考（{evidenceCounts.get("context") ?? 0}）</option><option value="none">没有性质实验，仅结构建议（{evidenceCounts.get("none") ?? 0}）</option></select></label>
      <div className="derivative-current-parent"><span>当前母体</span><strong>{selectedParent === "all" ? "全部22种" : `${naturalAminoAcidParentByCcd.get(selectedParent)?.name} · ${selectedParent}`}</strong></div>
    </section>

    <div className="derivative-filter-note"><b>怎么看“性质”：</b><span>有实验支持时按论文结论归类；没有实验时只根据结构变化提示可能方向，不能当成已经改善。括号内为全库数量；修饰方式和性质可以一条多标签。</span></div>
    <div className="result-bar"><span>找到 <strong>{filtered.length}</strong> 条记录 · 第 {safePage}/{totalPages} 页</span>{(query || selectedParent !== "all" || selectedModification !== "all" || selectedProperty !== "all" || selectedEvidence !== "all") && <button onClick={() => { setQuery(""); setSelectedModification("all"); setSelectedProperty("all"); setSelectedEvidence("all"); chooseParent("all"); }}>清除筛选</button>}</div>
    <section className="derivative-records">
      {visible.map((record) => {
        const parentIds = record.parentIds.map((parent) => parent.toUpperCase()).filter((parent) => parentCodes.has(parent));
        const parent = naturalAminoAcidParentByCcd.get(parentIds[0]);
        const detailedRecord = naturalParentModificationByCcd[record.primaryCcdId];
        const displayName = displayNameForCcd(record.primaryCcdId, record.name);
        const nameCorrection = ccdDisplayCorrectionById[record.primaryCcdId];
        const detailed = Boolean(detailedRecord);
        const detailedSecondPass = detailedRecord?.reviewStatus === "second-pass-complete";
        const detailedUnresolved = detailedRecord?.reviewStatus === "reviewed-unresolved";
        const detailedSemantic = detailedRecord?.reviewStatus === "semantic-resolved";
        const detailedComplex = detailedRecord?.reviewStatus === "complex-transformation-resolved";
        const structureAnalysis = structureAnalysisByCcd.get(record.primaryCcdId);
        const propertyStatus = detailedRecord?.propertyReview?.status;
        const modificationTags = modificationTagsFor(record.primaryCcdId);
        const propertyTags = propertyTagsFor(record.primaryCcdId);
        const analysisLabel = detailedUnresolved ? "已完成二次核验 · 改造区域仍不确定" : "已完成修饰方式与性质证据解析";
        const analysisClass = detailedUnresolved ? "pending" : detailed ? "complete" : structureAnalysis?.status === "auto-structure-difference" ? "calculated" : "pending";
        if (!parent) return null;
        return <article className="derivative-record" key={record.id}>
          <div className="derivative-identity"><span>CCD {record.primaryCcdId}</span><strong>{displayName}</strong>{nameCorrection && <em>名称按结构式校正</em>}<small>{record.formula}</small><b className={analysisClass}>{analysisLabel}</b></div>
          <div className="derivative-pair">
            <div><img src={`https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${parent.ccd}_500.svg`} alt={`${parent.name}结构`} /><span>天然母体</span><strong>{parent.name}</strong><small>CCD {parent.ccd}</small></div>
            <b aria-hidden="true">→</b>
            <div><img src={record.structureImageUrl} alt={`${displayName}结构`} /><span>非天然衍生物</span><strong>{displayName}</strong><small>CCD {record.primaryCcdId}</small></div>
          </div>
          <div className="derivative-action"><p>{structureAnalysis?.reason ?? (parentIds.length > 1 ? `CCD列出多个可能母体：${parentIds.join(" / ")}` : `CCD明确对应${parent.name}母体`)}</p><div className="derivative-tag-list"><span>{modificationTags[0]}</span><span>{propertyTags[0]}</span><b>{propertyStatus ?? "尚未分级"}</b></div><small>性质标签可能来自实验或结构提示，以证据等级为准</small><Link href={`/compound/${record.primaryCcdId.toLowerCase()}/`}>{detailedUnresolved ? "查看仍未确定的原因" : detailedComplex ? "查看复杂重构说明" : detailed ? "查看完整修饰对比" : "查看结构记录"} →</Link></div>
        </article>;
      })}
    </section>
    {totalPages > 1 && <nav className="pagination" aria-label="分页"><button disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>上一页</button><span>{safePage} / {totalPages}</span><button disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>下一页</button></nav>}
  </div>;
}
