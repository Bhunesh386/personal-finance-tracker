import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-light-muted dark:text-dark-muted">{label}</p>
      <p className="text-sm font-medium text-light-text dark:text-dark-text mt-1">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

export default function PortfolioLineChart({ data = [], height = 300, color = '#4F46E5' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
        <XAxis
          dataKey="datetime"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#2A2A3A' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
