import { deepReviewByCcd, deepReviewRecords, type DeepReviewRecord } from "./deep-review-data";
import { masterRecords, type MasterRecord } from "./master-records";
import { getStructures } from "./structure-data";

export type MergedReviewRecord = DeepReviewRecord & { id: string };
export type UnifiedRecord = { kind: "master"; record: MasterRecord; review?: DeepReviewRecord } | { kind: "review"; record: MergedReviewRecord };

export const linkedDeepReviewCcdIds = new Set(masterRecords.flatMap((record) => getStructures(record.english).map((structure) => structure.ccd.toUpperCase())));
export const reviewOnlyRecords: MergedReviewRecord[] = deepReviewRecords.filter((record) => !linkedDeepReviewCcdIds.has(record.ccdId.toUpperCase())).map((record, index) => ({ ...record, id: `OCPR${String(masterRecords.length + index + 1).padStart(6, "0")}` }));
export const allUnifiedRecords: UnifiedRecord[] = [
  ...masterRecords.map((record): UnifiedRecord => ({ kind: "master", record, review: getStructures(record.english).map((structure) => deepReviewByCcd.get(structure.ccd.toUpperCase())).find((item) => item !== undefined) })),
  ...reviewOnlyRecords.map((record): UnifiedRecord => ({ kind: "review", record })),
];
