/**
 * Auth Store - Zustand state management for authentication
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        // Clear persisted state
        localStorage.removeItem('auth-storage');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      updateToken: (accessToken) => {
        set({ accessToken });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Helpers
      hasRole: (roles) => {
        const { user } = get();
        if (!user || !user.role) return false;
        return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      isManager: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'manager';
      },
    }),
    {
      name: 'auth-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
