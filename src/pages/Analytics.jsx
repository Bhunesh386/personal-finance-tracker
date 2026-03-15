import React, { useState, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import Card, { CardHeader } from '../components/ui/Card';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import SpendingDonutChart from '../components/charts/SpendingDonutChart';
import SavingsHeatmap from '../components/charts/SavingsHeatmap';
import SparklineChart from '../components/charts/SparklineChart';
import { formatCurrency } from '../lib/utils';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

const ranges = [
  { label: 'This Month', months: 1 },
  { label: 'Last 3M', months: 3 },
  { label: 'Last 6M', months: 6 },
  { label: 'This Year', months: 12 },
];

export default function Analytics() {
  const [range, setRange] = useState('Last 6M');
  const [history, setHistory] = useState([]);
  const [catSpend, setCatSpend] = useState([]);
  const [daily, setDaily] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getMonthlyHistory, getSpendingByCategory, getTopMerchants, getDailySpending } = useTransactions();
  const sel = ranges.find(r => r.label === range) || ranges[2];
  const now = new Date();
  const start = subMonths(startOfMonth(now), sel.months - 1);
  const end = endOfMonth(now);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [h, c, m, d] = await Promise.all([
          getMonthlyHistory(sel.months),
          getSpendingByCategory(start, end),
          getTopMerchants(start, end),
          getDailySpending(start, end),
        ]);
        setHistory(h); setCatSpend(c); setMerchants(m); setDaily(d);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [range]); // eslint-disable-line

  const savingsRate = history.map(m => ({ month: m.month, rate: m.income > 0 ? ((m.income - m.expense) / m.income) * 100 : 0 }));
  let rt = 0;
  const cumSavings = history.map(m => { rt += m.income - m.expense; return { month: m.month, value: rt }; });

  if (loading) return <div className="space-y-6"><SkeletonLoader variant="card" className="h-80" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5">
        {ranges.map(o => (
          <button key={o.label} onClick={() => setRange(o.label)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${range === o.label ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-light-muted dark:text-dark-muted'}`}>
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8"><Card><CardHeader title="Income vs Expenses" /><IncomeExpenseBarChart data={history} height={300} /></Card></div>
        <div className="lg:col-span-4"><Card><CardHeader title="Savings Rate" /><SparklineChart data={savingsRate} dataKey="rate" color="#10B981" height={250} /></Card></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5"><Card><CardHeader title="Spending by Category" /><SpendingDonutChart data={catSpend} height={280} /></Card></div>
        <div className="lg:col-span-7"><Card><CardHeader title="Daily Spending Heatmap" /><SavingsHeatmap data={daily} startDate={start} endDate={end} /></Card></div>
      </div>

      <Card>
        <CardHeader title="Top Merchants" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-light-border dark:border-dark-border">
              {['#', 'Merchant', 'Category', 'Txns', 'Total', '%'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {merchants.map(m => (
                <tr key={m.merchant} className="hover:bg-gray-50 dark:hover:bg-primary/5">
                  <td className="px-4 py-3 text-sm text-light-muted">{m.rank}</td>
                  <td className="px-4 py-3 text-sm font-medium text-light-text dark:text-dark-text">{m.merchant}</td>
                  <td className="px-4 py-3 text-sm text-light-muted">{m.category}</td>
                  <td className="px-4 py-3 text-sm">{m.count}</td>
                  <td className="px-4 py-3 text-sm font-medium text-negative">{formatCurrency(m.total)}</td>
                  <td className="px-4 py-3 text-sm text-light-muted">{m.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {merchants.length === 0 && <p className="text-center py-8 text-sm text-light-muted dark:text-dark-muted">No data for this period.</p>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Month-over-Month" />
          <table className="w-full"><thead><tr className="border-b border-light-border dark:border-dark-border">
            {['Month', 'Income', 'Expenses', 'Savings'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-medium text-light-muted uppercase">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {history.map((m, i) => { const s = m.income - m.expense; return (
              <tr key={i}><td className="px-3 py-2 text-sm font-medium text-light-text dark:text-dark-text">{m.month}</td>
              <td className="px-3 py-2 text-sm text-positive">{formatCurrency(m.income)}</td>
              <td className="px-3 py-2 text-sm text-negative">{formatCurrency(m.expense)}</td>
              <td className={`px-3 py-2 text-sm font-medium ${s >= 0 ? 'text-positive' : 'text-negative'}`}>{formatCurrency(s)}</td></tr>
            ); })}
          </tbody></table>
        </Card>
        <Card><CardHeader title="Cumulative Savings" /><SparklineChart data={cumSavings} dataKey="value" color="#4F46E5" height={250} /></Card>
      </div>
    </div>
  );
}
