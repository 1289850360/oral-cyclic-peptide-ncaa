"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ReviewPage() {
  useEffect(() => { window.location.replace("../#database"); }, []);
  return <main className="legacy-review-redirect"><strong>深度审核数据已经并入研发证据库</strong><p>正在转到统一数据库……</p><Link href="/#database">立即打开研发证据库 →</Link></main>;
}
