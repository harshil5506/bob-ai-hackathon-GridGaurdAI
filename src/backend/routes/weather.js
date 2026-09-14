// GridGuard AI — Weather Routes
// GET /api/weather — Weather forecasts for all grid locations

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/weather — Grouped by location with current + forecast
router.get('/', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT * FROM weather_forecasts
    ORDER BY location_name, forecast_time ASC
  `);

  // Group by location
  const locationMap = {};
  for (const row of result.rows) {
    const key = row.location_name;
    if (!locationMap[key]) {
      locationMap[key] = {
        location_name: row.location_name,
        location: {
          lat: parseFloat(row.location_lat),
          lng: parseFloat(row.location_lng),
        },
        forecasts: [],
      };
    }
    locationMap[key].forecasts.push({
      forecast_time: row.forecast_time,
      temp_c: parseFloat(row.temp_c),
      wind_kph: parseFloat(row.wind_kph),
      precip_mm: parseFloat(row.precip_mm),
      humidity_pct: parseFloat(row.humidity_pct),
      storm_probability: parseFloat(row.storm_probability),
      condition: row.condition,
    });
  }

  const locations = Object.values(locationMap).map(loc => {
    const current = loc.forecasts[0] || null;
    const maxStorm = Math.max(...loc.forecasts.map(f => f.storm_probability));
    return {
      ...loc,
      current,
      weather_risk_score: maxStorm,
    };
  });

  res.json({ forecasts: locations });
}));

module.exports = router;
