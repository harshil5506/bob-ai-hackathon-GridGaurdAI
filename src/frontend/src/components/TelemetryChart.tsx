import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

interface TelemetryChartProps {
  data: DataPoint[];
  title: string;
  dataKey: string;
  color: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data, title, color }) => {
  return (
    <div className="telemetry-chart-container" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ height: '250px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} />
            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
