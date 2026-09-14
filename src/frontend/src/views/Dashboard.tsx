import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, getRiskResult, getWeather } from '../services/api';
import { Asset, RiskResult, WeatherContext } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { InteractiveMap } from '../components/InteractiveMap';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskResult>>({});
  const [weather, setWeather] = useState<WeatherContext | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedAssets = await getAssets();
      setAssets(fetchedAssets);
      
      const riskData: Record<string, RiskResult> = {};
      for (const asset of fetchedAssets) {
        riskData[asset.asset_id] = await getRiskResult(asset.asset_id);
      }
      setRisks(riskData);

      const fetchedWeather = await getWeather("Sector 4");
      setWeather(fetchedWeather);
    };
    fetchData();
  }, []);

  const highRiskAssets = assets.filter(a => {
    const risk = risks[a.asset_id];
    return risk && (risk.risk_level === 'high' || risk.risk_level === 'critical');
  });

  const criticalAlert = highRiskAssets.find(a => risks[a.asset_id]?.risk_level === 'critical');

  const sortedAssets = [...assets].sort((a, b) => {
    const riskA = risks[a.asset_id];
    const riskB = risks[b.asset_id];
    if (!riskA || !riskB) return 0;
    
    // Sort by impact severity * failure probability (represented by risk_score)
    const severityA = riskA.risk_score * a.grid_impact_score;
    const severityB = riskB.risk_score * b.grid_impact_score;
    return severityB - severityA;
  });

  return (
    <div className="dashboard-container">
      {/* Top Strip - System-wide KPIs */}
      <div className="kpi-strip">
        <div className="kpi-card hud-panel">
          <span className="kpi-label">SYSTEM STABILITY</span>
          <span className="kpi-value text-green">
            {assets.length > 0 ? (((assets.length - highRiskAssets.length) / assets.length) * 100).toFixed(1) : 0}%
          </span>
          <span className="kpi-subtext">{assets.length} Assets Monitored</span>
        </div>
        
        <div className="kpi-card hud-panel">
          <span className="kpi-label">PREDICTED OUTAGES (72H)</span>
          <span className="kpi-value text-orange">{highRiskAssets.length}</span>
          <span className="kpi-subtext">Confidence: 89.4%</span>
        </div>

        <div className="kpi-card hud-panel alert-kpi">
          <span className="kpi-label">HIGHEST SEVERITY ALERT</span>
          {criticalAlert ? (
            <>
              <span className="kpi-value text-red">{criticalAlert.asset_id}</span>
              <span className="kpi-subtext">{criticalAlert.name}</span>
            </>
          ) : (
            <>
              <span className="kpi-value text-green">NONE</span>
              <span className="kpi-subtext">Grid Operating Normally</span>
            </>
          )}
        </div>

        <div className="kpi-card hud-panel">
          <span className="kpi-label">WEATHER RISK</span>
          <span className="kpi-value text-orange">ACTIVE</span>
          <span className="kpi-subtext">{weather?.forecast || "Monitoring..."}</span>
        </div>
      </div>

      <div className="hud-dashboard-layout">
        {/* Left Column: Interactive Map */}
        <div className="hud-column map-column">
          <InteractiveMap assets={assets} />
        </div>

        {/* Right Column: Ranked Priority List & Crew Panel */}
        <div className="hud-column priority-column">
          <div className="hud-panel ranking-panel">
            <h3 className="hud-panel-title">RANKED PRIORITY LIST</h3>
            <div className="panel-content table-responsive">
              <table className="asset-table hud-table priority-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Location</th>
                    <th>Risk</th>
                    <th>Impact Severity</th>
                    <th>Failure Window</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAssets.map(asset => {
                    const risk = risks[asset.asset_id];
                    const severity = risk ? (risk.risk_score * asset.grid_impact_score).toFixed(0) : '--';
                    
                    return (
                      <tr key={asset.asset_id} className="table-row-hover">
                        <td className="font-mono">{asset.asset_id}</td>
                        <td>{asset.location.area}</td>
                        <td>{risk ? <RiskBadge level={risk.risk_level} /> : '--'}</td>
                        <td className={risk?.risk_level === 'critical' ? 'text-red font-bold' : ''}>{severity}</td>
                        <td className="text-orange">{risk?.predicted_failure_window_hrs ? `<${risk.predicted_failure_window_hrs} HRS` : '--'}</td>
                        <td>
                          <Link to={`/asset/${asset.asset_id}`} className="btn-secondary hud-btn">DRILL DOWN</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="hud-panel crew-panel">
            <h3 className="hud-panel-title">CREW PRE-POSITIONING</h3>
            <div className="panel-content">
              <div className="crew-item">
                <div className="crew-info">
                  <span className="crew-name font-bold">Crew 03 (Heavy Duty)</span>
                  <span className="crew-status text-green">Available</span>
                </div>
                <div className="crew-action">
                  <span className="text-secondary">Suggest: </span>
                  <span className="text-orange">Dispatch to Sector 4</span>
                </div>
              </div>
              <div className="crew-item">
                <div className="crew-info">
                  <span className="crew-name font-bold">Crew 12 (Diagnostics)</span>
                  <span className="crew-status text-orange">In Transit</span>
                </div>
                <div className="crew-action">
                  <span className="text-secondary">En Route to: </span>
                  <span>Sector 2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
