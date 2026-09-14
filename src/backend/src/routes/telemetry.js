const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { validateBody } = require('../middleware/validator');

// GET /api/telemetry/:assetId - Time series sensor logs
router.get('/:assetId', async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    const result = await pool.query(
      `SELECT * FROM sensor_telemetry WHERE asset_id = $1 ORDER BY recorded_at DESC LIMIT $2`,
      [assetId, limit]
    );
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/telemetry - Ingest live telemetry readings
router.post(
  '/',
  validateBody(['asset_id', 'oil_temperature_c', 'winding_temperature_c', 'vibration_rms_mm_s', 'partial_discharge_pc', 'dga_hydrogen_h2_ppm', 'dga_acetylene_c2h2_ppm', 'load_pct']),
  async (req, res, next) => {
    try {
      const {
        asset_id,
        oil_temperature_c,
        winding_temperature_c,
        vibration_rms_mm_s,
        partial_discharge_pc,
        dga_hydrogen_h2_ppm,
        dga_acetylene_c2h2_ppm,
        load_pct,
        recorded_at,
      } = req.body;

      const result = await pool.query(
        `INSERT INTO sensor_telemetry 
         (asset_id, recorded_at, oil_temperature_c, winding_temperature_c, vibration_rms_mm_s, partial_discharge_pc, dga_hydrogen_h2_ppm, dga_acetylene_c2h2_ppm, load_pct)
         VALUES ($1, COALESCE($2, NOW()), $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [asset_id, recorded_at, oil_temperature_c, winding_temperature_c, vibration_rms_mm_s, partial_discharge_pc, dga_hydrogen_h2_ppm, dga_acetylene_c2h2_ppm, load_pct]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;