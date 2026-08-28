"use client";

import { useEffect, useMemo, useState } from "react";

type CcdCoreRecord = {
  id: string;
  ccdIds: string[];
  primaryCcdId: string;
  name: string;
  synonyms: string[];
  formula: string;
  formulaWeight: number | null;
  parentIds: string[];
  linkageTypes: string[];
  smiles: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  predictedEffects: string[];
  sourceUrl: string;
  structureImageUrl: string;
};

type CcdCatalogPayload = {
  metadata: {
    snapshotDate: string;
    source: string;
    sourceUrl: string;
    count: number;
    scope: string;
  };
  records: CcdCoreRecord[];
};

const PAGE_SIZE = 24;
const CATEGORY_ORDER = [
  "n-substitution",
  "d-configuration",
  "alpha-substitution",
  "extended-backbone",
  "conformational-constraint",
  "halogen-electronic",
  "hydrophobic-aromatic",
  "polar-charged",
  "other",
];

const compactPages = (current: number, total: number): Array<number | "ellipsis"> => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const numbers = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...numbers].filter((number) => number >= 1 && number <= total).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  sorted.forEach((number, index) => {
    if (index > 0 && number - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(number);
  });
  return result;
};

export default function CcdCatalog() {
  const [payload, setPayload] = useState<CcdCatalogPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetch("ccd-verified-cores.json")
      .then((response) => {
        if (!response.ok) throw new Error("CCD catalog request failed");
        return response.json() as Promise<CcdCatalogPayload>;
      })
      .then((result) => { if (active) setPayload(result); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => {
    if (!payload) return [];
    const countMap = new Map<string, { label: string; count: number }>();
    payload.records.forEach((record) => {
      const current = countMap.get(record.category);
      countMap.set(record.category, { label: record.categoryLabel, count: (current?.count ?? 0) + 1 });
    });
    return CATEGORY_ORDER.filter((id) => countMap.has(id)).map((id) => ({ id, ...countMap.get(id)! }));
  }, [payload]);

  const filtered = useMemo(() => {
    if (!payload) return [];
    const normalized = query.trim().toLowerCase();
    return payload.records.filter((record) => {
      const searchable = [
        record.primaryCcdId,
        ...record.ccdIds,
        record.name,
        ...record.synonyms,
        record.formula,
        ...record.parentIds,
        record.categoryLabel,
        ...record.tags,
        ...record.predictedEffects,
      ].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (category === "all" || record.category === category);
    });
  }, [payload, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };
  const changeCategory = (value: string) => { setCategory(value); setPage(1); };

  return (
    <section className="ccd-catalog-section" id="ccd-catalog" aria-labelledby="ccd-catalog-title">
      <div className="section-heading ccd-heading">
        <div><p className="eyebrow">STRUCTURE-VERIFIED CCD CATALOG</p><h2 id="ccd-catalog-title">CCD结构名录</h2></div>
        <p>这里收录的是结构身份和肽链连接类型已经由CCD明确记录的核心。性质标签属于结构层面的可能影响，不等同于已经证明能够提高口服吸收。</p>
      </div>

      <div className="ccd-catalog-summary">
        <div><strong>1,687</strong><span>去重后的肽链核心结构</span></div>
        <div><strong>100%</strong><span>具有立体化学SMILES</span></div>
        <div><strong>2026-08-26</strong><span>CCD数据快照</span></div>
        <div className="catalog-downloads">
          <a href="ccd-verified-cores-1687.csv" download>下载结构名录 CSV</a>
          <a href="ccd-manual-review-1805.csv" download>下载人工审核清单</a>
          <a href="catalog-integrity-report.json" download>下载完整性校验报告</a>
        </div>
      </div>

      <div className="ccd-boundary-note">
        <strong>如何理解这1,687条</strong>
        <p>本地校验已确认1,687条记录在JSON/CSV之间一致，CCD详情和二维图链接也与编号逐条对应。该结果只证明数据配对完整；“渗透性可能↑”等标签仍是化学类别推断，只有进入下方证据数据库并关联论文或专利后，才能作为具体研发依据。</p>
      </div>

      <div className="ccd-filter-panel">
        <label><span>搜索CCD编号、名称、同义词或分子式</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="例如：AIB、N-methyl、phenylglycine、C8 H9 N O2" /></label>
        <label><span>结构类别</span><select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">全部结构类别</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
      </div>

      {loadError ? <div className="ccd-loading"><strong>结构名录暂时没有载入</strong><p>可以先下载CSV，或稍后刷新页面重试。</p></div> : !payload ? <div className="ccd-loading">正在载入CCD结构名录…</div> : <>
        <div className="ccd-result-bar"><span>找到 <strong>{filtered.length}</strong> 个结构 · 第 {safePage}/{totalPages} 页</span>{(query || category !== "all") && <button onClick={() => { changeQuery(""); changeCategory("all"); }}>清除筛选</button>}</div>
        {shown.length ? <div className="ccd-record-grid">{shown.map((record) => <article className="ccd-record-card" key={record.id}>
          <div className="ccd-card-head"><span>CCD {record.ccdIds.join(" / ")}</span><em>{record.categoryLabel}</em></div>
          <div className="ccd-card-main">
            <a className="ccd-structure" href={record.sourceUrl} target="_blank" rel="noreferrer" aria-label={`打开CCD ${record.primaryCcdId}`}>
              <img src={record.structureImageUrl} alt={`${record.name}二维结构`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <b>{record.primaryCcdId}</b>
            </a>
            <div><h3>{record.name}</h3>{record.synonyms.length > 0 && <p className="ccd-synonyms">{record.synonyms.slice(0, 2).join(" · ")}</p>}<p className="ccd-formula">{record.formula} · {record.formulaWeight?.toFixed(3) ?? "—"} Da</p></div>
          </div>
          <div className="ccd-effect-tags">{record.predictedEffects.map((effect) => <span key={effect}>{effect}</span>)}</div>
          <details className="ccd-details"><summary>结构信息与判断边界</summary><dl>
            <div><dt>CCD连接类型</dt><dd>{record.linkageTypes.join("；")}</dd></div>
            <div><dt>母体残基</dt><dd>{record.parentIds.join(" / ") || "CCD未指定"}</dd></div>
            <div><dt>结构标签</dt><dd>{record.tags.join("、") || "未自动归类"}</dd></div>
            <div><dt>SMILES</dt><dd className="smiles-value">{record.smiles}</dd></div>
          </dl><p>当前性质说明为结构/类别推断，尚不能代替同骨架替换实验。</p><a href={record.sourceUrl} target="_blank" rel="noreferrer">在RCSB查看原始CCD记录 ↗</a></details>
        </article>)}</div> : <div className="ccd-loading"><strong>没有找到匹配结构</strong><p>可以尝试CCD编号、英文名称或减少筛选条件。</p></div>}
        {filtered.length > PAGE_SIZE && <nav className="pagination ccd-pagination" aria-label="CCD结构名录分页"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1}>上一页</button><div>{compactPages(safePage, totalPages).map((item, index) => item === "ellipsis" ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <button className={item === safePage ? "active" : ""} aria-current={item === safePage ? "page" : undefined} onClick={() => setPage(item)} key={item}>{item}</button>)}</div><button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>下一页</button></nav>}
      </>}

      <details className="manual-review-guide" id="manual-review">
        <summary><span><b>人工审核清单</b><small>1,805个结构 · 点击查看审核方法</small></span><strong>+</strong></summary>
        <div className="review-guide-content">
          <div className="review-priority">
            <article><b>P0</b><strong>6个网站已有例外</strong><p>确认名称、构型和CCD结构与现有证据条目完全一致。</p></article>
            <article><b>P1</b><strong>45个标准母体候选</strong><p>重点判断修饰后的组分能否作为独立肽合成单体。</p></article>
            <article><b>P2</b><strong>484个唯一结构候选</strong><p>名称与结构同时呈现氨基酸特征，逐项排除药物和代谢物。</p></article>
            <article><b>P3</b><strong>1,270个结构命中项</strong><p>只说明分子内含氨基酸样片段，不应直接并入主名录。</p></article>
          </div>
          <ol className="review-steps">
            <li><strong>先看结构身份：</strong>确认有可参与肽键形成的氨基和羧基，并固定立体构型。</li>
            <li><strong>再排除非残基：</strong>完整药物、短肽、辅因子、代谢物、保护体、盐型和端基试剂标为“排除”。</li>
            <li><strong>确认合成用途：</strong>在论文、专利或供应商资料中寻找其作为SPPS/LPPS单体或多肽残基的明确记录。</li>
            <li><strong>最后审核性质：</strong>只有同骨架替换或明确实例数据才能写“实验证实”；类别规律只能写“可能”。</li>
          </ol>
          <div className="review-decision"><strong>每条最终只填写三种结论</strong><span>收录：明确的独立残基</span><span>排除：不是残基或只是整分子片段</span><span>暂缓：结构合理但缺少合成用途证明</span></div>
          <a className="review-download" href="ccd-manual-review-1805.csv" download>下载带审核栏的完整CSV</a>
        </div>
      </details>
    </section>
  );
}
