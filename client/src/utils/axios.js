import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  response => response,
  error => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export const mediaUrl = path => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (API_BASE_URL.startsWith('http')) {
    return `${new URL(API_BASE_URL).origin}${path}`
  }
  return path
}

export default instance
