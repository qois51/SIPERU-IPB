
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const roomService = {
  
  getRooms: async () => {
    const response = await axios.get(`${API_URL}/rooms/`, { headers: getAuthHeaders() });
    return response.data; 
  },

  
  getRoomById: async (id) => {
    const response = await axios.get(`${API_URL}/rooms/${id}`, { headers: getAuthHeaders() });
    return response.data; 
  },
};

export default roomService;
