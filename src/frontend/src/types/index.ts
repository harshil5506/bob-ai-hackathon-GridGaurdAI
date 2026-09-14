export interface Asset {
  asset_id: string;
  type: 'transformer' | 'circuit_breaker' | 'substation';
  name: string;
  location: {
    lat: number;
    lng: number;
    area: string;
    map_coordinates?: { x: number, y: number }; // Percentage offsets for 2.5D map
  };
  installation_date: string;
  last_maintenance: string;
  grid_impact_score: number;
  current_telemetry: Telemetry;
}

export interface Telemetry {
  timestamp: string;
  temperature_c: number;
  vibration_hz: number;
  partial_discharge_pc: number;
  oil_quality_index: number;
}

export interface RiskResult {
  asset_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  predicted_failure_window_hrs: number;
  confidence_score: number;
  driving_signal: string;
  historical_comparison: string;
  customers_impacted: number;
  contributing_factors: string[];
  last_evaluated: string;
}

export interface Recommendation {
  asset_id: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  crew_pre_positioning: {
    suggested_area: string;
    timing: string;
  }
}

export interface WeatherContext {
  area: string;
  forecast: string;
  compounding_risk_factor: number;
  wind_speed_mph: number;
  precipitation_mm: number;
}
