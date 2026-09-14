import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAsset, getWeather, getRiskResult, getRecommendation } from '../services/api';
import { Asset, WeatherContext, RiskResult, Recommendation } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { TelemetryChart } from '../components/TelemetryChart';
import { BobPanel } from '../components/BobPanel';
import { RecommendationCard } from '../components/RecommendationCard';
import { ArrowLeft, Thermometer, Activity, Zap, Droplets, CloudLightning, Wind, CloudRain, ShieldAlert, History, Users, Clock } from 'lucide-react';
import './AssetDetail.css';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate mock history data for the charts
  const generateMockHistory = (baseValue: number, variance: number, trend: number) => {
    return Array.from({ length: 24 }).map((_, i) => {
      const time = new Date();
      time.setHours(time.getHours() - (24 - i));
      const val = baseValue + (Math.random() * variance - variance/2) + (i * trend);
      return { time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), value: Number(val.toFixed(1)) };
    });
  };

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!id) return;
      try {
        const fetchedAsset = await getAsset(id);
        if (fetchedAsset) {
          setAsset(fetchedAsset);
          
          const [fetchedWeather, fetchedRisk, fetchedRec] = await Promise.all([
            getWeather(fetchedAsset.location.area),
            getRiskResult(id),
            getRecommendation(id)
          ]);
          
          setWeather(fetchedWeather);
          setRisk(fetchedRisk);
          setRecommendation(fetchedRec);
        }
      } catch (error) {
        console.error("Failed to load asset details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Asset Telemetry...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="asset-not-found">
        <h2>Asset Not Found</h2>
        <Link to="/" className="btn-secondary">Return to Dashboard</Link>
      </div>
    );
  }

  const tempHistory = generateMockHistory(asset.current_telemetry.temperature_c - 10, 5, 0.5);
  const pdHistory = generateMockHistory(asset.current_telemetry.partial_discharge_pc - 100, 50, 5);

  const getStatusFlag = (type: string, val: number) => {
    if (type === 'temp') return val > 90 ? 'critical' : val > 75 ? 'degrading' : 'normal';
    if (type === 'vib') return val > 40 ? 'critical' : val > 30 ? 'degrading' : 'normal';
    if (type === 'pd') return val > 300 ? 'critical' : val > 150 ? 'degrading' : 'normal';
    if (type === 'oil') return val < 50 ? 'critical' : val < 70 ? 'degrading' : 'normal';
    return 'normal';
  };

  return (
    <div className="asset-detail-container">
      <div className="breadcrumb">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Grid Overview
        </Link>
      </div>

      {/* Identity Block */}
      <div className="hud-panel detail-header-card">
        <div className="header-info">
          <h2>{asset.name}</h2>
          <p className="font-mono text-secondary">ID: {asset.asset_id} • TYPE: {asset.type.toUpperCase()} • AREA: {asset.location.area}</p>
        </div>
        <div className="header-actions">
          {risk && <RiskBadge level={risk.risk_level} />}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column: Telemetry & Failure Prediction */}
        <div className="telemetry-column">
          
          <h3 className="section-title">SENSOR INTELLIGENCE</h3>
          <div className="current-readings-grid">
            {/* Temp */}
            <div className={`hud-panel reading-card flag-${getStatusFlag('temp', asset.current_telemetry.temperature_c)}`}>
              <Thermometer className="reading-icon" size={20} />
              <div className="reading-info">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{asset.current_telemetry.temperature_c}°C</span>
                <span className="status-flag">{getStatusFlag('temp', asset.current_telemetry.temperature_c).toUpperCase()}</span>
              </div>
            </div>
            {/* Vib */}
            <div className={`hud-panel reading-card flag-${getStatusFlag('vib', asset.current_telemetry.vibration_hz)}`}>
              <Activity className="reading-icon" size={20} />
              <div className="reading-info">
                <span className="reading-label">Vibration</span>
                <span className="reading-value">{asset.current_telemetry.vibration_hz} Hz</span>
                <span className="status-flag">{getStatusFlag('vib', asset.current_telemetry.vibration_hz).toUpperCase()}</span>
              </div>
            </div>
            {/* PD */}
            <div className={`hud-panel reading-card flag-${getStatusFlag('pd', asset.current_telemetry.partial_discharge_pc)}`}>
              <Zap className="reading-icon" size={20} />
              <div className="reading-info">
                <span className="reading-label">Partial Discharge</span>
                <span className="reading-value">{asset.current_telemetry.partial_discharge_pc} pC</span>
                <span className="status-flag">{getStatusFlag('pd', asset.current_telemetry.partial_discharge_pc).toUpperCase()}</span>
              </div>
            </div>
            {/* Oil */}
            <div className={`hud-panel reading-card flag-${getStatusFlag('oil', asset.current_telemetry.oil_quality_index)}`}>
              <Droplets className="reading-icon" size={20} />
              <div className="reading-info">
                <span className="reading-label">Oil Quality Index</span>
                <span className="reading-value">{asset.current_telemetry.oil_quality_index}</span>
                <span className="status-flag">{getStatusFlag('oil', asset.current_telemetry.oil_quality_index).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="hud-panel charts-section">
            <TelemetryChart data={tempHistory} title="Temperature Trend (24h)" dataKey="value" color="#ffaa00" />
            <TelemetryChart data={pdHistory} title="Partial Discharge Trend (24h)" dataKey="value" color="#ff3333" />
          </div>

          {/* Bob AI Panel */}
          <div className="bob-section" style={{height: '350px', marginTop: '1rem'}}>
            <BobPanel />
          </div>
        </div>

        {/* Right Column: Context, Risk & Impact */}
        <div className="context-column">
          
          {risk && (
            <div className="hud-panel prediction-card">
              <h3 className="text-red flex-center"><ShieldAlert size={18} className="mr-2"/> FAILURE PREDICTION DETAIL</h3>
              <div className="prediction-grid">
                <div className="pred-item">
                  <span className="text-secondary">Time-to-Failure</span>
                  <span className="text-orange font-bold text-lg"><Clock size={14} className="inline-icon mr-1"/> &lt; {risk.predicted_failure_window_hrs} HRS</span>
                </div>
                <div className="pred-item">
                  <span className="text-secondary">AI Confidence</span>
                  <span className="text-green font-bold text-lg">{risk.confidence_score}%</span>
                </div>
                <div className="pred-item full-width mt-2">
                  <span className="text-secondary">Driving Signal:</span>
                  <span className="font-mono text-cyan">{risk.driving_signal}</span>
                </div>
                <div className="pred-item full-width mt-2">
                  <span className="text-secondary"><History size={14} className="inline-icon mr-1"/> Historical Comparison:</span>
                  <span className="font-mono">{risk.historical_comparison}</span>
                </div>
              </div>
            </div>
          )}

          {risk && (
            <div className="hud-panel impact-card mt-3">
              <h3 className="flex-center"><Users size={18} className="mr-2 text-cyan"/> DOWNSTREAM IMPACT</h3>
              <div className="impact-info">
                <span className="text-secondary">Customers Affected:</span>
                <span className="font-bold text-red text-xl ml-2">{risk.customers_impacted.toLocaleString()}</span>
              </div>
              <p className="text-secondary text-sm mt-1">A failure here cascades to {asset.location.area}, triggering a localized blackout.</p>
            </div>
          )}

          {weather && (
            <div className="hud-panel context-card mt-3">
              <h3><CloudLightning size={18} className="inline-icon text-orange" /> WEATHER CORRELATION</h3>
              <div className="weather-details">
                <div className="weather-item">
                  <span className="text-secondary">Local Forecast:</span>
                  <span className="font-medium">{weather.forecast}</span>
                </div>
                <div className="weather-item">
                  <span className="text-secondary"><Wind size={14} className="inline-icon"/> Wind Speed:</span>
                  <span>{weather.wind_speed_mph} mph</span>
                </div>
                <div className="weather-item full-width">
                  <span className="text-secondary">AI Analysis:</span>
                  <p className="text-sm mt-1 border-l-2 pl-2 border-cyan text-cyan">
                    {weather.compounding_risk_factor > 1.2 
                      ? "High winds and lightning drastically compound existing sensor degradation. Risk escalated." 
                      : "Weather stable. No immediate compounding factors detected."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {recommendation && (
            <div className="mt-3">
              <h3 className="section-title mb-2">MAINTENANCE PLANNER (ACTION LOG)</h3>
              <div className="hud-panel mb-2">
                <p className="text-sm"><span className="text-secondary">Last Maintenance:</span> {asset.last_maintenance}</p>
                <p className="text-sm"><span className="text-secondary">Age:</span> Installed {asset.installation_date}</p>
              </div>
              <RecommendationCard recommendation={recommendation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
