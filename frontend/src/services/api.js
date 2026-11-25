import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('realcred_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Allow browser / axios to set multipart boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401 unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      if (error.response.data?.code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('realcred_token');
        localStorage.removeItem('realcred_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
