import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const [catalog, usage] = await Promise.all(["ccd-unified-structure-catalog.json", "ccd-unified-polymer-usage.json"].map(async (name) => JSON.parse(await readFile(join(publicDir, name), "utf8"))));
const targetRecords = catalog.records.filter((record) => record.componentClass.id === "pdb-peptide-occurrence");
const usageById = new Map(usage.records.map((record) => [record.id, record]));
const entryIds = [...new Set(targetRecords.flatMap((record) => usageById.get(record.id)?.exampleEntryIds ?? []))];
const titleByEntry = new Map();
let cursor = 0;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchTitle(entryId) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${entryId}`);
    if (response.ok) return (await response.json()).struct?.title ?? "Title unavailable";
    if (attempt < 3) await delay(attempt * 350);
  }
  return "Title fetch failed";
}
async function worker() {
  while (cursor < entryIds.length) {
    const index = cursor++;
    const id = entryIds[index];
    titleByEntry.set(id, await fetchTitle(id));
    if ((index + 1) % 50 === 0) console.log(`Fetched ${index + 1}/${entryIds.length} PDB titles`);
  }
}
await Promise.all(Array.from({ length: Math.min(12, entryIds.length) }, () => worker()));

const cyclicPattern = /cyclic|macrocycl|cyclopept|cyclospor|actinomycin|echinomycin|triostin|thiostrepton|argadin|argifin|gramicidin s|tyrocidine|contryphan|cyclotide|kalata|lantibiotic|thiopeptide|depsipeptide/i;
const constrainedPattern = /stapled|disulfide|conotoxin|knottin|beta[- ]hairpin|β[- ]hairpin|bridged|cross[- ]link/i;
const linearPattern = /\blinear\b|gramicidin d|alamethicin|zervamicin|peptaibol|collagen triple helix/i;
const statusMeta = {
  "cyclic-title-clue": "代表PDB标题含直接环肽／宏环线索",
  "mixed-title-context": "代表PDB同时出现环肽与非环肽情境",
  "constrained-peptide-clue": "代表PDB含二硫键、订书或其他约束肽线索",
  "linear-title-clue": "代表PDB标题仅见明确线性肽线索",
  "context-unresolved": "仅凭代表PDB标题无法判定环化情境",
};
const records = targetRecords.map((record) => {
  const pdbUsage = usageById.get(record.id);
  const examples = (pdbUsage?.exampleEntryIds ?? []).map((entryId) => ({ entryId, title: titleByEntry.get(entryId) ?? "Title unavailable", url: `https://www.rcsb.org/structure/${entryId}` }));
  const hasCyclic = examples.some((item) => cyclicPattern.test(item.title));
  const hasConstrained = examples.some((item) => constrainedPattern.test(item.title));
  const hasLinear = examples.some((item) => linearPattern.test(item.title));
  const status = hasCyclic && (hasConstrained || hasLinear) ? "mixed-title-context" : hasCyclic ? "cyclic-title-clue" : hasConstrained ? "constrained-peptide-clue" : hasLinear ? "linear-title-clue" : "context-unresolved";
  return { id: record.id, ccdId: record.primaryCcdId, name: record.name, status, statusLabel: statusMeta[status], examples, auditMethod: "Rule-based screening of titles for up to five representative PDB entries returned by the existing RCSB polymer-entity audit.", reviewBoundary: "A title clue is a prioritization aid, not manual confirmation of ring topology, independent monomer synthesis, permeability, or oral exposure.", auditedAt: "2026-08-31" };
});
const statusCounts = Object.fromEntries(Object.keys(statusMeta).map((status) => [status, records.filter((record) => record.status === status).length]));
const payload = { metadata: { source: "RCSB PDB Data API", sourceUrl: "https://data.rcsb.org/", auditedAt: "2026-08-31", count: records.length, representativeEntryCount: entryIds.length, statusMeta, statusCounts, scope: "Automated representative-title context audit for records previously classified as PDB peptide occurrence. Results remain machine-screened until source-level manual review." }, records };
const fields = ["ccdId", "name", "status", "statusLabel", "examplePdb", "exampleTitles", "auditMethod", "reviewBoundary"];
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const rows = records.map((record) => ({ ...record, examplePdb: record.examples.map((item) => item.entryId).join(" / "), exampleTitles: record.examples.map((item) => `${item.entryId}: ${item.title}`).join("；") }));
const csv = [fields, ...rows.map((record) => fields.map((field) => record[field]))].map((row) => row.map(escape).join(",")).join("\n");
await Promise.all([writeFile(join(publicDir, "ccd-pdb-context-audit.json"), `${JSON.stringify(payload)}\n`, "utf8"), writeFile(join(publicDir, "ccd-pdb-context-audit.csv"), `\uFEFF${csv}\n`, "utf8")]);
console.log(JSON.stringify(payload.metadata, null, 2));
