# OCPR主记录字段说明

版本：`ocpr-master-record-v1`

## 记录范围

主记录只包含经过人工整理、已经关联论文、专利或完整研发骨架证据的残基条目。CCD结构参考库中的自动候选不会自动获得OCPR永久编号。

## 核心字段

- `id`：本站永久编号，格式为`OCPR`加六位数字。
- `nameZh` / `nameEn`：中文展示名和英文名称。
- `categoryId` / `category`：残基类别标识和标签。
- `evidenceLevel`：当前人工证据层级。
- `supportScope`：来源能够支持的结论范围。
- `effectSummary`：研发性质方向；可能包含结构或类别推断。
- `evidenceSummary`：原始证据的人工摘要。
- `primarySource` / `secondarySource`：字段结论所依据的来源。
- `ccdStructures`：名称和立体化学能够精确对应的CCD映射。
- `recordVersion` / `reviewedAt`：记录版本和最近审核日期。
- `detailPath`：可引用的人类可读详情页。

## 证据边界

CCD身份、PDB聚合物使用、独立单体可获得性、环肽使用和口服性质是不同结论。API使用者不得将结构层预测字段解释为实验证实结果。
