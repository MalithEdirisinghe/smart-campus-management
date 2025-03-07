import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/student/login';
import StudentSignup from './components/student/StudentSignup';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentProfile from './components/student/StudentProfile';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Default route - redirects to login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<StudentSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Student routes */}
          <Route 
            path="/student/profile" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/student/classes" element={<Navigate to="/student/profile" />} />
          <Route path="/student/schedule" element={<Navigate to="/student/profile" />} />
          <Route path="/student/events" element={<Navigate to="/student/profile" />} />
          <Route path="/student/assignments" element={<Navigate to="/student/profile" />} />
          <Route path="/student/resources" element={<Navigate to="/student/profile" />} />
          <Route path="/student/communication" element={<Navigate to="/student/profile" />} />
          <Route path="/student/announcements" element={<Navigate to="/student/profile" />} />
          
          {/* Protected Admin routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/users" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/events" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/resources" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/communication" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/reports" element={<Navigate to="/admin/dashboard" />} />
          
          {/* Fallback for unknown routes - redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;