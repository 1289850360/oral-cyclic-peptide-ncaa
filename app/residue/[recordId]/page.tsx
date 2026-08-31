import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { masterRecordBySlug, masterRecords } from "../../master-records";
import { ccdEntryUrl, ccdImageUrl, getStructures, structureNotesByEnglish } from "../../structure-data";
import { experimentData, getDesignGuide, supportScope } from "../../v22-data";
import SiteFooter from "../../site-footer";
import SiteHeader from "../../site-header";
import { deepReviewByCcd } from "../../deep-review-data";

export function generateStaticParams() {
  return masterRecords.map((record) => ({ recordId: record.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ recordId: string }> }): Promise<Metadata> {
  const { recordId } = await params;
  const record = masterRecordBySlug.get(recordId.toLowerCase());
  if (!record) return {};
  return {
    title: `${record.name}（${record.id}）｜口服环肽残基证据库`,
    description: `${record.name} / ${record.english} 的结构、研发证据、实验边界与原始来源。`,
    alternates: { canonical: `/residue/${record.slug}/` },
  };
}

export default async function ResidueDetailPage({ params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;
  const record = masterRecordBySlug.get(recordId.toLowerCase());
  if (!record) notFound();

  const structures = getStructures(record.english);
  const internalStructureId = structures.length ? null : `OCP-X-${record.id.replace("OCPR", "")}`;
  const deepReviewMatches = structures.map((structure) => deepReviewByCcd.get(structure.ccd.toUpperCase())).filter((item) => item !== undefined);
  const experiment = experimentData[record.english];
  const design = getDesignGuide(record);
  const scopes = supportScope(record);
  const recordIndex = masterRecords.findIndex((item) => item.id === record.id);
  const previous = recordIndex > 0 ? masterRecords[recordIndex - 1] : null;
  const next = recordIndex < masterRecords.length - 1 ? masterRecords[recordIndex + 1] : null;
  const citation = `口服环肽非天然残基证据库. ${record.name} (${record.id}). Version ${record.recordVersion}, ${record.reviewedAt}.`;

  return <main>
    <SiteHeader active="evidence" />
    <article className="residue-detail-page">
      <nav className="detail-breadcrumb" aria-label="面包屑"><Link href="/">首页</Link><span>›</span><Link href="/#database">研发证据库</Link><span>›</span><strong>{record.id}</strong></nav>

      <header className="detail-hero">
        <div><p className="eyebrow">CURATED RESIDUE RECORD · {record.id}</p><h1>{record.name}</h1><p className="detail-english-name">{record.english}</p><div className="detail-badges"><span>{record.category}</span><span>{record.level}</span>{scopes.map((scope) => <span key={scope}>{scope}</span>)}</div></div>
        <dl className="detail-identity-grid"><div><dt>永久编号</dt><dd>{record.id}</dd></div><div><dt>记录版本</dt><dd>V{record.recordVersion}</dd></div><div><dt>最近审核</dt><dd>{record.reviewedAt}</dd></div><div><dt>{internalStructureId ? "内部概念标识" : "CCD映射"}</dt><dd>{internalStructureId ?? structures.map((item) => item.ccd).join(" / ")}</dd></div></dl>
      </header>

      <div className="detail-layout">
        <div className="detail-main-column">
          <section className="detail-section"><div className="detail-section-title"><span>01</span><h2>结构身份</h2></div>{structures.length ? <div className="detail-structures">{structures.map((structure) => <a href={ccdEntryUrl(structure.ccd)} target="_blank" rel="noreferrer" key={structure.ccd}><img src={ccdImageUrl(structure.ccd)} alt={`${structure.label}二维结构`} /><div><b>CCD {structure.ccd}</b><span>{structure.label}</span><small>打开RCSB原始记录 ↗</small></div></a>)}</div> : <div className="detail-empty"><strong>{internalStructureId} · 暂无唯一CCD结构</strong><p>{structureNotesByEnglish[record.english] ?? "当前记录尚未找到与名称和立体化学完全对应的CCD单体。"}</p><p>该编号用于引用本站的概念或改造策略记录，不表示已经确定一种单一化学结构。</p></div>}</section>

          <section className="detail-section"><div className="detail-section-title"><span>02</span><h2>研发定位与性质假设</h2></div><p className="detail-lead">{record.effect}</p><dl className="detail-definition-list"><div><dt>优先替换位置</dt><dd>{design.replace}</dd></div><div><dt>主要目标</dt><dd>{design.goal}</dd></div><div><dt>限制条件</dt><dd>{design.avoid}</dd></div></dl><p className="detail-boundary">本栏依据残基类别和已报道骨架提出实验假设；目标环肽中的实际效应应由同骨架替换对照确认。</p></section>

          <section className="detail-section"><div className="detail-section-title"><span>03</span><h2>实验与证据边界</h2></div>{experiment ? <dl className="detail-definition-list"><div><dt>骨架／改造</dt><dd>{experiment.comparison}</dd></div><div><dt>观察指标</dt><dd>{experiment.endpoint}</dd></div><div><dt>实验结果</dt><dd><strong>{experiment.result}</strong></dd></div><div><dt>实验环境</dt><dd>{experiment.system}</dd></div><div><dt>归因边界</dt><dd>{experiment.formulation}</dd></div></dl> : <div className="detail-empty"><strong>没有单残基定量对照</strong><p>现有来源支持完整分子、候选集合或权利要求范围，不能把整体表现归因于这一处残基。</p></div>}<div className="detail-source-claim"><span>来源支持的原始结论</span><p>{record.evidence}</p></div></section>

          {deepReviewMatches.length > 0 && <section className="detail-section detail-review-supplement"><div className="detail-section-title"><span>补充</span><h2>人工审核记录</h2></div><p className="detail-lead">本记录与审核数据中的CCD结构一致。下列分级描述肽或环肽中的使用证据，与口服性质证据分开记录。</p>{deepReviewMatches.map((review) => <div className="detail-review-result" key={review.ccdId}><div className="detail-review-result-head"><strong>CCD {review.ccdId}</strong><span>{review.gradeLabel}</span></div><dl className="detail-definition-list"><div><dt>审核结论</dt><dd>{review.conclusion}</dd></div><div><dt>合成／身份</dt><dd>{review.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{review.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{review.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{review.recommendation}</dd></div></dl><div className="detail-review-sources">{review.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.evidenceType}</span><strong>{source.title}</strong><small>打开原始来源 ↗</small></a>)}</div></div>)}</section>}

          <section className="detail-section"><div className="detail-section-title"><span>04</span><h2>来源与字段溯源</h2></div><div className="detail-sources"><a href={record.href} target="_blank" rel="noreferrer"><span>主要来源</span><strong>{record.paper}</strong><small>支持：残基身份、研发使用或性质结论 ↗</small></a>{record.secondary && <a href={record.secondary.href} target="_blank" rel="noreferrer"><span>补充来源</span><strong>{record.secondary.paper}</strong><small>支持：补充骨架或对照证据 ↗</small></a>}</div></section>
        </div>

        <aside className="detail-sidebar">
          <section><span>推荐引用</span><p>{citation}</p><small>访问日期请由引用者按实际日期补充。</small></section>
          <section><span>证据解释</span><p>“进入肽”“存在于口服骨架”和“单点改善口服吸收”是不同结论，本记录按字段分别陈述。</p></section>
          <section><span>机器可读数据</span><a href="../../api/v1/residues">下载主记录JSON ↗</a><Link href="/quality/">查看版本与质量报告 →</Link></section>
        </aside>
      </div>

      <nav className="detail-record-nav" aria-label="相邻残基记录">
        {previous ? <Link className="record-nav-card record-nav-previous" href={`/residue/${previous.slug}/`}><b aria-hidden="true">←</b><span>上一条记录</span><strong>{previous.name}</strong><small>{previous.id}</small></Link> : <Link className="record-nav-card record-nav-back" href="/#database"><b aria-hidden="true">⌂</b><span>返回</span><strong>研发证据库</strong><small>浏览全部53条整理记录</small></Link>}
        {next ? <Link className="record-nav-card record-nav-next" href={`/residue/${next.slug}/`}><b aria-hidden="true">→</b><span>下一条记录</span><strong>{next.name}</strong><small>{next.id}</small></Link> : <Link className="record-nav-card record-nav-back record-nav-next" href="/#database"><b aria-hidden="true">⌂</b><span>已到最后一条</span><strong>返回研发证据库</strong><small>重新筛选或比较记录</small></Link>}
      </nav>
    </article>
    <SiteFooter />
  </main>;
}
