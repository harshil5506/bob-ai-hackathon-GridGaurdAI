const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/weather - Latest forecasts by substation
router.get('/', async (req, res, next) => {
  try {
    const { substation_id } = req.query;
    let query = `
      SELECT DISTINCT ON (substation_id) w.*, s.name as substation_name, s.region
      FROM weather_forecasts w
      JOIN substations s ON w.substation_id = s.id
    `;
    const params = [];
    if (substation_id) {
      params.push(substation_id);
      query += ` WHERE w.substation_id = $1`;
    }
    query += ` ORDER BY substation_id, forecast_time DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/weather/alerts - Active storm / extreme weather alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT w.*, s.name as substation_name, s.region
      FROM weather_forecasts w
      JOIN substations s ON w.substation_id = s.id
      WHERE storm_alert_level IN ('SEVERE', 'EXTREME')
      ORDER BY w.wind_gust_kmh DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;