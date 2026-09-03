import csv
import json
import re
from collections import Counter
from pathlib import Path

from rdkit import Chem, rdBase


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
analysis = json.loads((PUBLIC / "natural-parent-derivative-analysis.json").read_text(encoding="utf-8"))
catalog = json.loads((PUBLIC / "ccd-unified-structure-catalog.json").read_text(encoding="utf-8"))
manual = json.loads((PUBLIC / "natural-parent-manual-structure-review.json").read_text(encoding="utf-8"))
analysis_by_ccd = {item["ccdId"]: item for item in analysis["records"]}
manual_by_ccd = {item["ccdId"]: item for item in manual["records"]}

METALS = {
    "Li", "Na", "K", "Rb", "Cs", "Mg", "Ca", "Sr", "Ba", "Al", "Ga", "In", "Tl",
    "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Zr", "Mo", "Ru", "Rh",
    "Pd", "Ag", "Cd", "Hf", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Pb", "Bi",
}
LABEL_OR_PROTECT_RE = re.compile(
    r"DANSYL|FLUORESCE|RHODAM|BODIPY|NITROBENZOXADIAZ|NBD[- ]|BIOTIN|"
    r"\bFMOC\b|\bBOC\b|CARBOBENZOXY|BENZYLOXYCARBONYL|TRITYL|"
    r"SPIN LABEL|TEMPO|CHELATOR|PHENANTHROLINE|BIPYRIDIN",
    re.I,
)
ADDUCT_RE = re.compile(
    r"ADDUCT|ACYL[- ](?:SERINE|CYSTEINE|LYSINE)|COENZYME|NUCLEOT|ADENOS|PANTETHE|"
    r"GLUTATHIONE|CYSTEINE-METHYLENE|RHODIUM|PLATINUM|MERCURY|METAL COMPLEX",
    re.I,
)
TERMINAL_BLOCK_RE = re.compile(
    r"^(?:N[-~^0-9]*-)?ACETYL-|(?:AMIDE|AMIDATED)$|ALANINOL$|HISTIDINOL$|"
    r"TRYPTOPHANOL$|PHENYLALANINOL$|TYROSINOL$|PHOSPHONIC ACID$",
    re.I,
)


def formula_elements(formula):
    return set(re.findall(r"[A-Z][a-z]?", formula or ""))


def peptide_backbone_sites(mol):
    """Return alpha-amino-acid-like sites with a free carboxyl carbon."""
    sites = []
    for carbonyl in mol.GetAtoms():
        if carbonyl.GetSymbol() != "C":
            continue
        oxygen_double = []
        oxygen_single = []
        alpha_candidates = []
        for bond in carbonyl.GetBonds():
            other = bond.GetOtherAtom(carbonyl)
            if other.GetSymbol() == "O" and bond.GetBondType() == Chem.BondType.DOUBLE:
                oxygen_double.append(other)
            elif other.GetSymbol() == "O" and bond.GetBondType() == Chem.BondType.SINGLE and other.GetDegree() == 1:
                oxygen_single.append(other)
            elif other.GetSymbol() == "C" and bond.GetBondType() == Chem.BondType.SINGLE:
                alpha_candidates.append(other)
        if not oxygen_double or not oxygen_single:
            continue
        for alpha in alpha_candidates:
            nitrogens = [
                neighbor for neighbor in alpha.GetNeighbors()
                if neighbor.GetSymbol() == "N" and neighbor.GetIdx() != carbonyl.GetIdx()
            ]
            for nitrogen in nitrogens:
                n_acylated = False
                for neighbor in nitrogen.GetNeighbors():
                    if neighbor.GetIdx() == alpha.GetIdx() or neighbor.GetSymbol() != "C":
                        continue
                    if any(
                        bond.GetOtherAtom(neighbor).GetSymbol() == "O"
                        and bond.GetBondType() == Chem.BondType.DOUBLE
                        for bond in neighbor.GetBonds()
                    ):
                        n_acylated = True
                sites.append({
                    "alpha": alpha.GetIdx(),
                    "nitrogen": nitrogen.GetIdx(),
                    "carboxyl": carbonyl.GetIdx(),
                    "nAcylated": n_acylated,
                })
    return sites


