import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resultsAPI } from '../../api/results';
import { studentsAPI } from '../../api/students';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiAward, FiBookOpen, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [cgpaData, setCgpaData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCredits: 0,
    currentGPA: 0,
    completedCourses: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, transcriptRes, resultsRes] = await Promise.all([
        studentsAPI.getMyProfile(),
        resultsAPI.getMyTranscript(),
        resultsAPI.getMyResults({ limit: 5 }),
      ]);
      
      setProfile(profileRes.data);
      setCgpaData(transcriptRes.data);
      const resultsData = resultsRes.data || [];
      setRecentResults(resultsData.slice(0, 5));
      
      // Calculate stats
      const totalCredits = resultsData.reduce((sum, r) => sum + (r.course_details?.credit_unit || 0), 0);
      const completedCourses = resultsData.filter(r => r.grade !== 'F').length;
      
      setStats({
        totalCourses: resultsData.length,
        totalCredits: totalCredits,
        currentGPA: transcriptRes.data?.cgpa || 0,
        completedCourses: completedCourses,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'CGPA', value: stats.currentGPA.toFixed(2), icon: FiTrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Courses Taken', value: stats.totalCourses, icon: FiBookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Credit Units', value: stats.totalCredits, icon: FiAward, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Completed', value: stats.completedCourses, icon: FiCheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card flex items-center space-x-4">
            <div className={`${stat.bg} p-3 rounded-full`}>
              <stat.icon className={`${stat.color} text-2xl`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Student Info */}
      {profile && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Matric Number</p>
              <p className="font-medium">{profile.matric_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">{profile.department_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Level</p>
              <p className="font-medium">{profile.current_level_value} Level</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Admission Year</p>
              <p className="font-medium">{profile.admission_year}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Course Code</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Course Title</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Credit</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Score</th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{result.course_details?.code}</td>
                    <td className="px-4 py-2 text-sm">{result.course_details?.title}</td>
                    <td className="px-4 py-2 text-sm text-center">{result.course_details?.credit_unit}</td>
                    <td className="px-4 py-2 text-sm text-center">{result.total_score}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        result.grade === 'A' ? 'bg-green-100 text-green-700' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;