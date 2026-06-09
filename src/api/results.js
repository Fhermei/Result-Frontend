import axios from './axios';

export const resultsAPI = {
  getResultsCount: async () => {
    try {
      const response = await axios.get('/results/?page=1&page_size=1');
      if (response.data && typeof response.data.count === 'number') {
        return { count: response.data.count };
      }
      if (Array.isArray(response.data)) {
        return { count: response.data.length };
      }
      return { count: 0 };
    } catch (error) {
      console.error('Error getting results count:', error);
      return { count: 0 };
    }
  },
  
  getResults: async (params = {}) => {
    try {
      const queryParams = { page_size: 100, ...params };
      const response = await axios.get('/results/', { params: queryParams });
      
      // Always return a consistent format
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      if (Array.isArray(response.data)) {
        return { data: response.data };
      }
      return { data: [] };
    } catch (error) {
      console.error('Error fetching results:', error);
      return { data: [] };
    }
  },
  
  getResult: (id) => axios.get(`/results/${id}/`),
  
  createResult: (data) => axios.post('/results/', data),
  
  updateResult: (id, data) => axios.patch(`/results/${id}/`, data),
  
  deleteResult: (id) => axios.delete(`/results/${id}/`),
  
  bulkUpload: (data) => axios.post('/results/bulk-upload/', data),
  
  getMyResults: async (params = {}) => {
    try {
      const response = await axios.get('/results/my-results/', { params });
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching my results:', error);
      return { data: [] };
    }
  },
  
  getGPA: async (params = {}) => {
    try {
      const response = await axios.get('/results/gpa/', { params });
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching GPA:', error);
      return { data: [] };
    }
  },
  
  calculateGPA: (data) => axios.post('/results/calculate-gpa/', data),
  calculateCGPA: (data) => axios.post('/results/calculate-cgpa/', data),
  publishResults: (data) => axios.post('/results/publish/', data),
  getTranscript: (studentId) => axios.get(`/results/transcript/${studentId}/`),
  getMyTranscript: async () => {
    try {
      const response = await axios.get('/results/transcript/');
      return response;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return { data: null };
    }
  },
  
  getCGPARecords: async (params = {}) => {
    try {
      const response = await axios.get('/results/cgpa/', { params });
      if (response.data && response.data.results) {
        return { data: response.data.results };
      }
      return { data: Array.isArray(response.data) ? response.data : [] };
    } catch (error) {
      console.error('Error fetching CGPA records:', error);
      return { data: [] };
    }
  },
};