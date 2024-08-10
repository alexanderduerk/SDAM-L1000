const { type } = require('express/lib/response');

let typemapper;

// Create a lookup table of the cellsinfo columns and their types
const cellinfotypes = {
  cell_name: 'text',
  cellosaurus_id: 'text',
  donor_age: 'number',
  donor_age_death: 'number',
  donor_disease_onset: 'number',
  doubling_time: 'number',
  growth_medium: 'text',
  cell_type: 'text',
  donor_ethnicity: 'text',
  donor_sex: 'text',
  donor_tumor_phase: 'text',
  cell_lineage: 'text',
  primary_disease: 'text',
  subtype_disease: 'text',
  provider_name: 'text',
  growth_pattern: 'text',
};

const perturbagentypes = {
  pert_name: 'text',
  cmap_name: 'text',
  gene_target: 'text',
  moa: 'text',
  canonical_smiles: 'text',
  inchi_key: 'text',
  compound_aliases: 'text',
};

const genetypes = {
  entrez_id: 'number',
  gene_symbol: 'text',
  ensembl_id: 'text',
  gene_title: 'text',
  gene_type: 'text',
  src: 'text',
  feature_space: 'text',
};

const siginfotypes = {
  sig_name: 'text',
  pert_name: 'text',
  cmap_name: 'text',
  pert_type: 'text',
  cell_name: 'text',
  bead_batch: 'text',
  pert_dose: 'text',
  pert_time: 'text',
  nsamples: 'number',
  cc_q75: 'number',
  ss_ngene: 'number',
  tas: 'number',
  pct_self_rank_q25: 'number',
  wt: 'text',
  median_recall_rank_spearman: 'number',
  median_recall_rank_wtcs_50: 'number',
  median_recall_score_spearman: 'number',
  median_recall_score_wtcs_50: 'number',
  batch_effect_tstat: 'number',
  batch_effect_tstat_pct: 'number',
  is_hiq: 'boolean',
  qc_pass: 'boolean',
  det_wells: 'text',
  det_plates: 'text',
  distil_ids: 'text',
  project_code: 'text',
};

function isTextField(field) {
  const fieldType = typemapper[field];
  console.log(typemapper[field]);
  return fieldType === 'text';
}

function escapeValue(value, isText) {
  if (isText) {
    // Implement proper escaping for text values
    return `'${value}'`;
  }
  return value;
}

function translateSearchTripletToSQL(triplet) {
  const isText = isTextField(triplet.field);
  const escapedVal = escapeValue(triplet.val, isText);
  switch (triplet.op) {
    case 'contains':
      return `${triplet.field} LIKE '%${triplet.val}%'`;
    case 'startswith':
      return `${triplet.field} LIKE '${triplet.val}%'`;
    case 'endswith':
      return `${triplet.field} LIKE '%${triplet.val}'`;
    case '=': // or any other default operator
      return `${triplet.field} = ${escapedVal}`;
    case '!=':
      return `${triplet.field} != ${escapedVal}`;
    case '>':
      return `${triplet.field} > ${escapedVal}`;
    case '<':
      return `${triplet.field} < ${escapedVal}`;
    case '>=':
      return `${triplet.field} >= ${escapedVal}`;
    case '<=':
      return `${triplet.field} <= ${escapedVal}`;
    case 'in':
      return `${triplet.field} IN (${escapedVal})`;
    case 'notin':
      return `${triplet.field} NOT IN (${escapedVal})`;
    default:
      throw new Error(`Unsupported operator: ${triplet.op}`);
  }
}

/**
 * Recursively translates a search argument to SQL.
 *
 * @param {object} searchArg - The search argument to translate.
 * @return {string} The translated SQL string.
 */
