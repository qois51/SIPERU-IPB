import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Users, User } from 'lucide-react';
import axios from 'axios';

const RoomCatalog = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const fallbackRooms = [
    { id: 1, name: 'Ruang Seminar A', location: 'Gedung Rektorat, Lantai 4', capacity: 30, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop' },
    { id: 2, name: 'Ruang Seminar B', location: 'Gedung Rektorat, Lantai 4', capacity: 30, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop' },
    { id: 3, name: 'Ruang Seminar C', location: 'Gedung Rektorat, Lantai 4', capacity: 30, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop' },
  ];

  useEffect(() => {
    axios.get('http://localhost:5000/api/rooms/')
      .then(res => {
        if (res.data && res.data.length > 0) {
          // Take up to 3 rooms for the landing page display
          setRooms(res.data.slice(0, 3));
        } else {
          setRooms(fallbackRooms);
        }
      })
      .catch(err => {
        console.error("Error fetching rooms, using fallbacks:", err);
        setRooms(fallbackRooms);
      });
  }, []);

  const displayRooms = rooms.length > 0 ? rooms : fallbackRooms;

  const getRoomImage = (room) => {
    if (room.image_url && Array.isArray(room.image_url) && room.image_url.length > 0) {
      return room.image_url[0];
    }
    if (room.image) return room.image;
    return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop';
  };

  return (
    <section className="catalog-section" style={{ padding: '80px 0', background: '#F3F6FF' }}>
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px' }}>
        <div className="section-heading" style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px' }}>Temukan Ruangan yang Tepat</h2>
          <p style={{ fontSize: '18px' }}>Beragam pilihan ruangan untuk seminar, rapat dan kepanitiaan</p>
        </div>

        <div className="room-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {displayRooms.map((room, idx) => (
            <div key={room.id || idx} style={{ background: 'white', borderRadius: '12px', border: '1px solid #1e3a8a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
                <img 
                  src={getRoomImage(room)} 
                  alt={room.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#000' }}>{room.name}</h4>
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#000', margin: '0 0 16px' }}>{formatPrice(room.price || 0)} / Sesi</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#1e3a8a', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={16} style={{ flexShrink: 0 }} /> 
                    <span style={{ color: '#4b5563' }}>{room.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} style={{ flexShrink: 0 }} /> 
                    <span style={{ color: '#4b5563' }}>Kapasitas {room.capacity} Orang</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <User size={16} style={{ flexShrink: 0 }} /> 
                    <span style={{ color: '#4b5563' }}>PIC: {room.pic_name || room.pic || 'Bpk Hendra, M.T'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/katalog/${room.id}`)}
                  style={{ 
                    marginTop: 'auto', 
                    width: '100%', 
                    padding: '12px', 
                    background: 'transparent', 
                    border: '1px solid #1e3a8a', 
                    color: '#1e3a8a', 
                    borderRadius: '6px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
          <Link
            to="/katalog"
            style={{ 
              display: 'block',
              width: '100%', 
              padding: '14px', 
              background: '#1e3a8a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 700, 
              fontSize: '16px', 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
              textAlign: 'center',
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            Lihat Semua Ruangan
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RoomCatalog;
