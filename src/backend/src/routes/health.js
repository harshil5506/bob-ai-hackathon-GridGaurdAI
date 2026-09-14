const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'connected';
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    dbStatus = `disconnected (${err.message})`;
  }

  res.json({
    success: true,
    service: 'GridGuard AI Backend API',
    status: 'UP',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;