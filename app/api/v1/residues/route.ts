import { masterRecords } from "../../../master-records";
import { getStructures } from "../../../structure-data";
import { supportScope } from "../../../v22-data";
import { reviewOnlyRecords } from "../../../unified-records";
import { deepReviewByCcd } from "../../../deep-review-data";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    metadata: {
      title: "口服环肽非天然残基证据库主记录",
      version: "3.3",
      releaseDate: "2026-08-31",
      recordCount: masterRecords.length + reviewOnlyRecords.length,
      schema: "ocpr-master-record-v1",
      scope: "53条原研发记录与92条人工审核数据按CCD去重后的统一研发数据库；包含排除记录并明确标注。",
    },
    records: [...masterRecords.map((record) => ({
      id: record.id,
      nameZh: record.name,
      nameEn: record.english,
      categoryId: record.categoryId,
      category: record.category,
      evidenceLevel: record.level,
      supportScope: supportScope(record),
      effectSummary: record.effect,
      evidenceSummary: record.evidence,
      primarySource: { citation: record.paper, url: record.href },
      secondarySource: record.secondary ? { citation: record.secondary.paper, url: record.secondary.href, evidenceLevel: record.secondary.level } : null,
      ccdStructures: getStructures(record.english),
      internalConceptId: getStructures(record.english).length ? null : `OCP-X-${record.id.replace("OCPR", "")}`,
      recordVersion: record.recordVersion,
      reviewedAt: record.reviewedAt,
      detailPath: `/residue/${record.slug}/`,
      recordOrigin: "original-curated",
      deepReview: getStructures(record.english).map((structure) => deepReviewByCcd.get(structure.ccd.toUpperCase())).find((item) => item !== undefined) ?? null,
    })), ...reviewOnlyRecords.map((record) => ({
      id: record.id,
      nameZh: null,
      nameEn: record.name,
      categoryId: `review-${record.grade.toLowerCase()}`,
      category: record.grade === "A" ? "环肽应用记录" : record.grade === "B" ? "肽中使用候选" : record.grade === "C" ? "特殊构件" : "排除记录",
      evidenceLevel: `审核${record.grade}`,
      supportScope: record.grade === "A" ? ["环肽使用"] : record.grade === "B" ? ["肽中使用"] : record.grade === "C" ? ["受限使用"] : ["排除"],
      effectSummary: record.recommendation,
      evidenceSummary: record.conclusion,
      synthesisEvidence: record.synthesisEvidence,
      cyclicEvidence: record.cyclicEvidence,
      oralEvidence: record.oralEvidence,
      primarySource: record.sources[0] ? { citation: record.sources[0].title, url: record.sources[0].url } : null,
      secondarySources: record.sources.slice(1).map((source) => ({ citation: source.title, url: source.url, evidenceType: source.evidenceType })),
      ccdStructures: [{ ccd: record.ccdId, label: record.name }],
      recordVersion: "3.3",
      reviewedAt: "2026-08-28",
      detailPath: null,
      recordOrigin: "merged-92-review",
    }))],
  });
}
