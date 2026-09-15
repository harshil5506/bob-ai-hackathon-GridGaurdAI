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
    console.warn('[Assets Route] DB query failed, serving mock fallback data:', err.message);
    const mockAssets = [
      { id: 'SUB-001', name: 'Northside Substation Alpha', asset_type: 'TRANSFORMER', status: 'CRITICAL', criticality_tier: 1, downstream_customers: 45000, substation_name: 'Northside Substation Alpha', region: 'Sector 1' },
      { id: 'SUB-002', name: 'Downtown Feeder Beta', asset_type: 'FEEDER_LINE', status: 'WARNING', criticality_tier: 2, downstream_customers: 28000, substation_name: 'Downtown Feeder Beta', region: 'Sector 2' },
      { id: 'SUB-003', name: 'Metro Grid Hub Gamma', asset_type: 'TRANSFORMER', status: 'NORMAL', criticality_tier: 1, downstream_customers: 52000, substation_name: 'Metro Grid Hub Gamma', region: 'Sector 3' },
      { id: 'SUB-004', name: 'Eastside Line Delta', asset_type: 'CIRCUIT_BREAKER', status: 'WARNING', criticality_tier: 2, downstream_customers: 19000, substation_name: 'Eastside Line Delta', region: 'Sector 4' },
      { id: 'SUB-005', name: 'West Industrial Epsilon', asset_type: 'SUBSTATION_UNIT', status: 'NORMAL', criticality_tier: 3, downstream_customers: 12000, substation_name: 'West Industrial Epsilon', region: 'Sector 5' },
    ];
    res.json({ success: true, count: mockAssets.length, data: mockAssets, fallback: true });
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