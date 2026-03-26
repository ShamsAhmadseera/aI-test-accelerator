import axios from 'axios';

const BASE_URL = 'http://localhost:8087/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password, email) => api.post('/auth/register', { username, password, email }),
};

export const testService = {
  runTest: (request) => api.post('/tests/run', request),
  generateRestAssured: (request) => api.post('/tests/generate/restassured', request),
  generateGatling: (request) => api.post('/tests/generate/gatling', request),
  generatePostman: (request) => api.post('/tests/generate/postman', request),
  getHistory: () => api.get('/tests/history'),
  getRecent: () => api.get('/tests/recent'),
  getStats: () => api.get('/tests/stats'),
  getById: (id) => api.get(`/tests/${id}`),
};

export default api;