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

export const DATABASE_VERSION = "5.0";
export const DATABASE_RELEASE_DATE = "2026-09-01";

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
        : group.id === "patent-library"
          ? "patent-example"
          : "residue",
  };
});

export const masterRecordBySlug = new Map(masterRecords.map((record) => [record.slug, record]));

export const propertyEvidenceMasterRecords = masterRecords.filter(
  (record) => record.level === "直接证据" || record.level === "改造证据",
);

export const propertyEvidenceMasterRecordBySlug = new Map(
  propertyEvidenceMasterRecords.map((record) => [record.slug, record]),
);
