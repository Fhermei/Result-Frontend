import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiPlus, FiCheck, FiX, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CourseRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Pagination states
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
      // Fetch courses with pagination
      const coursesRes = await coursesAPI.getCourses({ page: currentPage, page_size: itemsPerPage });
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
      
      // Refresh registered courses
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

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Course Registration</h1>
        <p className="text-gray-500">
          Register for courses for {currentSemester?.session_name} - {currentSemester?.name_display}
        </p>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Registration Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Registration Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Selected Courses</p>
            <p className="text-2xl font-bold text-blue-700">{selectedCourses.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Total Credit Units</p>
            <p className="text-2xl font-bold text-green-700">{totalCredits}</p>
          </div>
          <div className={`p-3 rounded-lg ${isWithinLimit ? 'bg-purple-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${isWithinLimit ? 'text-purple-600' : 'text-red-600'}`}>
              Credit Limit (15-24)
            </p>
            <p className={`text-2xl font-bold ${isWithinLimit ? 'text-purple-700' : 'text-red-700'}`}>
              {isWithinLimit ? 'Within Limit' : 'Outside Limit'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Courses */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Available Courses</h2>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} | Total: {totalCourses} courses
          </div>
        </div>
        
        <div className="space-y-3">
          {availableCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No courses available for registration this semester.
            </div>
          ) : (
            availableCourses.map((course) => {
              const isRegistered = registeredCourses.includes(course.id);
              const isSelected = selectedCourses.includes(course.id);
              
              return (
                <div
                  key={course.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-sm text-gray-500">{course.code}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {course.credit_unit} Units
                        </span>
                        {course.is_elective && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                            Elective
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-800">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Department: {course.department_name} | Level: {course.level_value}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      {isRegistered ? (
                        <span className="inline-flex items-center text-green-600">
                          <FiCheck className="mr-1" /> Registered
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleCourse(course.id)}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            isSelected
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <FiX size={16} />
                              <span>Remove</span>
                            </>
                          ) : (
                            <>
                              <FiPlus size={16} />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {availableCourses.length} of {totalCourses} courses
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 border rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {selectedCourses.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleRegister}
            disabled={submitting || !isWithinLimit}
            className={`px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              isWithinLimit && !submitting
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-400 cursor-not-allowed text-white'
            }`}
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiCheck size={20} />
            )}
            <span>{submitting ? 'Registering...' : `Register ${selectedCourses.length} Courses`}</span>
          </button>
        </div>
      )}

      {/* Registration Guidelines */}
      <div className="card bg-yellow-50 border border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <FiClock className="mr-2" /> Registration Guidelines
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Minimum credit units per semester: 15</li>
          <li>Maximum credit units per semester: 24</li>
          <li>You can add/remove courses before final submission</li>
          <li>Registration deadline: 2 weeks after semester begins</li>
          <li>Changes after deadline require HOD approval</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseRegistration;