import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Dynamically load the correct dashboard based on role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;
