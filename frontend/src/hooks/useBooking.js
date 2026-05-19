/**
 * useBooking.js — Custom hook for booking operations
 * Provides: bookings, stats, pagination info, loading, error, and action functions
 */
import { useState, useCallback } from 'react';
import bookingService from '../services/bookingService';

const useBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch current user's bookings
   */
  const fetchMyBookings = useCallback(async ({ page = 1, perPage = 10, status = null, search = null } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getMyBookings({ page, perPage, status, search });
      const { data } = response;
      setBookings(data?.bookings || []);
      setPagination(data?.pagination || null);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch dashboard stats for current user
   */
  const fetchMyStats = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getDashboardStats(userId);
      setStats(response.data?.stats || null);
      return response.data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new booking
   */
  const createBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.createBooking(bookingData);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload document for a booking
   */
  const uploadDocument = useCallback(async (bookingId, file) => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.uploadDocument(bookingId, file);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel a booking
   */
  const cancelBooking = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      await bookingService.cancelBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    stats,
    pagination,
    loading,
    error,
    fetchMyBookings,
    fetchMyStats,
    createBooking,
    uploadDocument,
    cancelBooking,
    setBookings,
    setError,
  };
};

export default useBooking;
