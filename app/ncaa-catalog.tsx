"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ComponentClass = "evidence-reviewed-residue" | "pdb-peptide-occurrence" | "special-reference" | "candidate-pending" | "excluded-nonmonomer";

type CatalogRecord = {
  id: string;
  ccdIds: string[];
  primaryCcdId: string;
  name: string;
  synonyms: string[];
  formula: string;
  formulaWeight: number | null;
  category: string;
  categoryLabel: string;
  tags: string[];
  predictedEffects: string[];
  sourceUrl: string;
  structureImageUrl: string;
  componentClass: { id: ComponentClass; basis: string; method: "manual-review" | "pdb-sequence-audit" | "rule-based" | "ccd-linkage-identity-audit" | "complete-ccd-identity-recheck" };
  researchEvidence: Array<{ recordId: string; level: string; name: string; confirmsUse: boolean }>;
};

type CatalogPayload = {
  records: CatalogRecord[];
};

const INCLUDED_CLASSES = new Set<ComponentClass>(["evidence-reviewed-residue"]);
const PAGE_SIZE = 20;
const TARGET_PROPERTY_FILTERS = [
  { id: "all", label: "全部目标性质", keywords: [] },
  { id: "permeability", label: "渗透性相关", keywords: ["渗透", "膜分配"] },
  { id: "hydrophobicity", label: "疏水性相关", keywords: ["疏水", "脂溶"] },
  { id: "solubility", label: "溶解度相关", keywords: ["水溶", "溶解度"] },
  { id: "stability", label: "稳定性相关", keywords: ["稳定性", "抗酶解", "蛋白酶"] },
  { id: "polarity", label: "降低极性相关", keywords: ["极性可能↓", "氢键供体可能↓"] },
  { id: "conformation", label: "构象控制相关", keywords: ["构象", "刚性", "折叠", "骨架间距"] },
] as const;

const propertyEvidenceFor = (record: CatalogRecord) => record.researchEvidence.filter((item) => item.level === "直接证据" || item.level === "改造证据");
const reviewMethodLabel = (record: CatalogRecord) => record.componentClass.method === "manual-review" ? "人工来源审核" : record.componentClass.method === "pdb-sequence-audit" ? "PDB序列审计" : record.componentClass.method === "ccd-linkage-identity-audit" ? "CCD官方单体类型核验" : record.componentClass.method === "complete-ccd-identity-recheck" ? "完整CCD身份复核" : "结构规则初分";

