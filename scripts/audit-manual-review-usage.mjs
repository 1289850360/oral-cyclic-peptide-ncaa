import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(rootDir, "public");
const screenPath = path.join(publicDir, "ccd-manual-review-screened.json");
const outputJsonPath = path.join(publicDir, "ccd-manual-review-usage-audit.json");
const outputCsvPath = path.join(publicDir, "ccd-manual-review-usage-audit.csv");
const finalJsonPath = path.join(publicDir, "ccd-manual-review-final.json");
const finalCsvPath = path.join(publicDir, "ccd-manual-review-final.csv");
const endpoint = "https://search.rcsb.org/rcsbsearch/v2/query";
const maxShortLength = 50;
const concurrency = 8;

const screen = JSON.parse(await readFile(screenPath, "utf8"));
const candidates = screen.records.filter((record) => record.decision === "收录");

const compNode = (ccdIds) => ccdIds.length === 1 ? {
  type: "terminal", service: "text", parameters: {
    attribute: "rcsb_polymer_entity_container_identifiers.chem_comp_monomers",
    operator: "exact_match", value: ccdIds[0],
  },
} : { type: "group", logical_operator: "or", nodes: ccdIds.map((ccdId) => compNode([ccdId])) };

const makeBody = (ccdIds, shortOnly) => ({
  query: shortOnly ? {
    type: "group", logical_operator: "and", nodes: [compNode(ccdIds), {
      type: "terminal", service: "text", parameters: {
        attribute: "entity_poly.rcsb_sample_sequence_length", operator: "less_or_equal", value: maxShortLength,
      },
    }],
  } : compNode(ccdIds),
  request_options: { paginate: { start: 0, rows: 5 }, results_content_type: ["experimental"] },
  return_type: "polymer_entity",
});

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function query(ccdIds, shortOnly) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(makeBody(ccdIds, shortOnly)) });
    if (response.status === 204) return { count: 0, examples: [] };
    if (response.ok) {
      const result = await response.json();
      return { count: result.total_count ?? 0, examples: (result.result_set ?? []).map((item) => item.identifier) };
    }
    const message = await response.text();
    if (attempt === 3 || (response.status < 500 && response.status !== 429)) throw new Error(`RCSB search failed for ${ccdIds.join("/")} (${response.status}): ${message.slice(0, 300)}`);
    await delay(500 * attempt);
  }
}

const results = new Array(candidates.length);
let cursor = 0;
async function worker() {
  while (cursor < candidates.length) {
    const index = cursor++;
    const candidate = candidates[index];
    const [all, short] = await Promise.all([query(candidate.ccdIds, false), query(candidate.ccdIds, true)]);
    const evidenceStatus = candidate.priority === "P0" ? "curated-evidence"
      : short.count > 0 ? "short-polymer"
        : all.count > 0 ? "polymer-only"
          : "structure-only";
    const examples = short.examples.length > 0 ? short.examples : all.examples;
    results[index] = {
      ccdIds: candidate.ccdIds,
      priority: candidate.priority,
      name: candidate.name,
      screeningTier: candidate.tier,
      evidenceStatus,
      polymerEntityCount: all.count,
      shortPolymerEntityCount: short.count,
      exampleEntityIds: examples,
      exampleEntryIds: [...new Set(examples.map((identifier) => identifier.split("_")[0]))],
    };
    if ((index + 1) % 50 === 0 || index + 1 === candidates.length) console.log(`Audited ${index + 1}/${candidates.length}`);
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));