function translateToSQLRecursive(searchArg) {
  console.log('Received searchArg:', JSON.stringify(searchArg)); // Log to check structure

  // Check if searchArg.descendants is an array
  if (
    Array.isArray(searchArg.descendants) &&
    searchArg.descendants.length > 0
  ) {
    const descSqlArr = searchArg.descendants.map((descendant) => {
      console.log('Processing descendant:', JSON.stringify(descendant)); // Log each descendant

      if (Array.isArray(descendant.descendants)) {
        return translateToSQLRecursive(descendant);
      }

      if (
        descendant.field &&
        descendant.op &&
        (descendant.value || descendant.val)
      ) {
        return translateSearchTripletToSQL(descendant);
      } else {
        console.error('Invalid descendant:', descendant);
        return ''; // Handle invalid descendant
      }
    });

    // Join the SQL parts with the operator specified in searchArg
    return `( ${descSqlArr.filter(Boolean).join(` ${searchArg.op || 'AND'} `)} )`;
  }

  // Check if searchArg is a valid search triplet
  if (searchArg.field && searchArg.op && (searchArg.value || searchArg.val)) {
    return translateSearchTripletToSQL(searchArg);
  }

  console.error('Invalid search argument:', searchArg);
  return ''; // Or throw an error
}

// Translate the search argument to SQL
function translateToSQL(searchArg, table) {
  let header;
  // Create a header (for every cellname the same)
  if (table === 'cells') {
    header = `SELECT cell_name AS 'Name', cellosaurus_id AS 'Cellosaurus ID', donor_age AS 'Donor Age', doubling_time AS 'Doubling time', growth_medium AS 'Growth Medium', cell_type AS 'Cell Type', donor_ethnicity AS 'Donor Ethnicity', donor_sex AS 'Donor Sex', donor_tumor_phase AS 'Donor Tumor Phase', cell_lineage AS 'Cell Lineage', primary_disease AS 'Primary Disease', subtype_disease AS 'Subtype Disease', provider_name AS 'Provider Name', growth_pattern AS 'Growth Pattern' FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'perturbagens') {
    header = `SELECT pert_name AS 'Name', cmap_name AS 'compound', gene_target AS 'Target', moa AS 'mechanism', canonical_smiles AS 'SMILE', inchi_key AS 'identifier', compound_aliases AS 'compound alternative name' FROM ${table} WHERE `;
    typemapper = perturbagentypes;
  }
  if (table === 'genes') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'signature_infos') {
    header = `SELECT sig_name AS 'Signature Name', pert_name AS 'compound', cmap_name AS 'Connectivity Map', cell_name AS 'Cells', bead_batch AS 'Batch Nr.', pert_dose AS 'Dosage', pert_time AS 'Perturbation period', nsamples AS 'Number of Samples', cc_q75 AS 'landmark space', ss_ngene AS 'Number of Genes', tas AS 'Transcriptional activity score', pct_self_rank_q25 AS 'Self connectivity', wt AS 'Wheight list', median_recall_rank_spearman AS 'MRR1', median_recall_rank_wtcs_50 as 'MRR50', median_recall_score_spearman AS 'MRS1', median_recall_score_wtcs_50 as 'MRS50', batch_effect_tstat AS 'Batch effect', batch_effect_tstat_pct AS 'Batch effect %', is_hiq AS 'High Quality', qc_pass AS 'Quality control pass', det_wells AS 'Detection wells', det_plates AS 'Detected plates', distil_ids AS 'Replicate IDs', project_code AS 'Project code' FROM ${table} WHERE `;
    typemapper = siginfotypes;
  }

  // Use translateToSQLRecursive to handle nested queries
  const searchSql = translateToSQLRecursive(searchArg);

  let orderClause = '';
  if (searchArg.field) {
    orderClause = ` ORDER BY ${searchArg.field} ${searchArg.order || 'ASC'}`;
  }
  // Allow for pagination args if provided in the search
  if (searchArg.offset !== undefined && searchArg.limit !== undefined) {
    return `${header} ${searchSql}${orderClause} LIMIT ${searchArg.limit} OFFSET ${searchArg.offset}`;
  }

  // Combine both
  return `${header} ${searchSql}${orderClause}`;
}

module.exports = { translateToSQL };
