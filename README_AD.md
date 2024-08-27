# Project Overview Alexander Dürk

This README documents the thought processes and problem-solving approaches I employed throughout the project. It highlights my contributions, the challenges faced, and the rationale behind key decisions.

## Table of Contents

- [Repository Initialization](#repository-initialization)
- [SQL Table Design](#sql-table-design)
  - []

## Repository Initialization

To facilitate collaboration, I established a GitHub repository, complete with a license and a `.gitignore` template configured for JavaScript. I initialized the project with **npm**, ensuring all necessary modules were included. To maintain a consistent coding style and enhance user experience, I integrated **eslint** with **Prettier**, adhering to the **Airbnb** style guide. Additionally, I created a `config.json` and a `.js` file, enabling team members to customize their ports and database routes.

## SQL Table Design

### Initial Approach

We began by analyzing the dataset to determine the optimal structure for a relational database. Our initial schema included the following tables:

1. **MainViews**: Designed to be the most frequently queried table, it included columns for Perturbed Cell, Perturbagens, Targeted Gene, and Fold-Change, with a composite key formed by the Cell, Perturbagens, and Gene.
2. **CellInfos**: Stored all related data for each cell, using `Cell_iname` as the primary key.
3. **Perturbagens**: Contained information on perturbagens, linked to the `MainViews` table via the perturbagens' name.
4. **GeneInfo**: Held data for each targeted gene affected by the perturbagens.

### Revised Approach

We realized the initial design had limitations, particularly in terms of storage efficiency and query flexibility. To address these issues, we restructured the database as follows:

- Signature Information (signature_infos): Contains experimental data such as fold changes, with foreign keys linking to related tables. Each entry has a unique identifier as the primary key, which is an auto-incrementing integer.

- Cells: Stores cell-specific information. There is a one-to-one relationship between each cell and its corresponding entry in signature_infos. Additionally, Cells have a one-to-many relationship with Perturbagens. The primary key is an auto-incrementing integer.

- Perturbagens: Contains data on various perturbations. Each perturbagen has a one-to-one relationship with an entry in signature_infos. Perturbagens also have a one-to-one relationship with Genes and can have many-to-one relationships with Cells. The primary key is an auto-incrementing integer.

- Genes: Stores detailed information about each gene, with a one-to-one relationship with Perturbagens.

### Cells Table Implementation

I created the _cells_ table in the [l1000.sql](l1000.sql) file, using metadata from cellinfos.csv. A key decision was to avoid setting a unique constraint on the _cell_name_ column to accommodate different media adaptations and growth patterns. Instead, I implemented a unique constraint based on _cell_name_, _cell_type_, and _growth_pattern_ to prevent duplicates while allowing flexibility.

### Genes Table Implementation

The creation of the _genes_ was done in a way, so that only cells with available _entrez_id_ and _cell_symbol_ could be included within the database. Also an ignore in cases where those constrains fail, was implemented.

## Class Representation of the data models

### Cells Class

#### Overview

When developing the Cells class, my goal was to create a robust and type-safe model for managing cell line data within our database. This class provides methods to perform CRUD operations while ensuring data integrity through type checking.

#### Features

##### Type Checking

I implemented type checking to catch errors early and ensure that all data conforms to expected types.

##### Database Operations

I developed methods to insert, update, delete, and query cell records, focusing on dynamic SQL generation and security.

#### Class Structure

##### Constructor

The constructor in the Cells class is designed to initialize an instance with dynamically provided attributes. Initially, I hardcoded the constructor, which required all data fields to be populated, including placeholders for empty values. This approach was inflexible and reduced code readability.

To enhance both flexibility and maintainability, I refactored the constructor to iterate over the provided key-value pairs. For each attribute, the constructor dynamically verifies the type against a predefined schema using the checkType function. This ensures that only valid data types are assigned to the instance. The key serves as the attribute name, while the corresponding value is assigned directly to the instance, allowing for a more modular and adaptable construction process.

```js
constructor(keyValuePairs) {
    const expectedTypes = {
      cell_name: 'string',
      cellosaurus_id: 'string',
      donor_age: 'number',
      doubling_time: 'string',
      growth_medium: 'string',
      cell_type: 'string',
      donor_ethnicity: 'string',
      donor_sex: 'string',
      donor_tumor_phase: 'string',
      cell_lineage: 'string',
      primary_disease: 'string',
      subtype_disease: 'string',
      provider_name: 'string',
      growth_pattern: 'string',
    };
    // use a dynamic constructor approach
    Object.keys(keyValuePairs).forEach((key) => {
      checkType(keyValuePairs[key], expectedTypes[key]);
      this[key] = keyValuePairs[key];
    });
  }
```

##### createOne

The createOne function was designed as an instance method, diverging from the static method approach illustrated in our [lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). By implementing it as an instance method, I leveraged the ability to call the constructor and directly use the resulting instance to insert its entire set of attributes into the database.

Initially, I hardcoded the SQL statement with fixed placeholders (?) for each column, which required full knowledge of the table structure at the time of writing. However, to enhance flexibility and maintainability, I refactored the method to dynamically map each column to a placeholder. This was achieved by iterating over the instance's keys and generating the corresponding placeholders, which are then joined by commas. This approach allows the SQL statement to be adaptable, accommodating changes in the instance structure without requiring extensive modifications to the code.

The method proceeds by executing the dynamically generated SQL statement, using the ...values spread operator to unpack and pass the instance's values to dbconnection.run. This technique improves readability and ensures that the insertion process is streamlined. To confirm the successful insertion and provide feedback to the user, the function subsequently retrieves the newly inserted record by querying the database with the instance's cell_name.

```js
async createOne(dbconnection) {
    // get all columns
    const columns = Object.keys(this);
    // get all values
    const values = Object.values(this);
    // define the placeholder ?s
    const placeholders = columns.map(() => '?').join(',');
    // define the sql statement
    const sql = `INSERT INTO cells (${columns.join(',')}) VALUES (${placeholders})`;
    // Execute SQL statement with the instanced values
    const dbres = await dbconnection.run(sql, ...values);
    // return the newly inserted cell
    const newcell = await dbconnection.get(
      'SELECT * FROM cells WHERE cell_name = ?',
      this.cell_name
    );
    return newcell;
  }
```

#### deleteOne

The deleteOne function was implemented in accordance with the foundational principles provided in our [lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js) materials. The design and execution were straightforward, presenting no significant challenges. The SQL statement is hardcoded to ensure the deletion of the correct record based on the provided cellid.

```js
/**
 * Delete Function for the cellinfos table
 * @param {dbconnection, celliname}
 */
// sql statement
static async deleteOne(dbconnection, cellid) {
  const sql = 'DELETE FROM cells WHERE cell_id = ?';
  const dbres = await dbconnection.run(sql, `${cellid}`);
  // return a console.log that the given cell was deleted
  console.log(`Cell with cell_id: ${cellid} was deleted`);
}
```

#### updateOne

The updateOne function was implemented following the guidelines provided in our [lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). The SQL statement is structured to require a cell_id, which identifies the specific row to be updated. The column and newvalue parameters are utilized to target a specific cell within the identified row, facilitating the update of its value.

To provide immediate feedback to the user, the function performs a subsequent query after the update operation, retrieving and returning the modified entry. This approach ensures that the user is informed of the successful update and can verify the changes made.

```js
/**
 * Updates a single row in the "cells" table with the given id, column, and new value.
 *
 * @param {object} dbconnection - The database connection object.
 * @param {number} id - The id of the row to update.
 * @param {string} column - The column to update.
 * @param {any} newvalue - The new value to set.
 * @return {Promise<object>} - A Promise that resolves to the updated row.
 */
static async updateOne(dbconnection, id, column, newvalue) {
  const sql = `UPDATE cells SET ${column} = ? WHERE cell_id = ${id}`;
  const dbres = await dbconnection.run(sql, newvalue);
  // return the newly updated Row
  const updatedCell = await dbconnection.get(
    'SELECT * FROM cells WHERE cell_id = ?',
    id
  );
  return updatedCell;
}
```

#### search

The search function closely mirrors the approach discussed in our [lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js), utilizing a searcharg parameter, which is a JSON object structured as follows:

```js
searchArg = {
  field: columnname,
  val: searchvalue,
  op: logicOperator,
  orderfield: columnForOrdering,
  order: ASC_or_DESC,
  offset: pageOffset,
  limit: maxResults,
  descendants: [],
};
```

This structured format enables flexible and dynamic querying, accommodating complex search conditions. The descendants array allows for the combination of multiple search conditions using logical operators (e.g., AND, OR), thereby refining the search results to meet specific criteria.

The function converts the searcharg into an SQL query using the [translateToSQL](searchargs.js) method, which generates the appropriate SQL statement for the cells table. If no searcharg is provided, a default query is executed to return all records. The resulting SQL is logged for transparency and debugging purposes. Finally, the database is queried, and the function returns the resulting array of cell records that match the specified search criteria.

```js
/**
 * Reads cellrecord from the database based on the provided search parameters.
 *
 * @param {object} searcharg - The search parameters to filter the results.
 * @param {object} dbconnection - The database connection object.
 * @return {Promise<Array>} - A Promise that resolves to an array of cell records that match the search criteria.
 */
static async search(searcharg, dbconnection) {
  const searchSql =
    searcharg !== undefined && searcharg !== null
      ? searchArg.translateToSQL(searcharg, 'cells')
      : 'SELECT * FROM cells';
  console.log(`SQL generated to search Cells:\n${JSON.stringify(searchSql)}`);
  // Query the database
  const dbResult = await dbconnection.all(searchSql);
  // Done
  console.log(dbResult);
  return dbResult;
}
```

#### readById

The readById function is implemented as per the standard code provided in the [lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). It is designed to retrieve a complete record from the cells table based on the cell_id provided as a parameter. The function constructs an SQL query to select all columns associated with the specified cell_id, then executes the query to return the corresponding database entry.

```js
/**
 * Reads a single cell record from the database based on the provided cell_id.
 *
 * @param {number} id - The id of the cell record to retrieve.
 * @param {object} dbconnection - The database connection object.
 * @return {Promise<object>} - A Promise that resolves to the retrieved cell record.
 */
static async readById(id, dbconnection) {
  console.log(id);
  const sql = 'SELECT * FROM cells WHERE cell_id = ?';
  const dbres = await dbconnection.get(sql, id);
  console.log(dbres);
  return dbres;
}
```

#### searchUI

This function provides no real benefit for the programmatic API usage, but uses a different basic SQL query created by [translateToSQL](searchargs.js). This will return a more stripped version of the full _siginfos_ table, which was rendered in our GUI.

```js
/**
 * Reads cellrecord from the database based on the provided search parameters.
 *
 * @param {object} searcharg - The search parameters to filter the results.
 * @param {string} orderarg - The order in which to sort the results.
 * @param {object} paginationarg - The pagination parameters for the results.
 * @param {object} dbconnection - The database connection object.
 * @return {Promise<Array>} - A Promise that resolves to an array of cell records that match the search criteria.
 */
static async searchUI(searcharg, limit, offset, dbconnection) {
  const searchSql =
    searcharg !== undefined && searcharg !== null
      ? searchArg.translateToSQL(searcharg, 'cellsUI')
      : 'SELECT * FROM cells';
  console.log(`SQL generated to search Cells:\n${JSON.stringify(searchSql)}`);
  // Query the database
  const dbResult = await dbconnection.all(searchSql);
  // Done
  console.log(dbResult);
  return dbResult;
}
```

### Genes class

The Genes class was designed following the same structural principles as the Cells class, which served as a foundational blueprint. The constructor was modified to include a new expectedTypes HashMap specific to the Genes class:

```js
constructor(keyValuePairs) {
  const expectedTypes = {
    entrez_id: 'number',
    gene_symbol: 'string',
    ensembl_id: 'string',
    gene_title: 'string',
    gene_type: 'string',
    src: 'string',
    feature_space: 'string',
  };
  // use a dynamic constructor approach
  Object.keys(keyValuePairs).forEach((key) => {
    checkType(keyValuePairs[key], expectedTypes[key]);
    this[key] = keyValuePairs[key];
  });
}
```

Beyond this adjustment, the implementation of the Genes class remains consistent with the approach used in the [Cells class](cells.js), ensuring a uniform coding standard across both classes.

## Construction and translation of SearchArgs

To enable the use of searchArgs within both the API and GUI, I modified the code provided in our lecture. Originally, the goal was to convert a searchTriplet (a combination of field, value, and operator) into an SQL command. The core idea is that the searchArg object contains field, val, and op properties, with the field specifying the database column, the val representing the search value, and the op defining the logical operator to be applied.

The SQL statement is dynamically constructed using a switch statement, which returns different SQL queries based on the operator provided in the searchArg. The basic queries are constructed by substituting the appropriate field and value into the SQL template.

To support more complex searches involving descendants and to increase flexibility, I expanded the range of supported operators. This approach allows the function to handle a broader set of search conditions, which is crucial for more advanced querying.

```js
/**
 * Translates a search triplet to SQL.
 *
 * @param {Object} triplet - The search triplet containing field, op, and val.
 * @param {string} triplet.field - The field to search on.
 * @param {string} triplet.op - The operator to use for the search.
 * @param {string} triplet.val - The value to search for.
 * @return {string} The SQL query string.
 * @throws {Error} If the operator is unsupported.
 */
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
```

This function is supported by two auxiliary functions, isTextField and escapeValue, which ensure that values represented as strings are correctly escaped using single quotes. The isTextField function uses a typemapper defined at the beginning of the script to determine whether a field is of type text. The escapeValue function then applies the appropriate escaping based on this determination:

```js
/**
 * Determines if a field is of type text.
 *
 * @param {string} field - The field to check.
 * @return {boolean} - True if the field is of type text, false otherwise.
 */
function isTextField(field) {
  const fieldType = typemapper[field];
  console.log(typemapper[field]);
  return fieldType === 'text';
}

/**
 * Escapes a value for SQL based on its type.
 *
 * @param {any} value - The value to escape.
 * @param {boolean} isText - True if the value is of type text, false otherwise.
 * @return {string} - The escaped value.
 */
function escapeValue(value, isText) {
  if (isText) {
    // Implement proper escaping for text values
    return `'${value}'`;
  }
  return value;
}
```

The translateToSQL function is designed to convert a search argument into an SQL query string tailored to different database tables. It dynamically generates the appropriate SQL header based on the table being queried, ensuring that the resulting SQL query is both contextually relevant and syntactically correct.

```js
/**
 * Translates a search argument into an SQL query string.
 *
 * @param {Object} searchArg - The search argument to translate.
 * @param {string} table - The table to search in.
 * @return {string} The SQL query string.
 */
function translateToSQL(searchArg, table) {
  let header;
  // Create a header (for every cellname the same)
  if (table === 'cells') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'cellsUI') {
    header = `SELECT cell_name, donor_age, doubling_time, growth_medium, donor_ethnicity, donor_sex, donor_tumor_phase, primary_disease, growth_pattern FROM cells WHERE `;
    typemapper = cellinfotypes;
  }
  if (table === 'perturbagens') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = perturbagentypes;
  }
  if (table === 'perturbagensUI') {
    header = `SELECT pert_name, gene_target, moa, canonical_smiles, compound_aliases FROM perturbagens WHERE `;
    typemapper = perturbagentypes;
  }
  if (table === 'genes') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = genetypes;
  }
  if (table === 'genesUI') {
    header = `SELECT gene_symbol, ensembl_id, gene_title, gene_type, src, 
    feature_space FROM genes WHERE `;
    typemapper = genetypes;
  }

  if (table === 'signature_infos') {
    header = `SELECT * FROM ${table} WHERE `;
    typemapper = siginfotypes;
  }
  if (table === 'signature_infosUI') {
    header = `SELECT  si.sig_name,
                      si.pert_name,
                      at.gene_target,
                      si.cell_name,
                      si.pert_dose, 
                      si.pert_time,
                      si.ss_ngene,
                      si.tas,
                      si.is_hiq,
                      si.qc_pass
              FROM signature_infos si LEFT JOIN
              perturbagens at ON si.pert_name = at.pert_name
              WHERE `;
    typemapper = geneinfotypes;
  }

  if (table === 'genetargets') {
    header = `SELECT si.sig_name AS 'Signature Name',
                     at.gene_target AS 'Targeted Gene',
                     at.pert_name AS 'Compound',
                     si.cmap_name AS 'Connectivity Map',
                     si.cell_name AS 'Cells',
                     si.bead_batch AS 'Batch Nr.',
                     si.pert_dose AS 'Dosage',
                     si.pert_time AS 'Perturbation Period',
                     si.nsamples AS 'Number of Samples',
                     si.cc_q75 AS 'Landmark Space',
                     si.ss_ngene AS 'Number of Genes',
                     si.tas AS 'Transcriptional Activity Score',
                     si.pct_self_rank_q25 AS 'Self Connectivity',
                     si.wt AS 'Weight List',
                     si.median_recall_rank_spearman AS 'MRR1',
                     si.median_recall_rank_wtcs_50 AS 'MRR50',
                     si.median_recall_score_spearman AS 'MRS1',
                     si.median_recall_score_wtcs_50 AS 'MRS50',
                     si.batch_effect_tstat AS 'Batch Effect',
                     si.batch_effect_tstat_pct AS 'Batch Effect %',
                     si.is_hiq AS 'High Quality',
                     si.qc_pass AS 'Quality Control Pass',
                     si.det_wells AS 'Detection Wells',
                     si.det_plates AS 'Detected Plates',
                     si.distil_ids AS 'Replicate IDs',
                     si.project_code AS 'Project Code'
              FROM signature_infos si
              LEFT JOIN perturbagens at
              ON si.pert_name = at.pert_name
              WHERE`;
    typemapper = geneinfotypes;
  }

  // Use translateToSQLRecursive to handle nested queries
  const searchSql = translateToSQLRecursive(searchArg);
  let orderClause = '';
  orderClause = ` ORDER BY ${searchArg.orderfield} ${searchArg.order || 'ASC'}`;
  // Allow for pagination args if provided in the search
  if (searchArg.offset !== undefined && searchArg.limit !== undefined) {
    return `${header} ${searchSql}${orderClause} LIMIT ${searchArg.limit} OFFSET ${searchArg.offset}`;
  }

  // Combine both
  return `${header} ${searchSql} ${orderClause}`;
}
```

This function begins by selecting the appropriate SQL header based on the table specified in the table parameter. It sets up the header string with the necessary SQL SELECT statement and defines the fields to be retrieved. The typemapper is also assigned based on the table to ensure the correct mapping of field types for later use.

For complex queries involving nested search arguments, the translateToSQLRecursive function is invoked to translate these arguments into the corresponding SQL conditions.

An ORDER BY clause is appended to the SQL string, determined by the orderfield and order properties of searchArg, defaulting to ascending order if unspecified.

If pagination is required, the function incorporates the LIMIT and OFFSET clauses based on the limit and offset values provided in searchArg. Finally, the constructed SQL query string, combining the header, search conditions, and optional pagination, is returned.

To enable the execution of more complex search queries involving nested conditions, the translateToSQLRecursive function was developed. This function facilitates the construction of advanced SQL queries by processing descendants—nested search arguments that encapsulate multiple full searchArg objects within each other. These nested structures can be combined using logical operators, allowing for the formulation of highly precise and intricate search conditions. This approach enables querying across multiple columns or values, ensuring that users can retrieve results that meet their specific criteria with a high degree of accuracy.

```js
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
```
