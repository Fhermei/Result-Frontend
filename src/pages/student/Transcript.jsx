import React, { useState, useEffect } from 'react';
import { resultsAPI } from '../../api/results';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDownload, FiPrinter, FiFileText, FiAward, FiUser, FiCalendar, FiBookOpen } from 'react-icons/fi';

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
  if (!transcript) return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <FiFileText className="mx-auto text-gray-300 text-3xl sm:text-5xl mb-3" />
      <p className="text-sm text-gray-500">No transcript data available</p>
    </div>
  );

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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 no-print">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Academic Transcript</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Official academic record</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 hover:border-green-500 text-gray-600 hover:text-green-600 text-[10px] sm:text-sm font-medium rounded-lg transition flex-1 sm:flex-none"
          >
            <FiPrinter size={12} className="sm:size-18" />
            <span>Print</span>
          </button>
          <button className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition flex-1 sm:flex-none">
            <FiDownload size={12} className="sm:size-18" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6 print:shadow-none print:border-0" id="transcript-content">
        {/* University Header */}
        <div className="text-center mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-gray-200">
          <h2 className="text-base sm:text-2xl font-bold text-gray-800">OSUN STATE UNIVERSITY</h2>
          <p className="text-[10px] sm:text-sm text-gray-600">Osogbo, Osun State, Nigeria</p>
          <p className="text-[10px] sm:text-sm text-gray-600">Faculty of {transcript.faculty}</p>
          <h3 className="text-sm sm:text-xl font-semibold text-gray-800 mt-2 sm:mt-4">ACADEMIC TRANSCRIPT</h3>
        </div>

        {/* Student Information - Mobile Friendly */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Student Name</p>
            <p className="text-[10px] sm:text-base font-semibold text-gray-800 truncate">{transcript.student_name}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Matric No</p>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate">{transcript.matric_no}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Department</p>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate">{transcript.department}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Faculty</p>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-800 truncate">{transcript.faculty}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Admission</p>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{transcript.admission_year}</p>
          </div>
          <div>
            <p className="text-[8px] sm:text-xs text-gray-500 uppercase tracking-wider">Graduation</p>
            <p className="text-[10px] sm:text-sm font-semibold text-gray-800">{transcript.graduation_year || 'In Progress'}</p>
          </div>
        </div>

        {/* Semester Results */}
        {transcript.semesters?.map((semester, idx) => {
          const semesterCourses = coursesBySemester[semester.semester] || [];
          
          return (
            <div key={idx} className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-lg font-semibold bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                {semester.semester_details?.session_name} - {semester.semester_details?.name_display}
              </h3>
              
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto mt-2 sm:mt-3">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Code</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-gray-500 uppercase">Title</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Credits</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Score</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">Grade</th>
                      <th className="px-3 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {semesterCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-2 text-xs font-mono text-gray-700">{course.course_details?.code}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{course.course_details?.title}</td>
                        <td className="px-3 py-2 text-xs text-center text-gray-600">{course.course_details?.credit_unit}</td>
                        <td className="px-3 py-2 text-xs text-center font-medium text-gray-700">{course.total_score}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            course.grade === 'A' ? 'bg-green-100 text-green-700' :
                            course.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            course.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {course.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-center text-gray-600">{course.grade_point}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="2" className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Semester GPA:</td>
                      <td colSpan="4" className="px-3 py-2 text-xs font-semibold text-green-600">{semester.gpa}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-1.5 mt-2">
                {semesterCourses.map((course) => (
                  <div key={course.id} className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[8px] font-mono font-medium text-gray-700">{course.course_details?.code}</span>
                          <span className="text-[8px] text-gray-400">•</span>
                          <span className="text-[8px] text-gray-500">{course.course_details?.credit_unit} cr</span>
                        </div>
                        <p className="text-[9px] text-gray-600 truncate">{course.course_details?.title}</p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[8px] font-medium text-gray-700">Score: {course.total_score}</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-medium ${
                            course.grade === 'A' ? 'bg-green-100 text-green-700' :
                            course.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            course.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {course.grade}
                          </span>
                          <span className="text-[8px] text-gray-400">{course.grade_point} GP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 rounded-lg p-2 border-t-2 border-gray-200">
                  <p className="text-[9px] font-semibold text-green-600 text-right">Semester GPA: {semester.gpa}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* CGPA Summary */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-5 bg-green-50 rounded-xl border border-green-200">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[8px] sm:text-xs text-gray-600 uppercase tracking-wider">Cumulative GPA</p>
              <p className="text-lg sm:text-3xl font-bold text-green-600">{transcript.cgpa}</p>
            </div>
            <div>
              <p className="text-[8px] sm:text-xs text-gray-600 uppercase tracking-wider">Class of Degree</p>
              <p className="text-sm sm:text-xl font-semibold text-green-600">{transcript.class_degree}</p>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-green-200">
            <p className="text-[8px] sm:text-sm text-gray-600">
              Total Quality Points: {transcript.total_quality_points} | Total Credit Units: {transcript.total_credits}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: none !important; padding: 0 !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
};

export default Transcript;