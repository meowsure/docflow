import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.marzsure.ru:8444/api/v1', // заменить на ваш домен
});

// Добавляем токен к каждому запросу, если он есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;