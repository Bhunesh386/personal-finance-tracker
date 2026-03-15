import React from 'react';

const colorMap = {
  green: 'bg-positive/15 text-positive',
  red: 'bg-negative/15 text-negative',
  amber: 'bg-warning/15 text-warning',
  indigo: 'bg-primary/15 text-primary',
  violet: 'bg-secondary/15 text-secondary',
  gray: 'bg-gray-100 dark:bg-dark-border text-light-muted dark:text-dark-muted',
};

export default function Badge({ children, color = 'gray', className = '' }) {
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${colorMap[color] || colorMap.gray}
      ${className}
    `}>
      {children}
    </span>
  );
}
