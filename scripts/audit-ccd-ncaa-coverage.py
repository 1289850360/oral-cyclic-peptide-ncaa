#!/usr/bin/env python3
"""Compare the website NCAA collection with the complete wwPDB CCD snapshot.

The strict denominator intentionally uses official peptide-linking component types.
NON-POLYMER compounds that merely look amino-acid-like require a separate structural
and source review and are not silently counted as confirmed amino acids here.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import shlex
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


STANDARD_PROTEINOGENIC_IDS = {
    "ALA", "ARG", "ASN", "ASP", "CYS", "GLN", "GLU", "GLY", "HIS", "ILE",
    "LEU", "LYS", "MET", "PHE", "PRO", "SER", "THR", "TRP", "TYR", "VAL",
    # Natural genetically encoded residues are not treated as non-natural here.
    "SEC", "PYL",
    # Ambiguous or unknown polymer placeholders are not chemical NCAA identities.
    "ASX", "GLX", "XLE", "UNK",
}


def parse_header_value(line: str) -> tuple[str, str] | None:
    if not line.startswith("_chem_comp."):
        return None
    try:
        parts = shlex.split(line, posix=True)
    except ValueError:
        parts = line.split(maxsplit=1)
    if len(parts) < 2:
        return None
    return parts[0].removeprefix("_chem_comp."), parts[1]


def iter_chem_components(gzip_path: Path):
    current: dict[str, str] | None = None
    header_started = False
    with gzip.open(gzip_path, "rt", encoding="utf-8", errors="replace") as handle:
        for line in handle:
            if line.startswith("data_"):
                if current and current.get("id"):
                    yield current
                current = {}
                header_started = False
                continue
            if current is None:
                continue
            if line.startswith("#"):
                if header_started:
                    # The first separator after _chem_comp.* closes the scalar header.
                    header_started = False
                continue
            parsed = parse_header_value(line.rstrip("\r\n"))
            if parsed:
                key, value = parsed
                current[key] = value
                header_started = True
        if current and current.get("id"):
            yield current


def normalize_type(value: str) -> str:
    return " ".join(value.upper().replace("_", " ").split())


def is_official_peptide_linking(component_type: str) -> bool:
    normalized = normalize_type(component_type)
    return "PEPTIDE LINKING" in normalized


def write_csv(path: Path, rows: list[dict], columns: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ccd-gzip", required=True, type=Path)
    parser.add_argument("--catalog", default=Path("public/ccd-unified-structure-catalog.json"), type=Path)
    parser.add_argument("--output-dir", default=Path("public"), type=Path)
    parser.add_argument("--source-last-modified", default="")
    args = parser.parse_args()

    with args.catalog.open(encoding="utf-8") as handle:
        catalog = json.load(handle)

    current_records = catalog["records"]
    current_confirmed = {
        ccd_id.upper()
        for record in current_records
        if record.get("componentClass", {}).get("id") == "evidence-reviewed-residue"
        for ccd_id in record.get("ccdIds", [])
    }
    current_all = {
        ccd_id.upper()
        for record in current_records
        for ccd_id in record.get("ccdIds", [])
    }

    components = list(iter_chem_components(args.ccd_gzip))
    released = [item for item in components if item.get("pdbx_release_status", "REL").upper() == "REL"]
    type_counts = Counter(normalize_type(item.get("type", "")) for item in released)

    strict_records = []
    for item in released:
        ccd_id = item["id"].upper()
        if ccd_id in STANDARD_PROTEINOGENIC_IDS:
            continue
        if not is_official_peptide_linking(item.get("type", "")):
            continue
        strict_records.append(item)

    strict_ids = {item["id"].upper() for item in strict_records}
    covered_strict_ids = strict_ids & current_confirmed
    missing_strict_ids = strict_ids - current_confirmed
    catalogued_strict_ids = strict_ids & current_all
    absent_strict_ids = strict_ids - current_all
    confirmed_outside_strict_ids = current_confirmed - strict_ids
    class_by_ccd = {
        ccd_id.upper(): record.get("componentClass", {}).get("id", "unclassified")
        for record in current_records
        for ccd_id in record.get("ccdIds", [])
    }
    strict_class_counts = Counter(class_by_ccd.get(ccd_id, "absent") for ccd_id in strict_ids)

    missing_rows = []
    for item in sorted(strict_records, key=lambda row: row["id"]):
        ccd_id = item["id"].upper()
        if ccd_id not in missing_strict_ids:
            continue
        missing_rows.append({
            "ccdId": ccd_id,
            "name": item.get("name", ""),
            "componentType": item.get("type", ""),
            "parentCcd": item.get("mon_nstd_parent_comp_id", ""),
            "formula": item.get("formula", ""),
            "initialDate": item.get("pdbx_initial_date", ""),
            "modifiedDate": item.get("pdbx_modified_date", ""),
            "alreadyAnywhereInWebsiteCatalog": ccd_id in current_all,
            "officialUrl": f"https://www.rcsb.org/ligand/{ccd_id}",
            "reviewStatus": "identity-classification-recheck" if ccd_id in current_all else "absent-from-website-snapshot",
        })

    strict_count = len(strict_ids)
    covered_count = len(covered_strict_ids)
    report = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": {
            "name": "wwPDB Chemical Component Dictionary complete components.cif.gz",
            "url": "https://files.wwpdb.org/pub/pdb/data/monomers/components.cif.gz",
            "lastModified": args.source_last_modified,
        },
        "websiteSnapshotDate": catalog.get("metadata", {}).get("snapshotDate", ""),
        "definition": {
            "strictCandidateUniverse": "Released CCD entries whose official _chem_comp.type contains PEPTIDE LINKING, excluding 20 canonical residues, SEC, PYL and ambiguous placeholders ASX/GLX/XLE/UNK.",
            "importantBoundary": "NON-POLYMER amino-acid-like compounds are not part of this strict denominator and require structure/source review before inclusion.",
        },
        "completeCcd": {
            "allDataBlocks": len(components),
            "releasedComponents": len(released),
            "componentTypeCounts": dict(sorted(type_counts.items(), key=lambda pair: (-pair[1], pair[0]))),
        },
        "website": {
            "catalogRecords": len(current_records),
            "uniqueCatalogCcdIds": len(current_all),
            "confirmedNcaaRecords": sum(
                1 for record in current_records
                if record.get("componentClass", {}).get("id") == "evidence-reviewed-residue"
            ),
            "confirmedNcaaUniqueCcdIds": len(current_confirmed),
        },
        "strictCoverage": {
            "officialPeptideLinkingCandidateCcdIds": strict_count,
            "presentAnywhereInWebsiteCatalog": len(catalogued_strict_ids),
            "absentFromWebsiteCatalog": len(absent_strict_ids),
            "catalogCoveragePercent": round(100 * len(catalogued_strict_ids) / strict_count, 2) if strict_count else None,
            "currentlyClassifiedConfirmedNcaa": covered_count,
            "currentlyClassifiedSpecialOrExcluded": len(missing_strict_ids & current_all),
            "currentClassCounts": dict(sorted(strict_class_counts.items())),
            "confirmedNcaaOutsideStrictOfficialSet": len(confirmed_outside_strict_ids),
        },
        "interpretation": [
            "Catalog coverage measures whether official peptide-linking candidates are present anywhere in the website master catalog; it is not the same as confirmed NCAA identity.",
            f"The {len(missing_strict_ids & current_all)} catalogued candidates currently placed in special-reference or excluded classes remain outside the confirmed NCAA collection after the current identity rules are applied.",
            "Entries outside the strict set may still be valid non-natural amino acids when record-level evidence supports them.",
            "A CCD identity does not prove commercial availability, SPPS compatibility, cyclic-peptide use or property improvement.",
        ],
        "identityRecheckCcdIds": sorted(missing_strict_ids & current_all),
        "absentStrictCandidateCcdIds": sorted(absent_strict_ids),
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    json_path = args.output_dir / "ccd-ncaa-complete-coverage-audit.json"
    csv_path = args.output_dir / "ccd-ncaa-missing-strict-candidates.csv"
    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    write_csv(csv_path, missing_rows, [
        "ccdId", "name", "componentType", "parentCcd", "formula", "initialDate",
        "modifiedDate", "alreadyAnywhereInWebsiteCatalog", "officialUrl", "reviewStatus",
    ])
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
