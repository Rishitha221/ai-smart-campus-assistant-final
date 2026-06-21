import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { User, Shield, BookOpen, Key, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Administration'
  ];

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName) {
      setError('Full Name is required.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      await updateProfile(fullName, department, password || undefined);
      setSuccess('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="My Profile" />
        
        <main className="p-8 pt-24 max-w-4xl">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Username</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{user?.username}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Portal Role</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex items-center gap-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">Account Configuration</h3>

            {error && (
              <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                  >
                    <option value="">None</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Key className="h-4 w-4 text-indigo-600" />
                  Change Password (Optional)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
