-- GridGuard AI — PostgreSQL Schema
-- Run: psql -U gridguard -d gridguard -f schema.sql

-- ============================================================================
-- ASSETS: Grid equipment registry
-- ============================================================================
CREATE TABLE IF NOT EXISTS assets (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(50) NOT NULL CHECK (type IN ('transformer', 'breaker', 'substation')),
    substation      VARCHAR(100) NOT NULL,
    location_lat    DECIMAL(9,6) NOT NULL,
    location_lng    DECIMAL(9,6) NOT NULL,
    voltage_kv      INTEGER NOT NULL,
    install_year    INTEGER NOT NULL,
    customers_served INTEGER NOT NULL DEFAULT 0,
    last_maintenance DATE,
    status          VARCHAR(30) NOT NULL DEFAULT 'operational'
        CHECK (status IN ('operational', 'degraded', 'maintenance', 'offline')),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SENSOR_READINGS: Time-series IoT telemetry
-- ============================================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
    id              SERIAL PRIMARY KEY,
    asset_id        VARCHAR(20) NOT NULL REFERENCES assets(id),
    recorded_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    temperature_c   DECIMAL(5,1),
    vibration_mm_s  DECIMAL(5,2),
    partial_discharge_pc DECIMAL(8,1),
    oil_quality_index DECIMAL(3,2),      -- 0.00 = worst, 1.00 = best
    load_pct        DECIMAL(5,1),
    humidity_pct    DECIMAL(5,1)
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_asset_time
    ON sensor_readings(asset_id, recorded_at DESC);

-- ============================================================================
-- WEATHER_FORECASTS: Weather data per grid location
-- ============================================================================
CREATE TABLE IF NOT EXISTS weather_forecasts (
    id              SERIAL PRIMARY KEY,
    location_name   VARCHAR(100) NOT NULL,
    location_lat    DECIMAL(9,6) NOT NULL,
    location_lng    DECIMAL(9,6) NOT NULL,
    forecast_time   TIMESTAMP NOT NULL,
    temp_c          DECIMAL(5,1),
    wind_kph        DECIMAL(5,1),
    precip_mm       DECIMAL(6,1),
    humidity_pct    DECIMAL(5,1),
    storm_probability DECIMAL(3,2),       -- 0.00 to 1.00
    condition       VARCHAR(50),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_location_time
    ON weather_forecasts(location_lat, location_lng, forecast_time DESC);

-- ============================================================================
-- INCIDENTS: Historical outage and failure records
-- ============================================================================
CREATE TABLE IF NOT EXISTS incidents (
    id              VARCHAR(30) PRIMARY KEY,
    asset_id        VARCHAR(20) NOT NULL REFERENCES assets(id),
    incident_date   DATE NOT NULL,
    type            VARCHAR(50) NOT NULL,
    cause           VARCHAR(100),
    duration_hours  DECIMAL(5,1),
    customers_affected INTEGER DEFAULT 0,
    weather_temp_c  DECIMAL(5,1),
    weather_wind_kph DECIMAL(5,1),
    resolution      TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_asset ON incidents(asset_id, incident_date DESC);

-- ============================================================================
-- RISK_SCORES: Computed risk assessments from AI engine
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_scores (
    id              SERIAL PRIMARY KEY,
    asset_id        VARCHAR(20) NOT NULL REFERENCES assets(id),
    computed_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    risk_score      DECIMAL(4,3) NOT NULL,    -- 0.000 to 1.000
    risk_level      VARCHAR(20) NOT NULL
        CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    failure_prob_7d DECIMAL(4,3),
    grid_impact_severity DECIMAL(4,1),         -- 1.0 to 10.0
    factors_json    JSONB,                     -- contributing factor breakdown
    sensor_health   DECIMAL(4,3),
    weather_exposure DECIMAL(4,3),
    historical_risk DECIMAL(4,3),
    age_condition   DECIMAL(4,3)
);

CREATE INDEX IF NOT EXISTS idx_risk_scores_asset_time
    ON risk_scores(asset_id, computed_at DESC);

-- ============================================================================
-- MAINTENANCE_PLANS: Generated work orders and crew positioning
-- ============================================================================
CREATE TABLE IF NOT EXISTS maintenance_plans (
    id              SERIAL PRIMARY KEY,
    asset_id        VARCHAR(20) NOT NULL REFERENCES assets(id),
    priority        INTEGER NOT NULL,          -- 1 = highest
    action          TEXT NOT NULL,
    crew_type       VARCHAR(50) NOT NULL,
    crew_size       INTEGER NOT NULL DEFAULT 2,
    staging_lat     DECIMAL(9,6),
    staging_lng     DECIMAL(9,6),
    staging_name    VARCHAR(100),
    recommended_by  TIMESTAMP,
    estimated_downtime_hours DECIMAL(5,1),
    justification   TEXT,
    status          VARCHAR(30) DEFAULT 'pending'
        CHECK (status IN ('pending', 'dispatched', 'in_progress', 'completed')),
    generated_at    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_priority
    ON maintenance_plans(priority, generated_at DESC);
