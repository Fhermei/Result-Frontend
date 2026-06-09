import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiUpload, FiEye } from 'react-icons/fi';

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <p className="text-gray-500">Courses assigned to you for the current semester</p>
      </div>

      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <FiBookOpen className="mx-auto text-gray-400 text-5xl mb-3" />
          <p className="text-gray-500">No courses assigned to you yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-sm text-gray-500">{course.code}</span>
                  <h3 className="font-semibold text-gray-800 mt-1">{course.title}</h3>
                </div>
                <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                  {course.credit_unit} Units
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Department:</span> {course.department_name}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Level:</span> {course.level_value} Level
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Semester:</span> {course.semester_name}
                </p>
              </div>
              
              <div className="flex space-x-3 pt-3 border-t">
                <Link
                  to={`/lecturer/upload?course=${course.id}`}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  <FiUpload size={14} />
                  <span>Upload Results</span>
                </Link>
                <Link
                  to={`/lecturer/results?course=${course.id}`}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <FiEye size={14} />
                  <span>View Results</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;