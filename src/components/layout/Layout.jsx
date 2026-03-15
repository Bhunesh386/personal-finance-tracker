import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useStore from '../../store/useStore';

export default function Layout() {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Sidebar />
      <main className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'ml-16' : 'ml-[260px]'}
      `}>
        <Header />
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
