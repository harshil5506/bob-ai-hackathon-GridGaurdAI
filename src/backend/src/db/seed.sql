-- 1. Seed Substations
INSERT INTO substations (id, name, region, latitude, longitude) VALUES
('SUB-NORTH-01', 'North Ridge Transmission Hub', 'Sector-A North', 40.785091, -73.968285),
('SUB-METRO-02', 'Downtown Metro Substation', 'Sector-B Metro', 40.712776, -74.005974),
('SUB-EAST-03',  'East River Industrial Substation', 'Sector-C East', 40.728157, -73.978572),
('SUB-VALLEY-04', 'Valley Forge Regional Depot', 'Sector-D West', 40.758896, -73.985130);

-- 2. Seed Assets
INSERT INTO assets (id, substation_id, name, asset_type, rating_mva, voltage_kv, installation_date, criticality_tier, downstream_customers, status) VALUES
('TF-NORTH-01', 'SUB-NORTH-01', 'North 230kV Core Transformer T-1', 'POWER_TRANSFORMER', 150.00, 230.00, '2012-04-15', 1, 48000, 'CRITICAL'),
('TF-NORTH-02', 'SUB-NORTH-01', 'North 115kV Feeder Transformer T-2', 'POWER_TRANSFORMER', 75.00, 115.00, '2016-08-20', 2, 22000, 'OPERATIONAL'),
('TF-METRO-01', 'SUB-METRO-02', 'Metro Grid Auto-Transformer M-1', 'POWER_TRANSFORMER', 200.00, 345.00, '2014-11-10', 1, 85000, 'DEGRADED'),
('TF-EAST-01',  'SUB-EAST-03',  'East Heavy Industrial Transformer E-1', 'POWER_TRANSFORMER', 120.00, 138.00, '2018-02-28', 2, 18000, 'OPERATIONAL'),
('CB-NORTH-01', 'SUB-NORTH-01', 'North Bus Circuit Breaker CB-101', 'CIRCUIT_BREAKER', 25.00, 230.00, '2019-06-15', 1, 48000, 'OPERATIONAL'),
('CB-METRO-02', 'SUB-METRO-02', 'Metro Feeder Breaker CB-204', 'CIRCUIT_BREAKER', 30.00, 115.00, '2015-09-12', 2, 35000, 'OPERATIONAL');

-- 3. Seed Sensor Telemetry (Demonstrating weeks of degradation for TF-NORTH-01)
INSERT INTO sensor_telemetry (asset_id, recorded_at, oil_temperature_c, winding_temperature_c, vibration_rms_mm_s, partial_discharge_pc, dga_hydrogen_h2_ppm, dga_acetylene_c2h2_ppm, load_pct) VALUES
-- TF-NORTH-01: Chronic degradation signature (Critical C2H2 & Partial Discharge)
('TF-NORTH-01', NOW() - INTERVAL '14 days', 65.0, 78.0, 2.5, 120.0, 65.0, 1.2, 70.0),
('TF-NORTH-01', NOW() - INTERVAL '7 days',  78.5, 92.0, 4.2, 280.0, 120.0, 3.8, 82.0),
('TF-NORTH-01', NOW() - INTERVAL '2 days',  88.0, 102.5, 5.8, 460.0, 175.0, 6.5, 89.0),
('TF-NORTH-01', NOW() - INTERVAL '1 hour',  96.4, 114.8, 7.6, 640.0, 225.0, 8.9, 93.5),

-- TF-METRO-01: High temperature thermal stress
('TF-METRO-01', NOW() - INTERVAL '7 days',  72.0, 84.0, 2.8, 95.0, 45.0, 0.4, 75.0),
('TF-METRO-01', NOW() - INTERVAL '1 hour',  89.2, 104.0, 3.9, 140.0, 65.0, 0.8, 91.0),

