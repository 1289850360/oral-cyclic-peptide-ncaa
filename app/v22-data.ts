import type { Residue } from "./residue-data";

export type DesignGuide = {
  replace: string;
  goal: string;
  avoid: string;
};

export type ExperimentDatum = {
  comparison: string;
  endpoint: string;
  result: string;
  system: string;
  formulation: string;
};

export type PatentTier = "D1" | "D2" | "D3";

export const patentTierMeta: Record<PatentTier, { label: string; description: string }> = {
  D1: { label: "具体实例＋性质数据", description: "专利给出明确化合物或序列，并报告与该实例对应的活性、ADME、渗透性或药代数据。" },
  D2: { label: "具体实例，未拆分残基贡献", description: "专利明确合成或列出具体序列，但没有该残基的单点对照，或性质数据不能与单个残基对应。" },
  D3: { label: "权利要求候选", description: "残基只出现在候选集合、Markush范围或权利要求中，尚缺少可对应的具体实验结果。" },
};

export const patentTierByEnglish: Record<string, PatentTier> = {
  "D-Ile": "D2",
  "D-Phe": "D2",
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": "D2",
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": "D2",
  "Aze · azetidine-2-carboxylic acid": "D3",
  "Nva · norvaline": "D3",
  "Tle / Tbg · tert-leucine / tert-butylglycine": "D3",
  "Cha · cyclohexylalanine": "D3",
};

