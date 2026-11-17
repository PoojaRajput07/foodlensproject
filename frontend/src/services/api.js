// src/services/api.js
import axios from 'axios';

// When using the Vite dev proxy, use a relative path so requests go through it.
// In production, use the full VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ls-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('ls-token');
      localStorage.removeItem('ls-user');
      // Let the AuthContext handle redirect via its own state
      window.dispatchEvent(new CustomEvent('ls:unauthorized'));
    }

    if (status === 403) {
      console.warn('[Label Sach API] 403 Forbidden:', error.config?.url);
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (!error.response ? 'Network error. Check your connection.' : null) ||
      'An unexpected error occurred.';

    return Promise.reject({ ...error, message });
  }
);

export default api;
