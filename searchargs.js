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

function translateToSQLRecursive(searchArg) {
  if (searchArg.descendants) {
    // Translate each descendant recursively
    const descSqlArr = searchArg.descendants.map(translateToSQLRecursive);

    // Combine using the operator at the current level
    const sql = descSqlArr.join(` ${searchArg.op} `);
    return `( ${sql} )`;
  }
  return translateSearchTripletToSQL(searchArg);
}

// Translate the search argument to SQL
function translateToSQL(searchArg, table) {
  let header;
  // Create a header (for every cellname the same)
  if (table === 'cells') {
    header = `SELECT cell_name AS 'Name', cellosaurus_id AS 'Cellosaurus ID', donor_age AS 'Donor Age', donor_sex AS 'Donor Sex', donor_ethnicity AS 'Donor Ethnicity', donor_tumor_phase AS 'Donor Tumor Phase', primary_disease AS 'Primary Disease', subtype_disease AS 'Subtype Disease', provider_name AS 'Provider Name', growth_pattern AS 'Growth Pattern' FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'perturbagens') {
    header = `SELECT pert_name AS 'Name', cmap_name AS 'compound', gene_target AS 'Target', moa AS 'mechanism', canonical_smiles AS 'SMILE', inchi_key AS 'identifier', compound_aliases AS 'compound alternative name' FROM ${table} WHERE `;
    typemapper = perturbagentypes;
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
