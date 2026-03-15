import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { usePortfolio } from '../hooks/usePortfolio';
import { useCategories } from '../hooks/useCategories';
import QuickStatsBar from '../components/dashboard/QuickStatsBar';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import BudgetStatus from '../components/dashboard/BudgetStatus';
import PortfolioSnapshot from '../components/dashboard/PortfolioSnapshot';
import Card, { CardHeader } from '../components/ui/Card';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import SpendingDonutChart from '../components/charts/SpendingDonutChart';
import { startOfMonth, endOfMonth } from 'date-fns';

export default function Dashboard() {
  const [monthlyTotals, setMonthlyTotals] = useState({ income: 0, expense: 0 });
  const [lastMonthTotals, setLastMonthTotals] = useState({ income: 0, expense: 0 });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [budgetSpending, setBudgetSpending] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('monthly');

  const { transactions, getMonthlyTotals, getMonthlyHistory, getSpendingByCategory } = useTransactions();
  const now = new Date();
  const { budgets, fetchBudgetSpending } = useBudgets(now.getMonth() + 1, now.getFullYear());
  const { getPortfolioMetrics, getAllocation, holdings } = usePortfolio();

  const metrics = getPortfolioMetrics();
  const allocation = getAllocation();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [current, last, history, spending] = await Promise.all([
          getMonthlyTotals(new Date()),
          getMonthlyTotals(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
          getMonthlyHistory(6),
          getSpendingByCategory(startOfMonth(new Date()), endOfMonth(new Date())),
        ]);
        setMonthlyTotals(current);
        setLastMonthTotals(last);
        setMonthlyHistory(history);
        setCategorySpending(spending);

        const bs = await fetchBudgetSpending();
        setBudgetSpending(bs);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []); // eslint-disable-line

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} variant="card" />)}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8"><SkeletonLoader variant="card" className="h-80" /></div>
          <div className="col-span-4"><SkeletonLoader variant="card" className="h-80" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Quick Stats */}
      <QuickStatsBar
        monthlyIncome={monthlyTotals.income}
        monthlyExpense={monthlyTotals.expense}
        lastMonthIncome={lastMonthTotals.income}
        lastMonthExpense={lastMonthTotals.expense}
        portfolioValue={metrics.totalValue}
      />

      {/* Section 2: Cash Flow + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Cash Flow Overview"
              action={
                <div className="flex gap-1">
                  {['monthly', 'weekly', 'yearly'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        viewMode === mode
                          ? 'bg-primary text-white'
                          : 'text-light-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              }
            />
            <IncomeExpenseBarChart data={monthlyHistory} height={280} />
          </Card>
        </div>
        <div className="lg:col-span-4">
          <PortfolioSnapshot
            totalValue={metrics.totalValue}
            todayPnL={metrics.todayPnL}
            todayPnLPercent={metrics.todayPnLPercent}
            allocation={allocation}
          />
        </div>
      </div>

      {/* Section 3: Budgets + Recent Transactions + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5">
          <BudgetStatus budgets={budgets} spending={budgetSpending} />
        </div>
        <div className="lg:col-span-4">
          <RecentTransactions transactions={transactions} />
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="This Month" />
            <SpendingDonutChart data={categorySpending} height={200} />
          </Card>
        </div>
      </div>
    </div>
  );
}
