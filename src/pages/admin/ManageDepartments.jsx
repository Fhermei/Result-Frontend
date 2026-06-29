import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiGrid, FiFolder } from 'react-icons/fi';

const ManageDepartments = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
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
      const [deptsRes, facultiesRes] = await Promise.all([
        academicsAPI.getDepartments().catch(() => ({ data: [] })),
        academicsAPI.getFaculties().catch(() => ({ data: [] })),
      ]);
      
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
      setFaculties(Array.isArray(facultiesRes.data) ? facultiesRes.data : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load departments' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDept) {
        await academicsAPI.updateDepartment(editingDept.id, formData);
        setMessage({ type: 'success', text: 'Department updated successfully' });
      } else {
        await academicsAPI.createDepartment(formData);
        setMessage({ type: 'success', text: 'Department created successfully' });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save department' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dept) => {
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

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      faculty: dept.faculty,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '', faculty: '' });
  };

  // Group departments by faculty safely
  const departmentsByFaculty = faculties.map(faculty => ({
    ...faculty,
    departments: departments.filter(d => d && d.faculty === faculty.id)
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Manage Departments</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Add, edit, and manage academic departments</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
        >
          <FiPlus size={12} className="sm:size-4" />
          <span>Add Department</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Faculty Sections */}
      <div className="space-y-3 sm:space-y-6">
        {departmentsByFaculty.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
            {/* Faculty Header */}
            <div className="flex items-center space-x-2 sm:space-x-3 pb-2 sm:pb-3 border-b border-gray-100">
              <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                <FiGrid className="text-green-600 text-sm sm:text-xl" />
              </div>
              <h2 className="text-xs sm:text-lg font-semibold text-gray-800 truncate">{faculty.name}</h2>
              <span className="text-[8px] sm:text-sm text-gray-500 flex-shrink-0">({faculty.code})</span>
            </div>
            
            {faculty.departments.length === 0 ? (
              <p className="text-[10px] sm:text-sm text-gray-400 text-center py-3 sm:py-4">No departments yet</p>
            ) : (
              <>
                {/* Desktop Table - hidden on mobile */}
                <div className="hidden sm:block overflow-x-auto mt-3">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S/N</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Name</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {faculty.departments.map((dept, idx) => (
                        <tr key={dept.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 py-2 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-3 py-2 text-sm font-medium text-gray-800">{dept.name}</td>
                          <td className="px-3 py-2 text-sm font-mono text-gray-600">{dept.code}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center space-x-1.5">
                              <button
                                onClick={() => handleEdit(dept)}
                                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              >
                                <FiEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(dept)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View - visible on mobile, hidden on desktop */}
                <div className="sm:hidden space-y-1.5 mt-2">
                  {faculty.departments.map((dept, idx) => (
                    <div key={dept.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <FiFolder size={10} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium text-gray-700 truncate">{dept.name}</p>
                          <p className="text-[8px] text-gray-400">Code: {dept.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-0.5 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <FiEdit size={10} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {departmentsByFaculty.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 text-center">
          <FiGrid className="mx-auto text-gray-300 text-2xl sm:text-3xl mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-gray-500">No departments found</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Click "Add Department" to create one</p>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
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
              value={formData.name}
              onChange={handleInputChange}
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
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., CSC"
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
              {editingDept ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDepartments;