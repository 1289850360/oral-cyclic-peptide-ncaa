# 项目状态与证据边界

更新日期：2026-08-31

## 当前仓库包含什么

- 2,065 个可检索且不重复的 CCD 结构记录。这里是结构总目录，并不表示 2,065 条都已经确认为非天然氨基酸，也不表示它们都适合环肽合成。
- 2,065 条记录已完成统一结构身份分类：已确认非天然氨基酸／非标准残基 1,844 条、身份待确认 1 条、特殊用途结构 176 条、非单体／明确排除 44 条；四类合计 2,065，不重复计数。PDB聚合物序列使用状态单独统计，不再作为结构身份类别。
- 1,805 条由结构规则生成的补充审核队列，分为 P0（6）、P1（45）、P2（484）和 P3（1,270）。
- 661 条经过去重合并的研发资料进入CCD—证据审计表；610 条可以映射到 CCD，共关联 604 个 CCD 结构。其余 51 条属于构型未唯一确定、特定取代构件或骨架改造策略，暂无唯一 CCD 可对应。
- 最新一批按 CCD 编号固定顺序核查 100 条 PDB 命中记录：23 条确认残基、45 条特殊用途、31 条非单体／排除、1 条证据不足；没有把 PDB 命中自动升级为残基证据。
- 第二个固定顺序批次继续核查 100 条：28 条确认残基、47 条特殊用途、24 条非单体／排除、1 条证据不足；同时核对代表 PDB 标题与聚合物序列。
- CCD 结构库是主表，研发证据库是按 CCD 关联的证据视图。具有 CCD 映射的研发记录必须能在结构库中找到；特殊用途或排除结构即使有资料，也不会因此被改写为普通氨基酸单体。
- 研发证据库收录46条具有实验性质终点的正式记录：34条直接／骨架改造实验、10条完整分子性质证据，以及2条带具体实验声明的专利实例。30条记录已映射到28个CCD结构，16条属于尚无唯一CCD的骨架策略；完整分子或多位点结果不能归因于单个残基。
- 对221个优先研发候选完成RCSB聚合物序列使用审计，分别统计全部聚合物实体和不超过50个残基的短肽实体命中。
- 221个原优先候选的人工证据深审已完成两批共40条。第二批从“PDB肽中出现”类别按≤50残基聚合物实体命中数选择20条，结论为A类16条、B类4条；两批累计A类26条、B类9条、待补证据5条。
- 114条已确认残基的合成可用性审核已启动；第一批20条已核查商业保护形式、Fmoc-SPPS兼容性、偶联建议和主要风险，其中11条可从标准Fmoc流程起步，9条需要强化偶联或特别监测。供应商目录不作为实时库存承诺。
- 全量 PDB 序列结果为：955 条命中不超过 50 残基的聚合物、505 条只命中较长聚合物、605 条未命中。原 162 条“PDB中出现”记录的标题语境初筛作为历史审查结果保留；新增命中尚需区分线性肽、环肽、蛋白和其他聚合物。
- 916 条疑似记录已按wwPDB CCD官方单体类型完成全量身份核验：639条peptide-linking单体升级为已确认非天然残基，277条non-polymer、peptide-like或类型不明确记录继续待核验。

## 三层证据必须分开

1. **结构身份**：CCD 编号、名称、分子式、立体化学 SMILES 与链接能够对应。
2. **多肽使用**：该 CCD 组分实际进入过 PDB 聚合物序列，或论文、专利、合成资料明确把它作为多肽残基使用。
3. **性质效果**：同骨架替换实验能够支持渗透性、稳定性、溶解度或活性变化。

第一层不能自动推出第二层，第二层也不能自动推出第三层。网站中“结构层面可能影响”只能作为候选生成假设，不能写成实验结论。

构件身份分类反映当前审核进度，而不是药效或口服性评分。人工审核结论优先，其次使用 PDB 聚合物序列审计；没有直接证据的记录只按结构规则保守初分。每条记录同时保存分类依据和分类方法，后续人工审核可覆盖规则初分。

## 已恢复的质量基线

运行：

```bash
npm run audit:catalog
```

校验脚本会生成：

- `public/catalog-integrity-report.json`
- `public/catalog-integrity-issues.csv`

需要联网的官方字段复核运行：

```bash
npm run audit:catalog:remote
```

它会分批查询 RCSB PDB Data API，并生成：

- `public/ccd-official-field-audit.json`
- `public/ccd-official-field-issues.csv`

2026-08-28 的全量结果覆盖网站涉及的 3,496 个唯一 CCD 编号；名称、分子式、分子量、母体编号和立体化学 SMILES 均与当日官方记录一致。

它检查：

