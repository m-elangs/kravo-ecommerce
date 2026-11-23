import axiosClient from './axiosClient'

export const contactApi = {
  sendMessage: (data) => axiosClient.post('/contact', data),
}
