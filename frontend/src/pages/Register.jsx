import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Lock, User as UserIcon, Mail, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    department: 'Computer Science',
    password: '',
    role: 'student'
  });
  
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { username, email, password, fullName, department, role } = formData;

    if (!username || !email || !password || !fullName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, fullName, department, role);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different username/email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-pulse-slow"></div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none mb-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">AI Smart Campus Assistant</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Register a student account to get started.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-300">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Join your campus digital portal.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0 animate-bounce" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Full Name *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Username *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. janedoe"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Email Address *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. jane@campus.edu"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Department</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <BookOpen className="h-4 w-4" />
                </span>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role Select (Allow Admin creation in dev mode) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Account Role</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />
                  Student
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="accent-indigo-600"
                  />
                  Admin
                </label>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Password * (Min 6 chars)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 dark:shadow-none dark:hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Register
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Prompt */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
