"use client";

import Link from "next/link";

type HeaderSection = "home" | "catalog" | "ncaa" | "evidence" | "about";

export default function SiteHeader({ active, onDownload, onNavigate }: { active: HeaderSection; onDownload?: () => void; onNavigate?: (section: "home" | "evidence") => void }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="返回数据库首页"><span className="brand-mark">CP</span><span>口服环肽残基证据库</span></Link>
      <nav className="main-nav" aria-label="数据库导航">
        <Link className={active === "home" ? "active" : ""} href="/" onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate("home"); } }}>首页概览</Link>
        <Link className={active === "catalog" ? "active" : ""} href="/catalog/">CCD结构库</Link>
        <Link className={active === "ncaa" ? "active" : ""} href="/ncaa/">非天然氨基酸库</Link>
        <Link className={active === "evidence" ? "active" : ""} href="/#database" onClick={(event) => { if (onNavigate) { event.preventDefault(); onNavigate("evidence"); } }}>研发证据库</Link>
        <Link className={active === "about" ? "active" : ""} href="/quality/">版本与质量</Link>
      </nav>
      {onDownload ? <button className="download-button" onClick={onDownload}>导出证据 CSV</button> : <Link className="download-button header-action-link" href="/">返回首页</Link>}
    </header>
  );
}
