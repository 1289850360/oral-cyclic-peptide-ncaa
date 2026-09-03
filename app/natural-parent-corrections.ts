import correctionData from "../public/natural-parent-corrections.json";
import type { NaturalParentModification } from "./natural-parent-modifications";

type CorrectionRecord = (typeof correctionData.records)[number];

const signed = (value: number, unit = "") => `${value > 0 ? "+" : ""}${value}${unit}`;

export const naturalParentCorrectionByCcd: Record<string, CorrectionRecord> = Object.fromEntries(
  correctionData.records.map((record) => [record.ccdId, record]),
);

export function applyNaturalParentCorrection(
  record: NaturalParentModification,
  correction: CorrectionRecord,
): NaturalParentModification {
  const delta = correction.descriptorDeltas;
  const sources = record.sources
    .filter((source) => !source.title.includes("天然母体"))
    .map((source) => source.title.startsWith(`RCSB CCD ${correction.ccdId}`)
      ? { ...source, supports: "确认衍生物名称、结构和立体化学" }
      : source);
  sources.splice(1, 0, {
    title: `RCSB CCD ${correction.correctedParent} · 天然母体`,
    url: `https://www.rcsb.org/ligand/${correction.correctedParent}`,
    supports: "确认人工复核后采用的天然氨基酸母体结构",
  });
  return {
    ...record,
    reviewStatus: "semantic-resolved",
    naturalParent: `${correction.parentName}（CCD ${correction.correctedParent}）`,
    naturalParentCcd: correction.correctedParent,
    relationship: `人工复核修正：${correction.rationale} 因此这里采用${correction.correctedParent}作为天然母体，不沿用相互冲突的CCD父级字段。`,
    changeLabel: correction.changeLabel,
    changedPosition: correction.changedPosition,
    structuralChange: `${correction.changeDescription} 相对修正后的天然母体：精确分子量${signed(delta.exactmw, " Da")}，氢键供体${signed(delta.NumHBD)}，氢键受体${signed(delta.NumHBA)}，拓扑极性表面积${signed(delta.tpsa, " Å²")}，计算脂水分配系数${signed(delta.CrippenClogP)}，可旋转键${signed(delta.NumRotatableBonds)}，环数${signed(delta.NumRings)}。`,
    directlyCausedProperties: [
      `结构直接变化：氢键供体${signed(delta.NumHBD)}、氢键受体${signed(delta.NumHBA)}、极性表面积${signed(delta.tpsa, " Å²")}。`,
      `计算趋势：脂水分配系数${signed(delta.CrippenClogP)}、可旋转键${signed(delta.NumRotatableBonds)}、环数${signed(delta.NumRings)}。这些是相对修正后母体的结构计算，不是性质实验。`,
      "尚无单残基性质对照，不能把上述计算变化直接写成渗透性、稳定性或口服吸收改善。",
    ],
    sources,
  };
}