-- TF-EAST-01: Healthy baseline
('TF-EAST-01',  NOW() - INTERVAL '1 hour',  52.1, 61.4, 1.8, 45.0, 18.0, 0.1, 58.0);

-- 4. Seed Weather Forecasts (Storm front hitting Substation North-01)
INSERT INTO weather_forecasts (substation_id, forecast_time, temperature_c, wind_speed_kmh, wind_gust_kmh, precipitation_mm, lightning_strike_probability, storm_alert_level) VALUES
('SUB-NORTH-01', NOW() + INTERVAL '3 hours', 28.5, 52.0, 78.5, 34.0, 0.880, 'EXTREME'),
('SUB-NORTH-01', NOW() + INTERVAL '6 hours', 26.0, 45.0, 65.0, 22.0, 0.720, 'SEVERE'),
('SUB-METRO-02', NOW() + INTERVAL '3 hours', 34.2, 25.0, 38.0, 5.0,  0.250, 'MODERATE'),
('SUB-EAST-03',  NOW() + INTERVAL '3 hours', 31.0, 20.0, 30.0, 0.0,  0.100, 'NONE');

-- 5. Historical Incidents
INSERT INTO incident_history (id, asset_id, occurred_at, restored_at, duration_minutes, cause, customers_affected, estimated_loss_usd, weather_factor) VALUES
('INC-2023-014', 'TF-NORTH-01', '2023-07-18 14:15:00Z', '2023-07-18 19:45:00Z', 330, 'Transformer Bushing Flashover during Severe Storm', 48000, 1100000.00, 'Severe Thunderstorm & High Lightning Density'),
('INC-2024-008', 'TF-METRO-01', '2024-08-02 11:30:00Z', '2024-08-02 14:10:00Z', 160, 'Tap Changer Thermal Lockout under Peak Load', 35000, 420000.00, 'Extended 36C Heatwave');

-- 6. Initial AI Risk Assessment (Output of AI model)
INSERT INTO risk_assessments (asset_id, failure_probability_7d, outage_risk_score, grid_impact_severity, estimated_financial_exposure_usd_hr, primary_risk_driver, anomaly_flags, model_version) VALUES
('TF-NORTH-01', 0.915, 94.80, 'CRITICAL', 1250000.00, 'Accelerated C2H2 arcing generation (8.9 ppm) compounded by 78.5 km/h thunderstorm gust front', '["CRITICAL_DGA_ACETYLENE", "HIGH_PARTIAL_DISCHARGE", "SEVERE_GUST_ALERT"]'::jsonb, 'v1.0.0-xgb-resilience'),
('TF-METRO-01', 0.540, 68.20, 'HIGH', 680000.00, 'Winding thermal saturation (104C) during metropolitan peak load', '["WINDING_OVERHEAT", "PEAK_LOAD_STRESS"]'::jsonb, 'v1.0.0-xgb-resilience'),
('TF-EAST-01',  0.080, 14.50, 'LOW', 25000.00, 'Nominal thermal and mechanical health parameters', '[]'::jsonb, 'v1.0.0-xgb-resilience');

-- 7. Initial Bob Recommendation & Crew Staging Plan
INSERT INTO maintenance_recommendations (id, asset_id, urgency, recommended_action, bob_reasoning_summary, crew_staging_zone, crew_type_required, estimated_repair_hours, dispatch_status) VALUES
('REC-2026-001', 'TF-NORTH-01', 'IMMEDIATE', 'Pre-position high-voltage transformer specialists at North Ridge Depot, isolate tap-changer to reduce mechanical stress, and reconfigure bus to bypass 40MVA load before the 3-hour storm window.', 'IBM Bob detected 8.9 ppm C2H2 arcing combined with impending 78.5 km/h gusts at Substation North-01. Pre-positioning crews now avoids an estimated $1.25M/hour catastrophic blackout across 48,000 customers.', 'North Ridge Sector-A Depot', 'HV_TRANSFORMER_SPECIALIST', 4.0, 'PENDING');