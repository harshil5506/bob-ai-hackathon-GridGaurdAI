import React, { useEffect, useRef, useState } from 'react';
import './PowerStationBackground.css';
import { Zap, Activity, Radio, Cpu } from 'lucide-react';

interface ElectricArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  points: { x: number; y: number }[];
  color: string;
}

export const PowerStationBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [powerOutput, setPowerOutput] = useState(1485.4);
  const [frequency, setFrequency] = useState(50.02);
  const [voltage, setVoltage] = useState(500.1);
  const [surgeActive, setSurgeActive] = useState(false);

  // Dynamic telemetry fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setPowerOutput((prev) => +(prev + (Math.random() - 0.48) * 3).toFixed(1));
      setFrequency(+(50 + (Math.random() - 0.5) * 0.04).toFixed(2));
      setVoltage(+(500 + (Math.random() - 0.5) * 1.2).toFixed(1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Canvas electric discharge and transmission arc simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const arcs: ElectricArc[] = [];
    const particles: { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }[] = [];

    // Helper to generate jagged electric lightning path
    const createLightningPath = (x1: number, y1: number, x2: number, y2: number, segments = 8, roughness = 22) => {
      const pts = [{ x: x1, y: y1 }];
      const dx = (x2 - x1) / segments;
      const dy = (y2 - y1) / segments;

      for (let i = 1; i < segments; i++) {
        const cx = x1 + dx * i + (Math.random() - 0.5) * roughness;
        const cy = y1 + dy * i + (Math.random() - 0.5) * roughness;
        pts.push({ x: cx, y: cy });
      }
      pts.push({ x: x2, y: y2 });
      return pts;
    };

    // Generator core anchor locations (left and right power generation nodes)
    const getGeneratorNodes = () => [
      { x: width * 0.15, y: height * 0.72 }, // Left Main Turbine
      { x: width * 0.28, y: height * 0.65 }, // Left Step-up Transformer
      { x: width * 0.5, y: height * 0.58 },  // Central High-Voltage Switchyard
      { x: width * 0.72, y: height * 0.65 }, // Right Step-up Transformer
      { x: width * 0.85, y: height * 0.72 }, // Right Main Turbine
    ];

    let lastArcTime = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      const nodes = getGeneratorNodes();

      // Spawn periodic random electrical arcs between station transformers
      if (time - lastArcTime > (surgeActive ? 60 : 180)) {
        lastArcTime = time;
        const fromIdx = Math.floor(Math.random() * nodes.length);
        let toIdx = Math.floor(Math.random() * nodes.length);
        if (toIdx === fromIdx) toIdx = (fromIdx + 1) % nodes.length;

        const from = nodes[fromIdx];
        const to = nodes[toIdx];

        arcs.push({
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          life: 0,
          maxLife: Math.random() * 12 + 8,
          points: createLightningPath(from.x, from.y, to.x, to.y, 9, 30),
          color: Math.random() > 0.3 ? '#00f3ff' : '#00ffaa'
        });

        // If mouse is nearby, discharge arc towards mouse cursor
        if (mousePos.x > 0 && Math.random() > 0.4) {
          const nearestNode = nodes[Math.floor(Math.random() * nodes.length)];
          arcs.push({
            x1: nearestNode.x,
            y1: nearestNode.y,
            x2: mousePos.x,
            y2: mousePos.y,
            life: 0,
            maxLife: 10,
            points: createLightningPath(nearestNode.x, nearestNode.y, mousePos.x, mousePos.y, 10, 35),
            color: '#00f3ff'
          });
        }
      }

      // Draw and update active electric arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.life++;
        const alpha = 1 - arc.life / arc.maxLife;

        ctx.save();
        ctx.strokeStyle = arc.color;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 2 + Math.random() * 2;
        ctx.globalAlpha = Math.max(0, alpha);

        ctx.beginPath();
        for (let j = 0; j < arc.points.length; j++) {
          const pt = arc.points[j];
          if (j === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Inner white hot core of the lightning arc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Spawn sparks at the termination point
        if (Math.random() > 0.5) {
          const lastPt = arc.points[arc.points.length - 1];
          particles.push({
            x: lastPt.x,
            y: lastPt.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4 - 2,
            life: 0,
            size: Math.random() * 2.5 + 1,
            color: arc.color
          });
        }

        if (arc.life >= arc.maxLife) {
          arcs.splice(i, 1);
        }
      }

      // Update & draw glowing spark particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const pAlpha = 1 - p.life / 30;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = Math.max(0, pAlpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.life >= 30) {
          particles.splice(i, 1);
        }
      }

      // Draw high-voltage transmission catenary lines
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        // Hanging sag curve
        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2 + 35;
        ctx.quadraticCurveTo(midX, midY, n2.x, n2.y);
        ctx.stroke();

        // Animated power energy pulse moving along transmission wire
        const pulseT = ((time * 0.001 * (surgeActive ? 2.5 : 1)) + i * 0.25) % 1;
        const px = (1 - pulseT) * (1 - pulseT) * n1.x + 2 * (1 - pulseT) * pulseT * midX + pulseT * pulseT * n2.x;
        const py = (1 - pulseT) * (1 - pulseT) * n1.y + 2 * (1 - pulseT) * pulseT * midY + pulseT * pulseT * n2.y;

        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos, surgeActive]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const triggerPowerSurge = () => {
    setSurgeActive(true);
    setPowerOutput((prev) => +(prev + 180).toFixed(1));
    setTimeout(() => setSurgeActive(false), 2500);
  };

  return (
    <div className="power-station-bg" onMouseMove={handleMouseMove} onClick={triggerPowerSurge}>
      {/* 1. Canvas Layer for Live Electric Arcs & Sparks */}
      <canvas ref={canvasRef} className="station-electric-canvas" />

      {/* 2. Generating Station Horizon Silhouettes & Glows */}
      <div className="station-silhouette-layer">
        {/* Sky Aurora & Generator Atmosphere */}
        <div className="station-aurora-glow"></div>

        {/* High Voltage Grid Pylons & Transmission Towers */}
        <div className="pylon pylon-left"></div>
        <div className="pylon pylon-center-left"></div>
        <div className="pylon pylon-center-right"></div>
        <div className="pylon pylon-right"></div>

        {/* Massive Generator Turbines & Reactor Cooling Towers */}
        <div className="cooling-tower tower-left">
          <div className="steam-plume plume-1"></div>
          <div className="tower-core-glow"></div>
        </div>

        <div className="turbine-hall">
          <div className="turbine-glow-windows">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="window-light"></div>
            ))}
          </div>
          <div className="transformer-bank">
            <div className="transformer-unit tf-1">
              <div className="bushing-spark"></div>
            </div>
            <div className="transformer-unit tf-2">
              <div className="bushing-spark spark-alt"></div>
            </div>
            <div className="transformer-unit tf-3">
              <div className="bushing-spark"></div>
            </div>
          </div>
        </div>

        <div className="cooling-tower tower-right">
          <div className="steam-plume plume-2"></div>
          <div className="tower-core-glow"></div>
        </div>

        {/* Foreground Ground Grid & High-Voltage Busbars */}
        <div className="station-ground-mesh"></div>
      </div>

      {/* 3. Real-Time Telemetry Bar at Header */}
      <div className="station-telemetry-hud">
        <div className="hud-metric">
          <Zap size={14} className="metric-icon cyan-glow" />
          <span className="metric-label">GENERATOR OUTPUT:</span>
          <span className="metric-val text-cyan">{powerOutput} MW</span>
          <span className="metric-pill">BASELOAD</span>
        </div>

        <div className="hud-metric">
          <Activity size={14} className="metric-icon green-glow" />
          <span className="metric-label">GRID FREQ:</span>
          <span className="metric-val text-green">{frequency} Hz</span>
          <span className="metric-sub">STABLE (±0.05)</span>
        </div>

        <div className="hud-metric">
          <Cpu size={14} className="metric-icon orange-glow" />
          <span className="metric-label">BUS VOLTAGE:</span>
          <span className="metric-val text-orange">{voltage} kV</span>
        </div>

        <div className="hud-interactive-hint">
          <Radio size={12} className="pulse-dot text-cyan" />
          <span>INTERACTIVE STATION • CLICK CANVAS TO TRIGGER ENERGY SURGE</span>
        </div>
      </div>
    </div>
  );
};
