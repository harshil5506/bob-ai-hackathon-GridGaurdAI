-- GridGuard AI — Realistic Synthetic Seed Data
-- 20 assets across 5 substations, 30 days of sensor readings,
-- historical incidents, weather forecasts with incoming storm

-- ============================================================================
-- ASSETS: 5 substations, 14 transformers, 6 breakers
-- Coordinates use a fictional metro area (loosely based on a generic Indian metro)
-- ============================================================================

INSERT INTO assets (id, name, type, substation, location_lat, location_lng, voltage_kv, install_year, customers_served, last_maintenance, status) VALUES
-- Riverside Substation (Central Metro — HIGH RISK, aging, storm-exposed)
('TRF-001', 'Riverside Transformer Alpha',   'transformer', 'Riverside',  28.6139, 77.2090, 220, 2005, 45000, '2026-03-15', 'operational'),
('TRF-002', 'Riverside Transformer Beta',    'transformer', 'Riverside',  28.6142, 77.2095, 220, 2007, 38000, '2026-01-20', 'degraded'),
('TRF-003', 'Riverside Transformer Gamma',   'transformer', 'Riverside',  28.6135, 77.2088, 132, 2010, 22000, '2026-06-10', 'operational'),
('TRF-004', 'Riverside Transformer Delta',   'transformer', 'Riverside',  28.6148, 77.2092, 132, 2003, 31000, '2025-11-05', 'degraded'),
('BRK-001', 'Riverside Breaker R1',          'breaker',     'Riverside',  28.6140, 77.2091, 220, 2008, 45000, '2026-05-01', 'operational'),
('BRK-002', 'Riverside Breaker R2',          'breaker',     'Riverside',  28.6141, 77.2093, 132, 2009, 22000, '2026-04-15', 'operational'),

-- Northgate Substation (Northern Suburbs — MEDIUM RISK)
('TRF-005', 'Northgate Transformer Alpha',   'transformer', 'Northgate',  28.7200, 77.1500, 220, 2012, 35000, '2026-04-20', 'operational'),
('TRF-006', 'Northgate Transformer Beta',    'transformer', 'Northgate',  28.7205, 77.1505, 132, 2014, 28000, '2026-07-01', 'operational'),
('TRF-007', 'Northgate Transformer Gamma',   'transformer', 'Northgate',  28.7198, 77.1498, 132, 2011, 20000, '2026-02-28', 'operational'),
('BRK-003', 'Northgate Breaker N1',          'breaker',     'Northgate',  28.7202, 77.1502, 220, 2013, 35000, '2026-05-15', 'operational'),

-- Eastfield Substation (Industrial Zone — LOW RISK, recently maintained)
('TRF-008', 'Eastfield Transformer Alpha',   'transformer', 'Eastfield',  28.6300, 77.3200, 400, 2018, 15000, '2026-08-01', 'operational'),
('TRF-009', 'Eastfield Transformer Beta',    'transformer', 'Eastfield',  28.6305, 77.3205, 220, 2019, 12000, '2026-08-15', 'operational'),
('BRK-004', 'Eastfield Breaker E1',          'breaker',     'Eastfield',  28.6302, 77.3202, 400, 2018, 15000, '2026-08-01', 'operational'),
('BRK-005', 'Eastfield Breaker E2',          'breaker',     'Eastfield',  28.6303, 77.3204, 220, 2019, 12000, '2026-08-15', 'operational'),

-- Southbank Substation (Coastal Area — HIGH WEATHER RISK)
('TRF-010', 'Southbank Transformer Alpha',   'transformer', 'Southbank',  28.5000, 77.2800, 220, 2009, 42000, '2026-02-10', 'operational'),
('TRF-011', 'Southbank Transformer Beta',    'transformer', 'Southbank',  28.5005, 77.2805, 132, 2011, 30000, '2026-05-20', 'operational'),
('TRF-012', 'Southbank Transformer Gamma',   'transformer', 'Southbank',  28.4998, 77.2795, 132, 2008, 25000, '2026-01-10', 'degraded'),
('BRK-006', 'Southbank Breaker S1',          'breaker',     'Southbank',  28.5002, 77.2802, 220, 2010, 42000, '2026-06-01', 'operational'),

