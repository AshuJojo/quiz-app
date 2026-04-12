const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Core Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('Welcome to The Prepvers API');
});

// API Routes
app.use('/api/users', userRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

module.exports = app;
