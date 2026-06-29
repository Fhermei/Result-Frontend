import React, { useState, useEffect } from 'react';
import { authAPI } from '../../api/auth';
import { academicsAPI } from '../../api/academics';
import { studentsAPI } from '../../api/students';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import {
  FiPlus, FiEdit, FiTrash2, FiUserPlus,
  FiSearch, FiChevronLeft, FiChevronRight,
  FiUser, FiMail, FiTag, FiCheckCircle, FiXCircle
} from 'react-icons/fi';

const EMPTY_FORM = {
  email: '',
  first_name: '',
  last_name: '',
  role: 'student',
  phone: '',
  password: '',
  password2: '',
  matric_no: '',
  department_id: '',
  level_id: '',
  admission_year: new Date().getFullYear(),
};

const ManageUsers = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [formError, setFormError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchUsers();
    fetchAcademicData();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, page_size: 20 };
      if (searchTerm) params.search = searchTerm;
      if (roleFilter) params.role = roleFilter;

      const response = await authAPI.getUsers(params);
      if (response.data && response.data.results) {
        setUsers(response.data.results);
        setTotalUsers(response.data.count);
        setTotalPages(Math.ceil(response.data.count / 20));
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalUsers(response.data.length);
        setTotalPages(1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      const [deptsRes, levelsRes] = await Promise.all([
        academicsAPI.getDepartments(),
        academicsAPI.getLevels(),
      ]);
      setDepartments(deptsRes.data || []);
      setLevels(levelsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch academic data:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const parseError = (error) => {
    const data = error.response?.data;
    if (!data) return 'An unexpected error occurred. Please try again.';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    const fieldErrors = [];
    Object.entries(data).forEach(([field, msgs]) => {
      if (Array.isArray(msgs)) {
        fieldErrors.push(`${field}: ${msgs.join(', ')}`);
      } else if (typeof msgs === 'string') {
        fieldErrors.push(`${field}: ${msgs}`);
      }
    });
    if (fieldErrors.length) return fieldErrors.join('\n');
    return 'Failed to save user. Please check the form and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editingUser) {
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters.');
        return;
      }
      if (formData.password !== formData.password2) {
        setFormError('Passwords do not match.');
        return;
      }
      if (formData.role === 'student') {
        if (!formData.matric_no.trim()) {
          setFormError('Matric number is required for students.');
          return;
        }
        if (!formData.department_id) {
          setFormError('Please select a department.');
          return;
        }
        if (!formData.level_id) {
          setFormError('Please select a level.');
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      if (editingUser) {
        await authAPI.updateUser(editingUser.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
        });
        setMessage({ type: 'success', text: 'User updated successfully' });
      } else if (formData.role === 'student') {
        const studentData = {
          email: formData.email.trim().toLowerCase(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
          matric_no: formData.matric_no.trim(),
          department_id: parseInt(formData.department_id, 10),
          level_id: parseInt(formData.level_id, 10),
          admission_year: parseInt(formData.admission_year, 10),
          password: formData.password,
          password2: formData.password2,
        };
        await studentsAPI.createStudent(studentData);
        setMessage({ type: 'success', text: 'Student created successfully' });
      } else {
        await authAPI.createUser({
          email: formData.email.trim().toLowerCase(),
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone.trim(),
          role: formData.role,
          password: formData.password,
          password2: formData.password2,
        });
        setMessage({
          type: 'success',
          text: `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully`,
        });
      }

      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      const msg = parseError(error);
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to deactivate ${user.full_name}?`)) {
      try {
        await authAPI.deleteUser(user.id);
        setMessage({ type: 'success', text: 'User deactivated successfully' });
        fetchUsers();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to deactivate user' });
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormError('');
    setFormData({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role,
      phone: user.phone || '',
      password: '',
      password2: '',
      matric_no: user.student_profile?.matric_no || '',
      department_id: user.student_profile?.department || '',
      level_id: user.student_profile?.current_level || '',
      admission_year: user.student_profile?.admission_year || new Date().getFullYear(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormError('');
    setFormData({ ...EMPTY_FORM });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-gray-100 text-gray-700',
      lecturer: 'bg-blue-50 text-blue-700',
      student: 'bg-green-50 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Add, edit, and manage system users</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg transition duration-200"
        >
          <FiUserPlus size={14} />
          <span>Add User</span>
        </button>
      </div>

      {message && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white w-full sm:w-40"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="lecturer">Lecturer</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {/* ─── DESKTOP TABLE ──────────────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">S/N</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {(currentPage - 1) * 20 + index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{user.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Deactivate"
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing {users.length} of {totalUsers} users</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MOBILE CARD VIEW ────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400 text-sm">
            No users found
          </div>
        ) : (
          users.map((user, index) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Edit"
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Deactivate"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500">
              {users.length} of {totalUsers}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft size={14} />
              </button>
              <span className="text-xs text-gray-600">{currentPage} / {totalPages}</span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Same as before */}
      <Modal
        isOpen={showModal}
        onClose={() => { if (!submitting) { setShowModal(false); resetForm(); } }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm whitespace-pre-line">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
              disabled={!!editingUser}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              required
              disabled={!!editingUser}
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!editingUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          )}

          {formData.role === 'student' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Matric Number *</label>
                <input
                  type="text"
                  name="matric_no"
                  value={formData.matric_no}
                  onChange={handleInputChange}
                  placeholder="e.g. U21/01/12345"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required={!editingUser}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                    required={!editingUser}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Level *</label>
                  <select
                    name="level_id"
                    value={formData.level_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                    required={!editingUser}
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level.id} value={level.id}>{level.level} Level</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Admission Year *</label>
                <input
                  type="number"
                  name="admission_year"
                  value={formData.admission_year}
                  onChange={handleInputChange}
                  min="2015"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required={!editingUser}
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm(); }}
              disabled={submitting}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingUser ? 'Update User' : 'Create User'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;