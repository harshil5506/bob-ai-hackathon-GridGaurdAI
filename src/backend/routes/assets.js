// GridGuard AI — Asset Routes
// GET /api/assets       — List all assets with latest sensor readings
// GET /api/assets/:id   — Single asset with full sensor history

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/assets — All assets with latest sensor snapshot
router.get('/', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      a.*,
      sr.temperature_c,
      sr.vibration_mm_s,
      sr.partial_discharge_pc,
      sr.oil_quality_index,
      sr.load_pct,
      sr.humidity_pct,
      sr.recorded_at AS sensor_recorded_at,
      rs.risk_score,
      rs.risk_level,
      rs.failure_prob_7d,
      rs.grid_impact_severity,
      rs.factors_json,
      rs.computed_at AS risk_computed_at
    FROM assets a
    LEFT JOIN LATERAL (
      SELECT * FROM sensor_readings s
      WHERE s.asset_id = a.id
      ORDER BY s.recorded_at DESC
      LIMIT 1
    ) sr ON true
    LEFT JOIN LATERAL (
      SELECT * FROM risk_scores r
      WHERE r.asset_id = a.id
      ORDER BY r.computed_at DESC
      LIMIT 1
    ) rs ON true
    ORDER BY
      CASE WHEN rs.risk_level = 'CRITICAL' THEN 1
           WHEN rs.risk_level = 'HIGH' THEN 2
           WHEN rs.risk_level = 'MEDIUM' THEN 3
           ELSE 4 END,
      a.id
  `);

  const assets = result.rows.map(formatAsset);
  res.json({ assets, total: assets.length });
}));

// GET /api/assets/:id — Single asset with sensor history + incidents
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get asset
  const assetResult = await query('SELECT * FROM assets WHERE id = $1', [id]);
  if (assetResult.rows.length === 0) {
    return res.status(404).json({ error: true, message: `Asset ${id} not found` });
  }

  // Get sensor history (last 30 readings)
  const sensorResult = await query(`
    SELECT * FROM sensor_readings
    WHERE asset_id = $1
    ORDER BY recorded_at DESC
    LIMIT 30
  `, [id]);

  // Get incidents
  const incidentResult = await query(`
    SELECT * FROM incidents
    WHERE asset_id = $1
    ORDER BY incident_date DESC
  `, [id]);

  // Get latest risk score
  const riskResult = await query(`
    SELECT * FROM risk_scores
    WHERE asset_id = $1
    ORDER BY computed_at DESC
    LIMIT 1
  `, [id]);

  const asset = assetResult.rows[0];
  res.json({
    asset: {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      substation: asset.substation,
      location: { lat: parseFloat(asset.location_lat), lng: parseFloat(asset.location_lng) },
      voltage_kv: asset.voltage_kv,
      install_year: asset.install_year,
      customers_served: asset.customers_served,
      last_maintenance: asset.last_maintenance,
      status: asset.status,
    },
    sensor_history: sensorResult.rows.map(s => ({
      recorded_at: s.recorded_at,
      temperature_c: parseFloat(s.temperature_c),
      vibration_mm_s: parseFloat(s.vibration_mm_s),
      partial_discharge_pc: parseFloat(s.partial_discharge_pc),
      oil_quality_index: parseFloat(s.oil_quality_index),
      load_pct: parseFloat(s.load_pct),
      humidity_pct: parseFloat(s.humidity_pct),
    })),
    incidents: incidentResult.rows.map(i => ({
      id: i.id,
      date: i.incident_date,
      type: i.type,
      cause: i.cause,
      duration_hours: parseFloat(i.duration_hours),
      customers_affected: i.customers_affected,
      resolution: i.resolution,
    })),
    risk: riskResult.rows.length > 0 ? {
      risk_score: parseFloat(riskResult.rows[0].risk_score),
      risk_level: riskResult.rows[0].risk_level,
      failure_prob_7d: parseFloat(riskResult.rows[0].failure_prob_7d),
      grid_impact_severity: parseFloat(riskResult.rows[0].grid_impact_severity),
      factors: riskResult.rows[0].factors_json,
      computed_at: riskResult.rows[0].computed_at,
    } : null,
  });
}));

function formatAsset(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    substation: row.substation,
    location: { lat: parseFloat(row.location_lat), lng: parseFloat(row.location_lng) },
    voltage_kv: row.voltage_kv,
    install_year: row.install_year,
    customers_served: row.customers_served,
    last_maintenance: row.last_maintenance,
    status: row.status,
    sensors: row.temperature_c ? {
      temperature_c: parseFloat(row.temperature_c),
      vibration_mm_s: parseFloat(row.vibration_mm_s),
      partial_discharge_pc: parseFloat(row.partial_discharge_pc),
      oil_quality_index: parseFloat(row.oil_quality_index),
      load_pct: parseFloat(row.load_pct),
      humidity_pct: parseFloat(row.humidity_pct),
      recorded_at: row.sensor_recorded_at,
    } : null,
    risk: row.risk_score ? {
      risk_score: parseFloat(row.risk_score),
      risk_level: row.risk_level,
      failure_prob_7d: parseFloat(row.failure_prob_7d),
      grid_impact_severity: parseFloat(row.grid_impact_severity),
      factors: row.factors_json,
      computed_at: row.risk_computed_at,
    } : null,
  };
}

module.exports = router;
