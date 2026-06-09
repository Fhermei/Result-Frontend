import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resultsAPI } from '../../api/results';
import { coursesAPI } from '../../api/courses';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiSave, FiRefreshCw } from 'react-icons/fi';

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
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-gray-100 text-gray-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  const hasPublishedResults = results.some(r => r.is_published);
  const editableCount = results.filter(r => !r.is_published).length;

  if (loading && !results.length) return <LoadingSpinner />;

  const selectedCourseDetails = courses.find(c => c.id === parseInt(selectedCourse));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Edit Results</h1>
        <p className="text-gray-500">Modify student scores for your courses</p>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="card">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input-field max-w-md"
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
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Course:</span> {selectedCourseDetails.code} - {selectedCourseDetails.title}
              <span className="ml-4"><span className="font-medium">Credit Units:</span> {selectedCourseDetails.credit_unit}</span>
            </p>
          </div>
        )}

        {selectedCourse && results.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {results.length} total results ({editableCount} editable, {results.length - editableCount} published)
              </p>
              <button
                onClick={handleSaveAll}
                disabled={saving || editableCount === 0}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <FiSave size={18} />
                )}
                <span>{saving ? 'Saving...' : `Save ${editableCount} Changes`}</span>
              </button>
            </div>

            {hasPublishedResults && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                Note: Published results cannot be edited.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Matric No</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CA (0-40)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Exam (0-70)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono">{result.student_matric}</td>
                      <td className="px-4 py-3 text-sm">{result.student_name}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="40"
                          step="0.5"
                          value={result.ca_score}
                          onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                          className={`w-20 px-2 py-1 border rounded text-center ${result.is_published ? 'bg-gray-100' : ''}`}
                          disabled={result.is_published}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="70"
                          step="0.5"
                          value={result.exam_score}
                          onChange={(e) => handleScoreChange(index, 'exam_score', e.target.value)}
                          className={`w-20 px-2 py-1 border rounded text-center ${result.is_published ? 'bg-gray-100' : ''}`}
                          disabled={result.is_published}
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{result.total_score}</td>
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
          </>
        )}

        {selectedCourse && results.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No results found for this course.
          </div>
        )}
      </div>
    </div>
  );
};

export default EditResults;