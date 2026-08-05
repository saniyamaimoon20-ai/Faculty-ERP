import React from 'react';
import { Settings, ShieldCheck, Database, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" /> Department System Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          SSM Institute of Engineering and Technology — Cyber Security Department ERP Settings
        </p>
      </div>

      {/* Theme Selection Card */}
      <div className="glass-card p-5 space-y-3 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-orange-500" />}
          Display Appearance & Theme Mode
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Choose your preferred interface theme for all ERP screens and timetable matrices.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 font-semibold transition-all ${
              theme === 'light'
                ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" /> Light Mode
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-orange-500 text-white border-orange-600 shadow-md'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Moon className="w-4 h-4" /> Dark Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" /> Institutional Profile
          </h3>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><strong>Institution:</strong> SSM Institute of Engineering and Technology (SSMIET)</p>
            <p><strong>Department:</strong> Cyber Security Department (CSE-CY)</p>
            <p><strong>Academic Year:</strong> 2026 - 2027</p>
            <p><strong>System Version:</strong> v2.6 Enterprise ERP Build</p>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-500" /> Database & Security Architecture
          </h3>
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <p><strong>ORM & Engine:</strong> Flask SQLAlchemy / SQLite</p>
            <p><strong>Password Security:</strong> Werkzeug PBKDF2 Hashes</p>
            <p><strong>Session Auth:</strong> Flask-Login Cookie Sessions</p>
            <p><strong>Audit Tracking:</strong> Real-time Login & Activity Logs</p>
          </div>
        </div>

      </div>
    </div>
  );
};
