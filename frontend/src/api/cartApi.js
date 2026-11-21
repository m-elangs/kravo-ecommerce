import axiosClient from './axiosClient'

export const cartApi = {
  getCart: () => axiosClient.get('/cart'),
  addItem: (variantId, quantity) => axiosClient.post('/cart/items', { variant_id: variantId, quantity }),
  updateItem: (itemId, quantity) => axiosClient.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => axiosClient.delete(`/cart/items/${itemId}`),
}
