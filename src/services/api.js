// ============================================
// File: src/services/api.js
// Purpose: Central API service with axios configuration
// ============================================

import axios from 'axios';
import storage from '../utils/storage';

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = storage.getRawItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development mode
    if (import.meta.env.VITE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses and errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.VITE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Log error in development mode
    if (import.meta.env.VITE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.response?.data?.message || error.message,
      });
    }

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - Clear auth data and redirect to login
          storage.removeItem('token');
          storage.removeItem('user');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          console.error('Access forbidden');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
          break;

        case 422:
          // Validation error
          console.error('Validation error:', error.response.data);
          break;

        case 500:
          // Server error
          console.error('Server error');
          break;

        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      console.error('Request failed:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;