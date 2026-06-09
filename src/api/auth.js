import axios from './axios';

export const authAPI = {
  // Login
  login: (email, password) => axios.post('/auth/login/', { email, password }),
  
  // Logout
  logout: (refreshToken) => axios.post('/auth/logout/', { refresh: refreshToken }),
  
  // Get current user
  getMe: () => axios.get('/auth/me/'),
  
  // Change password
  changePassword: (oldPassword, newPassword, newPassword2) => 
    axios.post('/auth/change-password/', { 
      old_password: oldPassword, 
      new_password: newPassword, 
      new_password2: newPassword2 
    }),
  
  // Get users count - single API call for dashboard
  getUsersCount: async () => {
    try {
      const response = await axios.get('/auth/users/?page=1&page_size=1');
      if (response.data && typeof response.data.count === 'number') {
        return { count: response.data.count };
      }
      return { count: 0 };
    } catch (error) {
      console.error('Error getting users count:', error);
      return { count: 0 };
    }
  },
  
  // Get users with pagination
  getUsers: async (params = {}) => {
    try {
      const queryParams = { page_size: 20, ...params };
      const response = await axios.get('/auth/users/', { params: queryParams });
      
      if (response.data && response.data.results) {
        return { data: response.data };
      }
      return { data: { results: Array.isArray(response.data) ? response.data : [], count: 0 } };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: { results: [], count: 0 } };
    }
  },
  
  // Get all users (without pagination - use carefully)
  getAllUsers: async () => {
    try {
      const response = await axios.get('/auth/users/?page_size=1000');
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { data: [] };
    }
  },
  
  // Create user
  createUser: (data) => axios.post('/auth/users/', data),
  
  // Update user
  updateUser: (id, data) => axios.patch(`/auth/users/${id}/`, data),
  
  // Delete user (soft delete)
  deleteUser: (id) => axios.delete(`/auth/users/${id}/`),
  
  // Get all lecturers
  getLecturers: async () => {
    try {
      const response = await axios.get('/auth/lecturers/?page_size=100');
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      return { data: [] };
    }
  },
};