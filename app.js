// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');

const Cells = require('./cells');
const Genes = require('./genes');
const Mainviews = require('./mainviews');
const Perturbagens = require('./pertubations');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// allow static file useage
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.render('index');
});

/**
 * All Routes connected to the cellinfos table
 * This will include Update, Delete and Search
 */
app.post('/cells', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the Cell class
    const CellInfo = new Cells(req.body);
    // Call Create One on the instance
    const newCell = await CellInfo.createOne(db);
    console.log(`Created new Cell record:\n${newCell}`);
    res.json(newCell);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Cellinfos table
 */
app.post('/cells/search', async (req, res) => {
  let db;
  // Extract all relevant fields from req.body
  const { limit, offset, order, descendants, field, op, val } = req.body;

  // Construct the searchArg object with potential descendants
  const searchArg = {
    field,
    op,
    val,
    limit,
    offset,
    order,
    descendants: Array.isArray(descendants) ? descendants : [],
  };

  // Handle pagination and sorting parameters
  searchArg.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  searchArg.offset = req.body.offset ? parseInt(req.body.offset) : undefined;
  searchArg.order = req.body.order || undefined;
  console.log(searchArg);

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const cells = await Cells.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found Cells:`);
    console.log(cells.length);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'cellstable.ejs',
        { data: cells, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(cells);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Delete Request for Cellinfos table
 */
// Route to handle DELETE requests to /cells/:name
app.delete('/cells/:name', async (req, res) => {
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the cell name from the request parameters
    const celliname = req.params.name;

    // Call the deleteOne method from the Cellinfos class
    await Cells.deleteOne(db, celliname);

    // Send a success response
    res.status(200).send(`Cell with ${celliname} was deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (db) {
      await db.close(); // Close the database connection if it was opened
    }
  }
});

/**
 * UpdateOne for the cells table
 */
app.patch('/cells', async (req, res) => {
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the required parameters from the request parameters
    const { cellid, columnname, newvalue } = req.body;
    // Call the updateOne function from the cells class
    const updatedCell = await Cells.updateOne(db, cellid, columnname, newvalue);
    console.log(`Updated Cell record:`);
    console.log(updatedCell);
    res.json(updatedCell);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Genes
app.post('/genes', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the Cell class
    const GeneInstance = new Genes(req.body);
    // Call Create One on the instance
    const newGene = await GeneInstance.createOne(db);
    console.log(`Created new Cell record:\n${newGene}`);
    res.json(newGene);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Cellinfos table
 */
app.post('/genes/search', async (req, res) => {
  let db;
  // Extract all relevant fields from req.body
  const { limit, offset, order, descendants, field, op, val } = req.body;

  // Construct the searchArg object with potential descendants
  const searchArg = {
    field,
    op,
    val,
    limit,
    offset,
    order,
    descendants: Array.isArray(descendants) ? descendants : [],
  };

  // Handle pagination and sorting parameters
  searchArg.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  searchArg.offset = req.body.offset ? parseInt(req.body.offset) : undefined;
  searchArg.order = req.body.order || undefined;
  console.log(searchArg);
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const genes = await Genes.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found Genes:`);
    console.log(genes);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'cellstable.ejs',
        { data: genes, currentSearchArg: searchArg },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(genes);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Delete Request for Cellinfos table
 */
// Route to handle DELETE requests to /cells/:name
app.delete('/genes/:id', async (req, res) => {
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the cell name from the request parameters
    const genesId = req.params.name;

    // Call the deleteOne method from the Cellinfos class
    await Cells.deleteOne(db, genesId);

    // Send a success response
    res.status(200).send(`Cell with ${genesId} was deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (db) {
      await db.close(); // Close the database connection if it was opened
    }
  }
});

/**
 * UpdateOne for the cells table
 */
app.patch('/genes', async (req, res) => {
  let db;
  try {
    // Connect to the Database
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Extract the required parameters from the request parameters
    const { geneid, columnname, newvalue } = req.body;
    // Call the updateOne function from the cells class
    const updatedGene = await Cells.updateOne(db, geneid, columnname, newvalue);
    console.log(`Updated Cell record:`);
    console.log(updatedGene);
    res.json(updatedGene);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Post Function Pertubations
app.post('/perturbations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the Pertubagens class
    const Perturbagensinstance = new Perturbagens(req.body);
    // Call Create One on the instance
    const newperdid = await Perturbagensinstance.createOne(db);
    console.log(`Created new Perturbagens record:`);
    console.log(newperdid);
    res.json(newperdid);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/search', async (req, res) => {
  let db;
  // Extract all relevant fields from req.body
  const { limit, offset, order, descendants, field, op, val } = req.body;

  // Construct the searchArg object with potential descendants
  const searchArg = {
    field,
    op,
    val,
    limit,
    offset,
    order,
    descendants: Array.isArray(descendants) ? descendants : [],
  };

  // Handle pagination and sorting parameters
  searchArg.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  searchArg.offset = req.body.offset ? parseInt(req.body.offset) : undefined;
  searchArg.order = req.body.order || undefined;
  console.log(searchArg);

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const compounds = await Perturbagens.search(
      searchArg,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found compounds:`);
    console.log(compounds);
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile(
        './views/perts.ejs',
        { data: compounds },
        {},
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      res.json(compounds);
    }
  } catch (e) {
    console.error(e);
    res.status(500);
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Delete Pertubations
app.delete('/pertubations', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');

    // Extract the pert_id from the request body
    const { pertid } = req.body;
    console.log('Request Body:', req.body);

    // Create a new instance of the Perturbagens class (if needed for any purpose)
    // const Pertubagensinstance = new Perturbagens(req.body);

    // Call deleteOne function
    await Perturbagens.deleteOne(db, pertid);
    console.log(`Deleted Pertubagens record with pert_id: ${pertid}`);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${pertid}`);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Patch pertubations
app.patch(`/pertubations`, async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    console.log(`Connected successfully`);

    // Extract the pert_id to be updated from request body
    const { pertid, column, newvalue } = req.body;

    // Validate input
    if (!pertid || !column || newvalue === undefined) {
      return res.status(400).send('Bad request: Missing fields');
    }

    const updatedPerturbagens = Perturbagens.updateOne(
      db,
      pertid,
      column,
      newvalue
    );
    // Send a success response
    res.status(200).send(`Updated pertubagens record with pert_id: ${pertid}`);
    console.log('Updated Pert record:');
    console.log(updatedPerturbagens);
    res.json(updatedPerturbagens);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

app.post('/mainviews', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the Cell class
    const MViews = new Mainviews(req.body);
    // Call Create One on the instance
    const newMainviews = await MViews.createOne(db);
    console.log(`Created new Cell record:\n${newMainviews}`);
    res.json(newMainviews);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

const {
  server: { port },
} = require('./config');
// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
