import React from 'react';
import StockRow from './StockRow';
import SkeletonLoader from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import { TrendingUp } from 'lucide-react';

export default function HoldingsTable({ holdings = [], stockPrices = {}, loading, onEdit, onRemove, onClick, onAdd }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} variant="table-row" />
        ))}
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
        <EmptyState
          icon={TrendingUp}
          title="No stocks in portfolio yet"
          description="Add your first holding to get started."
          actionLabel="Add Stock"
          onAction={onAdd}
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
              {['Stock', 'Price', 'Today', 'Shares', 'Avg Buy', 'Invested', 'Value', 'P&L', 'P&L%', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-light-border dark:divide-dark-border">
            {holdings.map((h) => (
              <StockRow
                key={h.id}
                holding={h}
                price={stockPrices[h.ticker]}
                onEdit={onEdit}
                onRemove={onRemove}
                onClick={onClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
