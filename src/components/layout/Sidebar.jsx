import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CreditCard, Target, TrendingUp,
  BarChart3, Settings, Sun, Moon, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import useStore from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
  { path: '/transactions', label: 'Transactions', icon: CreditCard, emoji: '💳' },
  { path: '/budget', label: 'Budget', icon: Target, emoji: '🎯' },
  { path: '/portfolio', label: 'Portfolio', icon: TrendingUp, emoji: '📈' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, emoji: '📊' },
  { path: '/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
];

export default function Sidebar() {
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed } = useStore();
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className={`
      fixed left-0 top-0 h-full z-40
      bg-white dark:bg-dark-sidebar
      border-r border-light-border dark:border-dark-border
      flex flex-col transition-all duration-300
      ${sidebarCollapsed ? 'w-16' : 'w-[260px]'}
    `}>
      {/* Logo */}
      <div className={`
        flex items-center h-16 px-4 border-b border-light-border dark:border-dark-border
        ${sidebarCollapsed ? 'justify-center' : 'gap-3'}
      `}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-base font-bold text-light-text dark:text-dark-text whitespace-nowrap">
            Financial Tracker
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-200 group
              ${sidebarCollapsed ? 'justify-center' : ''}
              ${isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-light-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-primary/5 hover:text-light-text dark:hover:text-dark-text'
              }
            `}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-light-border dark:border-dark-border space-y-2">
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            text-light-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card
            transition-colors text-sm cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            text-light-muted dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card
            transition-colors text-sm cursor-pointer"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
          {!sidebarCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info */}
        <div className={`
          flex items-center gap-3 px-3 py-2 rounded-lg
          ${sidebarCollapsed ? 'justify-center' : ''}
        `}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-sm font-medium text-primary">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                {profile?.full_name || 'User'}
              </p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-light-muted dark:text-dark-muted" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
