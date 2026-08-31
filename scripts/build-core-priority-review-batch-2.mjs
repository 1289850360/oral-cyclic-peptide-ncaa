import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const readJson = async (name) => JSON.parse(await readFile(join(publicDir, name), "utf8"));
const [catalog, usage] = await Promise.all([readJson("ccd-unified-structure-catalog.json"), readJson("ccd-unified-polymer-usage.json")]);
const usageById = new Map(usage.records.map((record) => [record.id, record]));
const pdb = (id, title, evidenceType = "PDB肽中使用") => ({ title: `PDB ${id} · ${title}`, url: `https://www.rcsb.org/structure/${id}`, evidenceType });
const oralCyclosporine = { title: "DailyMed · Cyclosporine oral solution prescribing information", url: "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f3dc2a50-1084-4190-a6f3-37034a04db86", evidenceType: "完整骨架口服先例" };

const assessments = {
  HYP: { grade: "B", conclusion: "确认为肽中常见的羟脯氨酸构件；独立保护单体与目标环肽条件仍应另行核查", synthesis: "大量PDB聚合物记录确认HYP作为残基进入胶原和毒素肽；PDB身份不自动证明任一保护形式均适合SPPS。", cyclic: "本批代表记录为二硫键约束conotoxin，属于受约束肽证据，但不足以归为通用头尾环肽单体证据。", oral: "未找到可归因于HYP单点的口服暴露证据。", use: "适合Pro位点转角、氢键和极性扫描；闭环与顺反异构影响需在具体序列中测定。", sources: [pdb("1AG7", "Conotoxin GS", "受约束肽结构"), pdb("1BKV", "Collagen", "肽中使用")] },
  DAL: { grade: "A", conclusion: "确认为D-构型肽残基，并有环状天然产物和环肽骨架直接结构记录", synthesis: "D-Ala在多类天然产物及合成肽中作为明确残基出现；具体保护单体和偶联条件仍取决于序列。", cyclic: "PDB 1AJ1为含D-Ala的lantibiotic actagardine；PDB 1BCK为环孢素类似物环境。", oral: "环孢素具有完整骨架口服先例，但不能把口服性归因于D-Ala。", use: "适合L/D反转和蛋白酶稳定性扫描，需同时评估构象与活性损失。", sources: [pdb("1AJ1", "Lantibiotic actagardine", "交联环肽结构"), pdb("1BCK", "2-Thr cyclosporin", "环肽结构"), oralCyclosporine] },
  AIB: { grade: "B", conclusion: "确认为可进入肽的α,α-二取代构象限制残基；本批代表结构以线性peptaibol为主", synthesis: "多种peptaibol与肽抗生素结构确认Aib可被连续引入肽链。", cyclic: "代表结构alamethicin和zervamicin主要为线性螺旋肽，不能据此声称直接环肽使用。", oral: "未找到口服证据。", use: "适合螺旋诱导和蛋白酶稳定性扫描；应补查目标闭环方式、消旋与偶联效率。", sources: [pdb("1AMT", "Alamethicin", "肽抗生素结构"), pdb("1DLZ", "Zervamicin IIB", "peptaibol结构")] },
  DPR: { grade: "A", conclusion: "确认为D-Pro构象单元，并有天然环五肽直接结构证据", synthesis: "D-Pro在多种合成肽和天然环肽中作为明确残基出现。", cyclic: "PDB 1H0G为天然环五肽argadin与chitinase复合物。", oral: "未找到口服证据。", use: "适合β-turn和D/L反转扫描；需关注顺反酰胺与闭环构象。", sources: [pdb("1H0G", "Natural product cyclopentapeptide argadin", "环肽结构"), pdb("1BFW", "Retro-inverso peptide", "肽中使用")] },
  DLE: { grade: "B", conclusion: "确认为D-Leu肽残基；本批高频代表结构主要来自线性gramicidin", synthesis: "PDB聚合物序列广泛确认D-Leu进入肽链。", cyclic: "本批代表PDB为gramicidin D线性肽，未据此确认直接环肽使用。", oral: "未找到口服证据。", use: "适合疏水位点D/L反转和蛋白酶稳定性扫描，闭环适配需单独验证。", sources: [pdb("1AL4", "Gramicidin D", "线性肽结构")] },
  DVA: { grade: "A", conclusion: "确认为D-Val肽残基，并有actinomycin环状depsipeptide直接结构证据", synthesis: "D-Val作为明确残基存在于天然产物肽和合成肽。", cyclic: "PDB 1A7Y为actinomycin D，其含环状depsipeptide部分。", oral: "未找到能归因于D-Val的口服证据。", use: "适合小疏水位点D/L扫描；天然产物环境不等同于通用SPPS条件。", sources: [pdb("1A7Y", "Actinomycin D", "环状depsipeptide结构"), pdb("1AL4", "Gramicidin D", "肽中使用")] },
  MVA: { grade: "A", conclusion: "确认为N-甲基Val构件，并有环孢素和actinomycin类宏环直接结构证据", synthesis: "PDB确认N-Me-Val进入多类宏环天然产物；不自动证明商业保护单体或任意序列偶联可行。", cyclic: "PDB 1BCK与1A7Y分别提供环孢素类似物和actinomycin D环境。", oral: "环孢素具有完整骨架口服先例；单个N-Me-Val的贡献不能从这些结构单独归因。", use: "适合同时扫描氢键供体屏蔽与疏水性，需监测偶联困难和构象改变。", sources: [pdb("1BCK", "2-Thr cyclosporin", "环肽结构"), pdb("1A7Y", "Actinomycin D", "环状depsipeptide结构"), oralCyclosporine] },
  DPN: { grade: "A", conclusion: "确认为D-Phe肽残基，并有金属配位闭环肽直接结构证据", synthesis: "D-Phe在合成肽、逆向肽和多类天然产物中有明确使用记录。", cyclic: "PDB 1B0Q为经铼配位形成的环化α-MSH类似物。", oral: "未找到口服证据。", use: "适合芳香位点D/L反转和蛋白酶稳定性扫描；金属配位闭环不能外推到其他闭环方式。", sources: [pdb("1B0Q", "Dithiol alpha-melanotropin peptide cyclized by rhenium coordination", "环肽结构"), pdb("1BFW", "Retro-inverso peptide", "肽中使用")] },
  SAR: { grade: "A", conclusion: "确认为Sar/N-甲基甘氨酸构件，并有actinomycin环状depsipeptide直接证据", synthesis: "Sar在多种合成肽和天然产物中作为N-取代残基出现。", cyclic: "PDB 1A7Y为含Sar的actinomycin D环状depsipeptide。", oral: "未找到可归因于Sar单点的口服证据。", use: "适合降低氢键供体与调节骨架柔性；需评估局部构象和偶联动力学。", sources: [pdb("1A7Y", "Actinomycin D", "环状depsipeptide结构"), pdb("11MG", "Compstatin analog Cp60", "肽中使用")] },
  DTY: { grade: "A", conclusion: "确认为D-Tyr肽残基，并有工程化环肽直接结构证据", synthesis: "D-Tyr在合成肽和天然产物衍生肽中有明确残基记录。", cyclic: "PDB 1D7T为工程化contryphan环肽。", oral: "未找到口服证据。", use: "适合芳香极性位点D/L反转；应区分二硫键环化与头尾闭环。", sources: [pdb("1D7T", "Engineered contryphan cyclic peptide", "环肽结构"), pdb("1C4B", "Beta-hairpin mimic cyclo(RD-262)", "环肽结构")] },
  DLY: { grade: "A", conclusion: "确认为D-Lys肽残基，并有环化β-hairpin模拟物直接结构证据", synthesis: "D-Lys进入受约束肽和全D肽的PDB记录明确。", cyclic: "PDB 1C4B为cyclo(RD-262) β-hairpin模拟物。", oral: "未找到口服证据。", use: "可用于D/L反转和侧链闭环把手设计；侧链保护与电荷效应需单独优化。", sources: [pdb("1C4B", "Beta-hairpin mimic cyclo(RD-262)", "环肽结构"), pdb("2KQL", "All-D maurocalcine", "全D肽结构")] },
  DSN: { grade: "A", conclusion: "确认为D-Ser肽残基，并有环孢素衍生物和环状抗生素环境直接证据", synthesis: "D-Ser在天然产物肽、逆向肽和合成肽中作为明确残基出现。", cyclic: "PDB 1CYN为D-Ser取代的环孢素衍生物；185D/1PFE属于环状quinoxaline抗生素环境。", oral: "环孢素母体有口服先例，但D-Ser衍生物及单点贡献未被证明。", use: "适合D/L反转及极性位点扫描；羟基保护和闭环条件需核查。", sources: [pdb("1CYN", "D-Ser cyclosporin derivative", "环肽结构"), pdb("1PFE", "Echinomycin-DNA complex", "环状抗生素结构"), oralCyclosporine] },
  MLE: { grade: "A", conclusion: "确认为N-Me-Leu宏环构件，并有大量环孢素直接结构记录", synthesis: "多种环孢素及其衍生物PDB结构确认N-Me-Leu进入宏环骨架。", cyclic: "PDB 1CWA为cyclophilin A-cyclosporin A复合物。", oral: "环孢素具有完整骨架口服先例；不能把口服性单独归因于N-Me-Leu。", use: "是N-甲基扫描的重要起点，需结合具体位点的顺反构象、溶解度和偶联效率评价。", sources: [pdb("1CWA", "Cyclophilin A-cyclosporin A complex", "环肽结构"), pdb("1CWB", "Modified cyclosporin complex", "环肽结构"), oralCyclosporine] },
  DTR: { grade: "A", conclusion: "确认为D-Trp肽残基，并有contryphan环肽直接结构证据", synthesis: "D-Trp在合成D肽及天然受约束肽中有明确使用记录。", cyclic: "PDB 1DFY、1DFZ和1DG0均为contryphan环肽构象。", oral: "未找到口服证据。", use: "适合芳香疏水位点D/L反转和转角设计；需关注体积、氧化与溶解度。", sources: [pdb("1DFY", "Contryphan-Sm cyclic peptide", "环肽结构"), pdb("1DG0", "Des-Gly1-contryphan-R", "环肽结构")] },
  DTH: { grade: "A", conclusion: "确认为D-Thr肽残基，并有全D环状knottin直接结构证据", synthesis: "D-Thr作为全D肽和天然产物肽残基的结构记录明确。", cyclic: "PDB 2JUE为全D kalata B1，属于头尾环化且含二硫键的cyclotide。", oral: "未找到口服证据。", use: "适合全D或局部D扫描；β-支化和侧链羟基会增加偶联与构象复杂性。", sources: [pdb("2JUE", "All-D kalata B1", "环状knottin结构"), pdb("2KQL", "All-D maurocalcine", "全D肽结构")] },
  DCY: { grade: "A", conclusion: "确认为D-Cys肽残基，并有硫肽宏环和合成环肽直接结构证据", synthesis: "D-Cys可进入全D肽及受约束肽；巯基保护和氧化状态必须作为合成条件记录。", cyclic: "PDB 1E9W为thiostrepton宏环；PDB 1PCG为螺旋稳定化环肽。", oral: "未找到口服证据。", use: "适合二硫键或化学连接闭环，但反应性、错配和氧化稳定性是主要风险。", sources: [pdb("1E9W", "Macrocycle thiostrepton", "宏环结构"), pdb("1PCG", "Helix-stabilized cyclic peptides", "环肽结构")] },
  MEA: { grade: "A", conclusion: "确认为N-Me-Phe构件，并有天然环五肽argifin直接结构证据", synthesis: "PDB确认N-Me-Phe进入天然环肽和其他肽配体。", cyclic: "PDB 1H0I、1W9V与1WB0为天然环五肽argifin结构。", oral: "未找到口服证据。", use: "适合芳香位点N-甲基扫描；应评估偶联困难、顺反酰胺和溶解度。", sources: [pdb("1H0I", "Natural product cyclopentapeptide argifin", "环肽结构"), pdb("1W9V", "Argifin-chitinase complex", "环肽结构")] },
  MAA: { grade: "A", conclusion: "确认为N-Me-Ala构件，并有环孢素衍生物及KRAS宏环抑制剂直接结构证据", synthesis: "N-Me-Ala进入多类合成肽和宏环骨架的PDB记录明确。", cyclic: "PDB 24HT为KRAS G12D宏环肽抑制剂AP2527；PDB 1CWI为环孢素衍生物。", oral: "环孢素具有完整骨架口服先例；AP2527及单点N-Me-Ala的口服性尚不能由结构推出。", use: "适合小体积位点的氢键供体屏蔽扫描，需与构象和细胞渗透数据配对。", sources: [pdb("24HT", "KRAS G12D macrocyclic peptide inhibitor AP2527", "宏环肽结构"), pdb("1CWI", "N-Me-D-Ala cyclosporin derivative", "环肽结构"), oralCyclosporine] },
  ALC: { grade: "B", conclusion: "确认为cyclohexylalanine类疏水肽构件；本批代表记录尚不足以确认直接环肽使用", synthesis: "PDB确认该残基进入寡肽、MHC肽和肽模拟物。", cyclic: "本批代表结构以线性短肽和肽模拟物为主。", oral: "未找到口服证据。", use: "适合扩大疏水表面积和芳香替代扫描；需关注溶解度、聚集及闭环空间冲突。", sources: [pdb("1B3H", "Lys-cyclohexylalanyl-Lys", "短肽结构"), pdb("1D5X", "HLA-DR4 dipeptide mimetic", "肽模拟物结构")] },
  BMT: { grade: "A", conclusion: "确认为环孢素特征性N-甲基氨基酸构件，并有大量宏环直接结构记录", synthesis: "Bmt作为环孢素骨架残基在多个PDB结构中被明确建模；天然产物生物合成不等同于通用商业单体供应。", cyclic: "PDB 1CWA、1BCK等提供环孢素宏环直接结构证据。", oral: "环孢素具有完整骨架口服先例；Bmt单个残基的贡献不能从整体数据中拆分。", use: "适合作为环孢素式疏水N-甲基构件参考，实验前需核查立体选择性来源和保护策略。", sources: [pdb("1CWA", "Cyclophilin A-cyclosporin A complex", "环肽结构"), pdb("1BCK", "2-Thr cyclosporin", "环肽结构"), oralCyclosporine] },
};

