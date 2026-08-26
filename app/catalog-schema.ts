/**
 * Normalized data model for the expanded non-canonical amino-acid atlas.
 *
 * A catalog record represents one unprotected core chemical structure with
 * defined stereochemistry. Protected forms, salts, esters and vendor packs are
 * attached to that core record and must never be counted as new residues.
 */

export type CatalogEntityKind =
  | "amino-acid"
  | "backbone-surrogate"
  | "composite-building-block"
  | "molecular-strategy";

export type IdentityStatus =
  | "structure-verified"
  | "source-verified"
  | "identity-pending"
  | "ambiguous";

export type ModificationTag =
  | "d-configuration"
  | "n-substitution"
  | "alpha-substitution"
  | "extended-backbone"
  | "conformational-constraint"
  | "hydrophobic-aromatic"
  | "halogen-electronic"
  | "polar-charged"
  | "crosslink-conjugation"
  | "natural-product"
  | "backbone-isostere";

export type PropertyName =
  | "passive-permeability"
  | "aqueous-solubility"
  | "protease-stability"
  | "metabolic-stability"
  | "hydrophobicity"
  | "exposed-polarity"
  | "backbone-hbd"
  | "conformational-rigidity"
  | "intramolecular-hydrogen-bonding"
  | "target-binding"
  | "crosslinking-capability"
  | "synthesis-feasibility";

export type EffectDirection =
  | "increase"
  | "decrease"
  | "mixed"
  | "position-dependent"
  | "unknown";

export type AssertionBasis =
  | "structure-certain"
  | "class-inference"
  | "direct-substitution"
  | "complete-scaffold"
  | "patent-example"
  | "patent-scope"
  | "clinical-scaffold";

export type SourceKind =
  | "ccd"
  | "pubchem"
  | "vendor"
  | "paper"
  | "patent"
  | "drug-label"
  | "review";

export type SourceReference = {
  sourceId: string;
  kind: SourceKind;
  title: string;
  url: string;
  accessedOn?: string;
  locator?: string;
};

export type CatalogIdentity = {
  registryId: string;
  nameZh: string;
  nameEn: string;
  abbreviations: string[];
  synonyms: string[];
  parentAminoAcid?: string;
  entityKind: CatalogEntityKind;
  backboneClass?: "alpha" | "beta" | "gamma" | "delta" | "peptoid" | "other";
  configuration?: string;
  modificationTags: ModificationTag[];
  isomericSmiles?: string;
  inchiKey?: string;
  molecularFormula?: string;
  molecularWeight?: number;
  ccdIds: string[];
  pubchemCids: string[];
  casNumbers: string[];
  identityStatus: IdentityStatus;
  identityNote?: string;
};

export type CommercialForm = {
  vendor: string;
  catalogNumber?: string;
  productName: string;
  protection?: string[];
  saltOrSolvate?: string;
  productUrl?: string;
  availabilityCheckedOn?: string;
};

export type PropertyAssertion = {
  property: PropertyName;
  direction: EffectDirection;
  basis: AssertionBasis;
  confidence: "high" | "medium" | "low";
  statement: string;
  sourceIds: string[];
  context?: string;
};

export type CmcProfile = {
  sppsCompatibility?: "routine" | "special-conditions" | "difficult" | "unknown";
  couplingRisk?: string;
  racemizationRisk?: string;
  dkpRisk?: string;
  protectionNotes?: string;
  deprotectionNotes?: string;
};

export type CatalogRecord = {
  identity: CatalogIdentity;
  summary?: string;
  commercialForms: CommercialForm[];
  effects: PropertyAssertion[];
  cmc?: CmcProfile;
  sources: SourceReference[];
  legacyEvidenceRecordId?: string;
};

export const catalogTaxonomy: Array<{
  id: ModificationTag;
  label: string;
  scope: string;
}> = [
  { id: "d-configuration", label: "D-构型", scope: "与相应L型分开计数，并保留绝对构型。" },
  { id: "n-substitution", label: "N-取代", scope: "N-甲基、其他N-烷基及peptoid类构件。" },
  { id: "alpha-substitution", label: "α-取代", scope: "α-甲基、α,α-二取代及环状α位构件。" },
  { id: "extended-backbone", label: "延长骨架", scope: "β、γ、δ氨基酸及其他主链延长构件。" },
  { id: "conformational-constraint", label: "构象限制", scope: "Pro同系物、稠环、桥环和螺环残基。" },
  { id: "hydrophobic-aromatic", label: "疏水／芳香侧链", scope: "侧链同系化、芳环扩展和大疏水基团。" },
  { id: "halogen-electronic", label: "卤代／电子调节", scope: "F、Cl、Br、I、CF3、CN等侧链电子修饰。" },
  { id: "polar-charged", label: "极性／带电侧链", scope: "额外胺、酸、羟基及杂芳环等极性调节。" },
  { id: "crosslink-conjugation", label: "交联／偶联", scope: "烯基、炔基、叠氮、硫醇及双官能团把手。" },
  { id: "natural-product", label: "天然产物特有残基", scope: "非蛋白源天然产物和临床骨架特有构件。" },
  { id: "backbone-isostere", label: "骨架等排替换", scope: "保留在扩展工具箱中，但不计入氨基酸核心数量。" },
];
