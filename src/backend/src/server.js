const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

// Route Imports
const healthRoutes = require('./routes/health');
const assetsRoutes = require('./routes/assets');
const telemetryRoutes = require('./routes/telemetry');
const weatherRoutes = require('./routes/weather');
const incidentsRoutes = require('./routes/incidents');
const riskRoutes = require('./routes/riskAssessments');
const recommendationsRoutes = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Register API Routes
app.use('/api/health', healthRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/risk-assessments', riskRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'GridGuard AI Backend API',
    problem: 'U1: Power Outage Prediction & Grid Equipment Failure Advisor',
    docs: '/api/health',
  });
});

// Centralized Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 GridGuard AI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Healthcheck available at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;