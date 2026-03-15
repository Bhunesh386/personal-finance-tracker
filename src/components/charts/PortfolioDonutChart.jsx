import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#F43F5E', '#06B6D4', '#EC4899', '#8B5CF6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-light-text dark:text-dark-text">{data.ticker}</p>
      <p className="text-xs text-light-muted dark:text-dark-muted">{data.companyName}</p>
      <p className="text-sm mt-1">{formatCurrency(data.value)} ({data.percent?.toFixed(1)}%)</p>
    </div>
  );
};

export default function PortfolioDonutChart({ data = [], height = 220 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    percent: total > 0 ? (d.value / total) * 100 : 0,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {chartData.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-light-muted dark:text-dark-muted">{item.ticker}</span>
            </div>
            <span className="text-light-text dark:text-dark-text font-medium">{item.percent?.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
