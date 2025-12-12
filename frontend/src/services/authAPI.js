/**
 * Authentication API endpoints
 */
import apiClient from './apiClient';

export const authAPI = {
  /**
   * Login with username/email and password
   */
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  /**
   * Register a new user
   */
  register: async (userData) => {
    return apiClient.post('/api/auth/register', userData);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken) => {
    return apiClient.post('/api/auth/refresh', { refresh_token: refreshToken });
  },

  /**
   * Get current user info
   */
  getCurrentUser: async () => {
    return apiClient.get('/api/auth/me');
  },

  /**
   * Update current user
   */
  updateCurrentUser: async (userData) => {
    return apiClient.put('/api/auth/me', userData);
  },

  /**
   * Get all users (Admin only)
   */
  getAllUsers: async () => {
    return apiClient.get('/api/auth/users');
  },

  /**
   * Update user (Admin only)
   */
  updateUser: async (userId, userData) => {
    return apiClient.put(`/api/auth/users/${userId}`, userData);
  },

  /**
   * Delete user (Admin only)
   */
  deleteUser: async (userId) => {
    return apiClient.delete(`/api/auth/users/${userId}`);
  },
};
