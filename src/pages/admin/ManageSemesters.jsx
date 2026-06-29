import React, { useState, useEffect } from 'react';
import { academicsAPI } from '../../api/academics';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiStar, FiCalendar } from 'react-icons/fi';

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
    setLoading(true);
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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-gray-800">Manage Semesters</h1>
          <p className="text-[10px] sm:text-sm text-gray-500">Create and manage academic semesters</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-sm font-medium rounded-lg transition w-full sm:w-auto"
        >
          <FiPlus size={12} className="sm:size-4" />
          <span>Add Semester</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Semester Sections */}
      <div className="space-y-3 sm:space-y-6">
        {Object.entries(groupedSemesters).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 text-center">
            <FiCalendar className="mx-auto text-gray-300 text-2xl sm:text-3xl mb-2 sm:mb-3" />
            <p className="text-sm sm:text-base text-gray-500">No semesters found</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Click "Add Semester" to create one</p>
          </div>
        ) : (
          Object.entries(groupedSemesters).map(([sessionName, sessionSemesters]) => (
            <div key={sessionName} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
              <h2 className="text-xs sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-4">{sessionName}</h2>
              
              {/* Desktop Table - hidden on mobile */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Semester</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Results Published</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessionSemesters.map((semester) => (
                      <tr key={semester.id} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-2 text-sm font-medium text-gray-800">{semester.name_display || semester.name}</td>
                        <td className="px-3 py-2 text-center">
                          {semester.is_current ? (
                            <FiStar className="text-green-500 mx-auto" size={14} />
                          ) : (
                            <span className="text-gray-300 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {semester.is_result_published ? (
                            <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Published</span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleEdit(semester)}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(semester)}
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

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-1.5 mt-1">
                {sessionSemesters.map((semester) => (
                  <div key={semester.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-gray-800">{semester.name_display || semester.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {semester.is_current ? (
                          <span className="text-[8px] text-green-600 flex items-center">
                            <FiStar size={8} className="mr-0.5" /> Current
                          </span>
                        ) : null}
                        {semester.is_result_published ? (
                          <span className="text-[8px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Published</span>
                        ) : (
                          <span className="text-[8px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                      <button
                        onClick={() => handleEdit(semester)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        <FiEdit size={10} />
                      </button>
                      <button
                        onClick={() => handleDelete(semester)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <FiTrash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSemester ? 'Edit Semester' : 'Add New Semester'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Academic Session</label>
            <select
              name="session"
              value={formData.session}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              required
            >
              <option value="">Select Session</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>{session.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Semester Type</label>
            <select
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              required
            >
              <option value="first">First Semester</option>
              <option value="second">Second Semester</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={handleInputChange}
                className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="text-xs sm:text-sm font-medium text-gray-700">Set as current semester</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_result_published"
                checked={formData.is_result_published}
                onChange={handleInputChange}
                className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="text-xs sm:text-sm font-medium text-gray-700">Results published</label>
            </div>
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
              {editingSemester ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSemesters;