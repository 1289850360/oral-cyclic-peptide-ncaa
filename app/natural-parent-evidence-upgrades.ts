import type { NaturalParentModification } from "./natural-parent-modifications";

type EvidenceUpgrade = {
  peptideExperiment: NaturalParentModification["peptideExperiment"];
  propertyReview: NonNullable<NaturalParentModification["propertyReview"]>;
  sources: NaturalParentModification["sources"];
};

const finalBatchEvidenceUpgrades: Record<string, EvidenceUpgrade> = {
  "200": {
    peptideExperiment: {
      conclusion: "在同一脑啡肽骨架中，用对氯苯丙氨酸替换Phe后，脂溶性和体外血脑屏障渗透提高；血浆稳定性仍保持在300分钟以上。",
      measurement: "Gentry等比较未卤代DPDPE与Phe4位对氯、对溴、对氟和对碘类似物；对氯和对溴类似物的体外血脑屏障渗透显著提高，而各肽的血浆稳定性均超过300分钟。",
      attributionBoundary: "结论限于论文中的DPDPE同骨架Phe4位替换；不能外推为所有肽、所有Phe位点或体内口服吸收都会提高。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Phe芳环对位加氯，在这组同骨架肽中提高了脂溶性和体外血脑屏障渗透。",
      preferredPositions: "优先考虑原Phe朝向膜界面或疏水口袋、且能够容纳氯原子的位置。",
      positionsToAvoid: "狭小口袋或承担精确芳香堆积的位置要先做结构检查。",
      evidenceSummary: "同骨架Phe4位对照显示，对氯和对溴取代显著提高体外血脑屏障渗透；稳定性均超过300分钟，并非氯代单独提高稳定性。",
      boundary: "这是具体肽骨架和具体位点的实验，不是通用的单残基固定增益。",
      sources: [{ title: "Gentry et al., Peptides 1999", url: "https://doi.org/10.1016/S0196-9781(99)00127-8" }],
    },
    sources: [{ title: "Gentry et al., Peptides 1999", url: "https://doi.org/10.1016/S0196-9781(99)00127-8", supports: "未卤代与Phe4位卤代DPDPE类似物的稳定性、脂溶性和体外BBB渗透比较" }],
  },
  "9NR": {
    peptideExperiment: {
      conclusion: "丹磺酰-L-精氨酸可作为人血清白蛋白药物位点1的荧光配体。",
      measurement: "论文解析了人血清白蛋白与丹磺酰-L-精氨酸的共晶结构，并将它与另外5种丹磺酰氨基酸的位点选择性直接比较。",
      attributionBoundary: "这是游离丹磺酰氨基酸与白蛋白的结合证据，不是肽内Arg替换，也不代表渗透性或口服吸收得到改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Arg的α-氨基接入丹磺酰基后形成荧光、疏水体积较大的白蛋白探针。",
      preferredPositions: "适合白蛋白药物位点1竞争实验和荧光示踪。",
      positionsToAvoid: "需要保留游离α-氨基或把它作为普通肽内Arg使用时不适合。",
      evidenceSummary: "共晶结构直接确认丹磺酰-L-精氨酸结合人血清白蛋白药物位点1。",
      boundary: "支持完整小分子的结合位点，不支持通用药代性质。",
      sources: [{ title: "Ryan et al., Journal of Structural Biology 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3073228/" }],
    },
    sources: [{ title: "Ryan et al., 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3073228/", supports: "六种丹磺酰氨基酸与人血清白蛋白的共晶和位点选择性" }],
  },
  "9NV": {
    peptideExperiment: {
      conclusion: "丹磺酰-L-正缬氨酸选择性结合人血清白蛋白药物位点2。",
      measurement: "论文获得该化合物与人血清白蛋白的共晶结构，并与位点1、位点2配体进行结构比较。",
      attributionBoundary: "这是游离荧光配体的白蛋白结合，不是肽内Val替换实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "正缬氨酸接入丹磺酰基后形成可用于白蛋白位点2检测的疏水荧光配体。",
      preferredPositions: "适合白蛋白药物位点2竞争和结构研究。",
      positionsToAvoid: "不能用该结果推断普通含9NV肽的稳定性、渗透性或口服吸收。",
      evidenceSummary: "共晶结构直接确认丹磺酰-L-正缬氨酸结合白蛋白药物位点2。",
      boundary: "证据属于完整游离小分子。",
      sources: [{ title: "Ryan et al., Journal of Structural Biology 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3073228/" }],
    },
    sources: [{ title: "Ryan et al., 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3073228/", supports: "丹磺酰-L-正缬氨酸的白蛋白共晶结构和位点选择性" }],
  },
  ALT: {
    peptideExperiment: {
      conclusion: "肽键羰基氧换成硫后，能够按位置选择性地改变肽的蛋白酶稳定性，同时可能保留受体活性。",
      measurement: "硫代丙氨酸模型化合物已有X射线构象与氢键数据；GLP-1和GIP的单点硫代酰胺系列直接测量了蛋白酶降解和受体活性。",
      attributionBoundary: "蛋白酶稳定性方向强烈依赖硫代酰胺所在位置；GLP-1/GIP结果支持同类O→S修饰，不等于所有ALT位点都会增强稳定性。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同类修饰参考",
      plainMeaning: "把Ala肽键中的羰基氧替换成硫，会改变氢键、体积和蛋白酶识别。",
      preferredPositions: "可在已知蛋白酶切割位附近逐点筛选，以寻找稳定性提高且活性可保留的位置。",
      positionsToAvoid: "不能在未经实验的位点直接写成抗酶解增强。",
      evidenceSummary: "模型晶体结构确认硫代丙氨酸构象；肽激素实验说明硫代酰胺对蛋白酶稳定性的影响具有位置选择性。",
      boundary: "直接肽实验针对硫代酰胺修饰家族，不全是CCD ALT本身。",
      sources: [
        { title: "Tran et al., Journal of Physical Chemistry B 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11454171/" },
        { title: "Chen et al., JACS 2017", url: "https://pubmed.ncbi.nlm.nih.gov/29130686/" },
      ],
    },
    sources: [
      { title: "Tran et al., 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11454171/", supports: "硫代丙氨酸模型的X射线构象和氢键" },
      { title: "Chen et al., 2017", url: "https://pubmed.ncbi.nlm.nih.gov/29130686/", supports: "GLP-1/GIP硫代酰胺位置与蛋白酶稳定性、受体活性的实验" },
    ],
  },
  BP5: {
    peptideExperiment: {
      conclusion: "把联吡啶丙氨酸定点装入p19蛋白并加铜后，可获得天然p19没有的RNA内切酶活性。",
      measurement: "p19-T111BpyAla在铜存在时定点切割siRNA和miRNA；荧光偏振、荧光打开实验及人细胞miRNA谱共同验证了催化作用。",
      attributionBoundary: "功能依赖p19第111位、铜配位和完整蛋白结构；不能推广为任意肽中BP5都会产生催化活性。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Ala侧链接入2,2'-联吡啶后获得金属螯合能力，可在蛋白中构建人工金属活性位。",
      preferredPositions: "适合靠近底物、能容纳联吡啶并形成铜配位环境的工程蛋白位点。",
      positionsToAvoid: "普通结构位点或缺少金属和底物定位环境时不能期待相同功能。",
      evidenceSummary: "p19-T111BpyAla加铜后获得siRNA/miRNA内切活性，并在细胞中降低miR-122。",
      boundary: "支持人工酶功能，不支持渗透、溶解或口服性质。",
      sources: [{ title: "Yang et al., Nature Chemical Biology 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10290691/" }],
    },
    sources: [{ title: "Yang et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10290691/", supports: "BP5定点装入p19后的铜依赖RNA切割实验" }],
  },
  EI4: {
    peptideExperiment: {
      conclusion: "Enduracididine位于teixobactin第10位；把它去掉并同时进行其他改造后，所得线性类似物仍可表现抗菌和细胞壁破坏活性。",
      measurement: "5种不含Enduracididine的线性teixobactin类似物完成体外抑菌、细胞壁裂解和葡萄糖摄取实验，部分在70–80 µg/mL出现抑菌圈。",
      attributionBoundary: "这些类似物同时线性化并改变第1、5位，不能把活性变化单独归因于Enduracididine缺失，也不能说明EI4一定增强活性。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Enduracididine是teixobactin等天然肽中的环状胍基残基，提供带电结合特征。",
      preferredPositions: "现有应用依据集中在teixobactin第10位和相关非核糖体肽。",
      positionsToAvoid: "不应把完整天然产物活性拆成EI4单残基的固定贡献。",
      evidenceSummary: "原始teixobactin及不含EI4的多改造类似物均有抗菌实验，但尚无只改第10位的严格单变量结论。",
      boundary: "属于完整肽、多变量证据。",
      sources: [
        { title: "Enduracididine-free linear teixobactin analogs, 2026", url: "https://pubmed.ncbi.nlm.nih.gov/41540518/" },
        { title: "Teixobactin analogues at position 10, 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37857144/" },
      ],
    },
    sources: [
      { title: "Enduracididine-free teixobactin analog study, 2026", url: "https://pubmed.ncbi.nlm.nih.gov/41540518/", supports: "不含EI4线性类似物的抗菌和细胞壁实验" },
      { title: "Teixobactin position-10 analog study, 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37857144/", supports: "第10位非天然氨基酸替换的抗菌评价" },
    ],
  },
  GL3: {
    peptideExperiment: {
      conclusion: "甲基辅酶M还原酶中的甘氨酸硫代酰胺有助于维持活性位附近结构，并支持高温或低能量条件下生长。",
      measurement: "删除ycaO/tfuA后，质谱显示McrA相应位置由硫代甘氨酸变回甘氨酸；突变株在低能量底物和39–45 °C下出现严重生长缺陷。",
      attributionBoundary: "这是完整McrA蛋白的天然翻译后修饰和基因缺失实验，不是普通短肽中Gly→GL3的单点药代实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "把Gly相邻肽键的羰基氧换成硫，可改变局部氢键并提高活性位附近结构耐受性。",
      preferredPositions: "目前有把握的位置是甲基辅酶M还原酶McrA的天然硫代甘氨酸位点。",
      positionsToAvoid: "其他肽中的效果需要逐位实验，不能直接写成普遍热稳定性增强。",
      evidenceSummary: "失去GL3修饰的McrA突变株在高温和低能量条件下生长明显受损。",
      boundary: "完整蛋白遗传学证据，未给出纯化蛋白单个位点熔解温度。",
      sources: [{ title: "Nayak et al., eLife 2017", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5589413/" }],
    },
    sources: [{ title: "Nayak et al., 2017", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5589413/", supports: "GL3形成的质谱确认及缺失修饰后的生长表型" }],
  },
  HBN: {
    peptideExperiment: {
      conclusion: "L-组氨酸β-萘酰胺能够激活HutP-RNA结合，并且是甜杏仁β-葡萄糖苷酶的竞争抑制剂。",
      measurement: "HutP研究将HBN列为有效组氨酸类似激活物；独立酶学研究测得其抑制甜杏仁β-葡萄糖苷酶的Ki为17 µM。",
      attributionBoundary: "这是游离组氨酸末端酰胺衍生物的蛋白/酶结合，不是肽链内部His替换。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "His羧基转成β-萘酰胺后，末端中性化并增加较大的疏水芳环。",
      preferredPositions: "适合作为HutP别构激活物或糖苷酶配体研究。",
      positionsToAvoid: "不能外推到普通肽的渗透性、稳定性或口服吸收。",
      evidenceSummary: "HBN可激活HutP，并以Ki 17 µM竞争抑制甜杏仁β-葡萄糖苷酶。",
      boundary: "两项证据均针对游离完整化合物。",
      sources: [
        { title: "Kumarevel et al., 2003", url: "https://pubmed.ncbi.nlm.nih.gov/14510449/" },
        { title: "Hanozet et al., Biochemical Journal 1991", url: "https://pubmed.ncbi.nlm.nih.gov/2012615/" },
      ],
    },
    sources: [
      { title: "Kumarevel et al., 2003", url: "https://pubmed.ncbi.nlm.nih.gov/14510449/", supports: "HBN对HutP的别构激活" },
      { title: "Hanozet et al., 1991", url: "https://pubmed.ncbi.nlm.nih.gov/2012615/", supports: "HBN对β-葡萄糖苷酶的Ki" },
    ],
  },
  MEU: {
    peptideExperiment: {
      conclusion: "把Gly羧基甲酯化后，会明显降低其与肠道质子依赖氨基酸转运体PAT1的亲和力和转运速率。",
      measurement: "研究在表达小鼠PAT1的Xenopus卵母细胞中结合双电极电压钳和放射性示踪，并在Caco-2细胞内源PAT系统中复核；O-甲基-Gly的转运明显下降。",
      attributionBoundary: "这是游离氨基酸甲酯的转运实验，不是肽内Gly替换；结论方向是降低PAT1转运，而不是提高口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Gly羧酸甲酯化会遮蔽负电荷，破坏PAT1对氨基酸骨架电荷间距的识别。",
      preferredPositions: "适合研究PAT1底物识别或需要暂时封闭羧酸的化学设计。",
      positionsToAvoid: "如果目标是利用PAT1摄取，MEU不是有利改造。",
      evidenceSummary: "O-甲基-Gly相对Gly表现出明显降低的PAT1亲和力和转运速率。",
      boundary: "只支持PAT1介导的游离底物转运。",
      sources: [{ title: "Boll et al., Journal of Biological Chemistry 2003", url: "https://pubmed.ncbi.nlm.nih.gov/12893527/" }],
    },
    sources: [{ title: "Boll et al., 2003", url: "https://pubmed.ncbi.nlm.nih.gov/12893527/", supports: "O-甲基-Gly与Gly/N-甲基衍生物的PAT1转运比较" }],
  },
  NLP: {
    peptideExperiment: {
      conclusion: "正亮氨酸膦酸是大肠杆菌甲硫氨酸氨肽酶的过渡态类似物，可直接占据双金属活性位。",
      measurement: "多组X射线结构显示NLP的膦酸氧与活性位金属和His残基配位；单锰和双锰状态均得到结构解析。",
      attributionBoundary: "这是游离膦酸过渡态模拟物与MetAP的结合，不是普通肽中Leu替换后的性质。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "把氨基酸羧酸换成膦酸可模拟肽键水解的四面体过渡态，并增强对金属中心的配位。",
      preferredPositions: "适合作为甲硫氨酸氨肽酶等金属水解酶的末端过渡态模拟物。",
      positionsToAvoid: "不适合作为普通内部Leu残基，也不能据此声称提高渗透性。",
      evidenceSummary: "NLP与大肠杆菌MetAP的单金属、双金属复合物均有直接晶体结构。",
      boundary: "支持靶点结合机制，未提供通用药代优势。",
      sources: [
        { title: "Ye et al., Biochemistry 2006", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1480431/" },
        { title: "Lowther et al., Biochemistry 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10555963/" },
      ],
    },
    sources: [
      { title: "Ye et al., 2006", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1480431/", supports: "NLP与单锰MetAP的晶体结构" },
      { title: "Lowther et al., 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10555963/", supports: "膦酸过渡态类似物的活性位配位比较" },
    ],
  },
  TPL: {
    peptideExperiment: {
      conclusion: "游离色氨醇可促进海洋硅藻的短期氮同化和生长。",
      measurement: "体外酶实验确认PtNRPS1把L-Trp还原为色氨醇；敲除PtNRPS1后氮同化酶活下降，外加色氨醇可以恢复，稳定同位素和代谢组结果方向一致。",
      attributionBoundary: "这是游离色氨醇在硅藻中的信号/代谢作用，不是肽内Trp羧基还原后的药代性质。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Trp羧酸还原为伯醇后失去羧酸负电荷，形成具有独立生物活性的色氨醇。",
      preferredPositions: "当前证据适用于硅藻氮同化信号和游离代谢物研究。",
      positionsToAvoid: "不能用该论文推断肽的渗透性、稳定性或口服吸收。",
      evidenceSummary: "遗传学、外加回补、酶学和稳定同位素实验共同支持色氨醇增强硅藻氮同化。",
      boundary: "不是肽替换证据。",
      sources: [{ title: "Tryptophanol enhances nitrogen assimilation in marine diatoms, 2026", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13194791/" }],
    },
    sources: [{ title: "Nature Communications 2026", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13194791/", supports: "色氨醇的生成、敲除、回补和氮同化实验" }],
  },
  TYB: {
    peptideExperiment: {
      conclusion: "末端酪氨醛存在于tyropeptin蛋白酶体抑制剂骨架中，结构优化可显著提高20S蛋白酶体抑制和细胞生长抑制。",
      measurement: "tyropeptin A衍生物TP-104的糜蛋白酶样20S蛋白酶体抑制效力提高20倍；TP-110显示糜蛋白酶样活性选择性并抑制多种细胞系生长。",
      attributionBoundary: "论文比较的是完整tyropeptin衍生物，其他侧链也发生变化；只能确认TYB与该反应性骨架相容，不能把20倍全部归因于TYB。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Tyr末端羧酸还原为醛后形成亲电战头，可参与蛋白酶体抑制剂的可逆共价识别。",
      preferredPositions: "适合底物样蛋白酶体抑制剂的C端反应位。",
      positionsToAvoid: "不适合普通内部Tyr位点，也不能据此推断口服吸收。",
      evidenceSummary: "含TYB末端的tyropeptin衍生物具有强20S蛋白酶体抑制和细胞活性。",
      boundary: "属于完整多位点药物骨架证据。",
      sources: [{ title: "Momose et al., Bioorganic & Medicinal Chemistry Letters 2005", url: "https://pubmed.ncbi.nlm.nih.gov/16195592/" }],
    },
    sources: [{ title: "Momose et al., 2005", url: "https://pubmed.ncbi.nlm.nih.gov/16195592/", supports: "tyropeptin衍生物的蛋白酶体抑制和细胞实验" }],
  },
  ZZD: {
    peptideExperiment: {
      conclusion: "S-三苯甲基-L-半胱氨酸是有实验验证的有丝分裂驱动蛋白Eg5/KSP抑制剂。",
      measurement: "生化研究显示STLC抑制Eg5及相关马达蛋白ATPase和运动；细胞研究观察到纺锤体检查点激活、有丝分裂停滞和细胞死亡。",
      attributionBoundary: "这是游离完整化合物的药理作用；三苯甲基不是普通肽保护基状态下的通用性质增益。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Cys巯基接入三苯甲基后形成体积很大的疏水配体，可进入Eg5的别构口袋。",
      preferredPositions: "作为STLC类KSP抑制剂完整药效团使用。",
      positionsToAvoid: "肽合成中的临时保护基应在成品中脱除，不能把STLC药理外推到S-Trt-Cys肽。",
      evidenceSummary: "STLC可直接抑制Eg5/KSP马达活性并诱导有丝分裂停滞。",
      boundary: "支持完整小分子靶点作用，不支持一般肽性质。",
      sources: [
        { title: "Loop L5 determines sensitivity to STLC, 2025", url: "https://pubmed.ncbi.nlm.nih.gov/41405433/" },
        { title: "OSBPL11 modulates STLC cytotoxicity, 2025", url: "https://pubmed.ncbi.nlm.nih.gov/41313943/" },
      ],
    },
    sources: [
      { title: "Eg5/BMK-1 biochemical inhibition study, 2025", url: "https://pubmed.ncbi.nlm.nih.gov/41405433/", supports: "STLC对马达蛋白ATPase和运动的直接抑制" },
      { title: "OSBPL11-STLC cellular study, 2025", url: "https://pubmed.ncbi.nlm.nih.gov/41313943/", supports: "STLC诱导有丝分裂停滞和细胞死亡的细胞证据" },
    ],
  },
};

const thirdBatchEvidenceUpgrades: Record<string, EvidenceUpgrade> = {
  "4PQ": {
    peptideExperiment: {
      conclusion: "在载脂蛋白A-I第72位把Trp换成5-羟基Trp后，胆固醇外排和体内HDL形成能力均降低。",
      measurement: "相对野生型，ABCA1依赖的胆固醇受体活性降低41.73±6.57%；注射到小鼠后脂化/HDL生成降低48%。",
      attributionBoundary: "这是完整apoA-I蛋白第72位的单点比较；同时观察到PON1激活增强，不能把5-羟基Trp简单归为全面有利或有害。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Trp吲哚环5位增加羟基后，氧化状态、极性和蛋白局部相互作用发生改变。",
      preferredPositions: "适合研究Trp氧化损伤或需要增加吲哚环氢键能力的位置。",
      positionsToAvoid: "承担apoA-I胆固醇外排功能的Trp72不宜这样替换。",
      evidenceSummary: "Trp72→5-羟基Trp使胆固醇外排降低约42%，体内HDL生成降低48%，但PON1激活略增强。",
      boundary: "结论只适用于apoA-I Trp72，且不同功能指标方向并不一致。",
      sources: [{ title: "Huang et al., JBC 2020 · 5-OHTrp72 apoA-I直接对照", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7152772/" }],
    },
    sources: [{ title: "Huang et al., JBC 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7152772/", supports: "apoA-I Trp72位5-羟基化前后的体内外功能比较" }],
  },
  HRP: {
    peptideExperiment: {
      conclusion: "在载脂蛋白A-I第72位把Trp换成5-羟基Trp后，胆固醇外排和体内HDL形成能力均降低。",
      measurement: "相对野生型，ABCA1依赖的胆固醇受体活性降低41.73±6.57%；注射到小鼠后脂化/HDL生成降低48%。",
      attributionBoundary: "HRP与4PQ都是5-羟基-L-色氨酸CCD表示；证据来自完整apoA-I蛋白的特定位点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Trp吲哚环5位增加羟基后，极性和氧化化学发生改变。",
      preferredPositions: "适合研究Trp氧化损伤或增加吲哚环氢键能力的位置。",
      positionsToAvoid: "承担apoA-I胆固醇外排功能的Trp72不宜这样替换。",
      evidenceSummary: "Trp72→5-羟基Trp使胆固醇外排降低约42%，体内HDL生成降低48%。",
      boundary: "这是与4PQ等价化学结构的重复CCD映射，不代表所有Trp位点。",
      sources: [{ title: "Huang et al., JBC 2020 · 5-OHTrp72 apoA-I直接对照", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7152772/" }],
    },
    sources: [{ title: "Huang et al., JBC 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7152772/", supports: "apoA-I Trp72位5-羟基化前后的体内外功能比较" }],
  },
  LA2: {
    peptideExperiment: {
      conclusion: "赖氨酸脂酰化形成lipoyllysine后，成为SIRT4可高效识别并去除的底物，也是丙酮酸脱氢酶复合体必需的摆臂辅因子。",
      measurement: "SIRT4对DLAT K259脂酰肽的催化效率为7.65±1.31 s⁻¹M⁻¹，约为同序列乙酰肽的38倍；去除全部可脂酰化位点会使PDH活性消失。",
      attributionBoundary: "酶学数据测的是脂酰化肽被SIRT4去修饰；PDH活性来自完整多酶复合体，不能解释为普通药物肽性质改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys侧链接入硫辛酰基后，得到可在氧化还原和酰基转移中摆动的长侧链辅因子。",
      preferredPositions: "现有证据集中在DLAT/PDHX等代谢酶的保守脂酰化Lys位点。",
      positionsToAvoid: "普通短肽或不参与脂酰辅因子循环的位置不能照搬。",
      evidenceSummary: "DLAT K259脂酰肽是SIRT4的高效底物；完整PDH中失去所有脂酰化位点会丧失催化活性。",
      boundary: "属于特定代谢酶辅因子功能，不是渗透性、溶解度或口服吸收实验。",
      sources: [
        { title: "Mathias et al., Cell 2014 · SIRT4脂酰肽动力学", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4344121/" },
        { title: "Cronan, 2014 · 脂酰化位点与PDH功能", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4233344/" },
      ],
    },
    sources: [
      { title: "Mathias et al., Cell 2014", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4344121/", supports: "脂酰化与乙酰化DLAT肽的SIRT4动力学比较" },
      { title: "Cronan, 2014", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4233344/", supports: "PDH脂酰化位点缺失后的功能结果" },
    ],
  },
  TY2: {
    peptideExperiment: {
      conclusion: "在肌红蛋白活性位H64换入3-氨基Tyr后，过氧化物驱动的两类底物氧化速度明显提高。",
      measurement: "相对野生型，硫代苯甲醚亚砜化提高9倍，苯甲醛生成苯甲酸提高81倍。",
      attributionBoundary: "实验替换对象是His64而非天然Tyr位点；结果证明该残基可在特定血红素口袋提供氧化还原功能，不能推广到一般肽。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Tyr芳环邻位加氨基后成为可参与电子/质子转移的氧化还原侧链。",
      preferredPositions: "适合靠近血红素或需要过氧化物活化的催化口袋。",
      positionsToAvoid: "普通表面Tyr位点或不允许额外氨基的紧密口袋不能套用。",
      evidenceSummary: "H64→3-氨基Tyr使肌红蛋白两类氧化反应分别提高9倍和81倍。",
      boundary: "这是完整金属蛋白催化证据，不是药代性质证据。",
      sources: [{ title: "Chand et al., ABB 2018 · 工程肌红蛋白氧化实验", url: "https://pubmed.ncbi.nlm.nih.gov/29277370/" }],
    },
    sources: [{ title: "Chand et al., ABB 2018", url: "https://pubmed.ncbi.nlm.nih.gov/29277370/", supports: "H64NH2Tyr肌红蛋白与野生型的多轮催化比较" }],
  },
  HMR: {
    peptideExperiment: {
      conclusion: "在凝血蛋白酶底物的切割位引入β-高精氨酸后，可把可切底物转成抑制剂，并提高对因子Xa相对凝血酶的选择性。",
      measurement: "论文同时比较荧光底物、普通α肽和切割位含β-高精氨酸的肽；β肽对因子Xa的抑制明显强于对应α肽。",
      attributionBoundary: "效果依赖蛋白酶底物序列和切割位，不能把β-高精氨酸视为普遍增强亲和力的替代物。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Arg骨架延长一个亚甲基后，保留胍基正电荷，但改变切割位几何关系。",
      preferredPositions: "已有证据位置是因子Xa/凝血酶底物的切割位。",
      positionsToAvoid: "不处于类似丝氨酸蛋白酶识别位点时不能期待同样效果。",
      evidenceSummary: "切割位β-高精氨酸肽比对应α肽更强抑制因子Xa，并改善对凝血酶的选择性。",
      boundary: "结论是特定蛋白酶抑制和选择性，不是渗透或口服吸收。",
      sources: [{ title: "Bromfield et al., Chem Biol Drug Des 2006", url: "https://pubmed.ncbi.nlm.nih.gov/16923021/" }],
    },
    sources: [{ title: "Bromfield et al., 2006", url: "https://pubmed.ncbi.nlm.nih.gov/16923021/", supports: "β-高精氨酸肽与对应α肽的因子Xa/凝血酶抑制比较" }],
  },
  HLU: {
    peptideExperiment: {
      conclusion: "β-羟基亮氨酸可进入新生长激素蛋白，但会阻断其正常分泌并造成细胞内积累。",
      measurement: "在牛和大鼠生长激素表达体系中，加入该类似物后分泌到培养基的生长激素减少，而细胞内准确切除信号肽的产物积累。",
      attributionBoundary: "这是多个Leu位点的整体代谢掺入，不是单点替换；结论与HL2的同一化学残基证据等价。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Leu侧链β位加羟基会提高极性，并扰动疏水信号肽和蛋白加工。",
      preferredPositions: "可用于研究信号肽、分泌和疏水核心对极性变化的敏感性。",
      positionsToAvoid: "依赖连续疏水Leu完成分泌的区域不宜无验证替换。",
      evidenceSummary: "总体掺入β-羟基亮氨酸会阻断生长激素分泌。",
      boundary: "多位点完整蛋白结果，不能确定由哪一个Leu位点造成。",
      sources: [{ title: "McAndrew et al., JBC 1991", url: "https://pubmed.ncbi.nlm.nih.gov/1869539/" }],
    },
    sources: [{ title: "McAndrew et al., JBC 1991", url: "https://pubmed.ncbi.nlm.nih.gov/1869539/", supports: "β-羟基亮氨酸掺入后对生长激素加工和分泌的影响" }],
  },
  PSA: {
    peptideExperiment: {
      conclusion: "在HIV-1蛋白酶底物切割位用该statine类似物替代可切二肽后，底物转变为微摩尔抑制剂。",
      measurement: "含3-羟基-4-氨基-5-苯基戊酸的肽抑制剂Ki进入微摩尔范围，亲和力比对应可切底物提高约3个数量级。",
      attributionBoundary: "该残基跨越并模拟切割二肽的过渡态，不是普通Phe单点等排替换。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "骨架羟基与延长结构可模拟天冬氨酸蛋白酶切割过渡态。",
      preferredPositions: "适合天冬氨酸蛋白酶底物的切割位过渡态模拟。",
      positionsToAvoid: "普通结构位点或非天冬氨酸蛋白酶靶点不能套用。",
      evidenceSummary: "切割位换入该statine类似物后，亲和力比对应底物提高约1000倍。",
      boundary: "支持蛋白酶抑制，不支持溶解度、渗透性或口服吸收。",
      sources: [{ title: "Moore et al., BBRC 1989", url: "https://pubmed.ncbi.nlm.nih.gov/2649094/" }],
    },
    sources: [{ title: "Moore et al., BBRC 1989", url: "https://pubmed.ncbi.nlm.nih.gov/2649094/", supports: "statine类似物替代切割二肽后的HIV-1蛋白酶抑制" }],
  },
  BTK: {
    peptideExperiment: {
      conclusion: "组蛋白H3第9位Lys丁酰化后，AF9 YEATS仍能识别，但比同位置crotonyl-Lys结合弱约2倍。",
      measurement: "ITC测得H3K9bu的KD为11.1±0.9 µM，H3K9cr为5.6±0.1 µM，H3K9ac为18±3 µM。",
      attributionBoundary: "这是组蛋白短肽与特定表观遗传读取域的结合；不能推广为一般Lys丁酰化会提高所有靶点亲和力。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端正电荷被四碳丁酰基中和，并增加疏水体积。",
      preferredPositions: "已有证据位置是H3K9及能容纳长酰基的YEATS识别口袋。",
      positionsToAvoid: "依赖Lys正电荷形成盐桥的位置应谨慎。",
      evidenceSummary: "H3K9bu对AF9 YEATS的KD为11.1 µM，强于Kac但弱于Kcr。",
      boundary: "方向由具体读取蛋白决定，不是通用性质变化。",
      sources: [{ title: "Morrison et al., 2022 · AF9 YEATS酰化肽ITC", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9793969/" }],
    },
    sources: [{ title: "Morrison et al., 2022", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9793969/", supports: "H3K9bu、H3K9cr和H3K9ac的同序列ITC比较" }],
  },
  "7N8": {
    peptideExperiment: {
      conclusion: "把对硼酸基苯丙氨酸装入荧光蛋白后，可利用硼酸被过氧亚硝酸盐氧化的反应产生选择性荧光响应。",
      measurement: "pnGFP在体外和活细胞中响应过氧亚硝酸盐；低毫摩尔H2O2及多种其他活性氧不产生同等响应。",
      attributionBoundary: "作用来自完整、定向进化后的荧光蛋白色团环境；游离残基或普通肽不会自动成为传感器。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Phe对位硼酸基可被特定活性氧氧化为酚，产生不可逆化学响应。",
      preferredPositions: "适合设计活性氧传感器、可氧化开关或硼酸介导的糖结合位点。",
      positionsToAvoid: "需要化学惰性或不能容忍氧化转化的位点应避免。",
      evidenceSummary: "pBoF是pnGFP/pnRFP过氧亚硝酸盐传感的直接反应元件。",
      boundary: "这是传感器功能，不是一般药代性质改善。",
      sources: [
        { title: "Chen et al., 2016 · pnGFP选择性机制", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4958459/" },
        { title: "Sun et al., 2023 · pnRFP体内外验证", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10330634/" },
      ],
    },
    sources: [
      { title: "Chen et al., 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4958459/", supports: "pBoF荧光蛋白对过氧亚硝酸盐的选择性响应" },
      { title: "Sun et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10330634/", supports: "pBoF红色荧光传感器的体外、活细胞和结构验证" },
    ],
  },
  BFD: {
    peptideExperiment: {
      conclusion: "Asp活性位结合BeF3后可稳定模拟天冬氨酰磷酸，并把CheY锁定为能结合FliM的活化态。",
      measurement: "未加BeF3的CheY不形成稳定复合物；CheY-BeF3可与FliM结合，文献还显示磷酸化/BeF3活化CheY相对未磷酸化态有显著亲和力提升。",
      attributionBoundary: "CCD BFD代表蛋白内Asp-BeF3配位复合物，不是可独立合成并普遍替换Asp的稳定氨基酸。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "BeF3与Asp羧酸配位，稳定模拟短寿命的天冬氨酰磷酸。",
      preferredPositions: "适合响应调节蛋白活性态的结构与结合研究。",
      positionsToAvoid: "普通肽设计、体内长期使用或需要真正共价稳定残基时不适用。",
      evidenceSummary: "CheY-Asp-BeF3稳定形成活化态并获得FliM结合能力。",
      boundary: "属于配位模拟物和完整蛋白证据，不是独立单体性质。",
      sources: [{ title: "Lam et al., 2010 · CheY-BeF3与FliM结合", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2863492/" }],
    },
    sources: [{ title: "Lam et al., 2010", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2863492/", supports: "有/无BeF3时CheY与FliM的拉下比较及活化态结构" }],
  },
  OLT: {
    peptideExperiment: {
      conclusion: "O-甲基-L-苏氨酸在小鼠疟疾模型中可延长生存时间，但把它并入所测二肽后活性并未普遍保留。",
      measurement: "游离O-甲基Thr在160、320和640 mg/kg均显著延长生存；二聚体仅640 mg/kg有效，另外两个含Leu二肽无效。",
      attributionBoundary: "这是游离氨基酸和简单二肽的药效实验，不是复杂肽中Thr单点替换的性质比较。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Thr侧链羟基甲基化会去除供氢能力并增加少量疏水性。",
      preferredPositions: "可用于测试Thr羟基是否必需，或研究简单氨基酸类似物药效。",
      positionsToAvoid: "依赖Thr羟基供氢或磷酸化的位置不宜替换。",
      evidenceSummary: "游离O-甲基Thr在P. berghei小鼠模型有活性，但含该残基二肽多无活性。",
      boundary: "不能据此推断复杂肽的稳定性、渗透性或口服吸收。",
      sources: [{ title: "Gershon and Krull, J Med Chem 1979", url: "https://pubmed.ncbi.nlm.nih.gov/376849/" }],
    },
    sources: [{ title: "Gershon and Krull, 1979", url: "https://pubmed.ncbi.nlm.nih.gov/376849/", supports: "O-甲基Thr及其二肽的小鼠抗疟比较" }],
  },
  "4AW": {
    peptideExperiment: {
      conclusion: "在ECFP第57位把Trp换成4-氮杂Trp后，大部分蛋白不能正确折叠并失去成熟色团。",
      measurement: "4-氮杂Trp和7-氮杂Trp替换体中70%–90%为不溶且无成熟色团，仅分离出少量可溶、光谱改变的蛋白。",
      attributionBoundary: "论文同时研究两种氮杂Trp；对4AW的结论适用于ECFP Trp57这一疏水核心位点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "吲哚环4位碳换成氮后，形状近似但极性明显增加。",
      preferredPositions: "可作为探测Trp位点疏水性和氢键需求的工具。",
      positionsToAvoid: "ECFP Trp57这类疏水核心和折叠关键位点应谨慎。",
      evidenceSummary: "Trp57→4-氮杂Trp导致70%–90%蛋白不溶或色团不成熟。",
      boundary: "这是负向折叠结果，不代表所有蛋白都会不溶。",
      sources: [{ title: "Hoesl et al., J Pept Sci 2010", url: "https://pubmed.ncbi.nlm.nih.gov/20632254/" }],
    },
    sources: [{ title: "Hoesl et al., 2010", url: "https://pubmed.ncbi.nlm.nih.gov/20632254/", supports: "ECFP Trp57的4-氮杂Trp替换、溶解和色团成熟实验" }],
  },
  AZY: {
    peptideExperiment: {
      conclusion: "3-叠氮-L-Tyr在暗处可逆抑制微管蛋白酪氨酸连接酶，光照后可使酶不可逆失活。",
      measurement: "无光时只有3-叠氮Tyr可逆抑制酶；照光后3-叠氮Tyr和对叠氮Phe均产生不可逆光失活。",
      attributionBoundary: "这是游离氨基酸作为酶底物位点光亲和探针，不是肽内Tyr替换后的药代性质。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr芳环加叠氮基后可在光照下生成高反应性中间体并共价标记邻近位点。",
      preferredPositions: "适合光亲和标记和底物结合位点定位。",
      positionsToAvoid: "不能接受光照、不可逆交联或需要化学惰性的体系应避免。",
      evidenceSummary: "3-叠氮Tyr具有暗态可逆抑制和光照不可逆失活两阶段行为。",
      boundary: "支持光探针用途，不支持渗透性、稳定性或口服吸收。",
      sources: [{ title: "Coudijzer and Joniau, FEBS Lett 1990", url: "https://pubmed.ncbi.nlm.nih.gov/2384179/" }],
    },
    sources: [{ title: "Coudijzer and Joniau, 1990", url: "https://pubmed.ncbi.nlm.nih.gov/2384179/", supports: "3-叠氮Tyr的暗态抑制和光照不可逆失活" }],
  },
  DISEP: {
    peptideExperiment: {
      conclusion: "在polyphemusin I前端接两个磷酸丝氨酸后，抗菌MIC变差，但获得牙釉质结合和更持久的抗生物膜作用。",
      measurement: "PI与DPS-PI对S. mutans的MIC分别为40和80 µg/mL；高蔗糖条件后只有DPS-PI仍保持牙面抗生物膜效果。",
      attributionBoundary: "两个pSer作为整体牙结合结构域加入，不能把效果拆分给单个pSer；同时抗菌强度与表面滞留方向相反。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "连续两个磷酸丝氨酸提供高密度负电荷，可与牙釉质羟基磷灰石结合。",
      preferredPositions: "适合需要矿物表面锚定和局部持留的肽端部。",
      positionsToAvoid: "以被动膜渗透或维持最大游离抗菌效力为目标时应谨慎。",
      evidenceSummary: "DPS使MIC由40升至80 µg/mL，但赋予牙面结合和蔗糖冲洗后的持续抗生物膜作用。",
      boundary: "双残基结构域和完整抗菌肽结果，不能归为单点普遍改善。",
      sources: [{ title: "Zhang et al., J Mater Sci Mater Med 2019", url: "https://pubmed.ncbi.nlm.nih.gov/30929087/" }],
    },
    sources: [{ title: "Zhang et al., 2019", url: "https://pubmed.ncbi.nlm.nih.gov/30929087/", supports: "PI与DPS-PI的MIC、牙结合及体内抗生物膜比较" }],
  },
  RPI: {
    peptideExperiment: {
      conclusion: "Arg磷酸化后可成为ClpC识别的降解标记；未磷酸化的同一蛋白底物不能被相同复合体有效降解。",
      measurement: "pArg-β-casein被ClpCP降解，而未磷酸化β-casein不被降解；游离pArg还能激活ClpCP处理FITC-casein，普通Arg无此作用。",
      attributionBoundary: "β-casein含多个被磷酸化的Arg，不能归因于唯一位置；结论属于细菌蛋白质质量控制。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Arg胍基磷酸化后同时带正、负电特征，形成ClpC专属识别信号。",
      preferredPositions: "适合研究细菌pArg依赖的蛋白降解和ClpC调控。",
      positionsToAvoid: "普通治疗肽或不希望被细菌蛋白酶系统识别的位置不宜使用。",
      evidenceSummary: "pArg-β-casein可被ClpCP降解，未磷酸化β-casein不能；普通Arg也不能替代pArg激活ClpC。",
      boundary: "多位点完整蛋白结果，不是单个位点的药代性质。",
      sources: [
        { title: "Trentini et al., Nature 2016 · pArg降解标记", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6640040/" },
        { title: "Pan et al., 2023 · pArg/未磷酸化casein直接比较", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10128030/" },
      ],
    },
    sources: [
      { title: "Trentini et al., Nature 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6640040/", supports: "pArg底物与ClpC的结合和降解机制" },
      { title: "Pan et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10128030/", supports: "pArg-casein与未磷酸化casein的直接降解比较" },
    ],
  },
  HQA: {
    peptideExperiment: {
      conclusion: "把HQAla装入LmrR后可在指定位置结合Cu、Zn或Rh，并构建具有新催化功能的人工金属酶。",
      measurement: "V15-HQAla-Cu体系的Friedel–Crafts反应转化率97±1%；M89-HQAla-Cu水加成转化率20±5%，ee为51±10%；无HQAla的LmrR不显示同样金属结合光谱变化。",
      attributionBoundary: "催化结果依赖LmrR位点、金属和整个蛋白口袋；不能把游离HQAla视为同等催化剂。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "侧链8-羟基喹啉可用N/O双齿方式结合过渡金属。",
      preferredPositions: "适合人工金属酶活性位、金属传感位或结构学重原子位点。",
      positionsToAvoid: "不允许金属配位、空间狭窄或需避免氧化还原副反应的位置应谨慎。",
      evidenceSummary: "HQAla使LmrR获得选择性金属结合并支持Cu催化反应和Zn水解反应。",
      boundary: "属于完整人工金属酶功能，不是药代性质。",
      sources: [{ title: "Drienovská et al., ChemBioChem 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7689906/" }],
    },
    sources: [{ title: "Drienovská et al., 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7689906/", supports: "LmrR-HQAla金属结合与催化转化/对映选择性实验" }],
  },
  LBZ: {
    peptideExperiment: {
      conclusion: "Lys苯甲酰化后形成可被DPF和YEATS结构域识别的组蛋白标记，且不同读取蛋白具有明确选择性。",
      measurement: "AF9 YEATS结合H3K9bz的KD为5.97 µM；YEATS2结合H3K27bz为21.57 µM，并分别比对应其他酰化标记呈不同偏好。",
      attributionBoundary: "亲和力依赖组蛋白序列、修饰位置和读取域，不能推广为所有Lys位点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端接苯甲酰基后失去正电荷并增加一个芳香疏水表面。",
      preferredPositions: "现有证据集中于H3K9、H3K14和H3K27表观遗传标记位点。",
      positionsToAvoid: "依赖Lys正电荷或口袋容积较小的位置不宜直接替换。",
      evidenceSummary: "Kbz肽可被DPF/YEATS读取；AF9-H3K9bz KD 5.97 µM，YEATS2-H3K27bz KD 21.57 µM。",
      boundary: "属于特定组蛋白读取，不是渗透或口服吸收。",
      sources: [{ title: "Huang et al., NAR 2021 · 组蛋白苯甲酰化读取", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7797077/" }],
    },
    sources: [{ title: "Huang et al., NAR 2021", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7797077/", supports: "Kbz组蛋白肽的ITC、晶体结构和不同读取域比较" }],
  },
  LWI: {
    peptideExperiment: {
      conclusion: "2-(氨甲基)-L-Phe已作为金属结合残基装入设计的NDM-1环肽，并在晶体结构中参与活性位结合。",
      measurement: "含该残基的设计环肽经酶抑制和晶体结构验证；整组设计肽中最佳者IC50为1.2±0.1 µM，而D-captopril为59.7±6.3 µM。",
      attributionBoundary: "各设计肽含多处序列变化，不能把最佳IC50单独归因于LWI；证据只能证明它在有效环肽中可用并参与结合。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Phe芳环邻位增加氨甲基，可提供额外碱性配位点。",
      preferredPositions: "适合面向金属酶活性位、需要额外配位或盐桥的暴露芳香位置。",
      positionsToAvoid: "空间狭窄或不容忍正电荷的位置应避免。",
      evidenceSummary: "LWI出现在经酶抑制和结构验证的NDM-1环肽中，但其单独贡献未被拆分。",
      boundary: "完整多突变环肽支持，不是单残基直接对照。",
      sources: [{ title: "Chen et al., PNAS 2021 · NDM-1设计环肽", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8000195/" }],
    },
    sources: [{ title: "Chen et al., PNAS 2021", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8000195/", supports: "含L-A34/LWI设计环肽的NDM-1抑制与晶体结构" }],
  },
  "2FM": {
    peptideExperiment: {
      conclusion: "Met214换成二氟甲硫氨酸后，AprA仍可折叠并保持接近野生型的催化能力，热稳定性无显著改变。",
      measurement: "kcat/Km由620±30降至530±50 M⁻¹s⁻¹；Km无显著变化，DSC未发现显著热稳定性差异。",
      attributionBoundary: "蛋白还含起始Met/DFM加工差异，且结果只针对AprA的Met-turn位点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Met末端甲基换成二氟甲基后，可引入19F探针并改变硫附近电子性质。",
      preferredPositions: "适合需要19F NMR探针且希望基本保留Met形状的位点。",
      positionsToAvoid: "对催化效率微小下降也敏感或依赖正常N端Met切除的位置应谨慎。",
      evidenceSummary: "AprA M214→DFM仅轻微降低催化效率，热稳定性无显著变化。",
      boundary: "这是单个金属蛋白位点结果，不等于普遍稳定性提高。",
      sources: [{ title: "Duewel et al., BMC Biochem 2005", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1266349/" }],
    },
    sources: [{ title: "Duewel et al., 2005", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1266349/", supports: "AprA Met214/DFM的掺入、酶动力学和DSC比较" }],
  },
  CWD: {
    peptideExperiment: {
      conclusion: "5-氯willardiine能直接激活AMPA/kainate受体，其效力和去敏化强度均高于未取代willardiine。",
      measurement: "全细胞电压钳给出的效力顺序为5-氟>5-硝基>5-氯≈5-溴>5-碘>willardiine；相同系列还测得不同去敏化程度。",
      attributionBoundary: "这是游离兴奋性氨基酸受体激动剂，不是肽内Ala替换。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "willardiine尿嘧啶环5位加氯会改变AMPA受体效力和去敏化动力学。",
      preferredPositions: "适合AMPA/kainate受体药理研究。",
      positionsToAvoid: "普通肽设计或需要避免兴奋性受体激动的场景不适用。",
      evidenceSummary: "5-氯willardiine比未取代willardiine更强，并呈不同受体去敏化。",
      boundary: "游离小分子药理证据，不能推断肽的药代性质。",
      sources: [{ title: "Patneau et al., J Neurosci 1992", url: "https://pubmed.ncbi.nlm.nih.gov/1371315/" }],
    },
    sources: [{ title: "Patneau et al., 1992", url: "https://pubmed.ncbi.nlm.nih.gov/1371315/", supports: "氯代、硝基及未取代willardiine的电压钳效力与去敏化比较" }],
  },
  NWD: {
    peptideExperiment: {
      conclusion: "5-硝基willardiine能直接激活AMPA/kainate受体，效力高于5-氯类似物和未取代willardiine。",
      measurement: "全细胞电压钳效力顺序为5-氟>5-硝基>5-氯≈5-溴>5-碘>willardiine；放射配体竞争结果给出相同趋势。",
      attributionBoundary: "这是游离兴奋性氨基酸类似物的受体实验，不是肽内Ala替换。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "willardiine尿嘧啶环5位加硝基会提高AMPA受体效力并改变去敏化。",
      preferredPositions: "适合AMPA/kainate受体药理和去敏化机制研究。",
      positionsToAvoid: "普通肽设计或需要避免兴奋性神经毒性的场景不适用。",
      evidenceSummary: "5-硝基willardiine在所测系列中效力仅次于5-氟类似物，并强于未取代体。",
      boundary: "游离小分子药理证据，不能推断肽的稳定性、渗透或口服吸收。",
      sources: [
        { title: "Patneau et al., J Neurosci 1992", url: "https://pubmed.ncbi.nlm.nih.gov/1371315/" },
        { title: "Hawkins et al., 1995 · AMPA结合竞争", url: "https://pubmed.ncbi.nlm.nih.gov/7566471/" },
      ],
    },
    sources: [
      { title: "Patneau et al., 1992", url: "https://pubmed.ncbi.nlm.nih.gov/1371315/", supports: "5-硝基willardiine的电压钳效力和去敏化" },
      { title: "Hawkins et al., 1995", url: "https://pubmed.ncbi.nlm.nih.gov/7566471/", supports: "willardiine系列的AMPA放射配体竞争排序" },
    ],
  },
  "3X9": {
    peptideExperiment: {
      conclusion: "Cys接入MTSL后形成R1自旋标记，可用PELDOR/DEER直接测量完整蛋白位点间距离和构象变化。",
      measurement: "双标记calmodulin在无Ca、加Ca及结合nNOS肽时产生可区分的距离分布；膜蛋白研究中实验距离还能区分竞争结构模型。",
      attributionBoundary: "自旋标记本身可能扰动局部结构且二硫键可被还原；它是测量工具，不是成药性质优化。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Cys巯基与MTSL形成含稳定自由基的二硫键侧链，可被EPR检测。",
      preferredPositions: "适合溶剂暴露、可成对布置且不会破坏功能的工程Cys位点。",
      positionsToAvoid: "还原环境、天然关键Cys或空间拥挤位置应谨慎。",
      evidenceSummary: "MTSL-Cys已直接用于calmodulin和膜蛋白的纳米尺度距离与构象测量。",
      boundary: "支持结构生物学标记用途，不支持渗透、稳定或口服吸收改善。",
      sources: [
        { title: "Banaszak et al., JPCB 2022 · calmodulin PELDOR", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9454100/" },
        { title: "Pliotas et al., PNAS 2012 · MscS结构模型判别", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3479538/" },
      ],
    },
    sources: [
      { title: "Banaszak et al., 2022", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9454100/", supports: "MTSL-Cys双标记的calmodulin构象距离测量" },
      { title: "Pliotas et al., 2012", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3479538/", supports: "MTSL-Cys PELDOR距离对膜蛋白结构模型的实验判别" },
    ],
  },
};

const fourthBatchEvidenceUpgrades: Record<string, EvidenceUpgrade> = {
  MMO: {
    peptideExperiment: {
      conclusion: "精氨酸的α-氨基逐步N-甲基化后，含阴离子脂质时的辛醇/水分配提高；完全Nα-甲基化的寡聚精氨酸在部分细胞体系中的进入量也高于普通寡聚精氨酸。",
      measurement: "论文比较Ac-Arg-NH₂的一、二、三甲基衍生物，并测试完全Nα-甲基化寡聚精氨酸；甲基化程度与脂质辅助的辛醇分配正相关。",
      attributionBoundary: "细胞进入的改善依赖序列、细胞和实验条件；不能解释为任意肽中单个Arg甲基化都会提高渗透。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "α-氨基N-甲基化减少供氢能力，并改变精氨酸类似物与阴离子脂质形成离子对后的疏水分配。",
      preferredPositions: "可优先测试精氨酸富集的细胞穿透肽，尤其是不依赖游离主链NH供氢的位置。",
      positionsToAvoid: "需要主链NH参与氢键、酶切识别或严格构象的位置应谨慎。",
      evidenceSummary: "Nα-甲基化提高了脂质辅助分配，并在部分完整寡聚精氨酸中提高细胞进入。",
      boundary: "不是普遍膜渗透规律，论文明确观察到情境依赖。",
      sources: [{ title: "Calabretta et al., J Pept Sci 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10073267/" }],
    },
    sources: [{ title: "Calabretta et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10073267/", supports: "Nα-甲基精氨酸的分配和寡聚精氨酸细胞进入实验" }],
  },
  PRK: {
    peptideExperiment: {
      conclusion: "组蛋白H3第9位赖氨酸丙酰化后，AF9 YEATS结合强于同位置乙酰化。",
      measurement: "同序列H3(1–15)肽的ITC：K9pr Kd 2.7 µM，K9ac 5.0 µM，约增强1.9倍。",
      attributionBoundary: "这是H3K9与AF9 YEATS的特定结合，不代表所有Lys位点或所有靶点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys侧链丙酰化会中和正电荷并增加两碳疏水体积。",
      preferredPositions: "现有直接证据集中在组蛋白H3K9及能容纳长酰基的YEATS口袋。",
      positionsToAvoid: "依赖Lys正电荷形成盐桥的位置不宜直接替换。",
      evidenceSummary: "H3K9pr对AF9 YEATS的Kd为2.7 µM，比K9ac强约1.9倍。",
      boundary: "属于表观遗传读取实验，不是溶解度、口服吸收或一般稳定性实验。",
      sources: [{ title: "Li et al., Molecular Cell 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4841940/" }],
    },
    sources: [{ title: "Li et al., 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4841940/", supports: "H3K9不同酰化肽的ITC直接比较" }],
  },
  PHA: {
    peptideExperiment: {
      conclusion: "把Phe的羧基端变成醛后，可与丝氨酸或半胱氨酸蛋白酶形成可逆共价加合物并产生强抑制。",
      measurement: "N-酰基Phe-al与α-糜蛋白酶形成半缩醛；Cm-Phe-Phe-al抑制SARS-CoV Mpro的Ki为2.24±0.58 µM。",
      attributionBoundary: "醛必须位于肽的C端并对准催化残基；这是反应性战头，不是普通内部Phe替换。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "末端羧酸还原为醛后得到亲电战头，可被蛋白酶催化Ser/Cys可逆进攻。",
      preferredPositions: "适合蛋白酶底物样肽的P1末端。",
      positionsToAvoid: "普通内部位点、需要化学惰性或担心非特异反应的位置不适用。",
      evidenceSummary: "Phe-al已被NMR、晶体和酶动力学证实可形成可逆共价蛋白酶抑制。",
      boundary: "支持靶点抑制，不支持渗透性、溶解度或口服吸收改善。",
      sources: [
        { title: "Chen et al., Biochemistry 1979", url: "https://pubmed.ncbi.nlm.nih.gov/420824/" },
        { title: "Zhu et al., Antiviral Research 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21854807/" },
      ],
    },
    sources: [
      { title: "Chen et al., 1979", url: "https://pubmed.ncbi.nlm.nih.gov/420824/", supports: "Phe-al与糜蛋白酶半缩醛形成" },
      { title: "Zhu et al., 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21854807/", supports: "Phe-Phe-al对冠状病毒主蛋白酶的Ki与结构" },
    ],
  },
  A1IPL: {
    peptideExperiment: {
      conclusion: "对硼酸基苯丙氨酸装入荧光蛋白后，可把过氧亚硝酸盐氧化事件转成选择性荧光响应。",
      measurement: "pnGFP/pnRFP均完成体外和活细胞验证；低毫摩尔H₂O₂及多种其他活性氧没有同等响应。",
      attributionBoundary: "A1IPL与已核验的7N8为同一类pBoF化学结构；功能依赖定向进化后的完整色团环境。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Phe对位硼酸可被过氧亚硝酸盐氧化成酚，从而产生不可逆化学读出。",
      preferredPositions: "适合活性氧传感器或可氧化开关的反应核心。",
      positionsToAvoid: "普通肽位点不会自动产生荧光，且需要避免非预期氧化。",
      evidenceSummary: "pBoF是pnGFP和pnRFP选择性检测过氧亚硝酸盐的直接反应元件。",
      boundary: "属于传感器功能，不是药代性质改善。",
      sources: [
        { title: "Chen et al., 2016 · pnGFP", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4958459/" },
        { title: "Sun et al., 2023 · pnRFP", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10330634/" },
      ],
    },
    sources: [
      { title: "Chen et al., 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4958459/", supports: "pBoF荧光蛋白的选择性响应" },
      { title: "Sun et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10330634/", supports: "红色传感器的体内外验证" },
    ],
  },
  PM3: {
    peptideExperiment: {
      conclusion: "Pmp能作为不易被磷酸酶水解的磷酸酪氨酸模拟物，但不同靶点的亲和力可能保持，也可能明显下降。",
      measurement: "EGFR来源Pmp肽对两种PTP为不可水解竞争抑制剂，Ki 18.6和10.2 µM；在STAT3肽中，pTyr→Pmp导致亲和力下降超过100倍。",
      attributionBoundary: "稳定性提高与结合保持不是一回事；效果强烈依赖SH2/PTP靶点和序列。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "用C–P键取代pTyr的O–P键可提高抗磷酸酶水解能力，但也改变电荷和氢键几何。",
      preferredPositions: "适合必须长期保持磷酸化信号、且靶点能容忍Pmp几何差异的位置。",
      positionsToAvoid: "STAT3 SH2这类对桥氧和电荷高度敏感的位点不宜直接替换。",
      evidenceSummary: "Pmp提高抗磷酸酶稳定性；在部分靶点保留结合，在STAT3肽中却损失超过100倍亲和力。",
      boundary: "不能把“抗水解”写成“活性必然增强”。",
      sources: [
        { title: "Zhang et al., Biochemistry 1994", url: "https://pubmed.ncbi.nlm.nih.gov/7509638/" },
        { title: "Mandal et al., 2020 · STAT3直接比较", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7294595/" },
      ],
    },
    sources: [
      { title: "Zhang et al., 1994", url: "https://pubmed.ncbi.nlm.nih.gov/7509638/", supports: "Pmp肽的不可水解竞争抑制" },
      { title: "Mandal et al., 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7294595/", supports: "pTyr/Pmp同序列STAT3结合对照" },
    ],
  },
  NNH: {
    peptideExperiment: {
      conclusion: "nor-NOHA是高亲和力精氨酸酶抑制剂，并可改变血管舒张反应。",
      measurement: "人精氨酸酶II竞争抑制Ki为51 nM；人精氨酸酶I的Kd约50 nM（ITC）或517 nM（SPR）。",
      attributionBoundary: "这是游离氨基酸类似物的酶学和组织药理，不是肽内Arg单点替换。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "缩短Arg侧链并把胍基改成N-羟基胍，可桥联精氨酸酶双锰中心。",
      preferredPositions: "适合精氨酸酶抑制剂和NO通路研究。",
      positionsToAvoid: "普通肽结合位点或需要保留Arg完整正电荷时不能照搬。",
      evidenceSummary: "nor-NOHA对人精氨酸酶I/II达到纳摩尔级结合或抑制。",
      boundary: "不支持一般肽的渗透、稳定或口服吸收。",
      sources: [
        { title: "Colleluori et al., 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11478904/" },
        { title: "Ilies et al., 2010", url: "https://pubmed.ncbi.nlm.nih.gov/20153713/" },
      ],
    },
    sources: [
      { title: "Colleluori et al., 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11478904/", supports: "人精氨酸酶II抑制动力学" },
      { title: "Ilies et al., 2010", url: "https://pubmed.ncbi.nlm.nih.gov/20153713/", supports: "人精氨酸酶I结合与晶体结构" },
    ],
  },
  NOT: {
    peptideExperiment: {
      conclusion: "6-叠氮赖氨酸可作为肽中的定点连接把手，与炔基/环辛炔试剂形成稳定三唑连接。",
      measurement: "LSD1研究把叠氮赖氨酸与炔基甘氨酸装入肽后完成CuAAC环化，分离收率50%–60%；其他研究完成PMO和荧光分子的点击偶联。",
      attributionBoundary: "证据支持化学连接和环化，不代表未偶联的NOT能提高生物活性或膜渗透。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "把Lys末端氨基换成叠氮基，得到与多数生物基团正交的点击反应位点。",
      preferredPositions: "适合肽端部或溶剂暴露位点，用于环化、标记和载荷连接。",
      positionsToAvoid: "承担Lys正电荷盐桥或深埋结合的位置不宜替换。",
      evidenceSummary: "叠氮赖氨酸已在完整肽中完成CuAAC环化和多种载荷偶联。",
      boundary: "属于可操作的化学功能证据，不是药代改善证据。",
      sources: [
        { title: "Kalin et al., 2020 · LSD1环肽", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7057333/" },
        { title: "Browne et al., 2023 · PMO递送肽", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10460143/" },
      ],
    },
    sources: [
      { title: "Kalin et al., 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7057333/", supports: "叠氮赖氨酸肽的CuAAC环化与产率" },
      { title: "Browne et al., 2023", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10460143/", supports: "叠氮赖氨酸作为PMO偶联把手" },
    ],
  },
  S2C: {
    peptideExperiment: {
      conclusion: "BEC是精氨酸酶的慢结合竞争抑制剂，其硼酸在活性位形成四面体硼酸根并增强NO依赖的平滑肌舒张。",
      measurement: "精氨酸酶Ki为0.4–0.6 µM，ITC Kd 2.22 µM；在人精氨酸酶I中Kd为270 nM。",
      attributionBoundary: "这是游离氨基酸类似物的过渡态模拟作用，不是肽内Cys替换实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Cys侧链接入硼酸后可在双锰活性位形成四面体硼酸根，模拟Arg水解过渡态。",
      preferredPositions: "适合精氨酸酶抑制剂的反应中心。",
      positionsToAvoid: "普通肽结构位点或需要稳定巯基化学时不适用。",
      evidenceSummary: "BEC对精氨酸酶达到亚微摩尔抑制，并有晶体和组织功能验证。",
      boundary: "不支持一般肽性质改善。",
      sources: [
        { title: "Kim et al., Biochemistry 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11258879/" },
        { title: "Di Costanzo et al., PNAS 2005", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1201588/" },
      ],
    },
    sources: [
      { title: "Kim et al., 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11258879/", supports: "BEC动力学、ITC、晶体和组织舒张实验" },
      { title: "Di Costanzo et al., 2005", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1201588/", supports: "人精氨酸酶I的Kd和高分辨率结构" },
    ],
  },
  KYN: {
    peptideExperiment: {
      conclusion: "在达托霉素第13位把Kyn换成Trp后，抗菌活性降低约5倍，说明Kyn13对该环脂肽活性有贡献。",
      measurement: "同一化学酶法骨架中，含Kyn13的Dap MIC为20 µg/mL，Kyn13→Trp13后为100 µg/mL。",
      attributionBoundary: "比较骨架本身还缺少天然达托霉素Glu12的β-甲基；结论限定于该达托霉素类似物。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Trp吲哚环氧化开环为Kyn后，保留芳香性但增加羰基和邻氨基，并参与达托霉素闭环。",
      preferredPositions: "现有直接证据位置是达托霉素C端Kyn13。",
      positionsToAvoid: "普通Trp位点不能据此推断会增强活性。",
      evidenceSummary: "Kyn13→Trp13使该达托霉素骨架MIC由20升到100 µg/mL，即活性降低约5倍。",
      boundary: "这是特定抗菌环脂肽活性，不是通用药代性质。",
      sources: [{ title: "Grünewald et al., JACS 2004", url: "https://pubmed.ncbi.nlm.nih.gov/15612741/" }],
    },
    sources: [{ title: "Grünewald et al., 2004", url: "https://pubmed.ncbi.nlm.nih.gov/15612741/", supports: "达托霉素Kyn13/Trp13同骨架MIC比较" }],
  },
  A1A2Y: {
    peptideExperiment: {
      conclusion: "游离5-甲氧基-L-Trp具有可重复的抗炎和血管保护作用。",
      measurement: "在小鼠颈动脉结扎模型中相对载体使内膜增厚降低40%；细胞实验同时观察到平滑肌细胞增殖下降和内皮保护。",
      attributionBoundary: "这是游离代谢物给药，不是把Trp换成5-甲氧基Trp的肽内单点对照。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Trp吲哚环5位甲氧基化形成具有独立抗炎信号作用的游离代谢物。",
      preferredPositions: "目前只能用于游离5-MTP药理假设，肽内位置仍需实验。",
      positionsToAvoid: "不能用该论文声称肽的渗透、稳定或口服吸收得到改善。",
      evidenceSummary: "5-MTP在细胞和小鼠血管损伤模型中降低炎症、增殖与内膜增厚。",
      boundary: "没有与Trp等摩尔对照，也没有肽内替换实验。",
      sources: [{ title: "Wang et al., 2016 · 血管损伤模型", url: "https://pubmed.ncbi.nlm.nih.gov/27146795/" }],
    },
    sources: [{ title: "Wang et al., 2016", url: "https://pubmed.ncbi.nlm.nih.gov/27146795/", supports: "游离5-MTP的细胞和小鼠血管保护实验" }],
  },
  LYO: {
    peptideExperiment: {
      conclusion: "提高II型胶原中的羟基赖氨酸含量，并未测得三螺旋热稳定性变化。",
      measurement: "重组II型胶原的羟基赖氨酸含量由约17%提高到天然水平后，高、低羟基赖氨酸样品的热稳定性无差异。",
      attributionBoundary: "这是完整胶原的多位点变化，且糖基化也随之改变；结果是明确的‘未观察到热稳定性改变’。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Lys侧链4位羟基化提供糖基化和交联位点，但不等于直接提高胶原三螺旋熔解稳定性。",
      preferredPositions: "适合胶原的天然羟化、糖基化和交联研究。",
      positionsToAvoid: "普通药物肽或希望仅靠羟化提高热稳定性时不能照搬。",
      evidenceSummary: "高、低羟基赖氨酸II型胶原之间未发现热稳定性差异。",
      boundary: "多位点完整蛋白负结果，不能拆分到单个Lys位点。",
      sources: [{ title: "Myllyharju et al., 1998", url: "https://pubmed.ncbi.nlm.nih.gov/9503366/" }],
    },
    sources: [{ title: "Myllyharju et al., 1998", url: "https://pubmed.ncbi.nlm.nih.gov/9503366/", supports: "高低羟基赖氨酸胶原的热稳定性比较" }],
  },
  HR7: {
    peptideExperiment: {
      conclusion: "β³-高精氨酸寡聚肽具有抗肽酶和细胞进入能力；在蛋白酶切割位使用β-高精氨酸还可提高因子Xa相对凝血酶的抑制选择性。",
      measurement: "荧光β³-八/十聚精氨酸进入HeLa和角质形成细胞并到达细胞核；β-高精氨酸肽对因子Xa的抑制强于对应α肽。",
      attributionBoundary: "进入实验使用多个β³-hArg共同构成的β肽，不能归因于单个位点；蛋白酶结果限于切割位。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "把Arg变成β³-高精氨酸会延长主链，同时保留胍基正电荷。",
      preferredPositions: "适合β肽细胞穿透骨架，或因子Xa/凝血酶底物的切割位。",
      positionsToAvoid: "普通α肽内部单点不能直接套用整条β-寡聚精氨酸结果。",
      evidenceSummary: "β³-八/十聚精氨酸能进入细胞；切割位β-hArg还能改变因子Xa选择性。",
      boundary: "一个是多位点β肽，一个是特定蛋白酶序列。",
      sources: [
        { title: "Seebach et al., 2004", url: "https://pubmed.ncbi.nlm.nih.gov/17191776/" },
        { title: "Bromfield et al., 2006", url: "https://pubmed.ncbi.nlm.nih.gov/16923021/" },
      ],
    },
    sources: [
      { title: "Seebach et al., 2004", url: "https://pubmed.ncbi.nlm.nih.gov/17191776/", supports: "β³-寡聚精氨酸的细胞进入、抗肽酶和毒性实验" },
      { title: "Bromfield et al., 2006", url: "https://pubmed.ncbi.nlm.nih.gov/16923021/", supports: "β-hArg切割位的因子Xa/凝血酶比较" },
    ],
  },
  KHB: {
    peptideExperiment: {
      conclusion: "S构型β-羟丁酰赖氨酸可被SIRT3立体选择性识别并去修饰。",
      measurement: "H3K9bhb肽的ITC：S构型Kd 39.2 µM，R构型253.8 µM，S构型结合约强6.5倍；另有酶动力学和晶体结构。",
      attributionBoundary: "这是H3K9与SIRT3的修饰识别，不是一般肽的稳定或渗透实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端接S-β-羟丁酰基后中和正电荷，并增加带手性羟基的四碳侧链。",
      preferredPositions: "现有证据集中在组蛋白H3K9等SIRT3可识别位点。",
      positionsToAvoid: "不能把SIRT3识别直接解释为药物肽性质改善。",
      evidenceSummary: "SIRT3对S-Kbhb的结合约比R-Kbhb强6.5倍，并能催化去β-羟丁酰化。",
      boundary: "结论依赖构型、组蛋白序列和特定去酰化酶。",
      sources: [{ title: "Zhang et al., Cell Discovery 2019", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6796883/" }],
    },
    sources: [{ title: "Zhang et al., 2019", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6796883/", supports: "H3K9bhb-S/R的ITC、酶学和晶体比较" }],
  },
  XRW: {
    peptideExperiment: {
      conclusion: "L-乳酰赖氨酸肽可被CobB高亲和识别并以NAD依赖方式去乳酰化。",
      measurement: "同序列GpmA肽的ITC：乳酰化Kd 0.371 µM，乙酰化0.508 µM；CobB去乳酰化kcat/Km为3.9×10⁴ M⁻¹s⁻¹。",
      attributionBoundary: "这是细菌代谢酶肽段与CobB的修饰酶学，不是一般肽药代性质。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端接L-乳酰基后中和正电荷并增加一个手性羟基。",
      preferredPositions: "适合研究细菌乳酰化及CobB底物识别的Kla位点。",
      positionsToAvoid: "普通短肽设计不能直接推断会改善渗透或稳定。",
      evidenceSummary: "CobB对乳酰GpmA肽Kd 0.371 µM，并完成NAD依赖去乳酰化。",
      boundary: "支持修饰读写功能，不支持口服吸收。",
      sources: [{ title: "Dong et al., Nature Communications 2022", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9636275/" }],
    },
    sources: [{ title: "Dong et al., 2022", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9636275/", supports: "乳酰/乙酰GpmA肽的ITC和CobB动力学" }],
  },
  RGL: {
    peptideExperiment: {
      conclusion: "C端精氨醛可与丝氨酸或半胱氨酸蛋白酶形成可逆共价加合物，是leupeptin等肽醛抑制剂的反应中心。",
      measurement: "晶体结构测得leupeptin醛碳与胰蛋白酶Ser195形成1.42 Å共价键；与papain Cys25也形成共价加合物。",
      attributionBoundary: "Arg-al必须位于C端并对准蛋白酶催化残基；不是普通内部Arg替换。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "把Arg末端羧基还原成醛，得到可逆共价蛋白酶战头。",
      preferredPositions: "适合胰蛋白酶样或半胱氨酸蛋白酶底物肽的P1末端。",
      positionsToAvoid: "非末端、需要化学惰性或担心广谱蛋白酶抑制时不适用。",
      evidenceSummary: "leupeptin中的Arg-al已被动力学和晶体结构直接证实形成共价半缩醛/硫代半缩醛。",
      boundary: "支持靶点抑制，不等于溶解度或口服性改善。",
      sources: [
        { title: "Kurachi et al., 1991", url: "https://pubmed.ncbi.nlm.nih.gov/1911768/" },
        { title: "Hubbard et al., 1996", url: "https://pubmed.ncbi.nlm.nih.gov/8845765/" },
      ],
    },
    sources: [
      { title: "Kurachi et al., 1991", url: "https://pubmed.ncbi.nlm.nih.gov/1911768/", supports: "leupeptin与胰蛋白酶共价半缩醛" },
      { title: "Hubbard et al., 1996", url: "https://pubmed.ncbi.nlm.nih.gov/8845765/", supports: "胰蛋白酶-leupeptin共价键晶体结构" },
    ],
  },
  "2RX": {
    peptideExperiment: {
      conclusion: "Ser19的硫代磷酸化能够像普通磷酸化一样激活肌球蛋白，同时对细胞磷酸酶更耐受。",
      measurement: "半合成mRLC在光解笼后恢复肌球蛋白ATPase和肌动蛋白运动活性，并在COS7细胞中实现局部、持续的肌球蛋白激活。",
      attributionBoundary: "实验使用带光笼前体并在Ser19定点释放thiophosphoserine；只适用于这一调控位点。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "磷酸基一个氧换成硫后，大体保留磷酸化功能，并提高抗磷酸酶能力。",
      preferredPositions: "适合需要较持久模拟Ser磷酸化的调控位点。",
      positionsToAvoid: "需要快速去磷酸化复位或靶蛋白不能容忍硫代磷酸几何的位置不适用。",
      evidenceSummary: "mRLC Ser19硫代磷酸化在光解后激活肌球蛋白，并比普通pSer更耐磷酸酶。",
      boundary: "不是完全不可水解，也不能推广到所有pSer位点。",
      sources: [{ title: "Goguen et al., Angew Chem Int Ed 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3406609/" }],
    },
    sources: [{ title: "Goguen et al., 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3406609/", supports: "Ser19硫代磷酸化mRLC的ATPase、运动和细胞光控实验" }],
  },
  TPQ: {
    peptideExperiment: {
      conclusion: "特定位点Tyr氧化成TPQ后，铜胺氧化酶由无活性的前体转为可催化胺氧化的酶。",
      measurement: "缺铜前体无活性；加Cu²⁺并在有氧条件下形成TPQ时活性显著恢复，Y→F突变则不能形成TPQ或完成反应。",
      attributionBoundary: "TPQ在完整铜胺氧化酶活性位自催化生成，需要铜、氧气和精确蛋白环境；不是可随意替换的普通Tyr衍生物。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr芳环被氧化为醌后成为可形成Schiff碱并进行氧化还原循环的共价辅因子。",
      preferredPositions: "仅适合铜胺氧化酶保守TPQ前体位点及人工辅因子研究。",
      positionsToAvoid: "普通肽或缺少铜配位环境的位置不能期待自动形成活性TPQ。",
      evidenceSummary: "Tyr→TPQ与酶活恢复同步；Y→F或缺铜前体不能完成该催化功能。",
      boundary: "属于完整酶活性位辅因子，不是药代性质。",
      sources: [
        { title: "Matsuzaki et al., FEBS Letters 1994", url: "https://doi.org/10.1016/0014-5793(94)00884-1" },
        { title: "Son et al., Nature Communications 2019", url: "https://www.nature.com/articles/s41467-018-08280-w" },
      ],
    },
    sources: [
      { title: "Matsuzaki et al., 1994", url: "https://doi.org/10.1016/0014-5793(94)00884-1", supports: "缺铜前体形成TPQ并恢复活性" },
      { title: "Son et al., 2019", url: "https://www.nature.com/articles/s41467-018-08280-w", supports: "野生型/Y379F、铜条件与TPQ功能实验" },
    ],
  },
};

// Hand-reviewed literature upgrades. These records are kept separate from the
// generated structure batches so rebuilding the structural analysis cannot
// overwrite source-level evidence decisions.
export const naturalParentEvidenceUpgrades: Record<string, EvidenceUpgrade> = {
  ...finalBatchEvidenceUpgrades,
  ...fourthBatchEvidenceUpgrades,
  ...thirdBatchEvidenceUpgrades,
  "02K": {
    peptideExperiment: {
      conclusion: "在甲酰-Met-X-Phe趋化三肽中，把第2位Leu换成Ac6c后，诱导兔中性粒细胞释放溶菌酶的活性约提高78倍。",
      measurement: "论文在同一三肽系列中比较Leu、Aib、Acc5和Ac6c；Ac6c类似物相对Leu母体肽约强78倍，属于明确的同骨架活性对照。",
      attributionBoundary: "这里比较的是Leu→Ac6c，而网站的结构母体是Ala；结果只证明Ac6c在该趋化三肽第2位能够增强活性，不能推广为任意Ala位点或任意肽都会改善。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Ac6c把α-碳锁进六元碳环，明显增加体积并限制局部主链构象。",
      preferredPositions: "已有直接结果的位置是甲酰-Met-X-Phe趋化三肽的第2位；新骨架可优先考虑需要较大疏水体积和构象限制的位置。",
      positionsToAvoid: "空间狭窄或必须保留天然Leu/Ala主链构象的位置不能直接套用。",
      evidenceSummary: "同骨架实验中，第2位Ac6c类似物的细胞功能活性约为Leu母体肽的78倍。",
      boundary: "这是特定线性趋化三肽的活性结果，不是渗透性、稳定性、溶解度或口服吸收实验。",
      sources: [
        { title: "Sukumar et al., BBRC 1985 · Ac6c三肽同骨架活性对照", url: "https://pubmed.ncbi.nlm.nih.gov/3985973/" },
        { title: "Paul et al., JACS 1986 · 含Ac6c肽的实验构象研究", url: "https://doi.org/10.1021/ja00280a038" },
      ],
    },
    sources: [
      { title: "Sukumar et al., BBRC 1985", url: "https://pubmed.ncbi.nlm.nih.gov/3985973/", supports: "第2位Leu→Ac6c的同骨架活性比较" },
      { title: "Paul et al., JACS 1986", url: "https://doi.org/10.1021/ja00280a038", supports: "含Ac6c肽的理论与实验构象研究" },
    ],
  },
  "1AC": {
    peptideExperiment: {
      conclusion: "Ac3c相对Ala显著改变螺旋倾向；实验测得它更接近Pro，是螺旋破坏型残基，而不是Ala那样的螺旋形成残基。",
      measurement: "研究用模型肽测定天然和受限氨基酸的Lifson–Roig螺旋参数；Ac3c与Ala形成直接构象比较，另有Ac3c富集短肽的X射线结构支持其转角和3₁₀螺旋偏好。",
      attributionBoundary: "证据直接支持构象方向，但没有测量膜渗透、蛋白酶稳定性、溶解度或口服吸收，不能从‘构象受限’自动推导这些性质得到改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "在Ala的α位形成环丙烷后，局部主链可采用的构象范围发生明显改变。",
      preferredPositions: "适合优先测试希望打断常规α螺旋、形成转角或重新组织局部构象的位置。",
      positionsToAvoid: "需要保留Ala高螺旋倾向的位置不宜直接替换。",
      evidenceSummary: "模型肽实验显示Ac3c的螺旋倾向更接近Pro，和Ala方向不同；晶体学研究同时观察到转角及畸变3₁₀螺旋。",
      boundary: "这是构象性质的直接证据，不等于药代性质或口服性证据。",
      sources: [
        { title: "Alías et al., 2010 · Ac3c与Ala的实验螺旋倾向比较", url: "https://pubmed.ncbi.nlm.nih.gov/20135035/" },
        { title: "Benedetti et al., 1989 · Ac3c短肽X射线构象", url: "https://pubmed.ncbi.nlm.nih.gov/2489104/" },
      ],
    },
    sources: [
      { title: "Alías et al., 2010", url: "https://pubmed.ncbi.nlm.nih.gov/20135035/", supports: "Ac3c与Ala的模型肽螺旋倾向直接比较" },
      { title: "Benedetti et al., 1989", url: "https://pubmed.ncbi.nlm.nih.gov/2489104/", supports: "Ac3c富集短肽的X射线构象实验" },
    ],
  },
  DMH: {
    peptideExperiment: {
      conclusion: "在血管紧张素II第1位把Asn侧链酰胺改成N4,N4-二甲基酰胺后，内在活性仍完整，但效力降低，同时烷基化系列的作用持续时间延长。",
      measurement: "以[Asn¹]血管紧张素II为100%，[N4,N4-二甲基Asn¹]类似物在兔主动脉实验中的相对效力为46%，在大鼠血压实验中为30%。",
      attributionBoundary: "这是第1位Asn侧链酰胺烷基化的同骨架实验；它证明效力降低和作用时间变化，不能解释为渗透性或口服吸收改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Asn侧链酰胺氮双甲基化会去掉供氢能力并增大疏水体积，但仍保留羰基受体。",
      preferredPositions: "已有实验位置是血管紧张素II的N端第1位Asn；新项目应优先从相似的暴露侧链酰胺位置开始。",
      positionsToAvoid: "若Asn侧链NH₂承担关键氢键，双甲基化很可能损害结合。",
      evidenceSummary: "直接对照显示二甲基类似物仍有完整内在活性，但相对效力降至兔主动脉46%、大鼠血压30%；烷基化系列作用持续时间延长。",
      boundary: "效力和持续时间方向已测定，但没有单独测量该残基对溶解度、膜渗透或口服生物利用度的影响。",
      sources: [
        { title: "Cordopatis et al., J. Med. Chem. 1981 · Asn¹侧链烷基化直接对照", url: "https://pubmed.ncbi.nlm.nih.gov/7205889/" },
      ],
    },
    sources: [
      { title: "Cordopatis et al., J. Med. Chem. 1981", url: "https://pubmed.ncbi.nlm.nih.gov/7205889/", supports: "[Asn¹]血管紧张素II与N4,N4-二甲基Asn¹类似物的体内外活性比较" },
    ],
  },
  NLY: {
    peptideExperiment: {
      conclusion: "在环状SFTI-1的P1位（Lys5）换入N-(4-氨基丁基)甘氨酸后，反应位点获得很强的抗蛋白酶能力，同时仍保持胰蛋白酶抑制活性。",
      measurement: "早期同骨架研究报告[Nlys⁵]SFTI-1的P1–P1′位点对β-胰蛋白酶和α-糜蛋白酶水解呈完全抗性；后续更大系列发现部分线性或不同环化形式仍可被水解，说明效果依赖环化方式。",
      attributionBoundary: "NLY在结构上由Gly作N-取代得到，但论文中功能上替换的是Lys5。抗酶结果只适用于SFTI-1及其具体环化形式，不能推广到所有肽。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "NLY是带赖氨酸样侧链的N-取代甘氨酸（peptoid单元），会改变主链并保留末端正电荷。",
      preferredPositions: "直接证据位置是SFTI-1的P1位Lys5，尤其适合评估蛋白酶识别位点。",
      positionsToAvoid: "其他位置、线性骨架或不同环化形式不能照搬；后续研究已经观察到部分构型仍会被水解。",
      evidenceSummary: "在特定环状SFTI-1中，NLY替换Lys5可保持抑制活性并使P1–P1′位点呈完全抗蛋白酶；后续研究证明该效果具有骨架依赖性。",
      boundary: "该证据支持特定位点的稳定性和活性，不提供膜渗透、溶解度或口服吸收结论。",
      sources: [
        { title: "Stawikowski et al., ChemBioChem 2005 · NLY-SFTI-1稳定性与活性", url: "https://pubmed.ncbi.nlm.nih.gov/15883970/" },
        { title: "Łęgowska et al., Bioorg. Med. Chem. 2008 · 环化方式依赖性复核", url: "https://doi.org/10.1016/j.bmc.2008.03.075" },
      ],
    },
    sources: [
      { title: "Stawikowski et al., ChemBioChem 2005", url: "https://pubmed.ncbi.nlm.nih.gov/15883970/", supports: "Lys5→NLY的SFTI-1同骨架蛋白酶抗性和抑制活性实验" },
      { title: "Łęgowska et al., Bioorg. Med. Chem. 2008", url: "https://doi.org/10.1016/j.bmc.2008.03.075", supports: "不同环化形式下NLY肽模拟物的稳定性边界" },
    ],
  },
  PFF: {
    peptideExperiment: {
      conclusion: "在FXIIa双环肽的第3位把Phe换成4-氟-Phe后，抑制活性明显增强。",
      measurement: "同骨架结果中，Phe3→4-氟-Phe得到FXII800，Ki为0.84 ± 0.03 nM；原先FXII618的Ki约22 ± 4 nM。",
      attributionBoundary: "活性增强可归到该位置的4-氟取代；后续长血浆半衰期来自与其他改造的组合，不能单独归因于PFF。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Phe芳环对位加氟，体积变化很小，但会改变芳环电子分布和口袋中的相互作用。",
      preferredPositions: "已验证位置是FXIIa双环抑制肽第3位、朝向Tyr439/His393芳香口袋的Phe。",
      positionsToAvoid: "不朝向相似芳香口袋的位置不能期待同样增益；氟代也不能自动视为提高稳定性。",
      evidenceSummary: "Phe3→4-氟-Phe的配对改造把FXIIa抑制剂推进到亚纳摩尔Ki范围；后续研究在组合优化物中再次确认该残基贡献活性。",
      boundary: "这里直接证明的是该骨架第3位的抑制活性提高；稳定性、渗透性和口服性不能由这条结果外推。",
      sources: [
        { title: "Wilbs et al., Nature Communications 2020 · FXII800同骨架活性", url: "https://doi.org/10.1038/s41467-020-17648-w" },
        { title: "EP3288962A1 · FXIIa双环肽实施例与配对数据", url: "https://patents.google.com/patent/EP3288962A1/en" },
      ],
    },
    sources: [
      { title: "Wilbs et al., Nature Communications 2020", url: "https://doi.org/10.1038/s41467-020-17648-w", supports: "Phe3→4-氟-Phe的同骨架FXIIa抑制活性数据" },
      { title: "EP3288962A1", url: "https://patents.google.com/patent/EP3288962A1/en", supports: "4-氟-Phe双环肽实施例、Ki和位置对照" },
    ],
  },
  CGU: {
    peptideExperiment: {
      conclusion: "在相同五肽模型中，把Glu换成γ-羧基谷氨酸（Gla）后，钙离子结合能力明显增强。",
      measurement: "Ac-GGEGG-CONH₂对Ca²⁺的结合很弱（KD >100 mM），Ac-GGγGG-CONH₂的KD为14.3 mM；这是同一位置Glu→Gla的直接配对实验。",
      attributionBoundary: "该结果证明的是模型肽中的Ca²⁺结合增强，不是溶解度、膜渗透、抗酶解或口服吸收实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Glu侧链再增加一个羧基形成Gla，可提供更强的多齿金属离子配位能力。",
      preferredPositions: "优先考虑需要Ca²⁺配位、金属依赖折叠或界面组装的Glu位置。",
      positionsToAvoid: "不需要金属配位、局部负电荷已经很高或以被动膜渗透为主要目标的位置应谨慎。",
      evidenceSummary: "同骨架模型肽中，Glu→Gla把Ca²⁺结合从KD >100 mM提高到14.3 mM。",
      boundary: "方向只适用于金属结合；不能把增强金属结合写成普遍改善药代性质。",
      sources: [
        { title: "Calcium binding by γ-carboxyglutamic acid · Glu/Gla直接比较", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12312033/" },
      ],
    },
    sources: [
      { title: "Calcium binding by γ-carboxyglutamic acid", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12312033/", supports: "相同五肽中Glu与Gla的Ca²⁺结合KD直接比较" },
    ],
  },
  SEP: {
    peptideExperiment: {
      conclusion: "Ser磷酸化成磷酸丝氨酸后，对α螺旋稳定性的作用取决于位置：靠近N端增强，位于螺旋内部则降低。",
      measurement: "在Ala基模型螺旋肽中，pSer相对Ser在N端位置最多稳定约2.3 kcal/mol，在螺旋内部则去稳定约1.2 kcal/mol；另有pSer→Ser配对实验显示TCR结合和T细胞激活降低。",
      attributionBoundary: "这是明确的位置依赖性构象和结合证据；不代表pSer能普遍提高稳定性、渗透性或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Ser侧链磷酸化会增加负电荷，并改变盐桥、溶剂化和局部构象。",
      preferredPositions: "可优先评估螺旋N端、需要Arg/Lys盐桥或需要磷酸依赖识别的位置。",
      positionsToAvoid: "螺旋内部、以被动渗透为首要目标或靶点不能容忍负电荷的位置应谨慎。",
      evidenceSummary: "pSer相对Ser在螺旋N端最多增强稳定约2.3 kcal/mol，在内部则降低约1.2 kcal/mol；特定磷酸肽中pSer还直接增强TCR识别。",
      boundary: "构象和识别效果强烈依赖位置与结合对象，不能只凭磷酸化标签统一写成增强。",
      sources: [
        { title: "Andrew et al., Biochemistry 2002 · pSer位置依赖的螺旋稳定性", url: "https://pubmed.ncbi.nlm.nih.gov/11827536/" },
        { title: "Molecular mechanism of phosphopeptide neoantigen immunogenicity · pSer/Ser配对", url: "https://pubmed.ncbi.nlm.nih.gov/37353482/" },
      ],
    },
    sources: [
      { title: "Andrew et al., Biochemistry 2002", url: "https://pubmed.ncbi.nlm.nih.gov/11827536/", supports: "pSer与Ser在不同螺旋位置的自由能直接比较" },
      { title: "Molecular mechanism of phosphopeptide neoantigen immunogenicity", url: "https://pubmed.ncbi.nlm.nih.gov/37353482/", supports: "pSer→Ser对TCR结合和细胞激活的配对实验" },
    ],
  },
  DAH: {
    peptideExperiment: {
      conclusion: "把肽中的Tyr转化为DOPA后，湿表面黏附能力增强；DOPA相对非邻苯二酚芳香残基表现出更强、更广的表面作用。",
      measurement: "短肽在Tyr经酪氨酸酶转化为DOPA前后进行了表面力测试；另一个配对实验比较Lys-DOPA二肽与Lys-Phe二肽，DOPA组合的黏附更强且适用表面更广。",
      attributionBoundary: "该证据直接支持湿表面黏附/界面结合，不是药物膜渗透、蛋白酶稳定性或口服吸收证据；DOPA氧化状态会影响结果。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr芳环增加一个邻位羟基形成DOPA后，可增强多点氢键、金属配位和表面黏附。",
      preferredPositions: "适用于希望增强材料表面、金属氧化物或湿界面结合的暴露芳香位点。",
      positionsToAvoid: "以被动渗透为目标、容易发生氧化副反应或靶点口袋不能容纳额外羟基的位置应谨慎。",
      evidenceSummary: "Tyr→DOPA的肽实验以及Lys-DOPA/Lys-Phe配对实验均支持湿表面黏附增强。",
      boundary: "结论属于界面黏附，不应改写成普遍的受体亲和力或药代改善。",
      sources: [
        { title: "Bridging adhesion of mussel-inspired peptides · 有/无DOPA对照", url: "https://pubmed.ncbi.nlm.nih.gov/25540823/" },
        { title: "Li et al., Nature Communications 2020 · Lys-DOPA湿黏附", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7403305/" },
      ],
    },
    sources: [
      { title: "Bridging adhesion of mussel-inspired peptides", url: "https://pubmed.ncbi.nlm.nih.gov/25540823/", supports: "同序列Tyr转化为DOPA前后的黏附实验" },
      { title: "Li et al., Nature Communications 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7403305/", supports: "Lys-DOPA与Lys-Phe短肽的单分子黏附比较" },
    ],
  },
  NLE: {
    peptideExperiment: {
      conclusion: "在Aβ40/42第35位把Met换成Nle后，自组装只有中等程度变化，三种实验中的神经毒性没有显著改变。",
      measurement: "研究对Aβ40和Aβ42的Met35→Nle类似物进行了多种生物物理自组装和细胞毒性配对测定；结果不支持Nle在该骨架中显著降低神经毒性。",
      attributionBoundary: "这是Aβ第35位的直接结果；它说明Nle可去除Met的硫氧化化学，但不能由此宣称所有肽都会更稳定或活性更好。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Nle用亚甲基替代Met侧链中的硫，体积和疏水性相近，但不再具有Met相同的硫氧化反应。",
      preferredPositions: "可在希望保留Met样疏水体积、同时去掉硫氧化位点的位置进行配对测试。",
      positionsToAvoid: "若Met承担抗氧化、硫特异相互作用或关键构象作用，Nle不一定等效。",
      evidenceSummary: "Aβ的Met35→Nle仅中等改变组装，对神经毒性无显著影响；细胞蛋白整体替换研究还提示失去Met可能降低抗氧化保护。",
      boundary: "Nle常被称为Met的非氧化等排体，但是否提高具体肽的化学稳定性仍需在目标骨架中测量。",
      sources: [
        { title: "Despite its role in assembly, methionine 35 is not necessary for amyloid beta-protein toxicity", url: "https://pubmed.ncbi.nlm.nih.gov/20345758/" },
        { title: "Methionine in proteins defends against oxidative stress", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2630790/" },
      ],
    },
    sources: [
      { title: "Despite its role in assembly, methionine 35 is not necessary for amyloid beta-protein toxicity", url: "https://pubmed.ncbi.nlm.nih.gov/20345758/", supports: "Aβ40/42中Met35→Nle的组装和毒性直接比较" },
      { title: "Methionine in proteins defends against oxidative stress", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2630790/", supports: "Met部分替换为Nle后的氧化应激实验边界" },
    ],
  },
  SME: {
    peptideExperiment: {
      conclusion: "在特定两亲性α螺旋肽中，Met氧化为甲硫氨酸亚砜后，水相α螺旋含量增强，但抗菌活性和溶血活性均降低。",
      measurement: "研究在相同BKBA-20肽骨架、相同Met位置上比较还原态与氧化态；圆二色谱显示氧化后螺旋度上升，功能实验显示抗菌和溶血作用明显减弱。",
      attributionBoundary: "这是特定膜活性肽中的直接氧化配对；不能推广为所有Met氧化都会提高构象稳定性，也不等于提高蛋白酶稳定性。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Met侧链氧化为亚砜会明显增加极性，同时保留肽骨架不变。",
      preferredPositions: "可用于研究疏水驱动力、氧化响应或希望降低膜破坏活性的Met位置。",
      positionsToAvoid: "需要保持疏水膜结合或抗菌活性的Met位置不应默认氧化有利。",
      evidenceSummary: "同骨架直接实验显示：Met→MetO使水相螺旋度增强，但抗菌活性和溶血活性降低。",
      boundary: "这里的‘螺旋增强’与‘功能降低’同时成立，不能只保留其中一个方向。",
      sources: [
        { title: "Methionine Oxidation Stabilizes α-Helices but Attenuates Biological Activity in Amphipathic Peptides", url: "https://pubmed.ncbi.nlm.nih.gov/42415280/" },
      ],
    },
    sources: [
      { title: "Methionine Oxidation Stabilizes α-Helices but Attenuates Biological Activity in Amphipathic Peptides", url: "https://pubmed.ncbi.nlm.nih.gov/42415280/", supports: "相同肽中Met还原态与亚砜态的构象、抗菌和溶血直接比较" },
    ],
  },
  A1APM: {
    peptideExperiment: {
      conclusion: "在特定缓激肽B1受体拮抗肽第5位加入α-甲基-Phe后，保持高拮抗效力和选择性，并获得ACE及血浆氨肽酶耐受性。",
      measurement: "R892等αMePhe5类似物在人脐静脉和兔主动脉实验中pA2约7.7–8.8；Nα-乙酰化类似物耐受兔肺ACE和人血浆氨肽酶，R892体内ID50为2.8 nmol/kg（静脉）。",
      attributionBoundary: "同系列还包含D-βNal7、Ile8和N端修饰，因此可证明αMePhe与该骨架相容并参与稳定性/活性优化，但不能把所有效果完全拆给一个残基。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Phe的α位甲基化增加位阻并限制局部主链构象。",
      preferredPositions: "直接研究位置是desArg9-bradykinin类B1拮抗肽的第5位Phe。",
      positionsToAvoid: "空间紧密、必须保留天然Phe主链构象或未做逐位扫描的位置不能直接套用。",
      evidenceSummary: "αMePhe5缓激肽类似物保持高B1拮抗活性，并表现出ACE和血浆氨肽酶耐受。",
      boundary: "该论文是多处已优化骨架中的定点研究，没有测膜渗透、溶解度或口服吸收。",
      sources: [
        { title: "Gobeil et al., Hypertension 1999 · αMePhe5缓激肽类似物", url: "https://pubmed.ncbi.nlm.nih.gov/10082494/" },
      ],
    },
    sources: [
      { title: "Gobeil et al., Hypertension 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10082494/", supports: "αMePhe5肽的受体活性、ACE和血浆氨肽酶耐受实验" },
    ],
  },
  A1BEB: {
    peptideExperiment: {
      conclusion: "在vapreotide类似物中换入(S)-α-甲基赖氨酸后，SSTR2特异结合能力降低至无法保持。",
      measurement: "论文合成了含(S)-α-甲基-α-赖氨酸的vapreotide类似物并进行生物学评价；结果明确报告该类似物失去对生长抑素受体2亚型的特异结合。",
      attributionBoundary: "这是负向实验结果，说明该位置不能容忍α-甲基赖氨酸；论文摘要未给出其他药代性质数据。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Lys的α位增加甲基会限制主链构象并增大位阻，但可能破坏受体所需几何。",
      preferredPositions: "不应优先照搬vapreotide的已测试位置；若使用，应选择非关键结合位点并做逐位对照。",
      positionsToAvoid: "承担SSTR2识别作用的vapreotide对应位置应避免。",
      evidenceSummary: "含(S)-α-甲基赖氨酸的vapreotide类似物失去SSTR2特异结合。",
      boundary: "这是明确的活性降低证据，不代表该残基在所有肽中都不适用。",
      sources: [
        { title: "α-Methyllysine synthesis and vapreotide analogue evaluation", url: "https://pubmed.ncbi.nlm.nih.gov/23942875/" },
      ],
    },
    sources: [
      { title: "α-Methyllysine synthesis and vapreotide analogue evaluation", url: "https://pubmed.ncbi.nlm.nih.gov/23942875/", supports: "含α-甲基赖氨酸的vapreotide类似物SSTR2结合实验" },
    ],
  },
  DI7: {
    peptideExperiment: {
      conclusion: "在MACE2环状阿片肽骨架中加入2,6-二甲基-L-酪氨酸得到MACE4后，成为该系列效力和体内镇痛活性最佳的类似物。",
      measurement: "同一环状biphalin类似物系列比较受体结合、体内镇痛和作用持续性；MACE4被报告为该系列效力及体内抗伤害作用最佳。",
      attributionBoundary: "论文同时比较连接臂和环化结构，摘要未提供可单独拆分给Dmt的具体倍数；结论限于MACE2/MACE4骨架。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Tyr芳环2、6位加甲基会增大疏水体积，并限制芳环与侧链的相对取向。",
      preferredPositions: "已有结果位于MACE系列环状阿片肽的关键芳香药效团位置。",
      positionsToAvoid: "空间较窄、需要Tyr芳环自由旋转或甲基会产生位阻冲突的位置应谨慎。",
      evidenceSummary: "Dmt-containing MACE4在同系列中表现出最佳效力和体内镇痛活性。",
      boundary: "直接支持该骨架中的活性增强，不提供口服吸收、溶解度或单残基稳定性结论。",
      sources: [
        { title: "Potent, Efficacious, and Stable Cyclic Opioid Peptides · MACE4", url: "https://pubmed.ncbi.nlm.nih.gov/31834798/" },
      ],
    },
    sources: [
      { title: "Potent, Efficacious, and Stable Cyclic Opioid Peptides", url: "https://pubmed.ncbi.nlm.nih.gov/31834798/", supports: "MACE2与含Dmt的MACE4同系列体内外活性比较" },
    ],
  },
  DAB: {
    peptideExperiment: {
      conclusion: "在Pep05类抗菌肽中用Dab等短侧链碱性残基替换Lys/Arg后，蛋白酶和血浆稳定性总体增强，同时可以保持α螺旋；具体抗菌活性取决于组合。",
      measurement: "Dab/Dap/hArg组合肽UP11–UP14在胰蛋白酶和人血浆实验中明显比Pep05稳定；多条肽在5小时胰蛋白酶处理后仍保留约38%–61%，而天然碱性残基丰富的对照更快降解。",
      attributionBoundary: "多数实验同时替换多个Lys/Arg且混合使用Dab、Dap或hArg，因此只能证明Dab可参与提高稳定性，不能给出Dab单点固定增幅。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Dab保留末端碱性氨基，但侧链比Lys短，可改变膜作用和蛋白酶识别。",
      preferredPositions: "可从抗菌肽中暴露的Lys/Arg位点或已知胰蛋白酶切点开始组合扫描。",
      positionsToAvoid: "需要天然Lys侧链长度形成精确盐桥的位置，以及尚未做单点对照的关键结合位点应谨慎。",
      evidenceSummary: "Dab参与的多位点Pep05类似物在胰蛋白酶和人血浆中稳定性增强，并大体保持螺旋构象。",
      boundary: "这是多位点、混合非天然残基的完整肽证据，不是Dab单残基直接对照。",
      sources: [
        { title: "D- and Unnatural Amino Acid Substituted Antimicrobial Peptides · Pep05系列", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7688903/" },
        { title: "Lysine-homologue substitution in stapled heptapeptides", url: "https://pubmed.ncbi.nlm.nih.gov/38714021/" },
      ],
    },
    sources: [
      { title: "D- and Unnatural Amino Acid Substituted Antimicrobial Peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7688903/", supports: "Dab/Dap/hArg替换肽的胰蛋白酶、血浆稳定性、构象和活性实验" },
      { title: "Lysine-homologue substitution in stapled heptapeptides", url: "https://pubmed.ncbi.nlm.nih.gov/38714021/", supports: "短侧链Lys同系物对抗菌活性和蛋白酶稳定性的同系列证据" },
    ],
  },
  TPO: {
    peptideExperiment: {
      conclusion: "Thr磷酸化为pThr后，局部构象明显变得更有序、更受限，并强烈偏好特定的紧凑环状构象。",
      measurement: "研究用圆二色谱、NMR、小分子晶体结构和PDB统计比较Thr与pThr；二负电荷pThr出现明显的无序到有序转变，并限制主链φ角和侧链χ₂角。",
      attributionBoundary: "这是构象性质的直接证据，不代表蛋白酶稳定性、膜渗透性或口服吸收一定改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Thr侧链磷酸化增加负电荷，并通过分子内氢键和电子相互作用形成非共价构象锁。",
      preferredPositions: "适合测试需要磷酸依赖识别、局部构象锁定或可诱导金属结合的Thr位置。",
      positionsToAvoid: "疏水核心、以被动渗透为目标或靶点不能容忍负电荷的位置应谨慎。",
      evidenceSummary: "Thr→pThr直接实验显示显著的无序到有序转变和主链/侧链构象限制。",
      boundary: "只能确认构象限制增强；其他药代性质仍需同骨架实验。",
      sources: [
        { title: "Pandey et al., ACS Chemical Biology 2023 · Thr/pThr构象比较", url: "https://pubmed.ncbi.nlm.nih.gov/37595155/" },
        { title: "Phosphorylation-dependent protein design · pThr诱导金属结合", url: "https://pubmed.ncbi.nlm.nih.gov/30942803/" },
      ],
    },
    sources: [
      { title: "Pandey et al., ACS Chemical Biology 2023", url: "https://pubmed.ncbi.nlm.nih.gov/37595155/", supports: "Thr磷酸化前后的肽构象实验" },
      { title: "Phosphorylation-dependent protein design", url: "https://pubmed.ncbi.nlm.nih.gov/30942803/", supports: "pThr与未磷酸化肽的Tb³⁺结合对照" },
    ],
  },
  CIR: {
    peptideExperiment: {
      conclusion: "肽中Arg转化为瓜氨酸后，对HLA-II结合的影响通常较小，但在少数序列和位置会使亲和力增强或降低超过3倍。",
      measurement: "研究成组比较野生型与瓜氨酸化肽，筛得117条对RA相关HLA等位基因亲和力≤1000 nM的瓜氨酸肽；总体变化不大，少数配对超过3倍。",
      attributionBoundary: "方向由序列位置和HLA亚型共同决定，不能把瓜氨酸化统一写成结合增强或降低。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Arg去亚胺化形成瓜氨酸会去掉正电荷，同时保留较强极性和氢键能力。",
      preferredPositions: "适合在希望去除Arg正电荷、改变免疫识别或微调氢键网络的位置做成对扫描。",
      positionsToAvoid: "承担关键盐桥或需要稳定正电荷的位置不应无对照替换。",
      evidenceSummary: "大规模野生型/瓜氨酸化肽对照显示多数HLA-II结合变化较小，少数位置会产生超过3倍的增强或降低。",
      boundary: "这是位置和HLA亚型依赖的结合结果，不是普遍的活性或药代改善。",
      sources: [
        { title: "Citrullination only infrequently impacts peptide binding to HLA class II MHC", url: "https://pubmed.ncbi.nlm.nih.gov/28481943/" },
        { title: "Molecular basis for HLA binding of arginine/citrulline peptide variants", url: "https://pubmed.ncbi.nlm.nih.gov/28801345/" },
      ],
    },
    sources: [
      { title: "Citrullination only infrequently impacts peptide binding to HLA class II MHC", url: "https://pubmed.ncbi.nlm.nih.gov/28481943/", supports: "野生型与瓜氨酸化肽的大规模HLA-II亲和力比较" },
      { title: "Molecular basis for increased susceptibility to seropositive rheumatoid arthritis", url: "https://pubmed.ncbi.nlm.nih.gov/28801345/", supports: "同序列Arg/Cit不同位置的HLA结合实验" },
    ],
  },
  MLZ: {
    peptideExperiment: {
      conclusion: "组蛋白H3肽中的Lys单甲基化后，可获得G9a/GLP ankyrin重复结构域的特异识别。",
      measurement: "同一H3肽序列分别使用未修饰、单甲基、二甲基和三甲基Lys进行pull-down与结构比较；G9a/GLP优先结合单甲基和二甲基状态。",
      attributionBoundary: "这是组蛋白阅读器的甲基化状态特异性结合，不代表一般受体、稳定性或渗透性都会改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端氨基单甲基化保留正电荷并改变大小、供氢能力和芳香笼识别。",
      preferredPositions: "适用于已知存在甲基赖氨酸阅读器或芳香笼的结合位点。",
      positionsToAvoid: "依赖未修饰Lys形成特定盐桥或酶催化的位置应先验证。",
      evidenceSummary: "同序列H3肽实验显示G9a/GLP可选择性识别单甲基和二甲基Lys。",
      boundary: "结合方向由阅读器和甲基化位置决定。",
      sources: [
        { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/" },
      ],
    },
    sources: [
      { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/", supports: "未修饰/单甲基/二甲基/三甲基H3肽的配对结合实验" },
    ],
  },
  MLY: {
    peptideExperiment: {
      conclusion: "组蛋白H3肽中的Lys二甲基化后，可被G9a/GLP ankyrin重复结构域特异结合。",
      measurement: "未修饰、单甲基、二甲基和三甲基H3肽的pull-down及结构研究显示，二甲基Lys可以进入部分疏水芳香笼并形成结合。",
      attributionBoundary: "这是特定组蛋白肽—阅读器体系；不应外推为所有靶点结合增强。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys末端氨基二甲基化仍带正电，但进一步减少供氢并改变芳香笼的形状匹配。",
      preferredPositions: "优先用于已知识别Kme2的表观遗传阅读器结合位点。",
      positionsToAvoid: "需要游离Lys-NH₂提供多个氢键的位置不宜直接替换。",
      evidenceSummary: "同序列H3肽实验证明G9a/GLP能够识别二甲基Lys。",
      boundary: "只证明特定阅读器结合，不提供稳定性、渗透性或口服数据。",
      sources: [
        { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/" },
      ],
    },
    sources: [
      { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/", supports: "H3K9me2与其他甲基化状态的直接结合比较" },
    ],
  },
  M3L: {
    peptideExperiment: {
      conclusion: "Lys三甲基化并不保证结合增强：在G9a/GLP ankyrin芳香笼中，三甲基Lys因空间和电荷匹配不合而被排斥。",
      measurement: "相同H3肽的未修饰、单甲基、二甲基和三甲基状态进行了pull-down与结构比较；G9a/GLP结合单/二甲基状态，但三甲基状态被结合笼排除。",
      attributionBoundary: "该负向结论限于G9a/GLP；HP1等其他阅读器可能偏好三甲基Lys，因此必须按靶点分别判断。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys完全三甲基化形成固定正电荷并失去N-H供氢，体积也进一步增大。",
      preferredPositions: "仅应在已知存在适配三甲基铵芳香笼的靶点位置使用。",
      positionsToAvoid: "G9a/GLP ankyrin对应结合位点及需要Lys-NH供氢的位置应避免。",
      evidenceSummary: "G9a/GLP同序列H3肽实验证明三甲基Lys相对单/二甲基状态结合降低并被结合笼排除。",
      boundary: "不同甲基赖氨酸阅读器的选择性相反，不能把这一结果推广到所有靶点。",
      sources: [
        { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/" },
        { title: "Recognition of trimethyllysine by a chromodomain", url: "https://pubmed.ncbi.nlm.nih.gov/17581885/" },
      ],
    },
    sources: [
      { title: "G9a and GLP ankyrin repeats are mono- and dimethyllysine binding modules", url: "https://pubmed.ncbi.nlm.nih.gov/18264113/", supports: "H3K9甲基化状态的直接比较及三甲基状态排斥" },
      { title: "Recognition of trimethyllysine by a chromodomain is not driven by the hydrophobic effect", url: "https://pubmed.ncbi.nlm.nih.gov/17581885/", supports: "三甲基Lys肽在HP1 chromodomain中的特异结合机制和靶点依赖性" },
    ],
  },
  O6H: {
    peptideExperiment: {
      conclusion: "在生长抑素同骨架中，以2,4,6-三甲基苯丙氨酸（Msa）替换芳香残基后，单点替换通常使溶液构象更受限；第7位Msa还把血清半衰期由天然生长抑素的2.75小时延长到5.2小时。",
      measurement: "论文合成并比较了10个Msa生长抑素类似物，测量受体亲和力、NMR溶液构象和血清稳定性；[L-Msa⁷]-SRIF的血清半衰期为5.2小时，并以0.019 nM的Ki选择性结合SSTR2。",
      attributionBoundary: "作用强烈依赖替换位置和组合：Msa⁶或Msa¹¹单点替换的半衰期反而低于天然肽；多点Msa虽可继续延长半衰期，却可能损失受体亲和力。不能概括成任意位置都能提高稳定性和活性。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Msa是在苯丙氨酸芳环的2、4、6位各增加一个甲基，增大疏水体积并限制芳香侧链转动。",
      preferredPositions: "已有正向数据的位置是生长抑素第7位；其他肽应优先对暴露的芳香位点做逐位配对扫描。",
      positionsToAvoid: "承担关键受体接触或空间狭窄的位置不能直接替换，多点同时替换尤其需要监测亲和力损失。",
      evidenceSummary: "同一生长抑素骨架的直接实验表明：Msa单点替换可增强构象限制；第7位替换使血清半衰期从2.75小时增至5.2小时并保持很高的SSTR2亲和力。",
      boundary: "稳定性改善只在特定位置成立；没有溶解度、膜渗透性或口服吸收数据。",
      sources: [
        { title: "Martín-Gago et al., Molecules 2013 · Msa生长抑素构效与血清稳定性", url: "https://pubmed.ncbi.nlm.nih.gov/24287991/" },
      ],
    },
    sources: [
      { title: "Martín-Gago et al., Molecules 2013", url: "https://pubmed.ncbi.nlm.nih.gov/24287991/", supports: "Msa在不同生长抑素位点的受体亲和力、NMR构象和血清半衰期直接比较" },
    ],
  },
  "4BF": {
    peptideExperiment: {
      conclusion: "在MT1-MMP双环肽第9位用4-溴苯丙氨酸替换Tyr后，靶点亲和力基本保持不变：Kd为2.45±1.08 nM，未修饰肽为2.47±0.25 nM。",
      measurement: "专利在同一17-69-07双环肽骨架中做单点替换并测定MT1-MMP结合；另一个含4BrPhe及四种其他修饰的组合体在鼠和人血浆中的半衰期超过20小时，而未稳定化肽约6小时。",
      attributionBoundary: "单点实验只直接证明4BrPhe在第9位能保持亲和力。超过20小时的血浆稳定性来自五种修饰的组合，不能单独归因于4BrPhe。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "4BrPhe在苯丙氨酸芳环对位增加溴原子，增加体积和疏水性，并去掉Tyr的酚羟基。",
      preferredPositions: "已有直接数据的位置是MT1-MMP双环肽的Tyr9蛋白酶识别位点；可优先用于希望去除该识别点且保留结合的相似芳香位点。",
      positionsToAvoid: "依赖Tyr酚羟基形成关键氢键的位置不应直接替换。",
      evidenceSummary: "单点Tyr9→4BrPhe9使Kd从2.47 nM变为2.45 nM，说明亲和力保留；组合修饰体的血浆稳定性提高，但不能拆分出4BrPhe的单独贡献。",
      boundary: "稳定性只达到组合证据等级；没有4BrPhe单独改善血浆半衰期、溶解度、渗透性或口服吸收的实验。",
      sources: [
        { title: "EP3215518B1 · MT1-MMP双环肽单点与组合替换", url: "https://data.epo.org/publication-server/rest/v1.0/publication-dates/20210224/patents/EP3215518NWB1/document.pdf" },
      ],
    },
    sources: [
      { title: "EP3215518B1, Bicyclic peptide ligands specific for MT1-MMP", url: "https://data.epo.org/publication-server/rest/v1.0/publication-dates/20210224/patents/EP3215518NWB1/document.pdf", supports: "4BrPhe9单点替换的Kd以及多修饰组合体的血浆稳定性" },
    ],
  },
  IAM: {
    peptideExperiment: {
      conclusion: "在生长抑素类似物CH275中，IAmp⁹的异丙基是SSTR1选择性的关键部分；去掉异丙基改为Amp⁹后，对SSTR1和SSTR2的亲和力变得相近，亚型选择性消失。",
      measurement: "论文在同一生长抑素骨架中比较IAmp⁹与Amp⁹，并结合SSTR1/SSTR2嵌合体和受体点突变测定结合与功能；结果支持IAmp正电胺与SSTR1 Asp137形成离子对、异丙基与Leu107形成疏水作用。",
      attributionBoundary: "这是IAmp与少一个异丙基的Amp直接比较，不是Phe→IAmp的单变量比较；只支持SSTR1选择性机制，不能外推为稳定性、渗透性或口服吸收改善。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "IAmp在苯丙氨酸芳环对位引入带异丙基的氨甲基，可同时提供正电相互作用和额外疏水接触。",
      preferredPositions: "直接证据位置是生长抑素类似物CH275的第9位，适合已有酸性结合位点和相邻疏水口袋的受体界面。",
      positionsToAvoid: "没有酸性配对残基、缺少容纳异丙基空间或必须保持中性芳香侧链的位置应谨慎。",
      evidenceSummary: "IAmp⁹→Amp⁹的同骨架对照使SSTR1选择性消失，受体突变结果进一步定位了正电胺与异丙基各自的相互作用。",
      boundary: "能确认的是特定受体上的选择性结合机制；没有通用药代性质数据，也没有Phe→IAmp的严格单变量对照。",
      sources: [
        { title: "Chen et al., BBRC 1999 · IAmp的SSTR1选择性机制", url: "https://pubmed.ncbi.nlm.nih.gov/10329447/" },
        { title: "Rivier et al., J. Med. Chem. 2001 · 含IAmp⁹的SSTR1选择性激动剂", url: "https://pubmed.ncbi.nlm.nih.gov/11405660/" },
      ],
    },
    sources: [
      { title: "Chen et al., Biochem. Biophys. Res. Commun. 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10329447/", supports: "IAmp⁹与Amp⁹同骨架比较及SSTR1受体突变验证" },
      { title: "Rivier et al., J. Med. Chem. 2001", url: "https://pubmed.ncbi.nlm.nih.gov/11405660/", supports: "含IAmp⁹生长抑素类似物的SSTR1亲和力和选择性" },
    ],
  },
  A1AT6: {
    peptideExperiment: {
      conclusion: "(S)-吲哚啉-2-羧酸（Ind）表现出与Pro相反的酰胺键偏好：在极性溶剂中明显偏向顺式酰胺键，可用来构建不同的受限二级结构。",
      measurement: "研究对Ac-(2S)-Ind-OMe及其二聚模型进行了NMR和计算分析，并与Pro的一般反式偏好比较；另一项血管加压素类似物研究观察到Ind形成顺式肽键并显著降低构象自由度。",
      attributionBoundary: "这些实验直接支持顺/反异构和构象限制，不证明膜渗透、蛋白酶稳定性、溶解度或口服吸收得到改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Ind把Pro样五元含氮环与苯环稠合，进一步限制主链邻近酰胺键的构象。",
      preferredPositions: "适合需要稳定顺式酰胺键、形成转角或降低局部构象自由度的位置。",
      positionsToAvoid: "必须保持天然反式Pro几何、或合成过程中易发生二酮哌嗪副反应的位置应谨慎。",
      evidenceSummary: "模型化合物和肽实验均显示Ind具有明显顺式酰胺偏好，并能降低血管加压素类似物的构象自由度。",
      boundary: "构象方向已被实验确认；其他药代和制剂性质仍需在目标肽中单独测定。",
      sources: [
        { title: "Pollastrini et al., J. Org. Chem. 2021 · Ind酰胺异构与构象", url: "https://pubmed.ncbi.nlm.nih.gov/34080867/" },
        { title: "Sikorska et al., Chem. Biol. Drug Des. 2012 · 血管加压素中的Ind构象", url: "https://pubmed.ncbi.nlm.nih.gov/22226070/" },
        { title: "Cordella et al., Chirality 2024 · Ind合成反应性与副反应边界", url: "https://pubmed.ncbi.nlm.nih.gov/39681463/" },
      ],
    },
    sources: [
      { title: "Pollastrini et al., J. Org. Chem. 2021", url: "https://pubmed.ncbi.nlm.nih.gov/34080867/", supports: "Ind模型化合物的溶剂依赖顺式酰胺偏好" },
      { title: "Sikorska et al., Chem. Biol. Drug Des. 2012", url: "https://pubmed.ncbi.nlm.nih.gov/22226070/", supports: "Ind在血管加压素类似物中的顺式肽键和构象限制" },
      { title: "Cordella et al., Chirality 2024", url: "https://pubmed.ncbi.nlm.nih.gov/39681463/", supports: "Ind在肽合成中的低反应性和二酮哌嗪风险" },
    ],
  },
  A1IID: {
    peptideExperiment: {
      conclusion: "4-巯基苯丙氨酸可以被SirD进行S-异戊烯化，但相对天然底物Tyr，底物结合变弱、反应速率显著降低。",
      measurement: "直接酶动力学比较显示：Tyr的Km为0.30 mM、kcat为1.3 s⁻¹；4-巯基苯丙氨酸的Km为1.1 mM、kcat为0.027 s⁻¹，催化效率只剩Tyr的约0.58%。产物结构经HRMS和NMR确认。",
      attributionBoundary: "该实验比较的是Tyr侧链O→S，而网站按完整碳骨架把它归到Phe衍生物。结果只说明SirD底物识别和反应性降低，不是肽的稳定性、渗透性或口服吸收结果。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "4-巯基苯丙氨酸在苯丙氨酸芳环对位增加巯基；从功能类似物角度也可理解为把Tyr的酚羟基O换成S。",
      preferredPositions: "适合需要硫选择性偶联、异戊烯化或金属配位的暴露位点。",
      positionsToAvoid: "若目标是保留Tyr作为SirD高效底物，O→S替换会明显降低结合和反应速率。",
      evidenceSummary: "SirD直接动力学实验显示Km约增大3.7倍、kcat约下降48倍，催化效率降到Tyr的约0.58%，同时确认可形成S-异戊烯化产物。",
      boundary: "这是明确的反应性降低和可修饰性证据，不证明药代性质改善；作为肽内残基使用时还需目标骨架实验。",
      sources: [
        { title: "Rudolf & Poulter, ACS Chemical Biology 2013 · 4-巯基苯丙氨酸酶动力学", url: "https://pubmed.ncbi.nlm.nih.gov/24083562/" },
      ],
    },
    sources: [
      { title: "Rudolf & Poulter, ACS Chemical Biology 2013", url: "https://pubmed.ncbi.nlm.nih.gov/24083562/", supports: "4-巯基苯丙氨酸与Tyr的SirD动力学直接比较及S-异戊烯化产物鉴定" },
    ],
  },
  MSE: {
    peptideExperiment: {
      conclusion: "在T4溶菌酶的配对实验中，Met替换为硒代甲硫氨酸可提高热稳定性；对富含Met的变体，完全硒代后的熔解温度最高约增加7°C。",
      measurement: "研究逐步增加蛋白中的Met位点并比较甲硫氨酸型与硒代甲硫氨酸型蛋白；硒代替换平均可贡献稳定化作用，但幅度随位置和Met数量而变。",
      attributionBoundary: "这是完整蛋白中的Met→SeMet直接比较，不是短肽的膜渗透、溶解度或口服吸收实验；不能把7°C套用到任意肽。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "SeMet把Met侧链的硫换成硒，骨架和疏水体积相近，但原子极化性及非共价作用发生变化。",
      preferredPositions: "可优先在希望保持Met形状、同时测试热稳定性或晶体学硒标记的Met位置做配对替换。",
      positionsToAvoid: "依赖Met硫氧化、硫特异相互作用或空间非常紧的位置不能假定等效。",
      evidenceSummary: "T4溶菌酶直接比较显示SeMet替换可提高热稳定性，富Met变体的差值最高约7°C。",
      boundary: "效果依赖蛋白和位点；这里只确认热稳定性方向，不确认肽的药代性质。",
      sources: [
        { title: "Gassner et al., J. Mol. Biol. 1999 · Met/SeMet稳定性直接比较", url: "https://pubmed.ncbi.nlm.nih.gov/10556025/" },
      ],
    },
    sources: [
      { title: "Gassner et al., J. Mol. Biol. 1999", url: "https://pubmed.ncbi.nlm.nih.gov/10556025/", supports: "T4溶菌酶中Met与SeMet蛋白的热稳定性配对实验" },
    ],
  },
  TYS: {
    peptideExperiment: {
      conclusion: "CCR7受体N端肽中的Tyr硫酸化后，对趋化因子CCL21的结合增强；在第17位，硫酸化肽的Kd约为480±70 µM。",
      measurement: "论文在相同CCR7 N端肽骨架中比较Tyr、磷酸Tyr和硫酸Tyr，并用NMR滴定测量结合；硫酸化产生最明显的亲和力增益。",
      attributionBoundary: "这是CCR7—CCL21体系的位点特异结合结果，不表示硫酸Tyr能普遍提高稳定性、渗透性或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr酚羟基硫酸化会增加体积和强负电荷，并可形成硫酸基特异识别。",
      preferredPositions: "优先用于已知存在碱性硫酸酪氨酸结合口袋的暴露Tyr位点，例如趋化因子受体N端。",
      positionsToAvoid: "疏水核心、以被动渗透为目标或靶点不能容忍负电荷的位置应避免。",
      evidenceSummary: "同序列CCR7 N端肽对照显示Tyr硫酸化增强CCL21结合，第17位硫酸肽Kd约480±70 µM。",
      boundary: "结合增益由具体位点和靶点决定，没有通用药代改善证据。",
      sources: [
        { title: "Phillips et al., Biochemistry 2017 · CCR7硫酸Tyr配对结合", url: "https://pubmed.ncbi.nlm.nih.gov/28841151/" },
      ],
    },
    sources: [
      { title: "Phillips et al., Biochemistry 2017", url: "https://pubmed.ncbi.nlm.nih.gov/28841151/", supports: "CCR7 N端Tyr、pTyr和sTyr肽对CCL21的结合比较" },
    ],
  },
  PTR: {
    peptideExperiment: {
      conclusion: "Tyr磷酸化的作用取决于体系：它可在CCR7 N端肽中增强CCL21结合，也能显著延缓脑啡肽被氨肽酶降解。",
      measurement: "CCR7研究比较了同序列Tyr/pTyr/sTyr肽；脑啡肽研究显示未磷酸化Met-和Leu-脑啡肽不到1分钟即被降解，而相应磷酸化类似物60分钟后仍可检出。",
      attributionBoundary: "两项结果分别支持靶点结合和抗酶解，均依赖磷酸化位置；额外负电荷通常不利于被动膜渗透，不能写成口服改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr磷酸化会引入体积较大的负电基团，改变识别、溶剂化和蛋白酶接近方式。",
      preferredPositions: "适合磷酸依赖识别位点，或已经证明磷酸化能阻断外肽酶处理的N端Tyr位置。",
      positionsToAvoid: "以被动渗透为主要目标、疏水口袋或不容纳负电荷的位置不宜盲目使用。",
      evidenceSummary: "CCR7同序列肽显示pTyr增强CCL21结合；脑啡肽直接对照显示磷酸化把可检出时间从不足1分钟延长到60分钟。",
      boundary: "证据支持特定骨架的结合与抗酶解，不证明普遍改善渗透或口服吸收。",
      sources: [
        { title: "Phillips et al., Biochemistry 2017 · CCR7 Tyr/pTyr/sTyr对照", url: "https://pubmed.ncbi.nlm.nih.gov/28841151/" },
        { title: "Phosphorylation of enkephalins enhances proteolytic stability", url: "https://pubmed.ncbi.nlm.nih.gov/8622556/" },
      ],
    },
    sources: [
      { title: "Phillips et al., Biochemistry 2017", url: "https://pubmed.ncbi.nlm.nih.gov/28841151/", supports: "CCR7 N端Tyr与pTyr肽的结合比较" },
      { title: "Phosphorylation of enkephalins enhances proteolytic stability", url: "https://pubmed.ncbi.nlm.nih.gov/8622556/", supports: "未磷酸化与磷酸化脑啡肽的氨肽酶降解比较" },
    ],
  },
  ALY: {
    peptideExperiment: {
      conclusion: "组蛋白H4肽中的Lys16乙酰化后，产生BPTF溴结构域可识别的结合位点；未乙酰化H4对照没有相同的可检测结合。",
      measurement: "研究用肽阵列、pull-down、荧光偏振和ITC系统比较多种乙酰化H4肽与未修饰对照，并在单核小体层面复核H4K16ac作用。",
      attributionBoundary: "这是特定表观遗传阅读器的结合证据；Lys乙酰化中和正电荷，但不能由此直接断言任意肽的溶解度、渗透性或稳定性改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys侧链乙酰化会中和末端正电荷，并把游离胺变成酰胺，从而改变氢键和阅读器识别。",
      preferredPositions: "适用于已知存在乙酰赖氨酸识别口袋的暴露Lys，或希望去除局部正电荷的位置。",
      positionsToAvoid: "承担关键盐桥、需要游离胺反应性或没有乙酰赖氨酸口袋的位置应谨慎。",
      evidenceSummary: "相同H4序列的乙酰化/未修饰对照证明H4K16ac可产生BPTF溴结构域结合。",
      boundary: "结论限于靶点识别，不能当作通用药代性质证据。",
      sources: [
        { title: "Ruthenburg et al., Cell 2011 · H4K16ac/BPTF直接比较", url: "https://pubmed.ncbi.nlm.nih.gov/21596426/" },
      ],
    },
    sources: [
      { title: "Ruthenburg et al., Cell 2011", url: "https://pubmed.ncbi.nlm.nih.gov/21596426/", supports: "乙酰化与未修饰组蛋白肽及核小体的BPTF结合比较" },
    ],
  },
  PPN: {
    peptideExperiment: {
      conclusion: "在转酮醇酶活性位点385把Tyr替换为对硝基苯丙氨酸后，底物Km得到改善，论文报告相对Tyr变体提高约290%。",
      measurement: "研究在同一酶、同一385位点比较Tyr、Phe及多种对位非天然苯丙氨酸，并测定动力学和热稳定性。",
      attributionBoundary: "这是完整酶活性位点的单点替换，不是短肽药代实验；热稳定性的最大增益属于系列中的其他残基，不能归给PPN。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Phe芳环对位增加硝基会显著改变电子性质、极性和氢键受体能力。",
      preferredPositions: "可优先在已知由芳环电子效应调控催化或结合的暴露芳香位点做配对扫描。",
      positionsToAvoid: "空间紧、不能容纳硝基或以低极性为目标的位置不应直接替换。",
      evidenceSummary: "同一转酮醇酶385位点的直接比较显示pNTF可改善底物Km，幅度约290%。",
      boundary: "只证明特定酶位点的催化参数变化，没有稳定性、渗透性或口服性结论。",
      sources: [
        { title: "Fine-tuning an evolved enzyme active site through ncAAs", url: "https://pubmed.ncbi.nlm.nih.gov/32897608/" },
      ],
    },
    sources: [
      { title: "Fine-tuning the activity and stability of an evolved enzyme active-site through noncanonical amino-acids", url: "https://pubmed.ncbi.nlm.nih.gov/32897608/", supports: "转酮醇酶385位点Tyr与pNTF等残基的动力学直接比较" },
    ],
  },
  DHA: {
    peptideExperiment: {
      conclusion: "在脑啡肽中引入脱氢丙氨酸后，邻近肽键对羧肽酶Y明显更耐受；但在LHRH第6位引入Dha会使活性丢失。",
      measurement: "脑啡肽研究比较不同位置Dha类似物与饱和母体，观察到Dha羧基一侧强抗水解、氨基一侧完全抗水解；另一项LHRH配对显示第6位Dha类似物无活性。",
      attributionBoundary: "Dha具有构象限制和亲电反应性，但正负效果都强烈依赖位置；不能统一写成稳定性和活性均提高。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Ser脱水或Ala脱氢形成Dha后，Cα=Cβ双键会限制构象，并使该位点成为Michael受体。",
      preferredPositions: "可在明确蛋白酶切点附近或需要后期选择性偶联的位置做定点测试。",
      positionsToAvoid: "承担受体激活关键构象或容易发生非期望亲核加成的位置应避免。",
      evidenceSummary: "脑啡肽对照支持邻近肽键抗酶解增强；LHRH对照同时证明错误位置会使活性归零。",
      boundary: "稳定性与活性必须分开按具体骨架判断，没有通用渗透或口服结论。",
      sources: [
        { title: "Dehydro-enkephalins and carboxypeptidase Y", url: "https://pubmed.ncbi.nlm.nih.gov/7167404/" },
        { title: "Dha-containing LHRH analogues", url: "https://pubmed.ncbi.nlm.nih.gov/3284836/" },
      ],
    },
    sources: [
      { title: "Dehydro-enkephalins and carboxypeptidase Y", url: "https://pubmed.ncbi.nlm.nih.gov/7167404/", supports: "Dha脑啡肽与饱和类似物的蛋白酶水解比较" },
      { title: "Dha-containing LHRH analogues", url: "https://pubmed.ncbi.nlm.nih.gov/3284836/", supports: "LHRH第6位Dha替换的活性负向对照" },
    ],
  },
  DBU: {
    peptideExperiment: {
      conclusion: "Vioprolide B中的脱氢丁氨酸位点具有功能意义：把该位点改成Gly后，HeLa和Jurkat细胞毒活性完全消失。",
      measurement: "论文合成天然Vioprolide B及缺少Dhb亲电双键的Gly同骨架类似物并进行细胞活性比较；Gly类似物不再显示原有细胞毒作用。",
      attributionBoundary: "这是Dhb→Gly的同骨架功能对照，不是Thr→Dhb的严格单变量比较；也没有证明溶解度、渗透性或抗酶解改善。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Thr脱水形成Dhb后产生受限的α,β-不饱和键，可作为Michael受体并固定局部几何。",
      preferredPositions: "适合需要亲电反应性、共价作用或构象限制的已验证位点。",
      positionsToAvoid: "不允许共价副反应、需要Thr羟基氢键或合成条件易水合的位置应谨慎。",
      evidenceSummary: "Vioprolide B同骨架研究显示失去Dhb并换成Gly后细胞毒活性完全消失，说明该位点对功能关键。",
      boundary: "只证明特定天然产物骨架中的功能贡献，不能推广到任意肽。",
      sources: [
        { title: "Vioprolide B synthesis and Dhb functional comparison", url: "https://doi.org/10.1039/D4CC02946A" },
      ],
    },
    sources: [
      { title: "Vioprolide B synthesis and Dhb functional comparison", url: "https://doi.org/10.1039/D4CC02946A", supports: "天然Dhb骨架与Gly类似物的细胞活性比较" },
    ],
  },
  ALO: {
    peptideExperiment: {
      conclusion: "抗冻糖肽中把天然Thr换成allo-L-Thr后，PPII构象倾向下降，并在100–1000 µg/mL范围内失去抑制冰重结晶的活性。",
      measurement: "论文合成天然L-Thr对照和allo-L-Thr糖肽，用CD比较构象，并用冰重结晶实验比较活性；天然对照约20 µg/mL已有效，allo-L-Thr类似物最高1000 µg/mL仍无显著作用。",
      attributionBoundary: "这是糖基化抗冻肽中特定位点和立体化学的负向结果，不是一般肽的稳定性或药代实验。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "allo-L-Thr只反转Thr的β位构型，却会改变侧链和糖基朝向以及局部构象。",
      preferredPositions: "适合用于验证β位立体化学是否控制配体展示或构象的研究性扫描。",
      positionsToAvoid: "天然Thr侧链朝向已经优化、尤其是糖基展示和界面识别位点，不宜直接替换。",
      evidenceSummary: "同序列抗冻糖肽对照显示allo-L-Thr降低PPII倾向，并使可测抗冻活性消失。",
      boundary: "这是明确负向证据；不能写成因构象限制而改善稳定性或活性。",
      sources: [
        { title: "Nagel et al., Antifreeze glycopeptide diastereomers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3510999/" },
      ],
    },
    sources: [
      { title: "Nagel et al., Antifreeze glycopeptide diastereomers", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3510999/", supports: "天然Thr与allo-L-Thr抗冻糖肽的CD和冰重结晶直接比较" },
    ],
  },
  HRG: {
    peptideExperiment: {
      conclusion: "Apelin肽第9位Arg换成高精氨酸后，血浆和NEP稳定性提高，同时受体结合与激活基本保留或改善。",
      measurement: "pyr-apelin-13的血浆半衰期由0.81±0.20小时增至1.31±0.42小时，NEP半衰期由10.31增至19.01小时；apelin-17的血浆半衰期由0.90±0.17增至3.06±0.04小时，NEP半衰期由10.95增至40.59小时。",
      attributionBoundary: "结果来自Apelin第9位单点替换，不能把倍数用于其他肽或其他Arg位点；没有口服吸收数据。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "hArg比Arg侧链多一个亚甲基，保留胍基正电荷，但改变蛋白酶识别距离和结合几何。",
      preferredPositions: "优先用于已知为NEP切点、同时需要保留正电胍基相互作用的Arg位置。",
      positionsToAvoid: "空间紧或依赖Arg精确盐桥距离的位置需先做配对验证。",
      evidenceSummary: "Apelin第9位Arg→hArg直接对照使血浆半衰期提高约1.6–3.4倍、NEP半衰期提高约1.8–3.7倍，并保留受体作用。",
      boundary: "稳定性改善已经直接测定，但限于Apelin骨架和该切点。",
      sources: [
        { title: "Murza et al., hArg-substituted apelin analogues", url: "https://pubmed.ncbi.nlm.nih.gov/34458742/" },
      ],
    },
    sources: [
      { title: "Murza et al., hArg-substituted apelin analogues", url: "https://pubmed.ncbi.nlm.nih.gov/34458742/", supports: "Apelin第9位Arg/hArg的血浆、NEP稳定性和受体功能直接比较" },
    ],
  },
  U2X: {
    peptideExperiment: {
      conclusion: "在miniCD4的第23位引入O-(环己基甲基)-L-酪氨酸后，可把环己基填入HIV-1 gp120的Phe43空腔，获得亚纳摩尔结合及更强病毒中和。",
      measurement: "同一M48 miniCD4骨架比较Phe及11种非天然芳香残基；含O-环己基甲基Tyr的M48U1对两株gp120的IC50约0.1和0.2 nM，并通过复合物结构解释空腔填充。",
      attributionBoundary: "活性来自miniCD4第23位与gp120特定疏水空腔的形状互补，不代表该残基能普遍提高稳定性、渗透性或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr酚氧连接环己基甲基后，侧链明显增大并增加疏水空腔填充能力。",
      preferredPositions: "适合靶点结构显示存在较深、可容纳非平面环己基的芳香侧链口袋。",
      positionsToAvoid: "溶剂暴露、空间狭窄或依赖Tyr游离酚羟基的位置应避免。",
      evidenceSummary: "M48第23位直接筛选和结构研究显示该残基可产生约0.1–0.2 nM的gp120抑制，并增强抗病毒作用。",
      boundary: "只支持gp120 Phe43空腔这一明确位点，不能当作通用疏水增益规则。",
      sources: [
        { title: "Morellato-Castillo et al., J. Med. Chem. 2013", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3812931/" },
      ],
    },
    sources: [
      { title: "Morellato-Castillo et al., J. Med. Chem. 2013", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3812931/", supports: "miniCD4第23位非天然残基筛选、gp120结合、中和与复合物结构" },
    ],
  },
  HZP: {
    peptideExperiment: {
      conclusion: "在胶原模型肽的Gly-X-Y重复中，Y位Pro换成4(R)-羟脯氨酸可明显提高三股螺旋热稳定性；放在X位则可能相反。",
      measurement: "胶原模型肽和重组胶原研究用CD熔解实验比较羟化与未羟化序列；Y位Hyp相对Pro可使模型肽熔点最多提高约15°C，重组胶原羟化后熔点也从22°C提高到25°C。",
      attributionBoundary: "稳定作用是位置和立体化学特异的胶原三螺旋效应，不代表Hyp能稳定所有肽。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Pro环上4(R)-羟基通过立体电子效应预组织环构象和反式酰胺，从而有利于胶原三螺旋。",
      preferredPositions: "优先用于胶原样Gly-X-Y重复的Y位，或已知需要相同PPII预组织的位置。",
      positionsToAvoid: "胶原重复的X位、非胶原骨架或4(S)立体异构体不能按同一方向处理。",
      evidenceSummary: "位置明确的模型肽对照显示Y位Pro→4(R)-Hyp可使三螺旋熔点最多提高约15°C。",
      boundary: "这里只确认胶原样构象和热稳定性，不确认蛋白酶、渗透或口服性质。",
      sources: [
        { title: "Stabilization of collagen-model triple-helical peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4260935/" },
        { title: "Unhydroxylated collagen I and the role of hydroxyproline", url: "https://doi.org/10.1074/jbc.M101415200" },
      ],
    },
    sources: [
      { title: "Stabilization of collagen-model triple-helical peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4260935/", supports: "Pro/Hyp位置依赖的胶原模型肽熔解比较" },
      { title: "Unhydroxylated collagen I and the role of hydroxyproline", url: "https://doi.org/10.1074/jbc.M101415200", supports: "羟化与未羟化胶原的热稳定性实验" },
    ],
  },
  TIH: {
    peptideExperiment: {
      conclusion: "Bombesin类似物第12位His换成β-(2-噻吩基)-L-丙氨酸后，血浆半衰期提高约3倍，同时保持GRPR选择性和0.3 nM的激动活性。",
      measurement: "同一优化系列比较母体肽和第12位TIH类似物；后者半衰期为43.7分钟，并测得GRPR EC50为0.3 nM，对NMBR和BRS-3无活性。",
      attributionBoundary: "这是Bombesin第12位His→TIH的直接结果，不能推广为任意芳香位点都会延长半衰期。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "TIH以噻吩芳环替代His咪唑环，降低碱性并改变疏水性和代谢识别。",
      preferredPositions: "已有正向位置是Bombesin/GRPR激动肽第12位His，可从相似受体结合芳香位点开始。",
      positionsToAvoid: "依赖His质子化、金属配位或催化功能的位置不宜替换。",
      evidenceSummary: "直接配对显示第12位TIH类似物血浆半衰期43.7分钟、约为起始肽3倍，并保持0.3 nM GRPR活性。",
      boundary: "只支持该受体肽骨架的稳定性和选择性，没有口服或膜渗透数据。",
      sources: [
        { title: "Hoppenz et al., Identification and stabilization of a selective GRPR agonist", url: "https://doi.org/10.1002/psc.3224" },
      ],
    },
    sources: [
      { title: "Hoppenz et al., Journal of Peptide Science 2019", url: "https://doi.org/10.1002/psc.3224", supports: "Bombesin第12位His/TIH的血浆半衰期、GRPR活性和选择性比较" },
    ],
  },
  N9P: {
    peptideExperiment: {
      conclusion: "把细胞周期蛋白结合肽末端Phe换成4-吡啶基丙氨酸后，抑制作用会随肽骨架改变；在部分p107序列中亲和力提高，在另一序列中仅为143 µM的弱抑制。",
      measurement: "研究把4-吡啶基丙氨酸放入多个相同位置、不同序列的短肽，并用CDK4/cyclin D1激酶实验比较；结果同时出现提高和明显降低。",
      attributionBoundary: "这是明确的序列依赖结果，不能把吡啶氮的引入统一写成亲和力增强。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Phe芳环一个CH换成吡啶N后，形状相近，但增加氢键受体并改变电子和质子化性质。",
      preferredPositions: "适合靶点口袋中有可配对氢键供体、且已有结构信息的芳香位置做成对扫描。",
      positionsToAvoid: "纯疏水口袋或对芳环电子性质高度敏感的位置不能预设有利。",
      evidenceSummary: "多骨架直接比较显示4-吡啶基丙氨酸可增强或降低cyclin结合；一个序列的IC50仅143 µM。",
      boundary: "必须按具体序列记录方向，不提供稳定性、渗透性或口服结论。",
      sources: [
        { title: "Structural and functional analysis of cyclin D1", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3425359/" },
      ],
    },
    sources: [
      { title: "Structural and functional analysis of cyclin D1", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3425359/", supports: "4-吡啶基丙氨酸短肽在不同骨架中的激酶抑制直接比较" },
    ],
  },
  PBF: {
    peptideExperiment: {
      conclusion: "对苯甲酰苯丙氨酸可作为肽内光交联残基；在K-Ras4b底物肽中定点换入Bpa后，对Rce1p的光标记效率高于早期把光基团放在异戊二烯侧链的探针。",
      measurement: "论文合成多个Bpa位置异构的K-Ras4b肽底物，先确认酶切兼容性，再以365 nm照射并检测不可逆Rce1p交联产物。",
      attributionBoundary: "这是光照触发的交联/标记性质，不是无光条件下的普通结合增强，也不代表稳定性、渗透性或口服吸收改善。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "Bpa在Phe对位增加二苯甲酮光基团，365 nm激发后可与邻近靶蛋白形成共价键。",
      preferredPositions: "适合已知靠近靶蛋白表面、同时仍容纳大体积光基团的配体位点。",
      positionsToAvoid: "空间狭窄、光照不可行或需要保持原始高亲和力的关键位点应先筛选。",
      evidenceSummary: "含Bpa的K-Ras4b底物肽可完成Rce1p定点光交联，并改善该体系的标记效率。",
      boundary: "属于工具型光反应证据，不应归为一般药物性质改善。",
      sources: [
        { title: "Photoaffinity labeling of Rce1p using Bpa peptide substrates", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3319382/" },
      ],
    },
    sources: [
      { title: "Photoaffinity labeling of Rce1p using Bpa peptide substrates", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3319382/", supports: "Bpa定点肽底物的酶切兼容性和365 nm共价光标记实验" },
    ],
  },
  MTY: {
    peptideExperiment: {
      conclusion: "IRS-1肽中的正常对位Tyr换成间位Tyr后，胰岛素受体激酶磷酸化显著降低，并破坏后续磷酸酶和PI3K-SH2识别。",
      measurement: "研究合成含对位、间位或邻位Tyr的IRS-1片段并直接比较IR激酶磷酸化、PTP-1B去磷酸化和PI3K SH2结合。",
      attributionBoundary: "这是氧化应激相关的负向功能证据，说明羟基位置改变会破坏信号识别；不是研发中应普遍追求的性质改善。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "m-Tyr把Tyr酚羟基从对位移到间位，元素组成不变，但氢键几何和可磷酸化位置改变。",
      preferredPositions: "主要适合作为验证Tyr识别几何或构建不可正常磷酸化对照的研究工具。",
      positionsToAvoid: "承担激酶磷酸化或SH2识别功能的Tyr位点通常不应替换。",
      evidenceSummary: "IRS-1同序列肽直接对照显示m-Tyr使激酶磷酸化显著降低，并损害下游识别。",
      boundary: "这是特定信号肽的功能降低证据，没有药代性质改善结论。",
      sources: [
        { title: "Oxidized phenylalanine derivatives in insulin-signaling proteins", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9138545/" },
      ],
    },
    sources: [
      { title: "Oxidized phenylalanine derivatives in insulin-signaling proteins", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9138545/", supports: "IRS-1含p-Tyr、m-Tyr和o-Tyr肽的磷酸化、去磷酸化及SH2结合比较" },
    ],
  },
  SMC: {
    peptideExperiment: {
      conclusion: "在同一β-actin来源抑制肽中，用S-甲基半胱氨酸替换Met后，SETD3抑制能力降低，但仍保持亚微摩尔水平。",
      measurement: "同序列βA肽直接比较：Met73肽IC50为0.21±0.05 µM，S-甲基半胱氨酸肽为0.60±0.16 µM；另有锌指肽实验显示Cys甲基化显著削弱金属结合。",
      attributionBoundary: "前一结果比较的是Met→SMC，后一结果是Cys→SMC；两者都说明效果取决于该位置原本承担疏水还是金属配位功能。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Cys巯基S-甲基化后变成中性硫醚，失去巯基供氢、亲核性和强金属配位能力。",
      preferredPositions: "适合希望封闭Cys反应性而仍保留含硫疏水体积的位置，或作为Met侧链长度扫描。",
      positionsToAvoid: "二硫键、共价反应或金属配位所必需的Cys位置应避免。",
      evidenceSummary: "SETD3肽中SMC的IC50约为Met对照的2.9倍；锌指肽中S-甲基化则明显降低金属亲和力。",
      boundary: "这是靶点抑制和金属结合方向，不是通用稳定性或渗透性改善。",
      sources: [
        { title: "β-Actin peptide analogues as SETD3 inhibitors", url: "https://doi.org/10.1002/cmdc.202100296" },
        { title: "Selectivity of methylation of metal-bound cysteinates", url: "https://doi.org/10.1021/ja982546f" },
      ],
    },
    sources: [
      { title: "β-Actin peptide analogues as SETD3 inhibitors", url: "https://doi.org/10.1002/cmdc.202100296", supports: "Met与S-甲基半胱氨酸同序列抑制肽IC50比较" },
      { title: "Selectivity of methylation of metal-bound cysteinates", url: "https://doi.org/10.1021/ja982546f", supports: "Cys与S-甲基半胱氨酸锌指肽的金属结合和结构比较" },
    ],
  },
  MHS: {
    peptideExperiment: {
      conclusion: "在含HxH金属结合基序的肽中，His发生N1-甲基化后，锌结合亲和力降低。",
      measurement: "METTL9研究用未甲基化和1-甲基His肽比较锌结合，同时在细胞和动物样本中确认该修饰；论文报告1MH会降低HxH肽的锌结合。",
      attributionBoundary: "这是含连续His金属结合基序中的结果，不代表所有His位点都会降低活性或稳定性。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "His咪唑环N1甲基化会封闭一个配位氮并改变咪唑环的质子化和氢键能力。",
      preferredPositions: "适合用于调低HxH类金属结合、验证His配位作用或构建甲基化识别位点。",
      positionsToAvoid: "需要His N1参与金属配位、质子转移或催化的位置不宜替换。",
      evidenceSummary: "未甲基化/1-甲基His肽直接比较显示N1甲基化使HxH基序的锌亲和力降低。",
      boundary: "只确认特定金属结合性质，不能外推到膜渗透、蛋白酶稳定性或口服吸收。",
      sources: [
        { title: "METTL9 mediates pervasive 1-methylhistidine modification", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7873184/" },
      ],
    },
    sources: [
      { title: "METTL9 mediates pervasive 1-methylhistidine modification", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7873184/", supports: "HxH肽中His与1-甲基His的锌结合比较及修饰鉴定" },
    ],
  },
  "23F": {
    peptideExperiment: {
      conclusion: "在N-琥珀酰化三肽中，末端Phe换成Z-脱氢苯丙氨酸后，凝胶效率、材料力学性能和持续释放提高，并获得更强的蛋白酶抗性。",
      measurement: "2026年研究把含末端ΔPhe的脱氢三肽与对应天然Phe三肽直接比较；脱氢肽形成更有序纤维，凝胶性能更好，二羧酸型在长时间α-糜蛋白酶处理下保持抗降解，而天然对照继续被降解。",
      attributionBoundary: "这是短肽水凝胶材料体系，性质包括自组装、流变、释放和蛋白酶稳定性；不能直接等同于受体肽的膜渗透或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Phe形成α,β-双键后变为ΔPhe，芳香侧链和主链相对位置被锁定，构象自由度下降。",
      preferredPositions: "适合需要提高短肽自组装、纤维有序性或阻断糜蛋白酶处理的芳香末端位置。",
      positionsToAvoid: "需要天然Phe可旋转构象或受体口袋不能容纳平面化骨架的位置应谨慎。",
      evidenceSummary: "天然/脱氢三肽直接比较显示ΔPhe提高凝胶效率、力学性能、持续释放和蛋白酶抗性。",
      boundary: "证据来自材料型短肽；用于药理活性肽仍需单独配对验证。",
      sources: [
        { title: "Canonical vs. dehydropeptides: self-assembly and hydrogel properties", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13115676/" },
        { title: "Impact of dehydroamino acids on 3₁₀-helical peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7077758/" },
      ],
    },
    sources: [
      { title: "Canonical vs. dehydropeptides: self-assembly and hydrogel properties", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13115676/", supports: "天然Phe三肽与末端ΔPhe三肽的自组装、流变、释放和蛋白酶比较" },
      { title: "Impact of dehydroamino acids on 3₁₀-helical peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7077758/", supports: "ΔPhe对短肽构象和稳定性的实验背景" },
    ],
  },
  RXL: {
    peptideExperiment: {
      conclusion: "在β-发夹模型肽的转角区引入脱氢缬氨酸后，肽的折叠程度和抗蛋白酶能力均提高。",
      measurement: "同系列实验显示，含ΔVal的β-发夹肽比原始肽的蛋白酶稳定性约提高6–7倍；NMR还显示部分ΔVal肽的折叠比例由约73–77%提高到90–94%。",
      attributionBoundary: "效果来自特定β-发夹转角，且位置依赖明显；不能把该倍数直接用于任意Val位点，也没有测量口服吸收或膜渗透。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Val主链形成α,β-双键后变成ΔVal，局部骨架更平、更刚，构象自由度下降。",
      preferredPositions: "已有证据最支持β-发夹转角的i+1位置，或希望同时提高折叠和抗酶解的位置。",
      positionsToAvoid: "需要天然Val四面体构型、侧链精确朝向或较大主链自由度的位置应谨慎。",
      evidenceSummary: "ΔVal在β-发夹转角中可带来约6–7倍抗蛋白酶提升，并把部分模型肽的折叠比例提高到90%以上。",
      boundary: "这是模型β-发夹的构象和蛋白酶稳定性证据，不是通用药代结论。",
      sources: [
        { title: "Bulky Dehydroamino Acids Enhance Proteolytic Stability and Folding in β-Hairpin Peptides", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6085080/" },
      ],
    },
    sources: [
      { title: "Kastner et al., 2018", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6085080/", supports: "ΔVal β-发夹肽的折叠和蛋白酶稳定性直接比较" },
    ],
  },
  KCR: {
    peptideExperiment: {
      conclusion: "组蛋白H3肽中Lys9发生巴豆酰化后，AF9的YEATS结构域结合明显增强。",
      measurement: "同序列H3(1–15)肽比较中，H3K9cr的解离常数约2.1 µM，H3K9ac约5.0 µM；巴豆酰化肽的亲和力约为乙酰化肽的2.4倍。",
      attributionBoundary: "这是组蛋白H3第9位与AF9 YEATS的识别结果，说明特定靶点结合增强，不表示溶解度、渗透性或稳定性普遍提高。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys侧链氨基接上巴豆酰基后，正电荷被中和，并增加一段平面不饱和疏水表面。",
      preferredPositions: "适合构建YEATS结构域识别位点，尤其是已有组蛋白巴豆酰化生物学背景的位置。",
      positionsToAvoid: "依赖Lys正电荷、盐桥或蛋白酶切割的位置不应直接替换。",
      evidenceSummary: "H3K9cr对AF9 YEATS的亲和力约为H3K9ac的2.4倍。",
      boundary: "证据只支持特定表观遗传阅读器结合，不支持通用成药性质改善。",
      sources: [
        { title: "Molecular Coupling of Histone Crotonylation and Active Transcription by AF9 YEATS Domain", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4841940/" },
      ],
    },
    sources: [
      { title: "Li et al., Molecular Cell, 2016", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4841940/", supports: "同序列H3K9cr/H3K9ac肽与AF9 YEATS的亲和力比较" },
    ],
  },
  FAK: {
    peptideExperiment: {
      conclusion: "含N6-三氟乙酰赖氨酸的组蛋白肽可竞争性抑制Sir2家族去乙酰化酶。",
      measurement: "以Hst2为代表，三氟乙酰赖氨酸肽的竞争性抑制常数Kis为4.8 µM，结合Kd为3.3 µM。",
      attributionBoundary: "论文比较的是不同赖氨酸酰化肽并测定酶抑制；这证明FAK可作为机制型抑制残基，但没有证明其改善膜渗透、溶解度或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Lys侧链氨基被三氟乙酰化后，正电荷被中和，并得到强吸电子、较疏水的含氟酰胺。",
      preferredPositions: "适合在以酰化Lys为底物的去酰化酶识别位点测试机制型抑制。",
      positionsToAvoid: "需要Lys保持正电荷或作为常规胺反应位点的位置应避免。",
      evidenceSummary: "三氟乙酰赖氨酸组蛋白肽对Hst2的Kis为4.8 µM、Kd为3.3 µM。",
      boundary: "属于酶抑制用途证据，不等于一般药代性质改善。",
      sources: [
        { title: "Mechanism-based inhibition of Sir2 deacetylases by thioacetyl-lysine peptide", url: "https://pubmed.ncbi.nlm.nih.gov/18027980/" },
      ],
    },
    sources: [
      { title: "Smith and Denu, Biochemistry, 2007", url: "https://pubmed.ncbi.nlm.nih.gov/18027980/", supports: "含三氟乙酰赖氨酸组蛋白肽的Hst2抑制与结合常数" },
    ],
  },
  SLZ: {
    peptideExperiment: {
      conclusion: "L-硫代赖氨酸可作为双内酰胺订书肽的构建残基，并形成具有可测螺旋度和抗蛋白酶性的肽。",
      measurement: "RNase A模型中，L-硫代赖氨酸订书肽在Pronase处理4、7.5和15分钟后分别剩余48.9%、35.7%和21.6%；对应α-甲基硫代赖氨酸版本为96.6%、93.3%和81.3%。",
      attributionBoundary: "直接比较对象是L-硫代赖氨酸与α-甲基-L-硫代赖氨酸订书肽，而不是未订书天然Lys肽；因此只能证明SLZ可用于该成环体系，不能算出相对天然Lys的增量。",
      confidence: "同骨架替换",
    },
    propertyReview: {
      status: "同骨架证据",
      plainMeaning: "硫代赖氨酸把Lys侧链中的一个亚甲基换成硫原子，可作为双内酰胺订书反应的功能把手。",
      preferredPositions: "适合按i,i+4间隔布置、用于构建双内酰胺订书结构的位置。",
      positionsToAvoid: "若目标只是普通Lys替换、没有配套成环设计，则不能从该研究推断会自动提高稳定性。",
      evidenceSummary: "SLZ订书肽能够形成并表现出螺旋及抗Pronase能力；α-甲基版本在同骨架中更强。",
      boundary: "证据属于特定订书化学和模型肽，不是SLZ单点替换的通用性质。",
      sources: [
        { title: "Bis-Lactam Peptide [i,i+4]-Stapling with α-Methylated Thialysines", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7582373/" },
      ],
    },
    sources: [
      { title: "Chen et al., Molecules, 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7582373/", supports: "L-硫代赖氨酸订书肽的合成、螺旋度和Pronase稳定性" },
    ],
  },
  ALN: {
    peptideExperiment: {
      conclusion: "在Bak来源结合肽的同骨架筛选中，用2-萘基丙氨酸替换关键疏水位点后，结合亲和力小幅提高。",
      measurement: "该系列对多种芳香和脂肪族替换进行比较；2-萘基丙氨酸使亲和力约提高1.4倍，而1-萘基丙氨酸会明显降低活性。",
      attributionBoundary: "这是特定Bak来源肽的靶点结合结果，而且1-Nal与2-Nal方向相反；不能把‘萘基更大’简单推广为所有肽都会增强。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "把较小芳香侧链扩展为2-萘基，会增加疏水和芳香接触面积。",
      preferredPositions: "可优先测试靶点表面存在较大疏水口袋、且天然芳香残基未完全填满的位置。",
      positionsToAvoid: "狭窄口袋或对芳香环朝向要求严格的位置应谨慎；1-Nal和2-Nal不能互相代替。",
      evidenceSummary: "Bak来源肽中2-Nal使亲和力约提高1.4倍，但同研究中的1-Nal明显不利。",
      boundary: "只支持特定结合位点的亲和力方向，不支持通用渗透或稳定性改善。",
      sources: [
        { title: "Structure–activity relationships of Bak derived peptides", url: "https://www.sciencedirect.com/science/article/pii/S0223523407002577" },
      ],
    },
    sources: [
      { title: "Bak-derived peptide SAR study, 2008", url: "https://www.sciencedirect.com/science/article/pii/S0223523407002577", supports: "2-Nal与母体肽的同骨架亲和力比较" },
    ],
  },
  PRV: {
    peptideExperiment: {
      conclusion: "2-硝基苯基甘氨酸可嵌入MHC结合肽，并在长波紫外光下切断肽链，用于快速置换MHC配体。",
      measurement: "条件性pMHC配体在366 nm附近照射后发生光切割；该方法可在一天内完成高通量MHC肽交换和四聚体制备。",
      attributionBoundary: "这是光切割工具性质，不是溶解度、膜渗透、抗酶解或口服吸收改善；使用时还要考虑紫外照射和片段释放。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "邻硝基苯基位于α-碳旁，可在紫外光触发后发生分子内反应并切断相邻肽键。",
      preferredPositions: "适合需要光控释放、条件性MHC配体或按时切断肽链的非锚定位点。",
      positionsToAvoid: "不能接受紫外照射、需要长期化学稳定或该位点必须保持强结合的体系不宜使用。",
      evidenceSummary: "2-硝基苯基甘氨酸已用于UV敏感MHC配体和高通量配体交换。",
      boundary: "属于化学生物学工具证据，不应标成成药性质提升。",
      sources: [
        { title: "Generation of peptide–MHC class I complexes through UV-mediated ligand exchange", url: "https://www.nature.com/articles/nprot.2006.121" },
      ],
    },
    sources: [
      { title: "Toebes et al., Nature Protocols, 2006", url: "https://www.nature.com/articles/nprot.2006.121", supports: "含(2-硝基)苯基甘氨酸的条件性MHC配体与UV切割流程" },
    ],
  },
  P1L: {
    peptideExperiment: {
      conclusion: "在SNAP-23半胱氨酸富集片段中，S-棕榈酰化是膜结合所必需，并使肽能够促进模型膜和天然膜融合。",
      measurement: "研究直接比较酰化与未酰化合成肽；未酰化肽缺少有效膜结合，而棕榈酰化肽可结合膜并诱导融合，程度取决于肽长、位点和棕榈酰基数量。",
      attributionBoundary: "这是含多个Cys的膜融合肽体系，不能把整体效应精确分摊到单个P1L残基，也不代表水溶性会改善。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Cys巯基接上C16棕榈酰链后，疏水表面积大幅增加，可把肽锚定到脂质膜。",
      preferredPositions: "适合需要膜锚定、膜局部富集或膜融合功能的暴露Cys位置。",
      positionsToAvoid: "需要良好水溶性、避免非特异膜结合或该Cys用于二硫键的体系应谨慎。",
      evidenceSummary: "酰化/未酰化SNAP-23肽直接比较显示，棕榈酰化对膜结合必需，并赋予膜融合能力。",
      boundary: "支持膜结合和膜融合，不支持口服吸收；长脂链还可能降低水溶性。",
      sources: [
        { title: "Palmitoylated peptides from the cysteine-rich domain of SNAP-23 cause membrane fusion", url: "https://pubmed.ncbi.nlm.nih.gov/12551899/" },
      ],
    },
    sources: [
      { title: "Pallavi and Nagaraj, JBC, 2003", url: "https://pubmed.ncbi.nlm.nih.gov/12551899/", supports: "酰化与未酰化SNAP-23肽的膜结合和膜融合比较" },
    ],
  },
  HL2: {
    peptideExperiment: {
      conclusion: "β-羟基亮氨酸可被掺入新生长激素蛋白，但会阻断其正常分泌。",
      measurement: "在牛和大鼠生长激素表达体系中，加入β-羟基亮氨酸后，生长激素由培养基转为在细胞内积累；细胞内样品仍可见准确的信号肽切割。",
      attributionBoundary: "该类似物会替换蛋白中的多个Leu，实验不是单个位点工程；因此只能说明总体掺入会干扰分泌，不能确定哪个Leu位点负责。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Leu侧链β位增加羟基后，极性和氢键能力提高，但也会改变疏水信号肽的识别。",
      preferredPositions: "可作为研究疏水信号肽、蛋白加工和分泌机制的扰动残基。",
      positionsToAvoid: "依赖连续疏水Leu维持信号肽或膜转运的区域应避免无验证替换。",
      evidenceSummary: "β-羟基亮氨酸总体掺入会使生长激素分泌受阻并在细胞内积累。",
      boundary: "是完整蛋白的多位点掺入结果，不是单残基对照，也不是有利性质。",
      sources: [
        { title: "Effects of a leucine analog on growth hormone processing and secretion by cultured cells", url: "https://pubmed.ncbi.nlm.nih.gov/1869539/" },
      ],
    },
    sources: [
      { title: "McAndrew et al., JBC, 1991", url: "https://pubmed.ncbi.nlm.nih.gov/1869539/", supports: "β-羟基亮氨酸掺入后对生长激素加工和分泌的影响" },
    ],
  },
  OCY: {
    peptideExperiment: {
      conclusion: "在Aurora-A激酶T288位构建2-羟乙基半胱氨酸并使其自磷酸化后，可得到接近天然磷酸化激酶的活性。",
      measurement: "T288位的磷酸化2-羟乙基半胱氨酸变体催化效率约为未修饰构建体的7倍，接近磷酸半胱氨酸变体，并高于常用Glu模拟物。",
      attributionBoundary: "起作用的是磷酸化后的OCY，而且位于完整Aurora-A蛋白的特定激活环；未磷酸化OCY本身并未被证明能增强活性。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Cys硫上接入羟乙基后得到可进一步磷酸化的侧链，可模拟磷酸Ser/Thr的长度和电荷。",
      preferredPositions: "适合需要构建稳定磷酸化模拟物、并能在特定位点完成化学修饰和磷酸化的研究。",
      positionsToAvoid: "不能完成后续磷酸化，或目标位点需要天然Thr精确立体结构时不能直接套用。",
      evidenceSummary: "T288位磷酸化OCY使Aurora-A催化效率相对未修饰构建体约提高7倍。",
      boundary: "结果属于磷酸化后完整蛋白的功能，不代表游离OCY或普通肽的通用性质。",
      sources: [
        { title: "Insights into Aurora-A Kinase Activation Using Unnatural Amino Acids Incorporated by Chemical Modification", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3805324/" },
      ],
    },
    sources: [
      { title: "Rowan et al., ACS Chemical Biology, 2013", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3805324/", supports: "T288位磷酸化2-羟乙基半胱氨酸Aurora-A的催化活性比较" },
    ],
  },
  AZH: {
    peptideExperiment: {
      conclusion: "叠氮高丙氨酸可替代Met进入新生蛋白，并通过叠氮基进行选择性点击标记和富集。",
      measurement: "AHA脉冲标记可在分钟级进入新生蛋白；点击化学随后用于荧光检测、富集和质谱鉴定，蛋白翻译抑制剂会显著压低该信号。",
      attributionBoundary: "功能替换对象是Met，而本站结构母体按最大共同骨架映射为Ala；这是代谢掺入和标记用途，不是单个位点的药代性质对照。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "侧链末端叠氮基体积较小、在生物体系中少见，可与炔基选择性点击反应。",
      preferredPositions: "适合用于新生蛋白标记、富集、成像或后续偶联，常作为Met代谢替代物。",
      positionsToAvoid: "需要保留Met硫醚化学、或对多位点整体替换非常敏感的蛋白应先验证功能。",
      evidenceSummary: "AHA能够进入新生蛋白，并支持点击标记、富集和定量分析。",
      boundary: "属于生物正交标记证据，不代表渗透性、稳定性或口服吸收得到改善。",
      sources: [
        { title: "Non-Canonical Amino Acids in the Interrogation of Cellular Protein Synthesis", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3178009/" },
        { title: "Quantitative analysis of newly synthesized proteins", url: "https://www.nature.com/articles/s41596-018-0012-y" },
      ],
    },
    sources: [
      { title: "Ngo and Tirrell, Accounts of Chemical Research, 2011", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3178009/", supports: "AHA作为Met替代物进入蛋白并用于生物正交标记" },
      { title: "Zhang et al., Nature Protocols, 2018", url: "https://www.nature.com/articles/s41596-018-0012-y", supports: "AHA新生蛋白标记、富集和定量流程" },
    ],
  },
  NIY: {
    peptideExperiment: {
      conclusion: "Tyr硝化为3-硝基Tyr后，会明显改变肽的色谱保留和抗体识别。",
      measurement: "同一α-突触核蛋白来源肽的修饰/未修饰比较显示，3NT肽在反相色谱中晚洗脱约2–4分钟；同序列ApoA-I八肽中，含3NT的肽可竞争抗体结合，而未硝化Tyr肽不能。",
      attributionBoundary: "这里直接测到的是疏水色谱行为和硝化表位识别；不能进一步推断膜渗透、蛋白酶稳定性或口服吸收。",
      confidence: "直接对照",
    },
    propertyReview: {
      status: "具体残基证据",
      plainMeaning: "Tyr芳环3位增加硝基后，酚羟基酸性、电子分布和表面识别特征都会改变。",
      preferredPositions: "适合构建氧化应激标志表位、研究硝化依赖抗体识别或作为分析标准。",
      positionsToAvoid: "需要天然Tyr磷酸化、酚羟基正常pKa或保持原受体氢键的位置应谨慎。",
      evidenceSummary: "3NT使同一肽的反相色谱保留延长约2–4分钟，并产生可被特异抗体区分的表位。",
      boundary: "证据支持分析和表位性质，不支持通用成药性质。",
      sources: [
        { title: "Preferentially increased nitration of α-synuclein at tyrosine-39", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2748813/" },
        { title: "Immunoglobulins against Tyrosine Nitrated Epitopes in Coronary Artery Disease", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3501999/" },
      ],
    },
    sources: [
      { title: "Danielson et al., 2009", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2748813/", supports: "同一肽硝化前后的LC-MS保留时间比较" },
      { title: "Thomson et al., 2012", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3501999/", supports: "同序列3NT/Tyr八肽的抗体竞争识别比较" },
    ],
  },
  PHD: {
    peptideExperiment: {
      conclusion: "CheY活性位Asp形成天冬氨酰磷酸后，对鞭毛马达蛋白FliM的结合亲和力显著增强。",
      measurement: "E. coli CheY研究中，未磷酸化CheY对FliM N端肽的Kd约450 µM，CheY~P亲和力约增强15倍；该天冬氨酰磷酸在室温下半衰期约22.8秒。",
      attributionBoundary: "这是完整CheY蛋白D57位的瞬态天然磷酸化，不是把PHD随意装入普通肽的替换实验；其高反应性和短寿命也是重要限制。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Asp侧链羧酸形成高能酰基磷酸后，增加磷酸电荷并触发响应调节蛋白构象切换。",
      preferredPositions: "适合两组分信号蛋白的瞬态活化研究，或作为需快速水解的磷酸化状态。",
      positionsToAvoid: "需要长期储存、常规SPPS稳定性或把磷酸化状态固定住的肽不宜直接使用。",
      evidenceSummary: "CheY~P对FliM N端肽的亲和力约提高15倍，但室温半衰期仅约22.8秒。",
      boundary: "这是特定响应调节蛋白的功能和化学稳定性证据，不是普遍的结合增强。",
      sources: [
        { title: "Allosteric Priming of E. coli CheY by the Flagellar Motor Protein FliM", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7499101/" },
      ],
    },
    sources: [
      { title: "McDonald et al., 2020", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7499101/", supports: "CheY天冬氨酰磷酸半衰期及CheY~P/未磷酸化CheY对FliM的亲和力比较" },
    ],
  },
  "5GG": {
    peptideExperiment: {
      conclusion: "eIF5A的Lys50形成脱氧羟腐胺后，能够恢复翻译活性并增强与核输出蛋白Exportin-4的结合。",
      measurement: "未修饰eIF5A在Met-puromycin翻译模型中无活性，脱氧羟腐胺化后获得活性；Exportin-4实验中，未修饰eIF5A表观Kd约75 nM，脱氧羟腐胺化后约25 nM，亲和力提高约3倍。",
      attributionBoundary: "这是eIF5A唯一特定位点Lys50的翻译后修饰，且完整蛋白表面参与结合；不能把3倍结果用于普通Lys位点或短肽。",
      confidence: "完整肽支持",
    },
    propertyReview: {
      status: "完整肽证据",
      plainMeaning: "Lys侧链末端接上4-氨基丁基，形成更长、仍带碱性的脱氧羟腐胺侧链。",
      preferredPositions: "现有强证据仅支持eIF5A的保守Lys50位点及其翻译和核输出功能。",
      positionsToAvoid: "除eIF5A特定位点外，不应把它当作通用Lys延长策略直接外推。",
      evidenceSummary: "脱氧羟腐胺化eIF5A恢复翻译模型活性，并把Exportin-4表观结合Kd由约75 nM降至约25 nM。",
      boundary: "属于完整eIF5A的专一翻译后修饰，不能归纳为一般肽性质改善。",
      sources: [
        { title: "Exportin 4: a mediator of a novel nuclear export pathway in higher eukaryotes", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC302028/" },
        { title: "The hypusine-containing translation factor eIF5A", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4183722/" },
      ],
    },
    sources: [
      { title: "Lipowsky et al., EMBO Journal, 2000", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC302028/", supports: "未修饰、脱氧羟腐胺化和羟腐胺化eIF5A的Exportin-4结合比较" },
      { title: "Dever et al., Critical Reviews in Biochemistry and Molecular Biology, 2014", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4183722/", supports: "脱氧羟腐胺化/未修饰eIF5A的翻译模型活性证据汇总" },
    ],
  },
};