-- Westpoint Substation (Residential — MEDIUM RISK, high customer density)
('TRF-013', 'Westpoint Transformer Alpha',   'transformer', 'Westpoint',  28.6500, 77.1000, 132, 2013, 55000, '2026-03-01', 'operational'),
('TRF-014', 'Westpoint Transformer Beta',    'transformer', 'Westpoint',  28.6505, 77.1005, 132, 2015, 48000, '2026-06-15', 'operational');

-- ============================================================================
-- SENSOR READINGS: Latest readings per asset (most recent snapshot)
-- Riverside assets show concerning degradation patterns
-- ============================================================================

-- TRF-001: High temperature, concerning vibration (HIGH RISK)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-001', NOW() - INTERVAL '5 minutes',  82.5, 4.8, 180, 0.52, 91.2, 72.0),
('TRF-001', NOW() - INTERVAL '1 hour',     80.1, 4.5, 165, 0.53, 88.5, 70.5),
('TRF-001', NOW() - INTERVAL '6 hours',    76.3, 4.2, 150, 0.55, 85.0, 68.0),
('TRF-001', NOW() - INTERVAL '1 day',      72.0, 3.8, 130, 0.58, 80.2, 65.0),
('TRF-001', NOW() - INTERVAL '3 days',     68.5, 3.5, 110, 0.62, 76.0, 63.0),
('TRF-001', NOW() - INTERVAL '7 days',     65.0, 3.2, 95,  0.67, 72.0, 60.0),
('TRF-001', NOW() - INTERVAL '14 days',    62.0, 3.0, 80,  0.72, 68.0, 58.0),
('TRF-001', NOW() - INTERVAL '30 days',    58.0, 2.8, 65,  0.78, 65.0, 55.0);

-- TRF-002: Degraded status, oil quality very low (CRITICAL RISK)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-002', NOW() - INTERVAL '5 minutes',  88.3, 5.9, 250, 0.38, 94.7, 78.0),
('TRF-002', NOW() - INTERVAL '1 hour',     86.0, 5.6, 235, 0.39, 93.0, 76.5),
('TRF-002', NOW() - INTERVAL '6 hours',    83.5, 5.3, 220, 0.41, 90.0, 74.0),
('TRF-002', NOW() - INTERVAL '1 day',      78.0, 4.8, 190, 0.45, 85.0, 70.0),
('TRF-002', NOW() - INTERVAL '7 days',     70.0, 4.0, 140, 0.55, 78.0, 65.0),
('TRF-002', NOW() - INTERVAL '30 days',    60.0, 3.2, 90,  0.68, 70.0, 58.0);

-- TRF-003: Normal operation (LOW-MEDIUM RISK)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-003', NOW() - INTERVAL '5 minutes',  55.2, 2.1, 40, 0.85, 62.0, 55.0),
('TRF-003', NOW() - INTERVAL '1 hour',     54.8, 2.0, 38, 0.85, 61.0, 54.5),
('TRF-003', NOW() - INTERVAL '1 day',      53.0, 1.9, 35, 0.86, 58.0, 53.0),
('TRF-003', NOW() - INTERVAL '7 days',     52.0, 1.8, 33, 0.87, 55.0, 52.0);

-- TRF-004: Old, overdue maintenance (HIGH RISK)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-004', NOW() - INTERVAL '5 minutes',  79.0, 4.5, 200, 0.45, 88.0, 70.0),
('TRF-004', NOW() - INTERVAL '1 hour',     77.5, 4.3, 190, 0.46, 86.5, 69.0),
('TRF-004', NOW() - INTERVAL '1 day',      73.0, 3.9, 160, 0.50, 82.0, 66.0),
('TRF-004', NOW() - INTERVAL '7 days',     67.0, 3.5, 130, 0.58, 75.0, 62.0);

-- TRF-005: Normal (MEDIUM — moderate age)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-005', NOW() - INTERVAL '5 minutes',  62.0, 2.8, 70, 0.75, 72.0, 58.0),
('TRF-005', NOW() - INTERVAL '1 day',      60.0, 2.6, 65, 0.76, 70.0, 56.0),
('TRF-005', NOW() - INTERVAL '7 days',     58.0, 2.5, 60, 0.78, 68.0, 55.0);

