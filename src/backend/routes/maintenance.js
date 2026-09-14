// GridGuard AI — Maintenance Plan Routes
// GET /api/maintenance/plan — Prioritised maintenance and crew pre-positioning plan

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/maintenance/plan — Get current maintenance plan
router.get('/plan', asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT mp.*, a.name AS asset_name, a.substation, a.type AS asset_type,
           a.customers_served, a.voltage_kv,
           rs.risk_score, rs.risk_level
    FROM maintenance_plans mp
    JOIN assets a ON a.id = mp.asset_id
    LEFT JOIN LATERAL (
      SELECT * FROM risk_scores r
      WHERE r.asset_id = mp.asset_id
      ORDER BY r.computed_at DESC
      LIMIT 1
    ) rs ON true
    WHERE mp.status IN ('pending', 'dispatched', 'in_progress')
    ORDER BY mp.priority ASC
  `);

  const plan = result.rows.map(row => ({
    id: row.id,
    priority: row.priority,
    asset_id: row.asset_id,
    asset_name: row.asset_name,
    substation: row.substation,
    asset_type: row.asset_type,
    voltage_kv: row.voltage_kv,
    customers_served: row.customers_served,
    action: row.action,
    crew_type: row.crew_type,
    crew_size: row.crew_size,
    staging_location: row.staging_lat ? {
      lat: parseFloat(row.staging_lat),
      lng: parseFloat(row.staging_lng),
      name: row.staging_name,
    } : null,
    recommended_by: row.recommended_by,
    estimated_downtime_hours: row.estimated_downtime_hours ? parseFloat(row.estimated_downtime_hours) : null,
    justification: row.justification,
    risk_score: row.risk_score ? parseFloat(row.risk_score) : null,
    risk_level: row.risk_level,
    status: row.status,
    generated_at: row.generated_at,
  }));

  res.json({
    generated_at: plan.length > 0 ? plan[0].generated_at : null,
    plan,
    total_work_orders: plan.length,
    total_crew_needed: plan.reduce((sum, p) => sum + p.crew_size, 0),
  });
}));

module.exports = router;
