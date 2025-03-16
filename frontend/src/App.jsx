import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/student/login';
import StudentSignup from './components/student/StudentSignup';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import AdminEvent from './components/admin/AdminEvent';
import AdminUsers from './components/admin/AdminUsers';
import AdminCom from './components/admin/AdminCom';
import AdminReport from './components/admin/AdminReport';
import AdminResources from './components/admin/AdminResources';
import ProtectedRoute from './components/common/ProtectedRoute';
import LecturerMyClasses from './components/lecture/LecturerMyClasses';
import LectureProfile from "./components/lecture/LectureProfile";
import LectureStdMng from "./components/lecture/LectureStdMng";
import LectureEvent from "./components/lecture/LectureEvent";
import LectureAssignment from "./components/lecture/LectureAssignment";
import LectureResource from "./components/lecture/LectureResource";
import LectureCom from "./components/lecture/LectureCom";
import StudentProfile from './components/student/StudentProfile';
import StudentAssignment from './components/student/StudentAssignment';
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
          <Route
            path="/student/assignments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAssignment />
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
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/event"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/com"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReport />
              </ProtectedRoute>
            }
          />
          {/* Protected Lecture routes */}
          <Route
            path="/lecturer/classes"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LecturerMyClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/profile"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/students"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureStdMng />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/events"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/assignments"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/resources"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureResource />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lecturer/communication"
            element={
              <ProtectedRoute allowedRoles={['lecturer']}>
                <LectureCom />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/users" element={<Navigate to="/admin/dashboard" />} />
          <Route path="/admin/events" element={<Navigate to="/admin/event" />} />
          <Route path="/admin/resources" element={<Navigate to="/admin/resources" />} />
          <Route path="/admin/communication" element={<Navigate to="/admin/com" />} />
          <Route path="/admin/reports" element={<Navigate to="/admin/reports" />} />

          {/* Fallback for unknown routes - redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;