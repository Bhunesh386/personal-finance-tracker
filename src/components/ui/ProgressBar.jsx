import React from 'react';

export default function ProgressBar({ value, max = 100, color, className = '', height = 'h-2' }) {
  const percent = Math.min((value / max) * 100, 100);

  // Auto-color based on percentage if not provided
  const barColor = color ||
    (percent < 60 ? 'bg-positive' : percent < 85 ? 'bg-warning' : 'bg-negative');

  return (
    <div className={`w-full bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${barColor} ${height} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
