import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicsAPI } from '../../api/academics';
import { coursesAPI } from '../../api/courses';
import { studentsAPI } from '../../api/students';
import { resultsAPI } from '../../api/results';
import { authAPI } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    faculties: 0,
    resultsPublished: 0,
    currentSession: 'N/A',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats quickly using COUNT...');
      
      const studentsCount = await studentsAPI.getStudentsCount();
      const usersCount = await authAPI.getUsersCount();
      const coursesCount = await coursesAPI.getCoursesCount();
      const facultiesRes = await academicsAPI.getFaculties();
      const resultsCount = await resultsAPI.getResultsCount();
      const sessionsRes = await academicsAPI.getSessions();
      
      let lecturersCount = 0;
      try {
        const lecturersRes = await authAPI.getUsers({ role: 'lecturer', page: 1, page_size: 1 });
        lecturersCount = lecturersRes.data?.count || 0;
      } catch (e) {
        console.error('Failed to get lecturers count:', e);
      }
      
      let publishedResultsCount = 0;
      try {
        const publishedRes = await resultsAPI.getResults({ is_published: true, page: 1, page_size: 1 });
        publishedResultsCount = publishedRes.data?.count || 0;
      } catch (e) {
        console.error('Failed to get published results count:', e);
      }
      
      const facultiesData = facultiesRes.data || [];
      const sessionsData = sessionsRes.data || [];
      const currentSession = sessionsData.find(s => s && s.is_current);
      
      setStats({
        students: studentsCount.count || 0,
        lecturers: lecturersCount,
        courses: coursesCount.count || 0,
        faculties: facultiesData.length,
        resultsPublished: publishedResultsCount,
        currentSession: currentSession?.name || 'N/A',
      });
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Students', value: stats.students, link: '/admin/users?role=student' },
    { title: 'Total Lecturers', value: stats.lecturers, link: '/admin/users?role=lecturer' },
    { title: 'Courses', value: stats.courses, link: '/admin/courses' },
    { title: 'Faculties', value: stats.faculties, link: '/admin/faculties' },
    { title: 'Results Published', value: stats.resultsPublished, link: '/admin/publish' },
    { title: 'Current Session', value: stats.currentSession, link: '/admin/sessions' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
      </div>

      {/* Stats Grid - 2 cols mobile, 3 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-green-200"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions & System Status - 1 col mobile, 2 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg hover:bg-green-50 transition duration-200"
            >
              <span className="text-green-600 font-medium text-sm">+</span>
              <span className="text-sm text-gray-700">Add New Student or Lecturer</span>
            </Link>
            <Link
              to="/admin/courses"
              className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg hover:bg-green-50 transition duration-200"
            >
              <span className="text-green-600 font-medium text-sm">+</span>
              <span className="text-sm text-gray-700">Create New Course</span>
            </Link>
            <Link
              to="/admin/publish"
              className="flex items-center space-x-3 p-2.5 bg-gray-50 rounded-lg hover:bg-green-50 transition duration-200"
            >
              <span className="text-green-600 font-medium text-sm">✓</span>
              <span className="text-sm text-gray-700">Publish Semester Results</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">System Status</h2>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Blockchain Status</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Database Status</span>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;