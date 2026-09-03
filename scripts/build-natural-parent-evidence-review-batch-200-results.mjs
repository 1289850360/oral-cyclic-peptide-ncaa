import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "public", "natural-parent-evidence-review-batch-100.json");
const outputPath = path.join(root, "public", "natural-parent-evidence-review-batch-200-results.json");
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const acceptedReasons = {
  "4PQ": "apoA-I Trp72位5-羟基化前后的胆固醇外排与体内HDL生成直接比较",
  HRP: "与4PQ等价的5-羟基-L-Trp CCD，具有同一项位点特异apoA-I功能证据",
  LA2: "DLAT脂酰肽的SIRT4动力学及PDH脂酰化位点功能实验",
  TY2: "H64换入3-氨基Tyr后肌红蛋白两类氧化反应提高9倍和81倍",
  HMR: "切割位β-高精氨酸肽与对应α肽的因子Xa/凝血酶抑制比较",
  HLU: "β-羟基亮氨酸掺入对完整生长激素分泌和加工的实验",
  PSA: "statine类似物替代切割二肽后HIV-1蛋白酶亲和力提高约3个数量级",
  BTK: "H3K9丁酰化肽与其他同序列酰化肽的AF9 YEATS ITC比较",
  "7N8": "pBoF荧光蛋白的过氧亚硝酸盐响应、选择性和活细胞验证",
  BFD: "Asp-BeF3稳定模拟CheY活化态并获得FliM结合能力",
  OLT: "O-甲基Thr及其二肽的小鼠抗疟直接比较",
  "4AW": "ECFP Trp57换成4-氮杂Trp后的不溶比例和色团成熟实验",
  AZY: "3-叠氮Tyr的暗态可逆抑制和光照不可逆失活实验",
  DISEP: "PI与双磷酸Ser-PI的MIC、牙面结合及体内抗生物膜比较",
  RPI: "pArg-casein与未磷酸化casein的ClpCP结合和降解比较",
  HQA: "HQAla-LmrR的金属结合、催化转化率和对映选择性实验",
  LBZ: "H3K9/K27苯甲酰Lys肽的YEATS/DPF亲和力和晶体结构",
  LWI: "含2-(氨甲基)-Phe设计环肽的NDM-1抑制和晶体结构",
  "2FM": "AprA Met214换入二氟Met后的酶动力学与DSC比较",
  CWD: "5-氯willardiine与未取代体的AMPA受体效力和去敏化比较",
  NWD: "5-硝基willardiine与系列类似物的电压钳和放射配体比较",
  "3X9": "MTSL-Cys在calmodulin和膜蛋白中的PELDOR距离与构象测量",
};

