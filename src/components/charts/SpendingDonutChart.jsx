import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F43F5E', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-light-text dark:text-dark-text">
        {data.icon} {data.name}
      </p>
      <p className="text-sm text-light-muted dark:text-dark-muted">
        {formatCurrency(data.total)} ({data.percent?.toFixed(1)}%)
      </p>
    </div>
  );
};

export default function SpendingDonutChart({ data = [], height = 250, showLegend = true }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  const chartData = data.map((d, i) => ({
    ...d,
    percent: total > 0 ? (d.total / total) * 100 : 0,
    fill: d.color || COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="total"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {showLegend && (
        <div className="space-y-2 mt-2">
          {chartData.slice(0, 6).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-light-muted dark:text-dark-muted truncate">{item.name}</span>
              </div>
              <span className="text-light-text dark:text-dark-text font-medium">
                {item.percent?.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
