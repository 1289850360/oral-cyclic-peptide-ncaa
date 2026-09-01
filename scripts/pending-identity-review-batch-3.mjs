// Fixed-order source review of the next 50 previously unreviewed
// candidate-pending records. Records covered by batches 1-2 are skipped.
//
// This batch decides chemical identity only. A confirmed record is an
// independently defined non-proteinogenic amino acid or amino-acid derivative;
// confirmation does not imply peptide synthesis, cyclic-peptide use, property
// improvement, commercial availability or oral exposure.
const rows = [
  [1, "A33", "evidence-reviewed-residue", "RCSB and PubChem define 2-(carboxymethyl)-D-aspartic acid as a discrete amino-tricarboxylic acid; peptide use remains unreviewed.", "registered-free-amino-acid", 17749742],
  [2, "A3B", "evidence-reviewed-residue", "RCSB identifies D-vinylglycine and PubChem registers the exact stereochemical unsaturated amino acid.", "registered-free-amino-acid", 5287580],
  [3, "ABH", "evidence-reviewed-residue", "RCSB and PubChem identify 2(S)-amino-6-boronohexanoic acid, a discrete boron-containing amino-acid analogue.", "registered-free-amino-acid", 444965],
  [4, "ACZ", "evidence-reviewed-residue", "The released CCD defines cis-amiclenomycin as a single stereochemically specified amino acid with free amino and carboxyl functions.", "official-ccd-defined-amino-acid", null],
  [5, "AHY", "evidence-reviewed-residue", "RCSB and PubChem register (2S,3R)-3-amino-2-hydroxydecanoic acid, a discrete beta-amino-alpha-hydroxy acid.", "registered-free-amino-acid", 10899716],
  [6, "AKB", "evidence-reviewed-residue", "RCSB and PubChem identify 2-amino-3-ketobutyric acid as a discrete oxo amino acid; chemical instability does not negate identity.", "registered-free-amino-acid", 440033],
  [7, "AL0", "evidence-reviewed-residue", "RCSB identifies L-alanosine and PubChem registers it as a defined non-proteinogenic alanine derivative.", "registered-free-amino-acid", 22128],
  [8, "AM1", "evidence-reviewed-residue", "RCSB and PubChem identify ACPA as a discrete isoxazole-substituted amino acid with fixed S stereochemistry.", "registered-free-amino-acid", 4472504],
  [9, "AMB", "evidence-reviewed-residue", "RCSB and PubChem identify L-2-amino-4-methoxy-cis-but-3-enoic acid, a discrete unsaturated amino acid.", "registered-free-amino-acid", 5287671],
  [10, "AMQ", "evidence-reviewed-residue", "RCSB and PubChem identify AMPA as 3-(3-hydroxy-5-methylisoxazol-4-yl)-L-alanine, a defined non-proteinogenic amino acid.", "registered-free-amino-acid", 7000183],
  [11, "AQK", "evidence-reviewed-residue", "RCSB and PubChem define a discrete N-carboxymethyl ornithine-like amino acid; the extra carboxymethyl substituent does not create a peptide or multi-residue conjugate.", "registered-amino-acid-derivative", 22810356],
  [12, "AQQ", "special-reference", "RCSB entry 5OTA places this compound in opine-binding context; it contains an alanine-derived and ornithine-derived center joined through nitrogen and is retained as an opine/metabolic conjugate rather than one ordinary monomer.", "opine-multi-center-conjugate", 13748388, "https://www.rcsb.org/structure/5OTA"],
  [13, "AUU", "evidence-reviewed-residue", "RCSB and PubChem define a discrete conformationally constrained aminobicycloheptane carboxylic acid.", "registered-free-amino-acid", 13885838],
  [14, "AVG", "evidence-reviewed-residue", "RCSB and PubChem identify O-(2-aminoethyl)-L-homoserine, a discrete non-proteinogenic amino acid.", "registered-free-amino-acid", 446250],
  [15, "AVI", "evidence-reviewed-residue", "RCSB and PubChem identify N,N-dimethyl-L-histidine, a discrete histidine derivative; tertiary alpha nitrogen limits ordinary coupling but not identity.", "registered-amino-acid-derivative", 6971285],
  [16, "AVO", "evidence-reviewed-residue", "RCSB and PubChem define pyrrolidinohistidine as a single N-substituted histidine derivative with fixed stereochemistry.", "registered-amino-acid-derivative", 137348953],
  [17, "AXZ", "evidence-reviewed-residue", "RCSB defines a discrete serine-derived amino acid bearing a sulfur-linked aminoethylphenyl substituent and observes it with pyrrolysyl-tRNA synthetase; this confirms amino-acid-derivative identity, not peptide usability.", "ccd-defined-amino-acid-in-trna-synthetase-context", 137348960, "https://www.rcsb.org/structure/4CS4"],
  [18, "B56", "excluded-nonmonomer", "The amino group belongs to a pterin heterocycle; RCSB entry 3H26 identifies the compound as a pterin-based enzyme inhibitor rather than an amino-acid monomer.", "pterin-inhibitor-not-amino-acid", 325859, "https://www.rcsb.org/structure/3H26"],
  [19, "BDH", "special-reference", "L-beta-aspartylhistidine contains two amino acids joined by an amide bond and is explicitly studied as a dipeptide substrate in RCSB entry 1YBQ.", "dipeptide", 5287751, "https://www.rcsb.org/structure/1YBQ"],
  [20, "BET", "evidence-reviewed-residue", "RCSB and PubChem identify trimethylglycine (betaine), a discrete non-proteinogenic glycine derivative; its quaternary nitrogen prevents ordinary peptide coupling.", "registered-amino-acid-derivative", 248],
  [21, "BN1", "evidence-reviewed-residue", "RCSB and PubChem identify 2-Me-Tet-AMPA as a discrete isoxazole/tetrazole-substituted alanine analogue.", "registered-free-amino-acid", 3481675],
  [22, "BO8", "special-reference", "RCSB entry 2XDM identifies this as a peptidoglycan-mimetic boronate transition-state inhibitor containing an aminoacyl amide and a boronic-acid warhead, not one ordinary amino-acid monomer.", "peptidoglycan-mimetic-boronate-inhibitor", 46398804, "https://www.rcsb.org/structure/2XDM"],
  [23, "BQ7", "evidence-reviewed-residue", "RCSB and PubChem register the exact stereochemical difluorophenyl beta-amino acid as an independent compound.", "registered-free-amino-acid", 10799906],
  [24, "BRH", "evidence-reviewed-residue", "RCSB and PubChem identify Br-HIBO as a discrete bromo-isoxazole-substituted alanine analogue.", "registered-free-amino-acid", 57369840],
  [25, "BSC", "evidence-reviewed-residue", "RCSB and PubChem identify L-buthionine sulfoximine as a discrete sulfoximine-containing amino acid; biochemical inhibitor use does not erase identity.", "registered-free-amino-acid", 42580081],
  [26, "C5A", "evidence-reviewed-residue", "RCSB and PubChem identify (1S,3S)-ACPD as a discrete constrained aminocyclopentane dicarboxylic acid.", "registered-free-amino-acid", 6604704],
  [27, "C5B", "evidence-reviewed-residue", "RCSB and PubChem identify (1S,3R)-ACPD as the corresponding discrete stereoisomer.", "registered-free-amino-acid", 104766],
  [28, "CAL", "evidence-reviewed-residue", "RCSB and PubChem define a single statine-like gamma-amino hydroxy acid; the CCD peptide-like label supports a building-block role but does not prove general SPPS usability.", "registered-peptide-like-amino-acid", 6323244],
  [29, "CAV", "evidence-reviewed-residue", "RCSB and PubChem define a single dihydroxy statine-like gamma-amino acid with fixed stereochemistry.", "registered-peptide-like-amino-acid", 5287883],
  [30, "CBH", "evidence-reviewed-residue", "RCSB and PubChem identify S-(D-carboxybutyl)-L-homocysteine as a discrete sulfur-substituted amino acid.", "registered-free-amino-acid", 446994],
  [31, "CCW", "evidence-reviewed-residue", "RCSB and PubChem define a discrete methylsulfonyl-acetimidamido ornithine derivative retaining its alpha-amino-acid center.", "registered-free-amino-acid", 91754245],
  [32, "CE2", "evidence-reviewed-residue", "RCSB and PubChem identify (S)-ATPA as a discrete isoxazole-substituted alanine analogue.", "registered-free-amino-acid", 131704239],
  [33, "CFU", "excluded-nonmonomer", "RCSB shows this component covalently linked in a cefapirin complex; its thiazine/aldehyde structure is an antibiotic-derived reaction product rather than an independent amino-acid monomer.", "covalent-cephalosporin-reaction-product", 137349091, "https://www.rcsb.org/structure/4R3J"],
  [34, "CL5", "excluded-nonmonomer", "RCSB explicitly lists N-(3-oxopropyl)glycine as a fragment of clavulanic acid; it is retained for traceability but excluded from the independent NCAA set.", "clavulanic-acid-fragment", 49866800, "https://www.rcsb.org/ligand/CL5"],
  [35, "CMA", "evidence-reviewed-residue", "RCSB and PubChem identify N2-(carboxyethyl)-L-arginine as a discrete N-substituted arginine derivative.", "registered-amino-acid-derivative", 446475],
  [36, "CPV", "evidence-reviewed-residue", "RCSB and PubChem define a single conformationally rich statine-like gamma-amino hydroxy acid.", "registered-free-amino-acid", 5287976],
  [37, "CPW", "evidence-reviewed-residue", "RCSB and PubChem register a discrete cyclopentapyrimidinedione-substituted L-alanine analogue.", "registered-free-amino-acid", 657004],
  [38, "CRN", "evidence-reviewed-residue", "RCSB and PubChem identify creatine as N-amidino-N-methylglycine, a discrete non-proteinogenic amino-acid derivative; it is not assumed to be peptide-couplable.", "registered-amino-acid-derivative", 586],
  [39, "CUW", "evidence-reviewed-residue", "RCSB and PubChem identify 3-hydroxy-L-lysine, a defined non-proteinogenic lysine derivative.", "registered-free-amino-acid", 11062699],
  [40, "CXA", "evidence-reviewed-residue", "RCSB and PubChem identify N-sulfamoyl-L-phenylalanine as a discrete phenylalanine derivative; N-sulfamoylation may limit coupling.", "registered-amino-acid-derivative", 446382],
  [41, "D20", "evidence-reviewed-residue", "RCSB and PubChem define a discrete N5-substituted L-ornithine retaining its intact alpha-amino-acid center.", "registered-free-amino-acid", 11413609],
  [42, "D8D", "evidence-reviewed-residue", "RCSB and PubChem register a single N-substituted L-proline derivative; the appended amide makes it peptidomimetic but does not create a second amino-acid residue.", "registered-amino-acid-derivative", 77059047],
  [43, "DA3", "evidence-reviewed-residue", "RCSB and PubChem identify a discrete stereochemically resolved isoxazoline-substituted amino dicarboxylic acid.", "registered-free-amino-acid", 5288021],
  [44, "DDO", "evidence-reviewed-residue", "RCSB and PubChem identify 6-hydroxy-D-norleucine, a defined D-amino acid.", "registered-free-amino-acid", 38988837],
  [45, "DHH", "evidence-reviewed-residue", "RCSB and PubChem identify (S)-2-amino-7,7-dihydroxyheptanoic acid as a discrete non-proteinogenic amino acid.", "registered-free-amino-acid", 5288058],
  [46, "DMO", "evidence-reviewed-residue", "RCSB and PubChem identify alpha-difluoromethylornithine (eflornithine), a discrete non-proteinogenic ornithine analogue.", "registered-free-amino-acid", 6992039],
  [47, "DTE", "evidence-reviewed-residue", "RCSB and PubChem identify 7-chloro-D-tryptophan, a defined halogenated D-amino acid.", "registered-free-amino-acid", 86310855],
  [48, "DY8", "evidence-reviewed-residue", "RCSB and PubChem define morpholinohistidine as a single N-substituted histidine derivative with fixed stereochemistry.", "registered-amino-acid-derivative", 137349215],
  [49, "E42", "evidence-reviewed-residue", "RCSB and PubChem register the exact R stereoisomer of a hydroxybiphenyl-substituted amino acid.", "registered-free-amino-acid", 102515535],
  [50, "E79", "excluded-nonmonomer", "RCSB entry 6L6W identifies this compound as an enzyme-bound ScoE reaction intermediate; it is not established as an independently introduced amino-acid monomer.", "enzyme-reaction-intermediate", 146018672, "https://www.rcsb.org/structure/6L6W"],
];

export const pendingIdentityReviewBatch3 = rows.map(([order, ccdId, componentClass, conclusion, evidenceKind, pubchemCid, supportingUrl]) => ({
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

export const pendingIdentityReviewBatch3ByCcd = new Map(
  pendingIdentityReviewBatch3.map((record) => [record.ccdId, record]),
);