const rejectedReasons = {
  TYQ: "检索结果主要是力场参数和PDB结构，未找到精确TYQ的可归因性质实验",
  A1H5W: "命中多为3-叠氮-D-Ala细胞壁标记或无关肽，不能转用到L构型A1H5W",
  GLJ: "命中为酶底物结构或建模，未找到5,5-二羟基正缬氨酸的直接性质对照",
  Z3E: "以保护基、合成和结构记录为主，未找到O-苄基Thr在目标肽中的性质比较",
  TH5: "O-乙酰Thr多为瞬态修饰/合成中间体，未找到可归因的肽性质对照",
  UX8: "β-羟基Trp多见天然产物和生物合成研究，缺少精确立体异构体的配对实验",
  BHD: "主要是天然产物、酶反应和结构鉴定，未找到3-羟基Asp替换性质对照",
  CSA: "S-丙酮基Cys多为化学加合物和结构记录，缺少稳定肽内单变量实验",
  OSE: "O-硫酸Ser检索易与磷酸Ser混淆，未锁定精确CCD的直接性质实验",
  "2CO": "Cys过氧化物不稳定且多为反应中间体，未找到可重复的肽内配对实验",
  CAF: "有机砷Cys以代谢/毒理和结构资料为主，不能作为肽性质证据",
  AHB: "β-羟基Asn在EGF模块中有结构和钙结合背景，但缺少同位点未修饰直接对照",
  DYA: "脱氢Asp主要被观察为蛋白损伤/成熟产物，未找到能归因的功能配对",
  SEB: "O-苄基磺酰Ser主要是保护和合成用途，没有目标性质实验",
  ASA: "天冬氨酸醛为高反应性中间体，未找到稳定残基的同骨架性质比较",
  "02Y": "重氮酮残基主要作为反应性战头或酶抑制中间体，未找到标准肽替换对照",
  VAH: "β-羟基正缬氨酸以天然产物和合成为主，未找到精确立体化学的性质对照",
  ECX: "S-乙基Cys多为修饰鉴定或代谢资料，缺少同序列Cys/ECX对照",
  TS9: "复杂多羟基Ile衍生物主要来自天然产物结构，未找到单残基贡献实验",
  MIS: "单异丙基磷酰Ser属于有机磷加合物，证据是毒理/结构而非可设计性质对照",
  LPD: "L-脯氨酰胺主要作为游离小分子或合成单元，未找到肽内Pro替换实验",
  TRF: "N1-甲酰Trp多见酶反应和代谢中间体，未找到精确残基的配对性质实验",
  DPL: "4-氧代Pro以代谢、天然产物和结构资料为主，缺少Pro/DPL同骨架对照",
  "85F": "结构相当于跨残基含硫连接体，未找到能拆分到单个CCD的性质实验",
  QCS: "S-氨甲酰Cys主要见酶活性位中间体，未找到稳定肽残基替换对照",
  "56A": "长链组氨酸衍生物仅在PDB/结构和合成资料中出现，缺少直接性质测量",
  A1D64: "芳硫基Ala/Cys类似物检索命名不唯一，未锁定精确CCD的实验对照",
  CG6: "β-甲基Cys有天然产物和合成资料，但缺少精确构型的单变量性质实验",
  "6G4": "4-氧代壬酰Lys属于脂质过氧化加合物，现有资料不能给出可归因设计结论",
  CHP: "3-氯-4-羟基苯基甘氨酸多见抗生素天然产物，未找到单残基替换对照",
  E9V: "N-甲基His有代谢和结构记录，未找到精确E9V的肽内性质比较",
  HHK: "二氨基辛酸主要作为侧链延长合成单元，未找到可追溯的直接性质实验",
  PYA: "在设计折叠肽中作为报告/配位单元出现，但未找到足以归因该残基的对照数据",
  SEM: "O-苄基Ser是常见保护形式，未找到脱离保护基用途的肽性质实验",
  TH6: "4-羟基Thr多见天然产物和生物合成，缺少精确残基的直接配对",
  ZU0: "O-tert-butyl-Thr为保护基残基，未找到最终功能肽中的直接性质证据",
  SUN: "有机磷Ser加合物属于毒理标志和不可逆酶抑制产物，不作为通用替换证据",
  HSL: "高丝氨酸内酯多作为群体感应小分子或末端环化体，不是标准肽内Ser替换",
  ELY: "N6,N6-二乙基Lys以合成和结构资料为主，缺少肽内直接性质实验",
  I3L: "烯丙基Cys多为天然产物/游离小分子药理，未找到肽内Cys单点比较",
  TYT: "CCD名称仅为‘tyrosine derivative’，文献命名无法唯一对应精确结构，不能升级",
  YHA: "本批命中以代谢和疾病标志为主；未找到满足门槛的同序列Lys/高瓜氨酸对照",
  CYG: "复杂硫代酰基Cys多为酶反应中间体，未找到稳定替换残基的实验",
  HIP: "磷酸His有生物学和结构证据，但该ND1膦酸CCD与天然pHis化学不等同且缺少配对",
  B3D: "3-氨基戊二酸检索多为小分子和代谢资料，缺少肽内Asp替换实验",
  SMF: "未找到4-磺甲基Phe的可追溯性质实验，主要为PDB和化学品记录",
  CYQ: "膦甲基硫代Cys主要作为结构/合成化学实体，缺少目标性质对照",
  CZZ: "砷Cys配位加合物以毒理和结构资料为主，不是可推广的残基性质实验",
  SVX: "有机磷Ser加合物属于神经毒剂修饰产物，未找到普通肽设计中的配对证据",
  POM: "5-甲基-4-氧代Pro主要见天然产物和酶反应，缺少Pro/POM同骨架对照",
  "4HT": "4-羟基Trp命中以天然产物和合成为主，不能用5-羟基Trp论文替代",
  HAR: "Nω-羟基Arg主要作为NO合酶反应中间体/小分子抑制剂，缺少肽内单点对照",
  OMX: "β-羟基Tyr有天然产物和合成研究，但未找到精确OMX立体异构体的性质配对",
  G1X: "Tyr醌是高反应性氧化中间体，现有资料无法作为稳定可替换残基证据",
  MCS: "丙二酰Cys主要为反应性加合物/修饰鉴定，缺少肽性质直接比较",
  BB6: "脱氢含硫残基多见天然产物结构，未找到可归因的单残基性质实验",
  WPA: "β-甲氧基Phe主要见天然产物和合成，未找到精确构型的同骨架对照",
  NLB: "专利列出含6-苄氧基正亮氨酸底物，但公开结果不足以拆分该残基的独立贡献",
  T9E: "硒代Thr以生物合成和结构鉴定为主，未找到Thr/T9E单变量性质实验",
  CZ2: "二羟基砷Cys属于砷配位/毒理加合物，不能作为普通肽残基性质证据",
  FLA: "三氟Ala主要作为酶抑制小分子和合成单元，未找到肽内Ala/FLA直接比较",
  LBY: "N6-Boc-Lys是保护基形式，未找到去保护前作为最终功能残基的性质实验",
  ME0: "羟基Met结构和命名涉及不稳定氧化物，未锁定精确CCD的配对实验",
  TY1: "O-tert-butyl-Tyr是保护基残基，未找到最终功能肽的直接性质证据",
  ZDJ: "3-甲基Tyr有结构和生物合成资料，但本轮未找到可归因的肽内直接对照",
  SET: "氨基Ser命中主要为合成和酶中间体，未找到精确SET单残基性质实验",
  XCN: "S-氰基Cys多为反应性修饰与毒理，未找到稳定肽内替换的性质对照",
  "0QL": "Cys-半胱胺混合二硫键为可逆加合物，缺少可归因的目标肽性质实验",
  "7OZ": "有游离氟代氨基酸示踪研究，但未能确认与该CCD构型及肽内用途完全一致",
  BCS: "S-苄基Cys主要是保护基/合成用途，未找到最终肽性质的直接比较",
  CY4: "S-丁酰Cys以反应中间体和修饰鉴定为主，缺少稳定肽内单变量实验",
  JJJ: "烟酰基Cys主要为酶加合物/结构记录，未找到可设计残基性质对照",
  "0UO": "4-甲氧基Trp存在于天然产物，但现有活性比较伴随其他结构变化，不能单独归因",
  C22: "3-氯Ala虽有游离酶抑制资料，但其反应性机制不等同于肽内残基性质，本轮不升级",
  K1R: "复杂硫亚酰胺交联体是反应产物，不能拆分为可替换的单残基性质",
  KOR: "N-硫代亚砜亚胺为酶活性位反应产物，缺少稳定肽替换对照",
  ZIQ: "α-甲基Trp命中主要为PET示踪/游离代谢研究，未找到肽内Trp/ZIQ直接比较",
  A1MCG: "未找到该嘧啶氨基Phe精确结构的可追溯性质实验",
};

const accepted = [];
const notUpgraded = [];
for (const record of input.records) {
  const { ccdId } = record;
  if (acceptedReasons[ccdId]) accepted.push({ ccdId, reason: acceptedReasons[ccdId] });
  else notUpgraded.push({ ccdId, reason: rejectedReasons[ccdId] ?? "未找到能对应精确CCD并满足直接实验门槛的证据" });
}

const result = {
  reviewedAt: "2026-09-03",
  scope: "第三批100条原‘结构规则建议’记录的逐条论文/专利核验（累计完成200条）",
  decisionRule: "只有论文或专利能对应精确残基，并能说清实验体系、变化方向和适用边界，才升级为实验性质证据。完整蛋白、多位点掺入、游离氨基酸药理和同骨架实验分别降级标注；只有合成、PDB出现、结构鉴定、代谢存在或宽泛综述不升级。",
  reviewedCount: input.records.length,
  acceptedCount: accepted.length,
  notUpgradedCount: notUpgraded.length,
  accepted,
  notUpgraded,
};

fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, outputPath)}: ${accepted.length} accepted, ${notUpgraded.length} not upgraded.`);
