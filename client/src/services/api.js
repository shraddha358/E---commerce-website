import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle global errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.post(`/auth/reset-password/${token}`, data),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/${slug}`),
  create: (data) => API.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
  getAdminAll: (params) => API.get('/products/admin/all', { params }),
  addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
  getReviews: (id, params) => API.get(`/products/${id}/reviews`, { params }),
};

// Categories
export const categoryAPI = {
  getAll: (params) => API.get('/categories', { params }),
  getBySlug: (slug) => API.get(`/categories/${slug}`),
  create: (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Cart
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart', data),
  update: (id, data) => API.put(`/cart/${id}`, data),
  remove: (id) => API.delete(`/cart/${id}`),
  clear: () => API.delete('/cart/clear'),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getAll: (params) => API.get('/orders', { params }),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  adminGetAll: (params) => API.get('/orders/admin/all', { params }),
  adminUpdateStatus: (id, data) => API.put(`/orders/admin/${id}/status`, data),
  getSalesReport: (params) => API.get('/orders/admin/report', { params }),
};

// Wishlist
export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  toggle: (productId) => API.post(`/wishlist/${productId}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getUsers: (params) => API.get('/admin/users', { params }),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
