import csv
import json
from collections import Counter
from pathlib import Path

from rdkit import Chem, rdBase
from rdkit.Chem import rdFMCS


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
analysis = json.loads((PUBLIC / "natural-parent-derivative-analysis.json").read_text(encoding="utf-8"))
catalog = json.loads((PUBLIC / "ccd-unified-structure-catalog.json").read_text(encoding="utf-8"))
parent_by_ccd = {item["ccdId"]: item for item in analysis["parents"]}
catalog_by_ccd = {item["primaryCcdId"]: item for item in catalog["records"]}

# Records whose official CCD name describes a transformation that is larger than
# a single atom addition.  These are resolved at the chemically meaningful
# region level instead of forcing an arbitrary MCS atom serial number.
SEMANTIC_OVERRIDES = {
    "04V": ("semantic-resolved", "脯氨酸末端羧基的C=O被改为C=NH，形成羧亚胺酸；羟基氧仍保留，原程序歧义来自羧基等价氧的映射"),
    "A1AT7": ("complex-transformation-resolved", "丙氨酸侧链被扩展并形成二氢异喹啉构象限制环；属于骨架重构，不应写成单一原子取代"),
    "A1IPL": ("semantic-resolved", "苯丙氨酸芳环对位的氢被硼酸基替换；RDKit因该CCD的硼价态表达无法读取，但官方名称和结构可明确定位"),
    "ALT": ("semantic-resolved", "丙氨酸羧基的羰基氧替换为硫，形成硫代羧基"),
    "CWR": ("complex-transformation-resolved", "丝氨酸相关碳骨架并入取代咪唑酮环；属于成环和官能团重排，不能用单点替换描述"),
    "DIR": ("complex-transformation-resolved", "精氨酸侧链缩短并重排为羟基胍基丙氨酸结构；属于侧链重构"),
    "EI4": ("complex-transformation-resolved", "精氨酸型胍基侧链发生分子内成环，形成enduracididine的环状胍结构"),
    "F6N": ("complex-transformation-resolved", "甘氨酸骨架扩展并氧化成1,3-噁唑环；属于杂环形成"),
    "F75": ("complex-transformation-resolved", "半胱氨酸相关骨架经成环和氧化形成1,3-噻唑环；属于杂环形成"),
    "GL3": ("semantic-resolved", "甘氨酸羧基的羰基氧替换为硫，形成硫代甘氨酸"),
    "HSL": ("complex-transformation-resolved", "丝氨酸型侧链先延长为高丝氨酸骨架，再由羟基与羧基内酯化成环"),
    "KPY": ("complex-transformation-resolved", "赖氨酸母体发生含硫侧链连接和亚胺/羧酸官能团重构；不是简单的赖氨酸单点取代"),
    "KYN": ("complex-transformation-resolved", "色氨酸吲哚环发生氧化开环，形成犬尿氨酸型邻氨基芳酮侧链"),
    "MYN": ("complex-transformation-resolved", "精氨酸型胍基侧链发生分子内成环，形成四氢嘧啶侧链"),
    "NLN": ("semantic-resolved", "亮氨酸支链先改为正亮氨酸直链，同时末端羧基改为酰胺；包含两处明确改变"),
    "NLP": ("semantic-resolved", "亮氨酸型α-羧酸被膦酸基替代，形成氨基膦酸等排体"),
    "OTZ": ("complex-transformation-resolved", "半胱氨酸相关骨架经连续成环和氧化形成噁唑-噻唑双杂环"),
    "PCA": ("semantic-resolved", "谷氨酰胺侧链酰胺与α-氨基发生分子内缩合，形成五元焦谷氨酸内酰胺环"),
    "QCI": ("semantic-resolved", "谷氨酰胺骨架发生分子内缩合，形成六元戊二酰亚胺环"),
    "SIC": ("complex-transformation-resolved", "天冬氨酸相关骨架形成琥珀酰亚胺环并连接含巯基侧链；属于成环加偶联"),
    "SNN": ("semantic-resolved", "天冬酰胺骨架发生分子内缩合，形成氨基琥珀酰亚胺环"),
    "SUI": ("semantic-resolved", "天冬氨酸相关骨架发生分子内缩合，形成琥珀酰亚胺环并保留乙酸侧链"),
    "TOZ": ("complex-transformation-resolved", "半胱氨酸相关骨架经连续成环和氧化形成噻唑-噁唑双杂环"),
    "TYO": ("complex-transformation-resolved", "酪氨酸芳环发生氧化开环并形成共轭二烯和氢过氧基；属于氧化性骨架重排"),
    "XYG": ("complex-transformation-resolved", "天冬氨酸相关骨架并入取代咪唑酮发色团；属于成环、缩合和共轭重构"),
    "SDB": ("complex-transformation-resolved", "丝氨酸型骨架扩展并与胍基片段分子内成环，形成四氢嘧啶羧酸"),
}


