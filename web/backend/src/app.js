const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Core Global Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('Welcome to The Prepvers API');
});

// API Routes
app.use('/api', routes);

// Error Handling (Must be last)
app.use(errorHandler);

module.exports = app;
