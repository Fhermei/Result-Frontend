import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiUpload, FiEye, FiChevronRight } from 'react-icons/fi';

const MyCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">My Courses</h1>
        <p className="text-[10px] sm:text-sm text-gray-500">Courses assigned to you for the current semester</p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <FiBookOpen className="mx-auto text-gray-300 text-3xl sm:text-5xl mb-3" />
          <p className="text-sm text-gray-500">No courses assigned to you yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-green-200">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[10px] sm:text-sm text-gray-500">{course.code}</span>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-800 mt-0.5 truncate">{course.title}</h3>
                </div>
                <span className="flex-shrink-0 ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[8px] sm:text-xs rounded-full font-medium">
                  {course.credit_unit} units
                </span>
              </div>
              
              {/* Details */}
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-[10px] sm:text-sm">
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
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                <Link
                  to={`/lecturer/upload?course=${course.id}`}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm rounded-lg transition flex-1"
                >
                  <FiUpload size={12} className="sm:size-14" />
                  <span>Upload</span>
                </Link>
                <Link
                  to={`/lecturer/results?course=${course.id}`}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:py-2 border border-gray-200 hover:border-green-500 text-gray-600 hover:text-green-600 text-[10px] sm:text-sm rounded-lg transition flex-1"
                >
                  <FiEye size={12} className="sm:size-14" />
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