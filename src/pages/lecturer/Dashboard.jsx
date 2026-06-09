import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../api/courses';
import { resultsAPI } from '../../api/results';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiBookOpen, FiUpload, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

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
      
      // Calculate unique students
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
    { title: 'My Courses', value: stats.courses, icon: FiBookOpen, color: 'text-blue-600', bg: 'bg-blue-100', link: '/lecturer/courses' },
    { title: 'Students', value: stats.students, icon: FiUsers, color: 'text-green-600', bg: 'bg-green-100', link: '/lecturer/results' },
    { title: 'Results Uploaded', value: stats.resultsUploaded, icon: FiUpload, color: 'text-purple-600', bg: 'bg-purple-100', link: '/lecturer/results' },
    { title: 'Published', value: stats.publishedResults, icon: FiCheckCircle, color: 'text-orange-600', bg: 'bg-orange-100', link: '/lecturer/results' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lecturer Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-full`}>
                <stat.icon className={`${stat.color} text-2xl`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/lecturer/upload"
            className="flex items-center justify-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
          >
            <FiUpload className="text-primary-600 text-xl" />
            <span className="font-medium text-primary-700">Upload New Results</span>
          </Link>
          <Link
            to="/lecturer/courses"
            className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <FiBookOpen className="text-gray-600 text-xl" />
            <span className="font-medium text-gray-700">View My Courses</span>
          </Link>
        </div>
      </div>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">My Courses</h2>
          <div className="space-y-3">
            {recentCourses.map((course) => (
              <div key={course.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{course.code}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">{course.credit_unit} Units</span>
                  </div>
                  <h3 className="font-medium text-gray-800">{course.title}</h3>
                  <p className="text-sm text-gray-500">
                    {course.department_name} | Level {course.level_value}
                  </p>
                </div>
                <Link
                  to={`/lecturer/upload?course=${course.id}`}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
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