-- TRF-006, TRF-007: Normal (LOW-MEDIUM)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-006', NOW() - INTERVAL '5 minutes',  52.0, 1.8, 30, 0.88, 58.0, 50.0),
('TRF-007', NOW() - INTERVAL '5 minutes',  58.0, 2.3, 55, 0.79, 65.0, 55.0);

-- TRF-008, TRF-009: Recently maintained, excellent condition (LOW)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-008', NOW() - INTERVAL '5 minutes',  45.0, 1.2, 15, 0.95, 48.0, 42.0),
('TRF-009', NOW() - INTERVAL '5 minutes',  43.0, 1.0, 12, 0.96, 45.0, 40.0);

-- TRF-010: Storm-exposed, showing stress (HIGH)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-010', NOW() - INTERVAL '5 minutes',  75.0, 4.0, 145, 0.58, 85.0, 80.0),
('TRF-010', NOW() - INTERVAL '1 day',      70.0, 3.5, 120, 0.62, 80.0, 75.0),
('TRF-010', NOW() - INTERVAL '7 days',     63.0, 2.8, 85,  0.70, 72.0, 65.0);

-- TRF-011: Moderate (MEDIUM)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-011', NOW() - INTERVAL '5 minutes',  60.0, 2.5, 65, 0.76, 70.0, 65.0);

-- TRF-012: Degraded, old (HIGH)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-012', NOW() - INTERVAL '5 minutes',  77.0, 4.2, 185, 0.48, 87.0, 75.0),
('TRF-012', NOW() - INTERVAL '1 day',      73.0, 3.8, 160, 0.52, 83.0, 72.0);

-- TRF-013: High customer density, moderate stress (MEDIUM-HIGH)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-013', NOW() - INTERVAL '5 minutes',  66.0, 3.2, 95, 0.68, 78.0, 60.0),
('TRF-013', NOW() - INTERVAL '1 day',      63.0, 3.0, 85, 0.70, 75.0, 58.0);

-- TRF-014: Good condition (LOW)
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('TRF-014', NOW() - INTERVAL '5 minutes',  50.0, 1.6, 25, 0.90, 55.0, 48.0);

-- Breakers: simplified readings
INSERT INTO sensor_readings (asset_id, recorded_at, temperature_c, vibration_mm_s, partial_discharge_pc, oil_quality_index, load_pct, humidity_pct) VALUES
('BRK-001', NOW() - INTERVAL '5 minutes',  55.0, 2.0, 35, 0.82, 70.0, 58.0),
('BRK-002', NOW() - INTERVAL '5 minutes',  48.0, 1.5, 20, 0.88, 60.0, 52.0),
('BRK-003', NOW() - INTERVAL '5 minutes',  50.0, 1.7, 25, 0.86, 62.0, 50.0),
('BRK-004', NOW() - INTERVAL '5 minutes',  42.0, 1.0, 10, 0.95, 45.0, 40.0),
('BRK-005', NOW() - INTERVAL '5 minutes',  40.0, 0.9, 8,  0.96, 42.0, 38.0),
('BRK-006', NOW() - INTERVAL '5 minutes',  58.0, 2.5, 50, 0.72, 75.0, 68.0);

-- ============================================================================
-- WEATHER FORECASTS: Incoming severe storm hitting Riverside + Southbank
-- ============================================================================

-- Riverside area (SEVERE storm incoming in 24-48h)
INSERT INTO weather_forecasts (location_name, location_lat, location_lng, forecast_time, temp_c, wind_kph, precip_mm, humidity_pct, storm_probability, condition) VALUES
('Riverside District',  28.6139, 77.2090, NOW(),                        42.0, 15.0,  0.0, 65.0, 0.15, 'partly_cloudy'),
('Riverside District',  28.6139, 77.2090, NOW() + INTERVAL '12 hours',  38.0, 25.0,  2.0, 72.0, 0.45, 'cloudy'),
('Riverside District',  28.6139, 77.2090, NOW() + INTERVAL '24 hours',  35.0, 55.0, 28.0, 88.0, 0.82, 'thunderstorm'),
('Riverside District',  28.6139, 77.2090, NOW() + INTERVAL '36 hours',  32.0, 70.0, 45.0, 95.0, 0.92, 'severe_thunderstorm'),
('Riverside District',  28.6139, 77.2090, NOW() + INTERVAL '48 hours',  33.0, 45.0, 15.0, 82.0, 0.55, 'rain'),
('Riverside District',  28.6139, 77.2090, NOW() + INTERVAL '72 hours',  36.0, 20.0,  3.0, 68.0, 0.20, 'partly_cloudy');

