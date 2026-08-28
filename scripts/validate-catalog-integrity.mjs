import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const reportPath = path.join(publicDir, "catalog-integrity-report.json");
const issuesPath = path.join(publicDir, "catalog-integrity-issues.csv");

const issues = [];
const addIssue = (severity, dataset, record, field, message) => {
  issues.push({ severity, dataset, record, field, message });
};

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
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some(Boolean));
  return values.map((item) => Object.fromEntries(headers.map((header, index) => [header.replace(/^\uFEFF/, ""), item[index] ?? ""])));
};

const csvEscape = (value) => `"${String(value).replaceAll('"', '""')}"`;
const normalizeFormula = (value) => String(value ?? "").replaceAll(" ", "");
const splitCcdIds = (value) => String(value ?? "").split(/\s*\/\s*/).filter(Boolean);
const splitLinks = (value) => String(value ?? "").split(/\s*[；;]\s*/).filter(Boolean);
const validCcdId = (value) => /^[A-Z0-9]{1,5}$/.test(value);
const linksMatchCcdIds = (value, ccdIds, makeUrl) => {
  const links = splitLinks(value);
  return links.length === ccdIds.length && links.every((link, index) => link === makeUrl(ccdIds[index]));
};

const catalog = JSON.parse(await readFile(path.join(publicDir, "ccd-verified-cores.json"), "utf8"));
const catalogCsv = parseCsv(await readFile(path.join(publicDir, "ccd-verified-cores-1687.csv"), "utf8"));
const reviewQueue = parseCsv(await readFile(path.join(publicDir, "ccd-manual-review-1805.csv"), "utf8"));

if (catalog.metadata.count !== catalog.records.length) {
  addIssue("error", "catalog-json", "metadata", "count", `Metadata says ${catalog.metadata.count}, but JSON contains ${catalog.records.length} records.`);
}
if (catalogCsv.length !== catalog.records.length) {
  addIssue("error", "catalog-csv", "all", "row-count", `CSV contains ${catalogCsv.length} rows; JSON contains ${catalog.records.length}.`);
}

const recordIds = new Set();
const catalogCcdIds = new Set();
const smilesOwners = new Map();
let sourceUrlMatches = 0;
let imageUrlMatches = 0;

catalog.records.forEach((record, index) => {
  const label = record.primaryCcdId || `row-${index + 1}`;
  if (recordIds.has(record.id)) addIssue("error", "catalog-json", label, "id", `Duplicate record id: ${record.id}`);
  recordIds.add(record.id);
  if (!Array.isArray(record.ccdIds) || record.ccdIds.length === 0) {
    addIssue("error", "catalog-json", label, "ccdIds", "No CCD identifier is attached to this record.");
    return;
  }
  if (record.primaryCcdId !== record.ccdIds[0]) {
    addIssue("error", "catalog-json", label, "primaryCcdId", "Primary CCD identifier is not the first ccdIds value.");
  }
  record.ccdIds.forEach((ccdId) => {
    if (!validCcdId(ccdId)) addIssue("error", "catalog-json", label, "ccdIds", `Malformed CCD identifier: ${ccdId}`);
    if (catalogCcdIds.has(ccdId)) addIssue("error", "catalog-json", label, "ccdIds", `CCD identifier appears in more than one record: ${ccdId}`);
    catalogCcdIds.add(ccdId);
  });
  if (!record.name) addIssue("error", "catalog-json", label, "name", "Missing component name.");
  if (!record.formula) addIssue("error", "catalog-json", label, "formula", "Missing molecular formula.");
  if (!record.smiles) addIssue("error", "catalog-json", label, "smiles", "Missing stereochemical SMILES.");
  if (!(record.formulaWeight > 0)) addIssue("warning", "catalog-json", label, "formulaWeight", "Formula weight is absent or non-positive.");
  if (record.smiles) {
    const previous = smilesOwners.get(record.smiles);
    if (previous && previous !== record.id) addIssue("error", "catalog-json", label, "smiles", `Duplicate stereochemical SMILES also used by ${previous}.`);
    smilesOwners.set(record.smiles, record.id);
  }
  const encodedId = encodeURIComponent(record.primaryCcdId);
  if (record.sourceUrl === `https://www.rcsb.org/ligand/${encodedId}`) sourceUrlMatches += 1;
  else addIssue("error", "catalog-json", label, "sourceUrl", "RCSB link does not match primaryCcdId.");
  if (record.structureImageUrl === `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${encodedId}_500.svg`) imageUrlMatches += 1;
  else addIssue("error", "catalog-json", label, "structureImageUrl", "PDBe image link does not match primaryCcdId.");

  const csvRow = catalogCsv[index];
  if (!csvRow) return;
  if (splitCcdIds(csvRow["CCD编号"]).join("|") !== record.ccdIds.join("|")) {
    addIssue("error", "catalog-cross-check", label, "CCD编号", "CSV and JSON CCD identifiers differ at the same row.");
  }
  if (csvRow["名称"] !== record.name) addIssue("error", "catalog-cross-check", label, "名称", "CSV and JSON names differ at the same row.");
  if (normalizeFormula(csvRow["分子式"]) !== normalizeFormula(record.formula)) {
    addIssue("error", "catalog-cross-check", label, "分子式", "CSV and JSON molecular formulae differ at the same row.");
  }
  if (csvRow["立体化学SMILES"] !== record.smiles) addIssue("error", "catalog-cross-check", label, "立体化学SMILES", "CSV and JSON SMILES differ at the same row.");
});

