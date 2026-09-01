// Fixed-order source review of the next 50 previously unreviewed
// candidate-pending records. Records already covered by batch 1 are skipped.
//
// This batch decides chemical identity only. A confirmed record is an
// independently defined non-proteinogenic amino acid or amino-acid derivative;
// confirmation does not imply peptide synthesis, cyclic-peptide use, property
// improvement, commercial availability or oral exposure.
const rows = [
  [1, "3V5", "excluded-nonmonomer", "RCSB identifies this as the open form of an olivanic-acid analogue; it is a beta-lactam-related opened product rather than an independently defined amino-acid monomer.", "opened-beta-lactam-product", 137348177],
  [2, "3ZA", "evidence-reviewed-residue", "CCD and PubChem register a discrete stereochemically defined glutamic-acid derivative with an intact amino-acid center.", "registered-free-amino-acid", 70789291],
  [3, "40F", "evidence-reviewed-residue", "CCD and PubChem define a discrete aminobicyclohexane dicarboxylic acid; its constrained amino-acid identity is clear although peptide use remains unreviewed.", "registered-free-amino-acid", 213056],
  [4, "40H", "evidence-reviewed-residue", "CCD and PubChem define a discrete amino-spirobicyclic dicarboxylic acid and preserve an independently identifiable amino-acid scaffold.", "registered-free-amino-acid", 71695763],
  [5, "42B", "evidence-reviewed-residue", "PubChem registers 4-amino-2-hydroxybutanoic acid as a discrete hydroxy gamma-amino acid.", "registered-free-amino-acid", 5287507],
  [6, "4E5", "evidence-reviewed-residue", "CCD and PubChem register the exact carboxy-hydroxyphenyl proline derivative as an independent amino acid.", "registered-free-amino-acid", 78320621],
  [7, "4E7", "evidence-reviewed-residue", "CCD and PubChem register the exact carboxyphenyl-propyl proline derivative as an independent amino acid.", "registered-free-amino-acid", 91826024],
  [8, "4JK", "evidence-reviewed-residue", "The CCD/PubChem structure is a discrete amidino-substituted ornithine-like amino acid with intact alpha-amino and carboxyl groups.", "registered-free-amino-acid", 91754246],
  [9, "4KJ", "evidence-reviewed-residue", "The released CCD structure defines a single methoxy/methyl-carbamimidoyl norvaline derivative with an intact alpha-amino-acid center; no peptide-use claim is made.", "official-ccd-defined-amino-acid", null],
  [10, "52A", "evidence-reviewed-residue", "CCD and PubChem define a discrete aminopyrrolidine dicarboxylic acid with fixed stereochemistry.", "registered-free-amino-acid", 5310984],
  [11, "52Q", "evidence-reviewed-residue", "PubChem identifies LY-2812223 as a discrete stereochemically defined amino-acid analogue; pharmacological use does not erase its chemical identity.", "registered-free-amino-acid", 53240406],
  [12, "55P", "evidence-reviewed-residue", "The CCD structure defines a single amino-methyl-phenylpentanoic acid with free amino and carboxyl functions; independent peptide use remains unreviewed.", "official-ccd-defined-amino-acid", null],
  [13, "5AR", "evidence-reviewed-residue", "The CCD structure defines a single oxadiazole-substituted diamino carboxylic acid rather than a multi-residue conjugate.", "official-ccd-defined-amino-acid", null],
  [14, "5DM", "special-reference", "The structure contains two amino-acid-like centers joined through a secondary amine and is best retained as a peptidomimetic multi-center construct, not one ordinary monomer.", "peptidomimetic-multi-center", null],
  [15, "5DZ", "evidence-reviewed-residue", "CCD and PubChem register the pyrazole-substituted amino acid as an independent compound with fixed stereochemistry.", "registered-free-amino-acid", 121596321],
  [16, "5E0", "evidence-reviewed-residue", "CCD and PubChem register the corresponding pyrazole amino-acid stereoisomer as an independent compound.", "registered-free-amino-acid", 137348343],
  [17, "5KC", "evidence-reviewed-residue", "CCD and PubChem define a discrete substituted aminobutanoic acid with an independently identifiable amino-acid scaffold.", "registered-free-amino-acid", 162625327],
  [18, "5KJ", "evidence-reviewed-residue", "CCD and PubChem define a discrete modified ornithine retaining its alpha-amino-acid functionality.", "registered-free-amino-acid", 24787824],
  [19, "5OY", "evidence-reviewed-residue", "PubChem identifies 5-phosphono-L-norvaline, a discrete phosphono-containing non-proteinogenic amino acid.", "registered-free-amino-acid", 1617110],
  [20, "5XR", "evidence-reviewed-residue", "CCD and PubChem register the exact N-substituted aspartic-acid derivative as an independent compound; its reactive side chain and peptide usability require separate review.", "registered-amino-acid-derivative", 138857388],
  [21, "64X", "evidence-reviewed-residue", "PubChem identifies 5-bromo-L-tryptophan, a defined halogenated non-proteinogenic tryptophan residue.", "registered-free-amino-acid", 644329],
  [22, "6KJ", "evidence-reviewed-residue", "CCD and PubChem define a discrete carbamimidoyl-norvaline derivative; the tert-butoxy substituent may be protecting-group-like but the amino-acid identity is clear.", "registered-amino-acid-derivative", 137348476],
  [23, "720", "evidence-reviewed-residue", "PubChem identifies UK 396082 as a discrete amino-acid analogue with a free carboxylate and amino-acid center.", "registered-free-amino-acid", 11241908],
  [24, "76I", "evidence-reviewed-residue", "CCD and PubChem register the exact hydroxy N-substituted glycine-like compound as a discrete amino-acid derivative; coupling suitability is not inferred.", "registered-amino-acid-derivative", 87438397],
  [25, "78U", "evidence-reviewed-residue", "PubChem identifies beta-methyl-L-tryptophan, a defined non-proteinogenic tryptophan analogue.", "registered-free-amino-acid", 10104793],
  [26, "7B0", "evidence-reviewed-residue", "CCD and PubChem define N-sulfamoyl lysine as a discrete lysine derivative with intact alpha-amino-acid functionality.", "registered-free-amino-acid", 87901223],
  [27, "7UC", "evidence-reviewed-residue", "CCD and PubChem register a discrete N-carboxymethyl beta-alanine-like amino acid.", "registered-free-amino-acid", 127021030],
  [28, "83V", "evidence-reviewed-residue", "PubChem identifies 4-amino-6-phenylhexanoic acid, a discrete gamma-amino-acid analogue.", "registered-free-amino-acid", 66644697],
  [29, "8DX", "special-reference", "8-Deoxy-neodysiherbaine A is a complex natural amino-sugar/glutamate-receptor agonist; retain it as a natural-product amino-acid-like scaffold rather than an ordinary peptide monomer.", "complex-natural-product-amino-acid", 11623226, "https://www.rcsb.org/structure/3FVK"],
  [30, "8QA", "special-reference", "The CCD structure is a peptide-like thioacyl-lysine construct containing more than one functional building-block role, not one ordinary free amino-acid monomer.", "peptide-like-lysine-construct", null],
  [31, "8X9", "evidence-reviewed-residue", "PubChem identifies mirogabalin as a discrete conformationally constrained gamma-amino acid; drug status does not erase amino-acid identity.", "registered-free-amino-acid", 59509752],
  [32, "9DX", "special-reference", "This neodysiherbaine-related complex amino-sugar is a natural-product glutamate-receptor agonist and is retained as a special scaffold, not an ordinary peptide monomer.", "complex-natural-product-amino-acid", 11572629],
  [33, "A1A46", "excluded-nonmonomer", "RCSB entry 9DHN identifies this CCD component as a trapped PIsnA imine reaction intermediate formed from an amino acid and a sugar-derived substrate, not an independent amino-acid monomer.", "enzyme-reaction-intermediate", 176452081, "https://www.rcsb.org/structure/9DHN"],
  [34, "A1A8K", "evidence-reviewed-residue", "CCD and PubChem register a discrete N-heterocycle-substituted D-hydroxyproline derivative; its capped nitrogen limits ordinary coupling but not chemical identity.", "registered-amino-acid-derivative", 172472216],
  [35, "A1AKT", "evidence-reviewed-residue", "CCD and PubChem register a discrete N-heterocycle-substituted D-valine derivative.", "registered-amino-acid-derivative", 122050876],
  [36, "A1AKU", "evidence-reviewed-residue", "The CCD structure defines the corresponding stereochemically resolved N-heterocycle D-hydroxyproline derivative as a single amino-acid compound.", "official-ccd-defined-amino-acid", null],
  [37, "A1AKV", "evidence-reviewed-residue", "The CCD structure defines a stereochemically resolved N-heterocycle L-alanine derivative as a single amino-acid compound.", "official-ccd-defined-amino-acid", null],
  [38, "A1AUG", "evidence-reviewed-residue", "PubChem identifies 5-oxo-L-norvaline, a defined non-proteinogenic amino-acid metabolite.", "registered-free-amino-acid", 193305],
  [39, "A1CIL", "evidence-reviewed-residue", "PubChem identifies (2R)-2-amino-3-methylbut-3-enoic acid, a discrete unsaturated non-proteinogenic alpha-amino acid.", "registered-free-amino-acid", 11062346],
  [40, "A1IFF", "evidence-reviewed-residue", "PubChem registers (R)-4-amino-3-hydroxybutanoic acid as a discrete hydroxy gamma-amino acid.", "registered-free-amino-acid", 2733883],
  [41, "A1IFH", "evidence-reviewed-residue", "PubChem registers (S)-4-amino-3-hydroxybutanoic acid as the corresponding discrete stereoisomer.", "registered-free-amino-acid", 6971280],
  [42, "A1ILR", "evidence-reviewed-residue", "The CCD structure defines a single stereochemically resolved D-amino acid bearing a thiophene-carboxamide side chain.", "official-ccd-defined-amino-acid", null],
  [43, "A1IME", "evidence-reviewed-residue", "PubChem registers the exact thienopyridine-carboxamide-substituted D-amino acid as an independent compound.", "registered-free-amino-acid", 155458066],
  [44, "A1IT0", "evidence-reviewed-residue", "PubChem identifies N-methylsulfonyl-1-aminocyclohexane-1-carboxylic acid, a discrete constrained amino-acid derivative; N-sulfonylation may limit coupling.", "registered-amino-acid-derivative", 7446991],
  [45, "A1JEV", "special-reference", "The CCD component is a proline-containing amide/peptidomimetic compound with an appended amino-acid-like unit, not one ordinary free amino-acid monomer.", "peptidomimetic-multi-center", null],
  [46, "A1JF4", "evidence-reviewed-residue", "The CCD structure defines a discrete heterocycle-substituted beta-alanine derivative with one amino-acid scaffold.", "official-ccd-defined-amino-acid", null],
  [47, "A1JHR", "special-reference", "The chemical name explicitly identifies Gly-Ser-epsilon-Lys, a multi-residue conjugate; retain it as a special peptide reference rather than one amino acid.", "multi-residue-conjugate", 176490110],
  [48, "A1JSL", "evidence-reviewed-residue", "PubChem registers the exact sulfonamide beta-alanine derivative as a discrete amino-acid compound; its protected nitrogen may limit coupling.", "registered-amino-acid-derivative", 1242537],
  [49, "A1L7T", "evidence-reviewed-residue", "PubChem identifies 3-amino-3-methyl-2-hydroxybutanoic acid, a discrete beta-amino-alpha-hydroxy acid.", "registered-free-amino-acid", 15198454],
  [50, "A1LWG", "evidence-reviewed-residue", "PubChem registers N-tryptamine alanine as a discrete N-substituted alanine derivative.", "registered-amino-acid-derivative", 65813780],
];

export const pendingIdentityReviewBatch2 = rows.map(([order, ccdId, componentClass, conclusion, evidenceKind, pubchemCid, supportingUrl]) => ({
  order,
  ccdId,
  componentClass,
  conclusion,
  evidenceKind,
  ccdUrl: `https://www.rcsb.org/ligand/${ccdId}`,
  pubchemCid: pubchemCid ?? null,
  pubchemUrl: pubchemCid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemCid}` : null,
  supportingUrl: supportingUrl ?? null,
  reviewScope: "Chemical identity only; no automatic claim of peptide synthesis, cyclic-peptide use, property improvement, commercial availability or oral exposure.",
  auditedAt: "2026-09-01",
}));

export const pendingIdentityReviewBatch2ByCcd = new Map(
  pendingIdentityReviewBatch2.map((record) => [record.ccdId, record]),
);
