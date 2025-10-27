// ============================================
// File: src/contexts/AuthContext.jsx
// Purpose: Global authentication context and provider
// ============================================

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */
export const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the entire app to provide auth functionality
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Initialize auth state on mount
   * Check if user is already logged in
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication
   * Loads user from storage if available
   */
  const initializeAuth = () => {
    try {
      const storedUser = authService.getCurrentUser();
      const token = authService.getToken();

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login function
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Login response
   */
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);

      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response;
      }

      throw new Error(response.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Clears auth state and redirects to login
   */
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Redirect to login
      window.location.href = '/';
    }
  };

  /**
   * Refresh user data
   * Updates user information from API
   */
  const refreshUser = async () => {
    try {
      const updatedUser = await authService.refreshUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout
      await logout();
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} True if user has permission
   */
  const hasPermission = (permission) => {
    if (!user?.permissions) return false;
    
    // Super admin has all permissions
    if (user.permissions.includes('all')) return true;
    
    return user.permissions.includes(permission);
  };

  /**
   * Get dashboard path for current user
   * @returns {string} Dashboard path
   */
  const getDashboardPath = () => {
    return authService.getDashboardPath();
  };

  /**
   * Context value
   * All auth-related data and functions
   */
  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Functions
    login,
    logout,
    refreshUser,
    hasRole,
    hasPermission,
    getDashboardPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;