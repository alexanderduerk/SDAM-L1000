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

/**
 * Recursively translates a search argument to SQL.
 *
 * @param {object} searchArg - The search argument to translate.
 * @return {string} The translated SQL string.
 */
function translateToSQLRecursive(searchArg) {
  console.log('Received searchArg:', JSON.stringify(searchArg)); // Log to check structure

  // Check if searchArg.descendants is an array
  if (Array.isArray(searchArg.descendants)) {
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
    header = `SELECT cell_name AS 'Name', cellosaurus_id AS 'Cellosaurus ID', donor_age AS 'Donor Age', donor_sex AS 'Donor Sex', donor_ethnicity AS 'Donor Ethnicity', donor_tumor_phase AS 'Donor Tumor Phase', primary_disease AS 'Primary Disease', subtype_disease AS 'Subtype Disease', provider_name AS 'Provider Name', growth_pattern AS 'Growth Pattern' FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'genes') {
    header = `SELECT entrez_id AS 'Entrez ID', gene_symbol AS 'Gene Symbol', gene_title AS 'Gene Title', gene_type AS 'Gene Type', src AS 'Source', feature_space AS 'Feature Space' FROM ${table} WHERE `;
    typemapper = genetypes;
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
