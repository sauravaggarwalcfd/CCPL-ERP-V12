/**
 * API Client with authentication interceptors
 */
import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`→ ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`← ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          // No refresh token, logout
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Update tokens
        useAuthStore.getState().updateToken(access_token);
        if (refresh_token) {
          useAuthStore.getState().login(
            useAuthStore.getState().user,
            access_token,
            refresh_token
          );
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }

    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      toast.error('Resource not found');
    }

    // Handle 422 - Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.detail;
      if (Array.isArray(errors)) {
        errors.forEach((err) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : 'Field';
          toast.error(`${field}: ${err.msg}`);
        });
      } else {
        toast.error('Validation error');
      }
    }

    // Handle 500 - Server Error
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    }

    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
