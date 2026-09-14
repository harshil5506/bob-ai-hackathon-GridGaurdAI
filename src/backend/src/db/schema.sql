-- Drop existing tables in reverse dependency order for clean migrations
DROP TABLE IF EXISTS maintenance_recommendations CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS incident_history CASCADE;
DROP TABLE IF EXISTS weather_forecasts CASCADE;
DROP TABLE IF EXISTS sensor_telemetry CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS substations CASCADE;

-- 1. Substations Table
CREATE TABLE substations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grid Assets Table
CREATE TABLE assets (
    id VARCHAR(50) PRIMARY KEY,
    substation_id VARCHAR(50) REFERENCES substations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    rating_mva NUMERIC(8, 2) NOT NULL,
    voltage_kv NUMERIC(8, 2) NOT NULL,
    installation_date DATE NOT NULL,
    criticality_tier INT NOT NULL CHECK (criticality_tier BETWEEN 1 AND 3),
    downstream_customers INT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sensor Telemetry Time-Series
CREATE TABLE sensor_telemetry (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    oil_temperature_c NUMERIC(6, 2) NOT NULL,
    winding_temperature_c NUMERIC(6, 2) NOT NULL,
    vibration_rms_mm_s NUMERIC(6, 2) NOT NULL,
    partial_discharge_pc NUMERIC(8, 2) NOT NULL,
    dga_hydrogen_h2_ppm NUMERIC(8, 2) NOT NULL,
    dga_acetylene_c2h2_ppm NUMERIC(8, 2) NOT NULL,
    load_pct NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Weather Forecasts
CREATE TABLE weather_forecasts (
    id BIGSERIAL PRIMARY KEY,
    substation_id VARCHAR(50) REFERENCES substations(id) ON DELETE CASCADE,
    forecast_time TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(5, 2) NOT NULL,
    wind_speed_kmh NUMERIC(6, 2) NOT NULL,
    wind_gust_kmh NUMERIC(6, 2) NOT NULL,
    precipitation_mm NUMERIC(6, 2) NOT NULL,
    lightning_strike_probability NUMERIC(4, 3) NOT NULL,
    storm_alert_level VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Incident History
CREATE TABLE incident_history (
    id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL,
    restored_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    cause VARCHAR(100) NOT NULL,
    customers_affected INT NOT NULL,
    estimated_loss_usd NUMERIC(12, 2) NOT NULL,
    weather_factor VARCHAR(100) NOT NULL
);

-- 6. AI Risk Assessments (Person 3 Engine Outputs)
CREATE TABLE risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    failure_probability_7d NUMERIC(4, 3) NOT NULL,
    outage_risk_score NUMERIC(5, 2) NOT NULL,
    grid_impact_severity VARCHAR(20) NOT NULL,
    estimated_financial_exposure_usd_hr NUMERIC(12, 2) NOT NULL,
    primary_risk_driver VARCHAR(255) NOT NULL,
    anomaly_flags JSONB DEFAULT '[]'::jsonb,
    model_version VARCHAR(50) DEFAULT 'v1.0.0'
);

-- 7. Recommendations & Crew Pre-Positioning (IBM Bob Engine Outputs)
CREATE TABLE maintenance_recommendations (
    id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES assets(id) ON DELETE CASCADE,
    urgency VARCHAR(20) NOT NULL,
    recommended_action TEXT NOT NULL,
    bob_reasoning_summary TEXT NOT NULL,
    crew_staging_zone VARCHAR(100) NOT NULL,
    crew_type_required VARCHAR(50) NOT NULL,
    estimated_repair_hours NUMERIC(4, 1) NOT NULL,
    dispatch_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);