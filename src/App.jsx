import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import LecturerLayout from './layouts/LecturerLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageFaculties from './pages/admin/ManageFaculties';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageCourses from './pages/admin/ManageCourses';
import ManageSessions from './pages/admin/ManageSessions';
import ManageSemesters from './pages/admin/ManageSemesters';
import PublishResults from './pages/admin/PublishResults';
import ViewReports from './pages/admin/ViewReports';

// Lecturer Pages
import LecturerDashboard from './pages/lecturer/Dashboard';
import MyCourses from './pages/lecturer/MyCourses';
import UploadResults from './pages/lecturer/UploadResults';
import ViewResults from './pages/lecturer/ViewResults';
import EditResults from './pages/lecturer/EditResults';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import MyResults from './pages/student/MyResults';
import Transcript from './pages/student/Transcript';
import CourseRegistration from './pages/student/CourseRegistration';
import VerifyResult from './pages/student/VerifyResult';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'lecturer') return '/lecturer';
    if (user.role === 'student') return '/student';
    return '/login';
  };
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="faculties" element={<ManageFaculties />} />
        <Route path="departments" element={<ManageDepartments />} />
        <Route path="courses" element={<ManageCourses />} />
        <Route path="sessions" element={<ManageSessions />} />
        <Route path="semesters" element={<ManageSemesters />} />
        <Route path="publish" element={<PublishResults />} />
        <Route path="reports" element={<ViewReports />} />
      </Route>
      
      {/* Lecturer Routes */}
      <Route path="/lecturer" element={
        <ProtectedRoute allowedRoles={['lecturer']}>
          <LecturerLayout />
        </ProtectedRoute>
      }>
        <Route index element={<LecturerDashboard />} />
        <Route path="courses" element={<MyCourses />} />
        <Route path="upload" element={<UploadResults />} />
        <Route path="results" element={<ViewResults />} />
        <Route path="edit" element={<EditResults />} />
      </Route>
      
      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="results" element={<MyResults />} />
        <Route path="transcript" element={<Transcript />} />
        <Route path="register" element={<CourseRegistration />} />
        <Route path="verify" element={<VerifyResult />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;