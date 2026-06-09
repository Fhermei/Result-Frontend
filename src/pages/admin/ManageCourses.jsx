import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../api/courses';
import { academicsAPI } from '../../api/academics';
import { authAPI } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ManageCourses = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    credit_unit: 3,
    department: '',
    level: '',
    semester: '',
    lecturer: '',
    is_elective: false,
  });

  useEffect(() => {
    fetchCourses();
    fetchFormData();
  }, [currentPage, searchTerm, filterDepartment, filterLevel]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: 20
      };
      if (searchTerm) params.search = searchTerm;
      if (filterDepartment) params.department = filterDepartment;
      if (filterLevel) params.level = filterLevel;
      
      const response = await coursesAPI.getCourses(params);
      console.log('Courses response:', response.data);
      
      if (response.data && response.data.results) {
        setCourses(response.data.results);
        setTotalCourses(response.data.count);
        setTotalPages(Math.ceil(response.data.count / 20));
      } else if (Array.isArray(response.data)) {
        setCourses(response.data);
        setTotalCourses(response.data.length);
        setTotalPages(1);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [deptsRes, levelsRes, semestersRes, lecturersRes] = await Promise.all([
        academicsAPI.getDepartments(),
        academicsAPI.getLevels(),
        academicsAPI.getSemesters(),
        authAPI.getLecturers(),
      ]);
      
      setDepartments(deptsRes.data || []);
      setLevels(levelsRes.data || []);
      setSemesters(semestersRes.data || []);
      setLecturers(lecturersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch form data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCourse) {
        await coursesAPI.updateCourse(editingCourse.id, formData);
        setMessage({ type: 'success', text: 'Course updated successfully' });
      } else {
        await coursesAPI.createCourse(formData);
        setMessage({ type: 'success', text: 'Course created successfully' });
      }
      
      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.response?.data?.code?.[0] || 'Failed to save course' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete ${course.code}? This will also delete all associated results.`)) {
      try {
        await coursesAPI.deleteCourse(course.id);
        setMessage({ type: 'success', text: 'Course deleted successfully' });
        fetchCourses();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete course' });
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      credit_unit: course.credit_unit,
      department: course.department,
      level: course.level,
      semester: course.semester,
      lecturer: course.lecturer || '',
      is_elective: course.is_elective,
    });
    setShowModal(true);
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      title: '',
      credit_unit: 3,
      department: '',
      level: '',
      semester: '',
      lecturer: '',
      is_elective: false,
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterLevel('');
    setCurrentPage(1);
  };

  if (loading && courses.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
          <p className="text-gray-500">Add, edit, and manage academic courses</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={18} />
          <span>Add Course</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by course code or title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="input-field pl-10"
              />
            </div>
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => {
              setFilterDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-48"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => {
              setFilterLevel(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-32"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.level} Level</option>
            ))}
          </select>
          {(searchTerm || filterDepartment || filterLevel) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Courses Table */}
      <div className="card">
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Lecturer</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No courses found. { (searchTerm || filterDepartment || filterLevel) ? 'Try changing your filters.' : 'Click "Add Course" to create one.' }
                  </td>
                </tr>
              ) : (
                courses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(currentPage - 1) * 20 + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                      {course.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {course.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                        {course.credit_unit} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {course.department_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {course.level_value} Level
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {course.lecturer_name || 'Not Assigned'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleView(course)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {courses.length} of {totalCourses} courses
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., CSC101"
                className="input-field uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Unit *</label>
              <input
                type="number"
                name="credit_unit"
                value={formData.credit_unit}
                onChange={handleInputChange}
                min="1"
                max="6"
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Introduction to Computer Science"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.level} Level</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="input-field"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem.id} value={sem.id}>
                    {sem.session_name} - {sem.name_display}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lecturer (Optional)</label>
              <select
                name="lecturer"
                value={formData.lecturer}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Assign Lecturer</option>
                {lecturers.map(lec => (
                  <option key={lec.id} value={lec.id}>{lec.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_elective"
              checked={formData.is_elective}
              onChange={handleInputChange}
              className="mr-2 w-4 h-4"
            />
            <label className="text-sm font-medium text-gray-700">Elective Course</label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingCourse ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Course Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Course Details"
        size="md"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Course Code</label>
                <p className="font-mono font-semibold text-lg">{selectedCourse.code}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Credit Unit</label>
                <p className="font-semibold text-lg">{selectedCourse.credit_unit}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Course Title</label>
              <p className="font-medium">{selectedCourse.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <p>{selectedCourse.department_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Level</label>
                <p>{selectedCourse.level_value} Level</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Semester</label>
                <p>{selectedCourse.semester_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Course Type</label>
                <p>{selectedCourse.is_elective ? 'Elective' : 'Core'}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-500">Lecturer</label>
              <p>{selectedCourse.lecturer_name || 'Not Assigned'}</p>
            </div>
            
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(selectedCourse);
                }}
                className="btn-primary w-full"
              >
                Edit Course
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageCourses;