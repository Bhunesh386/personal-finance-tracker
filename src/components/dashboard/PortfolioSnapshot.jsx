import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import PortfolioDonutChart from '../charts/PortfolioDonutChart';
import { formatCurrency } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

export default function PortfolioSnapshot({ totalValue, todayPnL, todayPnLPercent, allocation = [] }) {
  const navigate = useNavigate();
  const isPositive = todayPnL >= 0;

  return (
    <Card>
      <CardHeader
        title="Portfolio Snapshot"
        action={
          <button
            onClick={() => navigate('/portfolio')}
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
          >
            View Portfolio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
      <p className="text-2xl font-bold text-light-text dark:text-dark-text">
        {formatCurrency(totalValue)}
      </p>
      <Badge color={isPositive ? 'green' : 'red'} className="mt-2">
        {isPositive ? '▲' : '▼'} {formatCurrency(Math.abs(todayPnL))} ({todayPnLPercent?.toFixed(2)}%)
      </Badge>

      {allocation.length > 0 && (
        <div className="mt-4">
          <PortfolioDonutChart data={allocation.slice(0, 5)} height={180} />
        </div>
      )}
    </Card>
  );
}
