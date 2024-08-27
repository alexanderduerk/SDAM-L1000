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

The createOne function was designed as an instance method, diverging from the static method approach illustrated in our lecture. By implementing it as an instance method, I leveraged the ability to call the constructor and directly use the resulting instance to insert its entire set of attributes into the database.

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

The deleteOne function was implemented in accordance with the foundational principles provided in our lecture materials. The design and execution were straightforward, presenting no significant challenges. The SQL statement is hardcoded to ensure the deletion of the correct record based on the provided cellid.

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

Method: deleteOne(dbconnection, cellid)
Purpose: This method deletes a specific cell record based on its ID.
Challenges: My main challenge here was to ensure that the method reliably deletes the correct record without affecting others, especially when dealing with a large dataset.
Solution: I used a prepared SQL statement with a placeholder for the cell ID. This way, the method safely deletes only the intended record. Additionally, I added a console log to confirm the deletion, which helps with debugging and verification during testing.
Method: updateOne(dbconnection, id, column, newvalue)
Purpose: This method updates a specific column of a cell record.
Challenges: Handling dynamic column updates posed a challenge, especially when ensuring that the SQL query remained safe and effective.
Solution: I approached this by using a combination of template literals and placeholders. The template literals allowed me to dynamically insert the column name into the SQL query, while the placeholder handled the new value securely. This method not only updates the database correctly but also protects against potential injection attacks.
Method: search(searcharg, limit, offset, dbconnection)
Purpose: This method searches for cell records based on provided parameters.
Challenges: Translating the search arguments into an SQL query was complex due to the need for flexibility in handling different types of search conditions.
Solution: I leveraged a utility function, searchArg.translateToSQL, to dynamically generate the SQL query based on the search arguments. This function was particularly useful because it abstracted much of the complexity, allowing me to focus on ensuring that the query was correctly executed and returned the desired results.
Method: searchUI(searcharg, limit, offset, dbconnection)
Purpose: Similar to search, but tailored for user interface-specific queries.
Challenges: I needed to adapt the search logic for UI-specific needs while reusing as much of the existing code as possible to maintain consistency and reduce redundancy.
Solution: I modified the search method slightly to meet the UI's requirements while keeping the core logic intact. This allowed me to maintain a consistent approach across different search scenarios.
Method: readById(id, dbconnection)
Purpose: Retrieves a cell record by its ID.
Challenges: I needed to ensure that the method correctly handles cases where the ID might not exist in the database, returning useful feedback or results.
Solution: I wrote a simple yet effective SQL query using a placeholder for the ID, which ensures that the method safely and accurately retrieves the correct record. To aid in debugging, I included console logs that output the retrieved data.
Installation and Usage
Installation: Clone the repository and run npm install to install dependencies.
Usage: Import the Cells class into your project and use its methods to interact with the cells table in your database.
Example Usage
javascript
Code kopieren
const Cells = require('./Cells');
const db = require('./dbconnection');

// Create a new cell record
const newCell = new Cells({
cell_name: 'HepG2',
cellosaurus_id: 'CVCL_0027',
donor_age: 15,
doubling_time: '48 hours',
growth_medium: 'DMEM',
cell_type: 'Hepatocyte',
donor_ethnicity: 'Caucasian',
donor_sex: 'Female',
donor_tumor_phase: 'Stage I',
cell_lineage: 'Hepatic',
primary_disease: 'Liver Cancer',
subtype_disease: 'Hepatocellular carcinoma',
provider_name: 'ATCC',
growth_pattern: 'Adherent',
});

await newCell.createOne(db);
Conclusion
Working on the Cells class was both challenging and rewarding. By focusing on type safety and dynamic SQL generation, I was able to create a flexible and secure model for managing cell line data. Each challenge provided an opportunity to deepen my understanding of both JavaScript and SQL, leading to a more robust final product.

The `createOne` method in the [Cells class](cells.js) is based on the provided [lecture code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js) with modifications. I opted not to use the `static` decorator, allowing the instance to handle database entries. The method uses `Object.keys(this)` and `Object.values(this)` to dynamically generate SQL statements, reducing code complexity.

### `deleteOne` Method

This method directly follows the [provided code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). For testing purposes, it logs the ID of the deleted cell.

### `updateOne` Method

Similarly, the `updateOne` method is derived from the [provided code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). It returns the updated cell for verification within the server environment.

### `search` Method with Arguments

The `search` function is also based on the [provided code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js), with adjustments made to the [searchArg](searchargs.js) function. I introduced a `cellinfotypes` object to validate column types and escape text values. The `translateSearchTripletToSQL` function was enhanced to support operators like `contains`, `startswith`, and `endswith`.

```js
function isTextField(field) {
  return cellinfotypes[field] === 'text';
}

function escapeValue(value, isText) {
  return isText ? `'${value}'` : value;
}

function escapeValue(value, isText) {
  if (isText) {
    // Escape the values if they are text
    return `'${value}'`;
  }
}
```

Additionaly the [translateSearchTripletToSQL](searchargs.js) function was adjusted to allow implementation of _contains, startswith_ and _endswith_. This is easily donw with different return statements based on the operator we use.

```js
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

The [translateToSQL](searchargs.js) is also adjusted. To make it way more flexible i decided to include table in the parameters. Then a if check can be used to check the table name and to create a table specific **SELECT** statement, which also would rename the columns for better Readability within the Webpage. Then again if statements were used for different order args and different offset or limits that can be used to get a better handling for the View of the Data.
