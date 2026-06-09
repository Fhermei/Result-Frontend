import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Departments</h1>
          <p className="text-gray-500">Add, edit, and manage academic departments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={18} />
          <span>Add Department</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="space-y-6">
        {departmentsByFaculty.map((faculty) => (
          <div key={faculty.id} className="card">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FiGrid className="text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{faculty.name}</h2>
              <span className="text-sm text-gray-500">({faculty.code})</span>
            </div>
            
            {faculty.departments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No departments yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Department Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Code</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {faculty.departments.map((dept, idx) => (
                      <tr key={dept.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium">{dept.name}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{dept.code}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(dept)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map(fac => (
                <option key={fac.id} value={fac.id}>{fac.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
              className="input-field"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., CSC"
              className="input-field"
              required
            />
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
              {editingDept ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDepartments;