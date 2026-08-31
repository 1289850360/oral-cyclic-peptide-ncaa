import { deepReviewByCcd, deepReviewRecords, type DeepReviewRecord } from "./deep-review-data";
import { masterRecords, type MasterRecord } from "./master-records";
import { getStructures } from "./structure-data";
import coreBatch1 from "../public/ccd-core-priority-review-batch-1.json";
import coreBatch2 from "../public/ccd-core-priority-review-batch-2.json";

export type MergedReviewRecord = DeepReviewRecord & { id: string; recordOrigin: "merged-92-review" | "core-priority-review"; reviewedAt: string };
export type UnifiedRecord = { kind: "master"; record: MasterRecord; review?: DeepReviewRecord } | { kind: "review"; record: MergedReviewRecord };

export const linkedDeepReviewCcdIds = new Set(masterRecords.flatMap((record) => getStructures(record.english).map((structure) => structure.ccd.toUpperCase())));
const deepReviewOnlyRecords: MergedReviewRecord[] = deepReviewRecords.filter((record) => !linkedDeepReviewCcdIds.has(record.ccdId.toUpperCase())).map((record, index) => ({ ...record, id: `OCPR${String(masterRecords.length + index + 1).padStart(6, "0")}`, recordOrigin: "merged-92-review", reviewedAt: "2026-08-28" }));
const existingEvidenceCcdIds = new Set([...linkedDeepReviewCcdIds, ...deepReviewRecords.map((record) => record.ccdId.toUpperCase())]);
const coreEvidenceSource = [...coreBatch1.records, ...coreBatch2.records].filter((record) => ["A", "B"].includes(record.grade) && !existingEvidenceCcdIds.has(record.ccdId.toUpperCase()));
export const coreEvidenceRecords: MergedReviewRecord[] = coreEvidenceSource.map((record, index) => ({
  id: `OCPR${String(masterRecords.length + deepReviewOnlyRecords.length + index + 1).padStart(6, "0")}`,
  ccdId: record.ccdId,
  name: record.name,
  grade: record.grade as "A" | "B",
  gradeLabel: record.grade === "A" ? "A级：有直接环肽／宏环使用证据" : "B级：有肽中使用证据",
  conclusion: record.conclusion,
  synthesisEvidence: record.synthesisEvidence,
  cyclicEvidence: record.cyclicEvidence,
  oralEvidence: record.oralEvidence,
  recommendation: record.recommendation,
  sources: record.sources,
  recordOrigin: "core-priority-review",
  reviewedAt: record.reviewedAt,
}));
export const reviewOnlyRecords: MergedReviewRecord[] = [...deepReviewOnlyRecords, ...coreEvidenceRecords];
export const allUnifiedRecords: UnifiedRecord[] = [
  ...masterRecords.map((record): UnifiedRecord => ({ kind: "master", record, review: getStructures(record.english).map((structure) => deepReviewByCcd.get(structure.ccd.toUpperCase())).find((item) => item !== undefined) })),
  ...reviewOnlyRecords.map((record): UnifiedRecord => ({ kind: "review", record })),
];
