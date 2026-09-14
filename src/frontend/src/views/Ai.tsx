import React from 'react';
import { Bot } from 'lucide-react';
import { BobPanel } from '../components/BobPanel';
import './Ai.css';

export const Ai: React.FC = () => {
  return (
    <div className="ai-view-container">
      <div className="hud-panel title-panel mb-4">
        <h2 className="flex-center text-cyan"><Bot className="mr-2" size={28} /> AI EXPERT SYSTEM</h2>
        <p className="text-secondary text-sm">Direct interface with IBM Bob. Ask for diagnostics, grid analysis, or maintenance instructions.</p>
      </div>

      <div className="ai-full-panel-container">
        <BobPanel />
      </div>
    </div>
  );
};
