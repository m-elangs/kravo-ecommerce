import axiosClient from './axiosClient'

export const adminApi = {
  getDashboard: (params) => axiosClient.get('/admin/dashboard', { params }),

  // Products
  getProducts: (params) => axiosClient.get('/admin/products', { params }),
  createProduct: (data) => axiosClient.post('/admin/products', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  uploadProductImage: (id, formData) => axiosClient.post(`/admin/products/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProductImage: (id) => axiosClient.delete(`/admin/products/${id}/image`),

  // Variants
  createVariant: (productId, data) => axiosClient.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (id, data) => axiosClient.put(`/admin/variants/${id}`, data),
  deleteVariant: (id) => axiosClient.delete(`/admin/variants/${id}`),

  // Categories
  getCategories: () => axiosClient.get('/admin/categories'),
  createCategory: (data) => axiosClient.post('/admin/categories', data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  uploadCategoryImage: (id, formData) => axiosClient.post(`/admin/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),

  // Batches
  getBatches: (params) => axiosClient.get('/admin/batches', { params }),
  createBatch: (data) => axiosClient.post('/admin/batches', data),
  updateBatch: (id, data) => axiosClient.put(`/admin/batches/${id}`, data),

  // Inventory & Stock Adjustments
  getInventory: (params) => axiosClient.get('/admin/inventory', { params }),
  updateInventory: (id, data) => axiosClient.put(`/admin/inventory/${id}`, data),
  releaseReservedStock: (id, data) => axiosClient.post(`/admin/inventory/${id}/release-reserved`, data),
  getStockMovements: (params) => axiosClient.get('/admin/inventory/movements', { params }),

  // Orders
  getOrders: (params) => axiosClient.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => axiosClient.put(`/admin/orders/${id}/status`, { status }),
  updateShipment: (orderId, data) => axiosClient.put(`/admin/orders/${orderId}/shipment`, data),

  // Resellers
  getResellers: (params) => axiosClient.get('/admin/resellers', { params }),
  verifyReseller: (id, data) => axiosClient.put(`/admin/resellers/${id}/verify`, data),
  downloadResellerDocument: (id) => axiosClient.get(`/admin/resellers/${id}/document`, { responseType: 'blob' }),

  // Wholesale Pricing
  getWholesalePricing: () => axiosClient.get('/admin/wholesale-pricing'),
  createTier: (data) => axiosClient.post('/admin/wholesale-pricing', data),
  updateTier: (id, data) => axiosClient.put(`/admin/wholesale-pricing/tier/${id}`, data),
  deleteTier: (id) => axiosClient.delete(`/admin/wholesale-pricing/tier/${id}`),
  updateMoq: (variantId, moq) => axiosClient.put(`/admin/wholesale-pricing/moq/${variantId}`, { minimum_order_quantity: moq }),

  // Reports
  getSalesReport: (params) => axiosClient.get('/admin/reports/sales', { params }),
  getStockMovementsReport: (params) => axiosClient.get('/admin/reports/stock-movements', { params }),

  // Users
  getUsers: (params) => axiosClient.get('/admin/users', { params }),
  getUser: (id) => axiosClient.get(`/admin/users/${id}`),
  deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),

  // Support & Layanan Bantuan
  getSupportMessages: (params) => axiosClient.get('/admin/support', { params }),
  updateSupportStatus: (id, data) => axiosClient.put(`/admin/support/${id}/status`, data),
  deleteSupportMessage: (id) => axiosClient.delete(`/admin/support/${id}`),
}
