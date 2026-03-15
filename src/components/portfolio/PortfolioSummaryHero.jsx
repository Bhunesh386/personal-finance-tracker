import React from 'react';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp } from 'lucide-react';

export default function PortfolioSummaryHero({ metrics, allocation = [] }) {
  const { totalValue = 0, totalInvested = 0, totalPnL = 0, totalPnLPercent = 0, todayPnL = 0, todayPnLPercent = 0, holdingsCount = 0, uniqueStocks = 0 } = metrics || {};

  const isPnLPositive = totalPnL >= 0;
  const isTodayPositive = todayPnL >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-10 -mt-10" />
      <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
        {/* Left: Portfolio info */}
        <div className="flex-1">
          <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-light-text dark:text-dark-text">
            {formatCurrency(totalValue)}
          </p>

          <div className="flex items-center gap-3 mt-3">
            <Badge color={isTodayPositive ? 'green' : 'red'}>
              {isTodayPositive ? '▲' : '▼'} {formatCurrency(Math.abs(todayPnL))} ({todayPnLPercent.toFixed(2)}%)
            </Badge>
            <span className="text-xs text-light-muted dark:text-dark-muted">Today</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className={`text-sm font-medium ${isPnLPositive ? 'text-positive' : 'text-negative'}`}>
              {isPnLPositive ? '+' : ''}{formatCurrency(totalPnL)} ({totalPnLPercent.toFixed(2)}%)
            </span>
            <span className="text-xs text-light-muted dark:text-dark-muted">Total P&L</span>
          </div>

          <p className="text-xs text-light-muted dark:text-dark-muted mt-3">
            {holdingsCount} holdings across {uniqueStocks} stocks • Invested: {formatCurrency(totalInvested)}
          </p>
        </div>

        {/* Right: Quick allocation */}
        <div className="w-full lg:w-64 shrink-0">
          <p className="text-sm font-medium text-light-text dark:text-dark-text mb-3">Portfolio Allocation</p>
          <div className="space-y-2">
            {allocation.slice(0, 5).map((item, i) => {
              const total = allocation.reduce((s, a) => s + a.value, 0);
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" style={{ opacity: 1 - i * 0.15 }} />
                    <span className="text-light-muted dark:text-dark-muted">{item.ticker}</span>
                  </div>
                  <span className="text-light-text dark:text-dark-text font-medium">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
