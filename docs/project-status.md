# 项目状态与证据边界

更新日期：2026-08-31

## 当前仓库包含什么

- 2,065 个可检索且不重复的 CCD 结构记录。这里是结构总目录，并不表示 2,065 条都已经确认为非天然氨基酸，也不表示它们都适合环肽合成。
- 2,065 条记录已全部完成 PDB 聚合物序列查询，并按结构身份做互斥分类：已确认残基 114 条、在 PDB 聚合物中出现但单体资料待补 952 条、特殊用途／结构参考 294 条、氨基酸样待确认候选 476 条、非单体／明确排除 229 条；五类合计 2,065，不重复计数。
- 1,805 条由结构规则生成的补充审核队列，分为 P0（6）、P1（45）、P2（484）和 P3（1,270）。
- 159 条经过去重合并的研发证据记录；145 条可以映射到 CCD，共关联 146 个 CCD 结构。其余 14 条属于构型未唯一确定、组合构件或骨架改造策略，暂无唯一 CCD 可对应。
- CCD 结构库是主表，研发证据库是按 CCD 关联的证据视图。具有 CCD 映射的研发记录必须能在结构库中找到；特殊用途或排除结构即使有资料，也不会因此被改写为普通氨基酸单体。
- 一份覆盖统一结构目录的保守研发相关性分档，分为“优先研发候选 / 条件候选 / 仅结构参考 / 明确排除”，并逐条保留筛选理由、风险提示与收录来源。
- 对221个优先研发候选完成RCSB聚合物序列使用审计，分别统计全部聚合物实体和不超过50个残基的短肽实体命中。
- 221个原优先候选的人工证据深审已完成两批共40条。第二批从“PDB肽中出现”类别按≤50残基聚合物实体命中数选择20条，结论为A类16条、B类4条；两批累计A类26条、B类9条、待补证据5条。
- 114条已确认残基的合成可用性审核已启动；第一批20条已核查商业保护形式、Fmoc-SPPS兼容性、偶联建议和主要风险，其中11条可从标准Fmoc流程起步，9条需要强化偶联或特别监测。供应商目录不作为实时库存承诺。
- 全量 PDB 序列结果为：955 条命中不超过 50 残基的聚合物、505 条只命中较长聚合物、605 条未命中。原 162 条“PDB中出现”记录的标题语境初筛作为历史审查结果保留；新增命中尚需区分线性肽、环肽、蛋白和其他聚合物。
- 原 1,266 条待确认候选的结构字段二次分层作为历史排序数据保留；全量 PDB 查询后其中 790 条因获得序列命中升级至“PDB中出现”，当前仍待确认候选为 476 条。

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

## 后续完成顺序

1. 优先人工复核32条含直接或混合环肽标题线索的PDB记录，确认实体序列和真实环化拓扑。
2. 优先复核新增 PDB 命中的具体聚合物语境，再对当前 476 条未命中候选补充保护形式、供应或公开合成路线。
3. 对优先候选逐条补论文、专利、供应商或合成单体来源。
4. 每次发布前构建网站，并在桌面、移动端检查筛选、分页、图片和下载资源。
