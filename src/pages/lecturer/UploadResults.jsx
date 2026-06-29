import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../../api/courses';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiUpload, FiBookOpen, FiUser, FiCalendar } from 'react-icons/fi';

const UploadResults = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const courseId = searchParams.get('course');
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [searchParams, courses]);

  useEffect(() => {
    if (selectedCourse && selectedSemester) {
      fetchStudentsForCourse();
    }
  }, [selectedCourse, selectedSemester]);

  const fetchData = async () => {
    try {
      const [coursesRes, semestersRes] = await Promise.all([
        coursesAPI.getMyCourses(),
        academicsAPI.getSemesters(),
      ]);
      
      setCourses(coursesRes.data || []);
      setSemesters(semestersRes.data || []);
      
      const currentSem = (semestersRes.data || []).find(s => s.is_current);
      if (currentSem) {
        setSelectedSemester(currentSem.id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsForCourse = async () => {
    setLoading(true);
    try {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      if (course) {
        setCourseDetails(course);
        
        // Get students enrolled in this course
        const studentsRes = await coursesAPI.getCourseStudents(selectedCourse);
        
        // Handle different response formats properly
        let enrolledStudents = [];
        
        if (studentsRes && studentsRes.data) {
          if (Array.isArray(studentsRes.data)) {
            enrolledStudents = studentsRes.data;
          } else if (studentsRes.data.results && Array.isArray(studentsRes.data.results)) {
            enrolledStudents = studentsRes.data.results;
          } else if (studentsRes.data.data && Array.isArray(studentsRes.data.data)) {
            enrolledStudents = studentsRes.data.data;
          }
        } else if (Array.isArray(studentsRes)) {
          enrolledStudents = studentsRes;
        }
        
        console.log('Enrolled students:', enrolledStudents);
        
        setStudents(enrolledStudents);
        
        const initialResults = enrolledStudents.map(student => ({
          student_id: student.id,
          student_name: student.full_name || student.user_details?.full_name || `Student ${student.id}`,
          matric_no: student.matric_no || 'N/A',
          ca_score: '',
          exam_score: '',
          total: '',
          grade: '',
        }));
        setResults(initialResults);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setMessage({ type: 'error', text: 'Failed to load students for this course' });
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (index, field, value) => {
    const updatedResults = [...results];
    const numValue = parseFloat(value) || 0;
    updatedResults[index][field] = numValue;
    
    const ca = updatedResults[index].ca_score || 0;
    const exam = updatedResults[index].exam_score || 0;
    const total = ca + exam;
    updatedResults[index].total = total;
    
    let grade = 'F';
    if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';
    else if (total >= 45) grade = 'D';
    else if (total >= 40) grade = 'E';
    updatedResults[index].grade = grade;
    
    setResults(updatedResults);
  };

  const handleBulkUpload = async () => {
    if (!selectedCourse) {
      setMessage({ type: 'error', text: 'Please select a course' });
      return;
    }
    
    if (!selectedSemester) {
      setMessage({ type: 'error', text: 'Please select a semester' });
      return;
    }
    
    const validResults = results.filter(r => r.ca_score && r.exam_score);
    if (validResults.length === 0) {
      setMessage({ type: 'error', text: 'No valid results to upload. Please enter CA and Exam scores.' });
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        semester_id: parseInt(selectedSemester),
        results: validResults.map(r => ({
          student_id: parseInt(r.student_id),
          course_id: parseInt(selectedCourse),
          ca_score: parseFloat(r.ca_score),
          exam_score: parseFloat(r.exam_score),
        })),
      };
      
      console.log('Upload payload:', payload);
      
      const response = await resultsAPI.bulkUpload(payload);
      console.log('Upload response:', response.data);
      
      if (response.data.errors && response.data.errors.length > 0) {
        setMessage({ type: 'warning', text: `${response.data.message} Errors: ${response.data.errors.join(', ')}` });
      } else {
        setMessage({ type: 'success', text: response.data.message });
      }
      
      fetchStudentsForCourse();
      
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || error.response?.data?.message || 'Failed to upload results' 
      });
    } finally {
      setSubmitting(false);
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

  if (loading && !results.length) return <LoadingSpinner />;

  const validResultsCount = results.filter(r => r.ca_score && r.exam_score).length;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-base sm:text-2xl font-bold text-gray-800">Upload Results</h1>
        <p className="text-[10px] sm:text-sm text-gray-500">Enter scores for your students</p>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Selection Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Select Course</label>
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
          
          <div>
            <label className="block text-[10px] sm:text-sm font-medium text-gray-700 mb-1">Select Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">-- Select Semester --</option>
              {semesters.map(sem => (
                <option key={sem.id} value={sem.id}>
                  {sem.session_name} - {sem.name_display}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {courseDetails && (
          <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-[10px] sm:text-sm text-gray-600">
              <span className="font-medium">Course:</span> {courseDetails.code} - {courseDetails.title}
              <span className="ml-2 sm:ml-4"><span className="font-medium">Credit Units:</span> {courseDetails.credit_unit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {selectedCourse && students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-lg font-semibold text-gray-800">
              Student Scores
              <span className="text-[10px] sm:text-sm font-normal text-gray-500 ml-1">
                ({validResultsCount} of {results.length} have scores)
              </span>
            </h2>
            <button
              onClick={handleBulkUpload}
              disabled={submitting}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiUpload size={12} className="sm:size-4" />
              )}
              <span>{submitting ? 'Uploading...' : `Upload ${validResultsCount}`}</span>
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">S/N</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Matric</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">CA (0-40)</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Exam (0-70)</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((result, index) => (
                  <tr key={result.student_id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2 text-sm font-mono">{result.matric_no}</td>
                    <td className="px-3 py-2 text-sm">{result.student_name}</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={result.ca_score}
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                        className="w-16 px-2 py-1 border border-gray-200 rounded text-xs text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-center font-medium">
                      {result.total || '-'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {result.grade && (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-2 max-h-[500px] overflow-y-auto">
            {results.map((result, index) => (
              <div key={result.student_id} className="bg-gray-50 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[8px] text-gray-400">#{result.matric_no}</span>
                    </div>
                    <p className="text-[9px] font-medium text-gray-800 truncate">{result.student_name}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-[8px] text-gray-500">CA:</span>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={result.ca_score}
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className="w-12 px-1 py-0.5 border border-gray-200 rounded text-[8px] text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                      <span className="text-[8px] text-gray-500">Exam:</span>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="0.5"
                        value={result.exam_score}
                        onChange={(e) => handleScoreChange(index, 'exam_score', e.target.value)}
                        className="w-12 px-1 py-0.5 border border-gray-200 rounded text-[8px] text-center focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      />
                      <span className="text-[8px] font-medium text-gray-700">Total: {result.total || '-'}</span>
                      {result.grade && (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {validResultsCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[8px] sm:text-xs text-gray-400">
                {validResultsCount} of {results.length} students have complete scores
              </p>
            </div>
          )}
        </div>
      )}

      {selectedCourse && students.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
          <FiUser className="mx-auto text-gray-300 text-2xl sm:text-3xl mb-2" />
          <p className="text-sm text-gray-500">No students enrolled in this course yet.</p>
          <p className="text-xs text-gray-400 mt-1">Students need to register for this course first.</p>
        </div>
      )}
    </div>
  );
};

export default UploadResults;