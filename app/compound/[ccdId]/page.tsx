import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import catalogJson from "../../../public/ccd-unified-structure-catalog.json";
import usageJson from "../../../public/ccd-unified-polymer-usage.json";
import reviewJson from "../../../public/ccd-manual-review-92-final.json";
import SiteFooter from "../../site-footer";
import SiteHeader from "../../site-header";

type EvidenceState = { status: string; label: string };
type CatalogRecord = {
  id: string; ccdIds: string[]; primaryCcdId: string; name: string; synonyms: string[];
  formula: string; formulaWeight: number | null; parentIds: string[]; linkageTypes: string[];
  smiles: string; categoryLabel: string; tags: string[]; predictedEffects: string[];
  sourceUrl: string; structureImageUrl: string;
  catalogOrigin: "core-structure-screen" | "research-evidence-linked" | "conditional-review";
  componentClass: { id: "evidence-reviewed-residue" | "pdb-peptide-occurrence" | "special-reference" | "candidate-pending" | "excluded-nonmonomer"; basis: string; method: "manual-review" | "pdb-sequence-audit" | "rule-based" };
  screening: { tier: "priority" | "conditional" | "reference" | "exclude"; reasons: string[]; cautions: string[]; manualReviewRequired: boolean };
  evidenceProfile: { structureIdentity: EvidenceState; peptideUse: EvidenceState; cyclicPeptideUse: EvidenceState; synthesisUse: EvidenceState; oralEvidence: EvidenceState };
  corePriorityReview?: { batch: number; grade: "A" | "B" | "PENDING" | "EXCLUDE"; conclusion: string; synthesisEvidence: string; cyclicEvidence: string; oralEvidence: string; recommendation: string; reviewedAt: string; sources: Array<{ title: string; url: string; evidenceType: string }> };
  synthesisUsability?: { statusLabel: string; protectedForms: string[]; compatibility: "standard-compatible" | "compatible-with-caution"; compatibilityLabel: string; guidance: string; risks: string; availabilityBoundary: string; reviewedAt: string; sources: Array<{ title: string; url: string; type: string }> };
  pdbContextAudit?: { status: string; statusLabel: string; examples: Array<{ entryId: string; title: string; url: string }>; auditMethod: string; reviewBoundary: string; auditedAt: string };
  candidateTriage?: { status: string; statusLabel: string; priority: string; reasons: string[]; method: string; reviewBoundary: string; reviewedAt: string };
  researchEvidence: Array<{ recordId: string; level: string; name: string; origin: string; confirmsUse: boolean }>;
};
type UsageRecord = { id: string; status: string; polymerEntityCount: number; shortPolymerEntityCount: number; exampleEntryIds: string[] };
type ReviewRecord = { ccdId: string; gradeLabel: string; conclusion: string; synthesisEvidence: string; cyclicEvidence: string; oralEvidence: string; recommendation: string; sources: Array<{ title: string; url: string; evidenceType: string }> };

const records = catalogJson.records as CatalogRecord[];
const recordByCcd = new Map(records.flatMap((record) => record.ccdIds.map((id) => [id.toLowerCase(), record] as const)));
const usageById = new Map((usageJson.records as UsageRecord[]).map((record) => [record.id, record]));
const reviewByCcd = new Map((reviewJson.records as ReviewRecord[]).map((record) => [record.ccdId.toLowerCase(), record]));
const componentClassMeta = catalogJson.metadata.componentClassMeta as Record<CatalogRecord["componentClass"]["id"], { label: string; shortLabel: string; description: string }>;
const NCAA_WHOLE_MOLECULE_PROPERTY_RECORDS = new Set(["OCPR000001", "OCPR000011", "OCPR000012", "OCPR000013", "OCPR000015", "OCPR000016", "OCPR000047", "OCPR000049", "OCPR000050", "OCPR000074", "OCPR000560", "OCPR000561"]);
const propertyEvidenceFor = (record: CatalogRecord) => record.researchEvidence.filter((item) => item.level === "直接证据" || item.level === "改造证据" || NCAA_WHOLE_MOLECULE_PROPERTY_RECORDS.has(item.recordId));
const propertyEvidenceLabel = (level: string) => level === "直接证据" || level === "改造证据" ? "直接实验" : level === "专利证据" ? "专利实例" : "完整分子证据";
const componentBasisForDisplay = (record: CatalogRecord) => record.componentClass.id === "evidence-reviewed-residue" ? "CCD单体类型或人工来源支持其非天然氨基酸身份" : record.componentClass.basis;

