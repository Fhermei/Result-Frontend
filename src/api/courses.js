import axios from './axios';

export const coursesAPI = {
  // Get available courses for registration (students can see all courses at their level)
  getAvailableCourses: async (params) => {
    try {
      const response = await axios.get('/courses/', { params });
      if (response.data && response.data.results) {
        return { data: response.data.results, count: response.data.count };
      }
      return { data: Array.isArray(response.data) ? response.data : [], count: 0 };
    } catch (error) {
      console.error('Error fetching available courses:', error);
      return { data: [], count: 0 };
    }
  },
  
  // Get courses count (single API call for dashboard)
  getCoursesCount: async () => {
    try {
      const response = await axios.get('/courses/?page=1&page_size=1');
      if (response.data && typeof response.data.count === 'number') {
        return { count: response.data.count };
      }
      return { count: 0 };
    } catch (error) {
      console.error('Error getting courses count:', error);
      return { count: 0 };
    }
  },
  
  // Get courses with pagination
  getCourses: async (params) => {
    try {
      const queryParams = { page_size: 20, ...params };
      const response = await axios.get('/courses/', { params: queryParams });
      if (response.data && response.data.results) {
        return { data: response.data };
      }
      return { data: { results: Array.isArray(response.data) ? response.data : [], count: 0 } };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: { results: [], count: 0 } };
    }
  },
  
  // Get single course
  getCourse: (id) => axios.get(`/courses/${id}/`),
  
  // Create course
  createCourse: (data) => axios.post('/courses/', data),
  
  // Update course
  updateCourse: (id, data) => axios.put(`/courses/${id}/`, data),
  
  // Delete course
  deleteCourse: (id) => axios.delete(`/courses/${id}/`),
  
  // Get courses for current lecturer/student
  getMyCourses: async () => {
    try {
      const response = await axios.get('/courses/my-courses/');
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching my courses:', error);
      return { data: [] };
    }
  },
  
  // Register for courses (student)
  registerCourses: (courseIds) => axios.post('/courses/register/', { course_ids: courseIds }),
  
  // Get student's registered courses
  getMyRegistrations: async () => {
    try {
      const response = await axios.get('/courses/my-registrations/');
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching my registrations:', error);
      return { data: [] };
    }
  },
  
  // Get students enrolled in a course (lecturer)
  getCourseStudents: async (courseId, params = {}) => {
    try {
      const response = await axios.get(`/courses/${courseId}/students/`, { params });
      if (response.data && response.data.results) {
        return { data: response.data };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching course students:', error);
      return { data: [] };
    }
  },
};