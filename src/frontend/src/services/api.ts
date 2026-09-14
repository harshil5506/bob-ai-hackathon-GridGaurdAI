import { Asset, WeatherContext, RiskResult, Recommendation } from '../types';

// Utility to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAssets: Asset[] = [
  {
    asset_id: "SUB-001",
    name: "Northside Substation Alpha",
    type: "substation",
    location: { lat: 34.05, lng: -118.24, area: "Downtown" },
    grid_impact_score: 8.5,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 85.2,
      vibration_hz: 120,
      partial_discharge_pc: 450,
      oil_quality_index: 0.72
    }
  },
  {
    asset_id: "TRX-104",
    name: "Eastside Distribution TX",
    type: "transformer",
    location: { lat: 34.06, lng: -118.22, area: "Eastside" },
    grid_impact_score: 5.2,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 65.0,
      vibration_hz: 60,
      partial_discharge_pc: 150,
      oil_quality_index: 0.95
    }
  }
];

export const getAssets = async (): Promise<Asset[]> => {
  await delay(800);
  return mockAssets;
};

export const getAsset = async (id: string): Promise<Asset | undefined> => {
  await delay(500);
  return mockAssets.find(a => a.asset_id === id);
};

export const getWeather = async (area: string): Promise<WeatherContext> => {
  await delay(600);
  return {
    area,
    timestamp: new Date().toISOString(),
    forecast: area === "Downtown" ? "Severe Thunderstorm" : "Clear",
    wind_speed_mph: area === "Downtown" ? 45 : 12,
    precipitation_mm: area === "Downtown" ? 25 : 0,
    compounding_risk_factor: area === "Downtown" ? 1.4 : 1.0
  };
};

export const getRiskResult = async (assetId: string): Promise<RiskResult> => {
  await delay(900);
  if (assetId === "SUB-001") {
    return {
      asset_id: assetId,
      risk_score: 82.5,
      risk_level: "HIGH",
      prediction_window: "Next 48 Hours",
      contributing_factors: [
        "Sustained partial discharge > 400pC",
        "Incoming severe thunderstorm (wind > 40mph)",
        "Historical failure under similar load conditions"
      ]
    };
  }
  return {
    asset_id: assetId,
    risk_score: 15.0,
    risk_level: "LOW",
    prediction_window: "Next 14 Days",
    contributing_factors: [
      "Normal operating temperature",
      "Stable oil quality"
    ]
  };
};

export const getRecommendation = async (assetId: string): Promise<Recommendation | null> => {
  await delay(1000);
  if (assetId === "SUB-001") {
    return {
      asset_id: assetId,
      priority: "CRITICAL",
      action: "Dispatch diagnostic team for immediate oil sampling and DGA analysis.",
      reason: "High probability of catastrophic failure due to compounding weather and degraded oil.",
      crew_pre_positioning: {
        suggested_area: "Downtown Staging Point B",
        timing: "Before 18:00 Local Time"
      }
    };
  }
  return null;
};