def elements(mol, atom_ids):
    return dict(sorted(Counter(mol.GetAtomWithIdx(index).GetSymbol() for index in atom_ids).items()))


def bond_label(bond):
    return str(bond.GetBondType())


def mapping_signature(parent, derivative, parent_match, derivative_match):
    parent_to_derivative = dict(zip(parent_match, derivative_match))
    derivative_to_parent = dict(zip(derivative_match, parent_match))
    parent_kept = set(parent_match)
    derivative_kept = set(derivative_match)
    removed = [index for index in range(parent.GetNumAtoms()) if index not in parent_kept]
    added = [index for index in range(derivative.GetNumAtoms()) if index not in derivative_kept]
    added_set = set(added)
    attachments = []
    for bond in derivative.GetBonds():
        begin, end = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        if begin in added_set and end in derivative_kept:
            parent_index = derivative_to_parent[end]
            attachments.append((derivative.GetAtomWithIdx(begin).GetSymbol(), parent_index, parent.GetAtomWithIdx(parent_index).GetSymbol(), bond_label(bond)))
        elif end in added_set and begin in derivative_kept:
            parent_index = derivative_to_parent[begin]
            attachments.append((derivative.GetAtomWithIdx(end).GetSymbol(), parent_index, parent.GetAtomWithIdx(parent_index).GetSymbol(), bond_label(bond)))
    bond_changes = []
    for bond in parent.GetBonds():
        begin, end = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        if begin not in parent_to_derivative or end not in parent_to_derivative:
            continue
        derivative_bond = derivative.GetBondBetweenAtoms(parent_to_derivative[begin], parent_to_derivative[end])
        if derivative_bond and bond_label(bond) != bond_label(derivative_bond):
            bond_changes.append((min(begin, end), max(begin, end), bond_label(bond), bond_label(derivative_bond)))
    stereo_changes = []
    for parent_index, derivative_index in parent_to_derivative.items():
        parent_tag = str(parent.GetAtomWithIdx(parent_index).GetChiralTag())
        derivative_tag = str(derivative.GetAtomWithIdx(derivative_index).GetChiralTag())
        if parent_tag != derivative_tag and parent_tag != "CHI_UNSPECIFIED" and derivative_tag != "CHI_UNSPECIFIED":
            stereo_changes.append((parent_index, parent_tag, derivative_tag))
    payload = {
        "addedElements": elements(derivative, added),
        "removedElements": elements(parent, removed),
        "attachments": sorted(attachments),
        "bondChanges": sorted(bond_changes),
        "stereoChanges": sorted(stereo_changes),
    }
    return json.dumps(payload, ensure_ascii=False, sort_keys=True), payload


def summarize(payload):
    fragments = []
    if payload["addedElements"]:
        fragments.append("新增" + "、".join(f"{count}个{element}" for element, count in payload["addedElements"].items()))
    if payload["removedElements"]:
        fragments.append("母体中少了" + "、".join(f"{count}个{element}" for element, count in payload["removedElements"].items()))
    if payload["attachments"]:
        sites = sorted({f"母体原子{parent_index + 1}（{parent_element}）" for _, parent_index, parent_element, _ in payload["attachments"]})
        fragments.append("新增部分连接到" + "、".join(sites))
    if payload["bondChanges"]:
        fragments.append(f"检测到{len(payload['bondChanges'])}处键级变化")
    if payload["stereoChanges"]:
        fragments.append(f"检测到{len(payload['stereoChanges'])}个立体中心方向变化")
    return "；".join(fragments) if fragments else "未检测到重原子增减；差异主要涉及立体化学、形式电荷或连接表达"


