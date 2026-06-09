import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';

const ManageSemesters = () => {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    session: '',
    name: 'first',
    is_current: false,
    is_result_published: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [semestersRes, sessionsRes] = await Promise.all([
        academicsAPI.getSemesters().catch(() => ({ data: [] })),
        academicsAPI.getSessions().catch(() => ({ data: [] })),
      ]);
      
      setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
      setSessions(Array.isArray(sessionsRes.data) ? sessionsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
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
      if (editingSemester) {
        await academicsAPI.updateSemester(editingSemester.id, formData);
        setMessage({ type: 'success', text: 'Semester updated successfully' });
      } else {
        await academicsAPI.createSemester(formData);
        setMessage({ type: 'success', text: 'Semester created successfully' });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save semester' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (semester) => {
    if (window.confirm(`Are you sure you want to delete this semester?`)) {
      try {
        await academicsAPI.deleteSemester(semester.id);
        setMessage({ type: 'success', text: 'Semester deleted successfully' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete semester' });
      }
    }
  };

  const handleEdit = (semester) => {
    setEditingSemester(semester);
    setFormData({
      session: semester.session,
      name: semester.name,
      is_current: semester.is_current,
      is_result_published: semester.is_result_published,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSemester(null);
    setFormData({
      session: '',
      name: 'first',
      is_current: false,
      is_result_published: false,
    });
  };

  // Group semesters by session safely
  const groupedSemesters = {};
  semesters.forEach((semester) => {
    if (semester && semester.session_name) {
      const sessionName = semester.session_name;
      if (!groupedSemesters[sessionName]) {
        groupedSemesters[sessionName] = [];
      }
      groupedSemesters[sessionName].push(semester);
    }
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Semesters</h1>
          <p className="text-gray-500">Create and manage academic semesters</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={18} />
          <span>Add Semester</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="space-y-6">
        {Object.entries(groupedSemesters).map(([sessionName, sessionSemesters]) => (
          <div key={sessionName} className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{sessionName}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Semester</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Current</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Results Published</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessionSemesters.map((semester) => (
                    <tr key={semester.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{semester.name_display || semester.name}</td>
                      <td className="px-4 py-3 text-center">
                        {semester.is_current ? (
                          <FiStar className="text-green-500 mx-auto" size={16} />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {semester.is_result_published ? (
                          <span className="text-green-600 text-sm">Published</span>
                        ) : (
                          <span className="text-yellow-600 text-sm">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(semester)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(semester)}
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
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSemester ? 'Edit Semester' : 'Add New Semester'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select Session</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester Type</label>
            <select
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="first">First Semester</option>
              <option value="second">Second Semester</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Set as current semester</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_result_published"
                checked={formData.is_result_published}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Results published</label>
            </div>
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
              {editingSemester ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSemesters;