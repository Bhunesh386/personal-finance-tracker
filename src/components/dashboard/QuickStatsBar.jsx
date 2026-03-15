import React from 'react';
import Card from '../ui/Card';
import SparklineChart from '../charts/SparklineChart';
import { formatCurrency, percentChange } from '../../lib/utils';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, PiggyBank } from 'lucide-react';

function StatCard({ title, value, change, changeLabel, icon: Icon, color, sparklineData }) {
  const isPositive = change >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-light-muted dark:text-dark-muted">{title}</p>
          <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-1">
            {formatCurrency(value)}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-positive" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-negative" />
            )}
            <span className={`text-xs font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? '+' : ''}{change?.toFixed(1)}%
            </span>
            <span className="text-xs text-light-muted dark:text-dark-muted">
              {changeLabel || 'vs last month'}
            </span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">
          <SparklineChart data={sparklineData} color={isPositive ? '#10B981' : '#F43F5E'} height={30} />
        </div>
      )}
    </Card>
  );
}

export default function QuickStatsBar({ monthlyIncome, monthlyExpense, lastMonthIncome, lastMonthExpense, portfolioValue }) {
  const savings = monthlyIncome - monthlyExpense;
  const netWorth = (monthlyIncome - monthlyExpense) + (portfolioValue || 0);
  const incomeChange = percentChange(monthlyIncome, lastMonthIncome);
  const expenseChange = percentChange(monthlyExpense, lastMonthExpense);
  const savingsPercent = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Net Worth"
        value={netWorth}
        change={incomeChange - expenseChange}
        icon={Wallet}
        color="bg-primary"
      />
      <StatCard
        title="Monthly Income"
        value={monthlyIncome}
        change={incomeChange}
        icon={TrendingUp}
        color="bg-positive"
      />
      <StatCard
        title="Monthly Expenses"
        value={monthlyExpense}
        change={expenseChange}
        icon={TrendingDown}
        color="bg-negative"
      />
      <StatCard
        title="Savings This Month"
        value={savings}
        change={savingsPercent}
        changeLabel={`${savingsPercent.toFixed(0)}% of income`}
        icon={PiggyBank}
        color="bg-secondary"
      />
    </div>
  );
}
