export type CcdDisplayCorrection = {
  systematicName: string;
  sourceName: string;
  note: string;
};

// A few legacy CCD preferred names do not describe the deposited structure as
// precisely as the systematic name shown on the same RCSB record.  We preserve
// the source name for traceability, but use the structure-consistent name in
// the interface so the label and drawing do not contradict each other.
export const ccdDisplayCorrectionById: Record<string, CcdDisplayCorrection> = {
  AZK: {
    systematicName: "(2S)-2-amino-6-azidohexan-1-ol",
    sourceName: "(S)-2-AMINO-6-AZIDOHEXANOIC ACID",
    note: "RCSB常用名写成羧酸，但其系统命名、分子式和SMILES均为氨基醇；页面按结构式显示系统命名。",
  },
  CR0: {
    systematicName: "2-[(2R)-2-[(1S,2R)-1-amino-2-hydroxypropyl]-4-(2-methylpropyl)-2-hydroxy-5-oxoimidazol-1-yl]acetic acid",
    sourceName: "[2-(1-AMINO-2-HYDROXYPROPYL)-2-HYDROXY-4-ISOBUTYL-5-OXO-2,5-DIHYDRO-1H-IMIDAZOL-1-YL]ACETALDEHYDE",
    note: "RCSB常用名写有乙醛，但系统命名、分子式和SMILES显示的是乙酸端基；页面按结构式显示系统命名。",
  },
  MDF: {
    systematicName: "methyl (2S)-2-amino-2-(3,5-dihydroxyphenyl)acetate",
    sourceName: "META, META'-DI-HYDROXY-PHENYLALANINE",
    note: "RCSB常用名会让人误以为是游离二羟基苯丙氨酸；系统命名和SMILES显示的是二羟基苯基甘氨酸甲酯。",
  },
  PR3: {
    systematicName: "(2R)-2-amino-3-(propyldisulfanyl)propanal",
    sourceName: "S,S-PROPYLTHIOCYSTEINE",
    note: "RCSB常用名较简略；系统命名和SMILES表明羧基端已变为醛，不能按普通半胱氨酸单体理解。",
  },
  SET: {
    systematicName: "(2S)-2-amino-3-hydroxypropanamide",
    sourceName: "AMINOSERINE",
    note: "RCSB常用名较简略；系统命名和SMILES表明羧基端为酰胺。",
  },
  V3E: {
    systematicName: "methyl (2S)-2-amino-3-(2-hydroxyphenyl)propanoate",
    sourceName: "(2S)-2-amino-3-(2-hydroxyphenyl)propanoic acid",
    note: "RCSB常用名写成游离羧酸，但系统命名、分子式和SMILES均显示为甲酯；页面按结构式显示系统命名。",
  },
};

export const displayNameForCcd = (ccdId: string, sourceName: string) =>
  ccdDisplayCorrectionById[ccdId.toUpperCase()]?.systematicName ?? sourceName;
