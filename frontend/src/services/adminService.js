
import api from './api';

const adminService = {
  
  getBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  
  approveBooking: async (bookingId, notes = '') => {
    const response = await api.put(`/bookings/${bookingId}/approve`, { notes });
    return response.data;
  },

  
  rejectBooking: async (bookingId, notes) => {
    const response = await api.put(`/bookings/${bookingId}/reject`, { notes });
    return response.data;
  },

  
  getDashboardStats: async () => {
    const response = await api.get('/bookings/dashboard/stats');
    return response.data;
  },

  
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  
  getRooms: async () => {
    const response = await api.get('/rooms/');
    return response.data;
  },

  
  createRoom: async (roomData) => {
    const response = await api.post('/rooms/', roomData);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  
  updateRoom: async (roomId, roomData) => {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },

  
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },

  
  getReportsStats: async (period = '1month') => {
    const response = await api.get('/bookings/reports/stats', { params: { period } });
    return response.data;
  },

  
  getCalendarEvents: async (year, month) => {
    const response = await api.get('/bookings/calendar/events', { params: { year, month } });
    return response.data;
  },

  
  getHelpRequests: async () => {
    const response = await api.get('/help/');
    return response.data;
  },

  replyHelpRequest: async (requestId, replyMessage) => {
    const response = await api.post(`/help/${requestId}/reply`, { reply_message: replyMessage });
    return response.data;
  },
};

export default adminService;
