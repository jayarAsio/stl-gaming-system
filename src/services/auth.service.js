// ============================================
// File: src/services/auth.service.js
// Purpose: Authentication service for login, logout, and user management
// ============================================

import api from './api';
import storage from '../utils/storage';

/**
 * Mock users for development (REMOVE WHEN BACKEND IS READY)
 * These credentials work without a backend
 */
const MOCK_USERS = [
  {
    id: 1,
    username: 'superadmin',
    password: 'admin123',
    fullName: 'Super Administrator',
    email: 'superadmin@stl.com',
    role: 'super-admin',
    permissions: ['all'],
  },
  {
    id: 2,
    username: 'gameadmin',
    password: 'admin123',
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@stl.com',
    role: 'game-administrator',
    permissions: ['manage-users', 'manage-draws', 'view-reports'],
  },
  {
    id: 3,
    username: 'opssupport',
    password: 'admin123',
    fullName: 'Maria Santos',
    email: 'maria.santos@stl.com',
    role: 'operation-support',
    permissions: ['view-balances', 'view-ledgers', 'view-reports'],
  },
  {
    id: 4,
    username: 'collector',
    password: 'admin123',
    fullName: 'Pedro Reyes',
    email: 'pedro.reyes@stl.com',
    role: 'collector',
    permissions: ['collect-sales', 'process-payouts', 'view-reports'],
  },
  {
    id: 5,
    username: 'teller',
    password: 'admin123',
    fullName: 'Ana Garcia',
    email: 'ana.garcia@stl.com',
    role: 'teller',
    permissions: ['create-tickets', 'check-winners', 'request-void'],
  },
];

/**
 * Authentication Service
 */
const authService = {
  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User data and token
   */
  login: async (username, password) => {
    try {
      // MOCK MODE: Check if we're in development with mock data
      // When your Laravel backend is ready, this will automatically use real API
      
      if (import.meta.env.VITE_ENV === 'development') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Find mock user
        const user = MOCK_USERS.find(
          u => u.username === username && u.password === password
        );

        if (!user) {
          throw new Error('Invalid username or password');
        }

        // Create mock token
        const token = `mock-token-${user.id}-${Date.now()}`;

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        // Store auth data
        storage.setRawItem('token', token);
        storage.setItem('user', userWithoutPassword);

        return {
          success: true,
          data: {
            user: userWithoutPassword,
            token,
          },
          message: 'Login successful',
        };
      }

      // REAL API MODE: When backend is ready
      const response = await api.post('/auth/login', {
        username,
        password,
      });

      // Store auth data from real API
      if (response.data.success) {
        storage.setRawItem('token', response.data.data.token);
        storage.setItem('user', response.data.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      // Call logout endpoint if using real API
      if (import.meta.env.VITE_ENV !== 'development') {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      storage.removeItem('token');
      storage.removeItem('user');
    }
  },

  /**
   * Get current user from storage
   * @returns {Object|null} Current user or null
   */
  getCurrentUser: () => {
    return storage.getItem('user');
  },

  /**
   * Get current token from storage
   * @returns {string|null} Current token or null
   */
  getToken: () => {
    return storage.getRawItem('token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: () => {
    const token = storage.getRawItem('token');
    const user = storage.getItem('user');
    return !!(token && user);
  },

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  hasRole: (role) => {
    const user = storage.getItem('user');
    return user?.role === role;
  },

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  hasPermission: (permission) => {
    const user = storage.getItem('user');
    if (!user?.permissions) return false;
    
    // Super admin has all permissions
    if (user.permissions.includes('all')) return true;
    
    return user.permissions.includes(permission);
  },

  /**
   * Get user's dashboard path based on role
   * @returns {string} Dashboard path
   */
  getDashboardPath: () => {
    const user = storage.getItem('user');
    if (!user) return '/login';

    const rolePaths = {
      'super-admin': '/super-admin',
      'game-administrator': '/game-administrator',
      'operation-support': '/operation-support',
      'collector': '/collector',
      'teller': '/teller',
    };

    return rolePaths[user.role] || '/';
  },

  /**
   * Refresh user data from API
   * @returns {Promise<Object>} Updated user data
   */
  refreshUser: async () => {
    try {
      if (import.meta.env.VITE_ENV === 'development') {
        // In mock mode, return stored user
        return storage.getItem('user');
      }

      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        storage.setItem('user', response.data.data);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  },
};

export default authService;