import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { 
  FiPlus, FiCheck, FiX, FiClock, FiChevronLeft, FiChevronRight,
  FiBookOpen, FiAward, FiAlertCircle
} from 'react-icons/fi';

const CourseRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRegistrationData();
  }, [currentPage]);

  const fetchRegistrationData = async () => {
    setLoading(true);
    try {
      // Use getCourses directly with pagination
      const coursesRes = await coursesAPI.getCourses({ 
        page: currentPage, 
        page_size: itemsPerPage 
      });
      
      const registeredRes = await coursesAPI.getMyRegistrations();
      const semesterRes = await academicsAPI.getCurrentSemester();
      
      // Extract courses from response
      let coursesList = [];
      let total = 0;
      
      if (coursesRes.data && coursesRes.data.results) {
        coursesList = coursesRes.data.results;
        total = coursesRes.data.count;
      } else if (Array.isArray(coursesRes.data)) {
        coursesList = coursesRes.data;
        total = coursesRes.data.length;
      }
      
      setAvailableCourses(coursesList);
      setTotalCourses(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
      setCurrentSemester(semesterRes.data);
      
      // Get registered course IDs
      const registrations = registeredRes.data || [];
      const registeredIds = registrations.map(r => r.course);
      setRegisteredCourses(registeredIds);
      
    } catch (error) {
      console.error('Failed to fetch registration data:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleRegister = async () => {
    if (selectedCourses.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one course' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await coursesAPI.registerCourses(selectedCourses);
      setMessage({ type: 'success', text: response.data.message });
      
      const registeredRes = await coursesAPI.getMyRegistrations();
      const registeredIds = (registeredRes.data || []).map(r => r.course);
      setRegisteredCourses(registeredIds);
      setSelectedCourses(registeredIds);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to register courses' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotalCredits = () => {
    let total = 0;
    selectedCourses.forEach(courseId => {
      const course = availableCourses.find(c => c.id === courseId);
      if (course) total += course.credit_unit;
    });
    return total;
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading && availableCourses.length === 0) return <LoadingSpinner />;

  const totalCredits = calculateTotalCredits();
  const isWithinLimit = totalCredits >= 15 && totalCredits <= 24;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">Course Registration</h1>
        <p className="text-[10px] sm:text-sm text-gray-500">
          Register for {currentSemester?.session_name} - {currentSemester?.name_display}
        </p>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Registration Summary - Mobile Friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiBookOpen className="mx-auto text-blue-500 text-sm sm:text-xl mb-1" />
          <p className="text-[8px] sm:text-xs text-gray-500">Selected</p>
          <p className="text-sm sm:text-2xl font-bold text-blue-600">{selectedCourses.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiAward className="mx-auto text-green-500 text-sm sm:text-xl mb-1" />
          <p className="text-[8px] sm:text-xs text-gray-500">Credits</p>
          <p className="text-sm sm:text-2xl font-bold text-green-600">{totalCredits}</p>
        </div>
        <div className={`bg-white rounded-xl shadow-sm border p-3 sm:p-4 text-center ${isWithinLimit ? 'border-green-200' : 'border-red-200'}`}>
          <FiAlertCircle className={`mx-auto text-sm sm:text-xl mb-1 ${isWithinLimit ? 'text-green-500' : 'text-red-500'}`} />
          <p className={`text-[8px] sm:text-xs ${isWithinLimit ? 'text-green-600' : 'text-red-600'}`}>Limit (15-24)</p>
          <p className={`text-sm sm:text-2xl font-bold ${isWithinLimit ? 'text-green-600' : 'text-red-600'}`}>
            {isWithinLimit ? '✓ OK' : '⚠️ Adjust'}
          </p>
        </div>
      </div>

      {/* Available Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-lg font-semibold text-gray-800">Available Courses</h2>
          <div className="text-[10px] sm:text-sm text-gray-500">
            Page {currentPage} of {totalPages} • {totalCourses} courses
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {availableCourses.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-gray-400 text-sm">
              No courses available for registration this semester.
            </div>
          ) : (
            availableCourses.map((course) => {
              const isRegistered = registeredCourses.includes(course.id);
              const isSelected = selectedCourses.includes(course.id);
              
              return (
                <div
                  key={course.id}
                  className={`border rounded-lg p-3 sm:p-4 transition-all ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <span className="font-mono text-[10px] sm:text-sm text-gray-500">{course.code}</span>
                        <span className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                          {course.credit_unit} units
                        </span>
                        {course.is_elective && (
                          <span className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                            Elective
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-base font-semibold text-gray-800 truncate">{course.title}</h3>
                      <p className="text-[8px] sm:text-sm text-gray-500 mt-0.5">
                        {course.department_name} • Level {course.level_value}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isRegistered ? (
                        <span className="inline-flex items-center text-green-600 text-[10px] sm:text-sm font-medium">
                          <FiCheck className="mr-1 sm:size-16" size={12} /> Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleCourse(course.id)}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 text-[10px] sm:text-sm font-medium transition ${
                            isSelected
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <FiX size={12} className="sm:size-16" />
                              <span>Remove</span>
                            </>
                          ) : (
                            <>
                              <FiPlus size={12} className="sm:size-16" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <div className="text-[10px] sm:text-sm text-gray-500">
              Showing {availableCourses.length} of {totalCourses}
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft size={12} className="sm:size-16" />
              </button>
              <span className="text-[10px] sm:text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight size={12} className="sm:size-16" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Button - Fixed bottom on mobile */}
      {selectedCourses.length > 0 && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40">
          <button
            onClick={handleRegister}
            disabled={submitting || !isWithinLimit}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-lg flex items-center space-x-2 text-sm sm:text-base font-medium transition ${
              isWithinLimit && !submitting
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              <FiCheck size={16} className="sm:size-20" />
            )}
            <span>{submitting ? 'Registering...' : `Register ${selectedCourses.length}`}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseRegistration;