import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.errors?.[0]?.message || error.message || 'Something went wrong';

export default api;