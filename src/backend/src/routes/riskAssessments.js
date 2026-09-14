const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateBody } = require('../middleware/validator');

// GET /api/risk-assessments - Assets ranked by outage risk and grid impact severity
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (r.asset_id) 
        r.*, 
        a.name as asset_name, 
        a.asset_type, 
        a.criticality_tier,
        a.downstream_customers,
        s.name as substation_name,
        s.region
      FROM risk_assessments r
      JOIN assets a ON r.asset_id = a.id
      JOIN substations s ON a.substation_id = s.id
      ORDER BY r.asset_id, r.assessed_at DESC
    `);

    // Sort by Outage Risk Score descending
    const ranked = result.rows.sort((a, b) => parseFloat(b.outage_risk_score) - parseFloat(a.outage_risk_score));
    res.json({ success: true, count: ranked.length, data: ranked });
  } catch (err) {
    next(err);
  }
});

// POST /api/risk-assessments - Ingestion endpoint for Person 3 (AI Engine)
router.post(
  '/',
  validateBody(['asset_id', 'failure_probability_7d', 'outage_risk_score', 'grid_impact_severity', 'estimated_financial_exposure_usd_hr', 'primary_risk_driver']),
  async (req, res, next) => {
    try {
      const {
        asset_id,
        failure_probability_7d,
        outage_risk_score,
        grid_impact_severity,
        estimated_financial_exposure_usd_hr,
        primary_risk_driver,
        anomaly_flags,
        model_version,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO risk_assessments
         (asset_id, failure_probability_7d, outage_risk_score, grid_impact_severity, estimated_financial_exposure_usd_hr, primary_risk_driver, anomaly_flags, model_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          asset_id,
          failure_probability_7d,
          outage_risk_score,
          grid_impact_severity,
          estimated_financial_exposure_usd_hr,
          primary_risk_driver,
          JSON.stringify(anomaly_flags || []),
          model_version || 'v1.0.0',
        ]
      );

      // Also update asset status if severity is CRITICAL
      if (grid_impact_severity === 'CRITICAL') {
        await pool.query(`UPDATE assets SET status = 'CRITICAL', updated_at = NOW() WHERE id = $1`, [asset_id]);
      }

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/risk-assessments/calculate (or /run) - Trigger AI Engine risk scoring and sync to DB
router.post(['/calculate', '/run'], async (req, res, next) => {
  try {
    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8001';

    // 1. Fetch grid context from PostgreSQL
    const [assetsRes, telemetryRes, weatherRes, incidentsRes] = await Promise.all([
      pool.query(`
        SELECT a.*, s.name as substation_name, s.latitude, s.longitude, s.region
        FROM assets a
        JOIN substations s ON a.substation_id = s.id
      `),
      pool.query(`
        SELECT DISTINCT ON (asset_id) *
        FROM sensor_telemetry
        ORDER BY asset_id, recorded_at DESC
      `),
      pool.query(`SELECT * FROM weather_forecasts ORDER BY forecast_time ASC`),
      pool.query(`SELECT * FROM incident_history ORDER BY occurred_at DESC`),
    ]);

    const payload = {
      assets: (req.body && req.body.assets && req.body.assets.length > 0) ? req.body.assets : assetsRes.rows,
      sensors: (req.body && req.body.sensors && req.body.sensors.length > 0) ? req.body.sensors : telemetryRes.rows,
      weather: (req.body && req.body.weather && req.body.weather.length > 0) ? req.body.weather : weatherRes.rows,
      incidents: (req.body && req.body.incidents && req.body.incidents.length > 0) ? req.body.incidents : incidentsRes.rows,
    };

    // 2. Call AI Engine
    const aiResponse = await fetch(`${AI_ENGINE_URL}/analyze/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI Engine responded with HTTP ${aiResponse.status}: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const riskResults = aiData.risk_results || [];
    const recommendations = aiData.maintenance_recommendations || [];

    // 3. Persist Risk Assessments into Database
    const savedAssessments = [];
    for (const item of riskResults) {
      const score100 = item.outage_risk_score !== undefined
        ? item.outage_risk_score
        : (item.risk_score ? Math.round(item.risk_score * 1000) / 10 : 0);

      const dbRes = await pool.query(
        `INSERT INTO risk_assessments
         (asset_id, failure_probability_7d, outage_risk_score, grid_impact_severity, estimated_financial_exposure_usd_hr, primary_risk_driver, anomaly_flags, model_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          item.asset_id,
          item.failure_probability_7d || item.failure_prob_7d || 0,
          score100,
          item.risk_level || (item.grid_impact_severity > 7 ? 'CRITICAL' : 'HIGH'),
          item.estimated_financial_exposure_usd_hr || 0,
          item.primary_risk_driver || 'Multi-factor risk index',
          JSON.stringify(item.anomaly_flags || item.contributing_factors || []),
          item.model_version || 'v1.0.0-ai-engine',
        ]
      );
      savedAssessments.push(dbRes.rows[0]);

      if (item.risk_level === 'CRITICAL') {
        await pool.query(`UPDATE assets SET status = 'CRITICAL', updated_at = NOW() WHERE id = $1`, [item.asset_id]);
      }
    }

    // 4. Persist Maintenance Recommendations if present
    const savedRecommendations = [];
    for (const rec of recommendations) {
      const recId = `REC-${Date.now()}-${rec.asset_id}`;
      const recUrgency = rec.urgency || (rec.risk_level === 'CRITICAL' ? 'IMMEDIATE' : 'URGENT_24H');
      const recAction = rec.action || rec.recommended_action || 'Inspect asset';
      const recReason = rec.justification || rec.bob_reasoning_summary || 'AI detected risk escalation';
      const stagingZone = rec.staging_location?.name || rec.crew_staging_zone || 'Central Metro Depot';
      const crewType = rec.crew_type || rec.crew_type_required || 'HV_TRANSFORMER_SPECIALIST';
      const repairHours = rec.estimated_downtime_hours || rec.estimated_repair_hours || 4.0;

      try {
        const recDb = await pool.query(
          `INSERT INTO maintenance_recommendations
           (id, asset_id, urgency, recommended_action, bob_reasoning_summary, crew_staging_zone, crew_type_required, estimated_repair_hours, dispatch_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
           RETURNING *`,
          [recId, rec.asset_id, recUrgency, recAction, recReason, stagingZone, crewType, repairHours]
        );
        savedRecommendations.push(recDb.rows[0]);
      } catch (err) {
        console.warn(`[Recommendations] Duplicate or skip: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Grid risk analysis and recommendation pipeline complete',
      count: savedAssessments.length,
      data: savedAssessments,
      recommendations: savedRecommendations,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;