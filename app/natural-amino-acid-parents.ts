export type NaturalAminoAcidParent = {
  ccd: string;
  symbol: string;
  name: string;
  english: string;
  group: "20种标准氨基酸" | "特殊编码氨基酸";
};

export const naturalAminoAcidParents: NaturalAminoAcidParent[] = [
  { ccd: "ALA", symbol: "A", name: "丙氨酸", english: "Alanine", group: "20种标准氨基酸" },
  { ccd: "ARG", symbol: "R", name: "精氨酸", english: "Arginine", group: "20种标准氨基酸" },
  { ccd: "ASN", symbol: "N", name: "天冬酰胺", english: "Asparagine", group: "20种标准氨基酸" },
  { ccd: "ASP", symbol: "D", name: "天冬氨酸", english: "Aspartic acid", group: "20种标准氨基酸" },
  { ccd: "CYS", symbol: "C", name: "半胱氨酸", english: "Cysteine", group: "20种标准氨基酸" },
  { ccd: "GLN", symbol: "Q", name: "谷氨酰胺", english: "Glutamine", group: "20种标准氨基酸" },
  { ccd: "GLU", symbol: "E", name: "谷氨酸", english: "Glutamic acid", group: "20种标准氨基酸" },
  { ccd: "GLY", symbol: "G", name: "甘氨酸", english: "Glycine", group: "20种标准氨基酸" },
  { ccd: "HIS", symbol: "H", name: "组氨酸", english: "Histidine", group: "20种标准氨基酸" },
  { ccd: "ILE", symbol: "I", name: "异亮氨酸", english: "Isoleucine", group: "20种标准氨基酸" },
  { ccd: "LEU", symbol: "L", name: "亮氨酸", english: "Leucine", group: "20种标准氨基酸" },
  { ccd: "LYS", symbol: "K", name: "赖氨酸", english: "Lysine", group: "20种标准氨基酸" },
  { ccd: "MET", symbol: "M", name: "甲硫氨酸", english: "Methionine", group: "20种标准氨基酸" },
  { ccd: "PHE", symbol: "F", name: "苯丙氨酸", english: "Phenylalanine", group: "20种标准氨基酸" },
  { ccd: "PRO", symbol: "P", name: "脯氨酸", english: "Proline", group: "20种标准氨基酸" },
  { ccd: "SER", symbol: "S", name: "丝氨酸", english: "Serine", group: "20种标准氨基酸" },
  { ccd: "THR", symbol: "T", name: "苏氨酸", english: "Threonine", group: "20种标准氨基酸" },
  { ccd: "TRP", symbol: "W", name: "色氨酸", english: "Tryptophan", group: "20种标准氨基酸" },
  { ccd: "TYR", symbol: "Y", name: "酪氨酸", english: "Tyrosine", group: "20种标准氨基酸" },
  { ccd: "VAL", symbol: "V", name: "缬氨酸", english: "Valine", group: "20种标准氨基酸" },
  { ccd: "SEC", symbol: "U", name: "硒代半胱氨酸", english: "Selenocysteine", group: "特殊编码氨基酸" },
  { ccd: "PYL", symbol: "O", name: "吡咯赖氨酸", english: "Pyrrolysine", group: "特殊编码氨基酸" },
];

export const naturalAminoAcidParentByCcd = new Map(naturalAminoAcidParents.map((parent) => [parent.ccd, parent]));