-- Northgate area (moderate weather)
INSERT INTO weather_forecasts (location_name, location_lat, location_lng, forecast_time, temp_c, wind_kph, precip_mm, humidity_pct, storm_probability, condition) VALUES
('Northgate Area',      28.7200, 77.1500, NOW(),                        40.0, 12.0,  0.0, 60.0, 0.10, 'clear'),
('Northgate Area',      28.7200, 77.1500, NOW() + INTERVAL '24 hours',  37.0, 30.0,  8.0, 75.0, 0.40, 'cloudy'),
('Northgate Area',      28.7200, 77.1500, NOW() + INTERVAL '48 hours',  35.0, 35.0, 12.0, 78.0, 0.50, 'rain'),
('Northgate Area',      28.7200, 77.1500, NOW() + INTERVAL '72 hours',  38.0, 18.0,  2.0, 62.0, 0.15, 'partly_cloudy');

-- Eastfield area (calm weather)
INSERT INTO weather_forecasts (location_name, location_lat, location_lng, forecast_time, temp_c, wind_kph, precip_mm, humidity_pct, storm_probability, condition) VALUES
('Eastfield Industrial', 28.6300, 77.3200, NOW(),                        39.0, 10.0,  0.0, 55.0, 0.05, 'clear'),
('Eastfield Industrial', 28.6300, 77.3200, NOW() + INTERVAL '24 hours',  38.0, 15.0,  1.0, 60.0, 0.10, 'clear'),
('Eastfield Industrial', 28.6300, 77.3200, NOW() + INTERVAL '48 hours',  37.0, 20.0,  5.0, 65.0, 0.20, 'partly_cloudy');

-- Southbank area (SEVERE — coastal storm exposure)
INSERT INTO weather_forecasts (location_name, location_lat, location_lng, forecast_time, temp_c, wind_kph, precip_mm, humidity_pct, storm_probability, condition) VALUES
('Southbank Coastal',   28.5000, 77.2800, NOW(),                        40.0, 20.0,  1.0, 75.0, 0.25, 'cloudy'),
('Southbank Coastal',   28.5000, 77.2800, NOW() + INTERVAL '12 hours',  37.0, 35.0,  5.0, 80.0, 0.55, 'cloudy'),
('Southbank Coastal',   28.5000, 77.2800, NOW() + INTERVAL '24 hours',  34.0, 65.0, 35.0, 92.0, 0.88, 'thunderstorm'),
('Southbank Coastal',   28.5000, 77.2800, NOW() + INTERVAL '36 hours',  31.0, 80.0, 55.0, 97.0, 0.95, 'severe_thunderstorm'),
('Southbank Coastal',   28.5000, 77.2800, NOW() + INTERVAL '48 hours',  32.0, 50.0, 20.0, 85.0, 0.60, 'rain'),
('Southbank Coastal',   28.5000, 77.2800, NOW() + INTERVAL '72 hours',  35.0, 22.0,  4.0, 70.0, 0.18, 'partly_cloudy');

-- Westpoint area (moderate)
INSERT INTO weather_forecasts (location_name, location_lat, location_lng, forecast_time, temp_c, wind_kph, precip_mm, humidity_pct, storm_probability, condition) VALUES
('Westpoint Residential', 28.6500, 77.1000, NOW(),                      41.0, 14.0,  0.0, 58.0, 0.08, 'clear'),
('Westpoint Residential', 28.6500, 77.1000, NOW() + INTERVAL '24 hours', 38.0, 28.0, 10.0, 72.0, 0.42, 'cloudy'),
('Westpoint Residential', 28.6500, 77.1000, NOW() + INTERVAL '48 hours', 36.0, 32.0, 15.0, 76.0, 0.48, 'rain');

