/**
 * exportPDF.js — Trigger PDF download from backend
 */
import bookingService from '../services/bookingService';

export const downloadEPassPDF = async (bookingId, bookingCode) => {
  try {
    await bookingService.downloadEPassPDF(bookingId, bookingCode);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
