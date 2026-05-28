/**
 * adminService.js — Admin-specific API calls
 */
import api from './api';

const adminService = {
  /**
   * Get all bookings (admin view) with pagination + filter + search
   */
  getBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  /**
   * Approve a booking (with optional notes)
   */
  approveBooking: async (bookingId, notes = '') => {
    const response = await api.put(`/bookings/${bookingId}/approve`, { notes });
    return response.data;
  },

  /**
   * Reject a booking (with required reason in notes)
   */
  rejectBooking: async (bookingId, notes) => {
    const response = await api.put(`/bookings/${bookingId}/reject`, { notes });
    return response.data;
  },

  /**
   * Get global dashboard stats (all users)
   */
  getDashboardStats: async () => {
    const response = await api.get('/bookings/dashboard/stats');
    return response.data;
  },

  /**
   * Get all users
   */
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get all rooms
   */
  getRooms: async () => {
    const response = await api.get('/rooms/');
    return response.data;
  },

  /**
   * Create a new room
   */
  createRoom: async (roomData) => {
    const response = await api.post('/rooms/', roomData);
    return response.data;
  },

  /**
   * Update a room
   */
  updateRoom: async (roomId, roomData) => {
    const response = await api.put(`/rooms/${roomId}`, roomData);
    return response.data;
  },

  /**
   * Delete a room
   */
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Get report statistics by period (1month, 6months, 1year, all)
   */
  getReportsStats: async (period = '1month') => {
    const response = await api.get('/bookings/reports/stats', { params: { period } });
    return response.data;
  },

  /**
   * Get calendar events (bookings) for a specific month/year
   */
  getCalendarEvents: async (year, month) => {
    const response = await api.get('/bookings/calendar/events', { params: { year, month } });
    return response.data;
  },
};

export default adminService;
