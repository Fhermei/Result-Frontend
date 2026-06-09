import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { coursesAPI } from '../../api/courses';
import { resultsAPI } from '../../api/results';
import { academicsAPI } from '../../api/academics';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { FiUpload } from 'react-icons/fi';

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
      
      // Set current semester as default
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
      // Get course details
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      if (course) {
        setCourseDetails(course);
        
        // Get students enrolled in this course using the new endpoint
        const studentsRes = await coursesAPI.getCourseStudents(selectedCourse);
        const enrolledStudents = studentsRes.data || [];
        
        setStudents(enrolledStudents);
        
        // Initialize results array
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
    
    // Calculate total and grade
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
      
      // Refresh the students list to show updated results
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
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'E': 'bg-red-100 text-red-800',
      'F': 'bg-gray-100 text-gray-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !results.length) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload Results</h1>
        <p className="text-gray-500">Enter scores for your students</p>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Selection Controls */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="input-field"
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
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Course:</span> {courseDetails.code} - {courseDetails.title}
              <span className="ml-4"><span className="font-medium">Credit Units:</span> {courseDetails.credit_unit}</span>
            </p>
          </div>
        )}
      </div>

      {/* Results Table */}
      {selectedCourse && students.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Student Scores</h2>
            <button
              onClick={handleBulkUpload}
              disabled={submitting}
              className="btn-primary flex items-center space-x-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <FiUpload size={18} />
              )}
              <span>{submitting ? 'Uploading...' : 'Upload All Results'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Matric No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CA Score (0-40)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Exam Score (0-70)</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={result.student_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono">{result.matric_no}</td>
                    <td className="px-4 py-3 text-sm">{result.student_name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="0.5"
                        value={result.ca_score}
                        onChange={(e) => handleScoreChange(index, 'ca_score', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500"
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
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {result.total || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result.grade && (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCourse && students.length === 0 && !loading && (
        <div className="card text-center py-8 text-gray-500">
          No students enrolled in this course yet.
          <br />
          <span className="text-sm">Students need to register for this course first.</span>
        </div>
      )}
    </div>
  );
};

export default UploadResults;