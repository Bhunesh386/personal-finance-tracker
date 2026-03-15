import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

export default function BudgetOverviewCard({ totalBudgeted, totalSpent, onTrackCount, totalCategories }) {
  const remaining = totalBudgeted - totalSpent;
  const percent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
  const clampedPercent = Math.min(percent, 100);

  const strokeColor = percent < 60 ? '#10B981' : percent < 85 ? '#F59E0B' : '#F43F5E';
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <Card className="flex flex-col md:flex-row items-center gap-8 p-8">
      {/* Left: Total budgeted */}
      <div className="text-center md:text-right flex-1">
        <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Total Budgeted</p>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{formatCurrency(totalBudgeted)}</p>
      </div>

      {/* Center: Progress ring */}
      <div className="relative shrink-0">
        <svg width="160" height="160" className="-rotate-90">
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-dark-border"
            strokeWidth="10"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-light-text dark:text-dark-text">{Math.round(percent)}%</span>
          <span className="text-xs text-light-muted dark:text-dark-muted">used</span>
        </div>
      </div>

      {/* Right: Total spent */}
      <div className="text-center md:text-left flex-1">
        <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Total Spent</p>
        <p className="text-2xl font-bold text-light-text dark:text-dark-text">{formatCurrency(totalSpent)}</p>
        <p className={`text-lg font-semibold mt-2 ${remaining >= 0 ? 'text-positive' : 'text-negative'}`}>
          {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'remaining' : 'over budget'}
        </p>
        <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
          {onTrackCount} of {totalCategories} categories on track
        </p>
      </div>
    </Card>
  );
}
