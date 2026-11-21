import axiosClient from './axiosClient'

export const adminApi = {
  getDashboard: () => axiosClient.get('/admin/dashboard'),
  getProducts: (params) => axiosClient.get('/admin/products', { params }),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  getBatches: (params) => axiosClient.get('/admin/batches', { params }),
  createBatch: (data) => axiosClient.post('/admin/batches', data),
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  updateShipment: (orderId, data) => axiosClient.put(`/admin/orders/${orderId}/shipment`, data),
  getResellers: (params) => axiosClient.get('/admin/resellers', { params }),
  verifyReseller: (id, data) => axiosClient.put(`/admin/resellers/${id}/verify`, data),
  getWholesalePricing: () => axiosClient.get('/admin/wholesale-pricing'),
  createTier: (data) => axiosClient.post('/admin/wholesale-pricing', data),
  updateMoq: (variantId, moq) => axiosClient.put(`/admin/wholesale-pricing/moq/${variantId}`, { minimum_order_quantity: moq }),
}
