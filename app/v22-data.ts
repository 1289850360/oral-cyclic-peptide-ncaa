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
  "αMeVal8 · GLP-1 DPP-4 patent example": "D2",
  "2-Nal7 · GLP-1 DPP-4 patent example": "D2",
  "D-Ile": "D2",
  "D-Phe": "D2",
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": "D2",
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": "D2",
  "Aze · azetidine-2-carboxylic acid": "D3",
  "Nva · norvaline": "D3",
  "Tle / Tbg · tert-leucine / tert-butylglycine": "D3",
  "Cha · cyclohexylalanine": "D3",
  "trans-4-F-Pro · (2S,4R)-4-fluoroproline": "D3",
  "4-Hyp · trans-4-hydroxy-L-proline": "D3",
  "Orn · L-ornithine": "D3",
  "Dap · L-2,3-diaminopropionic acid": "D3",
  "Hph · L-homophenylalanine": "D3",
  "2-Nal · 2-naphthylalanine": "D3",
  "5-F-Trp · 5-fluoro-L-tryptophan": "D3",
};

const specificGuides: Record<string, DesignGuide> = {
  "Aib8 · GLP-1 DPP-4 resistance": { replace: "已知蛋白酶切割位点上的Ala", goal: "利用α,α-二取代位阻阻断DPP-4样切割", avoid: "没有明确切割位点，或该位点侧链直接参与受体结合时" },
  "Abu8 · GLP-1 plasma stability": { replace: "蛋白酶切割位点上的Ala", goal: "以轻度增大的疏水侧链提高切割位点耐受性", avoid: "把线性GLP-1结果直接外推为环肽口服增益" },
  "αMePro · HIV-1 macrocycle proteolytic stability": { replace: "大环中的Pro转角位", goal: "以α-甲基位阻提高蛋白酶稳定性并固定局部构象", avoid: "未做位置扫描；原文其他位置α-甲基化可降低活性" },
  "αMeVal · HIV-1 macrocycle proteolytic stability": { replace: "大环中的Val位", goal: "在保留支化疏水侧链时增加α位位阻", avoid: "结合界面几何严格或α位拥挤的位置" },
  "(1S,2S)-2-ACPC · GLP-1 α/β analogue": { replace: "螺旋区的Ala、Gly、Ser或Lys位；必须按周期布置", goal: "用受限β骨架抑制多处蛋白酶切割并维持螺旋", avoid: "把多残基组合结果解释为单个ACPC的固定倍数" },
  "D-Phg · D-phenylglycine L-DOPA carrier": { replace: "不建议直接用于普通残基替换；更适合作为PepT1前药载体端", goal: "形成可被肠道肽转运体识别的二肽型前药", avoid: "把主动转运前药结果当作被动膜渗透或环肽规则" },
  "αMeVal8 · GLP-1 DPP-4 patent example": { replace: "GLP-1样序列第8位Ala", goal: "增加DPP-4切割位点的位阻", avoid: "专利未公开可归属于该残基的独立半衰期数值" },
  "2-Nal7 · GLP-1 DPP-4 patent example": { replace: "GLP-1样序列N端His位；需与第8位共同优化", goal: "重塑N端蛋白酶识别并保留受体结合", avoid: "该实例同时改变第8位，不能拆分2-Nal单点贡献" },
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
  "Aib8 · GLP-1 DPP-4 resistance": { comparison: "GLP-1 Ala8→Aib与母体GLP-1", endpoint: "猪血浆DPP-4降解／受体亲和力", result: "Aib8在6 h内未检测到降解；母体t½ = 28 min", system: "猪血浆、静脉输注与GLP-1R细胞实验", formulation: "线性GLP-1位点对照；不是口服或环肽实验" },
  "Abu8 · GLP-1 plasma stability": { comparison: "GLP-1 Ala8→L-Abu与母体GLP-1", endpoint: "人血浆半衰期／细胞信号与小鼠药效", result: "(Abu8)GLP-1 t½ > 12 h；母体约6.2 h", system: "人血浆、细胞与ob/ob小鼠", formulation: "稳定性和药效直接；未测口服吸收" },
  "αMePro · HIV-1 macrocycle proteolytic stability": { comparison: "HIV-1抑制大环第3位Pro→αMePro", endpoint: "人肝S9稳定性／细胞抗病毒活性／后续大鼠PK", result: "稳定性与细胞活性改善；保留该构件的后续化合物获得口服暴露", system: "人肝S9、MT-4细胞与大鼠", formulation: "位置依赖；后续候选还有其他同步优化" },
  "αMeVal · HIV-1 macrocycle proteolytic stability": { comparison: "HIV-1抑制大环第4位Val→αMeVal", endpoint: "人肝S9稳定性／细胞抗病毒活性", result: "两项均改善", system: "人肝S9与MT-4细胞", formulation: "原文未给出可独立抄录的单点口服F%；其他位置甲基化可能有害" },
  "(1S,2S)-2-ACPC · GLP-1 α/β analogue": { comparison: "5处环状β残基＋2处Aib的GLP-1类似物与母体", endpoint: "DPP-4／neprilysin稳定性及持续药效", result: "DPP-4 7 d无可测切割；NEP t½ 83 h对20 min", system: "体外蛋白酶与小鼠腹腔给药", formulation: "多处联合替换；不是ACPC单点，也不是口服实验" },
  "D-Phg · D-phenylglycine L-DOPA carrier": { comparison: "D-Phg-L-DOPA二肽前药与L-DOPA", endpoint: "空肠通透参数／口服生物利用度", result: "Pm* 2.58对0.94；大鼠口服生物利用度提高31.7倍", system: "大鼠刷状缘囊泡、空肠灌流与口服PK", formulation: "PepT1主动转运前药；不能外推为环肽被动增渗" },
  "αMeVal8 · GLP-1 DPP-4 patent example": { comparison: "具体序列CBP0015：GLP-1第8位αMeVal", endpoint: "DPP-4稳定性／GLP-1R激动", result: "专利报告高于野生型并列为高稳定实例", system: "WO2025093774A1具体序列与实验声明", formulation: "D2专利证据；公开文本未给出αMeVal可独立读取的半衰期" },
  "2-Nal7 · GLP-1 DPP-4 patent example": { comparison: "[2Nal]-GLP-1，同时第8位改为Glu", endpoint: "DPP-4稳定性／BLI受体结合", result: "所示实验中保持稳定；Kd = 37.4 nM", system: "WO2025093774A1蛋白酶与BLI实验", formulation: "两处联合改造，不能拆分2-Nal单点作用" },
  "N-Me-D-Leu": { comparison: "含该残基的完整环六肽；非单点对照", endpoint: "口服生物利用度", result: "F = 28%", system: "大鼠", formulation: "原文给药条件；结果属于完整骨架" },
  "N-Me-Leu": { comparison: "同一环六肽骨架的残基系列", endpoint: "RRCK被动渗透性", result: "Papp = 13.0 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Ile": { comparison: "N-Me-Leu位点替换系列", endpoint: "RRCK被动渗透性", result: "Papp = 8.9 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Thr": { comparison: "相同环六肽单点替换系列", endpoint: "RRCK被动渗透性", result: "Papp = 4.7 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "体外渗透实验；未报告口服F%" },
  "N-Me-Ser": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 83；Papp = 1.6 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外性质与渗透实验" },
  "N-Me-Asp": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 125；Papp = 0.6 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外性质与渗透实验；作为极性负面对照更合适" },
  "N-Me-Tyr": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 100；Papp = 1.3 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外单点替换数据；另有完整口服骨架证据" },
  "N-Me-Lys": { comparison: "相同环六肽单点替换系列", endpoint: "EPSA／RRCK Papp", result: "EPSA = 103；Papp = 0.3 × 10⁻⁶ cm/s", system: "EPSA与RRCK", formulation: "体外单点替换数据；提示暴露正电侧链不利于被动扩散" },
  "N-Me-Ala / D-N-Me-Ala": { comparison: "环十肽中 D-Pro→D-N-Me-Ala；侧链减少一个亚甲基", endpoint: "低介电构象／被动渗透性", result: "形成新的鞍形构象并屏蔽4个骨架NH；获得高渗透骨架", system: "构象分析与体外渗透实验", formulation: "直接位置替换；构象发生全环重排" },
  "N-Me-D-Trp": { comparison: "生长抑素类似物的多位N-甲基扫描", endpoint: "口服生物利用度", result: "优选三N-甲基类似物约10%", system: "大鼠", formulation: "完整骨架结果；非单点贡献" },
  "N-Me-Phe": { comparison: "生长抑素类似物的多位N-甲基扫描", endpoint: "口服生物利用度", result: "优选三N-甲基类似物约10%", system: "大鼠", formulation: "完整骨架结果；非单点贡献" },
  "N-Me-Val": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "Sarcosine · Sar · N-Me-Gly": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "D-Val": { comparison: "多种6–12元从头设计大环", endpoint: "PAMPA", result: "84个设计Papp > 1 × 10⁻⁶ cm/s", system: "PAMPA／设计集合", formulation: "组合骨架统计；非D-Val单点结果" },
  "D-Pen · D-penicillamine": { comparison: "D-Pen或Cys参与闭环的DPDPE样肽与线性对应物", endpoint: "模型膜渗透性", result: "线性对应物的渗透性约为相应环肽的3–7倍", system: "配对模型膜实验", formulation: "这是特定二硫键闭环方式的负向证据，不证明D-Pen普遍降低渗透性" },
  "D-Leu": { comparison: "同类环六肽立体化学位置异构体", endpoint: "RRCK被动渗透性", result: "1.8 对 0.5 × 10⁻⁶ cm/s", system: "RRCK细胞单层", formulation: "位置依赖的直接比较" },
  "D-Pro": { comparison: "环十肽 β-turn i+1 位引入 D-Pro", endpoint: "渗透性／清除与口服暴露", result: "优化骨架兼具较好渗透性、清除性质和口服暴露", system: "体外 ADME 与动物药代", formulation: "多参数优化结果；不是单一渗透终点" },
  "D-Ala": { comparison: "54个环六肽模板围绕 D-Ala 转角及邻位 N-甲基化进行组合", endpoint: "Caco-2渗透性", result: "高渗透模板均依赖特定 D-Ala 转角环境", system: "Caco-2与构象分析", formulation: "组合模板证据；未拆分 D-Ala 单独贡献" },
  "D-Ile": { comparison: "专利具体序列 iPfiPf 中含两个 D-Ile", endpoint: "PAMPA／候选集合口服暴露", result: "序列进入膜通透候选集合", system: "6–12元从头设计大环与专利实例", formulation: "完整序列结果；无 D-Ile 单点对照" },
  "D-Phe": { comparison: "专利具体序列 iPfiPf 中含两个 D-Phe", endpoint: "PAMPA／候选集合口服暴露", result: "序列进入膜通透候选集合", system: "6–12元从头设计大环与专利实例", formulation: "完整序列结果；无 D-Phe 单点对照" },
  "Aib · α-aminoisobutyric acid": { comparison: "Pro→Aib成对替换", endpoint: "被动渗透性", result: "柔性骨架最高约8倍提高", system: "6–8元环肽；体外与小鼠", formulation: "已预组织骨架未必受益" },
  "Sta · (3S,4S)-4-amino-3-hydroxy-6-methylheptanoic acid": { comparison: "含／不含statine的环六肽系列", endpoint: "口服生物利用度", result: "代表化合物F = 21%", system: "大鼠", formulation: "完整候选分子结果" },
  "β-homoproline · β-HPro": { comparison: "优化后的五构件血栓酶抑制剂", endpoint: "口服生物利用度", result: "F = 18.4 ± 1.9%", system: "大鼠", formulation: "完整优化骨架结果" },
  "(1R,2S)-2-ACPC · β¹": { comparison: "含β¹／β²的Mpro宏环与Ala替换体", endpoint: "血清稳定性", result: "BM3 t½ = 48 h；BM7 t½ > 168 h", system: "血清稳定性实验", formulation: "β¹与β²共存，不能拆分单残基贡献" },
  "(1S,2S)-2-ACHC · β²": { comparison: "含β¹／β²的Mpro宏环与Ala替换体", endpoint: "血清稳定性", result: "BM3 t½ = 48 h；BM7 t½ > 168 h", system: "血清稳定性实验", formulation: "β¹与β²共存，不能拆分单残基贡献" },
  "NLeu peptoid · N-isobutylglycine": { comparison: "42个半肽型大环中进行 peptide→NLeu peptoid 位置替换", endpoint: "PAMPA／Caco-2", result: "含NLeu的系列整体渗透性较高，但存在低渗透立体异构体", system: "PAMPA与Caco-2细胞单层", formulation: "直接替换系列；结果仍依赖位置和立体化学" },
  "Pye · N,N-pyrrolidinylglutamine": { comparison: "环六肽非对映体中 Leu→Pye", endpoint: "水溶性／PAMPA／Caco-2及构象", result: "特定位置替换同时提高溶解度与渗透性，并观察到侧链-主链氢键", system: "体外性质、细胞单层与结构实验", formulation: "位置依赖的直接替换；不能外推至任意位点" },
  "cis-4-F-Pro · (2S,4S)-4-fluoroproline": { comparison: "PCSK9多环肽化合物102中实际引入(2S,4S)-4-F-Pro", endpoint: "合成可行性／专利候选", result: "完成具体化合物合成", system: "WO2019246405A1具体实例", formulation: "未提供Pro→4-F-Pro单点ADME对照" },
  "4-AmPhe · 4-(aminomethyl)-L-phenylalanine": { comparison: "PCSK9多环肽化合物102中引入对位氨甲基芳香构件", endpoint: "合成与桥连可行性", result: "完成具体化合物合成", system: "WO2019246405A1具体实例", formulation: "价值主要来自桥连把手；未报告单点渗透性" },
  "Aze · azetidine-2-carboxylic acid": { comparison: "作为PCSK9多环肽R3位Pro小环同系物候选", endpoint: "权利要求化学空间", result: "列入R3候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；没有具体单点实验结果" },
  "Nva · norvaline": { comparison: "作为PCSK9多环肽R1/R2位直链疏水侧链候选", endpoint: "权利要求化学空间", result: "列入多个位置候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；没有可归属Nva的单点ADME数据" },
  "Tle / Tbg · tert-leucine / tert-butylglycine": { comparison: "作为PCSK9多环肽R2位大位阻疏水候选", endpoint: "权利要求化学空间", result: "TBG列入R2候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；未报告单点口服药代" },
  "Cha · cyclohexylalanine": { comparison: "作为PCSK9多环肽R5位芳香/疏水位替代候选", endpoint: "权利要求化学空间", result: "CHA列入R5候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；未报告Cha单点增渗结果" },
  "trans-4-F-Pro · (2S,4R)-4-fluoroproline": { comparison: "与4SFPRO并列作为PCSK9多环肽R3位候选", endpoint: "立体异构体化学空间", result: "4RFPRO列入R3候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；未报告与Pro或顺式异构体的ADME对照" },
  "4-Hyp · trans-4-hydroxy-L-proline": { comparison: "作为PCSK9多环肽R3位4-取代Pro候选", endpoint: "权利要求化学空间", result: "4RHPRO列入R3候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；未报告单点口服暴露" },
  "Orn · L-ornithine": { comparison: "作为PCSK9多环肽R1位碱性侧链/连接把手候选", endpoint: "权利要求化学空间", result: "ORN列入R1候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；不支持游离Orn直接增渗" },
  "Dap · L-2,3-diaminopropionic acid": { comparison: "作为PCSK9多环肽R1位短侧链胺候选", endpoint: "权利要求化学空间", result: "DAP列入R1候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；主要支持交联/修饰设计" },
  "Hph · L-homophenylalanine": { comparison: "作为PCSK9多环肽R5位Phe侧链长度候选", endpoint: "权利要求化学空间", result: "HPHE列入R5候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；未报告Hph单点渗透性" },
  "2-Nal · 2-naphthylalanine": { comparison: "作为PCSK9多环肽R5位扩大芳香表面的候选", endpoint: "权利要求化学空间", result: "2NA列入R5候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；需同步评估溶解度和非特异结合" },
  "5-F-Trp · 5-fluoro-L-tryptophan": { comparison: "作为PCSK9多环肽Formula II R5位Trp电子/代谢扫描候选", endpoint: "权利要求化学空间", result: "5FW列入R5候选集合", system: "WO2019246405A1 Markush范围", formulation: "D3证据；不能与N-取代交联构件等同" },
  "Pal · pyridylalanine": { comparison: "口服凝血酶抑制剂系列中以Cys-Phe/Cys-Pal模体进行芳香位优化", endpoint: "PAMPA／胃肠蛋白酶稳定性／活性", result: "多种含Pal骨架兼具活性、稳定性和可测渗透性", system: "体外渗透、稳定性与酶活实验", formulation: "完整骨架证据；当前记录未固定Pal异构体" },
  "O-Me-Tyr · O-methyl-L-tyrosine": { comparison: "enlicitide三环PCSK9抑制剂完整骨架中的非蛋白残基", endpoint: "人体口服疗效与药代", result: "可兼容获批口服大环肽骨架", system: "临床研究与获批药物", formulation: "无法从交联、其他残基和制剂中拆分单点贡献" },
  "N-substituted 5-F-Trp": { comparison: "enlicitide中5-F-Trp衍生物进一步吲哚N-烷基化并参与交联", endpoint: "人体口服疗效与药代", result: "复合构件可兼容获批三环骨架", system: "临床研究与结构解析", formulation: "氟化、N-取代和交联贡献未拆分" },
  "2-Me-Pro · 2-methyl-L-proline": { comparison: "enlicitide三环骨架中的转角限制单元", endpoint: "人体口服疗效与药代", result: "可兼容获批口服大环肽骨架", system: "临床研究与结构解析", formulation: "没有2-Me-Pro→Pro单点药代对照" },
  "AmPhe · 3-(aminomethyl)-L-phenylalanine": { comparison: "enlicitide中把芳香结合单元与侧链交联把手合并", endpoint: "人体口服疗效与药代", result: "交联构件可兼容获批三环骨架", system: "临床研究与结构解析", formulation: "游离残基与交联后构件不能等同" },
  "(3S)-3-hydroxy-L-proline · 3-Hyp": { comparison: "enlicitide中3-Hyp羟基参与分子内醚桥", endpoint: "人体口服疗效与药代", result: "醚桥化构件可兼容获批三环骨架", system: "临床研究与结构解析", formulation: "没有3-Hyp→Pro单点药代对照" },
  "D-Dap(tail) · side-chain-acylated D-2,3-diaminopropionic acid": { comparison: "enlicitide中D-Dap侧链酰化并连接季铵盐增溶尾部", endpoint: "人体口服疗效与药代／溶解度设计", result: "疏水核心与增溶尾部协同用于获批骨架", system: "临床研究、结构与制剂整体", formulation: "不是游离D-Dap单体效应" },
  "Ac5c · 1-aminocyclopentane-1-carboxylic acid": { comparison: "Paluratide/LUNA18骨架中的环状α,α-二取代构件", endpoint: "动物口服暴露／构象与活性", result: "Ac5c可兼容高度N-烷基化的口服候选骨架", system: "KRAS结合、细胞实验与动物药代", formulation: "无Ac5c→普通残基的单点药代对照" },
  "Abu · L-2-aminobutyric acid": { comparison: "环孢素A第2位MeBmt–Abu–Sar区域", endpoint: "人体口服生物利用度／天然产物构象", result: "可兼容平均F约20.8%的临床口服骨架", system: "健康受试者与环孢素结构研究", formulation: "完整天然产物与制剂结果；无Abu单点对照" },
  "3-Cl-Phe · 3-chloro-L-phenylalanine": { comparison: "LUNA18系列侧链优化", endpoint: "Caco-2／细胞活性门槛", result: "细胞活性通常出现在Papp约0.4 × 10⁻⁶ cm/s以上", system: "Caco-2与KRAS细胞实验", formulation: "系列阈值；不是3-Cl-Phe单点数值" },
  "4-CF₃-Hph / 3,5-F₂-4-CF₃-Hph": { comparison: "AP0343第7位Phe(3-Cl)→Hph(4-CF₃)", endpoint: "结合／细胞活性及构象", result: "活性提高并保持主链构象", system: "KRAS结合、细胞与晶体结构", formulation: "LUNA18临床结构另含3,5-二氟取代；收益非单纯增渗" },
  "(4R)-4-[(E)-2-butenyl]-4,N-dimethyl-L-threonine": { comparison: "环孢素A完整天然产物骨架", endpoint: "口服生物利用度", result: "平均F约20.8%", system: "健康受试者", formulation: "临床制剂与完整骨架共同作用" },
  "hydroxy-acid / depsipeptide substitution": { comparison: "酰胺→酯与母体／N-甲基类似物", endpoint: "PAMPA", result: "5个酯类似物均高于母体；4个高于相应N-甲基体", system: "模型环六肽与8–9元环", formulation: "体外渗透；需另测酯键水解" },
  "thioamide substitution": { comparison: "单个C=O→C=S与母体", endpoint: "PAMPA／Caco-2与口服血浆暴露", result: "多处替换改善渗透性；优选类似物口服暴露显著提高", system: "6–8元大环；体外与大鼠口服", formulation: "作用强度明显依赖替换位置，不能套用统一倍数" },
  "connected hydrophobic surface design": { comparison: "6组仅改变N-甲基或Cα-甲基位置的环肽异构体", endpoint: "实验膜渗透性／三维疏水表面", result: "只有连接或扩大连续疏水表面的甲基位置与更高渗透性对应", system: "环肽结构与渗透实验", formulation: "结论属于表面连通性规律，不等于增加任意疏水基团都能增渗" },
  "cyclic peptide-peptoid hybrid scaffold": { comparison: "改变侧链和骨架几何的环六聚peptomer文库", endpoint: "PAMPA", result: "接近一半的侧链组合Papp超过1 × 10⁻⁶ cm/s", system: "分池合成文库与体外渗透实验", formulation: "不同骨架几何差异明显，不能把结果归因于peptoid单一因素" },
  "ester and N-methyl-amide depsipeptide backbone": { comparison: "ent-verticilide模板的5组逐点骨架替换", endpoint: "PAMPA／Caco-2", result: "含酯骨架通常具有较好渗透性，但最高Papp来自一次酯→N-H酰胺替换", system: "体外渗透实验", formulation: "骨架组成和替换位置需要逐项比较" },
  "N-methylation and lipophilic tyrosine substitution in semipeptidic macrocycles": { comparison: "同一四氨基酸—连接体骨架的56个大环", endpoint: "PAMPA", result: "第2位N-甲基化及酪氨酸侧链增脂与更高渗透性相关", system: "体外渗透与构象系列", formulation: "属于该系列的相关性，不能外推为所有位置的单点因果" },
  "amino-acid-to-azole backbone replacement": { comparison: "模型大环中逐步进行氨基酸→唑环替换", endpoint: "PAMPA／NMR构象", result: "部分替换提高脂溶性与被动渗透性；增加唑环数量不保证继续改善", system: "体外渗透、NMR与分子动力学", formulation: "效果取决于替换位置和完整骨架" },
  "stapled and stitched all-D macrocyclic peptides": { comparison: "全D线性肽与订书／双重缝合类似物", endpoint: "蛋白酶稳定性／螺旋构象／细胞活性", result: "优化类似物提高螺旋度、结合力和蛋白酶稳定性，并出现细胞活性", system: "体外稳定性、结构和细胞实验", formulation: "细胞活性不等同于被动渗透或口服吸收" },
  "tolerance of D and helix-breaking residues in stapled peptides": { comparison: "50个ATSP-7041相关订书肽替换系列", endpoint: "螺旋构象／结合与细胞活性", result: "部分D-残基替换保持活性，界面D-Phe或D-Cba替换则损害活性", system: "结构、结合与细胞实验", formulation: "结果强烈依赖替换位置，不支持D构型的普适改善" },
  "reversible methionine bis-alkylation stapling": { comparison: "不同连接体和环尺寸的Met双烷基化肽", endpoint: "流式细胞摄取", result: "部分双烷基化环肽的细胞摄取提高", system: "荧光标记肽与流式细胞术", formulation: "荧光摄取不等于胞质到达，也不能外推至口服吸收" },
  "negative evidence: cyclization alone does not ensure cell permeability": { comparison: "环肽与对应线性肽", endpoint: "定量报告基因细胞进入", result: "环状分子总体上不比线性对应物更易进入细胞", system: "细胞报告基因法", formulation: "用于否定‘环化必然增渗’，不评价口服吸收" },
  "negative evidence: lower permeability after DPDPE-like cyclization": { comparison: "D-Pen或Cys的环状／非环状配对", endpoint: "模型膜渗透性", result: "线性肽的模型膜渗透性约为相应环肽的3–7倍", system: "配对模型膜实验", formulation: "结论只适用于所测闭环方式和骨架" },
  "(1S,2S)-2-ACPC · trans-2-aminocyclopentanecarboxylic acid": { comparison: "含ACPC的α/β-肽与α-Ala或β-Ala对照", endpoint: "螺旋构象／血清稳定性／CAPA细胞质进入", result: "含ACPC的肽表现出更高螺旋性和血清稳定性，并显示细胞质进入", system: "α/β-肽结构、稳定性与CAPA实验", formulation: "研究对象是螺旋α/β-肽，不是口服药代实验" },
};

export const supportScope = (record: Residue): string[] => {
  const scope: string[] = [];
  const endpoint = experimentData[record.english]?.endpoint ?? "";
  if (/Papp|PAMPA|Caco-2|RRCK|Pm\*|渗透|通透参数|转运|细胞摄取|细胞进入|细胞质进入|CAPA/.test(endpoint)) scope.push("渗透性");
  if (/稳定|半衰期|t½|降解|DPP-4|蛋白酶/.test(endpoint)) scope.push("稳定性");
  if (/口服|生物利用度|血浆暴露|药代/.test(endpoint)) scope.push("口服暴露");
  if (/溶解度|水溶/.test(endpoint)) scope.push("溶解度");
  if (/构象|低介电|螺旋/.test(endpoint)) scope.push("构象");
  if (!scope.length && endpoint) scope.push("其他实验终点");
  return [...new Set(scope)];
};
