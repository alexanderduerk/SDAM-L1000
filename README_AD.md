# Project Overview

This README documents the thought processes and problem-solving approaches I employed throughout the project. It highlights my contributions, the challenges faced, and the rationale behind key decisions.

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

- **Signature Information (SigInfo)**: Contains experimental data, such as fold changes, with foreign keys linking to other tables. The primary key is an auto-incrementing integer.
- **Cells**: Stores cell information, with a one-to-one relationship with `AssayInformation` and many-to-many relationships with `Perturbations`. The primary key is an auto-incrementing integer.
- **Perturbations**: Contains data on perturbations, with a one-to-one relationship to `AssayInformation`, many-to-many relationships with `Cells`, and a many-to-one relationship with `Genes`.
- **Genes**: Stores information about each gene.

### Cells Table Implementation

I created the `Cells` table in the [l1000.sql](l1000.sql) file, using metadata from the `cellinfos` CSV file. A key decision was to avoid setting a unique constraint on the `cell_name` column to accommodate different media adaptations and growth patterns. Instead, I implemented a unique constraint based on `cell_name`, `cell_type`, and `growth_pattern` to prevent duplicates while allowing flexibility.

## Cells Class Implementation

### `createOne` Method

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