export function generateStaticParams() {
  return records.map((record) => ({ ccdId: record.primaryCcdId.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ ccdId: string }> }): Promise<Metadata> {
  const { ccdId } = await params;
  const record = recordByCcd.get(ccdId.toLowerCase());
  if (!record) return {};
  return { title: `CCD ${record.primaryCcdId}｜${record.name}`, description: `${record.name}的CCD结构身份、PDB聚合物序列出现情况与性质实验资料。`, alternates: { canonical: `/compound/${record.primaryCcdId.toLowerCase()}/` } };
}

export default async function CompoundDetailPage({ params }: { params: Promise<{ ccdId: string }> }) {
  const { ccdId } = await params;
  const record = recordByCcd.get(ccdId.toLowerCase());
  if (!record) notFound();
  const usage = usageById.get(record.id);
  const review = reviewByCcd.get(record.primaryCcdId.toLowerCase());
  const index = records.findIndex((item) => item.id === record.id);
  const previous = index > 0 ? records[index - 1] : null;
  const next = index < records.length - 1 ? records[index + 1] : null;
  const propertyEvidence = propertyEvidenceFor(record);
  const evidenceRows = [
    ["结构身份", record.evidenceProfile.structureIdentity], ["肽中使用", record.evidenceProfile.peptideUse],
    ["环肽使用", record.evidenceProfile.cyclicPeptideUse], ["合成资料", record.evidenceProfile.synthesisUse],
    ["口服证据", record.evidenceProfile.oralEvidence],
  ] as Array<[string, EvidenceState]>;

  return <main>
    <SiteHeader active="catalog" />
    <article className="residue-detail-page compound-detail-page">
      <nav className="detail-breadcrumb" aria-label="面包屑"><Link href="/">首页</Link><span>›</span><Link href="/catalog/">CCD结构库</Link><span>›</span><strong>CCD {record.primaryCcdId}</strong></nav>
      <header className="detail-hero compound-hero">
        <div><p className="eyebrow">CHEMICAL COMPONENT RECORD · CCD {record.primaryCcdId}</p><h1>{record.name}</h1><p className="detail-english-name">{record.synonyms.join(" · ") || "无已收录同义词"}</p><div className="detail-badges"><span>{componentClassMeta[record.componentClass.id].shortLabel}</span><span>{record.categoryLabel}</span>{propertyEvidence.length > 0 && <span>已有性质实验资料</span>}</div></div>
        <div className="compound-hero-structure"><img src={record.structureImageUrl} alt={`${record.name}二维结构`} /><span>CCD {record.ccdIds.join(" / ")}</span></div>
      </header>

      <div className="detail-layout">
        <div className="detail-main-column">
          <section className="detail-section"><div className="detail-section-title"><span>01</span><h2>构件身份与资料状态</h2></div><div className={`compound-classification component-${record.componentClass.id}`}><div><span>当前构件分类</span><strong>{componentClassMeta[record.componentClass.id].label}</strong></div><p>{componentClassMeta[record.componentClass.id].description}</p><small>分类依据：{componentBasisForDisplay(record)} · {record.componentClass.method === "manual-review" ? "人工来源审核" : record.componentClass.method === "pdb-sequence-audit" ? "PDB序列审计" : "CCD结构与单体类型核验"}</small></div><div className="compound-evidence-grid">{evidenceRows.map(([label, state]) => <article data-status={state.status} key={label}><span>{label}</span><strong>{state.label}</strong></article>)}</div>{propertyEvidence.length > 0 && <div className="compound-research-evidence"><div><span>性质实验资料</span><strong>{propertyEvidence.length}条实验资料已与CCD {record.primaryCcdId}对齐</strong></div><ul>{propertyEvidence.map((item) => <li key={`${item.recordId}-${item.level}`}><b>{propertyEvidenceLabel(item.level)}</b><span>{item.name}</span></li>)}</ul><Link href={`/?q=${encodeURIComponent(record.primaryCcdId)}#database`}>在研发证据库中查看 →</Link></div>}<p className="detail-boundary">各项状态分别回答不同问题。完整分子性质证据只说明该残基可以存在于相应骨架中，不能把整个分子的效果归因于这一处残基。</p></section>

          <section className="detail-section"><div className="detail-section-title"><span>02</span><h2>结构身份</h2></div><dl className="detail-definition-list"><div><dt>CCD编号</dt><dd>{record.ccdIds.join(" / ")}</dd></div><div><dt>分子式／分子量</dt><dd>{record.formula} · {record.formulaWeight?.toFixed(3) ?? "—"} Da</dd></div><div><dt>连接类型</dt><dd>{record.linkageTypes.join("；")}</dd></div><div><dt>标准母体</dt><dd>{record.parentIds.join(" / ") || "CCD未指定"}</dd></div><div><dt>立体化学SMILES</dt><dd className="smiles-value">{record.smiles}</dd></div><div><dt>结构标签</dt><dd>{record.tags.join("、") || "未自动归类"}</dd></div></dl></section>

          <section className="detail-section"><div className="detail-section-title"><span>03</span><h2>PDB聚合物序列出现情况</h2></div>{usage ? <><dl className="detail-definition-list"><div><dt>序列核查结果</dt><dd>{record.evidenceProfile.peptideUse.label}</dd></div><div><dt>包含该CCD的聚合物实体</dt><dd>{usage.polymerEntityCount}个</dd></div><div><dt>其中≤50残基实体</dt><dd>{usage.shortPolymerEntityCount}个</dd></div><div><dt>示例PDB</dt><dd className="pdb-example-links">{usage.exampleEntryIds.length ? usage.exampleEntryIds.map((id) => <a href={`https://www.rcsb.org/structure/${id}`} target="_blank" rel="noreferrer" key={id}>{id}</a>) : "暂无"}</dd></div></dl><p className="detail-boundary">这里仅表示CCD编号是否出现在PDB聚合物序列中；短链命中不等于环肽使用，也不代表具有口服性质。</p></> : <div className="detail-empty"><strong>尚未完成PDB序列核查</strong><p>没有核查结果不代表该组分未用于肽，只表示当前版本尚未完成检索。</p></div>}</section>

          {record.synthesisUsability && <section className="detail-section"><div className="detail-section-title"><span>04</span><h2>合成资料核查</h2></div><div className={`compound-synthesis-panel ${record.synthesisUsability.compatibility}`}><header><div><span>合成可用性审核</span><strong>{record.synthesisUsability.statusLabel}</strong></div><b>{record.synthesisUsability.compatibilityLabel}</b></header><dl><div><dt>保护形式</dt><dd>{record.synthesisUsability.protectedForms.join(" / ")}</dd></div><div><dt>使用建议</dt><dd>{record.synthesisUsability.guidance}</dd></div><div><dt>主要风险</dt><dd>{record.synthesisUsability.risks}</dd></div></dl><p>{record.synthesisUsability.availabilityBoundary}</p><nav>{record.synthesisUsability.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</nav></div></section>}

          {record.corePriorityReview && <section className="detail-section detail-review-supplement"><div className="detail-section-title"><span>深审</span><h2>原优先候选人工审核</h2></div><div className="detail-review-result"><div className="detail-review-result-head"><strong>第{record.corePriorityReview.batch}批审核 · {record.corePriorityReview.reviewedAt}</strong><span>{record.corePriorityReview.grade}</span></div><dl className="detail-definition-list"><div><dt>审核结论</dt><dd>{record.corePriorityReview.conclusion}</dd></div><div><dt>合成／身份</dt><dd>{record.corePriorityReview.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{record.corePriorityReview.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{record.corePriorityReview.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{record.corePriorityReview.recommendation}</dd></div></dl>{record.corePriorityReview.sources.length > 0 && <div className="detail-review-sources">{record.corePriorityReview.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div>}</div></section>}

          {review && <section className="detail-section detail-review-supplement"><div className="detail-section-title"><span>05</span><h2>人工证据审核</h2></div><div className="detail-review-result"><div className="detail-review-result-head"><strong>CCD {review.ccdId}</strong><span>{review.gradeLabel}</span></div><dl className="detail-definition-list"><div><dt>审核结论</dt><dd>{review.conclusion}</dd></div><div><dt>合成／身份</dt><dd>{review.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{review.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{review.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{review.recommendation}</dd></div></dl><div className="detail-review-sources">{review.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div></div></section>}
        </div>

        <aside className="detail-sidebar">
          <section><span>永久结构标识</span><p>CCD {record.primaryCcdId}</p><small>网站记录ID：{record.id}</small></section>
          <section><span>推荐引用</span><p>口服环肽残基证据库. CCD {record.primaryCcdId}: {record.name}. 结构目录版本5.1, 2026-09-02.</p></section>
          <section><span>原始结构来源</span><a href={record.sourceUrl} target="_blank" rel="noreferrer">打开RCSB CCD记录 ↗</a><Link href="/quality/">查看版本与质量说明 →</Link></section>
        </aside>
      </div>

      <nav className="detail-record-nav" aria-label="相邻结构记录">
        {previous ? <Link className="record-nav-card record-nav-previous" href={`/compound/${previous.primaryCcdId.toLowerCase()}/`}><b>←</b><span>上一条结构</span><strong>{previous.name}</strong><small>CCD {previous.primaryCcdId}</small></Link> : <Link className="record-nav-card record-nav-back" href="/catalog/"><b>⌂</b><span>返回</span><strong>CCD结构库</strong></Link>}
        {next ? <Link className="record-nav-card record-nav-next" href={`/compound/${next.primaryCcdId.toLowerCase()}/`}><b>→</b><span>下一条结构</span><strong>{next.name}</strong><small>CCD {next.primaryCcdId}</small></Link> : <Link className="record-nav-card record-nav-back record-nav-next" href="/catalog/"><b>⌂</b><span>返回</span><strong>CCD结构库</strong></Link>}
      </nav>
    </article>
    <SiteFooter />
  </main>;
}
