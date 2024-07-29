// require the modules
const express = require('express');
const path = require('path');
const {
  server: { port },
} = require('./config');

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Specify the directory where your EJS templates are located
app.set('views', path.join(__dirname, 'views'));

// allow static file useage
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.render('index');
});

// Start the server
app.listen(port, () => {
  console.log('Server is running');
});
