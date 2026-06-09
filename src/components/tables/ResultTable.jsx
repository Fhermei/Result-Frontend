import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch, FiCheckCircle } from 'react-icons/fi';

const ResultTable = ({ results, onEdit, onDelete, onView, loading, showActions = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.student_matric?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.course_details?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.student_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !filterGrade || result.grade === filterGrade;
    
    return matchesSearch && matchesGrade;
  });

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

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Matric No</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Student Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">CA</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Exam</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Total</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Grade</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Status</th>
              {showActions && <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredResults.map((result, index) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-mono">{result.student_matric}</td>
                <td className="px-4 py-3 text-sm">{result.student_name}</td>
                <td className="px-4 py-3 text-sm">{result.course_details?.code}</td>
                <td className="px-4 py-3 text-sm text-center">{result.ca_score}</td>
                <td className="px-4 py-3 text-sm text-center">{result.exam_score}</td>
                <td className="px-4 py-3 text-sm text-center font-medium">{result.total_score}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {result.blockchain_hash ? (
                    <span className="inline-flex items-center text-green-600 text-xs">
                      <FiCheckCircle className="mr-1" size={12} /> Verified
                    </span>
                  ) : result.is_published ? (
                    <span className="text-yellow-600 text-xs">Published</span>
                  ) : (
                    <span className="text-gray-400 text-xs">Draft</span>
                  )}
                </td>
                {showActions && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onView && onView(result)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="View"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit && onEdit(result)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(result)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">No results found</div>
      )}
    </div>
  );
};

export default ResultTable;