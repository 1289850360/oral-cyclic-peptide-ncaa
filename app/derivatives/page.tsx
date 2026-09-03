import DerivativeCatalog from "../derivative-catalog";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

export default function DerivativesPage() {
  return <main><SiteHeader active="derivatives" /><DerivativeCatalog /><SiteFooter /></main>;
}
