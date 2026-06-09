import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-2 md:mb-0">
            &copy; {currentYear} Blockchain Result Management System. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-primary-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-primary-600 transition">Contact Support</a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-3">
          Powered by Blockchain Technology | Secure & Transparent
        </div>
      </div>
    </footer>
  );
};

export default Footer;