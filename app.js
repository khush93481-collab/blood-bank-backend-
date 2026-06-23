const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error Handler (always last)
app.use(errorHandler);

module.exports = app;