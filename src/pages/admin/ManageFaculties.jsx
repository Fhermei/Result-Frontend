import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiFolder } from 'react-icons/fi';

const ManageFaculties = () => {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    code: '',
    faculty: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facultiesRes, deptsRes] = await Promise.all([
        academicsAPI.getFaculties().catch(() => ({ data: [] })),
        academicsAPI.getDepartments().catch(() => ({ data: [] })),
      ]);
      
      setFaculties(Array.isArray(facultiesRes.data) ? facultiesRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeptInputChange = (e) => {
    setDeptFormData({
      ...deptFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingFaculty) {
        await academicsAPI.updateFaculty(editingFaculty.id, formData);
        setMessage({ type: 'success', text: 'Faculty updated successfully' });
      } else {
        await academicsAPI.createFaculty(formData);
        setMessage({ type: 'success', text: 'Faculty created successfully' });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save faculty' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await academicsAPI.createDepartment(deptFormData);
      setMessage({ type: 'success', text: 'Department created successfully' });
      setShowDeptModal(false);
      setDeptFormData({ name: '', code: '', faculty: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create department' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faculty) => {
    if (window.confirm(`Are you sure you want to delete ${faculty.name}? This will also delete all departments under it.`)) {
      try {
        await academicsAPI.deleteFaculty(faculty.id);
        setMessage({ type: 'success', text: 'Faculty deleted successfully' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete faculty' });
      }
    }
  };

  const handleDeleteDept = async (dept) => {
    if (window.confirm(`Are you sure you want to delete ${dept.name}?`)) {
      try {
        await academicsAPI.deleteDepartment(dept.id);
        setMessage({ type: 'success', text: 'Department deleted successfully' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete department' });
      }
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      code: faculty.code,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFaculty(null);
    setFormData({ name: '', code: '' });
  };

  const facultiesWithDepts = faculties.map(faculty => ({
    ...faculty,
    departments: departments.filter(d => d && d.faculty === faculty.id)
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Manage Faculties</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Organize academic structure</p>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-2 w-full sm:w-auto">
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
          >
            <FiPlus size={12} className="sm:size-4" />
            <span>Add Faculty</span>
          </button>
          <button
            onClick={() => setShowDeptModal(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
          >
            <FiPlus size={12} className="sm:size-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Faculty Cards - 1 col mobile, 2 col tablet, 2 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
        {facultiesWithDepts.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5 hover:shadow-md transition-shadow duration-200">
            {/* Faculty Header */}
            <div className="flex items-start justify-between gap-2 pb-2 sm:pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                  <FiGrid className="text-green-600 text-sm sm:text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs sm:text-lg font-semibold text-gray-800 truncate">{faculty.name}</h2>
                  <p className="text-[9px] sm:text-sm text-gray-500">Code: {faculty.code}</p>
                </div>
              </div>
              <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(faculty)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                  title="Edit"
                >
                  <FiEdit size={12} className="sm:size-4" />
                </button>
                <button
                  onClick={() => handleDelete(faculty)}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                >
                  <FiTrash2 size={12} className="sm:size-4" />
                </button>
              </div>
            </div>

            {/* Departments */}
            <div className="mt-2 sm:mt-3">
              <h3 className="text-[8px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Departments ({faculty.departments.length})
              </h3>
              {faculty.departments.length === 0 ? (
                <p className="text-[9px] sm:text-sm text-gray-400 py-1.5 sm:py-2">No departments yet</p>
              ) : (
                <div className="space-y-1 sm:space-y-1.5 mt-1 sm:mt-2">
                  {faculty.departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition gap-1">
                      <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                        <FiFolder size={10} className="sm:size-3 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs font-medium text-gray-700 truncate">{dept.name}</p>
                          <p className="text-[8px] sm:text-[10px] text-gray-400">Code: {dept.code}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDept(dept)}
                        className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                        title="Delete"
                      >
                        <FiTrash2 size={10} className="sm:size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {facultiesWithDepts.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 text-center">
            <FiGrid className="mx-auto text-gray-300 text-2xl sm:text-3xl mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-500">No faculties found</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Click "Add Faculty" to create one</p>
          </div>
        )}
      </div>

      {/* Add/Edit Faculty Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Faculty of Engineering"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Faculty Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., ENG"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition"
            >
              {editingFaculty ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Department Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Add New Department"
        size="md"
      >
        <form onSubmit={handleDeptSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select
              name="faculty"
              value={deptFormData.faculty}
              onChange={handleDeptInputChange}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map(fac => (
                <option key={fac.id} value={fac.id}>{fac.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              name="name"
              value={deptFormData.name}
              onChange={handleDeptInputChange}
              placeholder="e.g., Computer Science"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Department Code</label>
            <input
              type="text"
              name="code"
              value={deptFormData.code}
              onChange={handleDeptInputChange}
              placeholder="e.g., CSC"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-3 sm:pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDeptModal(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFaculties;