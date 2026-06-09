import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const AdminLayout = () => {
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'Dashboard' },
    { path: '/admin/users', label: 'Users', icon: 'Users' },
    { path: '/admin/faculties', label: 'Faculties', icon: 'Faculties' },
    { path: '/admin/departments', label: 'Departments', icon: 'Departments' },
    { path: '/admin/courses', label: 'Courses', icon: 'Courses' },
    { path: '/admin/sessions', label: 'Sessions', icon: 'Sessions' },
    { path: '/admin/semesters', label: 'Semesters', icon: 'Semesters' },
    { path: '/admin/publish', label: 'Publish Results', icon: 'Publish Results' },
    { path: '/admin/reports', label: 'Reports', icon: 'Reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} title="Admin Panel" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;