const specificGuides: Record<string, DesignGuide> = {
  "N-Me-D-Leu": { replace: "Leu／D-Leu，优先放在疏水位或转角邻位", goal: "同时减少主链NH、增强疏水接触和抗酶解性", avoid: "主链NH直接参与靶点氢键，或侧链构型高度受限的位置" },
  "N-Me-Leu": { replace: "Leu", goal: "降低主链供氢与暴露极性，扩大连续疏水表面", avoid: "依赖Leu主链NH结合靶点的位置" },
  "N-Me-Ile": { replace: "Ile；可与N-Me-Leu成对比较", goal: "兼顾疏水占位、支链几何和主链极性屏蔽", avoid: "空间狭窄或需要未甲基化主链NH的位置" },
  "N-Me-Ala / D-N-Me-Ala": { replace: "Ala、D-Ala或小型转角位", goal: "在不明显增脂的情况下去掉一个主链氢键供体", avoid: "小侧链承担关键紧密堆积，或替换会引发全环重排的位置" },
  "N-Me-Thr": { replace: "Thr", goal: "保留侧链羟基，同时在溶解度和渗透性之间折中", avoid: "追求最大疏水膜分配，或Thr主链NH参与结合的位置" },
  "N-Me-Ser": { replace: "Ser", goal: "保留小型羟基侧链并屏蔽主链NH", avoid: "以最大被动渗透性为唯一目标的位置" },
  "N-Me-Asp": { replace: "Asp；更适合作为酸性或极性边界对照", goal: "增加溶解度或保留酸性结合点，同时减少一个主链NH", avoid: "侧链羧酸会暴露于膜环境、且没有内部离子对可遮蔽的位置" },
  "N-Me-Tyr": { replace: "Tyr", goal: "保留芳香锚点和酚羟基，同时降低主链极性", avoid: "Tyr主链NH或芳环方向对结合至关重要的位置" },
  "N-Me-D-Trp": { replace: "Trp／D-Trp", goal: "组合芳香锚定、反向转角和抗酶解性", avoid: "口袋体积有限，或吲哚NH造成额外暴露极性的位置" },
  "N-Me-Lys": { replace: "Lys；仅在必须保留碱性侧链或连接把手时考虑", goal: "去除主链NH，同时保留侧链正电荷或衍生化能力", avoid: "赖氨酸侧链电荷持续暴露、且目标是被动扩散的位置" },
  "N-Me-Phe": { replace: "Phe", goal: "减少主链极性并保留芳香疏水和π相互作用", avoid: "连续芳香残基已经导致低溶解度或聚集的位置" },
  "N-Me-Val": { replace: "Val", goal: "在紧凑疏水核心中减少主链NH并限制局部构象", avoid: "支链拥挤或Val主链NH参与结合的位置" },
  "Sarcosine · Sar · N-Me-Gly": { replace: "Gly或需要无侧链转角的位点", goal: "去除主链NH、调节转角和肽键cis/trans平衡", avoid: "无法容忍构象异质性或需要α-碳手性控制的位置" },
  "D-Pro": { replace: "L-Pro或β-turn的i+1位", goal: "反转转角几何并提高抗蛋白酶能力", avoid: "Pro环方向直接决定靶点结合的刚性位点" },
  "D-Ala": { replace: "L-Ala或体积较小的转角位", goal: "以最小侧链负担改变转角和蛋白酶识别", avoid: "需要L构型精确侧链朝向的结合位点" },
  "D-Val": { replace: "L-Val", goal: "保留疏水支链并反转局部立体化学", avoid: "Val侧链直接嵌入立体选择性口袋的位置" },
  "D-Leu": { replace: "L-Leu", goal: "保持疏水体积，同时改变侧链朝向和抗酶解性", avoid: "Leu侧链方向已由共晶结构证明不可改变的位置" },
  "D-Ile": { replace: "L-Ile", goal: "保留支链疏水性并重排转角与蛋白酶识别", avoid: "Ile立体几何直接参与靶点紧密堆积的位置" },
  "D-Phe": { replace: "L-Phe", goal: "改变芳环朝向、转角和蛋白酶稳定性", avoid: "芳环取向对π堆积或口袋填充已经最优化的位置" },
  "Aib · α-aminoisobutyric acid": { replace: "Ala、Pro或柔性转角位", goal: "通过α,α-二取代限制主链并促进内部氢键", avoid: "已经高度预组织，或目标构象不兼容Aib允许区的位置" },
  "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid": { replace: "Leu／Ile样疏水位或蛋白酶切割敏感位", goal: "同时调节主链长度、溶解度、内部氢键和稳定性", avoid: "不能容忍主链延长或侧链羟基的精密结合位点" },
  "β-homoproline · β-HPro": { replace: "Pro或转角位", goal: "改变环尺寸与转角几何，并增强胃肠和代谢稳定性", avoid: "小环中无法容忍额外主链碳原子的位置" },
  "(1R,2S)-2-ACPC · β¹": { replace: "Pro、Ala或β-turn位", goal: "刚化β骨架并提高血清稳定性", avoid: "以直接增渗为唯一目的，或不能容忍β氨基酸主链延长的位置" },
  "(1S,2S)-2-ACHC · β²": { replace: "较大疏水转角位或Pro样位置", goal: "增加局部刚性、疏水体积并稳定γ-turn／β折叠", avoid: "口袋空间有限或需要普通α氨基酸几何的位置" },
  "NLeu peptoid · N-isobutylglycine": { replace: "Leu或暴露主链NH附近的疏水位", goal: "把侧链移到酰胺氮，去除主链NH并扩展构象空间", avoid: "依赖普通α氨基酸手性和主链几何的结合位点" },
  "Pye · N,N-pyrrolidinylglutamine": { replace: "Leu／Gln，且侧链可接近暴露主链NH的位置", goal: "形成侧链—主链氢键，在不单纯增脂的情况下遮蔽极性", avoid: "几何距离无法形成内部氢键，或吡咯烷酰胺造成空间冲突的位置" },
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": { replace: "L-Pro；可与Pro、trans-(2S,4R)-4-F-Pro成组比较", goal: "微调脯氨酸环折叠、前一肽键cis/trans平衡和代谢稳定性", avoid: "没有构象依据时把氟化直接当作增渗手段" },
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": { replace: "Phe或计划侧链桥连的芳香位", goal: "合并芳香结合面和对位交联／酰化把手", avoid: "伯胺保持游离并暴露、且目标是被动扩散的位置" },
  "Aze · azetidine-2-carboxylic acid": { replace: "Pro", goal: "用更小的四元环扫描紧凑转角和cis/trans构象", avoid: "缺少构象验证时直接进入大规模合成，或环张力不兼容的位置" },
  "Nva · norvaline": { replace: "Val、Leu或Abu", goal: "比较直链与支链疏水侧链的堆积差异", avoid: "希望通过替换减少主链NH，或需要Val支链精确定位的位置" },
  "Tle / Tbg · tert-leucine / tert-butylglycine": { replace: "Val、Ile或Leu", goal: "增加位阻、疏水占位和代谢屏蔽", avoid: "溶解度已偏低、口袋狭窄或非特异结合风险较高的位置" },
  "Cha · cyclohexylalanine": { replace: "Phe、Leu或其他大疏水位", goal: "扩大非芳香疏水表面和口袋占位", avoid: "溶解度、聚集或血浆蛋白结合已经成为限制的位置" },
  "Pal · pyridylalanine": { replace: "Phe／Tyr", goal: "保留芳香表面，同时增加杂环氮受体并调节溶解度", avoid: "吡啶氮可能破坏纯疏水口袋，或质子化状态不利的位置" },
  "O-Me-Tyr · O-methyl-L-tyrosine": { replace: "Tyr", goal: "屏蔽酚羟基供氢并增加芳香侧链的膜分配倾向", avoid: "酚羟基是关键靶点氢键供体的位置" },
  "N-substituted 5-F-Trp": { replace: "Trp或5-F-Trp，且该位点计划参与侧链连接", goal: "组合芳香锚定、吲哚电子调节、侧链供氢屏蔽和交联", avoid: "把单纯氟化视为必然增渗，或靶点需要游离吲哚NH的位置" },
  "2-Me-Pro · 2-methyl-L-proline": { replace: "Pro或强转角位", goal: "进一步锁定Pro样构象并降低蛋白酶识别", avoid: "尚未确定活性构象，或不能容忍α位额外甲基的位置" },
  "AmPhe · 3-(aminomethyl)-L-phenylalanine": { replace: "Phe或需要间位桥连的芳香位", goal: "把芳香结合与侧链交联把手合并", avoid: "游离胺持续带电、且未计划交联或酰化的位置" },
  "(3S)-3-hydroxy-L-proline · 3-Hyp": { replace: "Pro或计划构建醚桥的转角位", goal: "保留Pro式约束，并利用3-羟基建立分子内连接", avoid: "把游离3-Hyp本身当作已验证增渗残基，或羟基无法形成预期连接的位置" },
  "D-Dap(tail) · side-chain-acylated D-2,3-diaminopropionic acid": { replace: "Ala、D-Ala或需要短连接把手的位置", goal: "连接增溶尾部并利用D构型降低蛋白酶识别", avoid: "把永久正电尾部放入疏水核心或依赖被动扩散的膜内侧" },
  "3-Cl-Phe · 3-chloro-L-phenylalanine": { replace: "Phe；与F-Phe、Phe做卤素梯度", goal: "小幅增加脂溶性、填充疏水口袋并封堵芳环代谢", avoid: "溶解度已不足或卤素不能被口袋容纳的位置" },
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph": { replace: "Phe／Hph，且靶点存在较深疏水口袋的位置", goal: "同时改变芳环距离、强疏水占位和代谢稳定性", avoid: "水溶性已低、口袋浅或无法容忍侧链延长的位置" },
  "Ac5c · 1-aminocyclopentane-1-carboxylic acid": { replace: "Aib、Ala或需要强刚化的转角位", goal: "用环状α,α-二取代预组织主链并增加疏水体积", avoid: "需要屏蔽主链NH，或环戊烷体积会造成冲突的位置" },
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine": { replace: "疏水锚定位；更适合天然产物启发型骨架设计", goal: "组合长烯基膜分配、N-甲基化和环境依赖折叠", avoid: "把复杂MeBmt当作普通Leu等排体，或缺少构象分析的位置" },
  "Abu · L-2-aminobutyric acid": { replace: "Ala、Val之间的小型疏水位", goal: "以较小体积微调疏水填充和膜分配", avoid: "希望减少主链NH，或需要Val支链几何的位置" },
  "hydroxy-acid / depsipeptide substitution": { replace: "暴露且不参与关键结合的酰胺NH位点", goal: "把酰胺改为酯，减少一个骨架氢键供体和去溶剂化负担", avoid: "酯键易水解、羰基几何对结合关键或胃肠稳定性不足的位置" },
  "thioamide substitution": { replace: "暴露酰胺羰基或代谢敏感的骨架位置", goal: "增加局部脂溶性、刚性及胃肠／代谢稳定性", avoid: "羰基氢键受体对靶点结合关键，或硫原子体积造成冲突的位置" },
};

