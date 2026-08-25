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
  "N-Me-Ala / D-N-Me-Ala": { ccd: "MAA", label: "N-methyl-L-alanine" },
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": { ccd: "4FB", label: "cis-4-fluoro-L-proline" },
  "Tle / Tbg · tert-leucine / tert-butylglycine": { ccd: "TBG", label: "L-tert-leucine (tert-butylglycine)" },
  "5-F-Trp · 5-fluoro-L-tryptophan": { ccd: "FTR", label: "5-fluoro-L-tryptophan" },
  "2-Me-Pro · 2-methyl-L-proline": { ccd: "3WX", label: "2-methyl-L-proline" },
  "AmPhe · 3-(aminomethyl)-L-phenylalanine": { ccd: "A1CHA", label: "3-(aminomethyl)-L-phenylalanine" },
  "Abu · L-2-aminobutyric acid": { ccd: "ABA", label: "L-α-aminobutyric acid" },
};

export const additionalStructuresByEnglish: Record<string, StructureRecord[]> = {
  "N-Me-Ala / D-N-Me-Ala": [{ ccd: "33X", label: "N-methyl-D-alanine" }],
};

export const structureNotesByEnglish: Record<string, string> = {
  "N-Me-Thr": "CCD 中未找到与 N-甲基-L-苏氨酸立体化学完全一致的单体；O7A 对应 N-甲基-L-别苏氨酸，不能替代展示。",
  "N-Me-D-Trp": "CCD 的 E9M 对应 N-甲基-L-色氨酸；当前条目为 D-构型，因此不使用该图。",
  "β-homoproline · β-HPro": "原始来源使用 β-HPro 缩写，但当前记录未给出可与 CCD 唯一匹配的绝对构型。",
  "(1R,2S)-2-ACPC · β¹": "CCD 中可检索到其他 2-氨基环戊烷羧酸立体异构体，但未找到与 (1R,2S) 完全一致的条目。",
  "(1S,2S)-2-ACHC · β²": "未找到与条目所示绝对构型完全一致的独立 CCD 单体。",
  "NLeu peptoid · N-isobutylglycine": "该 peptoid 单体尚未找到可唯一对应的 CCD 条目。",
  "Pye · N,N-pyrrolidinylglutamine": "Pye 是论文设计的侧链-主链氢键构件，尚未找到可唯一对应的 CCD 单体。",
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": "CCD 可检索到 D-构型 4-AmPhe（1G8），但当前条目为 L-构型，不能混用。",
  "Pal · pyridylalanine": "Pal 可指 3-或 4-吡啶基丙氨酸；当前来源记录未在条目名称中固定异构体，因此不配唯一结构。",
  "N-substituted 5-F-Trp": "该构件同时包含吲哚 N-取代与骨架交联，不能用游离 5-F-Trp（FTR）代表。",
  "D-Dap(tail) · side-chain-acylated D-2,3-diaminopropionic acid": "该记录指侧链已酰化并连接增溶尾部的构件，不是游离 D-Dap 单体。",
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph": "一条记录包含两个不同芳香取代物，且尚无两个结构均可精确核对的 CCD 条目。",
  "hydroxy-acid / depsipeptide substitution": "这是酰胺→酯的骨架替换策略，不对应一种固定氨基酸单体。",
  "thioamide substitution": "这是 C=O→C=S 的骨架替换策略，不对应一种固定氨基酸单体。",
};

export const getStructures = (english: string): StructureRecord[] => {
  const primary = structuresByEnglish[english];
  return primary ? [primary, ...(additionalStructuresByEnglish[english] ?? [])] : [];
};

export const ccdImageUrl = (ccd: string) => `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccd}_500.svg`;
export const ccdEntryUrl = (ccd: string) => `https://www.rcsb.org/ligand/${ccd}`;
