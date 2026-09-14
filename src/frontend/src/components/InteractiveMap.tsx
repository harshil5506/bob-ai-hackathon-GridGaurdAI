import React, { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Link } from 'react-router-dom';
import { Asset, RiskResult } from '../types';
import { getRiskResult } from '../services/api';
import './InteractiveMap.css';

interface InteractiveMapProps {
  assets: Asset[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ assets }) => {
  const [risks, setRisks] = useState<Record<string, RiskResult>>({});

  useEffect(() => {
    const fetchRisks = async () => {
      const riskData: Record<string, RiskResult> = {};
      for (const asset of assets) {
        riskData[asset.asset_id] = await getRiskResult(asset.asset_id);
      }
      setRisks(riskData);
    };
    fetchRisks();
  }, [assets]);

  return (
    <div className="interactive-map-container hud-panel">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="map-controls">
              <button onClick={() => zoomIn()}>+</button>
              <button onClick={() => zoomOut()}>-</button>
              <button onClick={() => resetTransform()}>RESET</button>
            </div>
            <TransformComponent wrapperClass="map-transform-wrapper" contentClass="map-content">
              <div className="map-background">
                {/* Overlay Assets */}
                {assets.map((asset) => {
                  const risk = risks[asset.asset_id];
                  const colorClass = risk?.risk_level === 'critical' ? 'critical-node' : 
                                     risk?.risk_level === 'high' ? 'high-node' :
                                     risk?.risk_level === 'medium' ? 'medium-node' : 'low-node';

                  // Use map_coordinates if available, else default to center
                  const x = asset.location.map_coordinates?.x || 50;
                  const y = asset.location.map_coordinates?.y || 50;

                  return (
                    <Link 
                      to={`/asset/${asset.asset_id}`} 
                      key={asset.asset_id}
                      className={`map-node ${colorClass}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      title={`${asset.name} (${risk?.risk_level || 'Loading'})`}
                    >
                      <div className="node-pulse"></div>
                      <div className="node-core"></div>
                      <div className="node-label">{asset.asset_id}</div>
                    </Link>
                  );
                })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
