import axiosClient from './axiosClient'

export const productApi = {
  getCategories: () => axiosClient.get('/categories'),
  getCategory: (slug) => axiosClient.get(`/categories/${slug}`),
  getProducts: (params) => axiosClient.get('/products', { params }),
  getProduct: (slug) => axiosClient.get(`/products/${slug}`),
}