const selectedIds = ["HYP", "DAL", "AIB", "DPR", "DLE", "DVA", "MVA", "DPN", "SAR", "DTY", "DLY", "DSN", "MLE", "DTR", "DTH", "DCY", "MEA", "MAA", "ALC", "BMT"];
const batchRecords = selectedIds.map((ccdId, index) => {
  const record = catalog.records.find((item) => item.primaryCcdId === ccdId);
  const review = assessments[ccdId];
  if (!record || !review) throw new Error(`Missing record or assessment for ${ccdId}`);
  return { batch: 2, batchPosition: index + 1, id: record.id, ccdId, name: record.name, formula: record.formula, grade: review.grade, conclusion: review.conclusion, synthesisEvidence: review.synthesis, cyclicEvidence: review.cyclic, oralEvidence: review.oral, recommendation: review.use, pdbUsage: usageById.get(record.id), sources: review.sources, reviewedAt: "2026-08-31" };
});

const gradeCounts = Object.fromEntries(["A", "B", "PENDING", "EXCLUDE"].map((grade) => [grade, batchRecords.filter((record) => record.grade === grade).length]));
const payload = { metadata: { reviewProgram: "PDB peptide-occurrence component review", selection: "Top 20 records by <=50-residue PDB polymer-entity count, excluding batch 1", batch: 2, count: batchRecords.length, gradeCounts, scope: "Manual source review of component identity, peptide context, cyclic or macrocyclic use, synthesis boundary, and oral evidence. Whole-scaffold oral evidence is never attributed to one residue." }, records: batchRecords };
const fields = ["batchPosition", "ccdId", "name", "formula", "grade", "conclusion", "synthesisEvidence", "cyclicEvidence", "oralEvidence", "recommendation", "pdbStatus", "pdbExamples", "sources"];
const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = [fields, ...batchRecords.map((record) => ({ ...record, pdbStatus: record.pdbUsage?.status ?? "not-audited", pdbExamples: record.pdbUsage?.exampleEntryIds?.join(" / ") ?? "", sources: record.sources.map((item) => `${item.evidenceType}｜${item.title}｜${item.url}`).join("；") })).map((record) => fields.map((field) => record[field]))].map((row) => row.map(escape).join(",")).join("\n");

await Promise.all([
  writeFile(join(publicDir, "ccd-core-priority-review-batch-2.json"), `${JSON.stringify(payload)}\n`, "utf8"),
  writeFile(join(publicDir, "ccd-core-priority-review-batch-2.csv"), `\uFEFF${csv}\n`, "utf8"),
]);
console.log(JSON.stringify(payload.metadata, null, 2));
