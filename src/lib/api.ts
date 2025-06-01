import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://dern-backend-plc9.onrender.com/api/v1"

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // For cookies (refresh tokens)
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await api.post("/auth/refresh")
        const { accessToken } = response.data
        localStorage.setItem("accessToken", accessToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// API service functions
export const authAPI = {
  login: (credentials: { email: string; password: string }) => api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get("/auth/profile"),

  updateProfile: (data: any) => api.put("/auth/profile", data),
}

export const appointmentsAPI = {
  getAll: (params?: any) => api.get("/appointments", { params }),

  getById: (id: string) => api.get(`/appointments/${id}`),

  create: (data: any) => api.post("/appointments", data),

  update: (id: string, data: any) => api.put(`/appointments/${id}`, data),

  updateStatus: (id: string, status: string) => api.patch(`/appointments/${id}/status`, { status }),

  delete: (id: string) => api.delete(`/appointments/${id}`),
}

export const supportRequestsAPI = {
  getAll: (params?: any) => api.get("/support-requests", { params }),

  getById: (id: string) => api.get(`/support-requests/${id}`),

  create: (data: any) => api.post("/support-requests", data),

  update: (id: string, data: any) => api.put(`/support-requests/${id}`, data),

  updateStatus: (id: string, status: string) => api.patch(`/support-requests/${id}/status`, { status }),

  addMessage: (id: string, message: string) => api.post(`/support-requests/${id}/messages`, { content: message }),
}

export const inventoryAPI = {
  getAll: (params?: any) => api.get("/inventory", { params }),

  getById: (id: string) => api.get(`/inventory/${id}`),

  create: (data: any) => api.post("/inventory", data),

  update: (id: string, data: any) => api.put(`/inventory/${id}`, data),

  updateQuantity: (id: string, quantity: number) => api.patch(`/inventory/${id}/quantity`, { quantity }),
}

export const notificationsAPI = {
  getAll: (params?: any) => api.get("/notifications", { params }),

  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch("/notifications/read-all"),
}

export const analyticsAPI = {
  getDashboardStats: () => api.get("/analytics/dashboard"),

  getPerformanceReport: (params?: any) => api.get("/analytics/performance", { params }),

  getInventoryReport: () => api.get("/analytics/inventory"),
}

export default api
