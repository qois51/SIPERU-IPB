import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, ArrowLeft, Mail, Phone, User as UserIcon, Banknote } from 'lucide-react';
import api from '../../../services/api';

const RoomDetail = ({ room, onBack, onEdit, onDeleteSuccess, onZoomImage }) => {
  if (!room) return null;

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // Ensure image_url is an array
  const rawImg = room.image_url;
  const imageUrls = Array.isArray(rawImg) 
    ? rawImg 
    : (typeof rawImg === 'string' ? rawImg.split('|') : ['/loginAsset/ruanganTerdaftar.png']);

  const [mainImage, setMainImage] = useState(imageUrls[0]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setMainImage(imageUrls[0]);
    // Fetch some upcoming bookings for this room to show to admin
    const today = new Date().toISOString().split('T')[0];
    api.get(`/bookings/room/${room.id}?date=${today}`)
      .then(res => setBookings(res.data?.data || res.data || []))
      .catch(err => console.error(err));
  }, [room.id]);

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
      try {
        await api.delete(`/rooms/${room.id}`);
        showToastMsg('Ruangan berhasil dihapus!', 'success');
        setTimeout(() => {
          onDeleteSuccess();
        }, 1500);
      } catch (err) {
        console.error(err);
        showToastMsg(err.message || 'Gagal menghapus ruangan', 'error');
      }
    }
  };

  return (
    <div className="room-detail-container">
      <div className="back-link" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Kembali
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '24px' }}>{room.name}</h1>

      <div className="room-gallery">
        <div className="main-image-container" onClick={() => onZoomImage(mainImage)}>
          <img src={mainImage} alt={room.name} className="main-preview-img" />
        </div>
        {imageUrls.length > 1 && (
          <div className="thumbnail-list">
            {imageUrls.map((img, idx) => (
              <div 
                key={idx} 
                className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
              >
                <img src={img} alt={`Thumb ${idx}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="room-info-card">
        <div className="info-item">
          <div className="info-icon-box"><MapPin size={24} color="#1E3A8A" /></div>
          <div>
            <p className="info-label">Lokasi</p>
            <h4 className="info-value">{room.location}</h4>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon-box"><Users size={24} color="#1E3A8A" /></div>
          <div>
            <p className="info-label">Kapasitas</p>
            <h4 className="info-value">Kapasitas {room.capacity} Orang</h4>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon-box"><Banknote size={24} color="#1E3A8A" /></div>
          <div>
            <p className="info-label">Harga Peminjaman</p>
            <h4 className="info-value">{formatPrice(room.price || 0)} / Sesi</h4>
          </div>
        </div>

        <div className="info-item">
          <div className="info-icon-box"><Clock size={24} color="#1E3A8A" /></div>
          <div>
            <p className="info-label">Jam Operasional</p>
            <h4 className="info-value">{room.operational_hours}</h4>
          </div>
        </div>
      </div>

      <div className="facilities-section">
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Fasilitas yang tersedia</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {room.facilities.map((f, i) => (
            <span key={i} className="facility-badge">{f}</span>
          ))}
        </div>
      </div>

      <div className="pic-section">
        <div className="pic-card">
          <div className="pic-avatar" onClick={() => room.pic_image_url && onZoomImage(room.pic_image_url)} style={{ cursor: room.pic_image_url ? 'zoom-in' : 'default', overflow: 'hidden' }}>
            {room.pic_image_url ? (
              <img src={room.pic_image_url} alt={room.pic_name} style={{ width: '100%', height: '100%', object_fit: 'cover' }} />
            ) : (
              <UserIcon size={32} color="white" />
            )}
          </div>
          <div className="pic-info">
            <p className="info-label">PIC Ruangan</p>
            <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0' }}>{room.pic_name}</h4>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '4px' }}>
               <Mail size={16} /> Email: {room.pic_email}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
               <Phone size={16} /> Telepon: {room.pic_phone}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bookings-section" style={{ marginTop: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Jadwal Sewa Hari Ini</h3>
        {bookings.length > 0 ? (
          <div className="mini-table-container">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Penyewa</th>
                  <th>Waktu</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={i}>
                    <td>{b.user_name}</td>
                    <td>{b.start_time} - {b.end_time}</td>
                    <td><span className={`status-pill ${b.status.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ opacity: 0.6, fontStyle: 'italic' }}>Belum ada jadwal penyewaan untuk hari ini.</p>
        )}
      </div>
      
      <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
         <button className="btn-edit-room" onClick={onEdit}>Edit Data Ruangan</button>
         <button className="btn-delete-room" onClick={handleDelete}>Hapus Ruangan</button>
      </div>

      {/* Premium Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: toast.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: toast.type === 'success' ? '#156534' : '#991b1b',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontWeight: 600,
            fontSize: '15px'
          }}
        >
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
