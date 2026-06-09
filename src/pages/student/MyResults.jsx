import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiFilter, FiDownload, FiEye, FiCalendar } from 'react-icons/fi';

const MyResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [gpaData, setGpaData] = useState({});
  const [filteredResults, setFilteredResults] = useState([]);

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
      
      setResults(resultsRes.data);
      setSemesters(semestersRes.data);
      
      // Create GPA lookup
      const gpaMap = {};
      gpaRes.data.forEach(gpa => {
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
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-gray-100 text-gray-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
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

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Results</h1>
          <p className="text-gray-500">View your academic performance across all semesters</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <FiDownload size={18} />
          <span>Export Results</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFilter className="inline mr-1" size={14} /> Filter by Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
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
          <button
            onClick={() => setSelectedSemester('')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Results by Semester */}
      {Object.entries(groupedResults).length === 0 ? (
        <Alert type="info" message="No results found for the selected filter" />
      ) : (
        Object.entries(groupedResults).map(([semesterId, semesterResults]) => {
          const semester = semesterResults[0]?.semester_details;
          const semesterGPA = calculateSemesterGPA(semesterResults);
          const savedGPA = gpaData[semesterId];
          
          return (
            <div key={semesterId} className="card">
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {semester?.session_name} - {semester?.name_display}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {semesterResults.length} Courses
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Semester GPA</p>
                  <p className="text-2xl font-bold text-primary-600">{semesterGPA}</p>
                  {savedGPA && (
                    <p className="text-xs text-gray-500">
                      Class: {savedGPA.class_degree}
                    </p>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course Code</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course Title</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Credit Unit</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CA Score</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Exam Score</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">GP</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semesterResults.map((result) => (
                      <tr key={result.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {result.course_details?.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result.course_details?.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.course_details?.credit_unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.ca_score}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.exam_score}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium">
                          {result.total_score}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${getGradeColor(result.grade)}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {result.grade_point}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {result.blockchain_hash ? (
                            <span className="inline-flex items-center text-green-600 text-xs">
                              <FiEye className="mr-1" size={12} /> Verified
                            </span>
                          ) : result.is_published ? (
                            <span className="text-yellow-600 text-xs">Published</span>
                          ) : (
                            <span className="text-gray-400 text-xs">Draft</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-4 py-3 text-right font-semibold">Total:</td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {semesterResults.reduce((sum, r) => sum + (r.course_details?.credit_unit || 0), 0)}
                      </td>
                      <td colSpan="2"></td>
                      <td className="px-4 py-3 text-center font-semibold">
                        GPA: {semesterGPA}
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default MyResults;