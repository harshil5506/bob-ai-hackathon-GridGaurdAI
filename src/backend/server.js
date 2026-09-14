// GridGuard AI — Express Backend Server
// Main entry point: configures middleware, routes, and starts listening

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
const { healthCheck } = require('./db/connection');

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbOk = await healthCheck();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'healthy' : 'degraded',
    service: 'gridguard-backend',
    database: dbOk ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/assets',      require('./routes/assets'));
app.use('/api/weather',     require('./routes/weather'));
app.use('/api/incidents',   require('./routes/incidents'));
app.use('/api/risk',        require('./routes/risk'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/bob',         require('./routes/bob'));

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║    ⚡ GridGuard AI — Backend Server              ║
║    Port: ${PORT}                                   ║
║    API:  http://localhost:${PORT}/api               ║
╚══════════════════════════════════════════════════╝
    `);
  });
}

module.exports = app;
