import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, Plus, UserCheck, 
  ChevronLeft, ChevronRight, Mail, Phone, ArrowUpDown, Trash2, CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';
import type { UserProfile } from '../types';

export const FacultyList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [facultyList, setFacultyList] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [designation, setDesignation] = useState('');
  const [sortBy, setSortBy] = useState('full_name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  // Modal State for HOD Delete Faculty
  const [deleteModalFac, setDeleteModalFac] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        designation,
        sort_by: sortBy,
        order,
        page: currentPage.toString(),
        per_page: '10'
      });

      const res = await apiRequest(`/faculty?${params.toString()}`);
      setFacultyList(res.faculty || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to fetch faculty list:', err);
    } finally {
      setLoading(false);
    }
  }, [search, designation, sortBy, order, currentPage]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handleToggleAttendance = async (fac: UserProfile, newStatus: string) => {
    try {
      setStatusUpdatingId(fac.id);
      await apiRequest(`/faculty/${fac.id}/attendance-status`, {
        method: 'PUT',
        body: JSON.stringify({ attendance_status: newStatus })
      });
      // Refresh local list
      setFacultyList(prev => prev.map(f => f.id === fac.id ? { ...f, attendance_status: newStatus } : f));
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteFaculty = async () => {
    if (!deleteModalFac) return;
    try {
      setDeleteLoading(true);
      await apiRequest(`/faculty/${deleteModalFac.id}`, { method: 'DELETE' });
      setDeleteModalFac(null);
      fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Failed to delete faculty member.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-500" /> Cyber Security Faculty Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SSM Institute of Engineering and Technology — Cyber Security Academic Staff
          </p>
        </div>

        {user?.role === 'HOD' && (
          <Link
            to="/faculty/add"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Faculty
          </Link>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name, ID, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={designation}
            onChange={(e) => { setDesignation(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-56 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="">All Designations</option>
            <option value="Professor & Head of Department">Professor & HOD</option>
            <option value="Professor">Professor</option>
            <option value="Associate Professor">Associate Professor</option>
            <option value="Assistant Professor">Assistant Professor</option>
          </select>
        </div>

      </div>

      {/* Faculty Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4 cursor-pointer hover:text-orange-500" onClick={() => handleSort('employee_id')}>
                  <span className="flex items-center gap-1">Employee ID <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-orange-500" onClick={() => handleSort('full_name')}>
                  <span className="flex items-center gap-1">Faculty Name <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4 text-center">Status / Presence</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 text-center">Workload</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                    <p className="mt-2 text-xs">Loading Cyber Security Faculty Directory...</p>
                  </td>
                </tr>
              ) : facultyList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No faculty members found matching your search.
                  </td>
                </tr>
              ) : (
                facultyList.map((fac) => {
                  const status = fac.attendance_status || 'Present';
                  return (
                    <tr
                      key={fac.id}
                      onClick={() => navigate(`/faculty/${fac.id}`)}
                      className="hover:bg-orange-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {fac.employee_id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={fac.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fac.employee_id}`}
                            alt={fac.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-orange-400 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{fac.full_name}</p>
                            <span className="text-[10px] text-slate-400">{fac.qualification || 'M.E. / Ph.D.'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {fac.designation}
                      </td>

                      {/* Dynamic HOD Attendance Presence Toggle */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {user?.role === 'HOD' ? (
                          <div className="inline-flex items-center space-x-1">
                            <select
                              value={status}
                              disabled={statusUpdatingId === fac.id}
                              onChange={(e) => handleToggleAttendance(fac, e.target.value)}
                              className={`px-2 py-1 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                                status === 'Present'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                  : status === 'Absent'
                                  ? 'bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300'
                                  : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              <option value="Present">🟢 Present</option>
                              <option value="Absent">🔴 Absent</option>
                              <option value="On Leave">🟡 On Leave</option>
                            </select>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            status === 'Present'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : status === 'Absent'
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {status === 'Present' && <CheckCircle className="w-3 h-3" />}
                            {status === 'Absent' && <XCircle className="w-3 h-3" />}
                            {status === 'On Leave' && <Clock className="w-3 h-3" />}
                            {status}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 mr-1 text-slate-400" /> {fac.email}
                        </div>
                        <div className="flex items-center text-slate-500 dark:text-slate-400 text-[10px]">
                          <Phone className="w-3 h-3 mr-1 text-slate-400" /> {fac.phone_number || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-full font-bold text-[11px]">
                          {fac.weekly_workload} hrs/wk
                        </span>
                      </td>

                      {/* Actions: View Profile + HOD Remove Faculty */}
                      <td className="py-3 px-4 text-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/faculty/${fac.id}`)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View
                        </button>

                        {user?.role === 'HOD' && fac.designation !== 'Professor & Head of Department' && (
                          <button
                            onClick={() => setDeleteModalFac(fac)}
                            className="px-2 py-1 bg-red-50 dark:bg-red-950/60 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900 transition-colors"
                            title="Remove Faculty Member"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-100">{facultyList.length}</strong> of <strong className="text-slate-900 dark:text-slate-100">{total}</strong> faculty members
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

      {/* Delete Faculty Confirmation Modal */}
      {deleteModalFac && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Remove Faculty Member
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  HOD Administrative Privilege
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-slate-100">{deleteModalFac.full_name}</strong> ({deleteModalFac.employee_id}) from the Cyber Security department records? This will delete their login credentials and unassign active timetables.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalFac(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteFaculty}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5"
              >
                {deleteLoading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
