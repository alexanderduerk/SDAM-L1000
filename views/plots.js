/** Generate a plotting request related to current searcharg values */

// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const bodyParser = require('body-parser');
// eslint-disable-next-line import/no-unresolved
const Cells = require('./cells');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// allow static file useage
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON data (if needed, for other parts of your app)
app.use(bodyParser.json());

// Basic route
app.get('/', (req, res) => {
  res.render('index');
});

/**
 * Search Request for the Cellinfos table (unique cell)
 */
app.post('/cells/plots', async (req, res) => {
  let db;
  // Extract all relevant fields from req.body
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    req.body;

  // Construct the searchArg object with potential descendants
  const searchArg = {
    field,
    op,
    val,
    limit,
    offset,
    order,
    orderfield,
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

    console.log(`Plotted Cells:`);
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

  // Basic code structure for creating a plot (siginfo.ejs contains API for chartjs library)

  // Creating scatter chart with mutliple hues
  const xValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

  new Chart('myChart', {
    type: 'scatter',
    data: {
      labels: xValues,
      datasets: [
        {
          data: [860, 1140, 1060, 1060, 1070, 1110, 1330, 2210, 7830, 2478],
          borderColor: 'red',
          fill: false,
        },
        {
          data: [1600, 1700, 1700, 1900, 2000, 2700, 4000, 5000, 6000, 7000],
          borderColor: 'green',
          fill: false,
        },
        {
          data: [300, 700, 2000, 5000, 6000, 4000, 2000, 1000, 200, 100],
          borderColor: 'blue',
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: false },
    },
  });
});

const {
  server: { port },
} = require('./config');
// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
