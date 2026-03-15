import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { formatCurrency } from '../../lib/utils';
import { Eye, Trash2, Plus, Star } from 'lucide-react';

export default function WatchlistTab({ watchlist = [], stockPrices = {}, onAddToPortfolio, onRemove, onAdd }) {
  if (watchlist.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Watchlist is empty"
        description="Add stocks to your watchlist to track them."
        actionLabel="Add to Watchlist"
        onAction={onAdd}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={onAdd} size="sm">
          <Plus className="w-4 h-4" /> Add to Watchlist
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => {
          const price = stockPrices[item.ticker];
          const change = price?.change || 0;
          const changePercent = price?.changePercent || 0;
          const isPositive = change >= 0;

          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">{item.ticker}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted">{item.company_name}</p>
                </div>
                <Badge color="gray">{item.exchange}</Badge>
              </div>
              <p className="text-lg font-bold text-light-text dark:text-dark-text">
                {price ? formatCurrency(price.price) : '—'}
              </p>
              {price && (
                <p className={`text-sm mt-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddToPortfolio(item)}
                  className="flex-1"
                >
                  <Plus className="w-3 h-3" /> Portfolio
                </Button>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 rounded-lg hover:bg-negative/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-negative" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
