import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-light-text dark:text-dark-text mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function IncomeExpenseBarChart({ data = [], height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={{ stroke: '#2A2A3A' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: '#94A3B8' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
