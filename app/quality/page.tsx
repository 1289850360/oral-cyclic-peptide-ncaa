import Link from "next/link";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

const qualityMetrics = [
  { value: "2,065", label: "CCD结构参考记录", note: "全部结构使用统一主记录" },
  { value: "1,844", label: "已确认非天然氨基酸／残基", note: "另有1条身份待确认记录" },
  { value: "176", label: "特殊用途结构", note: "多残基或反应状态等结构" },
  { value: "44", label: "非单体／明确排除", note: "缺少单一氨基酸骨架" },
  { value: "955", label: "短PDB聚合物命中", note: "≤50残基聚合物序列中出现" },
  { value: "28", label: "性质实验关联CCD", note: "直接实验、完整分子与专利实例分级显示" },
];

export default function QualityPage() {
  return <main>
    <SiteHeader active="about" />
    <section className="quality-page">
      <header className="quality-hero"><p className="eyebrow">DATA RELEASE · METHODS · QUALITY</p><h1>版本、方法与<br /><em>数据质量</em></h1><p>本页列出数据版本、收录范围、审核方法、已知缺口及机器可读文件。</p></header>

      <section className="quality-metrics" aria-label="数据质量指标">{qualityMetrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></article>)}</section>

      <div className="quality-layout">
        <div className="quality-main">
          <section><div className="detail-section-title"><span>01</span><h2>当前正式版本</h2></div><dl className="quality-release"><div><dt>版本</dt><dd>Version 5.1 · 当前发布版</dd></div><div><dt>身份复核日期</dt><dd>2026-09-02</dd></div><div><dt>主记录Schema</dt><dd>ocpr-master-record-v1</dd></div><div><dt>完整CCD对照</dt><dd>wwPDB CCD · 2026-08-29</dd></div></dl><div className="quality-changelog"><h3>本版本变化</h3><ul><li>2,065条CCD结构继续使用统一主记录。</li><li>重新核查672个肽链连接型边界条目：529条归入非天然氨基酸，130条保留为特殊结构，13条明确排除。</li><li>当前分类为1,844条已确认非天然氨基酸／非标准残基、1条身份待确认记录、176条特殊结构、44条排除项。</li><li>身份、PDB使用、合成可用性和性质证据继续分开记录。</li></ul></div></section>

          <section><div className="detail-section-title"><span>02</span><h2>资料状态与研发证据边界</h2></div><h3>每条结构分别检查五项资料</h3><div className="quality-evidence-model five-level"><article><b>结构身份</b><p>CCD编号、名称、分子式及立体化学相互对应。</p></article><article><b>肽中使用</b><p>PDB序列或原始来源记录该组分进入肽。</p></article><article><b>环肽使用</b><p>存在环肽或宏环体系中的直接使用记录。</p></article><article><b>合成资料</b><p>保护、偶联或SPPS/LPPS资料已经核查。</p></article><article><b>口服证据</b><p>完整骨架或同骨架实验支持口服暴露。</p></article></div><p className="detail-boundary">五项状态回答“查到了哪些资料”，各项互不替代。结构身份不推定合成可行性；PDB出现也不推定环肽用途或口服吸收改善。</p><h3>研发证据收录门槛</h3><p className="detail-boundary">研发证据库只收录有实验比较支持溶解度、渗透性、稳定性、代谢稳定性或口服暴露变化的记录。身份确认、PDB出现、一般使用资料或没有性质实验的专利列举不作为性质证据；专利只有给出具体序列与性质实验声明时才作为低一级证据收录。</p></section>

          <section><div className="detail-section-title"><span>03</span><h2>构件身份分类</h2></div><div className="quality-component-classes"><article className="component-evidence-reviewed-residue"><b>1,844 · 已确认非天然氨基酸／非标准残基</b><p>包括独立非天然氨基酸、单一标准氨基酸母体的修饰残基及明确的直接衍生物；用途特殊不否定身份。</p></article><article className="component-candidate-pending"><b>1 · 身份待确认</b><p>CCD 96Z具有氨基酸样结构，但现有资料尚不足以把它升级为已确认非天然氨基酸。</p></article><article className="component-special-reference"><b>176 · 特殊用途结构</b><p>多残基融合、成熟发色团、反应状态、还原端或完整肽模拟构件等不作为一个普通氨基酸理解。</p></article><article className="component-excluded-nonmonomer"><b>44 · 非单体／明确排除</b><p>缺少单一氨基酸骨架，或属于完整药物、短肽和其他非单体结构。</p></article></div><p className="detail-boundary">四类互不重叠，合计2,065条。身份分类不表示这些残基都可以买到、都能直接用于SPPS，或都能改善口服性质。</p></section>

          <section><div className="detail-section-title"><span>04</span><h2>完整CCD覆盖检查</h2></div><div className="quality-changelog"><h3>2026-09-02全库对照与复核结果</h3><ul><li>官方完整快照包含50,343个已发布CCD组分。</li><li>排除标准蛋白氨基酸、硒代半胱氨酸、吡咯赖氨酸和模糊占位符后，共找到1,681个官方肽链连接型候选。</li><li>网站主目录包含其中1,680个，候选目录覆盖率为99.94%；唯一未收录的A1ICL在本站快照后更新，且复核为不具有普通氨基酸骨架。</li><li>1,681个候选完成结构身份复核：1,538个确认为单一非标准氨基酸／残基，130个为多残基或特殊反应结构，13个不具有单一氨基酸骨架。</li><li>官方类型不是肽链连接型的结构也经过逐条来源复核；跨来源合并去重后的最终数量，以本页“构件身份分类”为准。</li></ul></div><p className="detail-boundary">完整肽链连接型候选已经核查完。NON-POLYMER中是否还存在未被早期结构筛选捕获的氨基酸样化合物，仍是下一层更宽泛的完整子结构检索问题。</p><p><a href="../ccd-ncaa-complete-coverage-audit.json">下载完整覆盖审计 JSON</a> · <a href="../ccd-peptide-linking-identity-recheck.csv">下载672条身份复核表 CSV</a></p></section>

          <section><div className="detail-section-title"><span>05</span><h2>质量控制与已知缺口</h2></div><ul className="quality-check-list"><li><strong>已完成：</strong>2,065条记录全部完成PDB聚合物序列查询，三种出现状态合计无缺失、无重复。</li><li><strong>已完成：</strong>1,681个官方肽链连接型候选全部完成化学身份复核。</li><li><strong>已完成：</strong>早期分类中“用途特殊”覆盖身份判断的问题已经纠正。</li><li><strong>已完成：</strong>661条历史资料进入CCD—证据审计表；正式性质证据库显示46条实验记录。</li><li><strong>进行中：</strong>1,844条已确认非天然氨基酸／非标准残基中首批20条完成合成可用性审核。</li><li><strong>仍需完善：</strong>完整扫描46,185个NON-POLYMER组分中的氨基酸样结构，并继续增加性质实验文献。</li></ul></section>

          <section><div className="detail-section-title"><span>06</span><h2>引用与使用边界</h2></div><div className="citation-box"><span>推荐引用格式</span><p>口服环肽非天然残基证据库. Version 5.1. 2026-09-02. https://1289850360.github.io/oral-cyclic-peptide-ncaa/</p></div><p>引用单条残基时，请优先使用详情页中的OCPR永久编号、CCD编号或OCP-X内部概念标识，并保留原始来源。RCSB、PDBe、论文及专利内容仍遵循各自来源的许可和引用要求。</p><p>本站尚未声明统一的再分发许可证；在维护者确认正式许可前，整理内容按研究引用使用，不应移除来源或证据边界后重新发布。</p></section>
        </div>

        <aside className="quality-sidebar">
          <section><span>机器读取</span><a href="../api/v1/residues">46条性质证据 API</a><a href="../api/v1/compounds">CCD结构目录 API</a><a href="../ccd-unified-structure-catalog.csv">统一结构目录 CSV</a><a href="../ccd-ncaa-complete-coverage-audit.json">完整CCD覆盖审计</a></section>
          <section><span>数据目录</span><Link href="/catalog/">CCD结构参考库</Link><Link href="/#database">性质改善研发证据库（46条）</Link><a href="../ccd-research-evidence-alignment.csv">历史资料审计对应表</a><a href="../ccd-pdb-context-audit.csv">PDB语境审计文件</a></section>
          <section><span>开发文档</span><p>字段定义位于仓库中的 <code>docs/master-record-schema.md</code>。</p></section>
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
