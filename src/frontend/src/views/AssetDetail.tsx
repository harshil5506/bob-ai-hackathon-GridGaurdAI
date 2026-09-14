import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAsset, getWeather, getRiskResult } from '../services/api';
import { Asset, WeatherContext, RiskResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { TelemetryChart } from '../components/TelemetryChart';
import { ArrowLeft, Thermometer, Activity, Zap, Droplets, CloudLightning, Wind, CloudRain } from 'lucide-react';
import './AssetDetail.css';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [weather, setWeather] = useState<WeatherContext | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);
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
          
          // Fetch parallel dependencies
          const [fetchedWeather, fetchedRisk] = await Promise.all([
            getWeather(fetchedAsset.location.area),
            getRiskResult(id)
          ]);
          
          setWeather(fetchedWeather);
          setRisk(fetchedRisk);
        }
      } catch (error) {
        console.error("Failed to load asset details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  return (
    <div className="asset-detail-container">
      <div className="breadcrumb">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="detail-header-card">
        <div className="header-info">
          <h2>{asset.name}</h2>
          <p className="font-mono text-secondary">{asset.asset_id} • {asset.type.toUpperCase()} • {asset.location.area}</p>
        </div>
        <div className="header-actions">
          {risk && <RiskBadge level={risk.risk_level} />}
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Column: Telemetry & Charts */}
        <div className="telemetry-column">
          <div className="current-readings-grid">
            <div className="reading-card">
              <Thermometer className="reading-icon text-orange" size={20} />
              <div className="reading-info">
                <span className="reading-label">Temperature</span>
                <span className="reading-value">{asset.current_telemetry.temperature_c}°C</span>
              </div>
            </div>
            <div className="reading-card">
              <Activity className="reading-icon text-blue" size={20} />
              <div className="reading-info">
                <span className="reading-label">Vibration</span>
                <span className="reading-value">{asset.current_telemetry.vibration_hz} Hz</span>
              </div>
            </div>
            <div className="reading-card">
              <Zap className="reading-icon text-red" size={20} />
              <div className="reading-info">
                <span className="reading-label">Partial Discharge</span>
                <span className="reading-value">{asset.current_telemetry.partial_discharge_pc} pC</span>
              </div>
            </div>
            <div className="reading-card">
              <Droplets className="reading-icon text-green" size={20} />
              <div className="reading-info">
                <span className="reading-label">Oil Quality Index</span>
                <span className="reading-value">{asset.current_telemetry.oil_quality_index}</span>
              </div>
            </div>
          </div>

          <div className="charts-section">
            <TelemetryChart data={tempHistory} title="Temperature Trend (24h)" dataKey="value" color="#f97316" />
            <TelemetryChart data={pdHistory} title="Partial Discharge Trend (24h)" dataKey="value" color="#ef4444" />
          </div>
        </div>

        {/* Right Column: Context & Risk Explanation */}
        <div className="context-column">
          {weather && (
            <div className="context-card">
              <h3><CloudLightning size={18} className="inline-icon" /> Weather Context</h3>
              <div className="weather-details">
                <div className="weather-item">
                  <span className="text-secondary">Forecast:</span>
                  <span className="font-medium">{weather.forecast}</span>
                </div>
                <div className="weather-item">
                  <span className="text-secondary"><Wind size={14} className="inline-icon"/> Wind Speed:</span>
                  <span>{weather.wind_speed_mph} mph</span>
                </div>
                <div className="weather-item">
                  <span className="text-secondary"><CloudRain size={14} className="inline-icon"/> Precipitation:</span>
                  <span>{weather.precipitation_mm} mm</span>
                </div>
                <div className="weather-item">
                  <span className="text-secondary">Compounding Risk:</span>
                  <span className={weather.compounding_risk_factor > 1.2 ? 'text-red font-medium' : 'text-green'}>
                    {weather.compounding_risk_factor}x
                  </span>
                </div>
              </div>
            </div>
          )}

          {risk && (
            <div className="context-card risk-card">
              <h3>Risk Explanation</h3>
              <div className="risk-score-display">
                <span className="score-label">AI Risk Score</span>
                <span className="score-value">{risk.risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="contributing-factors">
                <h4>Contributing Factors:</h4>
                <ul>
                  {risk.contributing_factors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
