import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiBookOpen, FiCalendar, FiClock,
  FiCheckCircle, FiBarChart2, FiUpload, FiEye, FiEdit,
  FiAward, FiFileText, FiPlus, FiShield, FiGrid, FiFolder
} from 'react-icons/fi';

const iconMap = {
  Dashboard: FiHome,
  Users: FiUsers,
  Faculties: FiGrid,
  Departments: FiFolder,
  Courses: FiBookOpen,
  Sessions: FiCalendar,
  Semesters: FiClock,
  'Publish Results': FiCheckCircle,
  Reports: FiBarChart2,
  'My Courses': FiBookOpen,
  'Upload Results': FiUpload,
  'View Results': FiEye,
  'Edit Results': FiEdit,
  'My Results': FiAward,
  Transcript: FiFileText,
  'Course Registration': FiPlus,
  'Verify Result': FiShield,
};

const Sidebar = ({ navItems, title }) => {
  const location = useLocation();

  return (
    <div className="w-56 sm:w-64 bg-gray-800 text-white flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <h2 className="text-sm sm:text-xl font-bold tracking-tight">{title}</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 sm:py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.label] || FiHome;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={() =>
                `flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition duration-200 ${
                  isActive
                    ? 'bg-gray-700 border-l-4 border-green-500 font-semibold'
                    : 'hover:bg-gray-700 border-l-4 border-transparent'
                }`
              }
            >
              <Icon size={14} className="sm:size-[18px] flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;