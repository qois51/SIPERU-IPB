/**
 * api.js — Central Axios instance
 * - baseURL auto-set
 * - JWT auto-inject via request interceptor
 * - Global error handling + auto-logout on 401
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor: Auto-inject JWT token ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Global error handling ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Auto logout on 401 Unauthorized (token expired)
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Pass the standardized error message
      const message =
        error.response.data?.detail ||
        error.response.data?.message ||
        error.response.data?.msg ||
        'Terjadi kesalahan. Coba lagi.';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.'));
    }

    return Promise.reject(error);
  }
);

export default api;
