// ============================================
// File: src/components/ProtectedRoute.jsx
// Purpose: Route protection component - redirects to login if not authenticated
// ============================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * 
 * Usage:
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * 
 * With role restriction:
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole="super-admin">
 *     <AdminPanel />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show nothing while loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: '#666',
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`Access denied. Required role: ${requiredRole}, User role: ${user?.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    // Super admin has all permissions
    if (!user?.permissions?.includes('all')) {
      console.warn(`Access denied. Required permission: ${requiredPermission}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role/permission
  return <>{children}</>;
};

export default ProtectedRoute;