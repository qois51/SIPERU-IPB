/**
 * constants.js — Application-wide constants
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const BOOKING_STATUSES = ['Pending', 'Approved', 'Rejected', 'CheckedIn', 'Completed'];

export const JENIS_KEGIATAN = [
  'Seminar',
  'Workshop',
  'Rapat',
  'Kuliah',
  'Pelatihan',
  'Diskusi',
  'Acara Organisasi',
  'Lainnya',
];

export const FACILITY_OPTIONS = [
  'Mikrofon',
  'AC',
  'Sound System',
  'LCD Projector',
  'Kursi Tambahan',
];

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const STEPPER_STEPS = [
  { number: 1, label: 'Pilih Ruangan' },
  { number: 2, label: 'Form Booking' },
  { number: 3, label: 'Upload Dokumen' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Menunggu Approval' },
];

export const PROGRESS_STEPS = [
  { number: 1, label: 'Reservasi Diajukan' },
  { number: 2, label: 'Menunggu Verifikasi' },
  { number: 3, label: 'Disetujui/Ditolak' },
  { number: 4, label: 'E-Pass Terbit' },
  { number: 5, label: 'Ambil Kunci' },
  { number: 6, label: 'Kembalikan Kunci' },
  { number: 7, label: 'Selesai Digunakan' },
];
