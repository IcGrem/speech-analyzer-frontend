import api from './api';

export const getUsers = (params = {}) => {
  return api.get('/get-users', { params });
};