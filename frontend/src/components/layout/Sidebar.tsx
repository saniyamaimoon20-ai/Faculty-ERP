import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, DoorOpen, CalendarDays, 
  ShieldAlert, Activity, Bell, User as UserIcon, 
  Settings, LogOut, ShieldCheck, Fingerprint
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHOD = user?.role === 'HOD';

  const navItems = isHOD
    ? [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Faculty Directory', path: '/faculty', icon: Users },
        { label: 'Rooms Management', path: '/rooms', icon: DoorOpen },
        { label: 'Master Timetable', path: '/timetable', icon: CalendarDays },
        { label: 'Biometric Logs', path: '/attendance', icon: Fingerprint },
        { label: 'Login Security Logs', path: '/logs/login', icon: ShieldAlert },
        { label: 'Activity Logs', path: '/logs/activity', icon: Activity },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'My Profile', path: '/profile', icon: UserIcon },
        { label: 'System Settings', path: '/settings', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'My Weekly Timetable', path: '/timetable', icon: CalendarDays },
        { label: 'Biometric Attendance', path: '/attendance', icon: Fingerprint },
        { label: 'My Profile', path: '/profile', icon: UserIcon },
        { label: 'Notifications', path: '/notifications', icon: Bell },
      ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-colors hidden md:flex">
      
      <div className="p-4 space-y-6">
        
        {/* Department Banner Badge */}
        <div className="p-3 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Cyber Security Dept</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">SSMIET ERP v2.6</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Main Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-3 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </button>
      </div>
    </aside>
  );
};
