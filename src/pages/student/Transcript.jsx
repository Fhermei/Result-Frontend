import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiPrinter } from 'react-icons/fi';

const Transcript = () => {
  const [loading, setLoading] = useState(true);
  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    fetchTranscript();
  }, []);

  const fetchTranscript = async () => {
    try {
      const response = await resultsAPI.getMyTranscript();
      setTranscript(response.data);
    } catch (error) {
      console.error('Failed to fetch transcript:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner />;
  if (!transcript) return <div className="text-center py-10">No transcript data available</div>;

  // Group courses by semester
  const coursesBySemester = {};
  transcript.courses?.forEach(course => {
    const semesterKey = course.semester;
    if (!coursesBySemester[semesterKey]) {
      coursesBySemester[semesterKey] = [];
    }
    coursesBySemester[semesterKey].push(course);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Transcript</h1>
          <p className="text-gray-500">Official academic record</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiPrinter size={18} />
            <span>Print</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <FiDownload size={18} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="card print-card" id="transcript-content">
        {/* Header */}
        <div className="text-center mb-8 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">OSUN STATE UNIVERSITY</h2>
          <p className="text-gray-600">Osogbo, Osun State, Nigeria</p>
          <p className="text-gray-600">Faculty of {transcript.faculty}</p>
          <h3 className="text-xl font-semibold text-gray-800 mt-4">ACADEMIC TRANSCRIPT</h3>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-semibold">{transcript.student_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Matriculation Number</p>
            <p className="font-semibold">{transcript.matric_no}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-semibold">{transcript.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Faculty</p>
            <p className="font-semibold">{transcript.faculty}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Admission Year</p>
            <p className="font-semibold">{transcript.admission_year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Graduation Year</p>
            <p className="font-semibold">{transcript.graduation_year || 'In Progress'}</p>
          </div>
        </div>

        {/* Semester Results */}
        {transcript.semesters?.map((semester, idx) => {
          const semesterCourses = coursesBySemester[semester.semester] || [];
          
          return (
            <div key={idx} className="mb-8">
              <h3 className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded">
                {semester.semester_details?.session_name} - {semester.semester_details?.name_display}
              </h3>
              <div className="overflow-x-auto mt-3">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Course Code</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Course Title</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Credit Unit</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Score</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Grade</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {semesterCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-4 py-2 text-sm">{course.course_details?.code}</td>
                        <td className="px-4 py-2 text-sm">{course.course_details?.title}</td>
                        <td className="px-4 py-2 text-sm text-center">{course.course_details?.credit_unit}</td>
                        <td className="px-4 py-2 text-sm text-center">{course.total_score}</td>
                        <td className="px-4 py-2 text-sm text-center">{course.grade}</td>
                        <td className="px-4 py-2 text-sm text-center">{course.grade_point}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-4 py-2 text-right font-semibold">Semester GPA:</td>
                      <td colSpan="4" className="px-4 py-2 font-semibold">{semester.gpa}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })}

        {/* CGPA Summary */}
        <div className="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Cumulative GPA (CGPA)</p>
              <p className="text-3xl font-bold text-primary-600">{transcript.cgpa}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class of Degree</p>
              <p className="text-xl font-semibold text-primary-600">{transcript.class_degree}</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-primary-200">
            <p className="text-sm text-gray-600">Total Quality Points: {transcript.total_quality_points} | Total Credit Units: {transcript.total_credits}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a computer-generated transcript. It is valid without signature.</p>
          <p className="mt-2">Issued on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Transcript;