import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { resultsAPI } from '../../api/results';
import { studentsAPI } from '../../api/students';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiAward, FiBookOpen, FiTrendingUp, FiCheckCircle, FiUser, FiMail } from 'react-icons/fi';

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
    { title: 'CGPA', value: stats.currentGPA.toFixed(2), icon: FiTrendingUp },
    { title: 'Courses', value: stats.totalCourses, icon: FiBookOpen },
    { title: 'Credits', value: stats.totalCredits, icon: FiAward },
    { title: 'Completed', value: stats.completedCourses, icon: FiCheckCircle },
  ];

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-[10px] sm:text-sm text-gray-500">Welcome back, {user?.full_name}</p>
      </div>
      
      {/* Stats Cards - 2x2 on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200 hover:border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <stat.icon className="text-green-600 text-sm sm:text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Student Info */}
      {profile && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <h2 className="text-xs sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Student Information</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div>
              <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Matric</p>
              <p className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">{profile.matric_no}</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Department</p>
              <p className="text-[10px] sm:text-sm font-medium text-gray-800 truncate">{profile.department_name}</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Level</p>
              <p className="text-[10px] sm:text-sm font-medium text-gray-800">{profile.current_level_value}L</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Admission</p>
              <p className="text-[10px] sm:text-sm font-medium text-gray-800">{profile.admission_year}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <h2 className="text-xs sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Recent Results</h2>
          
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Credits</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 text-xs font-mono text-gray-700">{result.course_details?.code}</td>
                    <td className="px-3 py-2 text-xs text-gray-700 truncate max-w-[150px]">{result.course_details?.title}</td>
                    <td className="px-3 py-2 text-xs text-center text-gray-600">{result.course_details?.credit_unit}</td>
                    <td className="px-3 py-2 text-xs text-center font-medium text-gray-700">{result.total_score}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        result.grade === 'A' ? 'bg-green-100 text-green-700' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        result.grade === 'D' ? 'bg-orange-100 text-orange-700' :
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

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2">
            {recentResults.map((result) => (
              <div key={result.id} className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[8px] font-mono font-medium text-gray-700">{result.course_details?.code}</span>
                      <span className="text-[8px] text-gray-400">•</span>
                      <span className="text-[8px] text-gray-500">{result.course_details?.credit_unit} cr</span>
                    </div>
                    <p className="text-[9px] text-gray-600 truncate">{result.course_details?.title}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[8px] font-medium text-gray-700">Score: {result.total_score}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${
                        result.grade === 'A' ? 'bg-green-100 text-green-700' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        result.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.grade}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;