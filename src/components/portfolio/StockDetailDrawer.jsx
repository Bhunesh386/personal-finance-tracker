import React, { useState, useEffect, useCallback } from 'react';
import Drawer from '../ui/Drawer';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import PortfolioLineChart from '../charts/PortfolioLineChart';
import { formatCurrency } from '../../lib/utils';
import { fetchTimeSeries, fetchQuote } from '../../lib/twelvedata';

const timeFilters = [
  { label: '1D', interval: '5min', size: 78 },
  { label: '1W', interval: '1h', size: 35 },
  { label: '1M', interval: '1day', size: 30 },
  { label: '3M', interval: '1day', size: 90 },
  { label: '6M', interval: '1day', size: 180 },
  { label: '1Y', interval: '1week', size: 52 },
];

export default function StockDetailDrawer({ isOpen, onClose, holding, price, onEdit, onRemove }) {
  const [chartData, setChartData] = useState([]);
  const [selectedTime, setSelectedTime] = useState('1M');
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchChart = useCallback(async (filter) => {
    if (!holding) return;
    setLoading(true);
    try {
      const tf = timeFilters.find(t => t.label === filter) || timeFilters[2];
      const data = await fetchTimeSeries(holding.ticker, holding.exchange, tf.interval, tf.size);
      setChartData(data);
    } catch (err) {
      console.error('Error fetching chart:', err);
    } finally {
      setLoading(false);
    }
  }, [holding]);

  useEffect(() => {
    if (isOpen && holding) {
      fetchChart(selectedTime);
      fetchQuote(holding.ticker, holding.exchange).then(q => {
        if (q) setQuote(q);
      });
    }
  }, [isOpen, holding]); // eslint-disable-line

  if (!holding) return null;

  const livePrice = price?.price || Number(holding.avg_buy_price);
  const change = price?.change || 0;
  const changePercent = price?.changePercent || 0;
  const shares = Number(holding.shares);
  const avgBuy = Number(holding.avg_buy_price);
  const invested = shares * avgBuy;
  const value = shares * livePrice;
  const pnl = value - invested;
  const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`${holding.company_name}`} width="w-[520px]">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-light-muted dark:text-dark-muted">{holding.ticker}</span>
            <Badge color="indigo">{holding.exchange}</Badge>
          </div>
          <p className="text-3xl font-bold text-light-text dark:text-dark-text">{formatCurrency(livePrice)}</p>
          <div className={`flex items-center gap-2 mt-1 ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
            <span className="text-sm font-medium">
              {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent.toFixed(2)}%)
            </span>
            <span className="text-xs text-light-muted dark:text-dark-muted">Today</span>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="flex items-center gap-1 mb-3">
            {timeFilters.map((tf) => (
              <button
                key={tf.label}
                onClick={() => { setSelectedTime(tf.label); fetchChart(tf.label); }}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                  selectedTime === tf.label
                    ? 'bg-primary text-white'
                    : 'text-light-muted dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <PortfolioLineChart data={chartData} height={200} color={change >= 0 ? '#10B981' : '#F43F5E'} />
        </div>

        {/* Your Position */}
        <div>
          <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">Your Position</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Shares Held', value: shares },
              { label: 'Avg Buy Price', value: formatCurrency(avgBuy) },
              { label: 'Total Invested', value: formatCurrency(invested) },
              { label: 'Current Value', value: formatCurrency(value) },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3">
                <p className="text-xs text-light-muted dark:text-dark-muted">{item.label}</p>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className={`rounded-lg p-3 ${pnl >= 0 ? 'bg-positive/10' : 'bg-negative/10'}`}>
              <p className="text-xs text-light-muted dark:text-dark-muted">Unrealized P&L</p>
              <p className={`text-sm font-semibold ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
              </p>
            </div>
            <div className={`rounded-lg p-3 ${pnl >= 0 ? 'bg-positive/10' : 'bg-negative/10'}`}>
              <p className="text-xs text-light-muted dark:text-dark-muted">P&L %</p>
              <p className={`text-sm font-semibold ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Stock Info */}
        {quote && (
          <div>
            <h4 className="text-sm font-semibold text-light-text dark:text-dark-text mb-3">Stock Info</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '52W High', value: formatCurrency(quote.fiftyTwoWeekHigh) },
                { label: '52W Low', value: formatCurrency(quote.fiftyTwoWeekLow) },
                { label: "Today's High", value: formatCurrency(quote.high) },
                { label: "Today's Low", value: formatCurrency(quote.low) },
                { label: 'Volume', value: (quote.volume || 0).toLocaleString() },
                { label: 'Prev Close', value: formatCurrency(quote.previousClose) },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-light-muted dark:text-dark-muted">{item.label}</span>
                  <span className="text-light-text dark:text-dark-text font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => onEdit(holding)} className="flex-1">
            Edit Position
          </Button>
          <Button variant="danger" onClick={() => onRemove(holding)} className="flex-1">
            Remove Stock
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
