import axiosClient from './axiosClient'

export const orderApi = {
  getOrders: (params) => axiosClient.get('/orders', { params }),
  getOrder: (orderNumber) => axiosClient.get(`/orders/${orderNumber}`),
  trackOrder: (orderNumber) => axiosClient.get(`/orders/track/${orderNumber}`),
  confirmPayment: (orderNumber, data) => axiosClient.post(`/orders/${orderNumber}/confirm-payment`, data),
  submitReview: (data) => axiosClient.post('/reviews', data),
}
