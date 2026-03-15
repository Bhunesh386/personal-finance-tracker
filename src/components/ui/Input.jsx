import React from 'react';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-light-muted dark:text-dark-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          className={`
            w-full rounded-lg border border-light-border dark:border-dark-border
            bg-white dark:bg-dark-card
            text-light-text dark:text-dark-text
            placeholder:text-light-muted/60 dark:placeholder:text-dark-muted/60
            px-3 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-negative focus:ring-negative/50' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-negative">{error}</p>
      )}
    </div>
  );
}
