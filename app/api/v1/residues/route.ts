import { propertyEvidenceMasterRecords } from "../../../master-records";
import { getStructures } from "../../../structure-data";
import { experimentData, supportScope } from "../../../v22-data";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    metadata: {
      title: "口服环肽性质改善研发证据",
      version: "5.1",
      releaseDate: "2026-09-02",
      recordCount: propertyEvidenceMasterRecords.length,
      schema: "ocpr-property-evidence-v1",
      scope: "仅包含具有实验性质终点的正式研发证据。身份确认、PDB出现、专利列举和一般使用资料不在本API中计数。",
      historicalAudit: "/ccd-research-evidence-alignment.csv",
    },
    records: propertyEvidenceMasterRecords.map((record) => {
      const experiment = experimentData[record.english];
      const structures = getStructures(record.english);
      return {
        id: record.id,
        nameZh: record.name,
        nameEn: record.english,
        categoryId: record.categoryId,
        category: record.category,
        recordType: record.recordType,
        evidenceLevel: record.level === "直接证据" || record.level === "改造证据"
          ? "直接性质实验"
          : record.level === "专利证据"
            ? "专利性质实例"
            : "完整分子性质证据",
        sourceEvidenceLevel: record.level,
        measuredProperties: supportScope(record),
        experiment: experiment ? {
          comparison: experiment.comparison,
          endpoint: experiment.endpoint,
          result: experiment.result,
          system: experiment.system,
          attributionBoundary: experiment.formulation,
        } : null,
        effectSummary: record.effect,
        evidenceSummary: record.evidence,
        primarySource: { citation: record.paper, url: record.href },
        secondarySource: record.secondary ? { citation: record.secondary.paper, url: record.secondary.href, evidenceLevel: record.secondary.level } : null,
        ccdStructures: structures,
        internalConceptId: structures.length ? null : `OCP-X-${record.id.replace("OCPR", "")}`,
        recordVersion: record.recordVersion,
        reviewedAt: record.reviewedAt,
        detailPath: `/residue/${record.slug}/`,
      };
    }),
  });
}
