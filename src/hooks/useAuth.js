// ============================================
// File: src/hooks/useAuth.js
// Purpose: Custom hook to access authentication context
// ============================================

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * Makes it easier to use auth throughout the app
 * 
 * Usage:
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * @returns {Object} Auth context value
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;