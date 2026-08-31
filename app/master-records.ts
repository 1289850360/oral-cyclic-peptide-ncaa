import { groups, type Residue } from "./residue-data";

export type MasterRecord = Residue & {
  id: string;
  slug: string;
  categoryId: string;
  category: string;
  recordVersion: string;
  reviewedAt: string;
};

export const DATABASE_VERSION = "3.3";
export const DATABASE_RELEASE_DATE = "2026-08-31";

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
  };
});

export const masterRecordBySlug = new Map(masterRecords.map((record) => [record.slug, record]));
