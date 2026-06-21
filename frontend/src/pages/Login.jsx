import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      // Success redirects based on state
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-10 animate-pulse-slow"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-4">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">AI Smart Campus Assistant</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Intelligent student support & campus issue management</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-300">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Welcome Back</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to access your student or admin workspace.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 mb-6 rounded-xl bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Username or Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 dark:focus:bg-slate-900 dark:text-white dark:focus:ring-indigo-600 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 dark:shadow-none dark:hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Prompt */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to the platform?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Alert */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 text-center">
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Quick Testing Accounts</h4>
          <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-1">
            <strong>Student:</strong> student / student123 <span className="mx-2">|</span> <strong>Admin:</strong> admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
