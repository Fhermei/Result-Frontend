import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiFilter, FiDownload, FiEye, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const MyResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [gpaData, setGpaData] = useState({});
  const [filteredResults, setFilteredResults] = useState([]);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterResults();
  }, [selectedSemester, results]);

  const fetchData = async () => {
    try {
      const [resultsRes, semestersRes, gpaRes] = await Promise.all([
        resultsAPI.getMyResults(),
        academicsAPI.getSemesters(),
        resultsAPI.getGPA(),
      ]);
      
      setResults(resultsRes.data || []);
      setSemesters(semestersRes.data || []);
      
      const gpaMap = {};
      (gpaRes.data || []).forEach(gpa => {
        gpaMap[gpa.semester] = gpa;
      });
      setGpaData(gpaMap);
      
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    if (!selectedSemester) {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter(r => r.semester === parseInt(selectedSemester)));
    }
  };

  const calculateSemesterGPA = (semesterResults) => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesterResults.forEach(result => {
      const creditUnit = result.course_details?.credit_unit || 0;
      const gradePoint = result.grade_point || 0;
      totalPoints += creditUnit * gradePoint;
      totalCredits += creditUnit;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
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

  const toggleSemester = (semesterId) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [semesterId]: !prev[semesterId]
    }));
  };

  // Group results by semester
  const groupedResults = filteredResults.reduce((groups, result) => {
    const semesterId = result.semester;
    if (!groups[semesterId]) {
      groups[semesterId] = [];
    }
    groups[semesterId].push(result);
    return groups;
  }, {});

  // Sort semesters by ID (most recent first)
  const sortedSemesterIds = Object.keys(groupedResults).sort((a, b) => parseInt(b) - parseInt(a));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">My Results</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">View your academic performance across all semesters</p>
        </div>
        <button className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto">
          <FiDownload size={12} className="sm:size-18" />
          <span>Export</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">
              <FiFilter className="inline mr-1" size={12} /> Filter by Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
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
          {selectedSemester && (
            <button
              onClick={() => setSelectedSemester('')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg text-[10px] sm:text-sm hover:bg-gray-50 transition whitespace-nowrap"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Results by Semester */}
      {Object.entries(groupedResults).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <p className="text-sm text-gray-500">No results found for the selected filter</p>
        </div>
      ) : (
        sortedSemesterIds.map((semesterId) => {
          const semesterResults = groupedResults[semesterId];
          const semester = semesterResults[0]?.semester_details;
          const semesterGPA = calculateSemesterGPA(semesterResults);
          const savedGPA = gpaData[semesterId];
          const isExpanded = expandedSemesters[semesterId] !== false; // Default expanded
          
          return (
            <div key={semesterId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Semester Header - Clickable to toggle */}
              <div 
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 sm:p-5 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100"
                onClick={() => toggleSemester(semesterId)}
              >
                <div className="flex items-center space-x-3">
                  <FiCalendar className="text-green-500 text-sm sm:text-xl flex-shrink-0" />
                  <div>
                    <h2 className="text-xs sm:text-xl font-semibold text-gray-800">
                      {semester?.session_name} - {semester?.name_display}
                    </h2>
                    <p className="text-[8px] sm:text-sm text-gray-500">
                      {semesterResults.length} Courses
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="text-right">
                    <p className="text-[8px] sm:text-sm text-gray-500">Semester GPA</p>
                    <p className="text-sm sm:text-2xl font-bold text-green-600">{semesterGPA}</p>
                    {savedGPA && (
                      <p className="text-[8px] sm:text-xs text-gray-500">
                        {savedGPA.class_degree}
                      </p>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? <FiChevronUp size={16} className="sm:size-20" /> : <FiChevronDown size={16} className="sm:size-20" />}
                  </div>
                </div>
              </div>

              {/* Semester Results - Collapsible */}
              {isExpanded && (
                <div className="p-3 sm:p-5">
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Code</th>
                          <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Title</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Credits</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">CA</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Exam</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Total</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">GP</th>
                          <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {semesterResults.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-50 transition">
                            <td className="px-3 py-2 text-xs font-mono font-medium text-gray-800">{result.course_details?.code}</td>
                            <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[120px]">{result.course_details?.title}</td>
                            <td className="px-3 py-2 text-xs text-center text-gray-600">{result.course_details?.credit_unit}</td>
                            <td className="px-3 py-2 text-xs text-center text-gray-600">{result.ca_score}</td>
                            <td className="px-3 py-2 text-xs text-center text-gray-600">{result.exam_score}</td>
                            <td className="px-3 py-2 text-xs text-center font-medium text-gray-700">{result.total_score}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-center text-gray-600">{result.grade_point}</td>
                            <td className="px-3 py-2 text-center">
                              {result.blockchain_hash ? (
                                <span className="inline-flex items-center text-green-600 text-[10px]">
                                  <FiEye className="mr-1" size={10} /> Verified
                                </span>
                              ) : result.is_published ? (
                                <span className="text-yellow-600 text-[10px]">Published</span>
                              ) : (
                                <span className="text-gray-400 text-[10px]">Draft</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="2" className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Total:</td>
                          <td className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                            {semesterResults.reduce((sum, r) => sum + (r.course_details?.credit_unit || 0), 0)}
                          </td>
                          <td colSpan="2"></td>
                          <td className="px-3 py-2 text-center text-xs font-semibold text-green-600">
                            GPA: {semesterGPA}
                          </td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-2">
                    {semesterResults.map((result) => (
                      <div key={result.id} className="bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[8px] font-mono font-medium text-gray-700">{result.course_details?.code}</span>
                              <span className="text-[8px] text-gray-400">•</span>
                              <span className="text-[8px] text-gray-500">{result.course_details?.credit_unit} cr</span>
                            </div>
                            <p className="text-[9px] text-gray-600 truncate">{result.course_details?.title}</p>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span className="text-[8px] text-gray-500">CA: {result.ca_score}</span>
                              <span className="text-[8px] text-gray-500">Exam: {result.exam_score}</span>
                              <span className="text-[8px] font-medium text-gray-700">Total: {result.total_score}</span>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                              <span className="text-[8px] text-gray-400">{result.grade_point} GP</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-1">
                            {result.blockchain_hash ? (
                              <span className="text-green-600 text-[8px] flex items-center">
                                <FiEye size={8} className="mr-0.5" /> ✓
                              </span>
                            ) : result.is_published ? (
                              <span className="text-yellow-600 text-[8px]">Pub</span>
                            ) : (
                              <span className="text-gray-400 text-[8px]">Draft</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyResults;