import React, { useEffect, useState } from 'react';
import { getAssets, getRiskResult } from '../services/api';
import { Asset, RiskResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Activity, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAssets = await getAssets();
        setAssets(fetchedAssets);
        
        // Fetch risk results for all assets
        const riskPromises = fetchedAssets.map(a => getRiskResult(a.asset_id));
        const riskResults = await Promise.all(riskPromises);
        
        const riskMap: Record<string, RiskResult> = {};
        riskResults.forEach(r => {
          riskMap[r.asset_id] = r;
        });
        setRisks(riskMap);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Grid Telemetry...</p>
      </div>
    );
  }

  const highRiskCount = Object.values(risks).filter(r => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-section">
        <h2>Grid Health Overview</h2>
        <p className="text-secondary">Real-time telemetry and risk prediction</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Assets Monitored</h3>
            <p className="stat-value">{assets.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>At-Risk Equipment</h3>
            <p className="stat-value">{highRiskCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Overall Grid Status</h3>
            <p className="stat-value">{highRiskCount > 0 ? 'Degraded' : 'Stable'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper orange">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Outages</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>

      <div className="dashboard-table-section">
        <div className="table-header">
          <h3>Asset Risk Ranking</h3>
        </div>
        <div className="table-responsive">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Grid Impact</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => {
                const risk = risks[asset.asset_id];
                return (
                  <tr key={asset.asset_id} className="table-row-hover">
                    <td className="font-mono">{asset.asset_id}</td>
                    <td className="font-medium">{asset.name}</td>
                    <td>{asset.location.area}</td>
                    <td>{asset.grid_impact_score.toFixed(1)}</td>
                    <td>
                      {risk ? <RiskBadge level={risk.risk_level} /> : <span className="text-secondary">Pending...</span>}
                    </td>
                    <td>
                      <button className="btn-secondary">View Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
