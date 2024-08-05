This README tries to explain the toughts while programming and how myself was able to solve problems and think about certain challenges. It therefore should show what part of the project i was working on and what ideas led to the decision making.

# Initialization of the Repository

For proper collaboration with my coworkers i initially started a GitHub Repository, including a License as well as the predefined .getignore template for JavaScript.  
I then went for the initialization of **npm** for all modules that will be used within the project.  
For a cleaner User experience and a more homogeneous codingstyle i set up **eslint** together with **Prettier** allowing us to use the **airBnB** rules in our linter as well as some formatting options.  
I also created a config.json and .js file which would allow every Coworker to use their own ports and routes to the database.

# SQL Tables

We started by looking at the data and deciding what way could be appropriate to store them in a relational database. Our first approach contained following tables:

1. MainViews (This would be a table beeing searched the most on our website, containing Pertubated Cell, Pertubagens, Targeted Gene and the Fold-Change, with the ID beeing a combination of Cell, Pertubagens and Gene)
2. Cellinfos (This would store all corresponding data to the Cell in it and would have the Cell_iname as a primary key)
3. Pertubagens (Contains all information about the Pertubagens and would be connected to the MainViews Table throught the Column specifying the partubagens name)
4. Geneinfo (Containing every info for the targeted Gene by this Pertubagens)

This wasnt the right approach initially. The first reason for this conclusion is the greater amount of storage space we need for storing a MainViews Table instead of joining on Ids and column names. The second reason is the loss of flexibility in what we could show by limiting us to only the columns from the MainViews. So we decided to change the structure up a bit.

We again looked at all Data available to us and decided to create new Tables which would provide more flexibility. The following is the structure we came up with:

- Assayinformation:
  - This contains several infos about the conducted experiment and contains measure values like foldchanges. It would also contain **FOREIGN KEYS** to the IDs of the other tables (see below). The primary key would in this case be an autoincrementing Integer.
- Cells:
  - Would contain the information about a cell. The relations for a cell would be **One-To-One** to a conducted Assay and **Many-To-Many** to used Pertubagens
  - We would also opt here for an autoincrementing Integer Key here
- Pertubations:
  - Contains Pertubations information. Has the One-to-One relation to the Assayinformation, the Many-to-Many to the Cells and a Many-to-One relationship to Genes.
- Genes:
  - Contains infos about each Gene

## Cells Table

I created the cells table in the [l1000.sql file](l1000.sql), with guidance of the given metadata to the cellinfos csv file within the dataset. An in my eyes important approach was to not set a unique constrain to the cell_name column. This would prevent different media adaptions and growth pattern adaptions to be inserted in the database. But to still prevent duplicates a UNIQUE constrain is created based on cell_name, cell_type and growth_pattern, which were columns that didnt contained None values in the initial dataset. This allows for a control of duplicates and also the flexibility of cell adaptions.

### Cells class

#### createOne

The creation of the [Cells class](cells.js) followed the given [code from the lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js) with some smaller adjustments. I did not use the static decorator for the function and instead used the instance to create an entry for the DB. To reduce the code and make it more accesible i opted for an approach which would at the beginning get all keys from the instance with:

```js
const columns = Object.keys(this);
```

The same approach then can be used to get the values of the instance

```js
const values = Object.values(this);
```

I then define the _?_ placeholders for the sql statement with map and create the statement later with the columns and those placeholder values.The statement then gets runned and the values get unpacked using

```js
...values
```

#### deleteOne

Completly follows the [provided code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). For testing purposes it will log the ID of the cell that was deleted.

#### updateOne

Also follows the [provided code](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). It returns the updatedCell to control within the server environment.

#### search (with Args)

The search function within the class is completly copied from the [GitHub](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js). But uses an adjusted [searchArg](searchargs.js). For the searchArg i defined a cellinoftypes, which can be used to check the types of the columns and escape values if they are text using escapeValue and isTextField:

```js
function isTextField(field) {
  // Checks if the field is type text
  const fieldType = cellinfotypes[field];
  return fieldType === 'text';
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
