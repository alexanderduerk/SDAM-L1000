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

I created the cells table in the [l1000.sql file](l1000.sql), with guidance of the given metadata to the cellinfos csv file within the dataset. An in my eyes important approach was to not set a unique constrain to the cell_name column. This would prevent different media adaptions and growth pattern adaptions to be inserted in the database. But to still prevent duplicates a UNIQUE constrain is created based on those three columns. This allows for a control of duplicates and also the flexibility of cell adaptions.

### Cells class

The creation of the [Cells class](cells.js) followed the given [code from the lecture](https://github.com/asishallab-group/SDAM_06_and_07_Data_Model_and_Server_Programming/blob/main/city.js) with some smaller adjustments. The createOne function here is created as a class method which needs an instance. At this step i also included a TypeChecking function which would initially check the body of the request if the types are correct. Therefore a HashMap is created with the correct types of each column.  
Also the generation of the this. instance parameters is done dynamically by using the ierating over each key from the keyValuePairs, checking the type of the value at the key position and then assigning instance parameters to the found keys with the corresponding values.  
The createOne function then just takes the connection to the database as an argument, retrieves all column names with **Object.keys(this)** and values with **Object.values(this)**.  
The SQL placeholders are then dynamically created based on the amount of send values and converted to a SQL query to insert the Data.
TODO ADD EXPLANATION FOR sh TEST INSTEAD OF PS1 TEST  
The deleteOne function allows the deletion of a whole row by giving an id.  
The updateOne function is exactly done as provided in the lecture it will update a given cell based on a column name and the entry id.  
The search function needed to be adapted from the prvided code within the lecture. In the lecture we used the searcharchgs.js file to convert json args to proper sql statements and allow for operators. This was mainly adopted, as well as the static async implementation of the search.
