import Link from "next/link";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

const qualityMetrics = [
  { value: "2,065", label: "CCD结构参考记录", note: "以下五类互斥，合计不重复" },
  { value: "114", label: "已确认非天然残基／肽构件", note: "人工来源审核确认实际使用" },
  { value: "162", label: "PDB肽中出现", note: "独立单体与合成资料待补" },
  { value: "294", label: "特殊构件／结构参考", note: "不按普通氨基酸单体理解" },
  { value: "1,266", label: "氨基酸样待验证候选", note: "结构规则初分，不能直接推荐" },
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
          <section><div className="detail-section-title"><span>01</span><h2>当前正式版本</h2></div><dl className="quality-release"><div><dt>版本</dt><dd>Version 3.3</dd></div><div><dt>发布日期</dt><dd>2026-08-31</dd></div><div><dt>主记录Schema</dt><dd>ocpr-master-record-v1</dd></div><div><dt>结构数据快照</dt><dd>wwPDB CCD · 2026-08-26</dd></div></dl><div className="quality-changelog"><h3>本版本变化</h3><ul><li>改为CCD优先的数据模型：结构是主记录，研发资料作为关联证据。</li><li>研发证据库补入20条核心审核记录，统一为159条；145条有CCD映射，14条暂无唯一CCD。</li><li>146个CCD结构已与研发证据双向对齐，并加入自动缺失和孤立映射检查。</li><li>原研发库中9个有非专利使用资料的CCD已修正为“已确认残基”。</li><li>主检索页面只保留结构身份、研发证据和合成状态，高级审核项默认收起。</li></ul></div></section>

          <section><div className="detail-section-title"><span>02</span><h2>五层证据状态</h2></div><div className="quality-evidence-model five-level"><article><b>结构身份</b><p>CCD编号、名称、分子式及立体化学相互对应。</p></article><article><b>肽中使用</b><p>PDB序列或原始来源记录该组分进入肽。</p></article><article><b>环肽使用</b><p>存在环肽或宏环体系中的直接使用记录。</p></article><article><b>合成资料</b><p>保护、偶联或SPPS/LPPS资料已经核查。</p></article><article><b>口服证据</b><p>完整骨架或同骨架实验支持口服暴露。</p></article></div><p className="detail-boundary">各层证据分别记录。结构身份不推定单体合成可行性；肽中使用记录也不推定口服吸收改善。</p></section>

          <section><div className="detail-section-title"><span>03</span><h2>构件身份分类</h2></div><div className="quality-component-classes"><article className="component-evidence-reviewed-residue"><b>114 · 已确认非天然残基／肽构件</b><p>结构身份明确，并有来源确认其进入过肽、环肽或宏环体系。</p></article><article className="component-pdb-peptide-occurrence"><b>162 · PDB肽中出现</b><p>序列审计确认进入过肽，但独立单体、偶联和环肽应用资料尚未补齐。</p></article><article className="component-special-reference"><b>294 · 特殊用途构件</b><p>包括连接体、交联片段、战头、天然产物残基及其他非典型骨架。</p></article><article className="component-candidate-pending"><b>1,266 · 结构像氨基酸，仍待确认</b><p>其中954条较像独立单体；专利提及不会自动当作已确认使用。</p></article><article className="component-excluded-nonmonomer"><b>229 · 非单体／明确排除</b><p>完整药物、短肽、辅因子、保护体或复杂缀合物等非普通单体。</p></article></div><p className="detail-boundary">结构身份与研发证据分开保存。特殊构件和排除对象也可以有研究资料，但不会因此被归入普通非天然氨基酸。</p></section>

          <section><div className="detail-section-title"><span>04</span><h2>质量控制与已知缺口</h2></div><ul className="quality-check-list"><li><strong>已完成：</strong>2,065条记录均获得一个且仅一个构件身份分类，分类合计已做一致性校验。</li><li><strong>已完成：</strong>159条研发记录全部进入CCD—证据对齐表；146个关联CCD无缺失、无孤立证据链接。</li><li><strong>已完成：</strong>162条PDB肽中出现记录完成标题级语境初筛；结果只用于安排后续人工审核。</li><li><strong>已完成：</strong>1,266条规则候选完成二次分层：954条较像独立单体、53条特殊反应候选、5条强非普通单体信号、254条信息不足。</li><li><strong>进行中：</strong>221条原优先候选已完成两批共40条人工证据审核。</li><li><strong>进行中：</strong>114条已确认残基中首批20条完成合成可用性审核。</li><li><strong>仍需完善：</strong>只有专利范围、没有实际合成或使用实例的结构继续保留候选状态。</li><li><strong>仍需完善：</strong>14条研发记录暂无单一CCD映射，使用OCP-X内部概念标识。</li></ul></section>

          <section><div className="detail-section-title"><span>05</span><h2>引用与使用边界</h2></div><div className="citation-box"><span>推荐引用格式</span><p>口服环肽非天然残基证据库. Version 3.3. 2026-08-31. https://1289850360.github.io/oral-cyclic-peptide-ncaa/</p></div><p>引用单条残基时，请优先使用详情页中的OCPR永久编号、CCD编号或OCP-X内部概念标识，并保留原始来源。RCSB、PDBe、论文及专利内容仍遵循各自来源的许可和引用要求。</p><p>本站尚未声明统一的再分发许可证；在维护者确认正式许可前，整理内容按研究引用使用，不应移除来源或证据边界后重新发布。</p></section>
        </div>

        <aside className="quality-sidebar">
          <section><span>机器读取</span><a href="../api/v1/residues">OCPR主记录 API</a><a href="../api/v1/compounds">CCD结构目录 API</a><a href="../api/v1/scaffolds">实验骨架 API</a><a href="../ccd-unified-structure-catalog.csv">统一结构目录 CSV</a><a href="../cyclic-scaffold-evidence.csv">实验骨架 CSV</a></section>
          <section><span>数据目录</span><Link href="/catalog/">CCD结构参考库</Link><Link href="/#database">统一研发证据库（159条）</Link><a href="../ccd-research-evidence-alignment.csv">CCD—证据对应表</a><Link href="/scaffolds/">实验骨架库（14条）</Link><a href="../ccd-pdb-context-audit.csv">PDB语境初筛</a></section>
          <section><span>开发文档</span><p>字段定义位于仓库中的 <code>docs/master-record-schema.md</code>。</p></section>
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
