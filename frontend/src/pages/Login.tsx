import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, User as UserIcon, ShieldCheck, KeyRound, CheckCircle2, AlertCircle, UserCheck, GraduationCap, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, activateAccount } = useAuth();
  const navigate = useNavigate();

  // Active Login Portal Tab: 'HOD' or 'Faculty'
  const [activePortal, setActivePortal] = useState<'HOD' | 'Faculty'>('HOD');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Activate Account / Set Password Modal State
  const [activateModal, setActivateModal] = useState(false);
  const [activateIdentifier, setActivateIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activateError, setActivateError] = useState<string | null>(null);
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null);
  const [activateLoading, setActivateLoading] = useState(false);

  const handlePortalSwitch = (portal: 'HOD' | 'Faculty') => {
    setActivePortal(portal);
    setLoginError(null);
    if (portal === 'HOD') {
      if (!username || username === 'helen') setUsername('rajesh');
    } else {
      if (!username || username === 'rajesh') setUsername('helen');
    }
  };

  const handleQuickFill = (userStr: string) => {
    setUsername(userStr);
    setPassword('password123'); 
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      await login(username, password, remember);
      navigate('/');
    } catch (err: any) {
      if (err.data && err.data.requires_activation) {
        setLoginError(err.data.error);
        setActivateIdentifier(err.data.username || username);
        setActivateModal(true);
      } else {
        setLoginError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError(null);
    setActivateSuccess(null);

    if (!activateIdentifier.trim()) {
      setActivateError('Please enter your Username, Email, or Employee ID.');
      return;
    }
    if (newPassword.length < 6) {
      setActivateError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setActivateError('Passwords do not match.');
      return;
    }

    setActivateLoading(true);

    try {
      const res = await activateAccount(activateIdentifier, newPassword);
      setActivateSuccess(res.message || 'Password set successfully! You can now log in.');
      setUsername(activateIdentifier);
      setPassword(newPassword);
      setTimeout(() => {
        setActivateModal(false);
        setActivateSuccess(null);
      }, 1500);
    } catch (err: any) {
      setActivateError(err.message || 'Account activation failed. Please verify your details.');
    } finally {
      setActivateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden">
      
      {/* Background Graphic Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main SSMIET ERP Card */}
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-0 z-10">
        
        {/* Institutional Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 text-center space-y-3 relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-orange-500/30 ring-4 ring-white/10">
            SSM
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
              SSM Institute of Engineering and Technology
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1">
              Autonomous Institution | Department of Cyber Security
            </p>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-orange-300 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-orange-400" /> Enterprise ERP Portal
          </div>
        </div>

        {/* Dual Portal Switcher Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handlePortalSwitch('HOD')}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              activePortal === 'HOD'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-md border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>HOD Portal Login</span>
          </button>
          
          <button
            type="button"
            onClick={() => handlePortalSwitch('Faculty')}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
              activePortal === 'Faculty'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Faculty Portal Login</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Active Portal Badge */}
          <div className={`p-3 rounded-2xl text-xs font-medium border flex items-center justify-between ${
            activePortal === 'HOD' 
              ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300'
          }`}>
            <span className="font-semibold">
              {activePortal === 'HOD' ? '🔑 Department Head Access' : '🎓 Faculty Member Access'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/60 dark:bg-black/30 font-bold uppercase tracking-wider">
              {activePortal}
            </span>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>{loginError}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {activePortal === 'HOD' ? 'HOD Username / Email' : 'Faculty Username / Email / Emp ID'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activePortal === 'HOD' ? 'e.g. rajesh or rajesh@ssmiet.ac.in' : 'e.g. helen or EMP-CY-001'}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:text-slate-100 font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all dark:text-slate-100 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded border-slate-300 dark:border-slate-700 focus:ring-orange-500 accent-orange-500"
                />
                <span className="ml-2 font-medium">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setActivateIdentifier(username);
                  setActivateModal(true);
                }}
                className="font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                Activate Account / Set Password
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-white disabled:opacity-50 ${
                activePortal === 'HOD'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Sign In to {activePortal} ERP</span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Chips */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Login Shortcuts for Testing:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActivePortal('HOD');
                  handleQuickFill('rajesh');
                }}
                className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-900/60 text-orange-800 dark:text-orange-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
              >
                <span>HOD Dr. Rajesh</span>
                <span className="text-[10px] opacity-75">(rajesh)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePortal('Faculty');
                  handleQuickFill('helen');
                }}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
              >
                <span>Faculty Dr. Helen</span>
                <span className="text-[10px] opacity-75">(helen)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Account Activation / First-Time Password Creation Modal */}
      {activateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-2xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  First-Time Account Activation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set password for SSMIET Cyber Security ERP
                </p>
              </div>
            </div>

            {activateError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900">
                {activateError}
              </div>
            )}

            {activateSuccess && (
              <div className="p-3 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-2xl border border-green-200 dark:border-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {activateSuccess}
              </div>
            )}

            <form onSubmit={handleActivateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username, Email or Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={activateIdentifier}
                  onChange={(e) => setActivateIdentifier(e.target.value)}
                  placeholder="e.g. rajesh or helen@ssmiet.ac.in or EMP-CY-001"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActivateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activateLoading}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-md shadow-orange-600/30"
                >
                  {activateLoading ? 'Setting Password...' : 'Save & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
