/**
 * useAuth.js — Custom hook for authentication state
 * Provides: user, role, isAuthenticated, login, logout
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derive state from localStorage (always fresh)
  const user = authService.getCurrentUser();
  const role = authService.getRole();
  const isAuthenticated = authService.isAuthenticated();

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      const { role: userRole } = data;

      // Redirect based on role
      if (userRole === 'admin' || userRole === 'satpam' || userRole === 'karyawan') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      return data;
    } catch (err) {
      setError(err.message || 'Login gagal.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authService.logout();
    navigate('/login');
  }, [navigate]);

  return {
    user,
    role,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;
