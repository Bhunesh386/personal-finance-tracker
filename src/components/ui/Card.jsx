import React from 'react';

export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={`
        bg-white dark:bg-dark-card
        border border-light-border dark:border-dark-border
        rounded-xl card-shadow
        ${padding ? 'p-5' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-light-text dark:text-dark-text">{title}</h3>
        {subtitle && (
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
