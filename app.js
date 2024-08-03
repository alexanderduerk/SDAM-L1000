// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const Cells = require('./cells');
const Mainviews = require('./mainviews');

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
  const field = req.query.field;
  const op = req.query.op;
  const val = req.query.val;

  const searchArg = {
    field: field,
    op: op,
    val: val,
  };
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const cells = await Cells.search(searchArg, undefined, undefined, db);

    console.log(`Found Cells:`);
    console.log(cells);

    res.json(cells);

    // Return the result:
    // if ( req.accepts('html') ) {
    //  ejs.
    // }
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
