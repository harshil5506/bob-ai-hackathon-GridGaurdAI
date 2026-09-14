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

module.exports = router;