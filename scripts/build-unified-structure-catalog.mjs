import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceConfirmsUse, originalResearchLinks, originalUnmappedResearchRecords } from "./research-evidence-links.mjs";
import { pdbBatch9Review, pdbBatch9ReviewByCcd } from "./pdb-batch-9-review.mjs";
import { pdbBatch10Review, pdbBatch10ReviewByCcd } from "./pdb-batch-10-review.mjs";
import { pdbUnresolvedIdentityReview, pdbUnresolvedIdentityReviewByCcd } from "./pdb-unresolved-identity-review.mjs";
import { pendingIdentityReviewBatch1, pendingIdentityReviewBatch1ByCcd } from "./pending-identity-review-batch-1.mjs";
import { pendingIdentityReviewBatch2, pendingIdentityReviewBatch2ByCcd } from "./pending-identity-review-batch-2.mjs";
import { pendingIdentityReviewBatch3, pendingIdentityReviewBatch3ByCcd } from "./pending-identity-review-batch-3.mjs";
import { pendingIdentityReviewBatch4, pendingIdentityReviewBatch4ByCcd } from "./pending-identity-review-batch-4.mjs";
import { pendingIdentityReviewBatch5, pendingIdentityReviewBatch5ByCcd } from "./pending-identity-review-batch-5.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const readJson = async (name) => JSON.parse(await readFile(join(publicDir, name), "utf8"));

const [catalog, catalogUsage, reviewPayload, manualReview, reviewUsage, corePriorityBatch1, corePriorityBatch2, synthesisBatch1, pdbContextAudit, pendingCandidateTriage] = await Promise.all([
  readJson("ccd-development-screen.json"),
  readJson("ccd-polymer-usage-audit.json"),
  readJson("ccd-manual-review-92-final.json"),
  readJson("ccd-manual-review-final.json"),
  readJson("ccd-manual-review-usage-audit.json"),
  readJson("ccd-core-priority-review-batch-1.json"),
  readJson("ccd-core-priority-review-batch-2.json"),
  readJson("ccd-synthesis-usability-batch-1.json"),
  readJson("ccd-pdb-context-audit.json"),
  readJson("ccd-pending-candidate-triage.json"),
]);

const existingCcdIds = new Set(catalog.records.flatMap((record) => record.ccdIds.map((id) => id.toUpperCase())));
const manualByCcd = new Map(manualReview.records.flatMap((record) => record.ccdIds.map((id) => [id.toUpperCase(), record])));
const usageByCcd = new Map(reviewUsage.records.flatMap((record) => record.ccdIds.map((id) => [id.toUpperCase(), record])));

const categoryMeta = {
  "N-取代": ["n-substitution", "N-取代"],
  "D-构型": ["d-configuration", "D-构型"],
  "构象限制": ["conformational-constraint", "构象限制"],
  "延长骨架": ["extended-backbone", "延长骨架"],
  "卤代/电子调节": ["halogen-electronic", "卤代／电子调节"],
  "芳香/疏水侧链": ["hydrophobic-aromatic", "芳香／疏水侧链"],
  "其他候选": ["other", "其他CCD肽链核心"],
};
const gradeMeta = {
  A: { tier: "priority", label: "环肽直接使用" },
  B: { tier: "conditional", label: "肽中使用" },
  C: { tier: "reference", label: "特殊构件" },
  EXCLUDE: { tier: "exclude", label: "非独立单体" },
};

const addedRecords = reviewPayload.records.filter((review) => !existingCcdIds.has(review.ccdId.toUpperCase())).map((review) => {
  const ccdId = review.ccdId.toUpperCase();
  const manual = manualByCcd.get(ccdId);
  if (!manual) throw new Error(`Missing structural review record for ${ccdId}`);
  const [category, categoryLabel] = categoryMeta[manual.classification] ?? categoryMeta["其他候选"];
  const grade = gradeMeta[review.grade];
  return {
    id: `research-linked-${ccdId.toLowerCase()}`,
    ccdIds: [ccdId],
    primaryCcdId: ccdId,
    name: review.name,
    synonyms: manual.synonyms ? String(manual.synonyms).split(";").map((item) => item.trim()).filter(Boolean) : [],
    formula: manual.formula,
    formulaWeight: manual.molecularWeight ?? null,
    parentIds: manual.parentIds ?? [],
    linkageTypes: [manual.componentType || "CCD component"],
    smiles: manual.smiles || "",
    category,
    categoryLabel,
    tags: [categoryLabel, "研发证据关联", grade.label],
    predictedEffects: [grade.label, "研发证据已关联"],
    sourceUrl: `https://www.rcsb.org/ligand/${ccdId}`,
    structureImageUrl: `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ccdId}_500.svg`,
    catalogOrigin: "research-evidence-linked",
    screening: {
      tier: grade.tier,
      reasons: [review.conclusion, review.synthesisEvidence].filter(Boolean),
      cautions: [review.oralEvidence].filter(Boolean),
      manualReviewRequired: false,
    },
  };
});

if (addedRecords.length !== 92) throw new Error(`Expected 92 added CCD records, received ${addedRecords.length}`);

