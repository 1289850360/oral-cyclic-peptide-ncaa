import Link from "next/link";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

const qualityMetrics = [
  { value: "1,687", label: "CCD结构参考记录", note: "已完成结构去重与官方字段核验" },
  { value: "139", label: "统一研发数据库记录", note: "53条原记录与92条审核数据去重合并" },
  { value: "34", label: "精确CCD证据映射", note: "名称和立体化学能够对应" },
  { value: "92", label: "已并入的审核记录", note: "不再作为独立数据库展示" },
  { value: "1,466", label: "仍需人工复核的CCD候选", note: "不作为已确认单体宣传" },
  { value: "221", label: "明确排除结构", note: "不计入可用非天然氨基酸" },
];

export default function QualityPage() {
  return <main>
    <SiteHeader active="about" />
    <section className="quality-page">
      <header className="quality-hero"><p className="eyebrow">DATA RELEASE · METHODS · QUALITY</p><h1>版本、方法与<br /><em>数据质量</em></h1><p>公开当前版本的记录范围、审核进度、证据边界和机器可读资源，使数据库结果能够被复核和引用。</p></header>

      <section className="quality-metrics" aria-label="数据质量指标">{qualityMetrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></article>)}</section>

      <div className="quality-layout">
        <div className="quality-main">
          <section><div className="detail-section-title"><span>01</span><h2>当前正式版本</h2></div><dl className="quality-release"><div><dt>版本</dt><dd>Version 3.2</dd></div><div><dt>发布日期</dt><dd>2026-08-28</dd></div><div><dt>主记录Schema</dt><dd>ocpr-master-record-v1</dd></div><div><dt>结构数据快照</dt><dd>wwPDB CCD · 2026-08-26</dd></div></dl><div className="quality-changelog"><h3>本版本变化</h3><ul><li>53条原研发记录与92条审核数据按CCD去重，形成139条统一数据库记录。</li><li>取消独立深度审核页面，把审核等级改为研发数据库筛选标签。</li><li>6条重复记录保留原OCPR编号并补充审核证据。</li><li>公开合并清单、数据质量指标、字段定义和引用方式。</li></ul></div></section>

          <section><div className="detail-section-title"><span>02</span><h2>三层证据模型</h2></div><div className="quality-evidence-model"><article><b>结构身份</b><p>CCD编号、名称、分子式和立体化学能够对应。</p></article><article><b>肽中使用</b><p>进入PDB聚合物序列，或来源明确描述其作为肽残基使用。</p></article><article><b>性质效果</b><p>同骨架替换或明确实验能够支持渗透、稳定、溶解度或口服暴露变化。</p></article></div><p className="detail-boundary">低层证据不能自动推出高层结论：结构成立不等于可独立合成，进入肽不等于提高口服吸收。</p></section>

          <section><div className="detail-section-title"><span>03</span><h2>质量控制与已知缺口</h2></div><ul className="quality-check-list"><li><strong>已完成：</strong>1,687条结构核心去重、CCD链接和结构图编号一致性、官方字段审计。</li><li><strong>已完成：</strong>221条优先研发候选的PDB聚合物序列审计。</li><li><strong>仍需完善：</strong>523条CCD记录没有标准母体残基，需逐条核对独立单体身份。</li><li><strong>仍需完善：</strong>1,317条CCD记录没有同义词，中文辅助名不能替代权威名称。</li><li><strong>仍需完善：</strong>供应、保护形式和SPPS/LPPS条件尚未覆盖全部候选。</li></ul></section>

          <section><div className="detail-section-title"><span>04</span><h2>引用与使用边界</h2></div><div className="citation-box"><span>推荐引用格式</span><p>口服环肽非天然残基证据库. Version 3.2. 2026-08-28. https://1289850360.github.io/oral-cyclic-peptide-ncaa/</p></div><p>引用单条残基时，请优先使用详情页中的OCPR永久编号、记录版本和原始来源。RCSB、PDBe、论文及专利内容仍遵循各自来源的许可和引用要求。</p><p>本站尚未声明统一的再分发许可证；在维护者确认正式许可前，整理内容按研究引用使用，不应移除来源或证据边界后重新发布。</p></section>
        </div>

        <aside className="quality-sidebar">
          <section><span>机器读取</span><a href="../api/v1/residues/">OCPR主记录 JSON</a><a href="../ccd-monomer-usability-screen.csv">单体可用性 CSV</a><a href="../catalog-integrity-report.json">完整性报告 JSON</a></section>
          <section><span>数据目录</span><Link href="/catalog/">CCD结构参考库</Link><Link href="/#database">统一研发证据库（139条）</Link><a href="../deep-review-integration-plan.csv">审核数据合并清单</a></section>
          <section><span>开发文档</span><p>字段定义位于仓库中的 <code>docs/master-record-schema.md</code>。</p></section>
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
