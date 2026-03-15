import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import SparklineChart from '../charts/SparklineChart';
import { Wallet } from 'lucide-react';

export default function NetWorthCard({ netWorth, change, sparklineData = [] }) {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-8 -mt-8" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-sm text-light-muted dark:text-dark-muted">Total Net Worth</p>
        </div>
        <p className="text-3xl font-bold text-light-text dark:text-dark-text">
          {formatCurrency(netWorth)}
        </p>
        <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-positive' : 'text-negative'}`}>
          <span>{isPositive ? '▲' : '▼'} {formatCurrency(Math.abs(change))}</span>
          <span className="text-light-muted dark:text-dark-muted">from last month</span>
        </div>
        {sparklineData.length > 0 && (
          <div className="mt-4">
            <SparklineChart data={sparklineData} color={isPositive ? '#10B981' : '#F43F5E'} height={50} />
          </div>
        )}
      </div>
    </Card>
  );
}
