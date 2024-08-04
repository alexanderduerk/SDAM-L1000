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
  donor_sex: 'boolean',
  donor_tumor_phase: 'text',
  cell_lineage: 'text',
  primary_disease: 'text',
  subtype_disease: 'text',
  provider_name: 'text',
  growth_pattern: 'text',
};

function isTextField(field) {
  const fieldType = cellinfotypes[field];
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

// Translate the search argument to SQL
function translateToSQL(searchArg, table) {
  let header;
  // Create a header (for every cellname the same)
  if (table === 'cells') {
    header = `SELECT cell_name AS 'Name', cellosaurus_id AS 'Cellosaurus ID', donor_age AS 'Donor Age', donor_sex AS 'Donor Sex', donor_ethnicity AS 'Donor Ethnicity', donor_tumor_phase AS 'Donor Tumor Phase', primary_disease AS 'Primary Disease', subtype_disease AS 'Subtype Disease', provider_name AS 'Provider Name', growth_pattern AS 'Growth Pattern' FROM ${table} WHERE `;
  }
  const searchSql = translateSearchTripletToSQL(searchArg);
  // Allow for pagination args if provided in the search
  // containing the offset and limit
  if (
    searchArg.offset !== undefined &&
    searchArg.limit !== undefined &&
    searchArg.order === 'asc'
  ) {
    return `${header} ${searchSql} ORDER BY ${searchArg.field} LIMIT ${searchArg.limit} OFFSET ${searchArg.offset}`;
  }
  if (
    searchArg.offset !== undefined &&
    searchArg.limit !== undefined &&
    searchArg.order === 'desc'
  ) {
    return `${header} ${searchSql} ORDER BY ${searchArg.field} DESC LIMIT ${searchArg.limit} OFFSET ${searchArg.offset}`;
  }
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
  }
  return translateSearchTripletToSQL(searchArg);
}

module.exports = { translateToSQL };
