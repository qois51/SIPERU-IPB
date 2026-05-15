import React from 'react';
import axios from 'axios';

const VerificationList = ({ onViewDetail }) => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('http://localhost:5000/api/bookings/')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Memuat data pengajuan...</div>;

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
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td style={{ fontWeight: 600 }}>{item.room_name}</td>
                <td>
                  <span className="badge-day">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long' })}</span> 
                  {item.date}, {item.start_time} - {item.end_time}
                </td>
                <td>
                  <div style={{ fontWeight: 700 }}>{item.organization}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7, fontStyle: 'italic' }}>Diajukan oleh {item.user_name}</div>
                </td>
                <td>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn-detail" onClick={() => onViewDetail(item)}>Detail</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationList;
