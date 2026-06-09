import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiGrid } from 'react-icons/fi';

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

  // Group departments by faculty safely
  const facultiesWithDepts = faculties.map(faculty => ({
    ...faculty,
    departments: departments.filter(d => d && d.faculty === faculty.id)
  }));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Faculties & Departments</h1>
          <p className="text-gray-500">Organize academic structure</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus size={18} />
            <span>Add Faculty</span>
          </button>
          <button
            onClick={() => setShowDeptModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiPlus size={18} />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {facultiesWithDepts.map((faculty) => (
          <div key={faculty.id} className="card">
            <div className="flex justify-between items-start mb-4 pb-3 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FiGrid className="text-primary-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{faculty.name}</h2>
                  <p className="text-sm text-gray-500">Code: {faculty.code}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(faculty)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(faculty)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Departments</h3>
              {faculty.departments.length === 0 ? (
                <p className="text-sm text-gray-400">No departments yet</p>
              ) : (
                <div className="space-y-2">
                  {faculty.departments.map((dept) => (
                    <div key={dept.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{dept.name}</p>
                        <p className="text-xs text-gray-500">Code: {dept.code}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDept(dept)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Faculty of Engineering"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., ENG"
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
              {editingFaculty ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Add New Department"
      >
        <form onSubmit={handleDeptSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
            <select
              name="faculty"
              value={deptFormData.faculty}
              onChange={handleDeptInputChange}
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
              value={deptFormData.name}
              onChange={handleDeptInputChange}
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
              value={deptFormData.code}
              onChange={handleDeptInputChange}
              placeholder="e.g., CSC"
              className="input-field"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowDeptModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageFaculties;