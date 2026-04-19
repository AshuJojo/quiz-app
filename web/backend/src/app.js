const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');
const paperRoutes = require('./routes/paperRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
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
app.use('/api/exams', examRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling (Must be last)
app.use(errorHandler);

module.exports = app;
