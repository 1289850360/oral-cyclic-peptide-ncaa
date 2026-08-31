// Exact CCD mappings for the 53 original curated research records.
// Records without a unique CCD stay in the evidence layer and are listed separately.
export const originalResearchLinks = [
  ["MLU", "OCPR000001", "骨架证据", "N-Me-D-Leu"], ["MLE", "OCPR000002", "直接证据", "N-Me-Leu"],
  ["IML", "OCPR000003", "直接证据", "N-Me-Ile"], ["MAA", "OCPR000004", "直接证据", "N-Me-Ala / D-N-Me-Ala"],
  ["33X", "OCPR000004", "直接证据", "N-Me-Ala / D-N-Me-Ala"], ["5JP", "OCPR000006", "直接证据", "N-Me-Ser"],
  ["SOQ", "OCPR000007", "直接证据", "N-Me-Asp"], ["YNM", "OCPR000008", "直接证据", "N-Me-Tyr"],
  ["NMK", "OCPR000010", "直接证据", "N-Me-Lys"], ["MEA", "OCPR000011", "骨架证据", "N-Me-Phe"],
  ["MVA", "OCPR000012", "临床骨架", "N-Me-Val"], ["SAR", "OCPR000013", "临床骨架", "Sarcosine · Sar · N-Me-Gly"],
  ["DPR", "OCPR000014", "直接证据", "D-Pro"], ["DAL", "OCPR000015", "骨架证据", "D-Ala"],
  ["DVA", "OCPR000016", "骨架证据", "D-Val"], ["DLE", "OCPR000017", "直接证据", "D-Leu"],
  ["DIL", "OCPR000018", "专利证据", "D-Ile"], ["DPN", "OCPR000019", "专利证据", "D-Phe"],
  ["AIB", "OCPR000020", "直接证据", "Aib"], ["STA", "OCPR000021", "直接证据", "Statine"],
  ["4FB", "OCPR000027", "专利证据", "cis-4-F-Pro"], ["02A", "OCPR000029", "专利证据", "Aze"],
  ["NVA", "OCPR000030", "专利证据", "Norvaline"], ["TBG", "OCPR000031", "专利证据", "Tert-leucine"],
  ["ALC", "OCPR000032", "专利证据", "Cyclohexylalanine"], ["FP9", "OCPR000033", "专利证据", "trans-4-F-Pro"],
  ["HYP", "OCPR000034", "专利证据", "4-Hyp"], ["ORN", "OCPR000035", "专利证据", "Ornithine"],
  ["DPP", "OCPR000036", "专利证据", "Dap"], ["HPE", "OCPR000037", "专利证据", "Homophenylalanine"],
  ["NAL", "OCPR000038", "专利证据", "2-Nal"], ["FTR", "OCPR000039", "专利证据", "5-F-Trp"],
  ["0A1", "OCPR000041", "临床骨架", "O-Me-Tyr"], ["3WX", "OCPR000043", "临床骨架", "2-Me-Pro"],
  ["A1CHA", "OCPR000044", "临床骨架", "AmPhe"], ["HY3", "OCPR000045", "临床骨架", "3-Hyp"],
  ["FCL", "OCPR000047", "骨架证据", "3-Cl-Phe"], ["AC5", "OCPR000049", "临床骨架", "Ac5c"],
  ["BMT", "OCPR000050", "临床骨架", "MeBmt"], ["ABA", "OCPR000051", "临床骨架", "Abu"],
].map(([ccdId, recordId, evidenceLevel, name]) => ({ ccdId, recordId, evidenceLevel, name }));

export const originalUnmappedResearchRecords = [
  ["OCPR000005", "N-Me-Thr", "直接证据"], ["OCPR000009", "N-Me-D-Trp", "骨架证据"],
  ["OCPR000022", "β-homoproline · β-HPro", "骨架证据"], ["OCPR000023", "(1R,2S)-2-ACPC · β¹", "直接证据"],
  ["OCPR000024", "(1S,2S)-2-ACHC · β²", "骨架证据"], ["OCPR000025", "NLeu peptoid · N-isobutylglycine", "直接证据"],
  ["OCPR000026", "Pye · N,N-pyrrolidinylglutamine", "直接证据"], ["OCPR000028", "4-AmPhe · 4-(aminomethyl)-L-phenylalanine", "专利证据"],
  ["OCPR000040", "Pal · pyridylalanine", "骨架证据"], ["OCPR000042", "N-substituted 5-F-Trp", "临床骨架"],
  ["OCPR000046", "D-Dap(tail)", "临床骨架"], ["OCPR000048", "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph", "骨架证据"],
  ["OCPR000052", "hydroxy-acid / depsipeptide substitution", "改造证据"], ["OCPR000053", "thioamide substitution", "改造证据"],
].map(([recordId, name, evidenceLevel]) => ({ recordId, name, evidenceLevel }));

export const evidenceConfirmsUse = (level) => ["直接证据", "骨架证据", "临床骨架"].includes(level);
