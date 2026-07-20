const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/userRoutes');
const campRoutes = require('./routes/campRoutes');
const donorRoutes = require('./routes/donorRoutes'); 
const emergencyRequestRoutes = require('./routes/emergencyRequestRoutes');      // 👈 added
const swaggerUi = require('swagger-ui-express');        // 👈 added
const swaggerSpec = require('./config/swagger'); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/camps', campRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/emergency-requests', emergencyRequestRoutes);

// Swagger API Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));   // 👈 added

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error Handler (always last)
app.use(errorHandler);

module.exports = app;