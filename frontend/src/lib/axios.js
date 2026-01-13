import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoded for Phase 3 dev
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    // Read directly from localStorage to avoid circular dependency issues during initialization
    // or we could use useAuthStore.getState().token if access is safe.
    // For now, localStorage is the source of truth for persistence.
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && (response.status === 401 || response.status === 403)) {
      // Clear auth state and redirect
      // We use the store's logout action to ensure all state is cleaned up
      useAuthStore.getState().logout();
      // Optional: Redirect logic is handled by the UI reacting to state change,
      // but if we need a hard redirect:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
