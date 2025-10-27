// ============================================
// File: src/pages/Login.jsx
// Purpose: Login page for all user roles
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import "./index.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, getDashboardPath } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Redirect if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from || getDashboardPath();
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location, getDashboardPath]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    setError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.username, formData.password);
      
      // Redirect to appropriate dashboard
      const redirectTo = location.state?.from || getDashboardPath();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick login helper (for development/demo)
   */
  const quickLogin = (username, password) => {
    setFormData({ username, password });
    // Auto submit after a short delay
    setTimeout(() => {
      const event = new Event('submit', { cancelable: true, bubbles: true });
      document.querySelector('.login-form')?.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="login-page">
      {/* Background Decoration */}
      <div className="login-background">
        <div className="login-bg-circle login-bg-circle-1"></div>
        <div className="login-bg-circle login-bg-circle-2"></div>
        <div className="login-bg-circle login-bg-circle-3"></div>
      </div>

      {/* Login Container */}
      <div className="login-container">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo">STL</div>
          <h1 className="login-title">STL Gaming System</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="login-error">
              <span className="login-error-icon">⚠️</span>
              <span className="login-error-text">{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="login-input-group">
            <label className="login-label">Username</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">👤</span>
              <input
                type="text"
                name="username"
                className="login-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="login-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-button-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Quick Access (Development Only) */}
        {import.meta.env.VITE_ENV === 'development' && (
          <div className="login-quick-access">
            <p className="login-quick-title">Quick Access (Demo)</p>
            <div className="login-quick-buttons">
              <button
                className="login-quick-btn login-quick-superadmin"
                onClick={() => quickLogin('superadmin', 'admin123')}
                disabled={loading}
              >
                <span className="login-quick-icon">👑</span>
                Super Admin
              </button>
              <button
                className="login-quick-btn login-quick-gameadmin"
                onClick={() => quickLogin('gameadmin', 'admin123')}
                disabled={loading}
              >
                <span className="login-quick-icon">🎮</span>
                Game Admin
              </button>
              <button
                className="login-quick-btn login-quick-ops"
                onClick={() => quickLogin('opssupport', 'admin123')}
                disabled={loading}
              >
                <span className="login-quick-icon">⚙️</span>
                Ops Support
              </button>
              <button
                className="login-quick-btn login-quick-collector"
                onClick={() => quickLogin('collector', 'admin123')}
                disabled={loading}
              >
                <span className="login-quick-icon">💼</span>
                Collector
              </button>
              <button
                className="login-quick-btn login-quick-teller"
                onClick={() => quickLogin('teller', 'admin123')}
                disabled={loading}
              >
                <span className="login-quick-icon">🎯</span>
                Teller
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p className="login-footer-text">STL Gaming System</p>
          <p className="login-footer-subtext">Philippine Charity Sweepstakes Office</p>
        </div>
      </div>
    </div>
  );
};

export default Login;