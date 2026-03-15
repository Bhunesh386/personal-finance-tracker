import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format currency amount in Indian number system (₹)
 * e.g., ₹1,24,500.00
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '₹';

  if (currency === 'INR') {
    // Indian number system: last 3 digits, then groups of 2
    const parts = absNum.toFixed(2).split('.');
    let intPart = parts[0];
    const decPart = parts[1];

    if (intPart.length > 3) {
      const last3 = intPart.slice(-3);
      const remaining = intPart.slice(0, -3);
      const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
      intPart = formatted + ',' + last3;
    }
    return `${isNegative ? '-' : ''}${symbol}${intPart}.${decPart}`;
  }

  return `${isNegative ? '-' : ''}${symbol}${absNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format currency with compact notation for large numbers
 */
export function formatCurrencyCompact(amount, currency = 'INR') {
  if (amount === null || amount === undefined) return '₹0';
  const num = Number(amount);
  const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || '₹';

  if (currency === 'INR') {
    const abs = Math.abs(num);
    if (abs >= 10000000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 10000000).toFixed(2)}Cr`;
    if (abs >= 100000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 100000).toFixed(2)}L`;
    if (abs >= 1000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 1000).toFixed(1)}K`;
  } else {
    const abs = Math.abs(num);
    if (abs >= 1000000000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 1000000000).toFixed(2)}B`;
    if (abs >= 1000000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 1000000).toFixed(2)}M`;
    if (abs >= 1000) return `${num < 0 ? '-' : ''}${symbol}${(abs / 1000).toFixed(1)}K`;
  }
  return formatCurrency(num, currency);
}

/**
 * Format a date for display
 * @param {string|Date} date
 * @param {string} style - 'relative' | 'full' | 'short' | 'month-year'
 */
export function formatDate(date, style = 'short') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;

  switch (style) {
    case 'relative':
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return formatDistanceToNow(d, { addSuffix: true });
    case 'full':
      return format(d, 'd MMMM yyyy');
    case 'short':
      return format(d, 'd MMM');
    case 'month-year':
      return format(d, 'MMMM yyyy');
    case 'group':
      if (isToday(d)) return 'Today';
      if (isYesterday(d)) return 'Yesterday';
      return format(d, 'd MMMM yyyy');
    default:
      return format(d, 'd MMM yyyy');
  }
}

/**
 * Get a percentage-based color class
 */
export function getPercentageColor(percent) {
  if (percent < 60) return 'text-positive';
  if (percent < 85) return 'text-warning';
  return 'text-negative';
}

export function getPercentageBgColor(percent) {
  if (percent < 60) return 'bg-positive';
  if (percent < 85) return 'bg-warning';
  return 'bg-negative';
}

/**
 * Calculate percentage change between two values
 */
export function percentChange(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Generate CSV content from array of objects
 */
export function generateCSV(data, columns) {
  if (!data || data.length === 0) return '';
  
  const headers = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      let val = c.accessor(row);
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Trigger CSV download
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Month names
 */
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Payment method labels & icons
 */
export const PAYMENT_METHODS = {
  cash: { label: 'Cash', icon: '💵' },
  upi: { label: 'UPI', icon: '📱' },
  credit_card: { label: 'Credit Card', icon: '💳' },
  debit_card: { label: 'Debit Card', icon: '💳' },
  net_banking: { label: 'Net Banking', icon: '🏦' },
  other: { label: 'Other', icon: '💰' },
};
