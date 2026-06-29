import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../api/courses';
import { resultsAPI } from '../../api/results';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUpload, FiUsers, FiCheckCircle, FiPlus } from 'react-icons/fi';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    resultsUploaded: 0,
    publishedResults: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, resultsRes] = await Promise.all([
        coursesAPI.getMyCourses(),
        resultsAPI.getResults(),
      ]);
      
      const courses = coursesRes.data || [];
      setRecentCourses(courses.slice(0, 5));
      
      const resultsData = resultsRes.data || [];
      const uniqueStudents = new Set(resultsData.map(r => r.student));
      const publishedResults = resultsData.filter(r => r.is_published).length;
      
      setStats({
        courses: courses.length,
        students: uniqueStudents.size,
        resultsUploaded: resultsData.length,
        publishedResults: publishedResults,
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'My Courses', value: stats.courses, icon: FiBookOpen, link: '/lecturer/courses' },
    { title: 'Students', value: stats.students, icon: FiUsers, link: '/lecturer/results' },
    { title: 'Results Uploaded', value: stats.resultsUploaded, icon: FiUpload, link: '/lecturer/results' },
    { title: 'Published', value: stats.publishedResults, icon: FiCheckCircle, link: '/lecturer/results' },
  ];

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">Lecturer Dashboard</h1>
        <p className="text-[10px] sm:text-sm text-gray-500 mt-0.5">Welcome back, {user?.full_name}</p>
      </div>

      {/* Stats Cards - 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <stat.icon className="text-green-600 text-sm sm:text-xl" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <h2 className="text-xs sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <Link
            to="/lecturer/upload"
            className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition border border-green-100"
          >
            <FiUpload className="text-green-600 text-sm sm:text-xl" />
            <span className="text-xs sm:text-base font-medium text-green-700">Upload Results</span>
          </Link>
          <Link
            to="/lecturer/courses"
            className="flex items-center justify-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100"
          >
            <FiBookOpen className="text-gray-600 text-sm sm:text-xl" />
            <span className="text-xs sm:text-base font-medium text-gray-700">My Courses</span>
          </Link>
        </div>
      </div>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-lg font-semibold text-gray-800">My Courses</h2>
            <Link
              to="/lecturer/courses"
              className="text-[10px] sm:text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
            >
              View All <FiPlus size={12} className="sm:size-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-200 transition gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-mono text-[10px] sm:text-sm text-gray-500">{course.code}</span>
                    <span className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full font-medium">{course.credit_unit} units</span>
                  </div>
                  <h3 className="text-xs sm:text-base font-medium text-gray-800 truncate">{course.title}</h3>
                  <p className="text-[8px] sm:text-sm text-gray-500">
                    {course.department_name} • Level {course.level_value}
                  </p>
                </div>
                <Link
                  to={`/lecturer/upload?course=${course.id}`}
                  className="text-[10px] sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-center whitespace-nowrap"
                >
                  Upload Results
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerDashboard;