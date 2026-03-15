import React from 'react';

export default function SkeletonLoader({ className = '', variant = 'text', lines = 1, circle = false }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-dark-border rounded';

  if (circle) {
    return <div className={`${baseClasses} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-5 ${className}`}>
        <div className={`${baseClasses} h-4 w-1/3 mb-3`} />
        <div className={`${baseClasses} h-8 w-2/3 mb-2`} />
        <div className={`${baseClasses} h-3 w-1/2`} />
      </div>
    );
  }

  if (variant === 'table-row') {
    return (
      <div className={`flex items-center gap-4 py-3 px-4 ${className}`}>
        <div className={`${baseClasses} w-10 h-10 rounded-full shrink-0`} />
        <div className="flex-1 space-y-2">
          <div className={`${baseClasses} h-4 w-3/4`} />
          <div className={`${baseClasses} h-3 w-1/2`} />
        </div>
        <div className={`${baseClasses} h-4 w-20`} />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}
