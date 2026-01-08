import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/signin', data),
  getDashboard: (userId) => api.get(`/user/dashboard/${userId}`),
}

// Group API
export const groupAPI = {
  create: (data) => api.post('/group', data),
  getAll: () => api.get('/group'),
  getById: (groupId) => api.get(`/group/${groupId}`),
  getUserGroups: (userId) => api.get(`/group/user/${userId}`),
  addMembers: (data) => api.put('/group/add-members', data),
}

// Expense API
export const expenseAPI = {
  create: (data) => api.post('/expense', data),
  getAll: () => api.get('/expense'),
  getById: (id) => api.get(`/expense/${id}`),
  update: (id, data) => api.put(`/expense/${id}`, data),
  delete: (id) => api.delete(`/expense/${id}`),
}

// Balance API
export const balanceAPI = {
  getUserBalance: (userId) => api.get(`/balance/${userId}`),
}

// Settlement API
export const settlementAPI = {
  create: (data) => api.post('/settle', data),
  getUserSettlements: (userId) => api.get(`/settle/${userId}`),
  getHistory: (userId) => api.get(`/settle/history/${userId}`), // Alternative endpoint
}

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getMessages: (groupId) => api.get(`/chat/${groupId}`),
}

// Notification API
export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/${userId}`),
  markAsRead: (id) => api.put(`/notifications/${id}`),
}

// Activity API
export const activityAPI = {
  getGroupActivities: (groupId) => api.get(`/activity/${groupId}`),
}

export default api
