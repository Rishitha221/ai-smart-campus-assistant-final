import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400"></div>
      </div>
    );
  }

  // If logged in but not an admin, redirect to general dashboard
  if (user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default AdminRoute;
