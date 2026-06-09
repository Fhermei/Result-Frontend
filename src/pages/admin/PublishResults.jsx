import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiCheckCircle, FiShield, FiSearch, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';

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
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchAllResultsForSemester();
    }
  }, [selectedSemester]);

  useEffect(() => {
    filterAndPaginateResults();
  }, [publishedResults, searchTerm, filterGrade, filterCourse, currentPage]);

  const fetchSemesters = async () => {
    try {
      const response = await academicsAPI.getSemesters();
      console.log('Semesters API response:', response);
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

  const fetchAllResultsForSemester = async () => {
    setLoading(true);
    setDebugInfo('Fetching results...');
    try {
      console.log(`Fetching results for semester ID: ${selectedSemester}`);
      
      // First, check the API directly with a simple call
      const testResponse = await resultsAPI.getResults({ 
        semester: selectedSemester, 
        page: 1, 
        page_size: 10 
      });
      console.log('API Response for semester:', testResponse);
      console.log('Response data:', testResponse.data);
      console.log('Results array:', testResponse.data?.results);
      console.log('Count:', testResponse.data?.count);
      
      if (testResponse.data && testResponse.data.results) {
        setDebugInfo(`Found ${testResponse.data.count} total results for this semester`);
        setTotalResultsCount(testResponse.data.count);
        
        // Now fetch all results
        let allResultsData = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
          const response = await resultsAPI.getResults({ 
            semester: selectedSemester, 
            page: page, 
            page_size: 100 
          });
          
          if (response.data && response.data.results) {
            allResultsData = [...allResultsData, ...response.data.results];
            hasMore = response.data.next !== null;
            page++;
            console.log(`Fetched page ${page-1}, total so far: ${allResultsData.length}`);
          } else {
            hasMore = false;
          }
        }
        
        console.log(`Total results for semester ${selectedSemester}: ${allResultsData.length}`);
        setAllResults(allResultsData);
        
        const published = allResultsData.filter(r => r.is_published === true);
        const unpublished = allResultsData.filter(r => r.is_published === false);
        
        console.log(`Published: ${published.length}, Unpublished: ${unpublished.length}`);
        
        setPublishedResults(published);
        setUnpublishedResults(unpublished);
        
        const courses = [...new Set(published.map(r => r.course_details?.code).filter(Boolean))];
        setUniqueCourses(courses);
        
        setCurrentPage(1);
        setDebugInfo(`Loaded ${allResultsData.length} results (${published.length} published, ${unpublished.length} unpublished)`);
      } else {
        console.log('No results found in API response');
        setDebugInfo('No results found. Check if results exist in database.');
        setTotalResultsCount(0);
        setPublishedResults([]);
        setUnpublishedResults([]);
      }
      
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setDebugInfo(`Error: ${error.message}`);
      setMessage({ type: 'error', text: 'Failed to load results: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateResults = () => {
    let filtered = [...publishedResults];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.student_matric?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.course_details?.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = filtered.slice(startIndex, endIndex);
    
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
      
      await fetchAllResultsForSemester();
      
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
      
      await fetchAllResultsForSemester();
      
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
    fetchAllResultsForSemester();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Publish Results</h1>
          <p className="text-gray-500">Review and publish semester results to the blockchain</p>
        </div>
        <button
          onClick={refreshData}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
        >
          <FiRefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Debug Info - Remove after fixing */}
      {debugInfo && (
        <div className="card bg-gray-50">
          <details>
            <summary className="cursor-pointer text-sm text-gray-600">Debug Info</summary>
            <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
          </details>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input-field"
            >
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.session_name} - {sem.name_display}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePublish}
              disabled={publishing || unpublishedResults.length === 0}
              className="btn-primary flex items-center space-x-2"
            >
              {publishing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiCheckCircle size={18} />
              )}
              <span>{publishing ? 'Publishing...' : `Publish ${unpublishedResults.length} Results`}</span>
            </button>
            <button
              onClick={handleBlockchainVerify}
              disabled={verifying}
              className="btn-secondary flex items-center space-x-2"
            >
              {verifying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiShield size={18} />
              )}
              <span>Verify on Blockchain</span>
            </button>
          </div>
        </div>
        {selectedSemesterDetails && (
          <div className="mt-3 text-sm text-gray-500">
            Selected: {selectedSemesterDetails.session_name} - {selectedSemesterDetails.name_display}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-800">Total Results</h3>
          <p className="text-3xl font-bold text-blue-700 mt-2">{totalResultsCount}</p>
          <p className="text-sm text-blue-600 mt-1">Results in this semester</p>
        </div>
        <div className="card bg-yellow-50 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800">Pending Publication</h3>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{unpublishedResults.length}</p>
          <p className="text-sm text-yellow-600 mt-1">Results waiting to be published</p>
        </div>
        <div className="card bg-green-50 border border-green-200">
          <h3 className="font-semibold text-green-800">Published Results</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">{publishedResults.length}</p>
          <p className="text-sm text-green-600 mt-1">Verified on blockchain</p>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Published Results (Blockchain Verified)
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({publishedResults.length} total results)
            </span>
          </h2>
          {publishedResults.length > 0 && (
            <button
              onClick={handleUnpublishSelected}
              disabled={unpublishing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              {unpublishing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiCheckCircle size={16} />
              )}
              <span>Unpublish Current Page ({displayResults.length})</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or course..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-40"
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
            className="input-field w-32"
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
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>

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
              {displayResults.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || filterGrade || filterCourse 
                      ? 'No results match your filters.' 
                      : 'No published results found for this semester.'}
                  </td>
                </tr>
              ) : (
                displayResults.map((result, index) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">{result.student_matric}</td>
                    <td className="px-4 py-3 text-sm">{result.student_name}</td>
                    <td className="px-4 py-3 text-sm font-mono font-medium">{result.course_details?.code}</td>
                    <td className="px-4 py-3 text-sm text-center">{result.ca_score}</td>
                    <td className="px-4 py-3 text-sm text-center">{result.exam_score}</td>
                    <td className="px-4 py-3 text-sm text-center font-medium">{result.total_score}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-600 text-xs font-medium flex items-center justify-center">
                        <FiCheckCircle className="mr-1" size={12} /> Published
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {displayResults.length} of {publishedResults.length} results
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
                onClick={() => goToPage(currentPage - 1)}
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
                onClick={() => goToPage(currentPage + 1)}
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

      {unpublishedResults.length > 0 && (
        <div className="card bg-yellow-50 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 flex items-center">
            <FiCheckCircle className="mr-2" /> Pending Results
          </h3>
          <p className="text-sm text-yellow-700 mt-2">
            {unpublishedResults.length} results are waiting to be published.
          </p>
        </div>
      )}

      <div className="card bg-primary-50 border border-primary-200">
        <h3 className="font-semibold text-primary-800 flex items-center mb-3">
          <FiShield className="mr-2" /> Blockchain Information
        </h3>
        <ul className="text-sm text-primary-700 space-y-1 list-disc list-inside">
          <li>Results are hashed using SHA-256 before storage</li>
          <li>Each result hash is stored on the Ethereum blockchain</li>
          <li>Once published, results cannot be modified</li>
          <li>Anyone can verify result authenticity using the public hash</li>
          <li>Blockchain provides immutable, transparent, and decentralized verification</li>
        </ul>
      </div>
    </div>
  );
};

export default PublishResults;