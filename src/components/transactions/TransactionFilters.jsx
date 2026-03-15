import React from 'react';
import { Search } from 'lucide-react';

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

export default function TransactionFilters({ type, onTypeChange, search, onSearchChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Type filter pills */}
      <div className="flex items-center gap-1.5">
        {typeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => onTypeChange(f.value)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer
              ${type === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-dark-border text-light-muted dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-card'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted dark:text-dark-muted" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-light-border dark:border-dark-border
            bg-white dark:bg-dark-card text-light-text dark:text-dark-text
            placeholder:text-light-muted/60 dark:placeholder:text-dark-muted/60
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
}
