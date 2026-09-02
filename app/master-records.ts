import { groups, type Residue } from "./residue-data";

export type MasterRecord = Residue & {
  id: string;
  slug: string;
  categoryId: string;
  category: string;
  recordVersion: string;
  reviewedAt: string;
  recordType: "residue" | "whole-molecule" | "scaffold-study" | "patent-example";
};

export const DATABASE_VERSION = "5.1";
export const DATABASE_RELEASE_DATE = "2026-09-02";

export const masterRecords: MasterRecord[] = groups.flatMap((group) =>
  group.residues.map((residue) => ({ residue, group })),
).map(({ residue, group }, index) => {
  const id = `OCPR${String(index + 1).padStart(6, "0")}`;
  return {
    ...residue,
    id,
    slug: id.toLowerCase(),
    categoryId: group.id,
    category: group.title,
    recordVersion: DATABASE_VERSION,
    reviewedAt: DATABASE_RELEASE_DATE,
    recordType: group.id === "scaffold-design-studies" || group.id === "backbone-isosteres"
      ? "scaffold-study"
      : group.id === "oral-clinical-scaffold" || group.id === "natural-product-inspired"
        ? "whole-molecule"
        : group.id === "patent-library" || (group.id === "supplemental-property-evidence-2026-09" && residue.level === "专利证据")
          ? "patent-example"
          : "residue",
  };
});

export const masterRecordBySlug = new Map(masterRecords.map((record) => [record.slug, record]));

const NCAA_WHOLE_MOLECULE_PROPERTY_EVIDENCE = new Set([
  "N-Me-D-Leu",
  "N-Me-Phe",
  "N-Me-Val",
  "Sarcosine · Sar · N-Me-Gly",
  "D-Ala",
  "D-Val",
  "3-Cl-Phe · 3-chloro-L-phenylalanine",
  "D-Pen · D-penicillamine",
  "Ac5c · 1-aminocyclopentane-1-carboxylic acid",
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine",
]);

export const propertyEvidenceMasterRecords = masterRecords.filter(
  (record) => record.level === "直接证据"
    || record.level === "改造证据"
    || record.categoryId === "supplemental-property-evidence-2026-09"
    || NCAA_WHOLE_MOLECULE_PROPERTY_EVIDENCE.has(record.english),
);

export const propertyEvidenceMasterRecordBySlug = new Map(
  propertyEvidenceMasterRecords.map((record) => [record.slug, record]),
);
