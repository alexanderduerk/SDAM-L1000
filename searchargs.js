// Create a lookup table of the cellsinfo columns and their types
const cellinfotypes = {
  cell_iname: 'text',
  cellosaurus_id: 'text',
  donor_age: 'int',
  donor_age_death: 'int',
  donor_disease_age_onset: 'int',
  doubling_time: 'float',
  growth_medium: 'text',
  provider_catalog_id: 'text',
  feature_id: 'text',
  cell_type: 'text',
  donor_ethnicity: 'text',
  donor_sex: 'text',
  donor_tumor_phase: 'text',
  cell_lineage: 'text',
  primary_disease: 'text',
  subtype: 'text',
  provider_name: 'text',
  growth_pattern: 'text',
  ccle_name: 'text',
  cell_alias: 'text',
};

function isTextField(field) {
  const fieldType = cellinfotypes[field];
  return fieldType === 'text';
}

function escapeValue(value, isText) {
  if (isText) {
    // Implement proper escaping for text values (e.g., using parameterized queries)
    return `'${value}'`;
  } else {
    return value;
  }
}

function translateSearchTripletToSQL(triplet) {
  const isText = isTextField(triplet.field);
  const escapedVal = escapeValue(triplet.val, isText);
  return `(${triplet.field} ${triplet.op} ${escapedVal})`;
}

// Translate the search argument to SQL
function translateToSQL(searchArg, table) {
  // Create a header (for every cellname the same)
  const header = `SELECT * FROM ${table} WHERE `;
  const searchSql = translateSearchTripletToSQL(searchArg);
  // combine both
  return `${header}${searchSql}`;
}

// Recursive translation
function translateToSQLRecursive(searchArg) {
  const hasDescendants = searchArg.descendants !== undefined;
  if (hasDescendants) {
    // Translate each descendant
    const descSqlArr = searchArg.descendants.map(translateToSQLRecursive);
    const sql = descSqlArr.reduce((a, c) => `${a} ${searchArg.op} ${c}`);
    return `( ${sql} )`;
  } else {
    return translateSearchTripletToSQL(searchArg);
  }
}

module.exports = { translateToSQL };
