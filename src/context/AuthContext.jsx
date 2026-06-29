import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    try {
      console.log('Login payload:', payload);
      const response = await authAPI.login(payload);
      console.log('Login response:', response.data);
      
      const { access, refresh, role, full_name, user_id } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access);

      const decoded = jwtDecode(access);
      setUser({
        id: user_id,
        email: decoded.email || '',
        role,
        full_name,
        ...decoded,
      });

      toast.success(`Welcome back, ${full_name}!`);
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      // Extract detailed error message
      let message = 'Login failed. Please check your credentials.';
      if (error.response?.data) {
        if (error.response.data.detail) {
          message = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
          message = error.response.data.non_field_errors[0];
        } else if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else {
          // Try to get first error message from any field
          const firstKey = Object.keys(error.response.data)[0];
          if (firstKey) {
            const val = error.response.data[firstKey];
            message = Array.isArray(val) ? val[0] : val;
          }
        }
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await authAPI.logout(refreshToken);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const changePassword = async (oldPassword, newPassword, newPassword2) => {
    try {
      await authAPI.changePassword(oldPassword, newPassword, newPassword2);
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.new_password?.[0] || 'Failed to change password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    changePassword,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isLecturer: user?.role === 'lecturer',
    isStudent: user?.role === 'student',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};