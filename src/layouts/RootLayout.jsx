import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-8 lg:ml-56">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;