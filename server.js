'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { PORT } = require('./config');
const folderRouter = require('./routes/folders'); 
const notesRouter = require('./routes/notes');
const tagsRouter = require('./routes/tags'); 

// Create an Express application
const app = express();

// Log all requests
app.use(morgan('dev'));

// Create a static webserver
app.use(express.static('public'));

// Enable CORS support
app.use(cors());

// Parse request body
app.use(express.json());

// Mount router on "/api"
app.use('/api/notes', notesRouter);
app.use('/api/folders', folderRouter); 
app.use('/api/tags', tagsRouter); 
// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Listen for incoming connections
if (require.main === module) {
  app.listen(PORT, function () {
    // eslint-disable-next-line no-console
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    // eslint-disable-next-line no-console
    console.error(err);
  });
}

module.exports = app; 