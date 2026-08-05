import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import { ShieldAlert, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LoginLogItem } from '../types';

export const LoginLogs: React.FC = () => {
  const [logs, setLogs] = useState<LoginLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLoginLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        page: currentPage.toString(),
        per_page: '15'
      });
      const res = await apiRequest(`/logs/login?${params.toString()}`);
      setLogs(res.logs || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to fetch login logs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    fetchLoginLogs();
  }, [fetchLoginLogs]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" /> Login Security Audit Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          HOD Security Portal — Track user authentication timestamps, IP addresses, session durations & browser specs
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search username, IP address, browser..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Login Timestamp</th>
                <th className="py-3.5 px-4">Logout Timestamp</th>
                <th className="py-3.5 px-4 text-center">Session Duration</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Browser & OS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                    <p className="mt-2 text-xs">Loading Security Audit Logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No login logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="py-3 px-4 font-bold text-orange-600 dark:text-orange-400">{log.username}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{log.login_time}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.logout_time}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold rounded-md text-[10px]">
                        {log.session_duration}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{log.ip_address}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">{log.browser}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-100">{logs.length}</strong> of <strong className="text-slate-900 dark:text-slate-100">{total}</strong> security entries
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Page {currentPage} of {pages}
            </span>
            <button
              disabled={currentPage >= pages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
