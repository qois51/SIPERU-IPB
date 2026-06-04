
import api from './api';

const bookingService = {
  
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },
  
  updateBooking: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  },

  
  getAllBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  
  getMyBookings: async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    const params = { page, per_page: perPage };
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  
  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  
  getEPass: async (id) => {
    const response = await api.get(`/bookings/${id}/epass`);
    return response.data;
  },

  
  uploadDocument: async (bookingId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/bookings/${bookingId}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  
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

  
  checkAvailability: async (roomId, date) => {
    const response = await api.get(`/bookings/room/${roomId}`, { params: { date } });
    return response.data;
  },

  
  cancelBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },

  
  getDashboardStats: async (userId = null) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/bookings/dashboard/stats', { params });
    return response.data;
  },
};

export default bookingService;
