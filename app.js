// require the modules
const express = require('express');
const path = require('path');

const app = express();
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const ejs = require('ejs');
const bodyParser = require('body-parser');

const Cells = require('./cells');
const Genes = require('./genes');
const Perturbagens = require('./pertubations');
const Signatureinfo = require('./siginfo');

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

// Basic route for homepage
app.get('/', (req, res) => {
  res.render('index');
});

// Basic route for about
app.get('/about', (req, res) => {
  res.render('about');
});

// Basic route for contact
app.get('/contact', (req, res) => {
  res.render('contact');
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
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

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
 * Search Request for the Cellinfos table
 */
app.post('/cells/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const cells = await Cells.searchUI(
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
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
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
 * Search Request for the Cellinfos table
 */
app.post('/genes/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const genes = await Genes.searchUI(
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
        'genes.ejs',
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
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

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

/**
 * Search Request for the Pertubations table
 */
app.post('/perturbations/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const compounds = await Perturbagens.searchUI(
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

// Post Function sig_info
app.post('/siginfo', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');
    // Log the request body to check its contents
    console.log('Request Body:', req.body);
    // Create a new instance of the signature_infos class
    const Signatureinstance = new Signatureinfo(req.body);
    // Call Create One on the instance
    const newsigid = await Signatureinstance.createOne(db);
    console.log(`Created new Signature record:`);
    console.log(newsigid);
    res.json(newsigid);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

app.post('/siginfo/searchUI', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

  // Handle pagination and sorting parameters
  // searchArgObject.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  // searchArgObject.offset = req.body.offset
  //   ? parseInt(req.body.offset)
  //   : undefined;
  // searchArgObject.order = req.body.order || undefined;
  // console.log(searchArgObject);
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const signatures = await Signatureinfo.searchUI(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found signatures:`);
    console.log(signatures);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfo.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
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

app.post('/siginfo/search', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

  // Handle pagination and sorting parameters
  // searchArgObject.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  // searchArgObject.offset = req.body.offset
  //   ? parseInt(req.body.offset)
  //   : undefined;
  // searchArgObject.order = req.body.order || undefined;
  // console.log(searchArgObject);
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const signatures = await Signatureinfo.search(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );

    console.log(`Found signatures:`);
    // console.log(signatures);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfo.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
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
app.delete('/siginfo', async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });
    console.log('Connected successfully');

    // Extract the pert_id from the request body
    const { sig_name } = req.body;
    console.log('Request Body:', req.body);

    // Create a new instance of the Perturbagens class (if needed for any purpose)
    // const Pertubagensinstance = new Perturbagens(req.body);

    // Call deleteOne function
    await Signatureinfo.deleteOne(db, sig_name);
    console.log(`Deleted Pertubagens record with pert_id: ${sig_name}`);
    res
      .status(200)
      .send(`Deleted Pertubagens record with pert_id: ${sig_name}`);
  } catch (err) {
    console.log(err);
    res.status(400).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

// Patch Signatures
app.patch(`/siginfo`, async (req, res) => {
  let db;
  try {
    db = await sqlite.open({
      filename: `./l1000.db`,
      driver: sqlite3.Database,
    });
    console.log(`Connected successfully`);

    // Extract the pert_id to be updated from request body
    const { sig_name, column, newvalue } = req.body;

    // Validate input
    if (!sig_name || !column || newvalue === undefined) {
      return res.status(400).send('Bad request: Missing fields');
    }

    const updatedSignatureinfo = Signatureinfo.updateOne(
      db,
      sig_name,
      column,
      newvalue
    );
    // Send a success response
    res
      .status(200)
      .send(`Updated signature record with sig_namme: ${sig_name}`);
    console.log('Updated Signature record:');
    console.log(updatedSignatureinfo);
    res.json(updatedSignatureinfo);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } finally {
    if (db) {
      await db.close();
    }
  }
});

app.post('/genetargets', async (req, res) => {
  let db;
  // Retrieve the searchArg JSON string from the request body
  const searchArgString = req.body.searchArg;
  console.log('Request Body:', searchArgString);

  // Parse the JSON string into an object
  let searchArg;
  try {
    searchArg = JSON.parse(searchArgString);
  } catch (e) {
    console.error('Error parsing searchArg:', e);
    return res.status(400).send('Invalid searchArg format.');
  }

  // Construct the searchArg object
  const { limit, offset, order, descendants, field, op, val, orderfield } =
    searchArg;

  const searchArgObject = {
    field,
    op,
    val,
    limit: parseInt(limit, 10) || 10, // Convert to number with a default value
    offset: parseInt(offset, 10) || 0, // Convert to number with a default value
    order,
    orderfield,
    descendants: Array.isArray(descendants) ? descendants : [], // Ensure descendants is an array
  };

  //Handle pagination and sorting parameters
  //searchArgObject.limit = req.body.limit ? parseInt(req.body.limit) : undefined;
  //searchArgObject.offset = req.body.offset
  //  ? parseInt(req.body.offset)
  //  : undefined;
  //searchArgObject.order = req.body.order || undefined;
  //console.log(searchArgObject);
  try {
    // Connect to db
    db = await sqlite.open({
      filename: './l1000.db',
      driver: sqlite3.Database,
    });

    // Query the db
    const signatures = await Signatureinfo.searchcompounds(
      searchArgObject,
      searchArg.limit,
      searchArg.offset,
      db
    );
    console.log(`Found signatures:`);
    console.log(signatures);
    // Return the result:
    if (req.accepts('html')) {
      res.render(
        'siginfo.ejs',
        { data: signatures, siteSearchArg: searchArgObject },
        (err, str) => {
          if (err) {
            throw err;
          }
          res.send(str);
        }
      );
    } else if (req.accepts('json')) {
      // res.json(signatures);
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

const {
  server: { port },
} = require('./config');
// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
