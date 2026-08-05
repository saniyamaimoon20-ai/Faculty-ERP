import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { Fingerprint, CheckCircle2, Search } from 'lucide-react';
import type { BiometricLogItem } from '../types';

export const AttendanceBiometricPage: React.FC = () => {
  const [logs, setLogs] = useState<BiometricLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBiometricLogs();
  }, []);

  const fetchBiometricLogs = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/biometric-logs');
      setLogs(res || []);
    } catch (err) {
      console.error('Failed to load biometric logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(l => 
    l.faculty_name.toLowerCase().includes(search.toLowerCase()) ||
    l.device_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-indigo-500" /> Biometric Attendance Device Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Read-only audit stream connected to SSMIET Cyber Security Biometric Punch Terminals
        </p>
      </div>

      <div className="glass-card p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty or device ID..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-4">Terminal Device ID</th>
                <th className="py-3.5 px-4">Punch Timestamp</th>
                <th className="py-3.5 px-4 text-center">Punch Type</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                    <p className="mt-2 text-xs">Loading Biometric Logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No biometric punch records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 font-sans">{l.faculty_name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{l.device_id}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{l.punch_time}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${l.punch_type === 'IN' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                        PUNCH {l.punch_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
