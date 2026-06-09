// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { academicsAPI } from '../../api/academics';
// import { coursesAPI } from '../../api/courses';
// import { studentsAPI } from '../../api/students';
// import { resultsAPI } from '../../api/results';
// import { authAPI } from '../../api/auth';
// import LoadingSpinner from '../../components/common/LoadingSpinner';
// import { 
//   FiUsers, FiBookOpen, FiCheckCircle, 
//   FiCalendar, FiGrid
// } from 'react-icons/fi';
// import { Link } from 'react-router-dom';

// const AdminDashboard = () => {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     students: 0,
//     lecturers: 0,
//     courses: 0,
//     faculties: 0,
//     resultsPublished: 0,
//     currentSession: 'N/A',
//   });

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       console.log('Fetching stats quickly using COUNT...');
      
//       // Get counts from single API calls (NOT all pages!)
//       const [studentsCount, usersCount, coursesCount, facultiesRes, resultsCount, sessionsRes] = await Promise.all([
//         studentsAPI.getStudentsCount(),
//         authAPI.getUsersCount(),
//         coursesAPI.getCoursesCount(),
//         academicsAPI.getFaculties(),
//         resultsAPI.getResultsCount(),
//         academicsAPI.getSessions(),
//       ]);
      
//       // Get lecturers count - need to filter by role
//       const usersRes = await authAPI.getUsers({ page: 1, page_size: 100, role: 'lecturer' });
//       const lecturersCount = usersRes.data?.length || 0;
      
//       // Get published results count
//       const publishedResultsRes = await resultsAPI.getResults({ page: 1, page_size: 1, is_published: true });
//       const publishedResultsCount = publishedResultsRes.count || 0;
      
//       const facultiesData = facultiesRes.data || [];
//       const sessionsData = sessionsRes.data || [];
//       const currentSession = sessionsData.find(s => s && s.is_current);
      
//       setStats({
//         students: studentsCount.count || 0,
//         lecturers: lecturersCount,
//         courses: coursesCount.count || 0,
//         faculties: facultiesData.length,
//         resultsPublished: publishedResultsCount,
//         currentSession: currentSession?.name || 'N/A',
//       });
      
//       console.log('Stats updated quickly:', {
//         students: studentsCount.count,
//         lecturers: lecturersCount,
//         courses: coursesCount.count,
//         faculties: facultiesData.length,
//         resultsPublished: publishedResultsCount,
//       });
      
//     } catch (error) {
//       console.error('Failed to fetch stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <LoadingSpinner />;

//   const statCards = [
//     { title: 'Total Students', value: stats.students, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100', link: '/admin/users?role=student' },
//     { title: 'Total Lecturers', value: stats.lecturers, icon: FiUsers, color: 'text-green-600', bg: 'bg-green-100', link: '/admin/users?role=lecturer' },
//     { title: 'Courses', value: stats.courses, icon: FiBookOpen, color: 'text-purple-600', bg: 'bg-purple-100', link: '/admin/courses' },
//     { title: 'Faculties', value: stats.faculties, icon: FiGrid, color: 'text-orange-600', bg: 'bg-orange-100', link: '/admin/faculties' },
//     { title: 'Results Published', value: stats.resultsPublished, icon: FiCheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/admin/publish' },
//     { title: 'Current Session', value: stats.currentSession, icon: FiCalendar, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/admin/sessions' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
//         <p className="text-gray-500">Welcome back, {user?.full_name}</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {statCards.map((stat, index) => (
//           <Link to={stat.link} key={index} className="card hover:shadow-lg transition-shadow">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-500">{stat.title}</p>
//                 <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
//               </div>
//               <div className={`${stat.bg} p-3 rounded-full`}>
//                 <stat.icon className={`${stat.color} text-2xl`} />
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
//           <div className="space-y-3">
//             <Link to="/admin/users" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
//               <FiUsers className="text-primary-600" />
//               <span>Add New Student or Lecturer</span>
//             </Link>
//             <Link to="/admin/courses" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
//               <FiBookOpen className="text-primary-600" />
//               <span>Create New Course</span>
//             </Link>
//             <Link to="/admin/publish" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
//               <FiCheckCircle className="text-primary-600" />
//               <span>Publish Semester Results</span>
//             </Link>
//           </div>
//         </div>

//         <div className="card">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">System Status</h2>
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Blockchain Status</span>
//               <span className="text-green-600 flex items-center">
//                 <FiCheckCircle className="mr-1" /> Connected
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">Database Status</span>
//               <span className="text-green-600">Active</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-gray-600">API Version</span>
//               <span className="text-gray-800">v1.0.0</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { academicsAPI } from '../../api/academics';
import { coursesAPI } from '../../api/courses';
import { studentsAPI } from '../../api/students';
import { resultsAPI } from '../../api/results';
import { authAPI } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
  FiUsers, FiBookOpen, FiCheckCircle, 
  FiCalendar, FiGrid
} from 'react-icons/fi';
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
      
      // Get counts from single API calls (NOT all pages!)
      const studentsCount = await studentsAPI.getStudentsCount();
      const usersCount = await authAPI.getUsersCount();
      const coursesCount = await coursesAPI.getCoursesCount();
      const facultiesRes = await academicsAPI.getFaculties();
      const resultsCount = await resultsAPI.getResultsCount();
      const sessionsRes = await academicsAPI.getSessions();
      
      console.log('Students count:', studentsCount.count);
      console.log('Users count:', usersCount.count);
      console.log('Courses count:', coursesCount.count);
      
      // Get lecturers count - need to fetch with role filter
      let lecturersCount = 0;
      try {
        const lecturersRes = await authAPI.getUsers({ role: 'lecturer', page: 1, page_size: 1 });
        lecturersCount = lecturersRes.data?.count || 0;
      } catch (e) {
        console.error('Failed to get lecturers count:', e);
      }
      
      // Get published results count
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
      
      console.log('Stats updated:', {
        students: studentsCount.count,
        lecturers: lecturersCount,
        courses: coursesCount.count,
        faculties: facultiesData.length,
        resultsPublished: publishedResultsCount,
      });
      
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Students', value: stats.students, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-100', link: '/admin/users?role=student' },
    { title: 'Total Lecturers', value: stats.lecturers, icon: FiUsers, color: 'text-green-600', bg: 'bg-green-100', link: '/admin/users?role=lecturer' },
    { title: 'Courses', value: stats.courses, icon: FiBookOpen, color: 'text-purple-600', bg: 'bg-purple-100', link: '/admin/courses' },
    { title: 'Faculties', value: stats.faculties, icon: FiGrid, color: 'text-orange-600', bg: 'bg-orange-100', link: '/admin/faculties' },
    { title: 'Results Published', value: stats.resultsPublished, icon: FiCheckCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', link: '/admin/publish' },
    { title: 'Current Session', value: stats.currentSession, icon: FiCalendar, color: 'text-indigo-600', bg: 'bg-indigo-100', link: '/admin/sessions' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Link to={stat.link} key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-full`}>
                <stat.icon className={`${stat.color} text-2xl`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <FiUsers className="text-primary-600" />
              <span>Add New Student or Lecturer</span>
            </Link>
            <Link to="/admin/courses" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <FiBookOpen className="text-primary-600" />
              <span>Create New Course</span>
            </Link>
            <Link to="/admin/publish" className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <FiCheckCircle className="text-primary-600" />
              <span>Publish Semester Results</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blockchain Status</span>
              <span className="text-green-600 flex items-center">
                <FiCheckCircle className="mr-1" /> Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Status</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Version</span>
              <span className="text-gray-800">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;