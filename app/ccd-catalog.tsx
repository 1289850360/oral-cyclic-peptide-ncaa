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
  screening: {
    tier: "priority" | "conditional" | "reference" | "exclude";
    reasons: string[];
    cautions: string[];
    manualReviewRequired: boolean;
  };
};

type CcdCatalogPayload = {
  metadata: {
    snapshotDate: string;
    source: string;
    sourceUrl: string;
    count: number;
    scope: string;
    tierCounts: Record<CcdCoreRecord["screening"]["tier"], number>;
    tierMeta: Record<CcdCoreRecord["screening"]["tier"], { label: string; shortLabel: string; description: string }>;
  };
  records: CcdCoreRecord[];
};

type PolymerUsageStatus = "short-polymer" | "polymer-only" | "no-polymer-hit";

type PolymerUsageRecord = {
  id: string;
  status: PolymerUsageStatus;
  polymerEntityCount: number;
  shortPolymerEntityCount: number;
  shortPolymerMaxLength: number;
  exampleEntityIds: string[];
  exampleEntryIds: string[];
};

type PolymerUsagePayload = {
  metadata: {
    auditDate: string;
    candidateCount: number;
    shortPolymerMaxLength: number;
    statusCounts: Record<PolymerUsageStatus, number>;
    scope: string;
  };
  records: PolymerUsageRecord[];
};

type DeepReviewGrade = "A" | "B" | "C" | "EXCLUDE";

type DeepReviewRecord = {
  ccdId: string;
  name: string;
  grade: DeepReviewGrade;
  conclusion: string;
  synthesisEvidence: string;
  cyclicEvidence: string;
  oralEvidence: string;
  recommendation: string;
  sources: Array<{ title: string; url: string; evidenceType: string }>;
  pdbExamples: string[];
};

type DeepReviewPayload = {
  metadata: { count: number; gradeCounts: Record<DeepReviewGrade, number>; scope: string };
  records: DeepReviewRecord[];
};

const USAGE_META: Record<PolymerUsageStatus, { label: string; shortLabel: string }> = {
  "short-polymer": { label: "短肽聚合物命中（≤50残基）", shortLabel: "短肽序列命中" },
  "polymer-only": { label: "仅较长聚合物命中", shortLabel: "长聚合物命中" },
  "no-polymer-hit": { label: "暂无聚合物序列命中", shortLabel: "暂无序列命中" },
};

const PAGE_SIZE = 24;
const REVIEW_PAGE_SIZE = 12;
const CCD_PROPERTY_FILTERS = [
  { id: "all", label: "全部性质", keywords: [] },
  { id: "permeability", label: "渗透性", keywords: ["渗透", "膜分配"] },
  { id: "hydrophobicity", label: "疏水性", keywords: ["疏水", "脂溶"] },
  { id: "solubility", label: "溶解度", keywords: ["水溶", "溶解度"] },
  { id: "stability", label: "稳定性", keywords: ["稳定性", "抗酶解", "蛋白酶"] },
  { id: "polarity", label: "降低极性", keywords: ["极性可能↓", "氢键供体可能↓"] },
  { id: "conformation", label: "构象控制", keywords: ["构象", "刚性", "折叠", "骨架间距"] },
] as const;

const EXACT_CHINESE_NAMES: Record<string, string> = {
  "(2S)-azetidine-2-carboxylic acid": "(2S)-氮杂环丁烷-2-羧酸",
  "1-aminocyclohexanecarboxylic acid": "1-氨基环己烷羧酸",
  "1-aminocycloheptanecarboxylic acid": "1-氨基环庚烷羧酸",
  "S-methyl-D-cysteine": "S-甲基-D-半胱氨酸",
  "N-benzylglycine": "N-苄基甘氨酸",
  "O-methyl-L-tyrosine": "O-甲基-L-酪氨酸",
};