const reviewedCcdIds = new Set(addedRecords.flatMap((record) => record.ccdIds));
const conditionalRecords = manualReview.records.filter((record) => record.finalStatus === "conditional" && record.ccdIds.every((id) => !existingCcdIds.has(id.toUpperCase()) && !reviewedCcdIds.has(id.toUpperCase()))).map((manual) => {
  const ccdIds = manual.ccdIds.map((id) => id.toUpperCase());
  const primaryCcdId = ccdIds[0];
  const [category, categoryLabel] = categoryMeta[manual.classification] ?? categoryMeta["其他候选"];
  return {
    id: `candidate-review-${primaryCcdId.toLowerCase()}`,
    ccdIds,
    primaryCcdId,
    name: manual.name,
    synonyms: manual.synonyms ? String(manual.synonyms).split(";").map((item) => item.trim()).filter(Boolean) : [],
    formula: manual.formula,
    formulaWeight: manual.molecularWeight ?? null,
    parentIds: manual.parentIds ?? [],
    linkageTypes: [manual.componentType || "CCD component"],
    smiles: manual.smiles || "",
    category,
    categoryLabel,
    tags: [categoryLabel, "待验证候选", manual.evidenceStatus === "polymer-only" ? "较长聚合物命中" : "仅结构证据"],
    predictedEffects: ["单体用途待核查", "环肽与口服证据待补充"],
    sourceUrl: manual.ccdLinks || `https://www.rcsb.org/ligand/${primaryCcdId}`,
    structureImageUrl: manual.structureImageLinks || `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${primaryCcdId}_500.svg`,
    catalogOrigin: "conditional-review",
    screening: {
      tier: "conditional",
      reasons: [manual.finalReason, ...(manual.reasons ?? [])].filter(Boolean),
      cautions: [...(manual.cautions ?? []), "尚未完成人工合成、环肽使用和口服证据深审"],
      manualReviewRequired: true,
    },
  };
});

if (conditionalRecords.length !== 286) throw new Error(`Expected 286 conditional CCD records, received ${conditionalRecords.length}`);

