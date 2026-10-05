import api from './api';

export const createOrder = async (payload) => {
  const response = await api.post('/orders', payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/my-orders');
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const cancelOrder = async (orderId, payload = {}) => {
  const response = await api.put(`/orders/${orderId}/cancel`, payload);
  return response.data;
};

export const verifyPayment = async (orderId, payload) => {
  const response = await api.post(`/orders/${orderId}/verify-payment`, payload);
  return response.data;
};

export const markPaymentFailed = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payment-failed`);
  return response.data;
};
