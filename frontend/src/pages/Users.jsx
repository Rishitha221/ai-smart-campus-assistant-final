import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Users as UsersIcon, Shield, Mail, BookOpen, Clock, AlertTriangle, Trash2, Edit } from 'lucide-react';

const Users = () => {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      await apiCall(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their data.')) return;
    
    try {
      await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      fetchUsers(); // Refresh list
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />
      
      <div className="pl-64">
        <Navbar title="Manage Users" />
        
        <main className="p-8 pt-24 max-w-7xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registered Users</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and manage all active student and admin login profiles.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden transition-all">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-3">Loading users list...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 px-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 dark:text-white">Error loading users</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Details</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 font-bold text-xs">
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-white">{u.full_name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          {u.username}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                            {u.department || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
                          }`}>
                            <Shield className="h-3 w-3" />
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button 
                            onClick={() => handleRoleChange(u.id, u.role)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Toggle Role
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;
