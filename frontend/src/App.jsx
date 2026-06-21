import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import ReportIssue from './pages/ReportIssue';
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import LostAndFound from './pages/LostAndFound';
import CommunityIssues from './pages/CommunityIssues';
import Academics from './pages/Academics';

// Route Guards
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Student/Shared Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chatbot" 
              element={
                <PrivateRoute>
                  <Chatbot />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/report-issue" 
              element={
                <PrivateRoute>
                  <ReportIssue />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/complaint/:complaintId" 
              element={
                <PrivateRoute>
                  <ComplaintDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/lost-found" 
              element={
                <PrivateRoute>
                  <LostAndFound />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <PrivateRoute>
                  <CommunityIssues />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/academics" 
              element={
                <PrivateRoute>
                  <Academics />
                </PrivateRoute>
              } 
            />

            {/* Protected Admin-Only Routes */}
            <Route 
              path="/analytics" 
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              } 
            />
            <Route 
              path="/users" 
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } 
            />

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