-- ============================================================================
-- INCIDENTS: Historical failure records (18 months of history)
-- ============================================================================

INSERT INTO incidents (id, asset_id, incident_date, type, cause, duration_hours, customers_affected, weather_temp_c, weather_wind_kph, resolution) VALUES
-- Riverside — history of failures
('INC-2025-0112', 'TRF-001', '2025-01-15', 'overheating',          'cooling_system_failure', 8.5,  32000, 38.0, 25.0, 'Replaced cooling fans and topped up oil. Temporary load reduction applied.'),
('INC-2025-0298', 'TRF-001', '2025-06-20', 'partial_discharge',    'insulation_degradation', 4.0,  18000, 44.0, 40.0, 'Insulation repair and partial discharge monitoring enhanced.'),
('INC-2025-0451', 'TRF-002', '2025-08-12', 'transformer_failure',  'oil_contamination',     12.0,  38000, 44.0, 50.0, 'Emergency oil replacement. Root cause: seal degradation from age.'),
('INC-2025-0523', 'TRF-004', '2025-09-28', 'overheating',          'overload',               6.0,  25000, 42.0, 35.0, 'Load redistribution to TRF-003. Maintenance overdue flag raised.'),
('INC-2026-0041', 'TRF-002', '2026-02-05', 'oil_quality_alarm',    'accelerated_aging',      3.0,  12000, 30.0, 15.0, 'Oil quality index dropped below 0.40. Partial oil replacement done.'),
('INC-2026-0189', 'TRF-004', '2026-05-18', 'vibration_alarm',      'bearing_wear',           2.5,   8000, 40.0, 20.0, 'Bearing inspection revealed wear. Scheduled for replacement.'),
('INC-2024-0891', 'BRK-001', '2024-12-03', 'breaker_trip',         'overcurrent',            1.5,  45000, 35.0, 45.0, 'Breaker reset after clearing fault on downstream feeder.'),

-- Northgate — occasional issues
('INC-2025-0334', 'TRF-005', '2025-07-10', 'overheating',          'heatwave_load_surge',    3.0,  20000, 46.0, 10.0, 'Temporary load shedding. All sensors returned to normal after heatwave.'),
('INC-2025-0567', 'TRF-007', '2025-10-15', 'partial_discharge',    'insulation_aging',       2.0,  10000, 32.0, 30.0, 'Partial discharge test. Minor insulation repair performed.'),

-- Southbank — weather-related failures
('INC-2025-0201', 'TRF-010', '2025-04-02', 'storm_damage',         'lightning_strike',       9.0,  42000, 28.0, 85.0, 'Lightning arrester replaced. Full inspection of winding insulation.'),
('INC-2025-0456', 'TRF-010', '2025-08-15', 'flooding',             'substation_flooding',   18.0,  42000, 30.0, 75.0, 'Substation pumped. Moisture damage to lower bushings. Partial replacement.'),
('INC-2025-0612', 'TRF-012', '2025-11-02', 'transformer_failure',  'winding_fault',         14.0,  25000, 26.0, 60.0, 'Winding replacement. Asset flagged as degraded pending full refurbishment.'),
('INC-2026-0098', 'BRK-006', '2026-03-20', 'breaker_failure',      'mechanism_jam',          4.0,  30000, 35.0, 55.0, 'Mechanism cleaned and lubricated. Spring assembly replaced.'),

-- Westpoint — one notable event
('INC-2025-0789', 'TRF-013', '2025-12-24', 'overload',             'winter_peak_demand',     5.0,  55000, 8.0,  15.0, 'Peak demand exceeded rating by 15%. Emergency load transfer to TRF-014.'),

-- Eastfield — clean record (no incidents)
-- This is intentional — demonstrates LOW risk from no incident history
('INC-2026-0150', 'BRK-004', '2026-04-10', 'routine_test_trip',    'planned_test',           0.5,      0, 38.0, 12.0, 'Planned protection test. Breaker operated correctly.');