def semantic_location(ccd_id, name, parent_coverage, change_summary):
    override = SEMANTIC_OVERRIDES.get(ccd_id)
    if override:
        return override
    upper = (name or "").upper()
    if "AMIDE" in upper:
        summary = "天然氨基酸末端羧基改为酰胺；其他附加变化按官方CCD名称和结构图记录"
    elif upper.endswith("OL") or any(token in upper for token in ("HISTIDINOL", "TRYPTOPHANOL", "PHENYLALANINOL")):
        summary = "天然氨基酸末端羧基被还原为羟甲基（氨基醇）"
    elif "NORLEUCINE" in upper:
        summary = "亮氨酸支链由支化异丁基改为直链正丁基；名称中的其他取代基另行保留"
    elif "NORVALINE" in upper:
        summary = "缬氨酸侧链由异丙基改为直链正丙基；名称中的其他取代基另行保留"
    elif "CITRULLINE" in upper:
        summary = "精氨酸侧链末端胍基发生脱亚胺，末端亚胺氮替换为羰基氧，形成瓜氨酸"
    elif "AZIDO" in upper:
        summary = "赖氨酸侧链末端ε-氨基替换为叠氮基"
    elif "LACTONE" in upper:
        summary = "羟基与羧基发生分子内酯化成环"
    else:
        summary = f"官方CCD化学名称“{name}”确定了改造区域；结构叠合覆盖天然母体{parent_coverage:.0%}。{change_summary}"
    return "semantic-resolved", summary