- JSON 与 CSV 行数一致；
- CCD 编号、结构核心和立体化学 SMILES 不重复；
- 名称、分子式、SMILES 跨文件一致；
- RCSB 详情链接与 PDBe 二维图链接中的 CCD 编号逐条匹配；
- 1,805 条审核队列和 P0–P3 分层数量一致。

该校验不能证明远端二维图的化学绘制一定正确，也不能证明候选适合肽合成或能改善口服性质。上述结论仍需要官方字段复核、图结构抽样和直接来源证据。

研发相关性初筛运行：

```bash
npm run screen:development
```

它会生成 `public/ccd-development-screen.json` 和 `public/ccd-development-screen.csv`。自动分档用于缩小人工审核范围，不把“优先候选”写成“已证实可口服”；所有保留候选仍需核对保护策略、供应或合成路线、SPPS/LPPS兼容性以及具体环肽证据。

统一结构目录运行：

```bash
npm run build:unified-structure-catalog
```

它会生成 `public/ccd-unified-structure-catalog.json`、`public/ccd-unified-structure-catalog.csv` 和 `public/ccd-unified-polymer-usage.json`。合并过程保留 `core-structure-screen` 与 `research-evidence-linked` 两类来源标签，不把补入记录伪装成原始结构筛选结果。

研发证据与 CCD 对齐运行：

```bash
npm run build:research-alignment
```

它会生成 `public/ccd-research-evidence-alignment.json` 和 CSV。当前校验要求159条研发记录中145条完成映射、关联146个 CCD，且结构库中不存在缺失链接、漏挂证据或孤立证据。该校验已接入本地和 GitHub Pages 正式构建，未通过时停止发布。

需要联网的PDB聚合物序列使用审计运行：

```bash
npm run audit:polymer-usage
```

它会生成 `public/ccd-polymer-usage-audit.json` 和 `public/ccd-polymer-usage-audit.csv`。当前221个优先候选中，176个命中不超过50个残基的短聚合物实体，11个只命中较长聚合物，34个暂无聚合物实体命中。短聚合物命中只证明该CCD实际进入过较短的PDB聚合物序列，不能自动推出环化方式、SPPS可行性或口服性质。

原优先候选第一批人工审核运行：

```bash
npm run review:core-priority:batch-1
```

它会生成 `public/ccd-core-priority-review-batch-1.json` 和 `public/ccd-core-priority-review-batch-1.csv`。A类只表示找到直接环肽或宏环使用证据；完整环肽的口服、渗透或细胞数据不会归因到单个残基。

第二批人工审核运行：

```bash
npm run review:core-priority:batch-2
```

它会生成 `public/ccd-core-priority-review-batch-2.json` 和 `public/ccd-core-priority-review-batch-2.csv`。第二批优先处理PDB短肽命中最高的20条记录。

合成可用性第一批运行：

```bash
npm run review:synthesis-usability:batch-1
```

它会生成 `public/ccd-synthesis-usability-batch-1.json` 和 `public/ccd-synthesis-usability-batch-1.csv`。该层只确认保护形式、供应目录和公开SPPS条件，不把供应商目录当作实时库存，也不把“可合成”写成“可口服”。

PDB环肽语境初筛运行：

```bash
npm run audit:pdb-context
```

它会读取既有PDB聚合物审计中的代表结构编号，查询RCSB标题并生成 `public/ccd-pdb-context-audit.json` 和 CSV。标题命中只用于确定后续人工审核顺序。

待验证候选二次分层运行：

```bash
npm run triage:pending-candidates
```

它会生成 `public/ccd-pending-candidate-triage.json` 和 CSV，逐条记录规则依据与判断边界。

完整 CCD 非天然氨基酸覆盖审计运行：

```bash
python scripts/audit-ccd-ncaa-coverage.py --ccd-gzip /path/to/components.cif.gz --source-last-modified 2026-08-29T11:43:19Z
```

它会以 wwPDB 官方完整 `components.cif.gz` 为分母，生成 `public/ccd-ncaa-complete-coverage-audit.json` 和相关CSV。2026-09-02 对照结果为：50,343个已发布CCD组分中有1,681个非标准肽链连接型候选，网站主目录覆盖1,680个（99.94%），另有1个条目在网站快照后更新。随后672条边界记录完成结构身份复核：529条改归非天然氨基酸，130条保留特殊结构，13条排除；当前正式集合为1,844条已确认非天然氨基酸／非标准残基，另有CCD 96Z一条保持身份待确认。

## 后续完成顺序

1. 对NON-POLYMER中的氨基酸样结构运行完整子结构筛选与来源核验，补齐严格肽链连接型分母以外的候选。
2. 为新增归入的修饰残基补充“直接引入单体／翻译后修饰／共价加合物”用途子类型，不改变其化学身份。
3. 对优先候选逐条补论文、专利、供应商或合成单体来源。
4. 每次发布前构建网站，并在桌面、移动端检查筛选、分页、图片和下载资源。