const CHINESE_NAME_PARTS: Array<[RegExp, string]> = [
  [/trifluoromethoxy/gi, "三氟甲氧基"], [/trifluoromethyl/gi, "三氟甲基"], [/carboximidic acid/gi, "甲亚胺酸"],
  [/homophenylalanine/gi, "高苯丙氨酸"], [/phenylalanine/gi, "苯丙氨酸"], [/aminocycloheptanecarboxylic acid/gi, "氨基环庚烷羧酸"],
  [/aminocyclohexanecarboxylic acid/gi, "氨基环己烷羧酸"], [/aminocyclopentanecarboxylic acid/gi, "氨基环戊烷羧酸"],
  [/aspartic acid/gi, "天冬氨酸"], [/glutamic acid/gi, "谷氨酸"], [/asparagine/gi, "天冬酰胺"], [/glutamine/gi, "谷氨酰胺"],
  [/homocysteine/gi, "高半胱氨酸"], [/cysteine/gi, "半胱氨酸"], [/norleucine/gi, "正亮氨酸"], [/isoleucine/gi, "异亮氨酸"],
  [/leucine/gi, "亮氨酸"], [/norvaline/gi, "正缬氨酸"], [/valine/gi, "缬氨酸"], [/tryptophan/gi, "色氨酸"],
  [/tyrosine/gi, "酪氨酸"], [/histidine/gi, "组氨酸"], [/methionine/gi, "蛋氨酸"], [/ornithine/gi, "鸟氨酸"],
  [/arginine/gi, "精氨酸"], [/citrulline/gi, "瓜氨酸"], [/threonine/gi, "苏氨酸"], [/serine/gi, "丝氨酸"],
  [/proline/gi, "脯氨酸"], [/alanine/gi, "丙氨酸"], [/glycine/gi, "甘氨酸"], [/lysine/gi, "赖氨酸"],
  [/azetidine/gi, "氮杂环丁烷"], [/pyrrolidine/gi, "吡咯烷"], [/piperidine/gi, "哌啶"], [/morpholine/gi, "吗啉"],
  [/cycloheptyl/gi, "环庚基"], [/cyclohexyl/gi, "环己基"], [/cyclopentyl/gi, "环戊基"], [/naphthalen/gi, "萘"],
  [/nonanoic acid/gi, "壬酸"], [/octanoic acid/gi, "辛酸"], [/heptanoic acid/gi, "庚酸"], [/hexanoic acid/gi, "己酸"],
  [/pentanoic acid/gi, "戊酸"], [/butanoic acid/gi, "丁酸"], [/propanoic acid/gi, "丙酸"], [/ethanoic acid/gi, "乙酸"], [/acetic acid/gi, "乙酸"],
  [/carboxylic acid/gi, "羧酸"], [/carboxy/gi, "羧基"], [/dihydroxy/gi, "二羟基"], [/hydroxy/gi, "羟基"], [/amino/gi, "氨基"], [/oxo/gi, "氧代"],
  [/dimethyl/gi, "二甲基"], [/methyl/gi, "甲基"], [/ethyl/gi, "乙基"], [/benzyl/gi, "苄基"], [/phenyl/gi, "苯基"],
  [/fluoro/gi, "氟"], [/chloro/gi, "氯"], [/bromo/gi, "溴"], [/iodo/gi, "碘"], [/sulfo/gi, "磺酸基"],
];

const chineseNameFor = (name: string) => {
  if (EXACT_CHINESE_NAMES[name]) return EXACT_CHINESE_NAMES[name];
  const translated = CHINESE_NAME_PARTS.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), name);
  return translated === name ? "中文系统名待人工核对" : translated;
};
const DEEP_REVIEW_META: Record<DeepReviewGrade, { label: string; description: string }> = {
  A: { label: "环肽直接使用", description: "已有直接环肽或宏环结构证据" },
  B: { label: "肽中使用", description: "能够进入肽，但缺少直接环肽证据" },
  C: { label: "特殊构件", description: "仅限末端、战头、连接体或非标准骨架用途" },
  EXCLUDE: { label: "非独立单体", description: "不是可按单个氨基酸理解的独立残基" },
};
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

