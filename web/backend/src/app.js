const express = require('express');
const app = express();

// Core Global Middlewares
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.send('Welcome to The Prepvers API');
});

module.exports = app;
