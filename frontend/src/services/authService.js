import api from './api';

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const setupAdminAccount = async (payload) => {
  const response = await api.post('/auth/admin-setup', payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
