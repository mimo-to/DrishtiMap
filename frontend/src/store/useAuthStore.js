import { create } from 'zustand';

/**
 * @deprecated THIS STORE IS DEPRECATED.
 * USE Clerk's useAuth() hook for all authentication needs.
 * This store is kept only to prevent import errors during refactoring.
 * It is STATELESS and does NOT persist data.
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticating: false,
  error: null,

  // No-op / Deprecated methods
  hydrate: () => console.warn("useAuthStore.hydrate is deprecated. Use Clerk."),
  login: async () => {
    console.warn("useAuthStore.login is deprecated. Use Clerk.");
    return false;
  },
  logout: () => console.warn("useAuthStore.logout is deprecated. Use Clerk."),
}));
