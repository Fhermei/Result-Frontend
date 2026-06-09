import axios from './axios';

export const studentsAPI = {
  // Just get the first page to get the count - don't fetch all pages!
  getStudentsCount: async () => {
    const response = await axios.get('/students/?page=1&page_size=1');
    if (response.data && typeof response.data.count === 'number') {
      return { count: response.data.count };
    }
    return { count: 0 };
  },
  getStudents: async (params) => {
    const response = await axios.get('/students/', { params });
    if (response.data && response.data.results) {
      return { 
        data: response.data.results,
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous
      };
    }
    return { data: [], count: 0 };
  },
  getStudent: (id) => axios.get(`/students/${id}/`),
  createStudent: async (data) => {
    console.log('Creating student with data:', data);
    const response = await axios.post('/students/', data);
    return response;
  },
  updateStudent: (id, data) => axios.put(`/students/${id}/`, data),
  deleteStudent: (id) => axios.delete(`/students/${id}/`),
  getMyProfile: () => axios.get('/students/my-profile/'),
};