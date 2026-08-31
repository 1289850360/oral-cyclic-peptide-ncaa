import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceConfirmsUse, originalResearchLinks, originalUnmappedResearchRecords } from "./research-evidence-links.mjs";

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
  "evidence-reviewed-residue": { label: "已确认非天然残基／肽构件", shortLabel: "已确认残基", description: "结构身份明确，并有人工来源支持其作为肽、环肽或宏环构件使用；是否易于购买、合成或改善口服性仍需分别判断。" },
  "pdb-peptide-occurrence": { label: "PDB肽中出现，独立单体资料待补", shortLabel: "PDB中出现", description: "PDB序列确认该结构进入过肽，但尚未全部确认它是否以独立保护单体加入、如何偶联或是否用于环肽。" },
  "special-reference": { label: "特殊用途构件／结构参考", shortLabel: "特殊用途", description: "包括天然产物特殊残基、连接体、交联片段、战头和非典型骨架；有研究资料也不等于普通氨基酸单体。" },
  "candidate-pending": { label: "结构像氨基酸，身份仍待确认", shortLabel: "待确认候选", description: "结构规则提示可能是非天然氨基酸，但独立单体身份或用途资料仍不足。专利提及会单独显示，不自动升级为已确认使用。" },
  "excluded-nonmonomer": { label: "非单体／明确排除", shortLabel: "非单体排除", description: "已识别为完整药物、短肽、辅因子、保护体、复杂缀合物或其他不应作为普通氨基酸单体推荐的结构。" },
};
const classifyComponent = (record, evidenceProfile) => {
  const deepReview = reviewedByCcd.get(record.primaryCcdId);
  const coreReview = coreReviewByCcd.get(record.primaryCcdId);
  const originalResearch = originalResearchByCcd.get(record.primaryCcdId);
  if (record.screening.tier === "exclude" || deepReview?.grade === "EXCLUDE" || coreReview?.grade === "EXCLUDE") return { id: "excluded-nonmonomer", basis: "结构规则或人工审核已给出明确非单体/排除结论", method: deepReview || coreReview ? "manual-review" : "rule-based" };
  if (record.screening.tier === "reference" || deepReview?.grade === "C") return { id: "special-reference", basis: deepReview?.conclusion || "当前仅适合作为特殊构件或结构参考，不进入普通单体推荐层", method: deepReview ? "manual-review" : "rule-based" };
  if (["A", "B"].includes(deepReview?.grade) || ["A", "B"].includes(coreReview?.grade)) return { id: "evidence-reviewed-residue", basis: coreReview?.conclusion || deepReview?.conclusion || "人工来源审核确认肽中使用", method: "manual-review" };
  if (originalResearch && evidenceConfirmsUse(originalResearch.evidenceLevel)) return { id: "evidence-reviewed-residue", basis: `${originalResearch.evidenceLevel}已关联至研发证据记录${originalResearch.recordId}`, method: "manual-review" };
  if (evidenceProfile.peptideUse.status === "confirmed") return { id: "pdb-peptide-occurrence", basis: evidenceProfile.peptideUse.label, method: "pdb-sequence-audit" };
  return { id: "candidate-pending", basis: "结构筛选保留，但尚无足够证据确认其为可独立使用的肽合成单体", method: "rule-based" };
};
const records = preliminaryRecords.map((record) => {
  const evidenceProfile = evidenceProfileFor(record);
  const componentClass = classifyComponent(record, evidenceProfile);
  const researchEvidence = researchEvidenceFor(record.primaryCcdId);
  return {
    ...record,
    componentClass,
    evidenceProfile,
    researchEvidence,
    ...(coreReviewByCcd.has(record.primaryCcdId) ? { corePriorityReview: coreReviewByCcd.get(record.primaryCcdId) } : {}),
    ...(synthesisByCcd.has(record.primaryCcdId) ? { synthesisUsability: synthesisByCcd.get(record.primaryCcdId) } : {}),
    ...(componentClass.id === "pdb-peptide-occurrence" && pdbContextByCcd.has(record.primaryCcdId) ? { pdbContextAudit: pdbContextByCcd.get(record.primaryCcdId) } : {}),
    ...(componentClass.id === "candidate-pending" && pendingTriageByCcd.has(record.primaryCcdId) ? { candidateTriage: pendingTriageByCcd.get(record.primaryCcdId) } : {}),
  };
});
const tierCounts = Object.fromEntries(["priority", "conditional", "reference", "exclude"].map((tier) => [tier, records.filter((record) => record.screening.tier === tier).length]));
const componentClassCounts = Object.fromEntries(Object.keys(componentClassMeta).map((id) => [id, records.filter((record) => record.componentClass.id === id).length]));
const researchEvidenceLinkedCcdCount = records.filter((record) => record.researchEvidence.length > 0).length;
const unifiedCatalog = {
  metadata: {
    ...catalog.metadata,
    count: records.length,
    generatedDate: "2026-08-31",
    scope: "2,065 unique CCD structure records. Structure identity is the master layer; source-origin labels describe how a record entered the catalog and are not evidence or usability classes.",
    tierCounts,
    componentClassMeta,
    componentClassCounts,
    synthesisUsabilityCounts: { reviewed: synthesisByCcd.size, "commercial-listed": synthesisBatch1.metadata.statusCounts["commercial-listed"], "not-reviewed": records.length - synthesisByCcd.size },
    pdbContextAudit: pdbContextAudit.metadata,
    pendingCandidateTriage: pendingCandidateTriage.metadata,
    originCounts: { "core-structure-screen": catalog.records.length, "research-evidence-linked": addedRecords.length, "conditional-review": conditionalRecords.length },
    researchDatabaseCoverage: { researchRecords: 159, ccdMappedResearchRecords: 145, coveredCcdMappedResearchRecords: 145, recordsWithoutUniqueCcd: 14 },
    researchEvidenceAlignment: { researchRecords: 159, ccdMappedResearchRecords: 145, linkedCcdStructures: researchEvidenceLinkedCcdCount, recordsWithoutUniqueCcd: originalUnmappedResearchRecords.length, model: "CCD-first; research evidence is linked to the structure master by exact CCD ID." },
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
const usageRecords = [...catalogUsage.records, ...addedUsage, ...conditionalUsage];
const statusCounts = Object.fromEntries(["short-polymer", "polymer-only", "no-polymer-hit"].map((status) => [status, usageRecords.filter((record) => record.status === status).length]));
const unifiedUsage = {
  metadata: {
    ...catalogUsage.metadata,
    candidateTier: "all unified catalog records with completed PDB usage audit",
    candidateCount: usageRecords.length,
    statusCounts,
    scope: "PDB polymer-sequence occurrence for 221 original priority structures, 92 evidence-linked additions, and 286 conditional candidates.",
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

await Promise.all([
  writeFile(join(publicDir, "ccd-unified-structure-catalog.json"), `${JSON.stringify(unifiedCatalog)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-unified-structure-catalog.csv"), `\uFEFF${csv}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-unified-polymer-usage.json"), `${JSON.stringify(unifiedUsage)}\n`, "utf8"),
]);

console.log(JSON.stringify({ catalogCount: records.length, sourceOriginCounts: unifiedCatalog.metadata.originCounts, tierCounts, componentClassCounts, usageStatusCounts: statusCounts, researchCoverage: unifiedCatalog.metadata.researchDatabaseCoverage }, null, 2));
