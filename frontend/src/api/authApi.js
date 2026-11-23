import axiosClient from './axiosClient'

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  me: () => axiosClient.get('/auth/me'),
  updateAddress: (data) => axiosClient.post('/auth/address', data),
  logout: () => axiosClient.post('/auth/logout'),
}
