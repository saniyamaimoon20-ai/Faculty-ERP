import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Phone, ShieldCheck, Award, Calendar, 
  BookOpen, Edit2, Save, ArrowLeft, CheckCircle2, Camera 
} from 'lucide-react';
import type { TimetableEntry } from '../types';

export const FacultyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchFacultyDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/faculty/${id}`);
      setFaculty(res);
      setFormData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load faculty profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFacultyDetail();
  }, [fetchFacultyDetail]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaveLoading(true);

    try {
      const res = await apiRequest(`/faculty/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setFaculty(res.faculty);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-xs">Loading Faculty Details...</p>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Faculty member not found.</p>
        <button onClick={() => navigate('/faculty')} className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl">
          Back to Directory
        </button>
      </div>
    );
  }

  const isHOD = user?.role === 'HOD';
  const isOwnProfile = user?.profile?.id === faculty.id;
  const canEdit = isHOD || isOwnProfile;

  const timetables: TimetableEntry[] = faculty.timetables || [];
  const assignedSubjects = faculty.assigned_subjects || [];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/faculty')}
          className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
        </button>

        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile & Photo
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          {success}
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group shrink-0">
          <img
            src={faculty.profile_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.employee_id}`}
            alt={faculty.full_name}
            className="w-28 h-28 rounded-2xl object-cover border-4 border-orange-500 shadow-lg"
          />
          {canEdit && (
            <label className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-1" title="Click to upload new photo">
              <Camera className="w-5 h-5 text-orange-400" />
              <span>Edit Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const photoData = reader.result as string;
                      try {
                        const res = await apiRequest(`/faculty/${faculty.id}`, {
                          method: 'PUT',
                          body: JSON.stringify({ profile_photo: photoData })
                        });
                        setFaculty(res.faculty);
                        setSuccess('Profile photo updated successfully!');
                      } catch (err: any) {
                        setError(err.message || 'Failed to update photo.');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{faculty.full_name}</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full font-bold text-xs self-center md:self-auto">
              <ShieldCheck className="w-3.5 h-3.5" /> {faculty.department_name}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{faculty.designation}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Employee ID: {faculty.employee_id}</p>

          <div className="pt-2 flex flex-wrap gap-4 justify-center md:justify-start text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4 text-orange-500" /> {faculty.email}
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4 text-orange-500" /> {faculty.phone_number || 'N/A'}
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-orange-500" /> {faculty.qualification || 'M.E.'}
            </div>
          </div>
        </div>

        {/* Workload Card Meter */}
        <div className="w-full md:w-64 p-4 bg-orange-50/60 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 rounded-xl space-y-2 text-center md:text-left shrink-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Weekly Workload Meter</p>
          <h3 className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
            {faculty.weekly_workload} Periods / Week
          </h3>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-500"
              style={{ width: `${Math.min((faculty.weekly_workload / 25) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400">Target Standard: 18-24 Periods</p>
        </div>
      </div>

      {/* Edit Form Modal/Drawer */}
      {editing && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-orange-500" /> Update Faculty Profile Information
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {isHOD && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                    <select
                      value={formData.designation || ''}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    >
                      <option value="Professor & Head of Department">Professor & HOD</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number || ''}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo Avatar</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-semibold rounded-xl text-xs hover:bg-orange-200 transition-colors shrink-0">
                    Upload Image File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev: any) => ({ ...prev, profile_photo: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={formData.profile_photo || ''}
                    onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                    placeholder="or paste image URL e.g. https://..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assigned Subjects & Timetable Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Assigned Subjects */}
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <BookOpen className="w-4 h-4 text-orange-500" /> Assigned Curriculum Subjects
          </h3>

          <div className="space-y-2">
            {assignedSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No subjects assigned yet.</p>
            ) : (
              assignedSubjects.map((sub: any) => (
                <div key={sub.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{sub.subject_code}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full font-bold">
                      Sem {sub.semester}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{sub.subject_name}</h4>
                  <span className="text-[10px] text-slate-400 block">{sub.credits} Credits</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Weekly Schedule Matrix */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-orange-500" /> Weekly Timetable Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {timetables.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No timetable slots allocated for this faculty member.
                    </td>
                  </tr>
                ) : (
                  timetables.map((t) => (
                    <tr key={t.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{t.day_of_week}</td>
                      <td className="py-2.5 px-3 font-bold text-orange-600 dark:text-orange-400">Period {t.period_number}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{t.start_time} - {t.end_time}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {t.short_name} ({t.subject_code})
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">{t.room_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
