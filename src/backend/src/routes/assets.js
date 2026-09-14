const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/assets - List all assets with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { status, substation_id, criticality_tier } = req.query;
    let query = `
      SELECT a.*, s.name as substation_name, s.region
      FROM assets a
      JOIN substations s ON a.substation_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND a.status = $${params.length}`;
    }
    if (substation_id) {
      params.push(substation_id);
      query += ` AND a.substation_id = $${params.length}`;
    }
    if (criticality_tier) {
      params.push(parseInt(criticality_tier, 10));
      query += ` AND a.criticality_tier = $${params.length}`;
    }

    query += ` ORDER BY a.criticality_tier ASC, a.id ASC`;
    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/assets/:id - Asset details + latest telemetry & active risk
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const assetRes = await pool.query(
      `SELECT a.*, s.name as substation_name, s.region, s.latitude, s.longitude
       FROM assets a
       JOIN substations s ON a.substation_id = s.id
       WHERE a.id = $1`,
      [id]
    );

    if (assetRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: `Asset ${id} not found`, status: 404 } });
    }

    const latestTel = await pool.query(
      `SELECT * FROM sensor_telemetry WHERE asset_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
      [id]
    );

    const latestRisk = await pool.query(
      `SELECT * FROM risk_assessments WHERE asset_id = $1 ORDER BY assessed_at DESC LIMIT 1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...assetRes.rows[0],
        latest_telemetry: latestTel.rows[0] || null,
        active_risk: latestRisk.rows[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;