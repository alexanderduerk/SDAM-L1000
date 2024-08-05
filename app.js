// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');

const Cells = require('./cells');
const Mainviews = require('./mainviews');
const Perturbagens = require('./pertubations');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// allow static file useage
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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
app.get('/cells/search', async (req, res) => {
  let db;
  const { query, limit, offset, order } = req.query;

  let searchArg = {};

  if (query) {
    try {
      searchArg = JSON.parse(decodeURIComponent(query));
    } catch (e) {
      return res.status(400).send('Invalid query parameter');
    }
  } else {
    // Use the simpler format if no complex query is provided
    const { field, op, val } = req.query;
    searchArg = {
      field: field,
      op: op,
      val: val,
    };
  }

  // Handle pagination and sorting parameters
  if (limit) searchArg.limit = parseInt(limit);
  if (offset) searchArg.offset = parseInt(offset);
  if (order) searchArg.order = order;

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
    console.log(cells);
    // Return the result:
    if (req.accepts('html')) {
      ejs.renderFile('./views/cellstable.ejs', { cells }, {}, (err, str) => {
        if (err) {
          throw err;
        }
        res.send(str);
      });
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

// Post Function Pertubations
app.post('/pertubations', async (req, res) => {
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
    console.log(`Created new Perturbagens record:\n${newperdid}`);
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
