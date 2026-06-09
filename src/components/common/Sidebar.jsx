import React from 'react';
import { NavLink } from 'react-router-dom';
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
  return (
    <div className="w-64 bg-primary-800 text-white flex flex-col">
      <div className="p-4 border-b border-primary-700">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = iconMap[item.label] || FiHome;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 transition duration-200 ${
                  isActive
                    ? 'bg-primary-700 border-l-4 border-white'
                    : 'hover:bg-primary-700'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;