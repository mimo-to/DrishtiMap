import { create } from 'zustand';
import authService from '../services/auth.service';

// Key for localStorage (TEMPORARY: Phase 3 only)
const STORAGE_KEY = 'token';
const USER_KEY = 'user_data'; // storing basic user info for easy access

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticating: false,
  error: null,

  // Initialize state from local storage
  hydrate: () => {
    set({ isAuthenticating: true }); // Start check
    try {
      const token = localStorage.getItem(STORAGE_KEY);
      const userData = localStorage.getItem(USER_KEY);
      
      if (token && userData) {
        set({ token, user: JSON.parse(userData), isAuthenticating: false });
      } else {
        set({ isAuthenticating: false }); // Ensure reset if no data
      }
    } catch (e) {
      console.error("Failed to parse user data", e);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_KEY);
      set({ isAuthenticating: false }); // Ensure reset on error
    }
  },

  login: async (role) => {
    set({ isAuthenticating: true, error: null });
    try {
      const data = await authService.loginMock(role);
      
      if (data.success && data.token) {
        // Save to LocalStorage
        localStorage.setItem(STORAGE_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        // Update State
        set({ 
          token: data.token, 
          user: data.user, 
          isAuthenticating: false 
        });
        return true;
      } else {
        set({ isAuthenticating: false, error: 'Invalid response from server' });
        return false;
      }
    } catch (err) {
      console.error("Login failed", err);
      // Ensure specific extraction of error message or fallback
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      set({ 
        isAuthenticating: false, 
        error: errorMsg
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, error: null, isAuthenticating: false });
  }
}));
