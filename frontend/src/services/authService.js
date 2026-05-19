/**
 * authService.js — Authentication API calls
 */
import api from './api';

const authService = {
  /**
   * Login user and store token + user info in localStorage
   */
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { access_token, role, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  /**
   * Logout: clear localStorage
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user from localStorage
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get current user role
   */
  getRole: () => localStorage.getItem('role'),

  /**
   * Check if user is authenticated (token exists)
   */
  isAuthenticated: () => !!localStorage.getItem('token'),

  /**
   * Fetch current user profile from API
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
