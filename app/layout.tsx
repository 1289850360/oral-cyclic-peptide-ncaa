import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://1289850360.github.io/oral-cyclic-peptide-ncaa/"),
  title: "口服环肽非天然氨基酸证据库",
  description: "面向口服环肽研发的非天然残基证据数据库，支持按性质、类别与证据等级检索、比较并追溯原始论文和专利。",
  openGraph: {
    title: "口服环肽非天然氨基酸证据库",
    description: "可检索、可比较、证据分级明确的口服环肽非天然残基数据库。",
    type: "website",
    images: [{ url: "https://1289850360.github.io/oral-cyclic-peptide-ncaa/og.png", width: 1200, height: 630, alt: "口服环肽非天然氨基酸证据库" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "口服环肽非天然氨基酸证据库",
    description: "可检索、可比较、证据分级明确的口服环肽非天然残基数据库。",
    images: ["https://1289850360.github.io/oral-cyclic-peptide-ncaa/og.png"],
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
