import api from './api';

export const verifyRazorpayPayment = async (orderId, payload) => {
  const response = await api.post(`/orders/${orderId}/verify-payment`, payload);
  return response.data;
};

export const markPaymentAsFailed = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/payment-failed`);
  return response.data;
};
