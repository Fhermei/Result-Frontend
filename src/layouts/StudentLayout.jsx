import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const StudentLayout = () => {
  const navItems = [
    { path: '/student', label: 'Dashboard', icon: 'Dashboard' },
    { path: '/student/results', label: 'My Results', icon: 'My Results' },
    { path: '/student/transcript', label: 'Transcript', icon: 'Transcript' },
    { path: '/student/register', label: 'Course Registration', icon: 'Course Registration' },
    { path: '/student/verify', label: 'Verify Result', icon: 'Verify Result' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} title="Student Portal" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;