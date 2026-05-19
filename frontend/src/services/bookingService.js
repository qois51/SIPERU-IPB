/**
 * bookingService.js — Booking API calls
 */
import api from './api';

const bookingService = {
  /**
   * Create new booking (with room availability checked by backend)
   */
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },
  /**
   * Update existing booking
   */
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  /**
   * Get all bookings (admin) with pagination, filter, search
   */
  getAllBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  /**
   * Get current logged-in user's bookings with pagination, filter, search
   */
  getMyBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  /**
   * Get single booking detail by ID
   */
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Get E-Pass data for a booking
   */
  getEPass: async (id) => {
    const response = await api.get(`/bookings/${id}/epass`);
    return response.data;
  },

  /**
   * Upload supporting document (surat pengantar)
   * @param {number} bookingId
   * @param {File} file
   */
  uploadDocument: async (bookingId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/bookings/${bookingId}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Download E-Pass PDF — triggers browser download
   */
  downloadEPassPDF: async (id, bookingCode) => {
    const response = await api.get(`/bookings/${id}/download-pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `epass_${bookingCode || id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Check room availability for a date
   */
  checkAvailability: async (roomId, date) => {
    const response = await api.get(`/bookings/room/${roomId}`, { params: { date } });
    return response.data;
  },

  /**
   * Cancel/Delete booking
   */
  cancelBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Get dashboard statistics (optionally by user_id)
   */
  getDashboardStats: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/bookings/dashboard/stats', { params });
    return response.data;
  },
};

export default bookingService;