type CcdCatalogMode = "catalog" | "review";

export default function CcdCatalog({ mode = "catalog", assetPrefix = "" }: { mode?: CcdCatalogMode; assetPrefix?: string }) {
  const [payload, setPayload] = useState<CcdCatalogPayload | null>(null);
  const [usagePayload, setUsagePayload] = useState<PolymerUsagePayload | null>(null);
  const [deepReviewPayload, setDeepReviewPayload] = useState<DeepReviewPayload | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [screeningTier, setScreeningTier] = useState<CcdCoreRecord["screening"]["tier"] | "all">("priority");
  const [usageStatus, setUsageStatus] = useState<PolymerUsageStatus | "all">("short-polymer");
  const [targetProperty, setTargetProperty] = useState<(typeof CCD_PROPERTY_FILTERS)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewGrade, setReviewGrade] = useState<DeepReviewGrade | "all">("all");
  const [reviewSort, setReviewSort] = useState<"evidence" | "ccd" | "name">("evidence");
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    let active = true;
    Promise.all([fetch(`${assetPrefix}ccd-development-screen.json`), fetch(`${assetPrefix}ccd-polymer-usage-audit.json`), fetch(`${assetPrefix}ccd-manual-review-92-final.json`)])
      .then(async ([catalogResponse, usageResponse, reviewResponse]) => {
        if (!catalogResponse.ok || !usageResponse.ok || !reviewResponse.ok) throw new Error("CCD catalog request failed");
        return Promise.all([catalogResponse.json() as Promise<CcdCatalogPayload>, usageResponse.json() as Promise<PolymerUsagePayload>, reviewResponse.json() as Promise<DeepReviewPayload>]);
      })
      .then(([catalogResult, usageResult, reviewResult]) => { if (active) { setPayload(catalogResult); setUsagePayload(usageResult); setDeepReviewPayload(reviewResult); } })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [assetPrefix]);

  useEffect(() => {
    const urlQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    if (!urlQuery) return;
    if (mode === "catalog") { setQuery(urlQuery); setPage(1); }
    if (mode === "review") { setReviewQuery(urlQuery); setReviewPage(1); }
  }, [mode]);

  const usageById = useMemo(() => new Map((usagePayload?.records ?? []).map((record) => [record.id, record])), [usagePayload]);

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
      const usage = usageById.get(record.id);
      const propertyFilter = CCD_PROPERTY_FILTERS.find((item) => item.id === targetProperty)!;
      const chineseName = chineseNameFor(record.name);
      const searchable = [
        record.primaryCcdId,
        ...record.ccdIds,
        record.name,
        chineseName,
        ...record.synonyms,
        record.formula,
        ...record.parentIds,
        record.categoryLabel,
        ...record.tags,
        ...record.predictedEffects,
        ...record.screening.reasons,
        ...record.screening.cautions,
        usage ? USAGE_META[usage.status].label : "",
        ...(usage?.exampleEntryIds ?? []),
      ].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized))
        && (category === "all" || record.category === category)
        && (screeningTier === "all" || record.screening.tier === screeningTier)
        && (usageStatus === "all" || usage?.status === usageStatus)
        && (propertyFilter.keywords.length === 0 || propertyFilter.keywords.some((keyword) => record.predictedEffects.some((effect) => effect.includes(keyword))));
    });
  }, [payload, query, category, screeningTier, usageStatus, targetProperty, usageById]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const changeQuery = (value: string) => { setQuery(value); setPage(1); };
  const changeCategory = (value: string) => { setCategory(value); setPage(1); };
  const changeScreeningTier = (value: CcdCoreRecord["screening"]["tier"] | "all") => { setScreeningTier(value); setPage(1); };
  const changeUsageStatus = (value: PolymerUsageStatus | "all") => { setUsageStatus(value); setPage(1); };
  const changeTargetProperty = (value: (typeof CCD_PROPERTY_FILTERS)[number]["id"]) => { setTargetProperty(value); setPage(1); };

  const filteredDeepReview = useMemo(() => {
    const normalized = reviewQuery.trim().toLowerCase();
    const records = (deepReviewPayload?.records ?? []).filter((record) => {
      const searchable = [record.ccdId, record.name, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, ...record.pdbExamples].join(" ").toLowerCase();
      return (!normalized || searchable.includes(normalized)) && (reviewGrade === "all" || record.grade === reviewGrade);
    });
    const gradeRank: Record<DeepReviewGrade, number> = { A: 0, B: 1, C: 2, EXCLUDE: 3 };
    return [...records].sort((a, b) => reviewSort === "ccd" ? a.ccdId.localeCompare(b.ccdId) : reviewSort === "name" ? a.name.localeCompare(b.name) : gradeRank[a.grade] - gradeRank[b.grade] || a.ccdId.localeCompare(b.ccdId));
  }, [deepReviewPayload, reviewQuery, reviewGrade, reviewSort]);
  const reviewTotalPages = Math.max(1, Math.ceil(filteredDeepReview.length / REVIEW_PAGE_SIZE));
  const safeReviewPage = Math.min(reviewPage, reviewTotalPages);
  const shownDeepReview = filteredDeepReview.slice((safeReviewPage - 1) * REVIEW_PAGE_SIZE, safeReviewPage * REVIEW_PAGE_SIZE);
  const downloadFilteredDeepReview = () => {
    const headers = ["CCD编号", "名称", "用途与身份分组", "结论", "合成/身份", "环肽证据", "口服证据", "研发建议", "PDB示例", "来源"];
    const rows = filteredDeepReview.map((record) => [record.ccdId, record.name, DEEP_REVIEW_META[record.grade].label, record.conclusion, record.synthesisEvidence, record.cyclicEvidence, record.oralEvidence, record.recommendation, record.pdbExamples.join(" / "), record.sources.map((source) => `${source.evidenceType}｜${source.title}｜${source.url}`).join("；")]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `deep-reviewed-ncaa-${filteredDeepReview.length}-records.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className={`ccd-catalog-section ccd-${mode}-page`} id={mode === "catalog" ? "ccd-catalog" : "deep-review"} aria-labelledby={mode === "catalog" ? "ccd-catalog-title" : "deep-review-page-title"}>
      {mode === "catalog" && <>
      <div className="section-heading ccd-heading">
        <div><p className="eyebrow">STRUCTURE-VERIFIED CCD CATALOG</p><h2 id="ccd-catalog-title">CCD结构参考库</h2></div>
        <p>用于扩展化学空间和查找结构线索。1,687条结构已经分档并核对PDB聚合物序列；这里的预测标签不能代替环肽实验或口服证据。</p>
      </div>

      <div className="ccd-catalog-summary">
        <div><strong>{payload?.metadata.tierCounts.priority ?? "—"}</strong><span>优先研发候选</span></div>
        <div><strong>{usagePayload?.metadata.statusCounts["short-polymer"] ?? "—"}</strong><span>具有短肽序列命中</span></div>
        <div><strong>{usagePayload?.metadata.statusCounts["no-polymer-hit"] ?? "—"}</strong><span>优先候选暂无序列命中</span></div>
        <details className="catalog-download-menu"><summary>下载与审计文件</summary><div className="catalog-downloads"><a href={`${assetPrefix}ccd-verified-cores-1687.csv`} download>结构名录 CSV</a><a href={`${assetPrefix}ccd-monomer-usability-screen.csv`} download>单体可用性筛选 CSV</a><a href={`${assetPrefix}ccd-manual-review-1805.csv`} download>人工审核清单</a><a href={`${assetPrefix}catalog-integrity-report.json`} download>完整性校验报告</a><a href={`${assetPrefix}ccd-official-field-audit.json`} download>官方字段审计</a><a href={`${assetPrefix}ccd-development-screen.csv`} download>研发筛选结果</a><a href={`${assetPrefix}ccd-polymer-usage-audit.csv`} download>PDB序列使用审计</a></div></details>
      </div>

      <div className="ccd-boundary-note">
        <strong>如何理解筛选结果</strong>
        <p>这是保守的两层筛选：第一层排除整分子缀合物、辅因子、核苷酸、完整肽、金属复合物和明显保护体；第二层通过RCSB聚合物实体序列查找实际残基使用。短肽命中只说明该CCD进入过不超过50残基的聚合物实体，不能单独证明分子是环肽、单体适合SPPS或具有口服性质。</p>
      </div>

      <div className="ccd-filter-panel">
        <label><span>搜索CCD编号、名称、同义词或分子式</span><input value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="例如：AIB、N-methyl、phenylglycine、C8 H9 N O2" /></label>
        <label><span>研发筛选等级</span><select value={screeningTier} onChange={(event) => changeScreeningTier(event.target.value as CcdCoreRecord["screening"]["tier"] | "all")}><option value="all">全部1,687条</option>{payload && (["priority", "conditional", "reference", "exclude"] as const).map((tier) => <option value={tier} key={tier}>{payload.metadata.tierMeta[tier].label}（{payload.metadata.tierCounts[tier]}）</option>)}</select></label>
        <label><span>PDB聚合物使用证据</span><select value={usageStatus} onChange={(event) => changeUsageStatus(event.target.value as PolymerUsageStatus | "all")}><option value="all">全部使用状态</option>{usagePayload && (["short-polymer", "polymer-only", "no-polymer-hit"] as const).map((status) => <option value={status} key={status}>{USAGE_META[status].label}（{usagePayload.metadata.statusCounts[status]}）</option>)}</select></label>
        <label><span>目标性质</span><select value={targetProperty} onChange={(event) => changeTargetProperty(event.target.value as (typeof CCD_PROPERTY_FILTERS)[number]["id"])}>{CCD_PROPERTY_FILTERS.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        <label><span>结构类别</span><select value={category} onChange={(event) => changeCategory(event.target.value)}><option value="all">全部结构类别</option>{categories.map((item) => <option value={item.id} key={item.id}>{item.label}（{item.count}）</option>)}</select></label>
      </div>
      <p className="ccd-name-note">中文辅助名用于快速阅读，由常见氨基酸母体和系统命名规则生成；涉及复杂杂环或多官能团时仍以英文系统名、立体化学SMILES和CCD记录为准。</p>

      {loadError ? <div className="ccd-loading"><strong>结构名录暂时没有载入</strong><p>可以先下载CSV，或稍后刷新页面重试。</p></div> : !payload ? <div className="ccd-loading">正在载入CCD结构名录…</div> : <>
        <div className="ccd-result-bar"><span>找到 <strong>{filtered.length}</strong> 个结构 · 第 {safePage}/{totalPages} 页</span>{(query || category !== "all" || screeningTier !== "priority" || usageStatus !== "short-polymer" || targetProperty !== "all") && <button onClick={() => { changeQuery(""); changeCategory("all"); changeScreeningTier("priority"); changeUsageStatus("short-polymer"); changeTargetProperty("all"); }}>恢复默认筛选</button>}</div>
        {shown.length ? <div className="ccd-record-grid">{shown.map((record) => <article className="ccd-record-card" key={record.id}>
          <div className="ccd-card-head"><span>CCD {record.ccdIds.join(" / ")}</span><em className={`screening-tier screening-${record.screening.tier}`}>{payload.metadata.tierMeta[record.screening.tier].shortLabel}</em></div>
          <div className="ccd-card-main">
            <a className="ccd-structure" href={record.sourceUrl} target="_blank" rel="noreferrer" aria-label={`打开CCD ${record.primaryCcdId}`}>
              <img src={record.structureImageUrl} alt={`${record.name}二维结构`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
              <b>{record.primaryCcdId}</b>
            </a>
            <div><h3>{chineseNameFor(record.name)}</h3><p className="ccd-english-name">{record.name}</p>{record.synonyms.length > 0 && <p className="ccd-synonyms">{record.synonyms.slice(0, 2).join(" · ")}</p>}<p className="ccd-formula">{record.formula} · {record.formulaWeight?.toFixed(3) ?? "—"} Da</p></div>
          </div>
          <div className="ccd-effect-tags">{record.predictedEffects.map((effect) => <span key={effect}>{effect}</span>)}</div>
          <details className="ccd-details"><summary>结构信息与判断边界</summary><dl>
            <div><dt>研发分档</dt><dd>{payload.metadata.tierMeta[record.screening.tier].label}</dd></div>
            <div><dt>筛选理由</dt><dd>{record.screening.reasons.join("；")}</dd></div>
            {record.screening.cautions.length > 0 && <div><dt>风险提示</dt><dd>{record.screening.cautions.join("；")}</dd></div>}
            {usageById.has(record.id) && <>
              <div><dt>PDB序列证据</dt><dd>{USAGE_META[usageById.get(record.id)!.status].label}</dd></div>
              <div><dt>聚合物命中</dt><dd>全部实体 {usageById.get(record.id)!.polymerEntityCount} 个；≤50残基实体 {usageById.get(record.id)!.shortPolymerEntityCount} 个</dd></div>
              {usageById.get(record.id)!.exampleEntryIds.length > 0 && <div><dt>示例PDB</dt><dd className="pdb-example-links">{usageById.get(record.id)!.exampleEntryIds.map((entryId) => <a href={`https://www.rcsb.org/structure/${entryId}`} target="_blank" rel="noreferrer" key={entryId}>{entryId}</a>)}</dd></div>}
            </>}
            <div><dt>CCD连接类型</dt><dd>{record.linkageTypes.join("；")}</dd></div>
            <div><dt>母体残基</dt><dd>{record.parentIds.join(" / ") || "CCD未指定"}</dd></div>
            <div><dt>结构标签</dt><dd>{record.tags.join("、") || "未自动归类"}</dd></div>
            <div><dt>SMILES</dt><dd className="smiles-value">{record.smiles}</dd></div>
          </dl><p>当前性质说明为结构/类别推断，尚不能代替同骨架替换实验。</p><a href={record.sourceUrl} target="_blank" rel="noreferrer">在RCSB查看原始CCD记录 ↗</a></details>
        </article>)}</div> : <div className="ccd-loading"><strong>没有找到匹配结构</strong><p>可以尝试CCD编号、英文名称或减少筛选条件。</p></div>}
        {filtered.length > PAGE_SIZE && <nav className="pagination ccd-pagination" aria-label="CCD结构名录分页"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1}>上一页</button><div>{compactPages(safePage, totalPages).map((item, index) => item === "ellipsis" ? <span className="page-ellipsis" key={`ellipsis-${index}`}>…</span> : <button className={item === safePage ? "active" : ""} aria-current={item === safePage ? "page" : undefined} onClick={() => setPage(item)} key={item}>{item}</button>)}</div><button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>下一页</button></nav>}
      </>}
      </>}

      {mode === "review" && <>
      <div className="section-heading ccd-heading review-page-heading">
        <div><p className="eyebrow">IDENTITY &amp; PEPTIDE-USE REVIEW</p><h2 id="deep-review-page-title">92条候选深度审核</h2></div>
        <p>这里回答三个问题：它是不是可作为残基理解的化学实体、是否有肽或环肽使用记录，以及证据允许我们说到哪一步。</p>
      </div>
      <div className="manual-review-guide standalone-review">
        <div className="review-guide-content">
          <section className="review-origin-panel" aria-labelledby="review-origin-title">
            <div className="review-origin-intro"><div><p className="eyebrow">HOW THIS DATASET WAS BUILT</p><h3 id="review-origin-title">这92条数据从哪里来？</h3></div><p>它们<strong>不是从1,687条CCD结构参考库中直接选出的子集</strong>，而是来自另一组1,805条补充审核候选。我们先做结构身份和PDB使用核对，再把最值得继续查证的92条送入人工深审。</p></div>
            <div className="review-origin-flow" aria-label="92条深审数据形成过程">
              <article><span>01 · 起点</span><strong>1,805条补充候选</strong><p>汇总待核对的氨基酸样结构、名称命中项和网站已有例外。</p></article><b aria-hidden="true">→</b>
              <article><span>02 · 首轮筛选</span><strong>结构 + PDB使用核对</strong><p>判断能否作为独立残基理解，并排除完整药物、辅因子、肽段等明显非单体。</p></article><b aria-hidden="true">→</b>
              <article><span>03 · 进入深审</span><strong>92条优先候选</strong><p>选择最值得继续查合成、肽中使用和环肽使用证据的条目。</p></article><b aria-hidden="true">→</b>
              <article><span>04 · 人工结论</span><strong>34 / 36 / 14 / 8</strong><p>分别归入环肽直接使用、肽中使用、特殊构件和非独立单体。</p></article>
            </div>
            <div className="review-origin-note"><strong>“92条”代表什么？</strong><p>它是一个<strong>人工审核工作集</strong>，不是“92种可以提高口服性的氨基酸”，也不是1,687条CCD结构库的缩小版。这里的结论只说明残基身份和使用上下文，不能直接证明SPPS、闭环、渗透或口服有效。</p></div>
            <div className="review-outcome-grid">
              <article><strong>34</strong><span>环肽直接使用</span><small>找到环肽或大环体系中的直接使用证据</small></article>
              <article><strong>36</strong><span>肽中使用</span><small>确认进入过肽，但未据此推断口服效果</small></article>
              <article><strong>14</strong><span>特殊构件</span><small>可用于连接、末端修饰等特定情境</small></article>
              <article><strong>8</strong><span>非独立单体</span><small>深审后确认不应作为普通氨基酸单体</small></article>
            </div>
          </section>
          <details className="audit-method-details"><summary>查看技术方法：P0–P3原始队列与首轮筛选规则</summary><div>
          <div className="ccd-boundary-note review-queue-boundary"><strong>首轮审核已经做完</strong><p>先按结构判断是否像独立氨基酸单体，再对结构初筛通过项查询RCSB聚合实体和不超过50残基的短链使用记录。只有存在明确结构性负面理由的条目才排除；证据不足的保留为暂缓，避免误删。结果仍不能直接证明SPPS、闭环、渗透或口服可行。</p></div>
          <p><strong>下面的P0–P3是原始队列的检查顺序，不是“能不能用”的结论：</strong></p>
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
          <div className="review-decision"><strong>1,805条首轮审核结果</strong><span>优先深审 92：最值得继续查合成、环肽和口服证据</span><span>条件候选 286：结构初筛通过，但证据仍不完整</span><span>暂缓 994：没有明确错误，暂时证据不足</span><span>排除 433：存在明确结构性排除理由</span></div>
          </div></details>
          <section className="deep-review-browser" aria-labelledby="deep-review-title">
            <div className="deep-review-heading"><div><strong id="deep-review-title">检索92条人工审核结果</strong><p>按名称、用途或证据等级查找，并展开每条记录查看具体使用限制和原始来源。</p></div><span>找到 {filteredDeepReview.length} 条</span></div>
            <div className="deep-review-filters">
              <label><span>搜索CCD、名称、PDB或审核结论</span><input value={reviewQuery} onChange={(event) => { setReviewQuery(event.target.value); setReviewPage(1); }} placeholder="例如：A1I8R、macrocycle、末端战头" /></label>
              <label><span>用途与身份分组</span><select value={reviewGrade} onChange={(event) => { setReviewGrade(event.target.value as DeepReviewGrade | "all"); setReviewPage(1); }}><option value="all">全部92条</option>{(["A", "B", "C", "EXCLUDE"] as const).map((grade) => <option value={grade} key={grade}>{DEEP_REVIEW_META[grade].label}（{deepReviewPayload?.metadata.gradeCounts[grade] ?? "—"}）</option>)}</select></label>
              <label><span>排序方式</span><select value={reviewSort} onChange={(event) => { setReviewSort(event.target.value as "evidence" | "ccd" | "name"); setReviewPage(1); }}><option value="evidence">按研发优先级</option><option value="ccd">按CCD编号</option><option value="name">按英文名称</option></select></label>
            </div>
            <div className="deep-review-actions"><span>当前筛选结果会保留完整证据说明和来源链接。</span><button onClick={downloadFilteredDeepReview}>导出当前 {filteredDeepReview.length} 条</button></div>
            <div className="deep-review-legend">{(["A", "B", "C", "EXCLUDE"] as const).map((grade) => <span className={`review-grade-${grade.toLowerCase()}`} key={grade}><b>{DEEP_REVIEW_META[grade].label}</b>{DEEP_REVIEW_META[grade].description}</span>)}</div>
            {shownDeepReview.length ? <div className="deep-review-grid">{shownDeepReview.map((record) => <article key={record.ccdId}>
              <div className="deep-review-card-head"><span>CCD {record.ccdId}</span><b className={`review-grade-${record.grade.toLowerCase()}`}>{DEEP_REVIEW_META[record.grade].label}</b></div>
              <h3>{record.name}</h3><p className="deep-review-conclusion">{record.conclusion}</p>
              <details><summary>查看证据与使用限制</summary><dl><div><dt>合成/身份</dt><dd>{record.synthesisEvidence}</dd></div><div><dt>环肽证据</dt><dd>{record.cyclicEvidence}</dd></div><div><dt>口服证据</dt><dd>{record.oralEvidence}</dd></div><div><dt>研发建议</dt><dd>{record.recommendation}</dd></div>{record.pdbExamples.length > 0 && <div><dt>PDB示例</dt><dd>{record.pdbExamples.map((entryId) => <a href={`https://www.rcsb.org/structure/${entryId}`} target="_blank" rel="noreferrer" key={entryId}>{entryId}</a>)}</dd></div>}</dl><div className="deep-review-sources">{record.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={`${record.ccdId}-${source.url}`}>{source.evidenceType}：{source.title} ↗</a>)}</div></details>
            </article>)}</div> : <div className="ccd-loading"><strong>没有符合条件的深审记录</strong><p>可以减少关键词或恢复全部分组。</p></div>}
            {filteredDeepReview.length > REVIEW_PAGE_SIZE && <nav className="pagination ccd-pagination" aria-label="92条深审结果分页"><button onClick={() => setReviewPage((current) => Math.max(1, current - 1))} disabled={safeReviewPage === 1}>上一页</button><div>{compactPages(safeReviewPage, reviewTotalPages).map((item, index) => item === "ellipsis" ? <span className="page-ellipsis" key={`review-ellipsis-${index}`}>…</span> : <button className={item === safeReviewPage ? "active" : ""} aria-current={item === safeReviewPage ? "page" : undefined} onClick={() => setReviewPage(item)} key={item}>{item}</button>)}</div><button onClick={() => setReviewPage((current) => Math.min(reviewTotalPages, current + 1))} disabled={safeReviewPage === reviewTotalPages}>下一页</button></nav>}
          </section>
          <details className="review-download-menu"><summary>下载深审与审核数据文件</summary><div><a className="review-download" href={`${assetPrefix}ccd-manual-review-92-final.csv`} download>92条最终深审汇总</a><a className="review-download" href={`${assetPrefix}ccd-manual-review-batch-1.csv`} download>第一批20条</a><a className="review-download" href={`${assetPrefix}ccd-manual-review-batch-2.csv`} download>第二批36条</a><a className="review-download" href={`${assetPrefix}ccd-manual-review-batch-3.csv`} download>第三批36条</a><a className="review-download" href={`${assetPrefix}ccd-manual-review-final.csv`} download>1,805条审核结果</a><a className="review-download" href={`${assetPrefix}ccd-manual-review-1805.csv`} download>原始审核队列</a></div></details>
        </div>
      </div>
      </>}
    </section>
  );
}
