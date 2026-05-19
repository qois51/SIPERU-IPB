import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — Melindungi rute berdasarkan status login dan role pengguna.
 * 
 * Props:
 * - allowedRoles: array role yang diizinkan (contoh: ['admin', 'satpam'])
 *   Jika kosong/tidak diisi, hanya memerlukan login tanpa batasan role.
 * - redirectTo: halaman tujuan redirect jika akses ditolak (default: '/')
 */
const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = '/' }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Belum login → redirect ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Sudah login tapi role tidak diizinkan → redirect ke halaman asal
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
