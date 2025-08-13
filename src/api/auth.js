import api from './api';

export const login = (params = {}) => {
  // Создаем FormData для x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', params.username);
  formData.append('password', params.password);
  
  return api.post('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// Метод для проверки авторизации
export const checkAuth = () => {
  return api.get('/users/me');
};

// Метод для выхода из системы
export const logout = () => {
  return api.post('/users/logout');
};