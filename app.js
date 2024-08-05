// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const Cells = require('./cells');
const Mainviews = require('./mainviews');
const Pertubagens = require('./pertubations');

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

// Get Function for Pertubations db 
app.get('/pertubations/:pert_id', async (req, res) => {
  let db;
  try {
    db = await open ({
      filename: `./l1000.db`, 
      driver: sqlite3.Database
    });
    // Extract pert_id, column and newvalue from the request body 
    const {pert_id} = req.params;
  }
  // Create new instance of the pertubagensget function
  const Perturbagens = newPerturbagens();
  // Call the retriveOne in get.function from pertubations.js to get the data
  const perturbagen = await Perturbagens.retrieveOne(db, pert_id);
  if (perturbagen) {
    res.status(200).jon(perturbagen);
  }
  else {
    res.status(404).send(`Pertubagen not found`);
  }
  } catch(err) {
    console.error(err);
    res.status(500).send(`Internal server error`);
    finally {
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
    const Pertubagensinstance = new Pertubagens(req.body);
    // Call Create One on the instance
    const newperdid = await Pertubagensinstance.createOne(db);
    console.log(`Created new Pertubagens record:\n${newperdid}`);
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
    const { pert_id } = req.body;
    console.log('Request Body:', req.body);

    // Create a new instance of the Perturbagens class (if needed for any purpose)
    // const Pertubagensinstance = new Perturbagens(req.body);

    // Call deleteOne function
    const Pertubagensinstance = new Perturbagens({});
    await Pertubagensinstance.deleteOne(db, pert_id);
    console.log(`Deleted Pertubagens record with pert_id: ${pert_id}`);
    res.status(200).send(`Deleted Pertubagens record with pert_id: ${pert_id}`);
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

    //Extract the pert_id to be updated from request body
    const { pert_id, column, newvalue } = req.body;

    // Validate input
    if (!pert_id || !column || newvalue === undefined) {
      return res.status(400).send('Bad request: Missing fields');
    }

    // Construct and execute SQL update statement
    const sql = `UPDATE pertubagens SET ${column} = ? WHERE pert_id = ?`;
    await db.run(sql, [newvalue, pert_id]);

    // Send a success response
    res.status(200).send(`Updated pertubagens record with pert_id: ${pert_id}`);
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