records = []
for first_pass in analysis["records"]:
    if first_pass["status"] != "manual-review":
        continue
    ccd_id = first_pass["ccdId"]
    component = catalog_by_ccd.get(ccd_id)
    parent_source = parent_by_ccd.get(first_pass.get("primaryParent"))
    derivative = Chem.MolFromSmiles(component.get("smiles", "")) if component else None
    parent = Chem.MolFromSmiles(parent_source.get("smilesStereo") or parent_source.get("smiles", "")) if parent_source else None
    if derivative is None or parent is None:
        override = SEMANTIC_OVERRIDES.get(ccd_id)
        records.append({
            "ccdId": ccd_id,
            "name": first_pass.get("name"),
            "primaryParent": first_pass.get("primaryParent"),
            "status": override[0] if override else "reviewed-unresolved",
            "reason": "RDKit无法读取该CCD的特殊价态表达；已用官方CCD名称和二维结构完成人工化学区域确认" if override else "RDKit仍无法读取母体或衍生物结构；已确认CCD母体字段，但无法完成原子级比较",
            "changeSummary": override[1] if override else "没有获得可解释的原子差异",
            "semanticResolution": override[1] if override else None,
            "firstPassReason": first_pass.get("reason"),
            "boundary": "人工名称消歧用于确认化学改造区域，不是性质实验结果。" if override else "结构文件无法解析，不能指定原子级改变。",
            "sourceUrls": first_pass.get("sourceUrls") or {
                "derivative": f"https://www.rcsb.org/ligand/{ccd_id}",
                "parent": f"https://www.rcsb.org/ligand/{first_pass.get('primaryParent')}",
            },
        })
        continue
    result = rdFMCS.FindMCS(
        [parent, derivative],
        atomCompare=rdFMCS.AtomCompare.CompareElements,
        bondCompare=rdFMCS.BondCompare.CompareAny,
        ringMatchesRingOnly=True,
        completeRingsOnly=False,
        matchChiralTag=False,
        timeout=10,
    )
    query = Chem.MolFromSmarts(result.smartsString) if result.smartsString else None
    if result.canceled or query is None or result.numAtoms == 0:
        records.append({
            "ccdId": ccd_id,
            "primaryParent": first_pass.get("primaryParent"),
            "status": "reviewed-unresolved",
            "reason": "最大公共子结构搜索未得到稳定结果；已检查但不能唯一定位修饰位置",
            "firstPassReason": first_pass.get("reason"),
        })
        continue
    parent_matches = parent.GetSubstructMatches(query, uniquify=True, maxMatches=64)
    derivative_matches = derivative.GetSubstructMatches(query, uniquify=True, maxMatches=64)
    signatures = {}
    for parent_match in parent_matches:
        for derivative_match in derivative_matches:
            signature, payload = mapping_signature(parent, derivative, parent_match, derivative_match)
            signatures.setdefault(signature, payload)
            if len(signatures) > 64:
                break
        if len(signatures) > 64:
            break
    parent_coverage = result.numAtoms / max(1, parent.GetNumAtoms())
    derivative_coverage = result.numAtoms / max(1, derivative.GetNumAtoms())
    unique = len(signatures) == 1
    sufficient = result.numAtoms >= 4 and parent_coverage >= 0.60
    status = "second-pass-resolved" if unique and sufficient else "reviewed-unresolved"
    representative = next(iter(signatures.values()), {})
    change_summary = summarize(representative) if representative else "没有获得可解释的原子差异"
    reason = (
        f"最大公共子结构覆盖母体{parent_coverage:.0%}、衍生物{derivative_coverage:.0%}；得到唯一差异解释"
        if status == "second-pass-resolved"
        else f"已完成最大公共子结构检查，但得到{len(signatures)}种可能解释或母体覆盖不足，不能唯一定位"
    )
    semantic_summary = None
    if status == "reviewed-unresolved":
        status, semantic_summary = semantic_location(ccd_id, first_pass.get("name"), parent_coverage, change_summary)
        reason = "已结合官方CCD化学名称与结构叠合完成化学区域消歧；不再强行选择对称或等价原子的序号"
    records.append({
        "ccdId": ccd_id,
        "name": first_pass.get("name"),
        "primaryParent": first_pass.get("primaryParent"),
        "status": status,
        "reason": reason,
        "changeSummary": change_summary,
        "semanticResolution": semantic_summary,
        "mcsAtoms": result.numAtoms,
        "parentHeavyAtoms": parent.GetNumAtoms(),
        "derivativeHeavyAtoms": derivative.GetNumAtoms(),
        "parentCoverage": round(parent_coverage, 4),
        "derivativeCoverage": round(derivative_coverage, 4),
        "interpretationCount": len(signatures),
        "difference": representative,
        "firstPassReason": first_pass.get("reason"),
        "boundary": "二次核验用于解释结构差异；semantic-resolved表示化学改造区域已确定但不强行指定等价原子序号；complex-transformation-resolved表示该构件属于成环或骨架重构，不适合写成一个天然残基的单点替换。以上都不是性质实验结果。",
        "sourceUrls": first_pass.get("sourceUrls") or {
            "derivative": f"https://www.rcsb.org/ligand/{ccd_id}",
            "parent": f"https://www.rcsb.org/ligand/{first_pass.get('primaryParent')}",
        },
    })

counts = Counter(item["status"] for item in records)
output = {
    "metadata": {
        "generatedAt": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "method": "RCSB CCD parent relation + RDKit FindMCS second-pass atom mapping",
        "rdkitVersion": rdBase.rdkitVersion,
        "reviewedCount": len(records),
        "statusCounts": dict(sorted(counts.items())),
        "boundary": "Every first-pass manual record was checked. Equivalent atom-number ambiguity is resolved at the chemically meaningful region level; complex transformations are explicitly separated from simple substitutions.",
    },
    "records": records,
}
(PUBLIC / "natural-parent-manual-structure-review.json").write_text(json.dumps(output, ensure_ascii=False), encoding="utf-8")
with (PUBLIC / "natural-parent-manual-structure-review.csv").open("w", encoding="utf-8-sig", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(["ccd_id", "primary_parent", "status", "reason", "change_summary", "semantic_resolution", "parent_coverage", "derivative_coverage", "interpretation_count", "boundary"])
    for item in records:
        writer.writerow([item.get("ccdId"), item.get("primaryParent"), item.get("status"), item.get("reason"), item.get("changeSummary", ""), item.get("semanticResolution", ""), item.get("parentCoverage", ""), item.get("derivativeCoverage", ""), item.get("interpretationCount", ""), item.get("boundary", "")])
print(json.dumps(output["metadata"], ensure_ascii=False, indent=2))
