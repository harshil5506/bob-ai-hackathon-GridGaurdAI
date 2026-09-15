import { Asset, WeatherContext, RiskResult, Recommendation } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockAssets: Asset[] = [
  {
    asset_id: "SUB-001",
    type: "transformer",
    name: "Northside Substation Alpha",
    location: { lat: 34.0522, lng: -118.2437, area: "Sector 4", map_coordinates: { x: 50, y: 50 } },
    installation_date: "2010-05-12",
    last_maintenance: "2023-11-01",
    grid_impact_score: 9.8,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 112, // Critical
      vibration_hz: 45,
      partial_discharge_pc: 420,
      oil_quality_index: 42
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
      temperature_c: 65,
      vibration_hz: 30,
      partial_discharge_pc: 120,
      oil_quality_index: 85
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
      temperature_c: 85,
      vibration_hz: 35,
      partial_discharge_pc: 250,
      oil_quality_index: 60
    }
  },
  {
    asset_id: "SUB-002",
    type: "substation",
    name: "Glendale Main Substation",
    location: { lat: 34.0680, lng: -118.2320, area: "Sector 1", map_coordinates: { x: 35, y: 20 } },
    installation_date: "2012-04-18",
    last_maintenance: "2023-09-14",
    grid_impact_score: 9.1,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 98,
      vibration_hz: 42,
      partial_discharge_pc: 380,
      oil_quality_index: 48
    }
  },
  {
    asset_id: "TRX-201",
    type: "transformer",
    name: "Eastside Distribution Feeder",
    location: { lat: 34.0320, lng: -118.2150, area: "Sector 3", map_coordinates: { x: 80, y: 30 } },
    installation_date: "2019-11-05",
    last_maintenance: "2024-03-01",
    grid_impact_score: 5.2,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 58,
      vibration_hz: 22,
      partial_discharge_pc: 85,
      oil_quality_index: 90
    }
  },
  {
    asset_id: "S-088",
    type: "circuit_breaker",
    name: "South Park Substation Node",
    location: { lat: 34.0410, lng: -118.2650, area: "Sector 4", map_coordinates: { x: 45, y: 80 } },
    installation_date: "2011-08-30",
    last_maintenance: "2023-07-22",
    grid_impact_score: 9.4,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 108,
      vibration_hz: 48,
      partial_discharge_pc: 460,
      oil_quality_index: 38
    }
  },
  {
    asset_id: "SUB-003",
    type: "substation",
    name: "Valley Transmission Junction",
    location: { lat: 34.0750, lng: -118.2580, area: "Sector 6", map_coordinates: { x: 18, y: 60 } },
    installation_date: "2014-06-14",
    last_maintenance: "2024-02-12",
    grid_impact_score: 7.8,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 82,
      vibration_hz: 34,
      partial_discharge_pc: 220,
      oil_quality_index: 68
    }
  },
  {
    asset_id: "TRX-305",
    type: "transformer",
    name: "Harbor District Step-Up Node",
    location: { lat: 34.0280, lng: -118.2600, area: "Sector 5", map_coordinates: { x: 65, y: 85 } },
    installation_date: "2020-01-10",
    last_maintenance: "2024-04-10",
    grid_impact_score: 4.8,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 54,
      vibration_hz: 18,
      partial_discharge_pc: 70,
      oil_quality_index: 94
    }
  },
  {
    asset_id: "S-102",
    type: "circuit_breaker",
    name: "Hollywood Hills Switchyard",
    location: { lat: 34.0620, lng: -118.2390, area: "Sector 1", map_coordinates: { x: 60, y: 25 } },
    installation_date: "2016-09-01",
    last_maintenance: "2023-12-18",
    grid_impact_score: 8.7,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 92,
      vibration_hz: 38,
      partial_discharge_pc: 340,
      oil_quality_index: 52
    }
  },
  {
    asset_id: "SUB-004",
    type: "substation",
    name: "Arts District Substation",
    location: { lat: 34.0380, lng: -118.2310, area: "Sector 3", map_coordinates: { x: 85, y: 48 } },
    installation_date: "2017-03-25",
    last_maintenance: "2024-03-15",
    grid_impact_score: 6.1,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 62,
      vibration_hz: 24,
      partial_discharge_pc: 110,
      oil_quality_index: 82
    }
  },
  {
    asset_id: "TRX-412",
    type: "transformer",
    name: "Century City Feeder C",
    location: { lat: 34.0450, lng: -118.2100, area: "Sector 2", map_coordinates: { x: 15, y: 38 } },
    installation_date: "2015-12-05",
    last_maintenance: "2024-01-28",
    grid_impact_score: 7.2,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 78,
      vibration_hz: 32,
      partial_discharge_pc: 190,
      oil_quality_index: 72
    }
  },
  {
    asset_id: "S-150",
    type: "circuit_breaker",
    name: "Metro Center Interconnect",
    location: { lat: 34.0500, lng: -118.2550, area: "Sector 4", map_coordinates: { x: 40, y: 45 } },
    installation_date: "2021-05-19",
    last_maintenance: "2024-04-02",
    grid_impact_score: 5.5,
    current_telemetry: {
      timestamp: new Date().toISOString(),
      temperature_c: 52,
      vibration_hz: 16,
      partial_discharge_pc: 65,
      oil_quality_index: 95
    }
  }
];

