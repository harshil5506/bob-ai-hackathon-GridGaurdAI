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
    next(err);
  }
});

module.exports = router;