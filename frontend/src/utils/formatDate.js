/**
 * formatDate.js — Date formatting utilities for Indonesia locale
 */

/**
 * Format date string to Indonesian format: "13 Mei 2026"
 */
export const formatDateID = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format date string to short format: "13/05/2026"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format time range: "14.00 - 17.00"
 */
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '-';
  const fmt = (t) => t.replace(':', '.');
  return `${fmt(startTime)} - ${fmt(endTime)}`;
};

/**
 * Format ISO datetime to relative: "2 jam lalu"
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return formatDateID(dateStr);
};