export const getAssets = async (): Promise<Asset[]> => {
  await delay(300);
  return mockAssets;
};

export const getAsset = async (id: string): Promise<Asset | undefined> => {
  await delay(300);
  return mockAssets.find(a => a.asset_id === id);
};

export const getWeather = async (area: string): Promise<WeatherContext> => {
  await delay(200);
  return {
    area,
    forecast: "Approaching Thunderstorm",
    wind_speed_mph: 68,
    precipitation_mm: 48,
    compounding_risk_factor: 1.23
  };
};

export const getRiskResult = async (assetId: string): Promise<RiskResult> => {
  await delay(300);
  const asset = mockAssets.find(a => a.asset_id === assetId);
  const temp = asset?.current_telemetry.temperature_c || 60;
  const pd = asset?.current_telemetry.partial_discharge_pc || 100;

  let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let risk_score = 15.0;

  if (temp > 100 || pd > 400) {
    risk_level = 'critical';
    risk_score = 88.5;
  } else if (temp > 90 || pd > 300) {
    risk_level = 'high';
    risk_score = 72.4;
  } else if (temp > 75 || pd > 180) {
    risk_level = 'medium';
    risk_score = 54.0;
  }

  return {
    asset_id: assetId,
    risk_score,
    risk_level,
    predicted_failure_window_hrs: risk_level === 'critical' ? 14 : risk_level === 'high' ? 32 : 180,
    confidence_score: risk_level === 'critical' ? 94.6 : 82.0,
    driving_signal: risk_level === 'critical' ? 'DGA & Thermal Anomaly' : risk_level === 'high' ? 'High Temperature & Discharge' : 'Minor Vibration',
    historical_comparison: risk_level === 'critical' ? 'Similar to Substation X, June 2024 failure' : 'Standard wear pattern',
    customers_impacted: Math.round((asset?.grid_impact_score || 5) * 1500),
    contributing_factors: [
      `Temperature reading (${temp}°C)`,
      `Partial Discharge (${pd} pC)`,
      "Compounding weather risk"
    ],
    last_evaluated: new Date().toISOString()
  };
};

export const getRecommendation = async (assetId: string): Promise<Recommendation> => {
  await delay(300);
  const asset = mockAssets.find(a => a.asset_id === assetId);
  const isCritical = asset && asset.current_telemetry.temperature_c > 95;

  return {
    asset_id: assetId,
    action: isCritical ? "Inspect Cooling & Oil, Prepare Emergency Bypass" : "Routine Preventive Check",
    priority: isCritical ? "critical" : "low",
    reason: isCritical ? "Preventative action required to mitigate thermal runaway." : "Scheduled maintenance check.",
    crew_pre_positioning: {
      suggested_area: `${asset?.location.area || 'Sector 4'} Staging Ground`,
      timing: isCritical ? "Immediate (ETA: 18 mins)" : "Next Shift"
    }
  };
};
