import React from 'react';
import TransactionRow from './TransactionRow';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import { Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TransactionTable({
  transactions = [],
  loading = false,
  page = 1,
  totalPages = 1,
  totalCount = 0,
  pageSize = 20,
  onPageChange,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonLoader key={i} variant="table-row" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try adjusting your filters or add a new transaction."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-dark-border">
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {transactions.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-light-border dark:border-dark-border">
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} transactions
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm px-3 text-light-text dark:text-dark-text">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
