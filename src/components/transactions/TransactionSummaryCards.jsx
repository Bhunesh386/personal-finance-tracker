import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TransactionSummaryCards({ income = 0, expense = 0 }) {
  const net = income - expense;
  const isPositive = net >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-positive/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-positive" />
          </div>
          <div>
            <p className="text-sm text-light-muted dark:text-dark-muted">Income</p>
            <p className="text-xl font-bold text-positive">{formatCurrency(income)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-negative/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-negative" />
          </div>
          <div>
            <p className="text-sm text-light-muted dark:text-dark-muted">Expenses</p>
            <p className="text-xl font-bold text-negative">{formatCurrency(expense)}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: isPositive ? '#10B98120' : '#F43F5E20' }}>
            <Minus className={`w-5 h-5 ${isPositive ? 'text-positive' : 'text-negative'}`} />
          </div>
          <div>
            <p className="text-sm text-light-muted dark:text-dark-muted">Net Balance</p>
            <p className={`text-xl font-bold ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