export const getDesignGuide = (record: Residue): DesignGuide => specificGuides[record.english] ?? {
  replace: "需要依据母体序列和结构确定",
  goal: "用于残基化学空间与构象扫描",
  avoid: "缺少母体对照、构象分析和多性质联测时直接作出结论",
};

export const experimentData: Record<string, ExperimentDatum> = {
  "N-Me-D-Leu": { comparison: "含该残基的完整环六肽；非单点对照", endpoint: "口服生物利用度", result: "F = 28%", system: "大鼠", formulation: "原文给药条件；结果属于完整骨架" },
  "N-Me-Leu": { comparison: "同一环六肽骨架的残基系列", endpoint: "RRCK被动渗透性", result: "Papp = 13.0 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Ile": { comparison: "N-Me-Leu位点替换系列", endpoint: "RRCK被动渗透性", result: "Papp = 8.9 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Thr": { comparison: "相同环六肽单点替换系列", endpoint: "RRCK被动渗透性", result: "Papp = 4.7 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Ser": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 83；Papp = 1.6 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外性质与渗透实验" },
  "N-Me-Asp": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 125；Papp = 0.6 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外性质与渗透实验；作为极性负面对照更合适" },
  "N-Me-Tyr": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 100；Papp = 1.3 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外单点替换数据；另有完整口服骨架证据" },
  "N-Me-Lys": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 103；Papp = 0.3 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外单点替换数据；提示暴露正电侧链不利于被动扩散" },
  "N-Me-D-Trp": { comparison: "生长抑素类似物的多位N-甲基扫描", endpoint: "口服生物利用度", result: "优选三N-甲基类似物约10%", system: "大鼠", formulation: "完整骨架结果；非单点贡献" },
  "N-Me-Phe": { comparison: "生长抑素类似物的多位N-甲基扫描", endpoint: "口服生物利用度", result: "优选三N-甲基类似物约10%", system: "大鼠", formulation: "完整骨架结果；非单点贡献" },
  "N-Me-Val": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "Sarcosine · Sar · N-Me-Gly": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "D-Val": { comparison: "多种6–12元从头设计大环", endpoint: "PAMPA", result: "84个设计Papp > 1 × 10⁻⁶ cm/s", system: "PAMPA／设计集合", formulation: "组合骨架统计；非D-Val单点结果" },
  "D-Leu": { comparison: "同类环六肽立体化学位置异构体", endpoint: "RRCK被动渗透性", result: "1.8 对 0.5 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "位置依赖的直接比较" },
  "Aib · α-aminoisobutyric acid": { comparison: "Pro→Aib成对替换", endpoint: "被动渗透性", result: "柔性骨架最高约8倍提高", system: "6–8元环肽；体外与小鼠", formulation: "已预组织骨架未必受益" },
  "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid": { comparison: "含／不含statine的环六肽系列", endpoint: "口服生物利用度", result: "代表化合物F = 21%", system: "大鼠", formulation: "完整候选分子结果" },
  "β-homoproline · β-HPro": { comparison: "优化后的五构件血栓酶抑制剂", endpoint: "口服生物利用度", result: "F = 18.4 ± 1.9%", system: "大鼠", formulation: "完整优化骨架结果" },
  "(1R,2S)-2-ACPC · β¹": { comparison: "含β¹／β²的Mpro宏环与Ala替换体", endpoint: "血清稳定性", result: "BM3 t½ = 48 h；BM7 t½ > 168 h", system: "血清稳定性实验", formulation: "β¹与β²共存，不能拆分单残基贡献" },
  "(1S,2S)-2-ACHC · β²": { comparison: "含β¹／β²的Mpro宏环与Ala替换体", endpoint: "血清稳定性", result: "BM3 t½ = 48 h；BM7 t½ > 168 h", system: "血清稳定性实验", formulation: "β¹与β²共存，不能拆分单残基贡献" },
  "3-Cl-Phe · 3-chloro-L-phenylalanine": { comparison: "LUNA18系列侧链优化", endpoint: "Caco-2／细胞活性门槛", result: "细胞活性通常出现在Papp约0.4 × 10⁻⁶ cm/s以上", system: "Caco-2与KRAS细胞实验", formulation: "系列阈值；不是3-Cl-Phe单点数值" },
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph": { comparison: "AP0343第7位Phe(3-Cl)→Hph(4-CF₃)", endpoint: "结合／细胞活性及构象", result: "活性提高并保持主链构象", system: "KRAS结合、细胞与晶体结构", formulation: "LUNA18临床结构另含3,5-二氟取代；收益非单纯增渗" },
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "hydroxy-acid / depsipeptide substitution": { comparison: "酰胺→酯与母体／N-甲基类似物", endpoint: "PAMPA", result: "5个酯类似物均高于母体；4个高于相应N-甲基体", system: "模型环六肽与8–9元环", formulation: "体外渗透；需另测酯键水解" },
  "thioamide substitution": { comparison: "单个C=O→C=S与母体", endpoint: "PAMPA／Caco-2与口服血浆暴露", result: "多处替换改善渗透性；优选类似物口服暴露显著提高", system: "6–8元大环；体外与大鼠口服", formulation: "作用强度明显依赖替换位置，不能套用统一倍数" },
};

export const supportScope = (record: Residue): string[] => {
  const scope: string[] = [];
  const text = `${record.effect} ${record.evidence}`;
  if (/Papp|PAMPA|Caco-2|RRCK|渗透/.test(text)) scope.push("渗透性");
  if (/稳定|抗酶解|半衰期|t½/.test(text)) scope.push("稳定性");
  if (/口服|生物利用度|血浆暴露/.test(text)) scope.push("口服暴露");
  if (/溶解度|水溶/.test(text)) scope.push("溶解度");
  if (record.level === "专利证据") scope.push("专利化学空间");
  if (record.level === "临床骨架") scope.push("成功骨架兼容性");
  if (!scope.length) scope.push("构象／活性骨架");
  return [...new Set(scope)];
};
