import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = JSON.parse(fs.readFileSync(path.join(root, "public", "natural-parent-evidence-review-batch-545.json"), "utf8"));
const candidateAudit = JSON.parse(fs.readFileSync(path.join(root, "public", "natural-parent-literature-candidate-audit.json"), "utf8"));
const candidateByCcd = new Map(candidateAudit.records.map((record) => [record.ccdId, record]));

const acceptedReasons = {
  "9NR": "丹磺酰-L-精氨酸与人血清白蛋白药物位点1的共晶结构",
  "9NV": "丹磺酰-L-正缬氨酸与人血清白蛋白药物位点2的共晶结构",
  ALT: "硫代丙氨酸模型晶体结构及肽硫代酰胺的蛋白酶稳定性实验",
  BP5: "联吡啶丙氨酸定点装入p19后产生铜依赖RNA内切活性",
  EI4: "含或不含Enduracididine的teixobactin相关骨架抗菌实验",
  GL3: "McrA硫代甘氨酸形成与缺失修饰后的高温/低能量生长表型",
  HBN: "L-组氨酸β-萘酰胺的HutP激活和β-葡萄糖苷酶抑制实验",
  MEU: "O-甲基-Gly相对Gly的PAT1亲和力和转运下降实验",
  NLP: "正亮氨酸膦酸与甲硫氨酸氨肽酶的金属配位共晶结构",
  TPL: "色氨醇生成、敲除、回补和稳定同位素氮同化实验",
  TYB: "含酪氨醛末端的tyropeptin衍生物蛋白酶体抑制实验",
  ZZD: "S-三苯甲基-L-半胱氨酸对Eg5/KSP马达蛋白和细胞有丝分裂的实验",
};

const specialRejections = {
  AZK: "CCD AZK的二维结构实际为6-叠氮氨基醇，与检索到的6-叠氮-Lys羧酸论文不一致，不能跨结构升级",
  DLS: "论文中的‘diacetylated H3’是两个不同Lys位点各自乙酰化，不是CCD DLS所表示的同一个Lys同时Nα/Nε二乙酰化",
  UJR: "命中的是通用半胱氨酸芳基化，未使用CCD UJR的5-碘嘧啶基半胱氨醛精确结构",
  LNE: "命中文章研究的是更大的热溶菌素膦酰胺抑制剂，不能把结果归给游离N-乙基-L-亮氨酰胺",
  LNM: "命中文章研究的是更大的热溶菌素膦酰胺抑制剂，不能把结果归给游离N-甲基-L-亮氨酰胺",
  IC0: "论文使用烯基氨基酸完成闭环复分解；成环后已不再是CCD IC0的精确化学结构，不能把成品活性归给IC0",
  HIA: "命中的是组氨酰胺-胆固醇脂质纳米颗粒，没有游离HIA或His/HIA单变量对照",
  TRW: "命中的是蛋白醌辅因子的苯肼加合物，未证明CCD TRW作为氨基酸残基带来的性质",
  S12: "命中的是完整溶血磷脂纳米颗粒和脂质转运，不能拆分为Ser衍生残基的贡献",
  LPS: "命中的是完整磷脂分子的膜功能，不属于可归因到单个Ser残基的性质实验",
  SEL: "命中的是游离serinol代谢或核酸骨架研究，不是由天然氨基酸替换形成的肽残基实验",
};

const accepted = [];
const notUpgraded = [];
for (const record of input.records) {
  const ccdId = record.ccdId;
  const search = candidateByCcd.get(ccdId);
  const candidates = search?.candidates ?? [];
  if (acceptedReasons[ccdId]) {
    accepted.push({
      ccdId,
      reason: acceptedReasons[ccdId],
      candidateCountReviewed: candidates.length,
      sources: candidates.slice(0, 4).map(({ title, url, pmid, doi }) => ({ title, url, pmid, doi })),
    });
    continue;
  }
  const reason = specialRejections[ccdId]
    ?? (candidates.length
      ? "已逐篇复核命中的题名和摘要；内容属于同名误命中、仅合成/结构鉴定、不同化学结构或无法从完整分子归因到该残基，不满足升级门槛"
      : "已用CCD精确名称及同义词检索Europe PMC；本轮没有找到可对应精确结构并报告性质方向的论文候选");
  notUpgraded.push({
    ccdId,
    reason,
    searchTerms: search?.searchTerms ?? [],
    candidateCountReviewed: candidates.length,
    candidateDisposition: candidates.length ? "reviewed-not-accepted" : "no-candidate-found",
  });
}

const result = {
  reviewedAt: "2026-09-03",
  scope: "剩余545条原‘结构规则建议’记录的集中检索与逐条核验（累计完成全部845条待检索记录）",
  decisionRule: "以CCD精确结构为边界，先检索官方名称和同义词，再复核候选题名、摘要和可用全文。只有能对应精确结构，并报告实验体系、性质或功能方向及适用边界的证据才升级；同名误命中、仅合成、仅PDB出现、不同构型/化学状态、完整分子但无法归因、纯计算或综述不升级。无候选表示本轮系统检索未发现，不等于全球文献永久不存在。",
  searchCoverage: {
    database: "Europe PMC / PubMed-linked primary literature",
    recordsSearched: input.records.length,
    recordsWithCandidates: input.records.filter((record) => (candidateByCcd.get(record.ccdId)?.candidates?.length ?? 0) > 0).length,
    candidatePapersReviewed: input.records.reduce((sum, record) => sum + (candidateByCcd.get(record.ccdId)?.candidates?.length ?? 0), 0),
    searchErrors: input.records.filter((record) => candidateByCcd.get(record.ccdId)?.error).length,
  },
  reviewedCount: input.records.length,
  acceptedCount: accepted.length,
  notUpgradedCount: notUpgraded.length,
  accepted,
  notUpgraded,
};

const outputPath = path.join(root, "public", "natural-parent-evidence-review-batch-545-results.json");
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}: ${accepted.length} accepted, ${notUpgraded.length} not upgraded.`);
