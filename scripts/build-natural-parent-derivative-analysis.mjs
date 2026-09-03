import initRDKitModule from "@rdkit/rdkit";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const catalog = JSON.parse(await readFile(join(publicDir, "ccd-unified-structure-catalog.json"), "utf8"));
const parentCorrections = JSON.parse(await readFile(join(publicDir, "natural-parent-corrections.json"), "utf8"));
const parentCorrectionByCcd = new Map(parentCorrections.records.map((record) => [record.ccdId, record]));
const parentMeta = [
  ["ALA", "丙氨酸"], ["ARG", "精氨酸"], ["ASN", "天冬酰胺"], ["ASP", "天冬氨酸"], ["CYS", "半胱氨酸"], ["GLN", "谷氨酰胺"],
  ["GLU", "谷氨酸"], ["GLY", "甘氨酸"], ["HIS", "组氨酸"], ["ILE", "异亮氨酸"], ["LEU", "亮氨酸"], ["LYS", "赖氨酸"],
  ["MET", "甲硫氨酸"], ["PHE", "苯丙氨酸"], ["PRO", "脯氨酸"], ["SER", "丝氨酸"], ["THR", "苏氨酸"], ["TRP", "色氨酸"],
  ["TYR", "酪氨酸"], ["VAL", "缬氨酸"], ["SEC", "硒代半胱氨酸"], ["PYL", "吡咯赖氨酸"],
];
const parentNameByCcd = new Map(parentMeta);
const parentCodes = new Set(parentNameByCcd.keys());
const atomicSymbols = new Map([[1, "H"], [5, "B"], [6, "C"], [7, "N"], [8, "O"], [9, "F"], [14, "Si"], [15, "P"], [16, "S"], [17, "Cl"], [34, "Se"], [35, "Br"], [53, "I"]]);
const descriptorSources = {
  exactmw: "exactmw",
  NumHBD: "NumHBD",
  NumHBA: "NumHBA",
  NumRotatableBonds: "NumRotatableBonds",
  NumRings: "NumRings",
  tpsa: "tpsa",
  CrippenClogP: "CrippenClogP",
  FractionCSP3: "FractionCSP3",
};
const round = (value, digits = 3) => Number(Number(value).toFixed(digits));
const atomNumber = (atom) => atom.z ?? 6;
const atomSymbol = (atom) => atomicSymbols.get(atomNumber(atom)) ?? `Z${atomNumber(atom)}`;
const jsonGraph = (mol) => JSON.parse(mol.get_json()).molecules[0];
const HBA_SMARTS_2_0_2 = "[$([O,S;H1;v2]-[!$(*=[O,N,P,S])]),$([O,S;H0;v2]),$([O,S;-]),$([N;v3;!$(N-*=!@[O,N,P,S])]),$([nH0X2,o,s;+0])]";
const countElements = (atoms) => Object.fromEntries([...atoms.reduce((counts, atom) => counts.set(atomSymbol(atom), (counts.get(atomSymbol(atom)) ?? 0) + 1), new Map()).entries()].sort());
const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const parentSource = new Map();
for (const [ccdId, name] of parentMeta) {
  const response = await fetch(`https://data.rcsb.org/rest/v1/core/chemcomp/${ccdId}`);
  if (!response.ok) throw new Error(`Unable to load RCSB parent ${ccdId}: ${response.status}`);
  const data = await response.json();
  parentSource.set(ccdId, {
    ccdId,
    name,
    formula: data.chem_comp.formula,
    smiles: data.rcsb_chem_comp_descriptor.SMILES,
    smilesStereo: data.rcsb_chem_comp_descriptor.SMILES_stereo,
    sourceUrl: `https://www.rcsb.org/ligand/${ccdId}`,
  });
}

const RDKit = await initRDKitModule();
const hbaQuery = RDKit.get_qmol(HBA_SMARTS_2_0_2);
if (!hbaQuery?.is_valid()) throw new Error("Unable to compile NumHBA 2.0.2 query");
const standardHbaCount = (mol) => {
  const matches = JSON.parse(mol.get_substruct_matches(hbaQuery) || "[]");
  return Array.isArray(matches) ? matches.length : matches?.atoms ? 1 : 0;
};
const descriptors = (mol) => ({ ...JSON.parse(mol.get_descriptors()), NumHBA: standardHbaCount(mol) });
const derivativeRecords = catalog.records.filter((record) => record.componentClass.id === "evidence-reviewed-residue" && record.parentIds.some((id) => parentCodes.has(id.toUpperCase())));
const analyses = [];

