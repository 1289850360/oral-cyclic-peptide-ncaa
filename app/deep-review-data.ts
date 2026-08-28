import payload from "../public/ccd-manual-review-92-final.json";

export type DeepReviewSource = { title: string; url: string; evidenceType: string };
export type DeepReviewRecord = {
  ccdId: string;
  name: string;
  grade: "A" | "B" | "C" | "EXCLUDE";
  gradeLabel: string;
  conclusion: string;
  synthesisEvidence: string;
  cyclicEvidence: string;
  oralEvidence: string;
  recommendation: string;
  sources: DeepReviewSource[];
};

export const deepReviewRecords = payload.records as DeepReviewRecord[];
export const deepReviewByCcd = new Map(deepReviewRecords.map((record) => [record.ccdId.toUpperCase(), record]));
