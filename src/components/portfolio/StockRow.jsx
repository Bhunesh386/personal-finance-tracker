import React from 'react';
import { formatCurrency } from '../../lib/utils';
import SparklineChart from '../charts/SparklineChart';
import { Pencil, Trash2 } from 'lucide-react';

export default function StockRow({ holding, price, onEdit, onRemove, onClick }) {
  const livePrice = price?.price || Number(holding.avg_buy_price);
  const change = price?.change || 0;
  const changePercent = price?.changePercent || 0;
  const shares = Number(holding.shares);
  const avgBuy = Number(holding.avg_buy_price);
  const invested = shares * avgBuy;
  const value = shares * livePrice;
  const pnl = value - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  const isChangePositive = change >= 0;
  const isPnLPositive = pnl >= 0;

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-primary/5 transition-colors cursor-pointer group"
      onClick={() => onClick?.(holding)}
    >
      {/* Stock info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {holding.ticker?.slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">{holding.ticker}</p>
            <p className="text-xs text-light-muted dark:text-dark-muted truncate max-w-[120px]">{holding.company_name}</p>
          </div>
        </div>
      </td>

      {/* Live price */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-light-text dark:text-dark-text">{formatCurrency(livePrice)}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse-dot" />
        </div>
      </td>

      {/* Today's change */}
      <td className={`px-4 py-3 text-sm font-medium ${isChangePositive ? 'text-positive' : 'text-negative'}`}>
        {isChangePositive ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
      </td>

      {/* Shares */}
      <td className="px-4 py-3 text-sm text-light-text dark:text-dark-text">{shares}</td>

      {/* Avg Buy */}
      <td className="px-4 py-3 text-sm text-light-muted dark:text-dark-muted">{formatCurrency(avgBuy)}</td>

      {/* Invested */}
      <td className="px-4 py-3 text-sm text-light-muted dark:text-dark-muted">{formatCurrency(invested)}</td>

      {/* Value */}
      <td className="px-4 py-3 text-sm font-medium text-light-text dark:text-dark-text">{formatCurrency(value)}</td>

      {/* P&L */}
      <td className={`px-4 py-3 text-sm font-semibold ${isPnLPositive ? 'text-positive' : 'text-negative'}`}>
        {isPnLPositive ? '+' : ''}{formatCurrency(pnl)}
      </td>

      {/* P&L % */}
      <td className={`px-4 py-3 text-sm font-medium ${isPnLPositive ? 'text-positive' : 'text-negative'}`}>
        {isPnLPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(holding)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-light-muted dark:text-dark-muted" />
          </button>
          <button
            onClick={() => onRemove(holding)}
            className="p-1.5 rounded-lg hover:bg-negative/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-negative" />
          </button>
        </div>
      </td>
    </tr>
  );
}
