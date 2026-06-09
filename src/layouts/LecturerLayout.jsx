import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const LecturerLayout = () => {
  const navItems = [
    { path: '/lecturer', label: 'Dashboard', icon: 'Dashboard' },
    { path: '/lecturer/courses', label: 'My Courses', icon: 'My Courses' },
    { path: '/lecturer/upload', label: 'Upload Results', icon: 'Upload Results' },
    { path: '/lecturer/results', label: 'View Results', icon: 'View Results' },
    { path: '/lecturer/edit', label: 'Edit Results', icon: 'Edit Results' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} title="Lecturer Portal" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;