import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const sizeArg = process.argv.find((item) => item.startsWith("--size="));
const batchSize = sizeArg ? Math.max(1, Number(sizeArg.split("=")[1])) : 50;

const pnpmFolder = join(root, "node_modules/.pnpm");
const esbuildPackage = readdirSync(pnpmFolder)
  .filter((name) => name.startsWith("esbuild@"))
  .sort()
  .at(-1);
if (!esbuildPackage) throw new Error("Cannot locate the installed esbuild package");

const esbuild = require(join(pnpmFolder, esbuildPackage, "node_modules/esbuild/lib/main.js"));
const temporaryBundle = join(root, "scripts/.tmp-natural-parent-evidence-selection.cjs");
esbuild.buildSync({
  entryPoints: [join(root, "app/natural-parent-modifications.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: temporaryBundle,
});
const { naturalParentModificationByCcd } = require(temporaryBundle);
rmSync(temporaryBundle);

const loadRecords = (name) => JSON.parse(readFileSync(join(root, "public", name), "utf8")).records;
const catalog = loadRecords("ccd-unified-structure-catalog.json");
const usage = loadRecords("ccd-unified-polymer-usage.json");
const candidates = loadRecords("natural-parent-literature-candidate-audit.json");
const substitutability = loadRecords("natural-parent-substitutability-audit.json");
const byId = (records, field) => new Map(records.map((record) => [record[field], record]));
const catalogByCcd = byId(catalog, "primaryCcdId");
const usageByCcd = byId(usage, "primaryCcdId");
const candidateByCcd = byId(candidates, "ccdId");
const substitutabilityByCcd = byId(substitutability, "ccdId");
const reviewedCcdIds = new Set();
for (const fileName of readdirSync(join(root, "public"))) {
  if (!/^natural-parent-evidence-review-batch-\d+-results\.json$/.test(fileName)) continue;
  const review = JSON.parse(readFileSync(join(root, "public", fileName), "utf8"));
  for (const item of [...(review.accepted ?? []), ...(review.notUpgraded ?? [])]) {
    if (item.ccdId) reviewedCcdIds.add(String(item.ccdId).toUpperCase());
  }
}

const categoryWeight = {
  "direct-substitutable-residue": 30,
  "conditional-specialized-residue": 18,
  "complex-skeletal-transformation": 6,
  "backbone-terminally-modified": 3,
  "special-adduct-or-label": 0,
};

const scored = Object.entries(naturalParentModificationByCcd)
  .filter(([ccdId, record]) => record.propertyReview?.status === "结构规则建议" && !reviewedCcdIds.has(ccdId.toUpperCase()))
  .map(([ccdId, record]) => {
    const component = catalogByCcd.get(ccdId);
    const use = usageByCcd.get(ccdId);
    const search = candidateByCcd.get(ccdId);
    const substitution = substitutabilityByCcd.get(ccdId);
    const shortPolymerEntityCount = Number(use?.shortPolymerEntityCount ?? 0);
    const polymerEntityCount = Number(use?.polymerEntityCount ?? 0);
    const candidatePapers = search?.candidates ?? [];
    const topCandidateScore = Math.max(0, ...candidatePapers.map((paper) => Number(paper.score ?? 0)));
    const score =
      (categoryWeight[substitution?.category] ?? 0) +
      Math.min(35, Math.log2(shortPolymerEntityCount + 1) * 5) +
      Math.min(15, Math.log2(polymerEntityCount + 1) * 2) +
      Math.min(20, topCandidateScore) +
      (candidatePapers.length ? 8 : 0);
    return {
      ccdId,
      name: component?.name ?? "",
      synonyms: component?.synonyms ?? [],
      naturalParentCcd: record.naturalParentCcd,
      substitutability: substitution?.category ?? "unknown",
      polymerEntityCount,
      shortPolymerEntityCount,
      candidatePapers,
      priorityScore: Number(score.toFixed(2)),
      reviewDecision: "pending-manual-verification",
      reviewNote: "",
    };
  })
  .sort((a, b) => b.priorityScore - a.priorityScore || b.shortPolymerEntityCount - a.shortPolymerEntityCount || a.ccdId.localeCompare(b.ccdId));

const selected = scored.slice(0, batchSize);
const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    batchSize,
    remainingStructureRuleCount: scored.length,
    excludedPreviouslyReviewedCount: reviewedCcdIds.size,
    method: "Current structure-only records not present in an earlier review result, ranked by substitutability, PDB short-polymer use, total PDB polymer use, and exact-name Europe PMC candidate score. Ranking only; every source still requires manual verification.",
  },
  records: selected,
};
const outputPath = join(root, "public", `natural-parent-evidence-review-batch-${batchSize}.json`);
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, ...output.metadata, first: selected.slice(0, 10).map(({ ccdId, name, priorityScore }) => ({ ccdId, name, priorityScore })) }, null, 2));
