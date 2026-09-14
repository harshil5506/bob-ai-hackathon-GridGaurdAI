import React, { useEffect, useState } from 'react';
import { CloudLightning, Wind, Droplets, CloudRain } from 'lucide-react';
import { getWeather } from '../services/api';
import { WeatherContext } from '../types';
import './Weather.css';

export const Weather: React.FC = () => {
  const [sectors, setSectors] = useState<WeatherContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await Promise.all([
        getWeather("Sector 4"),
        getWeather("Sector 2"),
        getWeather("Sector 5")
      ]);
      setSectors(data);
      setLoading(false);
    };
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Syncing Meteorological Data...</p>
      </div>
    );
  }

  return (
    <div className="weather-view-container">
      <div className="hud-panel title-panel">
        <h2 className="flex-center text-cyan"><CloudLightning className="mr-2" /> METEOROLOGICAL COMMAND CENTER</h2>
        <p className="text-secondary text-sm">Real-time sector weather analysis and grid compounding risk factors.</p>
      </div>

      <div className="weather-grid">
        {sectors.map((sector, index) => {
          const isCritical = sector.compounding_risk_factor > 1.2;
          return (
            <div key={index} className={`hud-panel weather-card ${isCritical ? 'critical-weather' : 'normal-weather'}`}>
              <div className="weather-card-header">
                <h3>{sector.area.toUpperCase()}</h3>
                <span className={`status-flag ${isCritical ? 'bg-red-dim text-red' : 'bg-green-dim text-green'}`}>
                  {isCritical ? 'STORM WARNING' : 'CLEAR'}
                </span>
              </div>
              
              <div className="weather-metrics mt-4">
                <div className="metric-row">
                  <span className="text-secondary flex-center"><CloudRain size={16} className="mr-2"/> Forecast</span>
                  <span className="font-bold">{sector.forecast}</span>
                </div>
                <div className="metric-row">
                  <span className="text-secondary flex-center"><Wind size={16} className="mr-2"/> Wind Speed</span>
                  <span className="font-bold">{sector.wind_speed_mph} MPH</span>
                </div>
                <div className="metric-row">
                  <span className="text-secondary flex-center"><Droplets size={16} className="mr-2"/> Precipitation</span>
                  <span className="font-bold">{sector.precipitation_mm} MM</span>
                </div>
              </div>

              <div className="risk-multiplier mt-4">
                <span className="text-secondary">Grid Compounding Risk Multiplier:</span>
                <span className={`text-xl font-bold ml-2 ${isCritical ? 'text-red' : 'text-green'}`}>
                  {sector.compounding_risk_factor}x
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