const statuses = ["curated-evidence", "short-polymer", "polymer-only", "structure-only"];
const statusCounts = Object.fromEntries(statuses.map((status) => [status, results.filter((record) => record.evidenceStatus === status).length]));
const output = {
  metadata: {
    auditDate: "2026-08-28",
    source: "RCSB PDB Search API",
    candidateCount: candidates.length,
    maxShortPolymerLength: maxShortLength,
    statusCounts,
    scope: "Usage evidence for structurally accepted review-queue candidates. Polymer occurrence does not prove SPPS compatibility, cyclicity, or oral benefit.",
  },
  records: results,
};
const labels = { "curated-evidence": "网站已有人工证据", "short-polymer": "短聚合物序列命中", "polymer-only": "仅长聚合物命中", "structure-only": "仅结构候选" };
const quoteCsv = (value) => { const text = value == null ? "" : String(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const headers = ["证据状态", "审核优先级", "CCD编号", "名称", "聚合物实体数", "≤50残基实体数", "示例PDB"];
const rows = results.map((record) => [labels[record.evidenceStatus], record.priority, record.ccdIds.join(" / "), record.name, record.polymerEntityCount, record.shortPolymerEntityCount, record.exampleEntryIds.join(" / ")]);
await writeFile(outputJsonPath, `${JSON.stringify(output)}\n`, "utf8");
await writeFile(outputCsvPath, `${[headers, ...rows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8");

const usageByCcd = new Map(results.map((record) => [record.ccdIds.join("/"), record]));
const finalRecords = screen.records.map((record) => {
  const usage = usageByCcd.get(record.ccdIds.join("/"));
  const finalStatus = record.decision === "排除" ? "excluded"
    : record.decision === "暂缓" ? "deferred"
      : usage?.evidenceStatus === "curated-evidence" || usage?.evidenceStatus === "short-polymer" ? "recommended-review"
        : "conditional";
  const finalReason = finalStatus === "recommended-review"
    ? usage.evidenceStatus === "curated-evidence" ? "结构筛选通过，且网站已有人工整理的论文/专利证据" : "结构筛选通过，且在不超过50残基的PDB聚合物序列中实际出现"
    : finalStatus === "conditional" ? usage?.evidenceStatus === "polymer-only" ? "结构筛选通过，但目前只在较长聚合物中出现；需确认是否适合环肽合成" : "结构筛选通过，但目前只有结构层面的单体合理性，缺少实际肽使用证据"
      : finalStatus === "deferred" ? "结构可能合理，但单体身份、偶联条件或复杂度证据不足，暂不进入研发候选库"
        : record.reasons.join("；");
  return {
    ...record,
    finalStatus,
    finalReason,
    evidenceStatus: usage?.evidenceStatus ?? "not-audited",
    polymerEntityCount: usage?.polymerEntityCount ?? 0,
    shortPolymerEntityCount: usage?.shortPolymerEntityCount ?? 0,
    exampleEntryIds: usage?.exampleEntryIds ?? [],
  };
});
const finalStatuses = ["recommended-review", "conditional", "deferred", "excluded"];
const finalStatusCounts = Object.fromEntries(finalStatuses.map((status) => [status, finalRecords.filter((record) => record.finalStatus === status).length]));
const finalOutput = {
  metadata: {
    auditDate: "2026-08-28",
    count: finalRecords.length,
    finalStatusCounts,
    statusDefinition: {
      "recommended-review": "结构筛选通过，并有网站人工证据或≤50残基PDB序列命中；优先进入合成/环肽/口服证据深审。",
      conditional: "结构筛选通过，但只有较长聚合物或结构层面证据；不得直接标为可用于口服环肽。",
      deferred: "结构可能合理但单体身份、复杂度或偶联条件证据不足。",
      excluded: "结构规则显示为药物/代谢物/辅因子/保护体/复杂整分子或不具备常规单体条件。",
    },
    scope: "Two-stage structure and PDB-usage screen. recommended-review means highest priority for manual synthesis and oral-cyclic-peptide evidence review, not final proof of usability.",
  },
  records: finalRecords,
};
const finalLabels = { "recommended-review": "优先深审", conditional: "条件候选", deferred: "暂缓", excluded: "排除" };
const finalHeaders = ["最终状态", "审核优先级", "CCD编号", "名称", "同义词", "结构分类", "独立单体判断", "证据状态", "聚合物实体数", "≤50残基实体数", "示例PDB", "最终判断理由", "结构风险提示", "分子式", "分子量", "母体CCD", "CCD类型", "骨架碳距离", "立体化学SMILES", "CCD链接", "结构图链接"];
const finalRows = finalRecords.map((record) => [finalLabels[record.finalStatus], record.priority, record.ccdIds.join(" / "), record.name, record.synonyms, record.classification, record.independentMonomer, labels[record.evidenceStatus] ?? "未进入使用审计", record.polymerEntityCount, record.shortPolymerEntityCount, record.exampleEntryIds.join(" / "), record.finalReason, record.cautions.join("；"), record.formula, record.molecularWeight, record.parentIds.join(" / "), record.componentType, record.backboneDistance, record.smiles, record.ccdLinks, record.structureImageLinks]);
await writeFile(finalJsonPath, `${JSON.stringify(finalOutput)}\n`, "utf8");
await writeFile(finalCsvPath, `${[finalHeaders, ...finalRows].map((row) => row.map(quoteCsv).join(",")).join("\n")}\n`, "utf8");
console.log(JSON.stringify({ ...output.metadata, finalStatusCounts }, null, 2));
