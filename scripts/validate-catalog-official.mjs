import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const cacheDir = path.join(root, ".cache", "rcsb-chemcomp");
const snapshotDate = "2026-08-26";
const concurrency = 12;
const retryCount = 3;

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some(Boolean));
  return values.map((item) => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), item[index] ?? ""])));
};

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const splitValues = (value) => String(value ?? "").split(/\s*[\/；;]\s*/).filter(Boolean);
const normalizeFormula = (value) => String(value ?? "").replaceAll(" ", "").toUpperCase();
const normalizeName = (value) => String(value ?? "").normalize("NFKC").replace(/[\s_~-]+/g, " ").trim().toLowerCase();
const normalizeIds = (value) => {
  const source = Array.isArray(value) ? value : splitValues(value);
  return [...new Set(source.flatMap((item) => String(item).split(/\s*[,\/；;]\s*/)).filter(Boolean).map((item) => item.toUpperCase()))].sort();
};
const sameSet = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const catalog = JSON.parse(await readFile(path.join(publicDir, "ccd-verified-cores.json"), "utf8"));
const reviewRows = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-1805.csv"), "utf8"));
const localByCcd = new Map();

for (const record of catalog.records) {
  for (const ccdId of record.ccdIds) {
    localByCcd.set(ccdId, {
      dataset: "catalog",
      rowId: record.id,
      ccdId,
      isPrimary: ccdId === record.primaryCcdId,
      name: record.name,
      formula: record.formula,
      formulaWeight: record.formulaWeight,
      parents: record.parentIds,
      smiles: record.smiles,
    });
  }
}

for (const record of reviewRows) {
  const ccdIds = splitValues(record["CCD编号"]);
  const names = splitValues(record["名称"]);
  const sourceNames = names.length === ccdIds.length ? names : ccdIds.map(() => record["名称"]);
  ccdIds.forEach((ccdId, index) => {
    if (localByCcd.has(ccdId)) return;
    localByCcd.set(ccdId, {
      dataset: "review-queue",
      rowId: record["CCD编号"],
      ccdId,
      isPrimary: index === 0,
      name: sourceNames[index],
      formula: record["分子式"],
      formulaWeight: Number(record["分子量"]) || null,
      parents: splitValues(record["母体CCD"]),
      smiles: record["立体化学SMILES"],
    });
  });
}

await mkdir(cacheDir, { recursive: true });

const fetchOfficial = async (ccdId) => {
  const cachePath = path.join(cacheDir, `${ccdId}.json`);
  try {
    return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {}

  let lastError;
  for (let attempt = 1; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(`https://data.rcsb.org/rest/v1/core/chemcomp/${encodeURIComponent(ccdId)}`, {
        headers: { "user-agent": "oral-cyclic-peptide-ncaa-audit/1.0" },
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status === 404) return { missing: true, ccdId };
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      await writeFile(cachePath, `${JSON.stringify(result)}\n`, "utf8");
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < retryCount) await sleep(500 * attempt);
    }
  }
  return { requestError: String(lastError), ccdId };
};

const ids = [...localByCcd.keys()].sort();
const officialByCcd = new Map();
let cursor = 0;
const workers = Array.from({ length: concurrency }, async () => {
  while (cursor < ids.length) {
    const index = cursor;
    cursor += 1;
    const ccdId = ids[index];
    officialByCcd.set(ccdId, await fetchOfficial(ccdId));
    if ((index + 1) % 100 === 0) console.log(`Fetched ${index + 1}/${ids.length}`);
  }
});
await Promise.all(workers);

const issues = [];
const addIssue = (severity, local, field, localValue, officialValue, message) => {
  issues.push({ severity, dataset: local.dataset, rowId: local.rowId, ccdId: local.ccdId, field, localValue, officialValue, message });
};

let verified = 0;
let revisedAfterSnapshot = 0;
const fieldMatches = { formula: 0, formulaWeight: 0, parents: 0, smiles: 0, name: 0 };

