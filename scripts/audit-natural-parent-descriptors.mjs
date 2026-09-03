import initRDKitModule from "@rdkit/rdkit";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const analysis = JSON.parse(await readFile(join(publicDir, "natural-parent-derivative-analysis.json"), "utf8"));
const catalog = JSON.parse(await readFile(join(publicDir, "ccd-unified-structure-catalog.json"), "utf8"));
const catalogByCcd = new Map(catalog.records.map((record) => [record.primaryCcdId, record]));
const parentByCcd = new Map(analysis.parents.map((record) => [record.ccdId, record]));
const descriptorKeys = ["exactmw", "NumHBD", "NumHBA", "NumRotatableBonds", "NumRings", "tpsa", "CrippenClogP", "FractionCSP3"];
const tolerance = { exactmw: 0.002, NumHBD: 0.001, NumHBA: 0.001, NumRotatableBonds: 0.001, NumRings: 0.001, tpsa: 0.011, CrippenClogP: 0.002, FractionCSP3: 0.002 };
const RDKit = await initRDKitModule();
const failures = [];
const skipped = [];
let checked = 0;

for (const record of analysis.records) {
  if (!record.descriptorDeltas) {
    skipped.push(record.ccdId);
    continue;
  }
  if ("lipinskiHBD" in record.descriptorDeltas || "lipinskiHBA" in record.descriptorDeltas) {
    failures.push({ ccdId: record.ccdId, issue: "legacy lipinskiHBD/lipinskiHBA fields remain" });
    continue;
  }
  const component = catalogByCcd.get(record.ccdId);
  const parent = parentByCcd.get(record.primaryParent);
  const derivativeMol = RDKit.get_mol(component?.smiles ?? "");
  const parentMol = RDKit.get_mol(parent?.smiles ?? "");
  if (!derivativeMol?.is_valid() || !parentMol?.is_valid()) {
    failures.push({ ccdId: record.ccdId, issue: "stored descriptors exist but RDKit cannot parse a structure" });
    derivativeMol?.delete();
    parentMol?.delete();
    continue;
  }
  const derivative = JSON.parse(derivativeMol.get_descriptors());
  const naturalParent = JSON.parse(parentMol.get_descriptors());
  for (const key of descriptorKeys) {
    const expected = derivative[key] - naturalParent[key];
    const stored = record.descriptorDeltas[key];
    if (!Number.isFinite(stored) || Math.abs(stored - expected) > tolerance[key]) {
      failures.push({ ccdId: record.ccdId, key, stored, expected: Number(expected.toFixed(3)) });
    }
  }
  derivativeMol.delete();
  parentMol.delete();
  checked += 1;
}

const unexpectedSkipped = skipped.filter((ccdId) => ccdId !== "A1IPL");
if (unexpectedSkipped.length) failures.push({ issue: "unexpected records without descriptors", ccdIds: unexpectedSkipped });
console.log(JSON.stringify({ checked, skipped, failures: failures.length, failureSample: failures.slice(0, 20) }, null, 2));
if (failures.length) process.exitCode = 1;