const preliminaryRecords = [
  ...catalog.records.map((record) => ({ ...record, catalogOrigin: "core-structure-screen" })),
  ...addedRecords,
  ...conditionalRecords,
];
const coreUsageById = new Map(catalogUsage.records.map((record) => [record.id, record]));
const reviewedByCcd = new Map(reviewPayload.records.map((record) => [record.ccdId.toUpperCase(), record]));
const coreReviewByCcd = new Map([...corePriorityBatch1.records, ...corePriorityBatch2.records].map((record) => [record.ccdId.toUpperCase(), record]));
const synthesisByCcd = new Map(synthesisBatch1.records.map((record) => [record.ccdId.toUpperCase(), record]));
const pdbContextByCcd = new Map(pdbContextAudit.records.map((record) => [record.ccdId.toUpperCase(), record]));
const pendingTriageByCcd = new Map(pendingCandidateTriage.records.map((record) => [record.ccdId.toUpperCase(), record]));
const originalResearchByCcd = new Map(originalResearchLinks.map((record) => [record.ccdId.toUpperCase(), record]));
const researchEvidenceFor = (ccdId) => {
  const entries = [];
  const original = originalResearchByCcd.get(ccdId);
  const deep = reviewedByCcd.get(ccdId);
  const core = coreReviewByCcd.get(ccdId);
  if (original) entries.push({ recordId: original.recordId, level: original.evidenceLevel, name: original.name, origin: "original-curated", confirmsUse: evidenceConfirmsUse(original.evidenceLevel) });
  if (deep) entries.push({ recordId: `CCD-${ccdId}-REVIEW`, level: `审核${deep.grade}`, name: deep.name, origin: "manual-92-review", confirmsUse: ["A", "B"].includes(deep.grade) });
  if (core && ["A", "B"].includes(core.grade)) entries.push({ recordId: `CCD-${ccdId}-CORE`, level: `核心审核${core.grade}`, name: core.name, origin: "core-priority-review", confirmsUse: true });
  return entries;
};
const evidenceProfileFor = (record) => {
  const reviewed = reviewedByCcd.get(record.primaryCcdId);
  const coreReviewed = coreReviewByCcd.get(record.primaryCcdId);
  const coreUsage = coreUsageById.get(record.id);
  const conditional = manualByCcd.get(record.primaryCcdId);
  const usageStatus = coreReviewed
    ? (coreReviewed.grade === "A" || coreReviewed.grade === "B" ? "confirmed" : "not-found")
    : reviewed
    ? (reviewed.grade === "A" || reviewed.grade === "B" ? "confirmed" : reviewed.grade === "C" ? "limited" : "not-applicable")
    : coreUsage
      ? (coreUsage.status === "no-polymer-hit" ? "not-found" : "confirmed")
      : conditional?.evidenceStatus === "polymer-only" ? "confirmed" : conditional ? "not-found" : "not-reviewed";
  const usageLabel = coreReviewed
    ? (coreReviewed.grade === "A" || coreReviewed.grade === "B" ? "肽中使用已人工核对" : "尚未找到肽中使用证据")
    : reviewed
    ? (reviewed.grade === "A" || reviewed.grade === "B" ? "肽中使用已人工核对" : reviewed.grade === "C" ? "仅限特殊构件用途" : "不适用：非独立单体")
    : coreUsage
      ? (coreUsage.status === "short-polymer" ? "PDB短聚合物命中" : coreUsage.status === "polymer-only" ? "仅较长PDB聚合物命中" : "PDB聚合物中暂未命中")
      : conditional?.evidenceStatus === "polymer-only" ? "仅较长PDB聚合物命中" : conditional ? "PDB聚合物中暂未命中" : "尚未核查肽中使用";
  const oralHasContext = (reviewed && !/(未找到|无直接|无口服|没有口服|不能归因)/.test(reviewed.oralEvidence)) || (coreReviewed && !/(未找到|无直接|无口服|没有口服)/.test(coreReviewed.oralEvidence));
  return {
    structureIdentity: { status: "confirmed", label: "CCD结构身份已确认" },
    peptideUse: { status: usageStatus, label: usageLabel },
    cyclicPeptideUse: coreReviewed?.grade === "A"
      ? { status: "confirmed", label: "环肽／宏环使用已核对" }
      : coreReviewed ? { status: "not-found", label: "暂无直接环肽使用证据" }
      : reviewed?.grade === "A"
      ? { status: "confirmed", label: "环肽／宏环使用已核对" }
      : reviewed ? { status: "not-found", label: "暂无直接环肽使用证据" } : { status: "not-reviewed", label: "尚未核查环肽使用" },
    synthesisUse: synthesisByCcd.has(record.primaryCcdId)
      ? { status: "confirmed", label: "商业保护形式与SPPS适用性已核查" }
      : coreReviewed
      ? coreReviewed.grade === "PENDING" ? { status: "not-reviewed", label: "保护与肽偶联资料待补充" } : { status: "reviewed", label: "合成或肽中使用资料已核对" }
      : reviewed
      ? { status: "reviewed", label: "合成或身份资料已人工核对" }
      : { status: "not-reviewed", label: "SPPS／LPPS与保护策略待核查" },
    oralEvidence: oralHasContext
      ? { status: "context", label: "存在完整骨架口服证据" }
      : (reviewed || coreReviewed) ? { status: "not-found", label: "暂无可归因的口服证据" } : { status: "not-reviewed", label: "尚未核查口服证据" },
  };
};
const componentClassMeta = {
  "evidence-reviewed-residue": { label: "已确认有CCD定义的非天然氨基酸残基", shortLabel: "已确认残基", description: "结构身份明确，且CCD官方peptide-linking单体类型或人工来源审核支持其作为非标准肽链残基；是否易于购买、合成或改善口服性仍需分别判断。" },
  "pdb-peptide-occurrence": { label: "PDB肽中出现，独立单体资料待补", shortLabel: "PDB中出现", description: "PDB序列确认该结构进入过肽，但尚未全部确认它是否以独立保护单体加入、如何偶联或是否用于环肽。" },
  "special-reference": { label: "特殊用途构件／结构参考", shortLabel: "特殊用途", description: "包括天然产物特殊残基、连接体、交联片段、战头和非典型骨架；有研究资料也不等于普通氨基酸单体。" },
  "candidate-pending": { label: "结构像氨基酸，肽合成单体身份待确认", shortLabel: "待确认候选", description: "CCD已明确其化学结构，但现有资料尚不足以证明它可作为独立氨基酸单体合成并接入肽链。专利提及会单独显示，不自动升级为已确认使用。" },
  "excluded-nonmonomer": { label: "非单体／明确排除", shortLabel: "非单体排除", description: "已识别为完整药物、短肽、辅因子、保护体、复杂缀合物或其他不应作为普通氨基酸单体推荐的结构。" },
};
const hasOfficialPeptideLinkingType = (record) => record.linkageTypes.some((type) => /peptide.*linking/i.test(type));
const classifyComponent = (record, evidenceProfile, applyIdentityAudit = true) => {
  const deepReview = reviewedByCcd.get(record.primaryCcdId);
  const coreReview = coreReviewByCcd.get(record.primaryCcdId);
  const originalResearch = originalResearchByCcd.get(record.primaryCcdId);
  const unresolvedIdentityReview = pdbUnresolvedIdentityReviewByCcd.get(record.primaryCcdId);
  if (unresolvedIdentityReview && applyIdentityAudit) return { id: unresolvedIdentityReview.componentClass, basis: unresolvedIdentityReview.conclusion, method: "source-level-pdb-identity-review" };
  const pendingIdentityReview = pendingIdentityReviewBatch1ByCcd.get(record.primaryCcdId);
  if (pendingIdentityReview && applyIdentityAudit && pendingIdentityReview.componentClass !== "candidate-pending") return { id: pendingIdentityReview.componentClass, basis: pendingIdentityReview.conclusion, method: "source-level-pending-identity-review" };
  const pendingIdentityReview2 = pendingIdentityReviewBatch2ByCcd.get(record.primaryCcdId);
  if (pendingIdentityReview2 && applyIdentityAudit && pendingIdentityReview2.componentClass !== "candidate-pending") return { id: pendingIdentityReview2.componentClass, basis: pendingIdentityReview2.conclusion, method: "source-level-pending-identity-review" };
  const pendingIdentityReview3 = pendingIdentityReviewBatch3ByCcd.get(record.primaryCcdId);
  if (pendingIdentityReview3 && applyIdentityAudit && pendingIdentityReview3.componentClass !== "candidate-pending") return { id: pendingIdentityReview3.componentClass, basis: pendingIdentityReview3.conclusion, method: "source-level-pending-identity-review" };
  const pendingIdentityReview4 = pendingIdentityReviewBatch4ByCcd.get(record.primaryCcdId);
  if (pendingIdentityReview4 && applyIdentityAudit && pendingIdentityReview4.componentClass !== "candidate-pending") return { id: pendingIdentityReview4.componentClass, basis: pendingIdentityReview4.conclusion, method: "source-level-pending-identity-review" };
  const pendingIdentityReview5 = pendingIdentityReviewBatch5ByCcd.get(record.primaryCcdId);
  if (pendingIdentityReview5 && applyIdentityAudit && pendingIdentityReview5.componentClass !== "candidate-pending") return { id: pendingIdentityReview5.componentClass, basis: pendingIdentityReview5.conclusion, method: "source-level-pending-identity-review" };
  const batch9Review = pdbBatch9ReviewByCcd.get(record.primaryCcdId);
  if (batch9Review && !(applyIdentityAudit && batch9Review.componentClass === "pdb-peptide-occurrence" && hasOfficialPeptideLinkingType(record))) return { id: batch9Review.componentClass, basis: batch9Review.conclusion, method: "manual-pdb-context-review" };
  const batch10Review = pdbBatch10ReviewByCcd.get(record.primaryCcdId);
  if (batch10Review && !(applyIdentityAudit && batch10Review.componentClass === "pdb-peptide-occurrence" && hasOfficialPeptideLinkingType(record))) return { id: batch10Review.componentClass, basis: batch10Review.conclusion, method: "manual-pdb-context-review" };
  if (record.screening.tier === "exclude" || deepReview?.grade === "EXCLUDE" || coreReview?.grade === "EXCLUDE") return { id: "excluded-nonmonomer", basis: "结构规则或人工审核已给出明确非单体/排除结论", method: deepReview || coreReview ? "manual-review" : "rule-based" };
  if (originalResearch?.componentClassOverride === "special-reference") return { id: "special-reference", basis: `已确认实际用于肽体系，但人工复核判定为连接、交联、战头、peptoid或非典型肽模拟构件（${originalResearch.recordId}）`, method: "manual-review" };
  if (record.screening.tier === "reference" || deepReview?.grade === "C") return { id: "special-reference", basis: deepReview?.conclusion || "当前仅适合作为特殊构件或结构参考，不进入普通单体推荐层", method: deepReview ? "manual-review" : "rule-based" };
  if (["A", "B"].includes(deepReview?.grade) || ["A", "B"].includes(coreReview?.grade)) return { id: "evidence-reviewed-residue", basis: coreReview?.conclusion || deepReview?.conclusion || "人工来源审核确认肽中使用", method: "manual-review" };
  if (originalResearch && evidenceConfirmsUse(originalResearch.evidenceLevel)) return { id: "evidence-reviewed-residue", basis: `${originalResearch.evidenceLevel}已关联至研发证据记录${originalResearch.recordId}`, method: "manual-review" };
  if (applyIdentityAudit && hasOfficialPeptideLinkingType(record)) return { id: "evidence-reviewed-residue", basis: `wwPDB CCD将该化学组分定义为${record.linkageTypes.join(" / ")}单体；结构身份和聚合物连接角色明确，可归入有CCD定义的非标准氨基酸残基`, method: "ccd-linkage-identity-audit" };
  if (evidenceProfile.peptideUse.status === "confirmed") return { id: "pdb-peptide-occurrence", basis: evidenceProfile.peptideUse.label, method: "pdb-sequence-audit" };
  return { id: "candidate-pending", basis: "结构筛选保留，但尚无足够证据确认其为可独立使用的肽合成单体", method: "rule-based" };
};
const records = preliminaryRecords.map((record) => {
  const evidenceProfile = evidenceProfileFor(record);
  const preAuditClass = classifyComponent(record, evidenceProfile, false);
  const componentClass = classifyComponent(record, evidenceProfile, true);
  const researchEvidence = researchEvidenceFor(record.primaryCcdId);
  return {
    ...record,
    componentClass,
    ...(preAuditClass.id === "pdb-peptide-occurrence" || preAuditClass.id === "candidate-pending" ? { identityAudit: {
      previousClass: preAuditClass.id,
      outcome: componentClass.id === "evidence-reviewed-residue" ? "confirmed-noncanonical-residue"
        : componentClass.id === "special-reference" ? "resolved-special-reference"
        : componentClass.id === "excluded-nonmonomer" ? "resolved-nonmonomer"
        : "still-unresolved",
      rationale: ["evidence-reviewed-residue", "special-reference", "excluded-nonmonomer"].includes(componentClass.id) ? componentClass.basis : "CCD未给出明确的peptide-linking单体类型；仅凭名称、PDB出现或氨基酸样结构不足以升级",
      officialCcdType: record.linkageTypes.join(" / "),
      auditedAt: "2026-09-01",
    }} : {}),
    evidenceProfile,
    researchEvidence,
    ...(coreReviewByCcd.has(record.primaryCcdId) ? { corePriorityReview: coreReviewByCcd.get(record.primaryCcdId) } : {}),
    ...(synthesisByCcd.has(record.primaryCcdId) ? { synthesisUsability: synthesisByCcd.get(record.primaryCcdId) } : {}),
    ...(componentClass.id === "pdb-peptide-occurrence" && pdbContextByCcd.has(record.primaryCcdId) ? { pdbContextAudit: pdbContextByCcd.get(record.primaryCcdId) } : {}),
    ...(componentClass.id === "candidate-pending" && pendingTriageByCcd.has(record.primaryCcdId) ? { candidateTriage: pendingTriageByCcd.get(record.primaryCcdId) } : {}),
    ...(pdbBatch9ReviewByCcd.has(record.primaryCcdId) ? { pdbManualReview: pdbBatch9ReviewByCcd.get(record.primaryCcdId) } : {}),
    ...(pdbBatch10ReviewByCcd.has(record.primaryCcdId) ? { pdbManualReview: pdbBatch10ReviewByCcd.get(record.primaryCcdId) } : {}),
    ...(pdbUnresolvedIdentityReviewByCcd.has(record.primaryCcdId) ? { pdbIdentityDeepReview: pdbUnresolvedIdentityReviewByCcd.get(record.primaryCcdId) } : {}),
    ...(pendingIdentityReviewBatch1ByCcd.has(record.primaryCcdId) ? { pendingIdentityDeepReview: pendingIdentityReviewBatch1ByCcd.get(record.primaryCcdId) } : {}),
    ...(pendingIdentityReviewBatch2ByCcd.has(record.primaryCcdId) ? { pendingIdentityDeepReview: pendingIdentityReviewBatch2ByCcd.get(record.primaryCcdId) } : {}),
    ...(pendingIdentityReviewBatch3ByCcd.has(record.primaryCcdId) ? { pendingIdentityDeepReview: pendingIdentityReviewBatch3ByCcd.get(record.primaryCcdId) } : {}),
    ...(pendingIdentityReviewBatch4ByCcd.has(record.primaryCcdId) ? { pendingIdentityDeepReview: pendingIdentityReviewBatch4ByCcd.get(record.primaryCcdId) } : {}),
    ...(pendingIdentityReviewBatch5ByCcd.has(record.primaryCcdId) ? { pendingIdentityDeepReview: pendingIdentityReviewBatch5ByCcd.get(record.primaryCcdId) } : {}),
  };
});
const tierCounts = Object.fromEntries(["priority", "conditional", "reference", "exclude"].map((tier) => [tier, records.filter((record) => record.screening.tier === tier).length]));
const componentClassCounts = Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, records.filter((record) => record.componentClass.id === id).length]));
const identityAuditRecords = records.filter((record) => record.identityAudit).map((record) => ({
  ccdId: record.primaryCcdId,
  name: record.name,
  formula: record.formula,
  previousClass: record.identityAudit.previousClass,
  outcome: record.identityAudit.outcome,
  officialCcdType: record.identityAudit.officialCcdType,
  rationale: record.identityAudit.rationale,
  sourceUrl: record.sourceUrl,
  auditedAt: record.identityAudit.auditedAt,
}));
const identityAuditCounts = {
  total: identityAuditRecords.length,
  confirmed: identityAuditRecords.filter((record) => record.outcome === "confirmed-noncanonical-residue").length,
  resolvedSpecial: identityAuditRecords.filter((record) => record.outcome === "resolved-special-reference").length,
  excluded: identityAuditRecords.filter((record) => record.outcome === "resolved-nonmonomer").length,
  unresolved: identityAuditRecords.filter((record) => record.outcome === "still-unresolved").length,
};
const researchEvidenceLinkedCcdCount = records.filter((record) => record.researchEvidence.length > 0).length;
const originalMappedRecordCount = new Set(originalResearchLinks.map((record) => record.recordId)).size;
const originalMappedCcdIds = new Set(originalResearchLinks.map((record) => record.ccdId.toUpperCase()));
const deduplicatedManualReviewCount = reviewPayload.records.filter((record) => !originalMappedCcdIds.has(record.ccdId.toUpperCase())).length;
const mappedBeforeCore = new Set([...originalMappedCcdIds, ...reviewPayload.records.map((record) => record.ccdId.toUpperCase())]);
const deduplicatedCoreReviewCount = [...corePriorityBatch1.records, ...corePriorityBatch2.records]
  .filter((record) => ["A", "B"].includes(record.grade) && !mappedBeforeCore.has(record.ccdId.toUpperCase())).length;
