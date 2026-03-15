import React from 'react';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';

export default function TransactionRow({ transaction, onEdit, onDelete }) {
  const t = transaction;
  const category = t.categories;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors group">
      <td className="px-4 py-3 text-sm text-light-muted dark:text-dark-muted whitespace-nowrap">
        {formatDate(t.date, 'short')}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: (category?.color || '#4F46E5') + '20' }}
          >
            {category?.icon || '💰'}
          </div>
          <div>
            <p className="text-sm font-medium text-light-text dark:text-dark-text">{t.description}</p>
            {t.merchant && (
              <p className="text-xs text-light-muted dark:text-dark-muted">{t.merchant}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {category && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: (category.color || '#4F46E5') + '15',
              color: category.color || '#4F46E5',
            }}
          >
            {category.name}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-light-muted dark:text-dark-muted">
        <span className="flex items-center gap-1">
          {PAYMENT_METHODS[t.payment_method]?.icon || '💰'}
          <span className="hidden lg:inline">{PAYMENT_METHODS[t.payment_method]?.label || t.payment_method}</span>
        </span>
      </td>
      <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
        t.type === 'income' ? 'text-positive' : 'text-negative'
      }`}>
        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(t)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
          </button>
          <button
            onClick={() => onDelete(t)}
            className="p-1.5 rounded-lg hover:bg-negative/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-negative" />
          </button>
        </div>
      </td>
    </tr>
  );
}
