import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

export default api
