import CcdCatalog from "../ccd-catalog";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

export default function CatalogPage() {
  return <main><SiteHeader active="catalog" /><CcdCatalog mode="catalog" assetPrefix="../" /><SiteFooter /></main>;
}
