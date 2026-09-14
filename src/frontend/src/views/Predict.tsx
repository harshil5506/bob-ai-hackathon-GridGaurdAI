import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, getRiskResult } from '../services/api';
import { Asset, RiskResult } from '../types';
import { TelemetryChart } from '../components/TelemetryChart';
import { BrainCircuit, Target, AlertTriangle, Cpu } from 'lucide-react';
import './Predict.css';

export const Predict: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskResult>>({});
  const [loading, setLoading] = useState(true);

  // Generate mock prediction data for the next 7 days (grid failure probability)
  const generateGridForecast = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const val = 15 + (Math.random() * 20) + (i === 4 ? 40 : 0); // Spike on day 4 (e.g. storm)
      return { time: date.toLocaleDateString([], {weekday: 'short', month: 'numeric', day: 'numeric'}), value: Number(val.toFixed(1)) };
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchedAssets = await getAssets();
      setAssets(fetchedAssets);
      
      const riskData: Record<string, RiskResult> = {};
      for (const asset of fetchedAssets) {
        riskData[asset.asset_id] = await getRiskResult(asset.asset_id);
      }
      setRisks(riskData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Initializing AI Neural Net...</p>
      </div>
    );
  }

  const forecastData = generateGridForecast();

  // Sort by shortest time to failure
  const failureHotspots = [...assets]
    .filter(a => risks[a.asset_id]?.risk_level === 'critical' || risks[a.asset_id]?.risk_level === 'high')
    .sort((a, b) => {
      const timeA = risks[a.asset_id]?.predicted_failure_window_hrs || 999;
      const timeB = risks[b.asset_id]?.predicted_failure_window_hrs || 999;
      return timeA - timeB;
    });

  const avgConfidence = (Object.values(risks).reduce((acc, curr) => acc + curr.confidence_score, 0) / Object.values(risks).length).toFixed(1);

  return (
    <div className="predict-view-container">
      
      <div className="hud-panel title-panel">
        <h2 className="flex-center text-cyan"><BrainCircuit className="mr-2" /> AI FORECASTING CENTER</h2>
        <p className="text-secondary text-sm">Deep-learning neural network projecting grid stability and asset failure horizons.</p>
      </div>

      <div className="predict-layout">
        {/* Left Column: Forecast Chart & Metrics */}
        <div className="predict-main-column">
          <div className="hud-panel flex-1 mb-4">
            <h3 className="hud-panel-title">7-DAY GRID FAILURE PROBABILITY (%)</h3>
            <div className="chart-wrapper">
              <TelemetryChart data={forecastData} title="" dataKey="value" color="#ffaa00" />
            </div>
            <div className="forecast-analysis mt-4 border-l-2 border-cyan pl-3">
              <span className="text-cyan font-bold block mb-1">AI ANALYSIS:</span>
              <p className="text-sm">Significant grid stress anomaly predicted on {forecastData[4].time} correlating with inbound weather events. Recommend pre-positioning assets in Sector 4 to mitigate cascade risk.</p>
            </div>
          </div>

          <div className="ai-metrics-grid">
            <div className="hud-panel kpi-card">
              <span className="kpi-label flex-center"><Cpu size={14} className="mr-1"/> NEURAL NET STATUS</span>
              <span className="kpi-value text-green mt-2">ONLINE</span>
              <span className="kpi-subtext">Running 1M+ Scenarios/hr</span>
            </div>
            <div className="hud-panel kpi-card">
              <span className="kpi-label flex-center"><Target size={14} className="mr-1"/> MODEL CONFIDENCE</span>
              <span className="kpi-value text-cyan mt-2">{avgConfidence}%</span>
              <span className="kpi-subtext">Aggregated Accuracy</span>
            </div>
          </div>
        </div>

        {/* Right Column: Failure Hotspots */}
        <div className="predict-side-column">
          <div className="hud-panel flex-1 flex flex-col overflow-hidden">
            <h3 className="hud-panel-title text-red flex-center"><AlertTriangle size={18} className="mr-2"/> FAILURE HOTSPOTS</h3>
            <div className="hotspot-list table-responsive">
              {failureHotspots.length === 0 ? (
                <div className="p-4 text-center text-secondary">No imminent failures predicted.</div>
              ) : (
                failureHotspots.map(asset => {
                  const risk = risks[asset.asset_id];
                  return (
                    <div key={asset.asset_id} className="hotspot-item">
                      <div className="hotspot-header">
                        <span className="font-mono font-bold text-red">{asset.asset_id}</span>
                        <span className="text-sm bg-red-dim text-red px-2 py-1 rounded">T-MINUS {risk.predicted_failure_window_hrs} HRS</span>
                      </div>
                      <div className="hotspot-body mt-2">
                        <p className="text-sm mb-1"><span className="text-secondary">Location:</span> {asset.location.area}</p>
                        <p className="text-sm mb-1"><span className="text-secondary">Driver:</span> {risk.driving_signal}</p>
                        <p className="text-sm text-cyan mt-2">Confidence: {risk.confidence_score}%</p>
                      </div>
                      <div className="mt-3">
                        <Link to={`/asset/${asset.asset_id}`} className="btn-secondary hud-btn w-full text-center block">VIEW PREDICTION DETAILS</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
