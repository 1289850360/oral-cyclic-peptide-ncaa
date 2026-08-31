import { masterRecords } from "../../../master-records";
import { getStructures } from "../../../structure-data";
import { supportScope } from "../../../v22-data";
import { reviewOnlyRecords } from "../../../unified-records";
import { deepReviewByCcd } from "../../../deep-review-data";

export const dynamic = "force-static";

const unifiedEvidence = {
  direct: { id: "direct-effect", label: "1级｜直接效果证据" },
  whole: { id: "whole-molecule", label: "2级｜完整分子证据" },
  used: { id: "use-confirmed", label: "3级｜已确认实际使用" },
  lead: { id: "design-lead", label: "4级｜设计线索" },
  excluded: { id: "excluded", label: "排除｜非独立单体" },
} as const;

const masterUnifiedEvidence = (level: string, reviewGrade?: string) => level === "直接证据" || level === "改造证据" ? unifiedEvidence.direct : level === "骨架证据" || level === "临床骨架" ? unifiedEvidence.whole : reviewGrade === "A" || reviewGrade === "B" ? unifiedEvidence.used : reviewGrade === "EXCLUDE" ? unifiedEvidence.excluded : unifiedEvidence.lead;
const reviewUnifiedEvidence = (grade: string) => grade === "A" || grade === "B" ? unifiedEvidence.used : grade === "C" ? unifiedEvidence.lead : unifiedEvidence.excluded;

export function GET() {
  return Response.json({
    metadata: {
      title: "口服环肽非天然残基证据库主记录",
      version: "3.3",
      releaseDate: "2026-08-31",
      recordCount: masterRecords.length + reviewOnlyRecords.length,
      schema: "ocpr-master-record-v1",
      ccdFirstModel: true,
      evidenceModel: "1级直接效果／2级完整分子／3级实际使用／4级设计线索；非独立单体单列为排除",
      scope: "以CCD结构为主键，合并53条原研发记录、92条审核中去重后的86条新增记录，以及20条核心结构审核记录；特殊构件、排除记录与无唯一CCD概念分别标注。",
    },
    records: [...masterRecords.map((record) => {
      const deepReview = getStructures(record.english).map((structure) => deepReviewByCcd.get(structure.ccd.toUpperCase())).find((item) => item !== undefined);
      const tier = masterUnifiedEvidence(record.level, deepReview?.grade);
      return ({
      id: record.id,
      nameZh: record.name,
      nameEn: record.english,
      categoryId: record.categoryId,
      category: record.category,
      evidenceLevel: tier.label,
      evidenceTier: tier.id,
      sourceEvidenceLevel: record.level,
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
      deepReview: deepReview ?? null,
    }); }), ...reviewOnlyRecords.map((record) => {
      const tier = reviewUnifiedEvidence(record.grade);
      return ({
      id: record.id,
      nameZh: null,
      nameEn: record.name,
      categoryId: `review-${record.grade.toLowerCase()}`,
      category: record.grade === "A" ? "环肽应用记录" : record.grade === "B" ? "肽中使用候选" : record.grade === "C" ? "特殊构件" : "排除记录",
      evidenceLevel: tier.label,
      evidenceTier: tier.id,
      sourceEvidenceLevel: `审核${record.grade}`,
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
      reviewedAt: record.reviewedAt,
      detailPath: null,
      recordOrigin: record.recordOrigin,
    }); })],
  });
}
