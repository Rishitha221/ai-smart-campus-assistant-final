import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  AlertTriangle, 
  User, 
  BarChart2, 
  Users, 
  LogOut,
  GraduationCap,
  PackageSearch,
  Globe,
  BookOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Academics', path: '/academics', icon: BookOpen },
    { name: 'Community Issues', path: '/community', icon: Globe },
    { name: 'AI Chatbot', path: '/chatbot', icon: MessageSquare },
    { name: 'Report Issue', path: '/report-issue', icon: AlertTriangle },
    { name: 'Lost & Found', path: '/lost-found', icon: PackageSearch },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Complaints', path: '/dashboard', icon: AlertTriangle },
    { name: 'Lost & Found', path: '/lost-found', icon: PackageSearch },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Manage Users', path: '/users', icon: Users },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white leading-none">Smart Campus</h1>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">Assistant</span>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 font-bold text-sm">
            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
