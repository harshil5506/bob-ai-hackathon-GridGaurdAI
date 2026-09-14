import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssets, getRiskResult } from '../services/api';
import { Asset, RiskResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { Database, Zap, Activity } from 'lucide-react';
import './Assets.css';

export const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<Record<string, RiskResult>>({});
  const [loading, setLoading] = useState(true);

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
        <p>Connecting to Grid Database...</p>
      </div>
    );
  }

  const criticalCount = assets.filter(a => risks[a.asset_id]?.risk_level === 'critical').length;
  const warningCount = assets.filter(a => risks[a.asset_id]?.risk_level === 'high' || risks[a.asset_id]?.risk_level === 'medium').length;
  const healthyCount = assets.filter(a => risks[a.asset_id]?.risk_level === 'low').length;

  return (
    <div className="assets-view-container">
      
      <div className="hud-panel title-panel">
        <h2 className="flex-center text-cyan"><Database className="mr-2" /> GRID ASSET INVENTORY</h2>
        <p className="text-secondary text-sm">Comprehensive live registry of all monitored grid infrastructure nodes.</p>
      </div>

      <div className="assets-summary-strip">
        <div className="hud-panel summary-card border-green">
          <Activity size={24} className="text-green mb-1" />
          <span className="summary-val text-green">{healthyCount}</span>
          <span className="summary-label">HEALTHY ASSETS</span>
        </div>
        <div className="hud-panel summary-card border-orange">
          <Zap size={24} className="text-orange mb-1" />
          <span className="summary-val text-orange">{warningCount}</span>
          <span className="summary-label">ELEVATED RISK</span>
        </div>
        <div className="hud-panel summary-card border-red">
          <Database size={24} className="text-red mb-1" />
          <span className="summary-val text-red">{criticalCount}</span>
          <span className="summary-label">CRITICAL FAILURES</span>
        </div>
      </div>

      <div className="hud-panel flex-1 overflow-hidden flex flex-col">
        <h3 className="hud-panel-title">GLOBAL REGISTRY</h3>
        <div className="table-responsive">
          <table className="hud-table priority-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name / Description</th>
                <th>Type</th>
                <th>Location</th>
                <th>Risk Status</th>
                <th>Last Maintenance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => {
                const risk = risks[asset.asset_id];
                return (
                  <tr key={asset.asset_id} className="table-row-hover">
                    <td className="font-mono text-cyan">{asset.asset_id}</td>
                    <td className="font-bold">{asset.name}</td>
                    <td className="uppercase text-secondary text-sm">{asset.type}</td>
                    <td>{asset.location.area}</td>
                    <td>{risk ? <RiskBadge level={risk.risk_level} /> : '--'}</td>
                    <td className="font-mono text-sm">{asset.last_maintenance}</td>
                    <td>
                      <Link to={`/asset/${asset.asset_id}`} className="btn-secondary hud-btn">DIAGNOSTICS</Link>
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
