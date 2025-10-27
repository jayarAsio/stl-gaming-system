// ============================================
// File: src/utils/storage.js
// Purpose: Utility functions for localStorage management
// ============================================

/**
 * Storage utility for managing localStorage
 * Provides safe JSON parsing and stringifying
 */

const storage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {any} Parsed value or null
   */
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be stringified)
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Get raw string from localStorage (without JSON parsing)
   * @param {string} key - Storage key
   * @returns {string|null} Raw value or null
   */
  getRawItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting raw item ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set raw string in localStorage (without JSON stringifying)
   * @param {string} key - Storage key
   * @param {string} value - Raw string value
   */
  setRawItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting raw item ${key} in storage:`, error);
    }
  },
};

export default storage;