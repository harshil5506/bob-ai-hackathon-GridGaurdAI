const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateBody } = require('../middleware/validator');

// GET /api/recommendations - List maintenance orders and crew staging plans
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT m.*, a.name as asset_name, a.downstream_customers, s.name as substation_name
      FROM maintenance_recommendations m
      JOIN assets a ON m.asset_id = a.id
      JOIN substations s ON a.substation_id = s.id
      ORDER BY 
        CASE m.urgency 
          WHEN 'IMMEDIATE' THEN 1 
          WHEN 'URGENT_24H' THEN 2 
          WHEN 'SCHEDULED_7D' THEN 3 
          ELSE 4 
        END,
        m.created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/recommendations - Ingestion endpoint for Person 4 (IBM Bob)
router.post(
  '/',
  validateBody(['id', 'asset_id', 'urgency', 'recommended_action', 'bob_reasoning_summary', 'crew_staging_zone', 'crew_type_required', 'estimated_repair_hours']),
  async (req, res, next) => {
    try {
      const {
        id,
        asset_id,
        urgency,
        recommended_action,
        bob_reasoning_summary,
        crew_staging_zone,
        crew_type_required,
        estimated_repair_hours,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO maintenance_recommendations
         (id, asset_id, urgency, recommended_action, bob_reasoning_summary, crew_staging_zone, crew_type_required, estimated_repair_hours, dispatch_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
         RETURNING *`,
        [id, asset_id, urgency, recommended_action, bob_reasoning_summary, crew_staging_zone, crew_type_required, estimated_repair_hours]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/recommendations/:id/dispatch - Dispatch crew action (Person 1 UI trigger)
router.patch('/:id/dispatch', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'DISPATCHED' } = req.body;
    const result = await pool.query(
      `UPDATE maintenance_recommendations SET dispatch_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: `Recommendation ${id} not found`, status: 404 } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;