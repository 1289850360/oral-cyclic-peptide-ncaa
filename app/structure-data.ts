export type StructureRecord = {
  ccd: string;
  label: string;
};

// Only exact, stereochemically compatible CCD matches are listed here. Combined
// strategies and ambiguous patent building blocks intentionally have no image.
export const structuresByEnglish: Record<string, StructureRecord> = {
  "N-Me-D-Leu": { ccd: "MLU", label: "N-methyl-D-leucine" },
  "N-Me-Leu": { ccd: "MLE", label: "N-methyl-L-leucine" },
  "N-Me-Ile": { ccd: "IML", label: "N-methyl-L-isoleucine" },
  "N-Me-Ser": { ccd: "5JP", label: "N-methyl-L-serine" },
  "N-Me-Asp": { ccd: "SOQ", label: "N-methyl-L-aspartate" },
  "N-Me-Tyr": { ccd: "YNM", label: "N-methyl-L-tyrosine" },
  "N-Me-Lys": { ccd: "NMK", label: "N-methyl-L-lysine" },
  "N-Me-Phe": { ccd: "MEA", label: "N-methyl-L-phenylalanine" },
  "N-Me-Val": { ccd: "MVA", label: "N-methyl-L-valine" },
  "Sarcosine · Sar · N-Me-Gly": { ccd: "SAR", label: "sarcosine" },
  "D-Pro": { ccd: "DPR", label: "D-proline" },
  "D-Ala": { ccd: "DAL", label: "D-alanine" },
  "D-Val": { ccd: "DVA", label: "D-valine" },
  "D-Leu": { ccd: "DLE", label: "D-leucine" },
  "D-Ile": { ccd: "DIL", label: "D-isoleucine" },
  "D-Phe": { ccd: "DPN", label: "D-phenylalanine" },
  "Aib · α-aminoisobutyric acid": { ccd: "AIB", label: "α-aminoisobutyric acid" },
  "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid": { ccd: "STA", label: "statine" },
  "Aze · azetidine-2-carboxylic acid": { ccd: "02A", label: "L-azetidine-2-carboxylic acid" },
  "Nva · norvaline": { ccd: "NVA", label: "L-norvaline" },
  "Cha · cyclohexylalanine": { ccd: "HAC", label: "L-cyclohexylalanine" },
  "O-Me-Tyr · O-methyl-L-tyrosine": { ccd: "0A1", label: "O-methyl-L-tyrosine" },
  "(3S)-3-hydroxy-L-proline · 3-Hyp": { ccd: "HY3", label: "3-hydroxy-L-proline" },
  "3-Cl-Phe · 3-chloro-L-phenylalanine": { ccd: "FCL", label: "3-chloro-L-phenylalanine" },
  "Ac5c · 1-aminocyclopentane-1-carboxylic acid": { ccd: "AC5", label: "1-aminocyclopentane-1-carboxylic acid" },
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine": { ccd: "BMT", label: "MeBmt" },
  "trans-4-F-Pro · (2S,4R)-4-fluoroproline": { ccd: "FP9", label: "trans-4-fluoro-L-proline" },
  "4-Hyp · trans-4-hydroxy-L-proline": { ccd: "HYP", label: "trans-4-hydroxy-L-proline" },
  "Orn · L-ornithine": { ccd: "ORN", label: "L-ornithine" },
  "Dap · L-2,3-diaminopropionic acid": { ccd: "DPP", label: "L-2,3-diaminopropionic acid" },
  "Hph · L-homophenylalanine": { ccd: "HPE", label: "L-homophenylalanine" },
  "2-Nal · 2-naphthylalanine": { ccd: "NAL", label: "L-2-naphthylalanine" },
};

export const ccdImageUrl = (ccd: string) => `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccd}_500.svg`;
export const ccdEntryUrl = (ccd: string) => `https://www.rcsb.org/ligand/${ccd}`;
