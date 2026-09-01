import NcaaCatalog from "../ncaa-catalog";
import SiteFooter from "../site-footer";
import SiteHeader from "../site-header";

export default function NcaaPage() {
  return <main><SiteHeader active="ncaa" /><NcaaCatalog assetPrefix="../" /><SiteFooter /></main>;
}
