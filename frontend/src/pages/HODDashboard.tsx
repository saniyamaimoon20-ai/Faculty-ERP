import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { 
  Users, DoorOpen, CalendarDays, Bell, Activity, 
  ArrowRight, ShieldCheck, Plus, ShieldAlert, Fingerprint, Clock
} from 'lucide-react';
import type { ActivityLogItem, NotificationItem } from '../types';

export const HODDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalRooms: 0,
    todaysClasses: 0,
    totalNotifications: 0
  });
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [facRes, roomRes, ttRes, actRes, notifRes] = await Promise.all([
        apiRequest('/faculty?per_page=1'),
        apiRequest('/rooms?per_page=1'),
        apiRequest('/timetable'),
        apiRequest('/logs/activity?per_page=6'),
        apiRequest('/notifications')
      ]);

      const daysMap: Record<number, string> = { 0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday" };
      const todayStr = daysMap[new Date().getDay()] || "Monday";
      const todayTT = (ttRes || []).filter((t: any) => t.day_of_week === todayStr);

      setStats({
        totalFaculty: facRes.total || 0,
        totalRooms: roomRes.total || 0,
        todaysClasses: todayTT.length,
        totalNotifications: (notifRes || []).length
      });

      setActivities(actRes.logs || []);
      setNotifications(notifRes || []);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Cyber Security Department ERP
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">HOD Command Center</h2>
          <p className="text-xs sm:text-sm text-orange-100 mt-1">
            SSM Institute of Engineering and Technology — Department of Cyber Security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/faculty/add"
            className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Faculty
          </Link>
          <Link
            to="/timetable"
            className="px-4 py-2 bg-orange-700/80 hover:bg-orange-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <CalendarDays className="w-4 h-4" /> Manage Timetable
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Faculty */}
        <div className="glass-card p-5 border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Department Faculty</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalFaculty}</h3>
            <span className="text-[10px] text-orange-600 font-medium mt-1 inline-block">Active Cyber Security Staff</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Today's Classes */}
        <div className="glass-card p-5 border-l-4 border-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Scheduled Classes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.todaysClasses}</h3>
            <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">Live Department Lectures</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Rooms */}
        <div className="glass-card p-5 border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Department Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalRooms}</h3>
            <span className="text-[10px] text-blue-600 font-medium mt-1 inline-block">Halls & Cyber Labs</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Notifications */}
        <div className="glass-card p-5 border-l-4 border-purple-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Department Alerts</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalNotifications}</h3>
            <span className="text-[10px] text-purple-600 font-medium mt-1 inline-block">Broadcast Notices</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Bell className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wider">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link to="/faculty" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <Users className="w-6 h-6 text-orange-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Faculty Directory</p>
          </Link>

          <Link to="/rooms" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <DoorOpen className="w-6 h-6 text-amber-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Room Allocation</p>
          </Link>

          <Link to="/timetable" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <CalendarDays className="w-6 h-6 text-blue-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Timetable Matrix</p>
          </Link>

          <Link to="/logs/login" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <ShieldAlert className="w-6 h-6 text-red-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Login Security</p>
          </Link>

          <Link to="/logs/activity" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <Activity className="w-6 h-6 text-emerald-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Audit Logs</p>
          </Link>

          <Link to="/attendance" className="p-4 glass-card hover:border-orange-500/50 transition-all text-center group">
            <Fingerprint className="w-6 h-6 text-indigo-500 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2">Biometric Logs</p>
          </Link>
        </div>
      </div>

      {/* Activity Feed & Notifications Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activities */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" /> Recent Department Activity
            </h3>
            <Link to="/logs/activity" className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity recorded.</p>
            ) : (
              activities.map(act => (
                <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{act.action}</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{act.details}</p>
                    <span className="text-[10px] text-orange-600 dark:text-orange-400 font-mono mt-1 inline-block">By: {act.username}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Notifications */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> Department Noticeboard
            </h3>
            <Link to="/notifications" className="text-xs text-orange-600 dark:text-orange-400 font-semibold hover:underline flex items-center">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active notices.</p>
            ) : (
              notifications.slice(0, 4).map(n => (
                <div key={n.id} className="p-3 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block">{n.created_at}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
