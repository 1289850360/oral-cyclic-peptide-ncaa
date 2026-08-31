import Link from "next/link";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

const qualityMetrics = [
  { value: "2,065", label: "CCD结构参考记录", note: "以下五类互斥，合计不重复" },
  { value: "114", label: "已确认非天然残基／肽构件", note: "人工来源审核确认实际使用" },
  { value: "952", label: "PDB肽中出现", note: "独立单体与合成资料待补" },
  { value: "294", label: "特殊构件／结构参考", note: "不按普通氨基酸单体理解" },
  { value: "476", label: "氨基酸样待验证候选", note: "全量PDB核查后仍待确认" },
  { value: "229", label: "非单体／明确排除", note: "保留用于检索与排除追溯" },
];

export default function QualityPage() {
  return <main>
    <SiteHeader active="about" />
    <section className="quality-page">
      <header className="quality-hero"><p className="eyebrow">DATA RELEASE · METHODS · QUALITY</p><h1>版本、方法与<br /><em>数据质量</em></h1><p>本页列出数据版本、收录范围、审核方法、已知缺口及机器可读文件。</p></header>

      <section className="quality-metrics" aria-label="数据质量指标">{qualityMetrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></article>)}</section>

      <div className="quality-layout">
        <div className="quality-main">
          <section><div className="detail-section-title"><span>01</span><h2>当前正式版本</h2></div><dl className="quality-release"><div><dt>版本</dt><dd>Version 3.4</dd></div><div><dt>发布日期</dt><dd>2026-08-31</dd></div><div><dt>主记录Schema</dt><dd>ocpr-master-record-v1</dd></div><div><dt>结构数据快照</dt><dd>wwPDB CCD · 2026-08-26</dd></div></dl><div className="quality-changelog"><h3>本版本变化</h3><ul><li>2,065条CCD结构已全部完成PDB聚合物序列查询，不再区分“尚未查询”记录。</li><li>全量结果为：955条命中≤50残基聚合物，505条只命中较长聚合物，605条未命中。</li><li>结构身份重新对齐为114条人工确认、952条PDB中出现、294条特殊用途、476条待确认和229条非单体。</li><li>研发证据改为统一的四级分法，并移除三个面向内部审计的高级筛选项。</li><li>159条研发记录与146个CCD结构的双向映射检查继续保持通过。</li></ul></div></section>

          <section><div className="detail-section-title"><span>02</span><h2>证据状态与统一分级</h2></div><h3>每条结构分别检查五项资料</h3><div className="quality-evidence-model five-level"><article><b>结构身份</b><p>CCD编号、名称、分子式及立体化学相互对应。</p></article><article><b>肽中使用</b><p>PDB序列或原始来源记录该组分进入肽。</p></article><article><b>环肽使用</b><p>存在环肽或宏环体系中的直接使用记录。</p></article><article><b>合成资料</b><p>保护、偶联或SPPS/LPPS资料已经核查。</p></article><article><b>口服证据</b><p>完整骨架或同骨架实验支持口服暴露。</p></article></div><p className="detail-boundary">五项状态回答“查到了哪些资料”，各项互不替代。结构身份不推定合成可行性；肽中使用也不推定口服吸收改善。</p><h3>研发证据统一分为四级</h3><div className="quality-evidence-model five-level"><article><b>1级 · 直接效果</b><p>有对照实验，能够比较某个残基或改造对性质的影响。</p></article><article><b>2级 · 完整分子</b><p>存在于有口服或渗透资料的完整环肽中，不能归因于单点。</p></article><article><b>3级 · 实际使用</b><p>确认进入过肽或环肽，但缺少性质对照实验。</p></article><article><b>4级 · 设计线索</b><p>来自专利、特殊构件或有限资料，只用于提出候选。</p></article><article><b>排除 · 非独立单体</b><p>保留资料用于追溯，但不纳入普通氨基酸单体候选。</p></article></div><p className="detail-boundary">等级表示证据目前能支持到哪一步，不评价论文质量，也不是口服效果评分。</p></section>

          <section><div className="detail-section-title"><span>03</span><h2>构件身份分类</h2></div><div className="quality-component-classes"><article className="component-evidence-reviewed-residue"><b>114 · 已确认非天然残基／肽构件</b><p>结构身份明确，并有来源确认其进入过肽、环肽或宏环体系。</p></article><article className="component-pdb-peptide-occurrence"><b>952 · PDB肽中出现</b><p>序列审计确认进入过肽或聚合物，但独立单体、偶联和环肽应用资料尚未补齐。</p></article><article className="component-special-reference"><b>294 · 特殊用途构件</b><p>包括连接体、交联片段、战头、天然产物残基及其他非典型骨架。</p></article><article className="component-candidate-pending"><b>476 · 结构像氨基酸，仍待确认</b><p>全量PDB序列核查后仍没有使用命中；专利提及不会自动当作已确认使用。</p></article><article className="component-excluded-nonmonomer"><b>229 · 非单体／明确排除</b><p>完整药物、短肽、辅因子、保护体或复杂缀合物等非普通单体。</p></article></div><p className="detail-boundary">结构身份与研发证据分开保存。特殊构件和排除对象也可以有研究资料，但不会因此被归入普通非天然氨基酸。</p></section>

          <section><div className="detail-section-title"><span>04</span><h2>质量控制与已知缺口</h2></div><ul className="quality-check-list"><li><strong>已完成：</strong>2,065条记录全部完成PDB聚合物序列查询，三种使用状态合计无缺失、无重复。</li><li><strong>已完成：</strong>2,065条记录均获得一个且仅一个构件身份分类，分类合计已做一致性校验。</li><li><strong>已完成：</strong>159条研发记录全部进入CCD—证据对齐表；146个关联CCD无缺失、无孤立证据链接。</li><li><strong>进行中：</strong>新命中的PDB记录仍需逐条区分线性肽、环肽、蛋白和其他聚合物语境。</li><li><strong>进行中：</strong>221条原优先候选已完成两批共40条人工证据审核。</li><li><strong>进行中：</strong>114条已确认残基中首批20条完成合成可用性审核。</li><li><strong>仍需完善：</strong>只有专利范围、没有实际合成或使用实例的结构继续保留候选状态。</li><li><strong>仍需完善：</strong>14条研发记录暂无单一CCD映射，使用OCP-X内部概念标识。</li></ul></section>

          <section><div className="detail-section-title"><span>05</span><h2>引用与使用边界</h2></div><div className="citation-box"><span>推荐引用格式</span><p>口服环肽非天然残基证据库. Version 3.4. 2026-08-31. https://1289850360.github.io/oral-cyclic-peptide-ncaa/</p></div><p>引用单条残基时，请优先使用详情页中的OCPR永久编号、CCD编号或OCP-X内部概念标识，并保留原始来源。RCSB、PDBe、论文及专利内容仍遵循各自来源的许可和引用要求。</p><p>本站尚未声明统一的再分发许可证；在维护者确认正式许可前，整理内容按研究引用使用，不应移除来源或证据边界后重新发布。</p></section>
        </div>

        <aside className="quality-sidebar">
          <section><span>机器读取</span><a href="../api/v1/residues">OCPR主记录 API</a><a href="../api/v1/compounds">CCD结构目录 API</a><a href="../ccd-unified-structure-catalog.csv">统一结构目录 CSV</a></section>
          <section><span>数据目录</span><Link href="/catalog/">CCD结构参考库</Link><Link href="/#database">统一研发证据库（159条）</Link><a href="../ccd-research-evidence-alignment.csv">CCD—证据对应表</a><a href="../ccd-pdb-context-audit.csv">PDB语境初筛</a></section>
          <section><span>开发文档</span><p>字段定义位于仓库中的 <code>docs/master-record-schema.md</code>。</p></section>
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
