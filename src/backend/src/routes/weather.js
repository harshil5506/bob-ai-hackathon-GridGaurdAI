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
    console.warn('[Weather Route] DB query failed, serving mock fallback data:', err.message);
    const mockWeather = [
      { id: 1, substation_id: 'SUB-001', temperature_c: 38.5, wind_speed_kmh: 65, wind_gust_kmh: 88, storm_alert_level: 'SEVERE', lightning_density_sqkm: 4.2, substation_name: 'Northside Substation Alpha' },
      { id: 2, substation_id: 'SUB-002', temperature_c: 34.1, wind_speed_kmh: 42, wind_gust_kmh: 58, storm_alert_level: 'WARNING', lightning_density_sqkm: 1.8, substation_name: 'Downtown Feeder Beta' },
    ];
    res.json({ success: true, count: mockWeather.length, data: mockWeather, fallback: true });
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
    console.warn('[Weather Alerts Route] DB query failed, serving mock alert data:', err.message);
    const mockAlerts = [
      { id: 1, substation_id: 'SUB-001', temperature_c: 38.5, wind_gust_kmh: 88, storm_alert_level: 'SEVERE', substation_name: 'Northside Substation Alpha', region: 'Sector 1' }
    ];
    res.json({ success: true, count: mockAlerts.length, data: mockAlerts, fallback: true });
  }
});

module.exports = router;