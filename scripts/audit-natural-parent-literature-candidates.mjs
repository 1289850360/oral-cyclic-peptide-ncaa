import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const outputPath = join(root, "public/natural-parent-literature-candidate-audit.json");
const limitArg = process.argv.find((item) => item.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Number.POSITIVE_INFINITY;
const concurrencyArg = process.argv.find((item) => item.startsWith("--concurrency="));
const concurrency = concurrencyArg ? Math.max(1, Number(concurrencyArg.split("=")[1])) : 8;

const pnpmFolder = join(root, "node_modules/.pnpm");
const esbuildPackage = readdirSync(pnpmFolder)
  .filter((name) => name.startsWith("esbuild@"))
  .sort()
  .at(-1);
if (!esbuildPackage) throw new Error("Cannot locate the installed esbuild package");
const esbuild = require(join(pnpmFolder, esbuildPackage, "node_modules/esbuild/lib/main.js"));
const temporaryBundle = join(root, "scripts/.tmp-natural-parent-literature-audit.cjs");
esbuild.buildSync({
  entryPoints: [join(root, "app/natural-parent-modifications.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: temporaryBundle,
});
const { naturalParentModificationByCcd } = require(temporaryBundle);
rmSync(temporaryBundle);

const catalog = JSON.parse(readFileSync(join(root, "public/ccd-unified-structure-catalog.json"), "utf8")).records;
const catalogByCcd = new Map(catalog.map((record) => [record.primaryCcdId, record]));
const previous = existsSync(outputPath)
  ? JSON.parse(readFileSync(outputPath, "utf8"))
  : { records: [] };
const previousByCcd = new Map((previous.records ?? []).map((record) => [record.ccdId, record]));

const propertyPattern = /permeab|solub|stabil|half-life|proteol|serum|plasma|oral|bioavail|conformat|helic|fold|rigid|activity|poten|affinit|binding|inhibit|selectiv|uptake|membrane|cell/i;
const comparisonPattern = /substitut|replac|analogu|analog|variant|mutant|versus|\bvs\.?\b|compared|comparison|incorporat|contain|modified/i;
const peptidePattern = /peptid|protein|macrocycl|cyclopept|oligomer|foldamer/i;

const cleanTerm = (value) => String(value ?? "")
  .replace(/^[\s"']+|[\s"']+$/g, "")
  .replace(/\s+/g, " ");

function recordName(record, component) {
  const ccdSource = record.sources?.find((source) => source.title.startsWith(`RCSB CCD ${component.primaryCcdId}`));
  return cleanTerm(component.name || ccdSource?.title.split(" · ").slice(1).join(" · "));
}

function buildTerms(record, component) {
  const values = [
    ...(component.synonyms ?? []),
    recordName(record, component),
  ]
    .map(cleanTerm)
    .filter((term) => term.length >= 4 && term.length <= 140)
    .filter((term) => !/^\(?\d+[RSEZ~]/.test(term) || term.length <= 80);
  return [...new Set(values)].slice(0, 4);
}

function scoreCandidate(result, terms) {
  const title = result.title ?? "";
  const abstract = result.abstractText ?? "";
  const text = `${title} ${abstract}`;
  let score = 0;
  for (const term of terms) {
    if (title.toLowerCase().includes(term.toLowerCase())) score += 8;
    else if (abstract.toLowerCase().includes(term.toLowerCase())) score += 4;
  }
  if (propertyPattern.test(text)) score += 4;
  if (comparisonPattern.test(text)) score += 3;
  if (peptidePattern.test(text)) score += 2;
  if (/review|editorial|comment/i.test(result.pubTypeList?.pubType?.join(" ") ?? "")) score -= 3;
  return score;
}

function candidateUrl(result) {
  if (result.pmcid) return `https://pmc.ncbi.nlm.nih.gov/articles/${result.pmcid}/`;
  if (result.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`;
  if (result.doi) return `https://doi.org/${result.doi}`;
  return result.id ? `https://europepmc.org/article/${result.source}/${result.id}` : "";
}

async function queryEuropePmc(terms) {
  if (!terms.length) return [];
  const phraseQuery = terms.map((term) => `\"${term.replaceAll('"', '')}\"`).join(" OR ");
  const query = `(${phraseQuery}) AND (peptide OR protein OR peptidomimetic)`;
  const url = new URL("https://www.ebi.ac.uk/europepmc/webservices/rest/search");
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("resultType", "core");
  url.searchParams.set("pageSize", "10");
  const response = await fetch(url, { headers: { "user-agent": "ncaa-evidence-audit/1.0" } });
  if (!response.ok) throw new Error(`Europe PMC ${response.status}`);
  const payload = await response.json();
  return (payload.resultList?.result ?? [])
    .map((result) => ({
      title: result.title ?? "",
      authors: result.authorString ?? "",
      journal: result.journalTitle ?? "",
      year: result.pubYear ?? "",
      pmid: result.pmid ?? "",
      pmcid: result.pmcid ?? "",
      doi: result.doi ?? "",
      url: candidateUrl(result),
      abstract: result.abstractText ?? "",
      score: scoreCandidate(result, terms),
    }))
    .filter((result) => result.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

const pending = Object.entries(naturalParentModificationByCcd)
  .filter(([, record]) => record.propertyReview?.status === "结构规则建议")
  .map(([ccdId, record]) => ({ ccdId, record, component: catalogByCcd.get(ccdId) }))
  .filter((item) => item.component)
  .slice(0, limit);

let cursor = 0;
let completed = 0;
const results = new Map(previousByCcd);

async function worker() {
  while (cursor < pending.length) {
    const index = cursor++;
    const { ccdId, record, component } = pending[index];
    const terms = buildTerms(record, component);
    let candidates = [];
    let error = "";
    try {
      candidates = await queryEuropePmc(terms);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }
    results.set(ccdId, {
      ccdId,
      name: recordName(record, component),
      naturalParentCcd: record.naturalParentCcd,
      searchTerms: terms,
      status: error ? "search-error" : candidates.length ? "candidate-found" : "no-candidate-from-europe-pmc",
      candidates,
      error,
      searchedAt: new Date().toISOString(),
    });
    completed += 1;
    if (completed % 25 === 0 || completed === pending.length) {
      process.stdout.write(`\rEurope PMC: ${completed}/${pending.length}`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => worker()));
process.stdout.write("\n");

const records = [...results.values()].sort((a, b) => a.ccdId.localeCompare(b.ccdId));
const summary = {
  generatedAt: new Date().toISOString(),
  method: "Exact CCD name and synonym search in Europe PMC; candidate discovery only, followed by manual full-text verification before website inclusion.",
  totalStructureRuleRecords: pending.length,
  searchedRecords: records.filter((record) => record.searchedAt).length,
  candidateRecords: records.filter((record) => record.candidates?.length).length,
  candidatePapers: records.reduce((sum, record) => sum + (record.candidates?.length ?? 0), 0),
  searchErrors: records.filter((record) => record.error).length,
};
writeFileSync(outputPath, `${JSON.stringify({ summary, records }, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
