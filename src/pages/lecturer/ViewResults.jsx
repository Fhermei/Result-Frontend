import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultsAPI } from '../../api/results';
import { coursesAPI } from '../../api/courses';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiEye, FiChevronLeft, FiChevronRight, FiRefreshCw, FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi';

const ViewResults = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [message, setMessage] = useState(null);
  
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
      'A': 'bg-green-100 text-green-700',
      'B': 'bg-blue-100 text-blue-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-orange-100 text-orange-700',
      'E': 'bg-red-100 text-red-700',
      'F': 'bg-gray-100 text-gray-700',
    };
    return colors[grade] || 'bg-gray-100 text-gray-700';
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

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">View Results</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">View and manage student results for your courses</p>
        </div>
        <button
          onClick={() => fetchResults()}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 hover:border-green-500 text-gray-600 hover:text-green-600 text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
        >
          <FiRefreshCw size={12} className="sm:size-4" />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiFileText className="mx-auto text-blue-500 text-sm sm:text-xl mb-1" />
          <p className="text-[8px] sm:text-xs text-gray-500">Total</p>
          <p className="text-sm sm:text-2xl font-bold text-gray-800">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiCheckCircle className="mx-auto text-green-500 text-sm sm:text-xl mb-1" />
          <p className="text-[8px] sm:text-xs text-gray-500">Published</p>
          <p className="text-sm sm:text-2xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiClock className="mx-auto text-yellow-500 text-sm sm:text-xl mb-1" />
          <p className="text-[8px] sm:text-xs text-gray-500">Draft</p>
          <p className="text-sm sm:text-2xl font-bold text-yellow-600">{draftCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
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
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Filter by Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
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

      {/* Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-lg font-semibold text-gray-800">
            Results {selectedCourse && courses.find(c => c.id === parseInt(selectedCourse))?.code 
              ? `for ${courses.find(c => c.id === parseInt(selectedCourse)).code}` 
              : '(All Courses)'}
          </h2>
          <div className="text-[10px] sm:text-sm text-gray-500">
            Page {currentPage} of {totalPages} • {totalCount.toLocaleString()} results
          </div>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <FiEye className="mx-auto text-2xl sm:text-4xl mb-2 opacity-30" />
            <p className="text-sm">No results found</p>
          </div>
        ) : (
          <>
            {/* ─── DESKTOP TABLE ──────────────────────────────────────────────── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Matric</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Student</th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">CA</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Exam</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                    <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-3 py-2 text-sm font-mono">{result.student_matric}</td>
                      <td className="px-3 py-2 text-sm">{result.student_name}</td>
                      <td className="px-3 py-2 text-sm">{result.course_details?.code}</td>
                      <td className="px-3 py-2 text-sm text-center">{result.ca_score}</td>
                      <td className="px-3 py-2 text-sm text-center">{result.exam_score}</td>
                      <td className="px-3 py-2 text-sm text-center font-medium">{result.total_score}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {result.is_published ? (
                          <span className="text-[10px] text-green-600">Published</span>
                        ) : (
                          <span className="text-[10px] text-yellow-600">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─── MOBILE CARD VIEW ───────────────────────────────────────────── */}
            <div className="sm:hidden space-y-2">
              {results.map((result, index) => (
                <div key={result.id} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[8px] text-gray-400">#{result.student_matric}</span>
                        <span className="text-[8px] text-gray-300">•</span>
                        <span className="text-[8px] font-medium text-gray-700">{result.course_details?.code}</span>
                      </div>
                      <p className="text-[9px] text-gray-600 truncate">{result.student_name}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[8px] text-gray-500">CA: {result.ca_score}</span>
                        <span className="text-[8px] text-gray-500">Exam: {result.exam_score}</span>
                        <span className="text-[8px] font-medium text-gray-700">Total: {result.total_score}</span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] ${result.is_published ? 'text-green-600' : 'text-yellow-600'} flex-shrink-0 ml-2`}>
                      {result.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="text-[10px] sm:text-sm text-gray-500">
                  Showing {results.length} of {totalCount.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiChevronLeft size={12} className="sm:size-4" />
                  </button>
                  <span className="text-[10px] sm:text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <FiChevronRight size={12} className="sm:size-4" />
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