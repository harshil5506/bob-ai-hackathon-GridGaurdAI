// GridGuard AI — Risk Routes
// POST /api/risk/calculate — Trigger AI engine risk analysis
// GET  /api/risk/results   — Get latest computed risk scores

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8001';

// POST /api/risk/calculate — Call AI engine to compute risk scores
router.post('/calculate', asyncHandler(async (req, res) => {
  // 1. Gather all data the AI engine needs
  const [assetsRes, sensorsRes, weatherRes, incidentsRes] = await Promise.all([
    query(`SELECT * FROM assets`),
    query(`
      SELECT DISTINCT ON (asset_id) *
      FROM sensor_readings
      ORDER BY asset_id, recorded_at DESC
    `),
    query(`SELECT * FROM weather_forecasts ORDER BY forecast_time ASC`),
    query(`SELECT * FROM incidents ORDER BY incident_date DESC`),
  ]);

  const payload = {
    assets: assetsRes.rows,
    sensors: sensorsRes.rows,
    weather: weatherRes.rows,
    incidents: incidentsRes.rows,
  };

  // 2. Call AI engine
  let riskResults;
  try {
    const response = await fetch(`${AI_ENGINE_URL}/analyze/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`AI engine returned ${response.status}: ${await response.text()}`);
    }
    riskResults = await response.json();
  } catch (err) {
    console.error('[Risk] AI engine call failed:', err.message);
    return res.status(502).json({
      error: true,
      message: 'AI engine is unavailable. Please ensure the ai-engine service is running on port 8001.',
      details: err.message,
    });
  }

  // 3. Store risk scores in database
  for (const result of riskResults.risk_results) {
    await query(`
      INSERT INTO risk_scores
        (asset_id, risk_score, risk_level, failure_prob_7d, grid_impact_severity,
         factors_json, sensor_health, weather_exposure, historical_risk, age_condition)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      result.asset_id,
      result.risk_score,
      result.risk_level,
      result.failure_probability_7d,
      result.grid_impact_severity,
      JSON.stringify(result.contributing_factors),
      result.component_scores?.sensor_health || 0,
      result.component_scores?.weather_exposure || 0,
      result.component_scores?.historical_risk || 0,
      result.component_scores?.age_condition || 0,
    ]);
  }

  // 4. Store maintenance recommendations if present
  if (riskResults.maintenance_recommendations) {
    // Clear old pending plans
    await query(`DELETE FROM maintenance_plans WHERE status = 'pending'`);

    for (const rec of riskResults.maintenance_recommendations) {
      await query(`
        INSERT INTO maintenance_plans
          (asset_id, priority, action, crew_type, crew_size,
           staging_lat, staging_lng, staging_name,
           recommended_by, estimated_downtime_hours, justification)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        rec.asset_id,
        rec.priority,
        rec.action,
        rec.crew_type,
        rec.crew_size,
        rec.staging_location?.lat,
        rec.staging_location?.lng,
        rec.staging_location?.name,
        rec.recommended_by,
        rec.estimated_downtime_hours,
        rec.justification,
      ]);
    }
  }

  res.json({
    message: 'Risk analysis complete',
    assets_analyzed: riskResults.risk_results.length,
    results: riskResults.risk_results,
    maintenance_recommendations: riskResults.maintenance_recommendations || [],
  });
}));

// GET /api/risk/results — Latest risk scores for all assets
router.get('/results', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT DISTINCT ON (rs.asset_id)
      rs.*, a.name AS asset_name, a.substation, a.type AS asset_type,
      a.customers_served
    FROM risk_scores rs
    JOIN assets a ON a.id = rs.asset_id
    ORDER BY rs.asset_id, rs.computed_at DESC
  `);

  const results = result.rows.map(row => ({
    asset_id: row.asset_id,
    asset_name: row.asset_name,
    substation: row.substation,
    asset_type: row.asset_type,
    customers_served: row.customers_served,
    risk_score: parseFloat(row.risk_score),
    risk_level: row.risk_level,
    failure_prob_7d: parseFloat(row.failure_prob_7d),
    grid_impact_severity: parseFloat(row.grid_impact_severity),
    contributing_factors: row.factors_json,
    component_scores: {
      sensor_health: parseFloat(row.sensor_health),
      weather_exposure: parseFloat(row.weather_exposure),
      historical_risk: parseFloat(row.historical_risk),
      age_condition: parseFloat(row.age_condition),
    },
    computed_at: row.computed_at,
  }));

  res.json({ results, total: results.length });
}));

module.exports = router;
