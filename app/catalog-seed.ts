import { groups, type Residue } from "./residue-data";
import { getStructures } from "./structure-data";
import type {
  CatalogEntityKind,
  CatalogRecord,
  IdentityStatus,
  ModificationTag,
} from "./catalog-schema";

const tagsByLegacyGroup: Record<string, ModificationTag[]> = {
  "n-methyl": ["n-substitution"],
  "d-amino": ["d-configuration"],
  "alpha-disubstituted": ["alpha-substitution", "conformational-constraint"],
  "gamma-amino": ["extended-backbone"],
  "cyclic-beta": ["extended-backbone", "conformational-constraint"],
  peptoid: ["n-substitution", "extended-backbone"],
  "sidechain-hbond": ["polar-charged"],
  "patent-library": [],
  "oral-clinical-scaffold": ["natural-product"],
  "natural-product-inspired": ["natural-product"],
  "backbone-isosteres": ["backbone-isostere"],
};

const exactIdentityExceptions = new Set([
  "N-Me-Thr",
  "N-Me-D-Trp",
  "β-homoproline · β-HPro",
  "(1R,2S)-2-ACPC · β¹",
  "(1S,2S)-2-ACHC · β²",
  "NLeu peptoid · N-isobutylglycine",
  "Pye · N,N-pyrrolidinylglutamine",
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine",
  "Pal · pyridylalanine",
  "N-substituted 5-F-Trp",
  "D-Dap(tail) · side-chain-acylated D-2,3-diaminopropionic acid",
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph",
  "hydroxy-acid / depsipeptide substitution",
  "thioamide substitution",
]);

const classifyEntity = (record: Residue): CatalogEntityKind => {
  if (/substitution$/.test(record.english)) return "molecular-strategy";
  if (/N-substituted 5-F-Trp|D-Dap\(tail\)|4-CF₃-Hph \/ 3,5-F₂/.test(record.english)) {
    return "composite-building-block";
  }
  if (/peptoid/i.test(record.english)) return "backbone-surrogate";
  return "amino-acid";
};

const inferExtraTags = (record: Residue): ModificationTag[] => {
  const text = `${record.name} ${record.english}`;
  const tags: ModificationTag[] = [];
  if (/\bD-|D-N-Me|D-Dap/.test(text)) tags.push("d-configuration");
  if (/N-Me|N-methyl|Sarcosine|peptoid|N-substituted/.test(text)) tags.push("n-substitution");
  if (/Aib|Ac5c|2-Me-Pro|α/.test(text)) tags.push("alpha-substitution");
  if (/β|gamma|statine|Sta/.test(text)) tags.push("extended-backbone");
  if (/Pro|Aze|Ac5c|ACPC|ACHC|Tic/.test(text)) tags.push("conformational-constraint");
  if (/Phe|Trp|Tyr|Nal|Cha|Hph|MeBmt|BMT/.test(text)) tags.push("hydrophobic-aromatic");
  if (/fluoro|F-|Cl-|CF₃|F₂/.test(text)) tags.push("halogen-electronic");
  if (/Orn|Dap|AmPhe|Hyp|hydroxy|Pye|Pal/.test(text)) tags.push("polar-charged");
  if (/AmPhe|Dap|tail|substituted 5-F-Trp/.test(text)) tags.push("crosslink-conjugation");
  return tags;
};

const identityStatusFor = (record: Residue): IdentityStatus => {
  if (exactIdentityExceptions.has(record.english)) {
    return /Pal|4-CF₃-Hph/.test(record.english) ? "ambiguous" : "identity-pending";
  }
  return getStructures(record.english).length ? "structure-verified" : "source-verified";
};

export const legacyCatalogSeed: CatalogRecord[] = groups.flatMap((group) =>
  group.residues.map((record, index) => {
    const structures = getStructures(record.english);
    const sourceId = `legacy-source-${group.id}-${index + 1}`;
    const modificationTags = [
      ...(tagsByLegacyGroup[group.id] ?? []),
      ...inferExtraTags(record),
    ].filter((tag, position, tags) => tags.indexOf(tag) === position);

    return {
      identity: {
        registryId: `legacy-${group.id}-${String(index + 1).padStart(3, "0")}`,
        nameZh: record.name,
        nameEn: record.english,
        abbreviations: [],
        synonyms: [],
        entityKind: classifyEntity(record),
        modificationTags,
        ccdIds: structures.map((structure) => structure.ccd),
        pubchemCids: [],
        casNumbers: [],
        identityStatus: identityStatusFor(record),
      },
      summary: record.effect,
      commercialForms: [],
      effects: [],
      sources: [
        {
          sourceId,
          kind: record.level === "专利证据" ? "patent" : "paper",
          title: record.paper,
          url: record.href,
        },
      ],
      legacyEvidenceRecordId: `${group.id}-${index + 1}`,
    } satisfies CatalogRecord;
  }),
);

export const legacyCatalogSeedSummary = {
  totalRecords: legacyCatalogSeed.length,
  aminoAcidCores: legacyCatalogSeed.filter((record) => record.identity.entityKind === "amino-acid").length,
  backboneSurrogates: legacyCatalogSeed.filter((record) => record.identity.entityKind === "backbone-surrogate").length,
  compositeBuildingBlocks: legacyCatalogSeed.filter((record) => record.identity.entityKind === "composite-building-block").length,
  molecularStrategies: legacyCatalogSeed.filter((record) => record.identity.entityKind === "molecular-strategy").length,
  exactCcdMatches: legacyCatalogSeed.filter((record) => record.identity.identityStatus === "structure-verified").length,
  identityReviewQueue: legacyCatalogSeed.filter((record) => ["identity-pending", "ambiguous"].includes(record.identity.identityStatus)).length,
};
