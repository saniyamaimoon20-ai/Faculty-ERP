import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCircle2, AlertTriangle, Info, ShieldAlert, Send, Plus } from 'lucide-react';
import type { NotificationItem, UserProfile } from '../types';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const isHOD = user?.role === 'HOD';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Send Notification Modal State
  const [sendModal, setSendModal] = useState(false);
  const [facultyList, setFacultyList] = useState<UserProfile[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    user_id: '' // empty string = broadcast to all
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    if (isHOD) {
      fetchFacultyList();
    }
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isHOD]);

  const fetchFacultyList = async () => {
    try {
      const res = await apiRequest('/faculty?per_page=100');
      setFacultyList(res.faculty || []);
    } catch (err) {
      console.error('Failed to fetch faculty list:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications');
      setNotifications(res || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    if (!formData.title.trim() || !formData.message.trim()) {
      setSendError('Title and message are required.');
      return;
    }

    setSendLoading(true);

    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          message: formData.message,
          type: formData.type,
          user_id: formData.user_id ? Number(formData.user_id) : null
        })
      });

      fetchNotifications();
      setSendModal(false);
      setFormData({
        title: '',
        message: '',
        type: 'info',
        user_id: ''
      });
    } catch (err: any) {
      setSendError(err.message || 'Failed to dispatch notification.');
    } finally {
      setSendLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'danger': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" /> Department Circulars & Notifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SSM Institute of Engineering and Technology — Cyber Security Announcements
          </p>
        </div>

        {isHOD && (
          <button
            onClick={() => setSendModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Send Notification
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="glass-card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400">No active notifications.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${n.is_read ? 'bg-transparent opacity-80' : 'bg-orange-50/40 dark:bg-orange-950/20'}`}>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1.5 block font-mono">{n.created_at}</span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold shrink-0"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Send Notification Modal (HOD Only) */}
      {sendModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-500" /> Dispatch Department Notification
              </h3>
              <button onClick={() => setSendModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {sendError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900">
                {sendError}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Circular Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mandatory Faculty Meeting / Lab Inspection"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write notice details regarding class schedule change, lab submission, or administrative update..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notification Priority</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="info">🔵 Information</option>
                    <option value="warning">🟡 Warning Notice</option>
                    <option value="success">🟢 Announcement</option>
                    <option value="danger">🔴 Urgent Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recipient Target</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Broadcast to All Faculties</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.user_id}>{f.full_name} ({f.employee_id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSendModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendLoading}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-1"
                >
                  {sendLoading ? 'Dispatching...' : 'Dispatch Notice'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
