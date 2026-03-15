import React, { useState, useEffect } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import BudgetOverviewCard from '../components/budget/BudgetOverviewCard';
import BudgetCategoryCard from '../components/budget/BudgetCategoryCard';
import AddBudgetModal from '../components/budget/AddBudgetModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { formatCurrency, MONTHS } from '../lib/utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, differenceInDays, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

export default function Budget() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [spending, setSpending] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const { budgets, loading, fetchBudgetSpending, addBudget, updateBudget, deleteBudget } = useBudgets(month, year);
  const { expenseCategories } = useCategories();

  useEffect(() => {
    fetchBudgetSpending().then(setSpending);
  }, [month, year, budgets.length]); // eslint-disable-line

  const totalBudgeted = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.category_id] || 0), 0);
  const onTrackCount = budgets.filter(b => {
    const spent = spending[b.category_id] || 0;
    return spent <= Number(b.amount);
  }).length;

  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const today = new Date();
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const daysRemaining = Math.max(0, differenceInDays(monthEnd, today));

  const navigateMonth = (dir) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const handleSave = async (data) => {
    try {
      if (editBudget) {
        await updateBudget(editBudget.id, data);
        toast.success('Budget updated!');
      } else {
        await addBudget(data);
        toast.success('Budget added!');
      }
      setEditBudget(null);
      const s = await fetchBudgetSpending();
      setSpending(s);
    } catch (err) {
      toast.error('Failed to save budget');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      toast.success('Budget deleted!');
    } catch (err) {
      toast.error('Failed to delete budget');
    }
  };

  // Find most overspent and best controlled
  const budgetAnalysis = budgets.map(b => {
    const spent = spending[b.category_id] || 0;
    const amt = Number(b.amount);
    return { ...b, spent, diff: spent - amt, percent: amt > 0 ? (spent / amt) * 100 : 0 };
  });
  const mostOverspent = [...budgetAnalysis].sort((a, b) => b.diff - a.diff)[0];
  const bestControlled = [...budgetAnalysis].sort((a, b) => a.percent - b.percent)[0];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="card" className="h-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonLoader key={i} variant="card" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text min-w-[160px] text-center">
            {MONTHS[month - 1]} {year}
          </h2>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <Button onClick={() => { setEditBudget(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4" /> Add Budget
        </Button>
      </div>

      {/* Overview Hero */}
      <BudgetOverviewCard
        totalBudgeted={totalBudgeted}
        totalSpent={totalSpent}
        onTrackCount={onTrackCount}
        totalCategories={budgets.length}
      />

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => (
          <BudgetCategoryCard
            key={b.id}
            budget={b}
            spent={spending[b.category_id] || 0}
            daysRemaining={daysRemaining}
            onEdit={(budget) => { setEditBudget(budget); setModalOpen(true); }}
            onDelete={handleDelete}
          />
        ))}
        {/* Add category card */}
        <button
          onClick={() => { setEditBudget(null); setModalOpen(true); }}
          className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-8
            flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors cursor-pointer"
        >
          <Plus className="w-8 h-8 text-light-muted dark:text-dark-muted" />
          <span className="text-sm text-light-muted dark:text-dark-muted">Add Budget Category</span>
        </button>
      </div>

      {/* Budget Insights */}
      {budgets.length >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">Most Overspent</h4>
            {mostOverspent && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mostOverspent.categories?.icon || '📁'}</span>
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">{mostOverspent.categories?.name}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    {formatCurrency(mostOverspent.spent)} of {formatCurrency(Number(mostOverspent.amount))}
                  </p>
                </div>
                <Badge color={mostOverspent.diff > 0 ? 'red' : 'green'} className="ml-auto">
                  {mostOverspent.diff > 0 ? `+${formatCurrency(mostOverspent.diff)} over` : 'On track'}
                </Badge>
              </div>
            )}
          </Card>
          <Card>
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">Best Controlled</h4>
            {bestControlled && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bestControlled.categories?.icon || '📁'}</span>
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">{bestControlled.categories?.name}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    {formatCurrency(bestControlled.spent)} of {formatCurrency(Number(bestControlled.amount))}
                  </p>
                </div>
                <Badge color="green" className="ml-auto">
                  {Math.round(bestControlled.percent)}% used
                </Badge>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditBudget(null); }}
        onSave={handleSave}
        categories={expenseCategories}
        editBudget={editBudget}
      />
    </div>
  );
}
