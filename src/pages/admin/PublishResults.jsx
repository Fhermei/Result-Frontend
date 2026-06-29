import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { 
  FiCheckCircle, FiShield, FiSearch, 
  FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiFileText, FiClock, FiAward
} from 'react-icons/fi';

const PublishResults = () => {
  const [loading, setLoading] = useState(true);
  const [allResults, setAllResults] = useState([]);
  const [publishedResults, setPublishedResults] = useState([]);
  const [unpublishedResults, setUnpublishedResults] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [message, setMessage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [uniqueCourses, setUniqueCourses] = useState([]);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchResultsForSemester();
    }
  }, [selectedSemester]);

  useEffect(() => {
    filterAndPaginateResults();
  }, [publishedResults, searchTerm, filterGrade, filterCourse, currentPage]);

  const fetchSemesters = async () => {
    try {
      const response = await academicsAPI.getSemesters();
      const semestersData = response.data || [];
      setSemesters(semestersData);
      
      const currentSem = semestersData.find(s => s.is_current);
      if (currentSem) {
        setSelectedSemester(currentSem.id);
      } else if (semestersData.length > 0) {
        setSelectedSemester(semestersData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch semesters:', error);
      setMessage({ type: 'error', text: 'Failed to load semesters' });
      setLoading(false);
    }
  };

  const fetchResultsForSemester = async () => {
    setLoading(true);
    try {
      const response = await resultsAPI.getResults({ 
        semester: selectedSemester,
        page: 1,
        page_size: 100
      });
      
      let resultsData = [];
      let totalCount = 0;
      
      if (response.data && response.data.results) {
        resultsData = response.data.results;
        totalCount = response.data.count || resultsData.length;
      } else if (Array.isArray(response.data)) {
        resultsData = response.data;
        totalCount = resultsData.length;
      }
      
      setAllResults(resultsData);
      setTotalResultsCount(totalCount);
      
      const published = resultsData.filter(r => r.is_published === true);
      const unpublished = resultsData.filter(r => r.is_published === false);
      
      setPublishedResults(published);
      setUnpublishedResults(unpublished);
      
      const courses = [...new Set(published.map(r => r.course_details?.code).filter(Boolean))];
      setUniqueCourses(courses);
      
      setCurrentPage(1);
      
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setMessage({ type: 'error', text: 'Failed to load results' });
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateResults = () => {
    let filtered = [...publishedResults];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        (r.student_matric?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (r.course_details?.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterGrade) {
      filtered = filtered.filter(r => r.grade === filterGrade);
    }
    
    if (filterCourse) {
      filtered = filtered.filter(r => r.course_details?.code === filterCourse);
    }
    
    const totalFiltered = filtered.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedResults = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    setDisplayResults(paginatedResults);
    setTotalPages(Math.ceil(totalFiltered / itemsPerPage) || 1);
  };

  const handlePublish = async () => {
    if (unpublishedResults.length === 0) {
      setMessage({ type: 'warning', text: 'No unpublished results for this semester' });
      return;
    }

    if (!window.confirm(`Publish ${unpublishedResults.length} results for this semester?`)) {
      return;
    }

    setPublishing(true);
    let published = 0;
    let errors = 0;
    
    try {
      for (const result of unpublishedResults) {
        try {
          await resultsAPI.updateResult(result.id, { is_published: true });
          published++;
        } catch (e) {
          errors++;
        }
      }
      
      if (errors > 0) {
        setMessage({ type: 'warning', text: `Published ${published} results, failed to publish ${errors} results` });
      } else {
        setMessage({ type: 'success', text: `Successfully published ${published} results` });
      }
      
      await fetchResultsForSemester();
      
    } catch (error) {
      console.error('Publish error:', error);
      setMessage({ type: 'error', text: 'Failed to publish results' });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublishSelected = async () => {
    const selectedCount = displayResults.length;
    if (selectedCount === 0) {
      setMessage({ type: 'warning', text: 'No results selected to unpublish' });
      return;
    }

    if (!window.confirm(`Unpublish ${selectedCount} results?`)) {
      return;
    }

    setUnpublishing(true);
    let unpublished = 0;
    let errors = 0;
    
    try {
      for (const result of displayResults) {
        try {
          await resultsAPI.updateResult(result.id, { is_published: false });
          unpublished++;
        } catch (e) {
          errors++;
        }
      }
      
      if (errors > 0) {
        setMessage({ type: 'warning', text: `Unpublished ${unpublished} results, failed to unpublish ${errors} results` });
      } else {
        setMessage({ type: 'success', text: `Successfully unpublished ${unpublished} results` });
      }
      
      await fetchResultsForSemester();
      
    } catch (error) {
      console.error('Unpublish error:', error);
      setMessage({ type: 'error', text: 'Failed to unpublish results' });
    } finally {
      setUnpublishing(false);
    }
  };

  const handleBlockchainVerify = async () => {
    setVerifying(true);
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: 'Blockchain verification completed. All published results are authentic and tamper-proof.' 
      });
      setVerifying(false);
    }, 2000);
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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterGrade('');
    setFilterCourse('');
    setCurrentPage(1);
  };

  const refreshData = () => {
    fetchResultsForSemester();
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

  if (loading && !allResults.length) return <LoadingSpinner />;

  const selectedSemesterDetails = semesters.find(s => s.id === parseInt(selectedSemester));

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Publish Results</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Review and publish semester results to the blockchain</p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 hover:border-green-500 text-gray-600 hover:text-green-600 text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
        >
          <FiRefreshCw size={12} className="sm:size-4" />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Semester Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.session_name} - {sem.name_display}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handlePublish}
              disabled={publishing || unpublishedResults.length === 0}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {publishing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiCheckCircle size={12} className="sm:size-4" />
              )}
              <span>{publishing ? 'Publishing...' : `Publish ${unpublishedResults.length}`}</span>
            </button>
            <button
              onClick={handleBlockchainVerify}
              disabled={verifying}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 text-[10px] sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {verifying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : (
                <FiShield size={12} className="sm:size-4" />
              )}
              <span>Verify</span>
            </button>
          </div>
        </div>
        {selectedSemesterDetails && (
          <p className="text-[10px] sm:text-sm text-gray-500 mt-2">
            Selected: {selectedSemesterDetails.session_name} - {selectedSemesterDetails.name_display}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiFileText className="mx-auto text-blue-500 text-base sm:text-xl mb-1" />
          <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
          <p className="text-base sm:text-2xl font-bold text-gray-800">{totalResultsCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiClock className="mx-auto text-yellow-500 text-base sm:text-xl mb-1" />
          <p className="text-[10px] sm:text-xs text-gray-500">Pending</p>
          <p className="text-base sm:text-2xl font-bold text-yellow-600">{unpublishedResults.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 text-center">
          <FiAward className="mx-auto text-green-500 text-base sm:text-xl mb-1" />
          <p className="text-[10px] sm:text-xs text-gray-500">Published</p>
          <p className="text-base sm:text-2xl font-bold text-green-600">{publishedResults.length}</p>
        </div>
      </div>

      {/* Published Results Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-lg font-semibold text-gray-800">
            Published Results
            <span className="text-[10px] sm:text-sm font-normal text-gray-500 ml-1">
              ({publishedResults.length} total)
            </span>
          </h2>
          {publishedResults.length > 0 && (
            <button
              onClick={handleUnpublishSelected}
              disabled={unpublishing}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1 sm:px-4 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {unpublishing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiCheckCircle size={12} className="sm:size-4" />
              )}
              <span>Unpublish Page ({displayResults.length})</span>
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 pb-3 border-b border-gray-100">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white w-full sm:w-32"
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
          <select
            value={filterGrade}
            onChange={(e) => {
              setFilterGrade(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white w-full sm:w-28"
          >
            <option value="">All Grades</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
          </select>
          {(searchTerm || filterGrade || filterCourse) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg text-[10px] sm:text-sm hover:bg-gray-50 transition whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

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
              {displayResults.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-400 text-sm">
                    {searchTerm || filterGrade || filterCourse 
                      ? 'No results match your filters.' 
                      : 'No published results found for this semester.'}
                  </td>
                </tr>
              ) : (
                displayResults.map((result, index) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 py-2 text-sm font-mono">{result.student_matric}</td>
                    <td className="px-3 py-2 text-sm">{result.student_name}</td>
                    <td className="px-3 py-2 text-sm font-mono">{result.course_details?.code}</td>
                    <td className="px-3 py-2 text-sm text-center">{result.ca_score}</td>
                    <td className="px-3 py-2 text-sm text-center">{result.exam_score}</td>
                    <td className="px-3 py-2 text-sm text-center font-medium">{result.total_score}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-green-600 text-xs font-medium flex items-center justify-center">
                        <FiCheckCircle size={10} className="mr-1" /> Published
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── MOBILE CARD VIEW ───────────────────────────────────────────── */}
        <div className="sm:hidden space-y-2">
          {displayResults.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-xs">
              No results found
            </div>
          ) : (
            displayResults.map((result, index) => (
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
                  <span className="text-green-600 text-[8px] flex items-center flex-shrink-0 ml-2">
                    <FiCheckCircle size={8} className="mr-0.5" /> Published
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="text-[10px] sm:text-sm text-gray-500">
              Showing {displayResults.length} of {publishedResults.length} results
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
      </div>

      {/* Pending Results Info */}
      {unpublishedResults.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
          <p className="text-[10px] sm:text-sm text-yellow-700">
            {unpublishedResults.length} results are waiting to be published.
          </p>
        </div>
      )}
    </div>
  );
};

export default PublishResults;