"use client";

import Link from "next/link";

type HeaderSection = "home" | "catalog" | "evidence" | "about";

export default function SiteHeader({ active, onDownload }: { active: HeaderSection; onDownload?: () => void }) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="返回数据库首页"><span className="brand-mark">CP</span><span>口服环肽残基证据库</span></Link>
      <nav className="main-nav" aria-label="数据库导航">
        <Link className={active === "home" ? "active" : ""} href="/">首页概览</Link>
        <Link className={active === "catalog" ? "active" : ""} href="/catalog/">CCD结构库</Link>
        <Link className={active === "evidence" ? "active" : ""} href="/#database">研发证据库</Link>
        <Link className={active === "about" ? "active" : ""} href="/quality/">版本与质量</Link>
      </nav>
      {onDownload ? <button className="download-button" onClick={onDownload}>导出证据 CSV</button> : <Link className="download-button header-action-link" href="/">返回首页</Link>}
    </header>
  );
}