const ccdMappedResearchRecordCount = originalMappedRecordCount + deduplicatedManualReviewCount + deduplicatedCoreReviewCount;
const researchRecordCount = ccdMappedResearchRecordCount + originalUnmappedResearchRecords.length;
const unifiedCatalog = {
  metadata: {
    ...catalog.metadata,
    count: records.length,
    generatedDate: "2026-09-01",
    scope: "2,065 unique CCD structure records. Structure identity is the master layer; source-origin labels describe how a record entered the catalog and are not evidence or usability classes.",
    tierCounts,
    componentClassMeta,
    componentClassCounts,
    synthesisUsabilityCounts: { reviewed: synthesisByCcd.size, "commercial-listed": synthesisBatch1.metadata.statusCounts["commercial-listed"], "not-reviewed": records.length - synthesisByCcd.size },
    pdbContextAudit: pdbContextAudit.metadata,
    pendingCandidateTriage: pendingCandidateTriage.metadata,
    pdbManualReviewBatch9: {
      count: pdbBatch9Review.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pdbBatch9Review.filter((record) => record.componentClass === id).length])),
      scope: "Fixed-order manual review of 100 previous PDB short-polymer hits; PDB occurrence is not treated as proof of ordinary amino-acid monomer identity.",
    },
    pdbManualReviewBatch10: {
      count: pdbBatch10Review.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pdbBatch10Review.filter((record) => record.componentClass === id).length])),
      scope: "Second fixed-order manual review of 100 previous PDB short-polymer hits using official representative entry titles and polymer sequences.",
    },
    pdbUnresolvedIdentityReview: {
      count: pdbUnresolvedIdentityReview.length,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pdbUnresolvedIdentityReview.filter((record) => record.componentClass === id).length])),
      scope: "Source-level resolution of all eight records left in the PDB-occurrence bucket after the CCD linkage-type audit; decisions distinguish introduced amino-acid analogues from post-expression modifications, catalytic intermediates, inhibitor adducts and oxidation products.",
      auditedAt: "2026-09-01",
    },
    pendingIdentityReviewBatch1: {
      count: pendingIdentityReviewBatch1.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pendingIdentityReviewBatch1.filter((record) => record.componentClass === id).length])),
      scope: "Chemical-identity review of the first 50 candidate-pending records using official wwPDB CCD identity/parent mapping, PubChem exact-structure registry records, wwPDB BIRD definitions and entry-level reaction context where applicable.",
      auditedAt: "2026-09-01",
    },
    pendingIdentityReviewBatch2: {
      count: pendingIdentityReviewBatch2.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pendingIdentityReviewBatch2.filter((record) => record.componentClass === id).length])),
      scope: "Chemical-identity review of the next 50 previously unreviewed candidate-pending records using official wwPDB CCD definitions, PubChem exact-structure registry records and entry-level reaction context where applicable.",
      auditedAt: "2026-09-01",
    },
    pendingIdentityReviewBatch3: {
      count: pendingIdentityReviewBatch3.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pendingIdentityReviewBatch3.filter((record) => record.componentClass === id).length])),
      scope: "Chemical-identity review of the third fixed-order set of 50 previously unreviewed candidate records using official wwPDB CCD definitions, PubChem exact-structure mappings and entry-level reaction context where needed.",
      auditedAt: "2026-09-01",
    },
    pendingIdentityReviewBatch4: {
      count: pendingIdentityReviewBatch4.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pendingIdentityReviewBatch4.filter((record) => record.componentClass === id).length])),
      scope: "Chemical-identity review of the fourth fixed-order set of 50 previously unreviewed candidates using official wwPDB CCD definitions, PubChem exact-structure mappings and entry-level biochemical context for boundary cases.",
      auditedAt: "2026-09-01",
    },
    pendingIdentityReviewBatch5: {
      count: pendingIdentityReviewBatch5.length,
      fixedOrder: true,
      statusCounts: Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, pendingIdentityReviewBatch5.filter((record) => record.componentClass === id).length])),
      scope: "Final chemical-identity review of all 70 records left unresolved after batches 1-4, using official CCD definitions, PubChem mappings and entry-level context for conjugates, haptens, buffers, drug fragments and biosynthetic intermediates.",
      auditedAt: "2026-09-01",
    },
    originCounts: { "core-structure-screen": catalog.records.length, "research-evidence-linked": addedRecords.length, "conditional-review": conditionalRecords.length },
    researchDatabaseCoverage: { researchRecords: researchRecordCount, ccdMappedResearchRecords: ccdMappedResearchRecordCount, coveredCcdMappedResearchRecords: ccdMappedResearchRecordCount, recordsWithoutUniqueCcd: originalUnmappedResearchRecords.length },
    researchEvidenceAlignment: { researchRecords: researchRecordCount, ccdMappedResearchRecords: ccdMappedResearchRecordCount, linkedCcdStructures: researchEvidenceLinkedCcdCount, recordsWithoutUniqueCcd: originalUnmappedResearchRecords.length, model: "CCD-first; research evidence is linked to the structure master by exact CCD ID." },
    ncaaIdentityAudit: { ...identityAuditCounts, basis: "Official wwPDB _chem_comp.type peptide-linking monomer classification; standard amino acids were excluded from the source candidate set. Non-polymer and peptide-like records remain unresolved pending record-level evidence.", auditedAt: "2026-09-01" },
  },
  records,
};

