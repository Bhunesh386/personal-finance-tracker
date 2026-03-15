import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import useStore from '../../store/useStore';

const pageTitles = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/budget': 'Budget',
  '/portfolio': 'Portfolio',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Header() {
  const location = useLocation();
  const { profile, currency, setCurrency } = useStore();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-light-border dark:border-dark-border">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Page title */}
        <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
          {title}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors cursor-pointer">
            <Search className="w-5 h-5 text-light-muted dark:text-dark-muted" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-light-muted dark:text-dark-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-negative rounded-full" />
          </button>

          {/* Currency selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-sm bg-gray-50 dark:bg-dark-card border border-light-border dark:border-dark-border
              rounded-lg px-2 py-1.5 text-light-text dark:text-dark-text cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="INR">₹ INR</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
            <option value="GBP">£ GBP</option>
          </select>

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
            {profile?.full_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
}