for (const record of derivativeRecords) {
  const officialNaturalParents = record.parentIds.map((id) => id.toUpperCase()).filter((id) => parentCodes.has(id));
  const parentCorrection = parentCorrectionByCcd.get(record.primaryCcdId);
  const naturalParents = parentCorrection ? [parentCorrection.correctedParent] : officialNaturalParents;
  const parent = parentSource.get(naturalParents[0]);
  const derivativeMol = RDKit.get_mol(record.smiles);
  const parentMol = RDKit.get_mol(parent.smiles);
  const parentQuery = RDKit.get_qmol(parent.smiles);
  if (!derivativeMol?.is_valid() || !parentMol?.is_valid() || !parentQuery?.is_valid()) {
    const reason = record.primaryCcdId === "A1IPL"
      ? "RCSB CCD A1IPL采用四配位中性硼的特殊SMILES表达，RDKit标准价态检查无法可靠计算；为避免虚构数值，本条不生成描述符差值"
      : "RDKit无法读取母体或衍生物结构；为避免虚构数值，本条不生成描述符差值";
    analyses.push({
      ccdId: record.primaryCcdId,
      name: record.name,
      formula: record.formula,
      naturalParents,
      officialNaturalParents,
      primaryParent: parent.ccdId,
      parentName: parent.name,
      parentCorrection,
      status: "manual-review",
      reason,
      evidenceBoundary: "结构无法通过RDKit标准价态检查，因此不报告HBD、HBA、TPSA、cLogP等计算差值。",
      sourceUrls: { derivative: record.sourceUrl, parent: parent.sourceUrl },
    });
    derivativeMol?.delete(); parentMol?.delete(); parentQuery?.delete();
    continue;
  }
  const derivativeGraph = jsonGraph(derivativeMol);
  const parentGraph = jsonGraph(parentMol);
  const parentDescriptors = descriptors(parentMol);
  const derivativeDescriptors = descriptors(derivativeMol);
  const descriptorDeltas = Object.fromEntries(
    Object.entries(descriptorSources).map(([outputKey, rdkitKey]) => [
      outputKey,
      round(derivativeDescriptors[rdkitKey] - parentDescriptors[rdkitKey]),
    ]),
  );
  const parsedMatches = JSON.parse(derivativeMol.get_substruct_matches(parentQuery) || "[]");
  const matches = Array.isArray(parsedMatches) ? parsedMatches : parsedMatches?.atoms ? [parsedMatches] : [];
  if (naturalParents.length !== 1 || matches.length === 0) {
    analyses.push({
      ccdId: record.primaryCcdId,
      name: record.name,
      formula: record.formula,
      naturalParents,
      officialNaturalParents,
      parentCorrection,
      primaryParent: parent.ccdId,
      parentName: parent.name,
      status: "manual-review",
      reason: naturalParents.length !== 1 ? "CCD列出多个天然母体，需要人工确定主要母体" : "完整天然母体不是衍生物的直接子结构，可能涉及原子替换、断键、成环或立体化学边界",
      descriptorDeltas,
      sourceUrls: { derivative: record.sourceUrl, parent: parent.sourceUrl },
    });
    derivativeMol.delete(); parentMol.delete(); parentQuery.delete();
    continue;
  }

  const matchResults = matches.map((match) => {
    const matched = new Set(match.atoms);
    const addedAtomIndices = derivativeGraph.atoms.map((_, index) => index).filter((index) => !matched.has(index));
    const addedSet = new Set(addedAtomIndices);
    const attachments = derivativeGraph.bonds.flatMap((bond) => {
      const [a, b] = bond.atoms;
      if (addedSet.has(a) && matched.has(b)) return [{ addedAtomIndex: a, addedElement: atomSymbol(derivativeGraph.atoms[a]), attachedAtomIndex: b, attachedElement: atomSymbol(derivativeGraph.atoms[b]), bondOrder: bond.bo ?? 1 }];
      if (addedSet.has(b) && matched.has(a)) return [{ addedAtomIndex: b, addedElement: atomSymbol(derivativeGraph.atoms[b]), attachedAtomIndex: a, attachedElement: atomSymbol(derivativeGraph.atoms[a]), bondOrder: bond.bo ?? 1 }];
      return [];
    });
    return { addedAtomIndices, addedElements: countElements(addedAtomIndices.map((index) => derivativeGraph.atoms[index])), attachments };
  });
  const signatures = new Set(matchResults.map((result) => JSON.stringify({ elements: result.addedElements, attachments: result.attachments.map((item) => [item.addedElement, item.attachedElement, item.bondOrder]).sort() })));
  const result = matchResults[0];
  const addedDescription = Object.entries(result.addedElements).map(([element, count]) => `${count}个${element}`).join("、") || "没有新增重原子";
  const attachmentDescription = [...new Set(result.attachments.map((item) => `${item.addedElement}连接到${item.attachedElement}`))].join("；");
  const status = signatures.size === 1 ? "auto-structure-difference" : "manual-review";
  analyses.push({
    ccdId: record.primaryCcdId,
    name: record.name,
    formula: record.formula,
    naturalParents,
    officialNaturalParents,
    parentCorrection,
    primaryParent: parent.ccdId,
    parentName: parent.name,
    status,
    reason: status === "auto-structure-difference" ? `天然母体完整保留；检测到新增${addedDescription}${attachmentDescription ? `（${attachmentDescription}）` : ""}` : "母体在衍生物中存在多个不一致映射，需要人工确认修饰位置",
    mapping: {
      matchCount: matches.length,
      parentHeavyAtomCount: parentGraph.atoms.length,
      derivativeHeavyAtomCount: derivativeGraph.atoms.length,
      mappedHeavyAtomCount: matches[0].atoms.length,
      addedAtomIndices: result.addedAtomIndices,
      addedElements: result.addedElements,
      attachments: result.attachments,
      mappingConsistent: signatures.size === 1,
    },
    descriptorDeltas,
    evidenceBoundary: "结构差异和分子描述符由RDKit计算，不是溶解度、渗透性、稳定性或口服吸收的实验结果。",
    sourceUrls: { derivative: record.sourceUrl, parent: parent.sourceUrl },
  });
  derivativeMol.delete(); parentMol.delete(); parentQuery.delete();
}