const addedUsage = addedRecords.map((record) => {
  const usage = usageByCcd.get(record.primaryCcdId);
  if (!usage) throw new Error(`Missing PDB usage record for ${record.primaryCcdId}`);
  const status = usage.shortPolymerEntityCount > 0 ? "short-polymer" : usage.polymerEntityCount > 0 ? "polymer-only" : "no-polymer-hit";
  return {
    id: record.id,
    status,
    polymerEntityCount: usage.polymerEntityCount,
    shortPolymerEntityCount: usage.shortPolymerEntityCount,
    shortPolymerMaxLength: 50,
    exampleEntityIds: usage.exampleEntityIds ?? [],
    exampleEntryIds: usage.exampleEntryIds ?? [],
  };
});
const conditionalUsage = conditionalRecords.map((record) => {
  const manual = manualByCcd.get(record.primaryCcdId);
  if (!manual) throw new Error(`Missing conditional usage record for ${record.primaryCcdId}`);
  return {
    id: record.id,
    status: manual.shortPolymerEntityCount > 0 ? "short-polymer" : manual.polymerEntityCount > 0 ? "polymer-only" : "no-polymer-hit",
    polymerEntityCount: manual.polymerEntityCount ?? 0,
    shortPolymerEntityCount: manual.shortPolymerEntityCount ?? 0,
    shortPolymerMaxLength: 50,
    exampleEntityIds: [],
    exampleEntryIds: manual.exampleEntryIds ?? [],
  };
});
const usageByRecordId = new Map(catalogUsage.records.map((record) => [record.id, record]));
[...addedUsage, ...conditionalUsage].forEach((record) => { if (!usageByRecordId.has(record.id)) usageByRecordId.set(record.id, record); });
const usageRecords = [...usageByRecordId.values()];
const statusCounts = Object.fromEntries(["short-polymer", "polymer-only", "no-polymer-hit"].map((status) => [status, usageRecords.filter((record) => record.status === status).length]));
const unifiedUsage = {
  metadata: {
    ...catalogUsage.metadata,
    candidateTier: "all unified catalog records with completed PDB usage audit",
    candidateCount: usageRecords.length,
    statusCounts,
    scope: usageRecords.length === records.length ? "Complete PDB polymer-sequence occurrence audit for all unified catalog records." : "PDB polymer-sequence occurrence audit for the currently completed catalog subset.",
  },
  records: usageRecords,
};

