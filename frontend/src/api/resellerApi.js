import axiosClient from './axiosClient'

export const resellerApi = {
  register: (formData) => axiosClient.post('/reseller/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStatus: () => axiosClient.get('/reseller/status'),
  getWholesaleProducts: () => axiosClient.get('/wholesale/products'),
}
