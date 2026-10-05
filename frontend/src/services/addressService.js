import api from './api';

export const getAddresses = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

export const addAddress = async (payload) => {
  const response = await api.post('/addresses', payload);
  return response.data;
};

export const updateAddress = async (addressId, payload) => {
  const response = await api.put(`/addresses/${addressId}`, payload);
  return response.data;
};

export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/addresses/${addressId}`);
  return response.data;
};