const statusCounts = Object.fromEntries([...analyses.reduce((counts, record) => counts.set(record.status, (counts.get(record.status) ?? 0) + 1), new Map()).entries()].sort());
const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    method: "RCSB CCD parent relation + manually reviewed conflict corrections + RDKit full-parent substructure mapping; HBD/HBA use standard NumHBD/NumHBA site counts",
    rdkitVersion: RDKit.version(),
    hbaDefinitionVersion: "2.0.2 (backported from RDKit fix #8997)",
    parentCount: parentMeta.length,
    derivativeRecordCount: analyses.length,
    statusCounts,
    correctedParentCount: parentCorrections.records.length,
    boundary: "Automatic results identify additive heavy-atom changes only. Atom substitutions, deletions, bond-order changes, ring rearrangements, multiple parents and inconsistent mappings require manual review. Descriptor deltas are computed hypotheses, not experimental property evidence.",
  },
  parents: [...parentSource.values()],
  records: analyses,
};
await writeFile(join(publicDir, "natural-parent-derivative-analysis.json"), JSON.stringify(output), "utf8");
const csvHeaders = ["ccd_id", "name", "natural_parents", "primary_parent", "status", "reason", "match_count", "added_elements", "delta_exact_mw", "delta_hbd", "delta_hba", "delta_tpsa", "delta_clogp", "delta_rotatable_bonds", "delta_rings", "evidence_boundary"];
const csvRows = analyses.map((record) => [record.ccdId, record.name, record.naturalParents.join(";"), record.primaryParent, record.status, record.reason, record.mapping?.matchCount ?? "", record.mapping ? JSON.stringify(record.mapping.addedElements) : "", record.descriptorDeltas?.exactmw ?? "", record.descriptorDeltas?.NumHBD ?? "", record.descriptorDeltas?.NumHBA ?? "", record.descriptorDeltas?.tpsa ?? "", record.descriptorDeltas?.CrippenClogP ?? "", record.descriptorDeltas?.NumRotatableBonds ?? "", record.descriptorDeltas?.NumRings ?? "", record.evidenceBoundary ?? ""]);
await writeFile(join(publicDir, "natural-parent-derivative-analysis.csv"), [csvHeaders, ...csvRows].map((row) => row.map(csvEscape).join(",")).join("\n"), "utf8");
hbaQuery.delete();
console.log(JSON.stringify(output.metadata, null, 2));
