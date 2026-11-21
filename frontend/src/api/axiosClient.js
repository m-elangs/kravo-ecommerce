import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request Interceptor: Attach Sanctum Bearer Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('kravo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Response Interceptor: Handle unauthenticated or errors gracefully
axiosClient.interceptors.response.use((response) => {
  return response.data
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('kravo_token')
    localStorage.removeItem('kravo_user')
  }
  return Promise.reject(error.response ? error.response.data : error)
})

export default axiosClient
