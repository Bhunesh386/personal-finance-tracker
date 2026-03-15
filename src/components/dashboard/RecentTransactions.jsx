import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from '../ui/Card';
import { formatCurrency, formatDate } from '../../lib/utils';
import EmptyState from '../ui/EmptyState';
import { ArrowRight, Receipt } from 'lucide-react';

export default function RecentTransactions({ transactions = [] }) {
  const navigate = useNavigate();

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader title="Recent Transactions" />
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Add your first transaction to see it here."
          actionLabel="Add Transaction"
          onAction={() => navigate('/transactions')}
        />
      </Card>
    );
  }

  return (
    <Card padding={false}>
      <div className="p-5 pb-0">
        <CardHeader
          title="Recent Transactions"
          action={
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border">
        {transactions.slice(0, 6).map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: (t.categories?.color || '#4F46E5') + '20' }}
            >
              {t.categories?.icon || '💰'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                {t.description}
              </p>
              <p className="text-xs text-light-muted dark:text-dark-muted">
                {formatDate(t.date, 'short')}
              </p>
            </div>
            <span className={`text-sm font-semibold whitespace-nowrap ${
              t.type === 'income' ? 'text-positive' : 'text-negative'
            }`}>
              {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
