import batch10Review from "../public/ccd-pdb-manual-review-batch-10.json";

const acceptedClasses = new Set(["evidence-reviewed-residue", "special-reference"]);

export const pdbBatch10EvidenceRecords = batch10Review.records.filter((record) => acceptedClasses.has(record.componentClass));

export const pdbBatch10Residues = pdbBatch10EvidenceRecords.map((record) => ({
  name: record.componentClass === "evidence-reviewed-residue"
    ? `已确认非天然残基 · CCD ${record.ccdId}`
    : `特殊用途构件 · CCD ${record.ccdId}`,
  english: `CCD ${record.ccdId}`,
  effect: record.componentClass === "evidence-reviewed-residue"
    ? "已通过代表PDB条目及其聚合物序列确认作为非天然残基进入肽链；具体性质仍取决于序列和位置。"
    : "已确认实际出现在蛋白工程、肽模拟、折叠体或特殊修饰体系中，不按普通肽合成单体推荐。",
  evidence: `${record.conclusion}。PDB ${record.pdbId}记录CCD ${record.ccdId}；该证据不单独证明口服、增渗或商业可得性。`,
  paper: `PDB ${record.pdbId} · CCD ${record.ccdId}`,
  href: `https://www.rcsb.org/structure/${record.pdbId}`,
  level: "实际使用证据" as const,
}));

export const pdbBatch10StructureMappings = Object.fromEntries(
  pdbBatch10EvidenceRecords.map((record) => [`CCD ${record.ccdId}`, { ccd: record.ccdId, label: `CCD ${record.ccdId}` }]),
);

