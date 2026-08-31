import type { Metadata } from "next";
import ScaffoldLibrary from "../scaffold-library";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

export const metadata: Metadata = { title: "环肽实验骨架库｜口服环肽残基证据库", description: "按完整环肽骨架整理渗透性、稳定性和口服药代实验，并明确残基归因边界。" };
export default function ScaffoldsPage() { return <main><SiteHeader active="scaffolds" /><ScaffoldLibrary /><SiteFooter /></main>; }
