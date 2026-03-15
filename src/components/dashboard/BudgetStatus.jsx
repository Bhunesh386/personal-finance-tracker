import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import EmptyState from '../ui/EmptyState';
import { formatCurrency } from '../../lib/utils';
import { ArrowRight, Target } from 'lucide-react';

export default function BudgetStatus({ budgets = [], spending = {} }) {
  const navigate = useNavigate();

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader title="Budget Overview" />
        <EmptyState
          icon={Target}
          title="No budgets set"
          description="Create budgets to track your spending."
          actionLabel="Create Budget"
          onAction={() => navigate('/budget')}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Budget Overview"
        action={
          <button
            onClick={() => navigate('/budget')}
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
          >
            Manage Budgets <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      />
      <div className="space-y-4">
        {budgets.slice(0, 5).map((budget) => {
          const spent = spending[budget.category_id] || 0;
          const budgetAmount = Number(budget.amount);
          const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{budget.categories?.icon || '📁'}</span>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text">
                    {budget.categories?.name || 'Category'}
                  </span>
                </div>
                <span className="text-xs text-light-muted dark:text-dark-muted">
                  {formatCurrency(spent)} / {formatCurrency(budgetAmount)}
                </span>
              </div>
              <ProgressBar value={spent} max={budgetAmount} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
