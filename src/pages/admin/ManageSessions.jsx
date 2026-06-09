import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';

const ManageSessions = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await academicsAPI.getSessions();
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setMessage({ type: 'error', text: 'Failed to load sessions' });
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
      if (editingSession) {
        await academicsAPI.updateSession(editingSession.id, formData);
        setMessage({ type: 'success', text: 'Session updated successfully' });
      } else {
        await academicsAPI.createSession(formData);
        setMessage({ type: 'success', text: 'Session created successfully' });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save session' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (session) => {
    if (window.confirm(`Are you sure you want to delete ${session.name}?`)) {
      try {
        await academicsAPI.deleteSession(session.id);
        setMessage({ type: 'success', text: 'Session deleted successfully' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete session' });
      }
    }
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      start_date: session.start_date?.split('T')[0] || '',
      end_date: session.end_date?.split('T')[0] || '',
      is_current: session.is_current,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingSession(null);
    setFormData({
      name: '',
      start_date: '',
      end_date: '',
      is_current: false,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Academic Sessions</h1>
          <p className="text-gray-500">Create and manage academic calendar sessions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus size={18} />
          <span>Add Session</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">S/N</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Session Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Start Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">End Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Current</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session, index) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{session.name}</td>
                  <td className="px-4 py-3 text-sm">{session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm">{session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {session.is_current ? (
                      <span className="inline-flex items-center text-green-600">
                        <FiStar className="mr-1" size={14} /> Current
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(session)}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSession ? 'Edit Session' : 'Add New Session'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., 2024/2025"
              className="input-field"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_current"
              checked={formData.is_current}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">Set as current session</label>
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
              {editingSession ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSessions;