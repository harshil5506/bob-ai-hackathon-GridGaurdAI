import { Asset, WeatherContext, RiskResult, Recommendation } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAssets: Asset[] = [
  {
    asset_id: "SUB-001",
    type: "transformer",
    name: "Northside Substation Alpha",
    location: { lat: 34.0522, lng: -118.2437, area: "Sector 4", map_coordinates: { x: 50, y: 50 } }, // Center for critical
    installation_date: "2010-05-12",
    last_maintenance: "2023-11-01",
    grid_impact_score: 9.8,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 112, // Critical
      vibration_hz: 45,
      partial_discharge_pc: 420, // Critical
      oil_quality_index: 42 // Poor
    }
  },
  {
    asset_id: "TRX-104",
    type: "transformer",
    name: "Downtown Feeder B",
    location: { lat: 34.0528, lng: -118.2440, area: "Sector 2", map_coordinates: { x: 25, y: 35 } },
    installation_date: "2015-08-22",
    last_maintenance: "2024-01-15",
    grid_impact_score: 6.5,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 65, // Normal
      vibration_hz: 30,
      partial_discharge_pc: 120, // Normal
      oil_quality_index: 85 // Good
    }
  },
  {
    asset_id: "S-047",
    type: "circuit_breaker",
    name: "Westside Breaker Node",
    location: { lat: 34.0600, lng: -118.2400, area: "Sector 5", map_coordinates: { x: 75, y: 65 } },
    installation_date: "2018-02-10",
    last_maintenance: "2024-02-28",
    grid_impact_score: 8.0,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 85, // Warning
      vibration_hz: 35,
      partial_discharge_pc: 250, // Warning
      oil_quality_index: 60 // Fair
    }
  }
];

export const getAssets = async (): Promise<Asset[]> => {
  await delay(500);
  return mockAssets;
};

export const getAsset = async (id: string): Promise<Asset | undefined> => {
  await delay(500);
  return mockAssets.find(a => a.asset_id === id);
};

export const getWeather = async (area: string): Promise<WeatherContext> => {
  await delay(300);
  return {
    area,
    forecast: "Approaching Thunderstorm",
    wind_speed_mph: 68,
    precipitation_mm: 48,
    compounding_risk_factor: 1.23
  };
};

export const getRiskResult = async (assetId: string): Promise<RiskResult> => {
  await delay(600);
  if (assetId === "SUB-001") {
    return {
      asset_id: assetId,
      risk_score: 87.4,
      risk_level: "critical",
      predicted_failure_window_hrs: 14,
      confidence_score: 94.6,
      driving_signal: "DGA (Dissolved Gas Analysis) & Thermal Sensors",
      historical_comparison: "Similar to Substation X, June 2024 failure",
      customers_impacted: 14500,
      contributing_factors: [
        "Sustained partial discharge > 400pC",
        "Temperature anomaly (112C > 90C threshold)",
        "Degraded DGA oil (Acetylene/Hydrogen)",
        "Compounding weather: High lightning probability"
      ],
      last_evaluated: new Date().toISOString()
    };
  }
  
  if (assetId === "S-047") {
    return {
      asset_id: assetId,
      risk_score: 64.0,
      risk_level: "medium",
      predicted_failure_window_hrs: 60,
      confidence_score: 75.0,
      driving_signal: "Minor Vibration Anomalies",
      historical_comparison: "Standard wear-and-tear pattern",
      customers_impacted: 5200,
      contributing_factors: ["Elevated temperature", "Upcoming maintenance due"],
      last_evaluated: new Date().toISOString()
    };
  }

  return {
    asset_id: assetId,
    risk_score: 12.5,
    risk_level: "low",
    predicted_failure_window_hrs: 720,
    confidence_score: 98.0,
    driving_signal: "None (Stable)",
    historical_comparison: "N/A",
    customers_impacted: 2100,
    contributing_factors: ["Normal operational wear"],
    last_evaluated: new Date().toISOString()
  };
};

export const getRecommendation = async (assetId: string): Promise<Recommendation> => {
  await delay(400);
  return {
    asset_id: assetId,
    action: "Inspect Cooling & Oil, Prepare Emergency Bypass",
    priority: assetId === "SUB-001" ? "critical" : "low",
    reason: "Preventative action required to mitigate catastrophic thermal runaway.",
    crew_pre_positioning: {
      suggested_area: "Substation 12 Staging Area",
      timing: "Immediate (ETA: 18 mins)"
    }
  };
};
