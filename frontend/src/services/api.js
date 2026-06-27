import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || "Something went wrong";
    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

// ========== Orders ==========
export const ordersAPI = {
  getAll: (params = {}) => api.get("/orders", { params }),
  getStats: () => api.get("/orders/stats"),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  updatePayment: (id, paymentStatus) => api.put(`/orders/${id}/payment`, { paymentStatus }),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ========== Products ==========
export const productsAPI = {
  getAll: (params = {}) => api.get("/products", { params }),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleStock: (id) => api.put(`/products/${id}/stock`),
};

// ========== Customers ==========
export const customersAPI = {
  getAll: (params = {}) => api.get("/customers", { params }),
  getById: (id) => api.get(`/customers/${id}`),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

// ========== Store ==========
export const storeAPI = {
  get: () => api.get("/store"),
  update: (data) => api.put("/store", data),
};

export default api;
