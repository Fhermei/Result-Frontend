import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';

const CourseTable = ({ courses, onEdit, onDelete, onView, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || course.department_name === filterDepartment;
    const matchesLevel = !filterLevel || course.level_value === parseInt(filterLevel);
    
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const getUniqueDepartments = () => {
    const depts = new Set(courses.map(c => c.department_name).filter(Boolean));
    return Array.from(depts);
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
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
              placeholder="Search by course code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Departments</option>
          {getUniqueDepartments().map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="input-field w-32"
        >
          <option value="">All Levels</option>
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Course Title</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Credit Unit</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Level</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCourses.map((course, index) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-mono font-medium">{course.code}</td>
                <td className="px-4 py-3 text-sm">{course.title}</td>
                <td className="px-4 py-3 text-sm text-center">{course.credit_unit}</td>
                <td className="px-4 py-3 text-sm">{course.department_name}</td>
                <td className="px-4 py-3 text-sm text-center">{course.level_value}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => onView && onView(course)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="View"
                    >
                      <FiEye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(course)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Edit"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(course)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-8 text-gray-500">No courses found</div>
      )}
    </div>
  );
};

export default CourseTable;