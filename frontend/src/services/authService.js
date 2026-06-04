
import api from './api';

const authService = {
  
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { access_token, role, user } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  },

  
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  
  getRole: () => localStorage.getItem('role'),

  
  isAuthenticated: () => !!localStorage.getItem('token'),

  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
