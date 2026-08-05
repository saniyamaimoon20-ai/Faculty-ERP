import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ChevronRight, Home } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/faculty/add')) return 'Add Faculty Member';
    if (path.startsWith('/faculty/')) return 'Faculty Member Profile';
    if (path === '/faculty') return 'Faculty Directory';
    if (path === '/rooms') return 'Rooms Management';
    if (path === '/timetable') return 'Master Timetable';
    if (path === '/logs/login') return 'Login Security Logs';
    if (path === '/logs/activity') return 'Activity Logs';
    if (path === '/notifications') return 'Department Notifications';
    if (path === '/attendance') return 'Biometric Attendance Logs';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'System Settings';
    return 'SSMIET ERP';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* Breadcrumb Header */}
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-6">
            <Home className="w-3.5 h-3.5 mr-1 text-orange-500" />
            <span>Cyber Security ERP</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{getBreadcrumb()}</span>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
};
