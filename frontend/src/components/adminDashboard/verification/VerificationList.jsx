import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';

const VerificationList = ({ onViewDetail }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await adminService.getBookings({ perPage: 100 });
        // Backend returns { success, message, data: { bookings: [...], pagination } }
        const allBookings = res.data?.bookings || res.bookings || [];
        // Exclude Draft — those are not yet submitted by the user
        setData(allBookings.filter(b => b.status !== 'Draft'));
      } catch (err) {
        console.error('Failed to fetch verification list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <LoadingSpinner text="Memuat data pengajuan..." />;

  return (
    <div className="verification-list">
      <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Daftar Pengajuan Peminjaman</h3>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Ruangan</th>
              <th>Jadwal</th>
              <th>Nama Peminjam</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                  Belum ada data pengajuan.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{ fontWeight: 600 }}>{item.room_name}</td>
                  <td>
                    <span className="badge-day">
                      {item.date ? new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long' }) : '-'}
                    </span> 
                    {item.date}, {item.start_time} - {item.end_time}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{item.organization}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>
                      Diajukan oleh {item.user_name}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${item.status?.toLowerCase() || 'pending'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn-detail" onClick={() => onViewDetail(item)}>
                      Detail
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationList;
