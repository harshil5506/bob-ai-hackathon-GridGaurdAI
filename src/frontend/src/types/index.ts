export interface Asset {
  asset_id: string;
  name: string;
  type: 'transformer' | 'substation';
  location: { lat: number; lng: number; area: string };
  grid_impact_score: number;
  current_telemetry: {
    timestamp: string;
    temperature_c: number;
    vibration_hz: number;
    partial_discharge_pc: number;
    oil_quality_index: number;
  };
}

export interface WeatherContext {
  area: string;
  timestamp: string;
  forecast: string;
  wind_speed_mph: number;
  precipitation_mm: number;
  compounding_risk_factor: number;
}

export interface RiskResult {
  asset_id: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  prediction_window: string;
  contributing_factors: string[];
}

export interface Recommendation {
  asset_id: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: string;
  reason: string;
  crew_pre_positioning: {
    suggested_area: string;
    timing: string;
  };
}
