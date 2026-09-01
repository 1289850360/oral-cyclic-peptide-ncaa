"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ReviewPage() {
  useEffect(() => { window.location.replace("../quality/"); }, []);
  return <main className="legacy-review-redirect"><strong>旧深度审核页面已经停用</strong><p>身份审核资料已归入CCD结构库的质量与审计文件，正在跳转……</p><Link href="/quality/">查看数据质量与审计文件 →</Link></main>;
}
