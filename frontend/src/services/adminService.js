import api from './api';

export const getAdminOrders = async (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });

  const response = await api.get(`/admin/orders?${params.toString()}`);
  return response.data;
};

export const getAdminOrderById = async (orderId) => {
  const response = await api.get(`/admin/orders/${orderId}`);
  return response.data;
};

export const updateOrderStatus = async (orderId, payload) => {
  const response = await api.put(`/admin/orders/${orderId}/status`, payload);
  return response.data;
};

export const updateShipping = async (orderId, payload) => {
  const response = await api.put(`/admin/orders/${orderId}/shipping`, payload);
  return response.data;
};