const csvFields = ["primaryCcdId", "name", "formula", "formulaWeight", "parentIds", "linkageTypes", "smiles", "categoryLabel", "catalogOrigin", "screeningTier", "componentClass", "componentClassLabel", "componentClassBasis", "classificationMethod", "researchEvidenceCount", "researchEvidenceLevels", "researchEvidenceRecordIds", "pdbContextStatus", "pdbContextLabel", "candidateTriageStatus", "candidateTriageLabel", "candidateTriageReasons", "synthesisUsabilityStatus", "protectedForms", "sppsCompatibility", "synthesisGuidance", "synthesisRisks", "structureIdentity", "peptideUse", "cyclicPeptideUse", "synthesisUse", "oralEvidence", "tags", "sourceUrl"];
const csvRows = records.map((record) => ({
  ...record,
  parentIds: record.parentIds.join(" / "),
  linkageTypes: record.linkageTypes.join(" / "),
  screeningTier: record.screening.tier,
  componentClass: record.componentClass.id,
  componentClassLabel: componentClassMeta[record.componentClass.id].label,
  componentClassBasis: record.componentClass.basis,
  classificationMethod: record.componentClass.method,
  researchEvidenceCount: record.researchEvidence.length,
  researchEvidenceLevels: record.researchEvidence.map((item) => item.level).join(" / "),
  researchEvidenceRecordIds: record.researchEvidence.map((item) => item.recordId).join(" / "),
  pdbContextStatus: record.pdbContextAudit?.status ?? "not-applicable",
  pdbContextLabel: record.pdbContextAudit?.statusLabel ?? "",
  candidateTriageStatus: record.candidateTriage?.status ?? "not-applicable",
  candidateTriageLabel: record.candidateTriage?.statusLabel ?? "",
  candidateTriageReasons: record.candidateTriage?.reasons?.join("；") ?? "",
  synthesisUsabilityStatus: record.synthesisUsability?.status ?? "not-reviewed",
  protectedForms: record.synthesisUsability?.protectedForms?.join(" / ") ?? "",
  sppsCompatibility: record.synthesisUsability?.compatibility ?? "not-reviewed",
  synthesisGuidance: record.synthesisUsability?.guidance ?? "",
  synthesisRisks: record.synthesisUsability?.risks ?? "",
  structureIdentity: record.evidenceProfile.structureIdentity.label,
  peptideUse: record.evidenceProfile.peptideUse.label,
  cyclicPeptideUse: record.evidenceProfile.cyclicPeptideUse.label,
  synthesisUse: record.evidenceProfile.synthesisUse.label,
  oralEvidence: record.evidenceProfile.oralEvidence.label,
  tags: record.tags.join(" / "),
}));
const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = [csvFields, ...csvRows.map((record) => csvFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const batch9Fields = ["ccdId", "pdbId", "componentClass", "componentClassLabel", "conclusion"];
const batch9Rows = pdbBatch9Review.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const batch9Csv = [batch9Fields, ...batch9Rows.map((record) => batch9Fields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const batch9Payload = { metadata: unifiedCatalog.metadata.pdbManualReviewBatch9, records: batch9Rows };
const batch10Rows = pdbBatch10Review.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const batch10Csv = [batch9Fields, ...batch10Rows.map((record) => batch9Fields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const batch10Payload = { metadata: unifiedCatalog.metadata.pdbManualReviewBatch10, records: batch10Rows };
const identityAuditFields = ["ccdId", "name", "formula", "previousClass", "outcome", "officialCcdType", "rationale", "sourceUrl", "auditedAt"];
const identityAuditCsv = [identityAuditFields, ...identityAuditRecords.map((record) => identityAuditFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const identityAuditPayload = { metadata: unifiedCatalog.metadata.ncaaIdentityAudit, records: identityAuditRecords };
const unresolvedIdentityFields = ["ccdId", "pdbIds", "componentClass", "componentClassLabel", "conclusion", "observedRole", "outcome", "primaryCitationTitle", "doi", "pmid", "year", "primaryCitationUrl", "evidenceNote", "officialPdbUrls", "reviewScope", "auditedAt"];
const unresolvedIdentityRows = pdbUnresolvedIdentityReview.map((record) => ({
  ...record,
  pdbIds: record.pdbIds.join(" / "),
  componentClassLabel: componentClassMeta[record.componentClass].label,
  primaryCitationTitle: record.primaryCitation.title,
  doi: record.primaryCitation.doi,
  pmid: record.primaryCitation.pmid,
  year: record.primaryCitation.year,
  primaryCitationUrl: record.primaryCitation.url,
  officialPdbUrls: record.officialPdbUrls.join(" / "),
}));
const unresolvedIdentityCsv = [unresolvedIdentityFields, ...unresolvedIdentityRows.map((record) => unresolvedIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const unresolvedIdentityPayload = { metadata: unifiedCatalog.metadata.pdbUnresolvedIdentityReview, records: pdbUnresolvedIdentityReview };
const pendingIdentityFields = ["order", "ccdId", "componentClass", "componentClassLabel", "conclusion", "evidenceKind", "ccdUrl", "pubchemCid", "pubchemUrl", "supportingUrl", "reviewScope", "auditedAt"];
const pendingIdentityRows = pendingIdentityReviewBatch1.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const pendingIdentityCsv = [pendingIdentityFields, ...pendingIdentityRows.map((record) => pendingIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const pendingIdentityPayload = { metadata: unifiedCatalog.metadata.pendingIdentityReviewBatch1, records: pendingIdentityRows };
const pendingIdentityRows2 = pendingIdentityReviewBatch2.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const pendingIdentityCsv2 = [pendingIdentityFields, ...pendingIdentityRows2.map((record) => pendingIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const pendingIdentityPayload2 = { metadata: unifiedCatalog.metadata.pendingIdentityReviewBatch2, records: pendingIdentityRows2 };
const pendingIdentityRows3 = pendingIdentityReviewBatch3.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const pendingIdentityCsv3 = [pendingIdentityFields, ...pendingIdentityRows3.map((record) => pendingIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const pendingIdentityPayload3 = { metadata: unifiedCatalog.metadata.pendingIdentityReviewBatch3, records: pendingIdentityRows3 };
const pendingIdentityRows4 = pendingIdentityReviewBatch4.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const pendingIdentityCsv4 = [pendingIdentityFields, ...pendingIdentityRows4.map((record) => pendingIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const pendingIdentityPayload4 = { metadata: unifiedCatalog.metadata.pendingIdentityReviewBatch4, records: pendingIdentityRows4 };
const pendingIdentityRows5 = pendingIdentityReviewBatch5.map((record) => ({ ...record, componentClassLabel: componentClassMeta[record.componentClass].label }));
const pendingIdentityCsv5 = [pendingIdentityFields, ...pendingIdentityRows5.map((record) => pendingIdentityFields.map((field) => record[field]))].map((row) => row.map(csvEscape).join(",")).join("\n");
const pendingIdentityPayload5 = { metadata: unifiedCatalog.metadata.pendingIdentityReviewBatch5, records: pendingIdentityRows5 };

await Promise.all([
  writeFile(join(publicDir, "ccd-unified-structure-catalog.json"), `${JSON.stringify(unifiedCatalog)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-unified-structure-catalog.csv"), `\uFEFF${csv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-unified-polymer-usage.json"), `${JSON.stringify(unifiedUsage)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-manual-review-batch-9.json"), `${JSON.stringify(batch9Payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-manual-review-batch-9.csv"), `\uFEFF${batch9Csv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-manual-review-batch-10.json"), `${JSON.stringify(batch10Payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-manual-review-batch-10.csv"), `\uFEFF${batch10Csv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-ncaa-identity-audit.json"), `${JSON.stringify(identityAuditPayload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-ncaa-identity-audit.csv"), `\uFEFF${identityAuditCsv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-unresolved-identity-review.json"), `${JSON.stringify(unresolvedIdentityPayload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pdb-unresolved-identity-review.csv"), `\uFEFF${unresolvedIdentityCsv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-1.json"), `${JSON.stringify(pendingIdentityPayload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-1.csv"), `\uFEFF${pendingIdentityCsv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-2.json"), `${JSON.stringify(pendingIdentityPayload2)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-2.csv"), `\uFEFF${pendingIdentityCsv2}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-3.json"), `${JSON.stringify(pendingIdentityPayload3)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-3.csv"), `\uFEFF${pendingIdentityCsv3}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-4.json"), `${JSON.stringify(pendingIdentityPayload4)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-4.csv"), `\uFEFF${pendingIdentityCsv4}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-5.json"), `${JSON.stringify(pendingIdentityPayload5)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-pending-identity-review-batch-5.csv"), `\uFEFF${pendingIdentityCsv5}\n`, "utf8"),
]);

console.log(JSON.stringify({ catalogCount: records.length, sourceOriginCounts: unifiedCatalog.metadata.originCounts, tierCounts, componentClassCounts, identityAuditCounts, usageStatusCounts: statusCounts, researchCoverage: unifiedCatalog.metadata.researchDatabaseCoverage }, null, 2));
