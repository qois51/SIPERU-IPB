import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';

const RoomList = ({ onViewDetail, onAddRoom, onZoomImage }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await adminService.getRooms();
        const roomData = res.data?.rooms || res.rooms || res.data || res || [];
        setRooms(Array.isArray(roomData) ? roomData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) return <LoadingSpinner text="Memuat data ruangan..." />;

  return (
    <div className="room-list-container">
      <div className="admin-page-header">
        <h2 className="admin-page-title">KELOLA RUANGAN</h2>
        <button className="btn-primary" onClick={onAddRoom} style={{ width: 'auto', padding: '10px 24px' }}>
          + Tambah Ruangan Baru
        </button>
      </div>
      <div className="room-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card" onClick={() => onViewDetail(room)}>
            <div className="room-img-wrapper" onClick={(e) => { 
              e.stopPropagation(); 
              const rawImg = room.image_url;
              const imageUrls = Array.isArray(rawImg) ? rawImg : (typeof rawImg === 'string' ? rawImg.split('|') : []);
              const firstImg = imageUrls[0] || '/loginAsset/ruanganTerdaftar.png';
              onZoomImage(firstImg); 
            }}>
               <img 
                 src={(() => {
                   const rawImg = room.image_url;
                   const imageUrls = Array.isArray(rawImg) ? rawImg : (typeof rawImg === 'string' ? rawImg.split('|') : []);
                   return imageUrls[0] || '/loginAsset/ruanganTerdaftar.png';
                 })()} 
                 alt={room.name} 
                 style={{ cursor: 'zoom-in' }} 
               />
            </div>
            <div className="room-card-info">
              <h4>{room.name}</h4>
              <p style={{ fontSize: '13px', opacity: 0.7, margin: '0 0 4px' }}>{room.location}</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(room.price || 0)}
              </p>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{room.capacity} Orang</span>
                <button className="btn-view-room">Kelola</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
