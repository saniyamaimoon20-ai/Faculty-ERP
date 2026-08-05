import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api/client';
import { UserPlus, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const AddFaculty: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: `EMP-CY-00${Math.floor(Math.random() * 90 + 10)}`,
    full_name: '',
    gender: 'Male',
    designation: 'Assistant Professor',
    email: '',
    phone_number: '+91 ',
    qualification: 'M.E. in Cybersecurity',
    date_of_joining: new Date().toISOString().split('T')[0],
    biometric_device_id: '',
    profile_photo: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.employee_id.trim() || !formData.full_name.trim() || !formData.email.trim()) {
      setError('Employee ID, Full Name, and Email are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest('/faculty', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setSuccess(`Faculty member ${res.faculty.full_name} added successfully!`);
      setTimeout(() => {
        navigate(`/faculty/${res.faculty.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create faculty member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/faculty')}
          className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-500"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Faculty Directory
        </button>

        <div className="flex items-center space-x-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-full text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5" /> Cyber Security Department
        </div>
      </div>

      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-500" /> Add New Faculty Member
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register academic staff for SSM Institute of Engineering and Technology
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Employee ID */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="employee_id"
                required
                value={formData.employee_id}
                onChange={handleChange}
                placeholder="e.g. EMP-CY-009"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Dr. Arunkumar"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. arunkumar@ssmiet.ac.in"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 98421 XXXXX"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="Professor & Head of Department">Professor & HOD</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Highest Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="e.g. Ph.D. in Cyber Security"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Date of Joining */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Joining
              </label>
              <input
                type="date"
                name="date_of_joining"
                value={formData.date_of_joining}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Biometric Device ID */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Biometric Device ID
              </label>
              <input
                type="text"
                name="biometric_device_id"
                value={formData.biometric_device_id}
                onChange={handleChange}
                placeholder="e.g. BIO-CY-009"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            {/* Profile Photo Avatar URL */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profile Photo Avatar URL
              </label>
              <input
                type="text"
                name="profile_photo"
                value={formData.profile_photo}
                onChange={handleChange}
                placeholder="Leave blank for auto-generated avatar"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>

          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/faculty')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-md shadow-orange-600/30 flex items-center gap-1.5"
            >
              {loading ? 'Adding Faculty...' : 'Create Faculty Account'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