export default function NcaaCatalog({ assetPrefix = "" }: { assetPrefix?: string }) {
  const [payload, setPayload] = useState<CatalogPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [targetProperty, setTargetProperty] = useState<(typeof TARGET_PROPERTY_FILTERS)[number]["id"]>("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    fetch(`${assetPrefix}ccd-unified-structure-catalog.json`)
      .then((response) => { if (!response.ok) throw new Error("catalog request failed"); return response.json() as Promise<CatalogPayload>; })
      .then((result) => { if (active) setPayload(result); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [assetPrefix]);

  useEffect(() => {
    const urlQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    if (urlQuery) setQuery(urlQuery);
  }, []);

  const ncaaRecords = useMemo(() => (payload?.records ?? []).filter((record) => INCLUDED_CLASSES.has(record.componentClass.id)), [payload]);

  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    ncaaRecords.forEach((record) => {
      const current = counts.get(record.category);
      counts.set(record.category, { label: record.categoryLabel, count: (current?.count ?? 0) + 1 });
    });
    return [...counts.entries()].map(([id, value]) => ({ id, ...value })).sort((a, b) => b.count - a.count);
  }, [ncaaRecords]);

  const propertyOptions = useMemo(() => TARGET_PROPERTY_FILTERS.map((propertyFilter) => ({
    ...propertyFilter,
    count: propertyFilter.id === "all" ? ncaaRecords.length : ncaaRecords.filter((record) => propertyFilter.keywords.some((keyword) => record.predictedEffects.some((effect) => effect.includes(keyword)))).length,
  })), [ncaaRecords]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const propertyFilter = TARGET_PROPERTY_FILTERS.find((item) => item.id === targetProperty)!;
    return ncaaRecords.filter((record) => {
      const searchable = [record.primaryCcdId, ...record.ccdIds, record.name, ...record.synonyms, record.formula, record.categoryLabel, ...record.tags, ...record.predictedEffects].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (propertyFilter.keywords.length === 0 || propertyFilter.keywords.some((keyword) => record.predictedEffects.some((effect) => effect.includes(keyword))))
        && (category === "all" || record.category === category);
    });
  }, [ncaaRecords, query, targetProperty, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clearFilters = () => { setQuery(""); setTargetProperty("all"); setCategory("all"); setPage(1); };

  return (
    <section className="ccd-catalog-section ncaa-catalog-page" aria-labelledby="ncaa-catalog-title">
      <div className="section-heading ccd-heading">
        <div><p className="eyebrow">CCD-DEFINED NON-CANONICAL AMINO ACIDS</p><h2 id="ncaa-catalog-title">非天然氨基酸库</h2></div>
        <p>集中收录已完成身份核验、具有CCD编号的非天然氨基酸及明确衍生物。结构分类沿用CCD结构库中的原有分类。</p>
      </div>

      <div className="ncaa-scope-note">
        <strong>这个库回答什么？</strong>
        <p>它用于判断一个CCD化学组分是否可以作为非天然氨基酸或单一非标准残基理解。当前1,845条已经确认身份，没有遗留的身份待确认记录。官方肽链连接型候选及最后一条边界记录CCD 96Z均已完成核验。论文中的溶解度、渗透性、稳定性等性质证据仍统一放在研发证据库中。<a className="ncaa-audit-download" href={`${assetPrefix}ccd-peptide-linking-identity-recheck.csv`}>下载完整身份复核表</a></p>
      </div>

      <div className="ncaa-filter-panel">
        <label><span>搜索CCD编号、名称、同义词或分子式</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="例如：MLU、N-methyl、phenylglycine、C8 H9 N O2" /></label>
        <label><span>目标性质</span><select value={targetProperty} onChange={(event) => { setTargetProperty(event.target.value as (typeof TARGET_PROPERTY_FILTERS)[number]["id"]); setPage(1); }}>{propertyOptions.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
        <label><span>原有结构分类</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">全部结构分类</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
      </div>
      <p className="ncaa-property-note">目标性质依据结构规则提示进行筛选，表示该结构可能影响相应性质，不代表已经获得实验验证；实验结论请以研发证据库为准。</p>

      {loadError ? <div className="ccd-loading"><strong>非天然氨基酸库暂时没有载入</strong><p>请稍后刷新页面重试。</p></div> : !payload ? <div className="ccd-loading">正在载入非天然氨基酸库…</div> : <>
        <div className="ccd-result-bar"><span>找到 <strong>{filtered.length}</strong> 条记录 · 第 {safePage}/{totalPages} 页</span>{(query || targetProperty !== "all" || category !== "all") && <button onClick={clearFilters}>清除筛选</button>}</div>
        {shown.length > 0 ? <div className="ncaa-record-list">{shown.map((record) => {
          return <article className="ncaa-record-card confirmed" key={record.id}>
            <a className="ncaa-record-structure" href={record.sourceUrl} target="_blank" rel="noreferrer"><img src={record.structureImageUrl} alt={`${record.name}二维结构`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /><b>{record.primaryCcdId}</b></a>
            <div className="ncaa-record-identity"><div className="ncaa-record-kicker"><span>CCD {record.ccdIds.join(" / ")}</span><b className="confirmed">已确认非天然氨基酸</b></div><h3>{record.name}</h3>{record.synonyms.length > 0 && <p>{record.synonyms.slice(0, 3).join(" · ")}</p>}<small>{record.formula} · {record.formulaWeight?.toFixed(3) ?? "—"} Da</small></div>
            <div className="ncaa-record-review"><span>{record.categoryLabel}</span><strong>CCD单体类型或人工来源支持其非天然氨基酸身份</strong><p>{reviewMethodLabel(record)}{propertyEvidenceFor(record).length > 0 ? ` · 已关联${propertyEvidenceFor(record).length}条直接性质实验` : " · 暂无直接性质实验"}</p><div><Link href={`/compound/${record.primaryCcdId.toLowerCase()}/`}>查看结构记录 →</Link>{propertyEvidenceFor(record).length > 0 && <Link href={`/?q=${encodeURIComponent(record.primaryCcdId)}#database`}>查看研发证据 →</Link>}</div></div>
          </article>;
        })}</div> : <div className="ccd-loading"><strong>没有找到匹配记录</strong><p>可以尝试CCD编号、英文名称或减少筛选条件。</p></div>}
        {filtered.length > PAGE_SIZE && <nav className="pagination ccd-pagination" aria-label="非天然氨基酸库分页"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1}>上一页</button><div><span>{safePage} / {totalPages}</span></div><button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>下一页</button></nav>}
      </>}
    </section>
  );
}
