// GridGuard AI — Bob Chat Routes
// POST /api/bob/chat — Send a message to IBM Bob Grid Advisor

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const BOB_SERVICE_URL = process.env.BOB_SERVICE_URL || 'http://localhost:8002';

// POST /api/bob/chat — Conversational AI advisor
router.post('/chat', asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      error: true,
      message: 'A non-empty "message" field is required.',
    });
  }

  // Gather grid context for Bob
  const [riskRes, weatherRes, planRes, incidentRes] = await Promise.all([
    query(`
      SELECT DISTINCT ON (rs.asset_id)
        rs.asset_id, rs.risk_score, rs.risk_level, rs.failure_prob_7d,
        rs.grid_impact_severity, rs.factors_json, a.name, a.substation
      FROM risk_scores rs
      JOIN assets a ON a.id = rs.asset_id
      ORDER BY rs.asset_id, rs.computed_at DESC
    `),
    query(`
      SELECT DISTINCT ON (location_name)
        location_name, temp_c, wind_kph, storm_probability, condition
      FROM weather_forecasts
      ORDER BY location_name, forecast_time DESC
    `),
    query(`
      SELECT mp.asset_id, mp.priority, mp.action, mp.crew_type, mp.crew_size,
             mp.justification, a.name AS asset_name
      FROM maintenance_plans mp
      JOIN assets a ON a.id = mp.asset_id
      WHERE mp.status = 'pending'
      ORDER BY mp.priority ASC
      LIMIT 10
    `),
    query(`
      SELECT i.asset_id, i.type, i.cause, i.incident_date, i.duration_hours,
             i.customers_affected, a.name AS asset_name
      FROM incidents i
      JOIN assets a ON a.id = i.asset_id
      ORDER BY i.incident_date DESC
      LIMIT 10
    `),
  ]);

  const gridContext = {
    risk_results: riskRes.rows.map(r => ({
      asset_id: r.asset_id,
      asset_name: r.name,
      substation: r.substation,
      risk_score: parseFloat(r.risk_score),
      risk_level: r.risk_level,
      failure_prob_7d: parseFloat(r.failure_prob_7d),
      grid_impact_severity: parseFloat(r.grid_impact_severity),
      factors: r.factors_json,
    })),
    weather: weatherRes.rows.map(w => ({
      location: w.location_name,
      temp_c: parseFloat(w.temp_c),
      wind_kph: parseFloat(w.wind_kph),
      storm_probability: parseFloat(w.storm_probability),
      condition: w.condition,
    })),
    maintenance_plan: planRes.rows.map(p => ({
      asset_id: p.asset_id,
      asset_name: p.asset_name,
      priority: p.priority,
      action: p.action,
      crew_type: p.crew_type,
      crew_size: p.crew_size,
      justification: p.justification,
    })),
    recent_incidents: incidentRes.rows.map(i => ({
      asset_id: i.asset_id,
      asset_name: i.asset_name,
      type: i.type,
      cause: i.cause,
      date: i.incident_date,
      duration_hours: parseFloat(i.duration_hours),
      customers_affected: i.customers_affected,
    })),
  };

  // Call Bob service
  try {
    const response = await fetch(`${BOB_SERVICE_URL}/bob/advise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_message: message.trim(),
        grid_context: gridContext,
      }),
      signal: AbortSignal.timeout(60000), // LLM calls can take longer
    });

    if (!response.ok) {
      throw new Error(`Bob service returned ${response.status}: ${await response.text()}`);
    }

    const bobResult = await response.json();
    res.json({
      response: bobResult.advisor_response,
      recommended_actions: bobResult.recommended_actions || [],
      data_sources_used: bobResult.data_sources_used || [],
      confidence: bobResult.confidence || null,
    });
  } catch (err) {
    console.error('[Bob] Service call failed:', err.message);
    return res.status(502).json({
      error: true,
      message: 'IBM Bob advisory service is unavailable. Please ensure the bob-service is running on port 8002.',
      details: err.message,
    });
  }
}));

module.exports = router;