def classify(component):
    ccd_id = component["primaryCcdId"]
    structure = analysis_by_ccd[ccd_id]
    manual_record = manual_by_ccd.get(ccd_id)
    name = component.get("name") or structure.get("name") or ""
    upper_name = name.upper()
    linkage_types = [str(item).lower() for item in component.get("linkageTypes", [])]
    peptide_linking = any("peptide linking" in item for item in linkage_types)
    if ccd_id == "A1IPL":
        return "direct-substitutable-residue", "官方CCD名称和二维结构确认其为对位硼酸基苯丙氨酸；保留游离氨基、羧基和peptide-linking类型，可作为单残基替换候选", {
            "peptideLinkingType": peptide_linking,
            "backboneSiteCount": 1,
            "unblockedBackboneSiteCount": 1,
            "metalElements": [],
            "addedHeavyAtoms": len((structure.get("mapping") or {}).get("addedAtomIndices") or []),
            "addedRings": max(0, int(round(float((structure.get("descriptorDeltas") or {}).get("NumRings") or 0)))),
            "heavyAtoms": None,
            "derivativeCoverage": 1,
            "manualOfficialStructureReview": True,
        }
    mol = Chem.MolFromSmiles(component.get("smiles", ""))
    if mol is None:
        return "needs-manual-review", "结构含特殊价态，RDKit无法读取；需以CCD原子表确认是否保留可成肽骨架", {}

    sites = peptide_backbone_sites(mol)
    unblocked_sites = [site for site in sites if not site["nAcylated"]]
    elements = formula_elements(component.get("formula"))
    metal_elements = sorted(elements & METALS)
    added_count = len((structure.get("mapping") or {}).get("addedAtomIndices") or [])
    descriptor_delta = structure.get("descriptorDeltas") or {}
    added_rings = max(0, int(round(float(descriptor_delta.get("NumRings") or 0))))
    manual_status = manual_record.get("status") if manual_record else None
    derivative_coverage = float(manual_record.get("derivativeCoverage") or 1) if manual_record else 1
    heavy_atoms = mol.GetNumHeavyAtoms()
    flags = {
        "peptideLinkingType": peptide_linking,
        "backboneSiteCount": len(sites),
        "unblockedBackboneSiteCount": len(unblocked_sites),
        "metalElements": metal_elements,
        "addedHeavyAtoms": added_count,
        "addedRings": added_rings,
        "heavyAtoms": heavy_atoms,
        "derivativeCoverage": round(derivative_coverage, 4),
    }

    if manual_status == "complex-transformation-resolved":
        return "complex-skeletal-transformation", manual_record.get("semanticResolution") or "人工复核确认为成环或骨架重构", flags
    if metal_elements:
        return "special-adduct-or-label", f"结构含金属元素{'/'.join(metal_elements)}，属于配合物而不是普通单残基替换", flags
    if ADDUCT_RE.search(name):
        return "special-adduct-or-label", "名称显示为反应加合物、核苷/辅因子连接物或金属相关构件", flags
    if LABEL_OR_PROTECT_RE.search(name):
        return "special-adduct-or-label", "名称显示带有荧光/亲和标记、保护基或专用螯合基团", flags
    if not sites:
        if TERMINAL_BLOCK_RE.search(upper_name) or re.search(r"^METHYL\s+.+(?:INATE|OATE)$", upper_name):
            return "backbone-terminally-modified", "末端羧基或氨基已被还原、酰胺化、膦酸替代或封闭，不能直接按普通α-氨基酸残基使用", flags
        return "complex-skeletal-transformation", "未检测到同时保留可用氨基和游离羧基的α-氨基酸成肽骨架", flags
    if not unblocked_sites:
        return "backbone-terminally-modified", "检测到羧基骨架，但α-氨基已经酰化或被完整封闭", flags
    if not peptide_linking:
        return "conditional-specialized-residue", "保留可成肽骨架，但CCD未标为peptide-linking类型，合成使用前需单独确认", flags
    if heavy_atoms >= 36 or added_count >= 18 or added_rings >= 4 or derivative_coverage < 0.35:
        return "conditional-specialized-residue", "保留可成肽骨架，但附加部分很大或母体仅占结构较小部分，建议作为专用大侧链构件而非普通扫描残基", flags
    return "direct-substitutable-residue", "保留未封闭的氨基酸成肽骨架且CCD标为peptide-linking；可作为单残基替换候选", flags


eligible_ids = {item["ccdId"] for item in analysis["records"]}
records = []
for component in catalog["records"]:
    if component["primaryCcdId"] not in eligible_ids:
        continue
    category, reason, flags = classify(component)
    records.append({
        "ccdId": component["primaryCcdId"],
        "name": component.get("name"),
        "primaryParent": analysis_by_ccd[component["primaryCcdId"]].get("primaryParent"),
        "category": category,
        "reason": reason,
        "flags": flags,
        "sourceUrl": component.get("sourceUrl") or f"https://www.rcsb.org/ligand/{component['primaryCcdId']}",
    })

counts = Counter(item["category"] for item in records)
output = {
    "metadata": {
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "method": "CCD peptide-linking type + RDKit free alpha-amino/free-carboxyl backbone check + label/adduct/metal/complex-transformation triage",
        "rdkitVersion": rdBase.rdkitVersion,
        "recordCount": len(records),
        "categoryCounts": dict(sorted(counts.items())),
        "boundary": "This is a structural usability classification. Direct-substitutable means the monomeric peptide-linking backbone is retained; it does not prove SPPS availability or a beneficial property effect.",
    },
    "records": records,
}
(PUBLIC / "natural-parent-substitutability-audit.json").write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
with (PUBLIC / "natural-parent-substitutability-audit.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(["ccd_id", "name", "primary_parent", "category", "reason", "peptide_linking", "backbone_sites", "unblocked_sites", "heavy_atoms", "added_heavy_atoms", "added_rings", "derivative_coverage", "source_url"])
    for item in records:
        flags = item["flags"]
        writer.writerow([
            item["ccdId"], item["name"], item["primaryParent"], item["category"], item["reason"],
            flags.get("peptideLinkingType"), flags.get("backboneSiteCount"), flags.get("unblockedBackboneSiteCount"),
            flags.get("heavyAtoms"), flags.get("addedHeavyAtoms"), flags.get("addedRings"), flags.get("derivativeCoverage"), item["sourceUrl"],
        ])
print(json.dumps(output["metadata"], ensure_ascii=False, indent=2))
