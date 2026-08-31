import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");
const catalogPath = path.join(publicDir, "ccd-unified-structure-catalog.json");
const existingUsagePath = path.join(publicDir, "ccd-unified-polymer-usage.json");
const outputJsonPath = path.join(publicDir, "ccd-polymer-usage-audit.json");
const outputCsvPath = path.join(publicDir, "ccd-polymer-usage-audit.csv");
const searchEndpoint = "https://search.rcsb.org/rcsbsearch/v2/query";
const MAX_SHORT_POLYMER_LENGTH = 50;
const CONCURRENCY = 8;

const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const existingUsage = JSON.parse(await readFile(existingUsagePath, "utf8"));
const candidates = catalog.records;

const componentNode = (ccdIds) => ccdIds.length === 1
  ? {
      type: "terminal",
      service: "text",
      parameters: {
        attribute: "rcsb_polymer_entity_container_identifiers.chem_comp_monomers",
        operator: "exact_match",
        value: ccdIds[0],
      },
    }
  : {
      type: "group",
      logical_operator: "or",
      nodes: ccdIds.map((ccdId) => componentNode([ccdId])),
    };

const makeRequest = (ccdIds, shortOnly) => ({
  query: shortOnly
    ? {
        type: "group",
        logical_operator: "and",
        nodes: [
          componentNode(ccdIds),
          {
            type: "terminal",
            service: "text",
            parameters: {
              attribute: "entity_poly.rcsb_sample_sequence_length",
              operator: "less_or_equal",
              value: MAX_SHORT_POLYMER_LENGTH,
            },
          },
        ],
      }
    : componentNode(ccdIds),
  request_options: {
    paginate: { start: 0, rows: 5 },
    results_content_type: ["experimental"],
  },
  return_type: "polymer_entity",
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function queryRcsb(ccdIds, shortOnly) {
  const body = makeRequest(ccdIds, shortOnly);
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(searchEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.status === 204) return { count: 0, examples: [] };
    if (response.ok) {
      const result = await response.json();
      return {
        count: result.total_count ?? 0,
        examples: (result.result_set ?? []).map((item) => item.identifier),
      };
    }
    const message = await response.text();
    if (attempt === 5 || (response.status < 500 && response.status !== 429)) {
      throw new Error(`RCSB search failed for ${ccdIds.join("/")} (${response.status}): ${message.slice(0, 300)}`);
    }
    await delay((response.status === 429 ? 1500 : 500) * attempt);
  }
  throw new Error(`RCSB search failed for ${ccdIds.join("/")}`);
}

async function auditCandidate(record) {
  const [allPolymer, shortPolymer] = await Promise.all([
    queryRcsb(record.ccdIds, false),
    queryRcsb(record.ccdIds, true),
  ]);
  const status = shortPolymer.count > 0 ? "short-polymer" : allPolymer.count > 0 ? "polymer-only" : "no-polymer-hit";
  const exampleEntityIds = shortPolymer.examples.length > 0 ? shortPolymer.examples : allPolymer.examples;
  return {
    id: record.id,
    ccdIds: record.ccdIds,
    primaryCcdId: record.primaryCcdId,
    name: record.name,
    status,
    polymerEntityCount: allPolymer.count,
    shortPolymerEntityCount: shortPolymer.count,
    shortPolymerMaxLength: MAX_SHORT_POLYMER_LENGTH,
    exampleEntityIds,
    exampleEntryIds: [...new Set(exampleEntityIds.map((identifier) => identifier.split("_")[0]))],
    searchBasis: "RCSB polymer entity chem_comp_monomers; short-polymer adds entity_poly.rcsb_sample_sequence_length <= 50.",
  };
}

const resultsById = new Map(existingUsage.records.map((record) => [record.id, record]));
const pendingCandidates = candidates.filter((record) => !resultsById.has(record.id));
let cursor = 0;
async function worker() {
  while (cursor < pendingCandidates.length) {
    const index = cursor;
    cursor += 1;
    const result = await auditCandidate(pendingCandidates[index]);
    resultsById.set(result.id, result);
    if ((index + 1) % 25 === 0 || index + 1 === pendingCandidates.length) {
      console.log(`Audited ${index + 1}/${pendingCandidates.length} remaining records (${resultsById.size}/${candidates.length} total)`);
    }
  }
}
console.log(`Reusing ${resultsById.size} completed records; querying ${pendingCandidates.length} remaining records.`);
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pendingCandidates.length) }, () => worker()));

const results = candidates.map((record) => ({ ...record, ...resultsById.get(record.id) }));
if (results.some((record) => !record)) throw new Error("Polymer usage audit ended with missing records");

const statusCounts = Object.fromEntries(["short-polymer", "polymer-only", "no-polymer-hit"].map((status) => [status, results.filter((record) => record.status === status).length]));
const output = {
  metadata: {
    auditDate: new Date().toISOString().slice(0, 10),
    source: "RCSB PDB Search API",
    sourceUrl: "https://search.rcsb.org/",
    candidateTier: "all unified catalog records",
    candidateCount: candidates.length,
    shortPolymerMaxLength: MAX_SHORT_POLYMER_LENGTH,
    statusCounts,
    scope: "Complete PDB polymer-sequence occurrence audit for the unified CCD catalog. A short polymer hit does not prove cyclicity, synthetic accessibility, permeability improvement, or oral exposure.",
  },
  records: results,
};

const quoteCsv = (value) => {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const statusLabels = {
  "short-polymer": "短肽聚合物命中",
  "polymer-only": "仅较长聚合物命中",
  "no-polymer-hit": "暂无聚合物命中",
};
const headers = ["使用证据状态", "CCD编号", "名称", "聚合物实体数", "≤50残基短肽实体数", "示例PDB", "查询依据"];
const csvRows = results.map((record) => [
  statusLabels[record.status],
  record.ccdIds.join(" / "),
  record.name,
  record.polymerEntityCount,
  record.shortPolymerEntityCount,
  record.exampleEntryIds.join(" / "),
  record.searchBasis,
]);

await writeFile(outputJsonPath, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(outputCsvPath, `${[headers, ...csvRows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify({ candidateCount: candidates.length, statusCounts, outputJsonPath, outputCsvPath }, null, 2));
