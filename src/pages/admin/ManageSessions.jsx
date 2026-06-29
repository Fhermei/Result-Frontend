import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiStar, FiCalendar } from 'react-icons/fi';

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
    setLoading(true);
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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Manage Academic Sessions</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Create and manage academic calendar sessions</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
        >
          <FiPlus size={12} className="sm:size-4" />
          <span>Add Session</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* ─── DESKTOP TABLE ──────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S/N</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map((session, index) => (
                  <tr key={session.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{session.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {session.is_current ? (
                        <span className="inline-flex items-center text-green-600 text-sm font-medium">
                          <FiStar className="mr-1" size={14} /> Current
                        </span>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleEdit(session)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(session)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MOBILE CARD VIEW ────────────────────────────────────────────── */}
      <div className="md:hidden space-y-2">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 text-sm">
            No sessions found
          </div>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-green-600 text-sm flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-800 truncate">{session.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                    <span className="text-[8px] text-gray-500">
                      {session.start_date ? new Date(session.start_date).toLocaleDateString() : '-'}
                    </span>
                    <span className="text-[8px] text-gray-300">→</span>
                    <span className="text-[8px] text-gray-500">
                      {session.end_date ? new Date(session.end_date).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  {session.is_current && (
                    <span className="inline-flex items-center text-[8px] text-green-600 mt-0.5">
                      <FiStar size={8} className="mr-0.5" /> Current Session
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleEdit(session)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                  >
                    <FiEdit size={10} />
                  </button>
                  <button
                    onClick={() => handleDelete(session)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSession ? 'Edit Session' : 'Add New Session'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Session Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., 2024/2025"
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
              className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label className="text-xs sm:text-sm font-medium text-gray-700">Set as current session</label>
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
              {editingSession ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSessions;