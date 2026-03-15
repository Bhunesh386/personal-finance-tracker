import React, { useMemo } from 'react';
import { Tooltip as ReTooltip } from 'recharts';
import { formatCurrency, formatDate } from '../../lib/utils';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from 'date-fns';

const INTENSITY_COLORS = {
  0: 'bg-gray-100 dark:bg-dark-border',
  1: 'bg-emerald-200 dark:bg-emerald-900/50',
  2: 'bg-emerald-400 dark:bg-emerald-700',
  3: 'bg-amber-400 dark:bg-amber-600',
  4: 'bg-rose-500 dark:bg-rose-600',
};

export default function SavingsHeatmap({ data = [], startDate, endDate }) {
  const days = useMemo(() => {
    if (!startDate || !endDate) return [];
    try {
      return eachDayOfInterval({ start: startDate, end: endDate });
    } catch {
      return [];
    }
  }, [startDate, endDate]);

  const maxSpending = useMemo(
    () => Math.max(...data.map(d => d.amount), 1),
    [data]
  );

  const spendingMap = useMemo(() => {
    const map = {};
    data.forEach(d => { map[d.date] = d.amount; });
    return map;
  }, [data]);

  // Group days by weeks (columns) for calendar layout
  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = new Array(7).fill(null);
    days.forEach(day => {
      const dayOfWeek = getDay(day);
      currentWeek[dayOfWeek] = day;
      if (dayOfWeek === 6) {
        result.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    });
    if (currentWeek.some(d => d !== null)) {
      result.push(currentWeek);
    }
    return result;
  }, [days]);

  const getIntensity = (amount) => {
    if (!amount || amount === 0) return 0;
    const ratio = amount / maxSpending;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {dayLabels.map((label, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center">
              <span className="text-[8px] text-light-muted dark:text-dark-muted">{label}</span>
            </div>
          ))}
        </div>
        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) => {
              if (!day) return <div key={di} className="w-3 h-3" />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const amount = spendingMap[dateStr] || 0;
              const intensity = getIntensity(amount);
              return (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${INTENSITY_COLORS[intensity]} transition-colors cursor-pointer`}
                  title={`${format(day, 'd MMM')}: ${formatCurrency(amount)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 text-[10px] text-light-muted dark:text-dark-muted">
        <span>Less</span>
        {Object.values(INTENSITY_COLORS).map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
