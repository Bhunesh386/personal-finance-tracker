import React from 'react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

export default function BudgetCategoryCard({ budget, spent = 0, daysRemaining = 0, onEdit, onDelete }) {
  const budgetAmount = Number(budget.amount);
  const percent = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
  const category = budget.categories;

  const badgeColor = percent < 60 ? 'green' : percent < 85 ? 'amber' : 'red';

  return (
    <Card className="relative group">
      {/* Actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(budget)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
        </button>
        <button
          onClick={() => onDelete(budget.id)}
          className="p-1.5 rounded-lg hover:bg-negative/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-negative" />
        </button>
      </div>

      {/* Category icon and name */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: (category?.color || '#4F46E5') + '20' }}
        >
          {category?.icon || '📁'}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-light-text dark:text-dark-text">
            {category?.name || 'Category'}
          </h4>
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar value={spent} max={budgetAmount} className="mb-2" />

      {/* Spent / Budgeted */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-light-muted dark:text-dark-muted">
          {formatCurrency(spent)} of {formatCurrency(budgetAmount)}
        </p>
        <Badge color={badgeColor}>{Math.round(percent)}% used</Badge>
      </div>

      {/* Days remaining */}
      <p className="text-xs text-light-muted dark:text-dark-muted mt-2">
        {daysRemaining} days remaining
      </p>
    </Card>
  );
}
