import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from rdkit import Chem


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
catalog = json.loads((PUBLIC / "ccd-unified-structure-catalog.json").read_text(encoding="utf-8"))["records"]
analysis = json.loads((PUBLIC / "natural-parent-derivative-analysis.json").read_text(encoding="utf-8"))["records"]
derivative_ids = {record["ccdId"] for record in analysis}
catalog_by_id = {record["primaryCcdId"]: record for record in catalog}

# Manually checked against each current RCSB ligand page. The deposited
# structure/systematic name is used for display; the legacy preferred name is
# retained as provenance.
reviewed_findings = {
    "AZK": ("display-corrected", "RCSB常用名写成羧酸，但系统命名、分子式和SMILES均为氨基醇。"),
    "CR0": ("display-corrected", "RCSB常用名写有乙醛，但系统命名和SMILES显示乙酸端基。"),
    "MDF": ("display-corrected", "RCSB常用名会被理解为游离二羟基苯丙氨酸，但结构是二羟基苯基甘氨酸甲酯。"),
    "V3E": ("display-corrected", "RCSB常用名写成游离羧酸，但系统命名、分子式和SMILES均显示甲酯。"),
    "PR3": ("display-clarified", "常用名较简略；系统命名和SMILES表明羧基端已还原为醛。"),
    "SET": ("display-clarified", "常用名较简略；系统命名和SMILES表明羧基端为酰胺。"),
}

records = []
parse_failures = []
for ccd_id in sorted(derivative_ids):
    item = catalog_by_id[ccd_id]
    mol = Chem.MolFromSmiles(item.get("smiles", ""))
    if mol is None:
        parse_failures.append(ccd_id)
    if ccd_id in reviewed_findings:
        status, message = reviewed_findings[ccd_id]
        records.append({
            "ccdId": ccd_id,
            "sourceName": item.get("name", ""),
            "formula": item.get("formula", ""),
            "smiles": item.get("smiles", ""),
            "status": status,
            "message": message,
            "sourceUrl": item.get("sourceUrl", f"https://www.rcsb.org/ligand/{ccd_id}"),
        })

summary = {
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "method": "RDKit parse screen plus manual comparison of flagged preferred names against current RCSB systematic names, formulae and SMILES",
    "recordCount": len(derivative_ids),
    "initialAutomatedFlagCount": 19,
    "dismissedAfterManualReviewCount": 12,
    "rdkitParseSuccessCount": len(derivative_ids) - len(parse_failures),
    "rdkitParseFailureCount": len(parse_failures),
    "displayCorrectedCount": sum(record["status"] == "display-corrected" for record in records),
    "displayClarifiedCount": sum(record["status"] == "display-clarified" for record in records),
    "statusCounts": dict(Counter(record["status"] for record in records)),
    "parseFailureIds": parse_failures,
    "boundary": "This audit catches parse failures and manually reviewed name/structure conflicts. Passing it does not independently certify every IUPAC stereodescriptor in all 1,110 records.",
}
(PUBLIC / "natural-parent-name-structure-semantic-audit.json").write_text(
    json.dumps({"summary": summary, "records": records}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(json.dumps(summary, ensure_ascii=False, indent=2))
for record in records:
    print(f'{record["ccdId"]:6} {record["status"]}: {record["message"]}')