const reviewIds = new Set();
const priorityCounts = {};
let reviewSourceMatches = 0;
let reviewImageMatches = 0;

reviewQueue.forEach((record, index) => {
  const ccdIds = splitCcdIds(record["CCD编号"]);
  const label = record["CCD编号"] || `row-${index + 1}`;
  if (reviewIds.has(label)) addIssue("error", "review-queue", label, "CCD编号", "Duplicate review-row CCD field.");
  reviewIds.add(label);
  ccdIds.forEach((ccdId) => {
    if (!validCcdId(ccdId)) addIssue("error", "review-queue", label, "CCD编号", `Malformed CCD identifier: ${ccdId}`);
  });
  const tier = record["审核优先级"]?.split("｜")[0] || "missing";
  priorityCounts[tier] = (priorityCounts[tier] ?? 0) + 1;
  if (!record["名称"]) addIssue("error", "review-queue", label, "名称", "Missing component name.");
  if (!record["立体化学SMILES"]) addIssue("error", "review-queue", label, "立体化学SMILES", "Missing stereochemical SMILES.");
  if (linksMatchCcdIds(record["CCD链接"], ccdIds, (ccdId) => `https://www.rcsb.org/ligand/${ccdId}`)) reviewSourceMatches += 1;
  else addIssue("error", "review-queue", label, "CCD链接", "RCSB links do not map one-to-one to the CCD identifiers.");
  if (linksMatchCcdIds(record["结构图链接"], ccdIds, (ccdId) => `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccdId}_500.svg`)) reviewImageMatches += 1;
  else addIssue("error", "review-queue", label, "结构图链接", "PDBe image links do not map one-to-one to the CCD identifiers.");
});

const expectedPriorities = { P0: 6, P1: 45, P2: 484, P3: 1270 };
for (const [tier, expected] of Object.entries(expectedPriorities)) {
  if (priorityCounts[tier] !== expected) addIssue("error", "review-queue", tier, "row-count", `Expected ${expected}; found ${priorityCounts[tier] ?? 0}.`);
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  result: issues.some((issue) => issue.severity === "error") ? "failed" : "passed",
  scope: {
    statement: "This report checks local field completeness, uniqueness, cross-file consistency, and deterministic CCD-to-URL mapping. It does not prove peptide-synthesis suitability or property effects.",
    excludedClaims: [
      "The remote SVG was rendered from the chemically correct structure.",
      "The component has been used as an independently synthesizable peptide monomer.",
      "The component improves permeability, stability, or oral exposure.",
    ],
  },
  catalog: {
    jsonRecords: catalog.records.length,
    csvRecords: catalogCsv.length,
    uniqueCoreRecords: recordIds.size,
    uniqueCcdIds: catalogCcdIds.size,
    uniqueStereochemicalSmiles: smilesOwners.size,
    sourceUrlMatches,
    imageUrlMatches,
  },
  reviewQueue: {
    rows: reviewQueue.length,
    uniqueCcdFields: reviewIds.size,
    priorityCounts,
    sourceUrlMatches: reviewSourceMatches,
    imageUrlMatches: reviewImageMatches,
  },
  issues: {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
    file: "catalog-integrity-issues.csv",
  },
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
const issueHeader = ["severity", "dataset", "record", "field", "message"];
await writeFile(
  issuesPath,
  `\uFEFF${[issueHeader, ...issues.map((issue) => issueHeader.map((key) => issue[key]))].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`,
  "utf8",
);

console.log(JSON.stringify(report, null, 2));
if (report.result === "failed") process.exitCode = 1;
