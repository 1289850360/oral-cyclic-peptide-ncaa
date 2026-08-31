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
const tierLabel = { priority: "优先研发候选", conditional: "条件候选", reference: "仅结构参考", exclude: "明确排除" } as const;
const originLabel = { "core-structure-screen": "结构筛选核心", "research-evidence-linked": "研发证据关联", "conditional-review": "待验证候选层" } as const;
const componentClassMeta = catalogJson.metadata.componentClassMeta as Record<CatalogRecord["componentClass"]["id"], { label: string; shortLabel: string; description: string }>;

export function generateStaticParams() {
  return records.map((record) => ({ ccdId: record.primaryCcdId.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ ccdId: string }> }): Promise<Metadata> {
  const { ccdId } = await params;
  const record = recordByCcd.get(ccdId.toLowerCase());
  if (!record) return {};
  return { title: `CCD ${record.primaryCcdId}｜${record.name}`, description: `${record.name}的CCD结构身份、五层证据状态与研发筛选边界。`, alternates: { canonical: `/compound/${record.primaryCcdId.toLowerCase()}/` } };
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
        <div><p className="eyebrow">CHEMICAL COMPONENT RECORD · CCD {record.primaryCcdId}</p><h1>{record.name}</h1><p className="detail-english-name">{record.synonyms.join(" · ") || "无已收录同义词"}</p><div className="detail-badges"><span>{componentClassMeta[record.componentClass.id].shortLabel}</span><span>{tierLabel[record.screening.tier]}</span><span>{originLabel[record.catalogOrigin]}</span><span>{record.categoryLabel}</span></div></div>
        <div className="compound-hero-structure"><img src={record.structureImageUrl} alt={`${record.name}二维结构`} /><span>CCD {record.ccdIds.join(" / ")}</span></div>
      </header>

      <div className="detail-layout">
        <div className="detail-main-column">
          <section className="detail-section"><div className="detail-section-title"><span>01</span><h2>构件身份与五层证据</h2></div><div className={`compound-classification component-${record.componentClass.id}`}><div><span>当前构件分类</span><strong>{componentClassMeta[record.componentClass.id].label}</strong></div><p>{componentClassMeta[record.componentClass.id].description}</p><small>分类依据：{record.componentClass.basis} · {record.componentClass.method === "manual-review" ? "人工来源审核" : record.componentClass.method === "pdb-sequence-audit" ? "PDB序列审计" : "结构规则初分"}</small></div><div className="compound-evidence-grid">{evidenceRows.map(([label, state]) => <article data-status={state.status} key={label}><span>{label}</span><strong>{state.label}</strong></article>)}</div>{record.researchEvidence.length > 0 && <div className="compound-research-evidence"><div><span>关联研发证据</span><strong>{record.researchEvidence.length}条资料已与CCD {record.primaryCcdId}对齐</strong></div><ul>{record.researchEvidence.map((item) => <li key={`${item.recordId}-${item.level}`}><b>{item.level}</b><span>{item.name}</span></li>)}</ul><Link href={`/?q=${encodeURIComponent(record.primaryCcdId)}#database`}>在研发证据库中查看 →</Link></div>}<p className="detail-boundary">五层状态分别判断。CCD结构成立不等于单体可合成；肽中出现也不能证明能够改善目标环肽的口服吸收。</p></section>

          <section className="detail-section"><div className="detail-section-title"><span>02</span><h2>结构身份</h2></div><dl className="detail-definition-list"><div><dt>CCD编号</dt><dd>{record.ccdIds.join(" / ")}</dd></div><div><dt>分子式／分子量</dt><dd>{record.formula} · {record.formulaWeight?.toFixed(3) ?? "—"} Da</dd></div><div><dt>连接类型</dt><dd>{record.linkageTypes.join("；")}</dd></div><div><dt>标准母体</dt><dd>{record.parentIds.join(" / ") || "CCD未指定"}</dd></div><div><dt>立体化学SMILES</dt><dd className="smiles-value">{record.smiles}</dd></div><div><dt>结构标签</dt><dd>{record.tags.join("、") || "未自动归类"}</dd></div></dl></section>

          <section className="detail-section"><div className="detail-section-title"><span>03</span><h2>研发筛选结论</h2></div><p className="detail-lead">{tierLabel[record.screening.tier]}</p><dl className="detail-definition-list"><div><dt>收录来源</dt><dd>{originLabel[record.catalogOrigin]}</dd></div><div><dt>筛选理由</dt><dd>{record.screening.reasons.join("；")}</dd></div><div><dt>性质假设</dt><dd>{record.predictedEffects.join("；")}</dd></div><div><dt>风险与缺口</dt><dd>{record.screening.cautions.join("；") || "当前自动筛选未生成额外风险提示"}</dd></div><div><dt>人工复核</dt><dd>{record.screening.manualReviewRequired ? "仍需人工复核" : "本轮人工证据审核已完成"}</dd></div></dl>{record.candidateTriage && <div className={`compound-triage-panel triage-${record.candidateTriage.status}`}><span>待验证候选二次分层 · 自动初筛</span><strong>{record.candidateTriage.statusLabel}</strong><p>{record.candidateTriage.reasons.join("；")}</p><small>{record.candidateTriage.reviewBoundary}</small></div>}{record.synthesisUsability && <div className={`compound-synthesis-panel ${record.synthesisUsability.compatibility}`}><header><div><span>合成可用性审核</span><strong>{record.synthesisUsability.statusLabel}</strong></div><b>{record.synthesisUsability.compatibilityLabel}</b></header><dl><div><dt>保护形式</dt><dd>{record.synthesisUsability.protectedForms.join(" / ")}</dd></div><div><dt>使用建议</dt><dd>{record.synthesisUsability.guidance}</dd></div><div><dt>主要风险</dt><dd>{record.synthesisUsability.risks}</dd></div></dl><p>{record.synthesisUsability.availabilityBoundary}</p><nav>{record.synthesisUsability.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.title} ↗</a>)}</nav></div>}</section>

          <section className="detail-section"><div className="detail-section-title"><span>04</span><h2>PDB使用记录</h2></div>{usage ? <dl className="detail-definition-list"><div><dt>使用状态</dt><dd>{record.evidenceProfile.peptideUse.label}</dd></div><div><dt>聚合物实体</dt><dd>{usage.polymerEntityCount}个</dd></div><div><dt>≤50残基实体</dt><dd>{usage.shortPolymerEntityCount}个</dd></div><div><dt>示例PDB</dt><dd className="pdb-example-links">{usage.exampleEntryIds.length ? usage.exampleEntryIds.map((id) => <a href={`https://www.rcsb.org/structure/${id}`} target="_blank" rel="noreferrer" key={id}>{id}</a>) : "暂无"}</dd></div></dl> : <div className="detail-empty"><strong>尚未完成PDB序列使用审计</strong><p>没有审计结果不代表该组分未用于肽，只表示当前版本尚未核查。</p></div>}{record.pdbContextAudit && <div className={`compound-pdb-context audit-${record.pdbContextAudit.status}`}><header><span>代表PDB标题自动初筛</span><strong>{record.pdbContextAudit.statusLabel}</strong></header><div>{record.pdbContextAudit.examples.map((example) => <a href={example.url} target="_blank" rel="noreferrer" key={example.entryId}><b>{example.entryId}</b><span>{example.title}</span></a>)}</div><p>{record.pdbContextAudit.reviewBoundary}</p></div>}</section>

          {record.corePriorityReview && <section className="detail-section detail-review-supplement"><div className="detail-section-title"><span>深审</span><h2>原优先候选人工审核</h2></div><div className="detail-review-result"><div className="detail-review-result-head"><strong>第{record.corePriorityReview.batch}批审核 · {record.corePriorityReview.reviewedAt}</strong><span>{record.corePriorityReview.grade}</span></div><dl className="detail-definition-list"><div><dt>审核结论</dt><dd>{record.corePriorityReview.conclusion}</dd></div><div><dt>合成／身份</dt><dd>{record.corePriorityReview.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{record.corePriorityReview.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{record.corePriorityReview.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{record.corePriorityReview.recommendation}</dd></div></dl>{record.corePriorityReview.sources.length > 0 && <div className="detail-review-sources">{record.corePriorityReview.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div>}</div></section>}

          {review && <section className="detail-section detail-review-supplement"><div className="detail-section-title"><span>05</span><h2>人工证据审核</h2></div><div className="detail-review-result"><div className="detail-review-result-head"><strong>CCD {review.ccdId}</strong><span>{review.gradeLabel}</span></div><dl className="detail-definition-list"><div><dt>审核结论</dt><dd>{review.conclusion}</dd></div><div><dt>合成／身份</dt><dd>{review.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{review.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{review.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{review.recommendation}</dd></div></dl><div className="detail-review-sources">{review.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div></div></section>}
        </div>

        <aside className="detail-sidebar">
          <section><span>永久结构标识</span><p>CCD {record.primaryCcdId}</p><small>网站记录ID：{record.id}</small></section>
          <section><span>推荐引用</span><p>口服环肽残基证据库. CCD {record.primaryCcdId}: {record.name}. 结构目录版本3.3, 2026-08-31.</p></section>
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
