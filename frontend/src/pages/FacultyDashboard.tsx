import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, Clock, BookOpen, DoorOpen, 
  Bell, User, ShieldCheck 
} from 'lucide-react';
import type { TimetableEntry, NotificationItem } from '../types';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const faculty = user?.profile;

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [todaysClasses, setTodaysClasses] = useState<TimetableEntry[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchFacultyData = useCallback(async () => {
    if (!faculty?.id) return;
    try {
      const [ttRes, notifRes] = await Promise.all([
        apiRequest(`/timetable/faculty/${faculty.id}`),
        apiRequest('/notifications')
      ]);

      const ttData: TimetableEntry[] = ttRes || [];
      setTimetable(ttData);

      const daysMap: Record<number, string> = { 0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday", 4: "Friday" };
      const todayStr = daysMap[new Date().getDay()] || "Monday";

      const todayTT = ttData.filter(t => t.day_of_week === todayStr);
      setTodaysClasses(todayTT);

      setNotifications(notifRes || []);
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    }
  }, [faculty?.id]);

  useEffect(() => {
    if (faculty?.id) {
      fetchFacultyData();
      const interval = setInterval(fetchFacultyData, 10000);
      return () => clearInterval(interval);
    }
  }, [faculty?.id, fetchFacultyData]);

  const assignedSubjectsCount = new Set(timetable.map(t => t.subject_id)).size;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Cyber Security Department Faculty
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Welcome, {faculty?.full_name || user?.username}
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 mt-1">
            {faculty?.designation || 'Faculty Member'} — Employee ID: {faculty?.employee_id}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/timetable"
            className="px-4 py-2 bg-white text-orange-600 hover:bg-orange-50 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <CalendarDays className="w-4 h-4" /> My Full Timetable
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 bg-orange-700/80 hover:bg-orange-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors border border-white/20"
          >
            <User className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Assigned Workload */}
        <div className="glass-card p-5 border-l-4 border-orange-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Workload</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {faculty?.weekly_workload || timetable.length} Periods
            </h3>
            <span className="text-[10px] text-orange-600 font-medium mt-1 inline-block">Assigned Teaching Hours</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Today's Classes */}
        <div className="glass-card p-5 border-l-4 border-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today's Classes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{todaysClasses.length} Sessions</h3>
            <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">Scheduled For Today</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Assigned Subjects */}
        <div className="glass-card p-5 border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Subjects</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{assignedSubjectsCount} Courses</h3>
            <span className="text-[10px] text-blue-600 font-medium mt-1 inline-block">Cyber Security Curriculum</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Today's Schedule & Department Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Classes Timeline */}
        <div className="glass-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" /> Today's Teaching Schedule
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-full">
              {todaysClasses.length} Sessions
            </span>
          </div>

          <div className="space-y-3">
            {todaysClasses.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No classes scheduled for today. Take time for research and lab prep!
              </div>
            ) : (
              todaysClasses.map((cls) => (
                <div key={cls.id} className="p-4 bg-orange-50/50 dark:bg-slate-800/60 border border-orange-200/50 dark:border-slate-700/50 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Period {cls.period_number} • {cls.start_time} - {cls.end_time}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cls.subject_name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Code: {cls.subject_code}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5 text-orange-500" /> {cls.room_number}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between">
                    <span>Semester {cls.semester} (Section {cls.section})</span>
                    <span>Building: {cls.building}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Department Noticeboard */}
        <div className="glass-card p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> Department Alerts & Notices
            </h3>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active notices.</p>
            ) : (
              notifications.map(n => (
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
