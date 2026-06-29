import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultsAPI } from '../../api/results';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiSave, FiRefreshCw, FiEdit2, FiLock } from 'react-icons/fi';

const EditResults = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const courseId = searchParams.get('course');
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchResults();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getMyCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await resultsAPI.getResults({ course: selectedCourse });
      let resultsData = [];
      if (response.data && response.data.results) {
        resultsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        resultsData = response.data;
      }
      setResults(resultsData);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      setMessage({ type: 'error', text: 'Failed to load results' });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (index, field, value) => {
    const result = results[index];
    if (result.is_published) {
      setMessage({ type: 'warning', text: 'Published results cannot be edited.' });
      return;
    }
    
    const updatedResults = [...results];
    const numValue = parseFloat(value) || 0;
    updatedResults[index][field] = numValue;
    
    const ca = updatedResults[index].ca_score || 0;
    const exam = updatedResults[index].exam_score || 0;
    const total = ca + exam;
    updatedResults[index].total_score = total;
    
    let grade = 'F';
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 45) grade = 'D';
    else if (total >= 40) grade = 'E';
    updatedResults[index].grade = grade;
    
    const gradePoints = { 'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0 };
    updatedResults[index].grade_point = gradePoints[grade];
    
    setResults(updatedResults);
  };

  const handleSaveAll = async () => {
    const editableResults = results.filter(r => !r.is_published);
    if (editableResults.length === 0) {
      setMessage({ type: 'warning', text: 'No editable results to save' });
      return;
    }
    
    setSaving(true);
    let saved = 0;
    let errors = 0;
    
    try {
      for (const result of editableResults) {
        try {
          await resultsAPI.updateResult(result.id, {
            ca_score: result.ca_score,
            exam_score: result.exam_score,
          });
          saved++;
        } catch {
          errors++;
        }
      }
      
      setMessage({ 
        type: errors > 0 ? 'warning' : 'success', 
        text: errors > 0 
          ? `Saved ${saved} results, failed to save ${errors} results` 
          : `Successfully saved ${saved} results` 
      });
      
      fetchResults();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save results' });
    } finally {
      setSaving(false);
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

  const hasPublishedResults = results.some(r => r.is_published);
  const editableCount = results.filter(r => !r.is_published).length;

  if (loading && !results.length) return <LoadingSpinner />;

  const selectedCourseDetails = courses.find(c => c.id === parseInt(selectedCourse));

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Edit Results</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Modify student scores for your courses</p>
        </div>
        {selectedCourse && results.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving || editableCount === 0}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FiSave size={12} className="sm:size-4" />
            )}
            <span>{saving ? 'Saving...' : `Save ${editableCount}`}</span>
          </button>
        )}
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Course Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">-- Select Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title} ({course.credit_unit} units)
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && selectedCourseDetails && (
          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-600">
              <span className="font-medium">Course:</span> {selectedCourseDetails.code} - {selectedCourseDetails.title}
              <span className="ml-2 sm:ml-4"><span className="font-medium">Units:</span> {selectedCourseDetails.credit_unit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {selectedCourse && results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
          {/* Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
            <p className="text-[10px] sm:text-sm text-gray-500">
              {results.length} total ({editableCount} editable, {results.length - editableCount} published)
            </p>
            {hasPublishedResults && (
              <span className="inline-flex items-center text-[8px] sm:text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                <FiLock size={10} className="sm:size-3 mr-1" /> Published locked
              </span>
            )}
          </div>

          {hasPublishedResults && (
            <div className="mb-3 p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-[9px] sm:text-sm text-yellow-700">Published results cannot be edited.</p>
            </div>
          )}

          {/* ─── DESKTOP TABLE ──────────────────────────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Matric</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">CA (0-40)</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Exam (0-70)</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2 text-sm font-mono">{result.student_matric}</td>
                    <td className="px-3 py-2 text-sm">{result.student_name}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={result.ca_score}
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className={`w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${result.is_published ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={result.is_published}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        value={result.exam_score}
                        onChange={(e) => handleScoreChange(index, 'exam_score', e.target.value)}
                        className={`w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none ${result.is_published ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={result.is_published}
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-center font-medium">{result.total_score}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {result.is_published ? (
                        <span className="text-[10px] text-green-600 flex items-center justify-center">
                          <FiLock size={10} className="mr-1" /> Published
                        </span>
                      ) : (
                        <span className="text-[10px] text-yellow-600 flex items-center justify-center">
                          <FiEdit2 size={10} className="mr-1" /> Draft
                        </span>
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
              <div key={result.id} className={`p-3 rounded-lg border ${result.is_published ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[8px] text-gray-400">#{result.student_matric}</span>
                      {result.is_published && <FiLock size={8} className="text-green-600" />}
                    </div>
                    <p className="text-[10px] font-medium text-gray-800 truncate">{result.student_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[8px] text-gray-500">CA:</span>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={result.ca_score}
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className={`w-12 px-1 py-0.5 border border-gray-200 rounded text-[8px] text-center ${result.is_published ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={result.is_published}
                      />
                      <span className="text-[8px] text-gray-500">Exam:</span>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        value={result.exam_score}
                        onChange={(e) => handleScoreChange(index, 'exam_score', e.target.value)}
                        className={`w-12 px-1 py-0.5 border border-gray-200 rounded text-[8px] text-center ${result.is_published ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={result.is_published}
                      />
                      <span className="text-[8px] font-medium text-gray-700">Total: {result.total_score}</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${getGradeColor(result.grade)}`}>
                        {result.grade}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {result.is_published ? (
                      <span className="text-[8px] text-green-600">Published</span>
                    ) : (
                      <span className="text-[8px] text-yellow-600">Draft</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && results.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <FiEdit2 className="mx-auto text-gray-300 text-2xl sm:text-3xl mb-2" />
          <p className="text-sm text-gray-500">No results found for this course.</p>
        </div>
      )}
    </div>
  );
};

export default EditResults;