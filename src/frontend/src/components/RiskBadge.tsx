import React from 'react';
import './RiskBadge.css';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const getBadgeClass = () => {
    switch (level) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      case 'LOW': return 'badge-low';
      default: return 'badge-low';
    }
  };

  return (
    <span className={`risk-badge ${getBadgeClass()}`}>
      {level}
    </span>
  );
};
