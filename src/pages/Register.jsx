import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { academicsAPI } from '../api/academics';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'student',
    password: '',
    password2: '',
    // Student specific
    matric_no: '',
    department_id: '',
    level_id: '',
    admission_year: new Date().getFullYear(),
  });

  React.useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      const [deptsRes, levelsRes] = await Promise.all([
        academicsAPI.getDepartments(),
        academicsAPI.getLevels(),
      ]);
      setDepartments(deptsRes.data);
      setLevels(levelsRes.data);
    } catch (error) {
      console.error('Failed to fetch academic data:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      if (formData.role === 'student') {
        // Student registration
        await studentsAPI.createStudent({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          matric_no: formData.matric_no,
          department_id: formData.department_id,
          level_id: formData.level_id,
          admission_year: formData.admission_year,
          password: formData.password,
          password2: formData.password2,
        });
        toast.success('Student account created successfully! Please login.');
      } else {
        // Lecturer/Admin registration (requires admin approval)
        await authAPI.createUser({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: formData.role,
          password: formData.password,
          password2: formData.password2,
        });
        toast.success(`${formData.role} account created successfully! Please login.`);
      }
      
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.email?.[0] || 
                     error.response?.data?.message || 
                     'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-800 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUserPlus className="text-primary-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-2">Register for the Blockchain Result System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === 'lecturer' ? 'Lecturer accounts require admin approval.' : 'Students can register directly.'}
            </p>
          </div>
          
          {formData.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matriculation Number</label>
                <input
                  type="text"
                  name="matric_no"
                  value={formData.matric_no}
                  onChange={handleChange}
                  placeholder="e.g., U21/01/12345"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Level</label>
                  <select
                    name="level_id"
                    value={formData.level_id}
                    onChange={handleChange}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
                <input
                  type="number"
                  name="admission_year"
                  value={formData.admission_year}
                  onChange={handleChange}
                  min="2015"
                  max={new Date().getFullYear()}
                  className="input-field"
                  required
                />
              </div>
            </>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiUserPlus size={18} />
            )}
            <span>Register</span>
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center space-x-1">
            <FiArrowLeft size={14} />
            <span>Already have an account? Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;