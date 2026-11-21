import axiosClient from './axiosClient'

export const checkoutApi = {
  preview: (data) => axiosClient.post('/checkout/preview', data),
  checkout: (data) => axiosClient.post('/checkout', data),
}
