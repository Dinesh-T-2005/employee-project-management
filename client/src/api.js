import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', timeout: 15000 });
api.interceptors.response.use(response => response, error => {
  const message = error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'Request timed out.' : 'Could not connect to the API. Check that the backend and database are running.');
  return Promise.reject(new Error(message));
});
export default api;
