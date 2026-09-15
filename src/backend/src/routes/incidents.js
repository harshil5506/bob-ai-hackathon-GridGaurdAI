const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/incidents - Historical incidents and cost metrics
router.get('/', async (req, res, next) => {
  try {
    const { asset_id } = req.query;
    let query = `
      SELECT i.*, a.name as asset_name, a.asset_type
      FROM incident_history i
      JOIN assets a ON i.asset_id = a.id
    `;
    const params = [];
    if (asset_id) {
      params.push(asset_id);
      query += ` WHERE i.asset_id = $1`;
    }
    query += ` ORDER BY i.occurred_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.warn('[Incidents Route] DB query failed, serving mock fallback data:', err.message);
    const mockIncidents = [
      { id: 101, asset_id: 'SUB-001', asset_name: 'Northside Substation Alpha', asset_type: 'TRANSFORMER', incident_type: 'OVERHEATING_TRIP', occurred_at: '2025-08-14T14:30:00Z', outage_duration_hours: 4.5, direct_repair_cost_usd: 145000, estimated_financial_exposure_usd_hr: 95000 }
    ];
    res.json({ success: true, count: mockIncidents.length, data: mockIncidents, fallback: true });
  }
});

module.exports = router;