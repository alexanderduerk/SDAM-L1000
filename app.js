// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const Cells = require('./cells');

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

const {
  server: { port },
} = require('./config');
// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
