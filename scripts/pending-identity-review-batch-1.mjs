// Fixed-order source review of candidate-pending records 1-50 as they appeared
// after the 2026-09-01 resolution of the eight PDB-occurrence records.
//
// This batch decides chemical identity only. A confirmed record is an
// independently defined non-proteinogenic amino acid or amino-acid derivative;
// confirmation does not imply peptide synthesis, cyclic-peptide use, property
// improvement, commercial availability or oral exposure.
const rows = [
  [1, "8AY", "evidence-reviewed-residue", "wwPDB assigns ALA as the nonstandard parent; the released stereochemical structure is an L-alanine side-chain analogue.", "official-ccd-parent", null],
  [2, "A1AV8", "evidence-reviewed-residue", "wwPDB assigns GLY as parent and PubChem registers the independent compound N-allylglycine.", "official-ccd-parent", 76651],
  [3, "A1JJC", "evidence-reviewed-residue", "wwPDB assigns GLY as parent and PubChem registers N-phenylglycine as an independent compound.", "official-ccd-parent", 66025],
  [4, "AVJ", "evidence-reviewed-residue", "wwPDB assigns HIS as parent; hercynine is a registered trimethylhistidine, i.e. a non-proteinogenic histidine derivative.", "official-ccd-parent", 440727],
  [5, "H1D", "evidence-reviewed-residue", "wwPDB assigns MET as parent and preserves the complete free alpha-amino-acid center; this confirms methionine-derivative identity, not peptide usability.", "official-ccd-parent", 6852195],
  [6, "HYI", "evidence-reviewed-residue", "wwPDB assigns MET as parent and preserves the complete free alpha-amino-acid center; this stereoisomer is a defined methionine derivative.", "official-ccd-parent", 6852192],
  [7, "OO0", "evidence-reviewed-residue", "wwPDB assigns CYS as parent; alliin is a defined S-substituted cysteine/non-proteinogenic amino acid.", "official-ccd-parent", 51399533],
  [8, "SDB", "evidence-reviewed-residue", "wwPDB assigns SER as parent and records a discrete stereochemical serine-derived amino acid.", "official-ccd-parent", 49867636],
  [9, "00M", "evidence-reviewed-residue", "The official CCD and PubChem records define a discrete beta-amino-alpha-hydroxy carboxylic acid with fixed stereochemistry (a statine-like non-proteinogenic amino acid).", "registered-free-amino-acid", 3059475],
  [10, "00U", "special-reference", "wwPDB BIRD uses 00U as a bicyclic peptidomimetic subcomponent of thrombin inhibitors, not as an ordinary standalone amino-acid monomer.", "bird-peptidomimetic-subcomponent", null, "https://pdbj.org/bird/summary/PRD_000617"],
  [11, "00V", "special-reference", "wwPDB BIRD uses 00V as the hydroxyethylene-like middle unit of the thrombin inhibitor MOL-106; retain as a peptidomimetic building-block reference.", "bird-peptidomimetic-subcomponent", null, "https://pdbj.org/bird/summary/PRD_000617"],
  [12, "00W", "special-reference", "wwPDB BIRD uses 00W as a hydroxyethylene/arginine-mimetic unit of thrombin inhibitor MOL-126 rather than an ordinary amino-acid monomer.", "bird-peptidomimetic-subcomponent", 52941581, "https://pdbj.org/bird/summary/PRD_000618"],
  [13, "021", "evidence-reviewed-residue", "The CCD/PubChem identity is the discrete secondary amino acid N-cyclopentylglycine; identity is confirmed although peptide coupling remains unreviewed.", "registered-free-amino-acid", 314101],
  [14, "0TF", "special-reference", "N6-D-ornithyl-L-lysine contains two amino-acid units joined through a lysine-side-chain amide and is a pyrrolysine-biosynthesis intermediate, not one ordinary monomer.", "multi-residue-biosynthetic-intermediate", 51055216, "https://www.rcsb.org/structure/4J49"],
  [15, "0XW", "evidence-reviewed-residue", "Betonicine is a registered hydroxyproline betaine/non-proteinogenic amino acid; its quaternary nitrogen limits peptide coupling but not chemical identity.", "registered-free-amino-acid", 164642],
  [16, "108", "evidence-reviewed-residue", "CCD and PubChem define a discrete N-substituted alanine derivative with one carboxylate and a secondary amino center.", "registered-free-amino-acid", 135488879],
  [17, "109", "evidence-reviewed-residue", "CCD and PubChem define the positional isomer as a discrete N-substituted alanine derivative.", "registered-free-amino-acid", 5496536],
  [18, "11C", "evidence-reviewed-residue", "PubChem identifies the exact stereoisomer as D-alpha-aminoadipic acid, a well-defined non-proteinogenic amino acid.", "registered-free-amino-acid", 165627],
  [19, "12N", "evidence-reviewed-residue", "CCD and PubChem register the stereochemically defined beta-amino-alpha-hydroxy acid as an independent compound.", "registered-free-amino-acid", 59318585],
  [20, "1J1", "evidence-reviewed-residue", "Pyrroline-carboxy-lysine is an isolated lysine-derived amino-acid intermediate bound by PylD during pyrrolysine biosynthesis; it is not a post-expression protein adduct.", "amino-acid-biosynthetic-intermediate", 90657466, "https://www.rcsb.org/structure/4J4H"],
  [21, "1KJ", "evidence-reviewed-residue", "CCD/PubChem define a discrete modified L-ornithine retaining the free alpha-amino and carboxyl groups.", "registered-free-amino-acid", 11820231],
  [22, "1N4", "evidence-reviewed-residue", "CCD/PubChem define a discrete stereochemical aminoacetic-acid analogue with a free amino and carboxyl group.", "registered-free-amino-acid", 24905522],
  [23, "1RT", "excluded-nonmonomer", "PubChem identifies this compound as 5-carboxycytosine; the amino group is on a pyrimidine nucleobase and it is not an amino acid.", "non-amino-acid-heterocycle", 77213],
  [24, "1X0", "evidence-reviewed-residue", "CCD/PubChem define (S)-2-aminooct-7-enoic acid, a discrete unsaturated alpha-amino acid.", "registered-free-amino-acid", 53302046],
  [25, "1Y2", "evidence-reviewed-residue", "CCD/PubChem define a stereochemically resolved difluorocyclohexylglycine analogue.", "registered-free-amino-acid", 68044202],
  [26, "22N", "excluded-nonmonomer", "The cyclohexene carboxylate with acetamide and pentan-3-yloxy substituents is the oseltamivir-carboxylate drug scaffold, not an amino-acid monomer.", "drug-scaffold-not-amino-acid", 40640966],
  [27, "22P", "candidate-pending", "The CCD structure is amino-acid-like, but no independent registry or source was found in this pass that establishes it as a named non-proteinogenic amino acid rather than an inhibitor fragment.", "insufficient-independent-source", null],
  [28, "247", "evidence-reviewed-residue", "PubChem registers the exact stereochemical difluoro beta-amino-acid analogue with free amino and carboxyl groups.", "registered-free-amino-acid", 24764399],
  [29, "26P", "evidence-reviewed-residue", "PubChem identifies (S)-2-amino-6-oxoheptanedioic acid, a discrete amino-dicarboxylic acid/metabolic amino-acid analogue.", "registered-free-amino-acid", 194695],
  [30, "296", "evidence-reviewed-residue", "PubChem registers the exact (3R)-difluoro beta-amino acid and the CCD stereochemistry agrees.", "registered-free-amino-acid", 11736387],
  [31, "2A0", "special-reference", "The PEPTIDE-LIKE CCD joins two long-chain amino centers through a secondary amine and functions as a peptidomimetic unit; it is not a conventional single amino-acid monomer.", "peptidomimetic-multi-center", null],
  [32, "2B8", "evidence-reviewed-residue", "CCD/PubChem define an independent gamma-amino carboxylic-acid analogue with fixed stereochemistry; peptide usability remains unreviewed.", "registered-free-amino-acid", 76871913],
  [33, "2BH", "evidence-reviewed-residue", "PubChem identifies dehydro-(S)-amino-6-boronohexanoic acid, a discrete boron-containing non-proteinogenic amino acid.", "registered-free-amino-acid", 657085],
  [34, "2C0", "evidence-reviewed-residue", "PubChem identifies the exact stereoisomer as arbaclofen, a non-proteinogenic gamma-amino acid; drug status does not erase amino-acid identity.", "registered-free-amino-acid", 44602],
  [35, "2CG", "evidence-reviewed-residue", "PubChem identifies DCG-IV as a stereochemically defined cyclopropyl glutamate/amino-acid analogue.", "registered-free-amino-acid", 5310979],
  [36, "2K8", "excluded-nonmonomer", "The structure is 6-carboxy-tetrahydropterin: its exocyclic amino group belongs to a pterin heterocycle, so it is a cofactor-like metabolite rather than an amino acid.", "non-amino-acid-pterin", 75815422],
  [37, "2KJ", "evidence-reviewed-residue", "CCD/PubChem define a discrete N5-ethoxyamidino L-ornithine with intact alpha-amino-acid functionality.", "registered-free-amino-acid", 71307948],
  [38, "2MM", "evidence-reviewed-residue", "PubChem identifies N,N-dimethyl-L-methionine, a discrete non-proteinogenic methionine derivative; tertiary N limits coupling but not identity.", "registered-free-amino-acid", 3246177],
  [39, "2NP", "evidence-reviewed-residue", "PubChem identifies L-2-amino-6-methylenepimelic acid, a discrete non-proteinogenic amino-dicarboxylic acid.", "registered-free-amino-acid", 445478],
  [40, "2QE", "evidence-reviewed-residue", "CCD/PubChem define a stereochemically resolved substituted L-glutamic acid.", "registered-free-amino-acid", 24905704],
  [41, "2SU", "evidence-reviewed-residue", "PubChem identifies alpha-(fluoromethyl)-D-tryptophan, a discrete non-proteinogenic tryptophan analogue.", "registered-free-amino-acid", 10399204],
  [42, "35K", "evidence-reviewed-residue", "CCD/PubChem define a discrete quinoxalinedione-substituted alpha-amino acid with fixed S stereochemistry.", "registered-free-amino-acid", 137348123],
  [43, "3DJ", "evidence-reviewed-residue", "PubChem identifies 3-hydroxy-L-kynurenine, a defined non-proteinogenic amino-acid metabolite.", "registered-free-amino-acid", 11811],
  [44, "3ER", "evidence-reviewed-residue", "CCD/PubChem define a discrete N-sulfonyl chlorophenylglycine derivative; identity is confirmed although its protected nitrogen may prevent ordinary peptide coupling.", "registered-free-amino-acid", 93734253],
  [45, "3FK", "evidence-reviewed-residue", "CCD/PubChem define a discrete dimethylamino dichlorophenylglycine derivative; tertiary N limits coupling but not amino-acid identity.", "registered-free-amino-acid", 93304759],
  [46, "3GC", "special-reference", "Gamma-glutamylcysteine contains glutamate and cysteine joined by an amide bond and is a dipeptide, not one non-natural amino acid.", "dipeptide", 123938],
  [47, "3GE", "excluded-nonmonomer", "RCSB records this as the covalently linked reaction product in beta-lactamase exposed to a penicillanic-acid sulfone; it is not an independently introduced amino acid.", "covalent-drug-reaction-product", 137348145, "https://www.rcsb.org/structure/4R3B"],
  [48, "3K0", "evidence-reviewed-residue", "CCD/PubChem define N-sulfamoyl-L-glutamic acid as a discrete glutamate derivative.", "registered-free-amino-acid", 73212792],
  [49, "3KJ", "evidence-reviewed-residue", "CCD/PubChem define a discrete N5-hydroxy-N-methylamidino L-ornithine with intact alpha-amino-acid functionality.", "registered-free-amino-acid", 10058729],
  [50, "3RG", "evidence-reviewed-residue", "PubChem identifies N-(2-carboxyphenyl)glycine, a discrete N-substituted glycine derivative.", "registered-free-amino-acid", 69161],
];

export const pendingIdentityReviewBatch1 = rows.map(([order, ccdId, componentClass, conclusion, evidenceKind, pubchemCid, supportingUrl]) => ({
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

export const pendingIdentityReviewBatch1ByCcd = new Map(
  pendingIdentityReviewBatch1.map((record) => [record.ccdId, record]),
);
