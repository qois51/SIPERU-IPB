/**
 * roomService.js — Room API calls
 * NOTE: Backend room endpoints return plain objects (not wrapped in {success, data})
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const roomService = {
  /**
   * Get all rooms — returns array of room objects
   */
  getRooms: async () => {
    const response = await axios.get(`${API_URL}/rooms/`, { headers: getAuthHeaders() });
    return response.data; // returns array directly
  },

  /**
   * Get room detail by ID — returns single room object
   */
  getRoomById: async (id) => {
    const response = await axios.get(`${API_URL}/rooms/${id}`, { headers: getAuthHeaders() });
    return response.data; // returns object directly
  },
};

export default roomService;
