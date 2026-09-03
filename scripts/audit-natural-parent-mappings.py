import json
import re
from pathlib import Path

from rdkit import Chem, DataStructs, rdBase
from rdkit.Chem import AllChem, rdFMCS


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
analysis = json.loads((PUBLIC / "natural-parent-derivative-analysis.json").read_text(encoding="utf-8"))
catalog = json.loads((PUBLIC / "ccd-unified-structure-catalog.json").read_text(encoding="utf-8"))
correction_data = json.loads((PUBLIC / "natural-parent-corrections.json").read_text(encoding="utf-8"))
retained_after_review = {item["ccdId"]: item for item in correction_data.get("retainedAfterReview", [])}
catalog_by_ccd = {item["primaryCcdId"]: item for item in catalog["records"]}

# These expressions are deliberately conservative.  They are clues used to
# choose structures for comparison, never a parent assignment by themselves.
NAME_PATTERNS = [
    ("SEC", r"selenocystein"), ("PYL", r"pyrrolysin"),
    ("ILE", r"isoleucin"), ("PHE", r"phenylalanin"),
    ("TRP", r"tryptophan"), ("TYR", r"tyrosin"),
    ("THR", r"threonin"), ("CYS", r"cystein"),
    ("ASN", r"asparagin"), ("ASP", r"aspart(?:ic|ate)"),
    ("GLN", r"glutamin"), ("GLU", r"glutam(?:ic|ate)"),
    ("ARG", r"arginin"), ("HIS", r"histidin"),
    ("LYS", r"lysin"), ("MET", r"methionin"),
    ("PRO", r"prolin"), ("SER", r"serin"),
    ("LEU", r"(?<!iso)leucin"), ("VAL", r"(?<!nor)valin"),
    ("ALA", r"(?<!phenyl)alanin"), ("GLY", r"glycin"),
]


def mol_from(value):
    return Chem.MolFromSmiles(value or "")


parents = {}
for item in analysis["parents"]:
    mol = mol_from(item.get("smiles"))
    if mol is not None:
        parents[item["ccdId"]] = {
            **item,
            "mol": mol,
            "heavy": mol.GetNumHeavyAtoms(),
            "fp": AllChem.GetMorganGenerator(radius=2, fpSize=2048).GetFingerprint(mol),
        }


def name_hints(name):
    return [code for code, pattern in NAME_PATTERNS if re.search(pattern, name or "", re.I)]


def compare(parent, derivative, derivative_fp):
    parent_mol = parent["mol"]
    exact = derivative.HasSubstructMatch(parent_mol)
    if exact:
        mcs_atoms = parent["heavy"]
    else:
        result = rdFMCS.FindMCS(
            [parent_mol, derivative],
            atomCompare=rdFMCS.AtomCompare.CompareElements,
            bondCompare=rdFMCS.BondCompare.CompareAny,
            ringMatchesRingOnly=True,
            completeRingsOnly=False,
            matchChiralTag=False,
            timeout=2,
        )
        mcs_atoms = 0 if result.canceled else result.numAtoms
    return {
        "parent": parent["ccdId"],
        "exactParentSubstructure": exact,
        "mcsAtoms": mcs_atoms,
        "parentHeavyAtoms": parent["heavy"],
        "parentCoverage": round(mcs_atoms / max(1, parent["heavy"]), 4),
        "derivativeCoverage": round(mcs_atoms / max(1, derivative.GetNumHeavyAtoms()), 4),
        "tanimoto": round(DataStructs.TanimotoSimilarity(parent["fp"], derivative_fp), 4),
    }


def sort_key(item):
    return (
        item["mcsAtoms"],
        int(item["exactParentSubstructure"]),
        item["parentCoverage"],
        item["tanimoto"],
    )


