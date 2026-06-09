import axios from './axios';

export const academicsAPI = {
  // Faculties
  getFaculties: async () => {
    const response = await axios.get('/academics/faculties/');
    if (response.data && response.data.results) {
      return { data: response.data.results };
    }
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
  createFaculty: (data) => axios.post('/academics/faculties/', data),
  updateFaculty: (id, data) => axios.put(`/academics/faculties/${id}/`, data),
  deleteFaculty: (id) => axios.delete(`/academics/faculties/${id}/`),
  
  // Departments
  getDepartments: async (params) => {
    const response = await axios.get('/academics/departments/', { params });
    if (response.data && response.data.results) {
      return { data: response.data.results };
    }
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
  createDepartment: (data) => axios.post('/academics/departments/', data),
  updateDepartment: (id, data) => axios.put(`/academics/departments/${id}/`, data),
  deleteDepartment: (id) => axios.delete(`/academics/departments/${id}/`),
  
  // Sessions
  getSessions: async () => {
    const response = await axios.get('/academics/sessions/');
    if (response.data && response.data.results) {
      return { data: response.data.results };
    }
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
  createSession: (data) => axios.post('/academics/sessions/', data),
  updateSession: (id, data) => axios.put(`/academics/sessions/${id}/`, data),
  deleteSession: (id) => axios.delete(`/academics/sessions/${id}/`),
  
  // Semesters
  getSemesters: async (params) => {
    const response = await axios.get('/academics/semesters/', { params });
    if (response.data && response.data.results) {
      return { data: response.data.results };
    }
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
  createSemester: (data) => axios.post('/academics/semesters/', data),
  updateSemester: (id, data) => axios.put(`/academics/semesters/${id}/`, data),
  getCurrentSemester: () => axios.get('/academics/current-semester/'),
  
  // Levels
  getLevels: async () => {
    const response = await axios.get('/academics/levels/');
    if (response.data && response.data.results) {
      return { data: response.data.results };
    }
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
  
  // ADD THIS METHOD - Get courses count
  getCoursesCount: async () => {
    const response = await axios.get('/courses/?page=1&page_size=1');
    if (response.data && typeof response.data.count === 'number') {
      return { count: response.data.count };
    }
    return { count: 0 };
  },
};