import React from 'react';
import './AnimatedBackground.css';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-bg-container">
      <div className="grid-layer layer-1"></div>
      <div className="grid-layer layer-2"></div>
      <div className="particles-container">
        {/* Simulate 5D/6D moving particles/nodes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={`particle particle-${i % 5}`}></div>
        ))}
      </div>
      <div className="bg-overlay"></div>
    </div>
  );
};
