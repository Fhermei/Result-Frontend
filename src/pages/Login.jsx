import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginMethod, setLoginMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { key: 'student', label: 'Student', description: 'Access your results, courses & transcript' },
    { key: 'lecturer', label: 'Lecturer', description: 'Upload & manage student results' },
    { key: 'admin', label: 'Administrator', description: 'Manage users, courses & system settings' },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('form');
    setIdentifier('');
    setPassword('');
    setLoginMethod('email');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    const payload = loginMethod === 'matric'
      ? { matric_no: identifier, password }
      : { email: identifier, password };

    const result = await login(payload);

    if (result.success) {
      if (result.role === 'admin') navigate('/admin');
      else if (result.role === 'lecturer') navigate('/lecturer');
      else if (result.role === 'student') navigate('/student');
      else navigate('/');
    }
    setLoading(false);
  };

  const roleInfo = roles.find((r) => r.key === selectedRole);

  // ── STEP 1: Role Selection ──────────────────────────────────────────────────
  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Login</h1>
            {/* <p className="text-sm text-gray-500 mt-1">University Academic Result Management System</p> */}
          </div>

          {/* <h2 className="text-lg font-semibold text-gray-700 mb-1">Welcome Back!</h2> */}
          {/* <p className="text-sm text-gray-500 mb-6">Select your role to continue</p> */}

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role.key)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
              >
                <p className="font-semibold text-gray-800 text-sm">{role.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New student?{' '}
              <Link to="/register" className="text-green-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: Login Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 sm:p-8">
        {/* Back Button */}
        <button
          onClick={() => setStep('role')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          ← Change role
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">{roleInfo?.label} Login</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the portal</p>
        </div>

        {/* Login Method Toggle - Students Only */}
        {selectedRole === 'student' && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-5 bg-gray-50">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                loginMethod === 'email'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Email Address
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('matric'); setIdentifier(''); }}
              className={`flex-1 py-2 text-sm font-medium transition ${
                loginMethod === 'matric'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Matric Number
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {loginMethod === 'matric' ? 'Matriculation Number' : 'Email Address'}
            </label>
            <input
              type={loginMethod === 'matric' ? 'text' : 'email'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder={loginMethod === 'matric' ? 'e.g. U21/01/12345' : 'your@email.com'}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2">Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {selectedRole === 'student' && (
          <p className="mt-6 text-center text-sm text-gray-500">
            New student?{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;