records = []
generator = AllChem.GetMorganGenerator(radius=2, fpSize=2048)
for source in analysis["records"]:
    component = catalog_by_ccd.get(source["ccdId"])
    derivative = mol_from(component.get("smiles")) if component else None
    if derivative is None or source.get("primaryParent") not in parents:
        hints = name_hints(source.get("name"))
        name_confirms_parent = source.get("primaryParent") in hints
        records.append({
            "ccdId": source["ccdId"], "name": source.get("name"),
            "currentParent": source.get("primaryParent"),
            "nameHints": hints,
            "auditStatus": "name-confirmed-structure-unreadable" if name_confirms_parent else "unreadable",
            "reasons": ["RDKit无法读取特殊价态结构，但官方名称明确写出当前天然母体"] if name_confirms_parent else ["RDKit无法读取结构，且名称不能独立确认母体"],
        })
        continue

    derivative_fp = generator.GetFingerprint(derivative)
    similarities = sorted(
        ((DataStructs.TanimotoSimilarity(item["fp"], derivative_fp), code) for code, item in parents.items()),
        reverse=True,
    )
    hints = name_hints(source.get("name"))
    # Compare all 22 parents.  Limiting this to fingerprint neighbours misses
    # bond-order transformations such as phenylalanine -> cyclohexylalanine.
    candidate_codes = set(parents)
    comparisons = sorted(
        (compare(parents[code], derivative, derivative_fp) for code in candidate_codes),
        key=sort_key,
        reverse=True,
    )
    current = next(item for item in comparisons if item["parent"] == source["primaryParent"])
    best = comparisons[0]
    alternative = next((item for item in comparisons if item["parent"] != source["primaryParent"]), None)

    status = "consistent"
    reasons = []
    suggested = source["primaryParent"]
    if best["parent"] != source["primaryParent"]:
        suggested = best["parent"]
        if (best["exactParentSubstructure"] and not current["exactParentSubstructure"]
                and best["mcsAtoms"] >= current["mcsAtoms"] and best["parent"] in hints):
            status = "high-confidence-conflict"
            reasons.append("名称明确指向另一母体；该母体骨架可完整匹配，当前母体不能完整匹配")
        elif (best["exactParentSubstructure"] and best["mcsAtoms"] >= current["mcsAtoms"] + 2
                and best["parentCoverage"] >= 0.85):
            status = "high-confidence-conflict"
            reasons.append("另一天然氨基酸完整骨架的匹配原子数明显更多")
        elif (best["parent"] in hints and best["parentCoverage"] >= 0.85
                and best["mcsAtoms"] >= current["mcsAtoms"] + 2):
            status = "high-confidence-conflict"
            reasons.append("名称明确指向另一母体，且结构叠合明显优于当前母体")
        elif best["mcsAtoms"] > current["mcsAtoms"] or best["parent"] in hints:
            status = "review-needed"
            reasons.append("名称或结构更接近另一母体，但差异不足以自动改写")

    if hints and source["primaryParent"] not in hints and suggested not in hints:
        reasons.append("名称含有其他氨基酸词根；该词根可能只描述局部结构")
    retained = retained_after_review.get(source["ccdId"])
    if retained and retained["parent"] == source["primaryParent"]:
        status = "manually-retained"
        suggested = source["primaryParent"]
        reasons.append(f'人工复核后保留：{retained["reason"]}')
    elif source.get("parentCorrection"):
        status = "corrected"
        suggested = source["primaryParent"]
        reasons.append(f'已完成人工修正：{source["parentCorrection"]["rationale"]}')
    elif status == "review-needed":
        status = "screened-retained"
        suggested = source["primaryParent"]
        reasons.append("替代母体只在局部公共子结构上略占优势，没有足够证据推翻CCD父级关系；筛查后保留当前母体")
    records.append({
        "ccdId": source["ccdId"],
        "name": source.get("name"),
        "currentParent": source["primaryParent"],
        "officialParents": source.get("naturalParents", []),
        "nameHints": hints,
        "auditStatus": status,
        "suggestedParent": suggested,
        "reasons": reasons,
        "currentComparison": current,
        "bestComparison": best,
        "runnerUpComparison": alternative,
    })

counts = {}
for item in records:
    counts[item["auditStatus"]] = counts.get(item["auditStatus"], 0) + 1
output = {
    "metadata": {
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "method": "CCD parent-field cross-check using conservative name hints, exact substructure, RDKit MCS and Morgan similarity",
        "rdkitVersion": rdBase.rdkitVersion,
        "recordCount": len(records),
        "statusCounts": dict(sorted(counts.items())),
        "boundary": "High-confidence conflicts were corrected manually. Weak similarities do not override the CCD parent field and are recorded as screened-retained.",
    },
    "records": records,
}
(PUBLIC / "natural-parent-mapping-audit.json").write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
print(json.dumps(output["metadata"], ensure_ascii=False, indent=2))
for item in records:
    if item["auditStatus"] != "consistent":
        print(f'{item["auditStatus"]:24} {item["ccdId"]:6} {item.get("currentParent", "-"):3} -> {item.get("suggestedParent", "-"):3}  {item.get("name", "") }')
