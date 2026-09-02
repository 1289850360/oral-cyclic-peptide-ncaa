#!/usr/bin/env python3
"""Extract chemical identity features for peptide-linking CCD reclassification.

This script requires gemmi and RDKit. It does not use development relevance,
PDB title context or property evidence to decide chemical identity.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path

import gemmi
from rdkit import Chem
from rdkit import RDLogger
from rdkit.Chem import Descriptors

RDLogger.DisableLog("rdApp.error")


CARBOXYL = Chem.MolFromSmarts("[CX3](=O)[O;H1,-1]")
CARBOXYL_DERIVATIVE = Chem.MolFromSmarts("[CX3](=O)[O,N,S]")
AMINO_ACID_PATHS = [
    Chem.MolFromSmarts("[N,n]-[C,c]-[CX3](=O)[O,N,S]"),
    Chem.MolFromSmarts("[N,n]-[C,c]-[C,c]-[CX3](=O)[O,N,S]"),
    Chem.MolFromSmarts("[N,n]-[C,c]-[C,c]-[C,c]-[CX3](=O)[O,N,S]"),
]
PEPTIDE_BOND = Chem.MolFromSmarts("[NX3,NX4+]-[CX3](=O)")

CANONICAL_PARENTS = {
    "ALA", "ARG", "ASN", "ASP", "CYS", "GLN", "GLU", "GLY", "HIS", "ILE",
    "LEU", "LYS", "MET", "PHE", "PRO", "SER", "THR", "TRP", "TYR", "VAL",
}

# Source-defined composites, reaction-state structures and reduced/bioisosteric
# analogues that must remain visible in the master CCD catalog but are not one
# ordinary non-natural amino-acid residue for the focused NCAA collection.
SPECIAL_REFERENCE_IDS = {
    "05O", "0MU", "13E", "22G", "2DO", "2JF", "5X8", "66C", "7MN",
    "A1A48", "A1ADW", "A1ADY", "A1ADZ", "A1H6Z", "A1I48", "A1I67",
    "A1I9P", "A1IJE", "A1IJP", "A1IM3", "A1IU4", "A1MB8", "C66",
    "CLB", "CLD", "CY5", "EJM", "ERL", "F0G", "HM8", "HM9", "IYT",
    "KXV", "KY4", "KY7", "L2A", "LKE", "LOU", "LYV", "MOD", "MPH",
    "MPJ", "MSP", "NB8", "PDD", "SBD", "SD2", "SUB", "T66", "THO",
    "V4F", "V53", "VLM", "VMS", "VOL", "WCM", "ZFB", "ZT9",
}

EXCLUDED_NON_AMINO_IDS = {
    "1G3", "2AD", "6V9", "9JC", "A1ICL", "A1IJ4", "CDE", "DHL",
    "DHP", "FRD", "KBS", "OGZ", "TJI",
}

# Valid amino/carboxyl systems whose N-to-carbonyl path is longer or aromatic
# and therefore is not captured by the short alpha/beta/gamma SMARTS patterns.
CONFIRMED_LONG_OR_AROMATIC_AMINO_ACIDS = {
    "1IP", "1QI", "4CG", "6E4", "9JV", "A1E9U", "A1I8Q", "A1I9S", "A1IJQ", "A1IKE",
    "A1IMX", "A1IUO", "A1JAK", "ACA", "BE2", "DOA", "Z50",
}


def table_rows(block: gemmi.cif.Block, tags: list[str]):
    table = block.find(tags)
    for row in table:
        yield [gemmi.cif.as_string(str(value)) for value in row]


def descriptor_smiles(block: gemmi.cif.Block) -> str:
    candidates: list[tuple[int, str]] = []
    for dtype, program, descriptor in table_rows(block, [
        "_pdbx_chem_comp_descriptor.type",
        "_pdbx_chem_comp_descriptor.program",
        "_pdbx_chem_comp_descriptor.descriptor",
    ]):
        normalized = dtype.upper()
        if normalized not in {"SMILES", "SMILES_CANONICAL"}:
            continue
        score = (2 if normalized == "SMILES_CANONICAL" else 0) + (1 if "OPENEYE" in program.upper() else 0)
        candidates.append((score, descriptor))
    return max(candidates, default=(0, ""))[1]


def atom_flag_counts(block: gemmi.cif.Block) -> dict[str, int]:
    counts = Counter()
    for element, backbone, n_terminal, c_terminal, leaving in table_rows(block, [
        "_chem_comp_atom.type_symbol",
        "_chem_comp_atom.pdbx_backbone_atom_flag",
        "_chem_comp_atom.pdbx_n_terminal_atom_flag",
        "_chem_comp_atom.pdbx_c_terminal_atom_flag",
        "_chem_comp_atom.pdbx_leaving_atom_flag",
    ]):
        counts["atoms"] += 1
        if element.upper() != "H":
            counts["heavyAtoms"] += 1
        if backbone.upper() == "Y":
            counts["backboneAtoms"] += 1
        if n_terminal.upper() == "Y":
            counts["nTerminalAtoms"] += 1
        if c_terminal.upper() == "Y":
            counts["cTerminalAtoms"] += 1
        if leaving.upper() == "Y":
            counts["leavingAtoms"] += 1
    return dict(counts)


def mol_features(smiles: str) -> dict[str, object]:
    mol = Chem.MolFromSmiles(smiles) if smiles else None
    if mol is None:
        return {
            "rdkitParsed": False,
            "connectedFragments": None,
            "exactMass": None,
            "carboxylCount": None,
            "carboxylDerivativeCount": None,
            "aminoAcidPathLength": None,
            "peptideBondCount": None,
        }
    path_length = next((index + 2 for index, pattern in enumerate(AMINO_ACID_PATHS) if mol.HasSubstructMatch(pattern)), None)
    return {
        "rdkitParsed": True,
        "connectedFragments": len(Chem.GetMolFrags(mol)),
        "exactMass": round(Descriptors.ExactMolWt(mol), 4),
        "carboxylCount": len(mol.GetSubstructMatches(CARBOXYL)),
        "carboxylDerivativeCount": len(mol.GetSubstructMatches(CARBOXYL_DERIVATIVE)),
        "aminoAcidPathLength": path_length,
        "peptideBondCount": len(mol.GetSubstructMatches(PEPTIDE_BOND)),
    }


def parent_ids(value: str) -> list[str]:
    cleaned = value.strip(" ?.;\"")
    return [item.upper() for item in re.split(r"[,;\s]+", cleaned) if item]


def decide_identity(row: dict[str, object]) -> tuple[str, str, str]:
    ccd_id = str(row["ccdId"])
    parents = parent_ids(str(row["parentCcd"]))
    if len(parents) > 1:
        return (
            "special-reference",
            "multi-residue-derived",
            f"CCD列出多个母体残基（{' / '.join(parents)}），属于多残基融合、成熟或发色团结构，不作为一个独立非天然氨基酸。",
        )
    if ccd_id in EXCLUDED_NON_AMINO_IDS:
        return (
            "excluded-nonmonomer",
            "no-amino-acid-backbone",
            "官方结构虽被赋予肽链连接类型，但缺少可作为单一氨基酸理解的氨基酸骨架，保留作CCD追溯而不进入非天然氨基酸库。",
        )
    if ccd_id in SPECIAL_REFERENCE_IDS:
        return (
            "special-reference",
            "amino-acid-derived-special-structure",
            "结构来源于氨基酸，但属于多单元加合物、反应状态、还原端／醛、完整肽模拟构件或羧酸生物电子等排体；不作为普通非天然氨基酸残基。",
        )
    if len(parents) == 1 and parents[0] in CANONICAL_PARENTS:
        return (
            "evidence-reviewed-residue",
            "modified-single-residue",
            f"CCD只列出一个标准氨基酸母体{parents[0]}；修饰或用途状态单独记录，不否定其非标准残基身份。",
        )
    if len(parents) == 1 and parents[0] in {"DCY", "SEC", "DPN"}:
        return (
            "evidence-reviewed-residue",
            "modified-noncanonical-residue",
            f"CCD只列出一个已定义氨基酸／残基母体{parents[0]}，可作为单一非标准残基理解。",
        )
    if ccd_id in CONFIRMED_LONG_OR_AROMATIC_AMINO_ACIDS:
        return (
            "evidence-reviewed-residue",
            "extended-or-aromatic-amino-acid",
            "官方结构含同一分子内可参与连接的氨基与羧酸体系；主链距离较长或位于芳香骨架，但仍属于单一非标准氨基酸。",
        )
    path = row.get("aminoAcidPathLength")
    derivatives = int(row.get("carboxylDerivativeCount") or 0)
    peptide_bonds = int(row.get("peptideBondCount") or 0)
    heavy_atoms = int(row.get("heavyAtoms") or 0)
    if path is not None and derivatives >= 1 and peptide_bonds <= 1 and heavy_atoms <= 35:
        return (
            "evidence-reviewed-residue",
            "single-amino-acid-or-direct-derivative",
            "官方结构为单一连通分子，含氨基酸主链或直接氨基酸衍生骨架，且未显示多残基母体或多肽结构。",
        )
    return (
        "special-reference",
        "boundary-peptide-linking-structure",
        "仅凭官方肽链连接类型不足以把该边界结构作为一个普通非天然氨基酸；保留在CCD主目录和特殊结构层。",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ccd-gzip", required=True, type=Path)
    parser.add_argument("--catalog", default=Path("public/ccd-unified-structure-catalog.json"), type=Path)
    parser.add_argument("--coverage-audit", default=Path("public/ccd-ncaa-complete-coverage-audit.json"), type=Path)
    parser.add_argument("--output", default=Path("public/ccd-peptide-linking-identity-recheck.csv"), type=Path)
    args = parser.parse_args()

    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    coverage = json.loads(args.coverage_audit.read_text(encoding="utf-8"))
    target_ids = set(coverage["identityRecheckCcdIds"]) | set(coverage["absentStrictCandidateCcdIds"])
    current_by_ccd = {
        ccd_id.upper(): record
        for record in catalog["records"]
        for ccd_id in record.get("ccdIds", [])
    }

    document = gemmi.cif.read(str(args.ccd_gzip))
    rows = []
    for ccd_id in sorted(target_ids):
        block = document.find_block(ccd_id)
        if block is None:
            raise RuntimeError(f"CCD block not found: {ccd_id}")
        current = current_by_ccd.get(ccd_id, {})
        smiles = descriptor_smiles(block)
        flags = atom_flag_counts(block)
        features = mol_features(smiles)
        row = {
            "ccdId": ccd_id,
            "name": block.find_value("_chem_comp.name"),
            "componentType": block.find_value("_chem_comp.type"),
            "parentCcd": block.find_value("_chem_comp.mon_nstd_parent_comp_id"),
            "subcomponents": block.find_value("_chem_comp.pdbx_subcomponent_list"),
            "formula": block.find_value("_chem_comp.formula"),
            "smiles": smiles,
            **flags,
            **features,
            "currentClass": current.get("componentClass", {}).get("id", "absent"),
            "currentMethod": current.get("componentClass", {}).get("method", "absent"),
            "currentBasis": current.get("componentClass", {}).get("basis", ""),
            "identityDecision": "pending",
            "identitySubtype": "pending",
            "identityBasis": "",
        }
        decision, subtype, basis = decide_identity(row)
        row["identityDecision"] = decision
        row["identitySubtype"] = subtype
        row["identityBasis"] = basis
        rows.append(row)

    columns = list(rows[0])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    json_output = args.output.with_suffix(".json")
    payload = {
        "metadata": {
            "auditedAt": "2026-09-02",
            "scope": "Complete identity recheck of all official peptide-linking candidates that were absent from the confirmed NCAA class after the full CCD coverage audit.",
            "count": len(rows),
            "decisionCounts": dict(Counter(row["identityDecision"] for row in rows)),
            "subtypeCounts": dict(Counter(row["identitySubtype"] for row in rows)),
            "methodBoundary": "Chemical identity is decided from official CCD type, parent mapping and molecular structure. PDB use context, synthesis usability and development relevance do not negate identity.",
        },
        "records": rows,
    }
    json_output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "records": len(rows),
        "rdkitParsed": sum(row["rdkitParsed"] is True for row in rows),
        "withAminoAcidPath": sum(row["aminoAcidPathLength"] is not None for row in rows),
        "withBackboneFlags": sum((row.get("backboneAtoms") or 0) > 0 for row in rows),
        "currentClasses": dict(Counter(row["currentClass"] for row in rows)),
        "identityDecisions": dict(Counter(row["identityDecision"] for row in rows)),
        "identitySubtypes": dict(Counter(row["identitySubtype"] for row in rows)),
    }, indent=2))


if __name__ == "__main__":
    main()
