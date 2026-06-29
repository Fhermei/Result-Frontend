import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiLogOut, FiBell, FiChevronDown, FiX, FiAlertCircle,
  FiMenu, FiHome, FiUsers, FiBookOpen, FiCalendar, FiClock,
  FiCheckCircle, FiBarChart2, FiUpload, FiEye, FiEdit,
  FiAward, FiFileText, FiPlus, FiShield, FiGrid, FiFolder
} from 'react-icons/fi';

// ─── Icon mapping for sidebar items ─────────────────────────────────────────
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

// ─── Nav items per role ──────────────────────────────────────────────────────
const navConfig = {
  admin: [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/faculties', label: 'Faculties' },
    { path: '/admin/departments', label: 'Departments' },
    { path: '/admin/courses', label: 'Courses' },
    { path: '/admin/sessions', label: 'Sessions' },
    { path: '/admin/semesters', label: 'Semesters' },
    { path: '/admin/publish', label: 'Publish Results' },
    { path: '/admin/reports', label: 'Reports' },
  ],
  lecturer: [
    { path: '/lecturer', label: 'Dashboard' },
    { path: '/lecturer/courses', label: 'My Courses' },
    { path: '/lecturer/upload', label: 'Upload Results' },
    { path: '/lecturer/results', label: 'View Results' },
    { path: '/lecturer/edit', label: 'Edit Results' },
  ],
  student: [
    { path: '/student', label: 'Dashboard' },
    { path: '/student/results', label: 'My Results' },
    { path: '/student/transcript', label: 'Transcript' },
    { path: '/student/register', label: 'Course Registration' },
    { path: '/student/verify', label: 'Verify Result' },
  ],
};

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Close mobile menu on route change ──────────────────────────────────────
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutConfirmed = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  // ── Get nav items based on role ────────────────────────────────────────────
  const getNavItems = () => {
    if (!user) return [];
    return navConfig[user.role] || [];
  };

  const navItems = getNavItems();
  const roleTitle = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';

  if (!isAuthenticated) {
    return (
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-lg sm:text-xl font-bold tracking-tight">BlockResult</Link>
          <Link to="/login" className="text-sm hover:text-green-300 transition">Login</Link>
        </div>
      </nav>
    );
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      {/* ─── MAIN NAVBAR ────────────────────────────────────────────────────── */}
      <nav className="bg-white shadow-sm border-b border-gray-100 z-40 sticky top-0">
        <div className="px-3 sm:px-6 py-2 sm:py-3 flex justify-between items-center">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <FiMenu size={18} className="sm:size-5" />
            </button>

            <Link to="/" className="flex items-center">
              <h1 className="text-base sm:text-xl font-extrabold text-gray-800 tracking-tight">
                BRMS
              </h1>
              <span className="ml-2 text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider hidden sm:block">
                {roleTitle}
              </span>
            </Link>
          </div>

          {/* Right: Notifications + User avatar (no dropdown items) */}
          <div className="flex items-center space-x-1 sm:space-x-4">

            {/* Desktop Role Label */}
            <span className="hidden lg:inline text-xs text-gray-400 capitalize">
              {roleTitle}
            </span>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications((v) => !v);
                  setShowUserMenu(false);
                }}
                className="relative p-1.5 sm:p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition"
                title="Notifications"
              >
                <FiBell size={16} className="sm:size-5" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3 border-b">
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                      <FiX size={14} className="sm:size-4" />
                    </button>
                  </div>
                  <div className="py-4 sm:py-6 text-center text-gray-400">
                    <FiBell size={20} className="sm:size-7 mx-auto mb-1 sm:mb-2 opacity-30" />
                    <p className="text-xs sm:text-sm">No new notifications</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE SIDEBAR (Slide-in) ────────────────────────────────────── */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar Content */}
        <div className="relative w-64 sm:w-72 h-full bg-gray-800 text-white shadow-xl overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">BRMS</h2>
              <p className="text-xs text-gray-400 capitalize">{roleTitle}</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{user?.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="py-2">
            {navItems.map((item) => {
              const Icon = iconMap[item.label] || FiHome;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm transition ${
                    isActive
                      ? 'bg-gray-700 border-l-4 border-green-500 font-semibold'
                      : 'hover:bg-gray-700 border-l-4 border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Logout button */}
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP SIDEBAR (Always visible on lg+) ──────────────────────── */}
      <div className="hidden lg:block fixed left-0 top-[72px] bottom-0 w-56 bg-gray-800 text-white overflow-y-auto z-30 shadow-lg">
        <nav className="py-3">
          {navItems.map((item) => {
            const Icon = iconMap[item.label] || FiHome;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-gray-700 border-l-4 border-green-500 font-semibold'
                    : 'hover:bg-gray-700 border-l-4 border-transparent'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom of desktop sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ─── LOGOUT CONFIRMATION MODAL ────────────────────────────────────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-auto p-5 sm:p-6 animate-[fadeIn_200ms_ease-out]">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FiAlertCircle size={18} className="sm:size-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-xs sm:text-sm text-gray-500">Are you sure you want to log out?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 sm:space-x-3 mt-5 sm:mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirmed}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;