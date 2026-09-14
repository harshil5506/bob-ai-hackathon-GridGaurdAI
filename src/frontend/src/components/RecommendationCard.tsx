import React from 'react';
import { Recommendation } from '../types';
import { AlertCircle, Truck, Clock } from 'lucide-react';
import './RecommendationCard.css';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  return (
    <div className={`rec-card priority-${recommendation.priority.toLowerCase()}`}>
      <div className="rec-header">
        <AlertCircle size={20} className="rec-icon" />
        <h3>Recommended Action</h3>
        <span className="rec-priority-badge">{recommendation.priority} PRIORITY</span>
      </div>
      
      <div className="rec-body">
        <p className="rec-action"><strong>Action:</strong> {recommendation.action}</p>
        <p className="rec-reason"><strong>Reason:</strong> {recommendation.reason}</p>
      </div>

      <div className="crew-preposition">
        <h4><Truck size={16} /> Crew Pre-Positioning</h4>
        <div className="crew-details">
          <span><strong>Staging Area:</strong> {recommendation.crew_pre_positioning.suggested_area}</span>
          <span className="crew-timing"><Clock size={14} /> {recommendation.crew_pre_positioning.timing}</span>
        </div>
      </div>
    </div>
  );
};
