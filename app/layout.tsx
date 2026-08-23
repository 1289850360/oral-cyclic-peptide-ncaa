import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "口服环肽非天然氨基酸证据库",
  description: "按作用与证据整理适用于口服环肽研发的非天然氨基酸，并链接代表性原始研究论文。",
  openGraph: {
    title: "口服环肽非天然氨基酸证据库",
    description: "结构改造、性质作用与原始论文依据。",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "口服环肽非天然氨基酸证据库" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "口服环肽非天然氨基酸证据库",
    description: "结构改造、性质作用与原始论文依据。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
