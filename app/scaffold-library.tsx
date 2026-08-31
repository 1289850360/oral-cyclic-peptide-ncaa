"use client";

import { useEffect, useMemo, useState } from "react";
import scaffoldJson from "../public/cyclic-scaffold-evidence.json";

type ScaffoldRecord = (typeof scaffoldJson.records)[number];
const typeMeta: Record<string, string> = { "oral-pk": "动物口服药代", "matched-scaffold-series": "同骨架比较", "clinical-reference": "临床口服参照", "scaffold-series": "骨架系列" };

export default function ScaffoldLibrary() {
  const records = scaffoldJson.records as ScaffoldRecord[];
  const [query, setQuery] = useState("");
  const [studyType, setStudyType] = useState("all");
  const [endpointType, setEndpointType] = useState("all");
  useEffect(() => { setQuery(new URLSearchParams(window.location.search).get("q") ?? ""); }, []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const text = [record.name, record.sequence, record.topology, record.conclusion, record.attributionBoundary, ...record.residues.flatMap((item) => [item.name, item.ccdId ?? ""]), ...record.endpoints.flatMap((item) => [item.assay, item.unit, item.context])].join(" ").toLowerCase();
      const endpointMatch = endpointType === "all" || record.endpoints.some((item) => endpointType === "oral" ? item.assay.includes("口服") : endpointType === "permeability" ? /(Papp|PAMPA|Caco)/i.test(`${item.assay} ${item.unit}`) : /(稳定|微粒体)/.test(`${item.assay} ${item.unit}`));
      return (!needle || text.includes(needle)) && (studyType === "all" || record.studyType === studyType) && endpointMatch;
    });
  }, [records, query, studyType, endpointType]);

  return <section className="scaffold-library">
    <header className="scaffold-hero"><div><p className="eyebrow">EXPERIMENT-LEVEL CYCLIC PEPTIDE EVIDENCE</p><h1>环肽实验<br /><em>骨架库</em></h1></div><p>这里按完整环肽实验编目，而不是按单个残基推断。每条记录保留序列、环化方式、检测指标、数值和归因边界。</p></header>
    <div className="scaffold-summary"><article><strong>{records.length}</strong><span>首批实验骨架记录</span></article><article><strong>{records.filter((item) => item.studyType === "matched-scaffold-series").length}</strong><span>同骨架比较</span></article><article><strong>{records.filter((item) => item.endpoints.some((endpoint) => endpoint.assay.includes("口服"))).length}</strong><span>含口服药代指标</span></article><article><strong>{new Set(records.flatMap((item) => item.sources.map((source) => source.url))).size}</strong><span>唯一原始来源</span></article></div>
    <aside className="scaffold-boundary"><strong>如何使用这些数据</strong><p>同骨架单点比较适合判断残基的局部影响；动物或人体口服数据只说明完整骨架成功，不能拆分为单个残基的口服贡献。不同实验体系的Papp数值不可直接横向排序。</p></aside>
    <div className="scaffold-filters"><label><span>搜索骨架、序列、残基或CCD</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：N-Me-Leu、D8.31、RRCK、MLE" /></label><label><span>研究类型</span><select value={studyType} onChange={(event) => setStudyType(event.target.value)}><option value="all">全部研究类型</option>{Object.entries(typeMeta).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label><span>实验终点</span><select value={endpointType} onChange={(event) => setEndpointType(event.target.value)}><option value="all">全部实验终点</option><option value="oral">口服药代</option><option value="permeability">渗透性</option><option value="stability">稳定性</option></select></label></div>
    <div className="scaffold-result-bar">找到 <strong>{filtered.length}</strong> 条骨架记录 <a href="../cyclic-scaffold-evidence.csv" download>下载CSV</a></div>
    <div className="scaffold-grid">{filtered.map((record) => <article className="scaffold-card" key={record.id}>
      <header><span>{typeMeta[record.studyType] ?? record.studyType}</span><b>{record.evidenceLevel}</b></header>
      <h2>{record.name}</h2><p className="scaffold-sequence">{record.sequence}</p>
      <dl className="scaffold-identity"><div><dt>环化方式</dt><dd>{record.topology}</dd></div><div><dt>环大小</dt><dd>{record.ringSize ? `${record.ringSize}个构件` : "来源未给出统一环大小"}</dd></div></dl>
      <div className="scaffold-residues">{record.residues.map((item) => <span key={`${record.id}-${item.name}`}>{item.name}{item.ccdId ? ` · CCD ${item.ccdId}` : ""}</span>)}</div>
      <div className="scaffold-endpoints">{record.endpoints.map((item) => <div key={`${item.assay}-${item.unit}`}><span>{item.assay}</span><strong>{item.value ?? "—"} {item.unit}</strong><small>{item.context}</small></div>)}</div>
      <p className="scaffold-conclusion">{record.conclusion}</p><p className="scaffold-attribution"><b>归因边界</b>{record.attributionBoundary}</p>
      <footer>{record.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.year} · {source.type}</span>{source.citation} ↗</a>)}</footer>
    </article>)}</div>
  </section>;
}
