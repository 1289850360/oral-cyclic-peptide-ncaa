import Link from "next/link";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

const qualityMetrics = [
  { value: "2,065", label: "CCD结构参考记录", note: "全部结构使用统一主记录" },
  { value: "1,316", label: "已确认非天然氨基酸", note: "CCD单体类型或人工来源审核确认身份" },
  { value: "446", label: "特殊用途结构", note: "不按普通氨基酸单体理解" },
  { value: "303", label: "非单体／明确排除", note: "保留用于检索与排除追溯" },
  { value: "955", label: "短PDB聚合物命中", note: "≤50残基聚合物序列中出现" },
  { value: "13", label: "性质实验关联CCD", note: "只计算直接性质实验" },
];

export default function QualityPage() {
  return <main>
    <SiteHeader active="about" />
    <section className="quality-page">
      <header className="quality-hero"><p className="eyebrow">DATA RELEASE · METHODS · QUALITY</p><h1>版本、方法与<br /><em>数据质量</em></h1><p>本页列出数据版本、收录范围、审核方法、已知缺口及机器可读文件。</p></header>

      <section className="quality-metrics" aria-label="数据质量指标">{qualityMetrics.map((metric) => <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.note}</small></article>)}</section>

      <div className="quality-layout">
        <div className="quality-main">
          <section><div className="detail-section-title"><span>01</span><h2>当前正式版本</h2></div><dl className="quality-release"><div><dt>版本</dt><dd>Version 5.0</dd></div><div><dt>发布日期</dt><dd>2026-09-01</dd></div><div><dt>主记录Schema</dt><dd>ocpr-master-record-v1</dd></div><div><dt>结构数据快照</dt><dd>wwPDB CCD · 2026-08-26</dd></div></dl><div className="quality-changelog"><h3>本版本变化</h3><ul><li>2,065条CCD结构已全部进入统一身份分类。</li><li>1,316条确认为非天然氨基酸，446条归入特殊用途结构，303条归入非单体或排除项。</li><li>PDB聚合物序列出现情况与结构身份分开记录，不再作为身份分类。</li><li>研发证据库只保留28条直接性质实验记录，其中13个CCD结构已完成关联。</li></ul></div></section>

          <section><div className="detail-section-title"><span>02</span><h2>资料状态与研发证据边界</h2></div><h3>每条结构分别检查五项资料</h3><div className="quality-evidence-model five-level"><article><b>结构身份</b><p>CCD编号、名称、分子式及立体化学相互对应。</p></article><article><b>肽中使用</b><p>PDB序列或原始来源记录该组分进入肽。</p></article><article><b>环肽使用</b><p>存在环肽或宏环体系中的直接使用记录。</p></article><article><b>合成资料</b><p>保护、偶联或SPPS/LPPS资料已经核查。</p></article><article><b>口服证据</b><p>完整骨架或同骨架实验支持口服暴露。</p></article></div><p className="detail-boundary">五项状态回答“查到了哪些资料”，各项互不替代。结构身份不推定合成可行性；PDB出现也不推定环肽用途或口服吸收改善。</p><h3>研发证据收录门槛</h3><p className="detail-boundary">研发证据库只收录有实验比较支持溶解度、渗透性、稳定性、代谢稳定性或口服暴露变化的记录。身份确认、PDB出现、专利列举和一般使用资料只保留在审计数据中，不作为性质证据计数。</p></section>

          <section><div className="detail-section-title"><span>03</span><h2>构件身份分类</h2></div><div className="quality-component-classes"><article className="component-evidence-reviewed-residue"><b>1,316 · 已确认非天然氨基酸</b><p>CCD官方单体类型或人工来源审核支持其非天然氨基酸身份。</p></article><article className="component-special-reference"><b>446 · 特殊用途结构</b><p>包括蛋白工程残基、连接体、交联片段、战头及其他非典型肽模拟骨架。</p></article><article className="component-excluded-nonmonomer"><b>303 · 非单体／明确排除</b><p>完整药物、反应中间体、共价加合物、辅因子或复杂缀合物等非普通单体。</p></article></div><p className="detail-boundary">三类互不重叠，合计2,065条。PDB出现情况是独立资料状态，不再作为第四种身份分类。</p></section>

          <section><div className="detail-section-title"><span>04</span><h2>质量控制与已知缺口</h2></div><ul className="quality-check-list"><li><strong>已完成：</strong>2,065条记录全部完成PDB聚合物序列查询，三种出现状态合计无缺失、无重复。</li><li><strong>已完成：</strong>2,065条结构全部对齐到非天然氨基酸、特殊用途结构或非单体／排除项。</li><li><strong>已完成：</strong>653条历史资料进入CCD—证据审计表；性质证据库只显示28条直接实验记录。</li><li><strong>进行中：</strong>1,316条已确认非天然氨基酸中首批20条完成合成可用性审核。</li><li><strong>仍需完善：</strong>继续增加具有同骨架对照的溶解度、渗透性、稳定性和口服暴露文献。</li><li><strong>仍需完善：</strong>51条历史资料属于无唯一CCD的骨架、策略或组合构件，仅保留在审计数据中。</li></ul></section>

          <section><div className="detail-section-title"><span>05</span><h2>引用与使用边界</h2></div><div className="citation-box"><span>推荐引用格式</span><p>口服环肽非天然残基证据库. Version 5.0. 2026-09-01. https://1289850360.github.io/oral-cyclic-peptide-ncaa/</p></div><p>引用单条残基时，请优先使用详情页中的OCPR永久编号、CCD编号或OCP-X内部概念标识，并保留原始来源。RCSB、PDBe、论文及专利内容仍遵循各自来源的许可和引用要求。</p><p>本站尚未声明统一的再分发许可证；在维护者确认正式许可前，整理内容按研究引用使用，不应移除来源或证据边界后重新发布。</p></section>
        </div>

        <aside className="quality-sidebar">
          <section><span>机器读取</span><a href="../api/v1/residues">28条性质证据 API</a><a href="../api/v1/compounds">CCD结构目录 API</a><a href="../ccd-unified-structure-catalog.csv">统一结构目录 CSV</a></section>
          <section><span>数据目录</span><Link href="/catalog/">CCD结构参考库</Link><Link href="/#database">性质改善研发证据库（28条）</Link><a href="../ccd-research-evidence-alignment.csv">历史资料审计对应表</a><a href="../ccd-pdb-context-audit.csv">PDB语境审计文件</a></section>
          <section><span>开发文档</span><p>字段定义位于仓库中的 <code>docs/master-record-schema.md</code>。</p></section>
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
