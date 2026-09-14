import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Loader2, CheckCircle2 } from 'lucide-react';
import './AiSimulator.css';

export const AiSimulator: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING NEURAL NET...");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5 + 1;
      
      if (currentProgress < 30) {
        setStatus("ANALYZING GRID TOPOLOGY...");
      } else if (currentProgress < 60) {
        setStatus("RUNNING 100,000 WEATHER SCENARIOS...");
      } else if (currentProgress < 90) {
        setStatus("COMPUTING FAILURE PROBABILITIES...");
      } else {
        setStatus("FINALIZING REPORT...");
      }

      if (currentProgress >= 100) {
        currentProgress = 100;
        setComplete(true);
        setStatus("SIMULATION COMPLETE");
        clearInterval(interval);
      }
      
      setProgress(currentProgress);
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="simulator-container">
      <div className="hud-panel simulator-panel">
        
        <div className="simulator-header">
          <BrainCircuit size={48} className={`text-cyan ${complete ? '' : 'pulse-anim'}`} />
          <h2 className="text-cyan mt-4">AI GRID SIMULATION</h2>
          <p className="text-secondary font-mono mt-2">{status}</p>
        </div>

        <div className="progress-container mt-4">
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-text mt-2 text-right font-mono text-cyan">
            {Math.round(progress)}%
          </div>
        </div>

        {complete && (
          <div className="simulation-results mt-4 animate-fade-in">
            <div className="result-card bg-green-dim border-green p-4 rounded">
              <h3 className="text-green flex-center"><CheckCircle2 className="mr-2" /> RESULTS</h3>
              <p className="mt-2 text-sm text-secondary">Simulation ran 100,000 scenarios over a 7-day horizon. Grid health remains stable under 92% of weather extremes. 1 critical anomaly detected in Sector 4 (Transformer SUB-001).</p>
            </div>
            
            <div className="mt-4 flex gap-4">
              <Link to="/predict" className="btn-secondary hud-btn flex-1 text-center">VIEW FORECAST</Link>
              <Link to="/" className="btn-secondary hud-btn flex-1 text-center">RETURN TO GRID</Link>
            </div>
          </div>
        )}

        {!complete && (
          <div className="mt-8 flex-center justify-center">
            <Loader2 className="animate-spin text-secondary" size={32} />
          </div>
        )}

      </div>
    </div>
  );
};
