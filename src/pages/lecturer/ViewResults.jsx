import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultsAPI } from '../../api/results';
import { coursesAPI } from '../../api/courses';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiEye, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';

const ViewResults = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [message, setMessage] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedCourse, selectedSemester, currentPage]);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, semestersRes] = await Promise.all([
        coursesAPI.getMyCourses(),
        academicsAPI.getSemesters(),
      ]);
      setCourses(coursesRes.data || []);
      setSemesters(semestersRes.data || []);
      
      const courseId = searchParams.get('course');
      if (courseId) setSelectedCourse(courseId);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage
      };
      if (selectedCourse) params.course = selectedCourse;
      if (selectedSemester) params.semester = selectedSemester;
      
      const response = await resultsAPI.getResults(params);
      
      let resultsData = [];
      let total = 0;
      
      if (response.data && response.data.results) {
        resultsData = response.data.results;
        total = response.data.count;
      } else if (Array.isArray(response.data)) {
        resultsData = response.data;
        total = response.data.length;
      }
      
      setResults(resultsData);
      setTotalCount(total);
      // Calculate total pages: ceil(total / itemsPerPage) or at least 1
      const pages = Math.max(1, Math.ceil(total / itemsPerPage));
      setTotalPages(pages);
      
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setMessage({ type: 'error', text: 'Failed to load results' });
    } finally {
      setLoading(false);
    }
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

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-gray-100 text-gray-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
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

  if (loading && results.length === 0) return <LoadingSpinner />;

  const publishedCount = results.filter(r => r.is_published).length;
  const draftCount = results.filter(r => !r.is_published).length;

  // Debug log to see if totalPages is correct
  console.log('Total Pages:', totalPages, 'Total Count:', totalCount, 'Current Page:', currentPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">View Results</h1>
          <p className="text-gray-500">View and manage student results for your courses</p>
        </div>
        <button
          onClick={() => fetchResults()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50">
          <p className="text-sm text-blue-600">Total Results</p>
          <p className="text-2xl font-bold text-blue-700">{totalCount.toLocaleString()}</p>
        </div>
        <div className="card bg-green-50">
          <p className="text-sm text-green-600">Published</p>
          <p className="text-2xl font-bold text-green-700">{publishedCount}</p>
        </div>
        <div className="card bg-purple-50">
          <p className="text-sm text-purple-600">Draft</p>
          <p className="text-2xl font-bold text-purple-700">{draftCount}</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="">All Courses ({courses.length})</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
            >
              <option value="">All Semesters</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.session_name} - {sem.name_display}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Results {selectedCourse && courses.find(c => c.id === parseInt(selectedCourse))?.code 
              ? `for ${courses.find(c => c.id === parseInt(selectedCourse)).code}` 
              : '(All Courses)'}
          </h2>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} | Total: {totalCount.toLocaleString()} results
          </div>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiEye className="mx-auto text-4xl mb-2 text-gray-300" />
            <p>No results found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Matric No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CA</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Exam</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{result.student_matric}</td>
                      <td className="px-4 py-3 text-sm">{result.student_name}</td>
                      <td className="px-4 py-3 text-sm">{result.course_details?.code}</td>
                      <td className="px-4 py-3 text-sm text-center">{result.ca_score}</td>
                      <td className="px-4 py-3 text-sm text-center">{result.exam_score}</td>
                      <td className="px-4 py-3 text-sm text-center font-medium">{result.total_score}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {result.is_published ? (
                          <span className="text-green-600 text-xs">Published</span>
                        ) : (
                          <span className="text-yellow-600 text-xs">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Always show if totalPages > 1 */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Showing {results.length} of {totalCount.toLocaleString()} results
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
          </>
        )}
      </div>
    </div>
  );
};

export default ViewResults;