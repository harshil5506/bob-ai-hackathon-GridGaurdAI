import React from 'react';
import './RiskBadge.css';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'low' | 'medium' | 'high' | 'critical';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const upper = level ? level.toUpperCase() : 'LOW';
  const getBadgeClass = () => {
    switch (upper) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      case 'LOW': return 'badge-low';
      default: return 'badge-low';
    }
  };

  return (
    <span className={`risk-badge ${getBadgeClass()}`}>
      {upper}
    </span>
  );
};
