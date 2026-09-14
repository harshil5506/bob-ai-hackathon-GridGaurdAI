// GridGuard AI — Incident Routes
// GET /api/incidents — Historical outage/incident records

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/incidents — All incidents, optionally filtered by asset
router.get('/', asyncHandler(async (req, res) => {
  const { asset_id, limit } = req.query;

  let sql = `
    SELECT i.*, a.name AS asset_name, a.substation
    FROM incidents i
    JOIN assets a ON a.id = i.asset_id
  `;
  const params = [];

  if (asset_id) {
    params.push(asset_id);
    sql += ` WHERE i.asset_id = $${params.length}`;
  }

  sql += ' ORDER BY i.incident_date DESC';

  if (limit) {
    params.push(parseInt(limit, 10));
    sql += ` LIMIT $${params.length}`;
  }

  const result = await query(sql, params);

  const incidents = result.rows.map(row => ({
    id: row.id,
    asset_id: row.asset_id,
    asset_name: row.asset_name,
    substation: row.substation,
    date: row.incident_date,
    type: row.type,
    cause: row.cause,
    duration_hours: parseFloat(row.duration_hours),
    customers_affected: row.customers_affected,
    weather_at_time: {
      temp_c: row.weather_temp_c ? parseFloat(row.weather_temp_c) : null,
      wind_kph: row.weather_wind_kph ? parseFloat(row.weather_wind_kph) : null,
    },
    resolution: row.resolution,
  }));

  res.json({ incidents, total: incidents.length });
}));

module.exports = router;