for (const ccdId of ids) {
  const local = localByCcd.get(ccdId);
  const official = officialByCcd.get(ccdId);
  if (official?.missing) {
    addIssue("error", local, "ccdId", ccdId, "404", "CCD identifier is not present in the current RCSB Data API.");
    continue;
  }
  if (official?.requestError) {
    addIssue("error", local, "request", "", official.requestError, "Official record could not be retrieved after retries.");
    continue;
  }
  verified += 1;
  const chem = official.chem_comp ?? {};
  const descriptor = official.rcsb_chem_comp_descriptor ?? {};
  const revisionDate = official.rcsb_chem_comp_info?.revision_date?.slice(0, 10) ?? "";
  if (revisionDate > snapshotDate) {
    revisedAfterSnapshot += 1;
    addIssue("review", local, "revisionDate", snapshotDate, revisionDate, "Official CCD record was revised after the website snapshot and should be rechecked.");
  }

  if (normalizeFormula(local.formula) === normalizeFormula(chem.formula)) fieldMatches.formula += 1;
  else addIssue("error", local, "formula", local.formula, chem.formula, "Molecular formula differs from the current official record.");

  if (local.formulaWeight != null && Math.abs(Number(local.formulaWeight) - Number(chem.formula_weight)) <= 0.01) fieldMatches.formulaWeight += 1;
  else addIssue("error", local, "formulaWeight", local.formulaWeight, chem.formula_weight, "Formula weight differs by more than 0.01 Da.");

  const localParents = normalizeIds(local.parents);
  const officialParents = normalizeIds(chem.mon_nstd_parent_comp_id);
  if (sameSet(localParents, officialParents)) fieldMatches.parents += 1;
  else addIssue("warning", local, "parents", localParents.join(" / "), officialParents.join(" / "), "Parent CCD identifiers differ from the current official record.");

  if (local.smiles === descriptor.SMILES_stereo) fieldMatches.smiles += 1;
  else addIssue("warning", local, "smiles", local.smiles, descriptor.SMILES_stereo, "Stereochemical SMILES text differs; graph equivalence must be checked before calling this a chemical mismatch.");

  if (!local.isPrimary && local.dataset === "catalog") fieldMatches.name += 1;
  else if (normalizeName(local.name) === normalizeName(chem.name)) fieldMatches.name += 1;
  else addIssue("info", local, "name", local.name, chem.name, "Displayed name differs from the current official preferred name.");
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: "RCSB PDB Data API /rest/v1/core/chemcomp/{id}",
  websiteSnapshotDate: snapshotDate,
  scope: {
    uniqueCcdIds: ids.length,
    catalogCcdIds: catalog.records.flatMap((record) => record.ccdIds).length,
    reviewOnlyCcdIds: ids.length - new Set(catalog.records.flatMap((record) => record.ccdIds)).size,
  },
  results: {
    verified,
    missingOrRequestFailed: ids.length - verified,
    revisedAfterSnapshot,
    fieldMatches,
    issues: Object.fromEntries(["error", "warning", "review", "info"].map((severity) => [severity, issues.filter((issue) => issue.severity === severity).length])),
  },
  interpretation: [
    "Exact SMILES text differences are not automatically chemical-graph mismatches.",
    "A valid CCD identity does not prove use as an independently synthesizable peptide monomer.",
    "A polymer-sequence occurrence does not prove a favorable permeability or oral-exposure effect.",
  ],
};

const columns = ["severity", "dataset", "rowId", "ccdId", "field", "localValue", "officialValue", "message"];
await writeFile(path.join(publicDir, "ccd-official-field-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
await writeFile(
  path.join(publicDir, "ccd-official-field-issues.csv"),
  `\uFEFF${[columns, ...issues.map((issue) => columns.map((column) => issue[column]))].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`,
  "utf8",
);

console.log(JSON.stringify(report, null, 2));
if (report.results.issues.error > 0) process.exitCode = 1;
