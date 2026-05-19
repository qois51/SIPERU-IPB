import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Users, User, AlertCircle, X } from 'lucide-react';
import axios from 'axios';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RoomGallery from '../../components/catalog/RoomGallery';
import RoomInfoCard from '../../components/catalog/RoomInfoCard';
import DateTimePicker from '../../components/catalog/DateTimePicker';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({ date: null, slots: [] });
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch the specific room
    axios.get(`http://localhost:5000/api/rooms/${id}`)
      .then(res => {
        setRoom(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch all rooms for "Ruangan Lain" section
    axios.get('http://localhost:5000/api/rooms/')
      .then(res => setAllRooms(res.data))
      .catch(() => {});
  }, [id]);

  const getRoomImage = (r) => {
    if (r.image_url && Array.isArray(r.image_url) && r.image_url.length > 0) return r.image_url[0];
    return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop';
  };

  const getImages = (r) => {
    if (!r) return [];
    if (r.image_url && Array.isArray(r.image_url)) return r.image_url;
    return [];
  };

  const relatedRooms = allRooms.filter(r => r.id !== parseInt(id)).slice(0, 3);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleBook = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (selection.slots.length === 0) {
      showToast('Silakan pilih tanggal dan slot waktu terlebih dahulu.');
      return;
    }

    const params = new URLSearchParams();
    if (selection.date) params.set('date', selection.date);

    if (selection.slots.length > 0) {
      // Sort slots chronologically e.g. ['08:00-09:00', '09:00-10:00']
      const sortedSlots = [...selection.slots].sort();
      // start = left side of first slot: '08:00'
      const startStr = sortedSlots[0].split('-')[0];
      // end = right side of last slot: '10:00'
      const endStr = sortedSlots[sortedSlots.length - 1].split('-')[1];
      params.set('start', startStr);
      params.set('end', endStr);
    }

    navigate(`/booking/${room.id}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flexGrow: 1 }}><LoadingSpinner text="Memuat detail ruangan..." /></div>
        <Footer />
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <h2>Ruangan tidak ditemukan</h2>
          <Link to="/katalog" style={{ color: '#1e3a8a', fontWeight: 700 }}>← Kembali ke Katalog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px', width: '100%', flexGrow: 1, marginBottom: '80px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, margin: '20px 0 32px', color: '#000' }}>
          <Link to="/" style={{ color: '#000', textDecoration: 'none' }}>Beranda</Link>
          <ChevronRight size={16} strokeWidth={3} />
          <Link to="/katalog" style={{ color: '#000', textDecoration: 'none' }}>Katalog</Link>
          <ChevronRight size={16} strokeWidth={3} />
          <span style={{ color: '#1e3a8a' }}>Detail Katalog</span>
        </div>

        {/* Main 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '40px', alignItems: 'start', marginBottom: '60px' }}>

          {/* Left Column: Gallery + Calendar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <RoomGallery images={getImages(room)} />
            <DateTimePicker roomId={room.id} onSelectionChange={setSelection} />
          </div>

          {/* Right Column: Room Info + Book Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            <RoomInfoCard room={room} />

            {/* Book Button */}
            <button
              onClick={handleBook}
              style={{
                width: '100%',
                padding: '16px',
                background: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: 'pointer',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1e3a8a'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#000'; }}
            >
              {selection.slots.length > 0 ? 'Lanjutkan Peminjaman' : 'Pilih Slot Terlebih Dahulu'}
            </button>
          </div>
        </div>

        {/* Related Rooms */}
        {relatedRooms.length > 0 && (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 24px', color: '#000' }}>
              Ruangan Lain yang Mungkin Cocok
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {relatedRooms.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #1e3a8a',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img src={getRoomImage(r)} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px', color: '#000' }}>{r.name}</h4>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#000', margin: '0 0 12px' }}>{formatPrice(r.price || 0)} / Sesi</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={13} color="#1e3a8a" />
                        <span style={{ color: '#4b5563' }}>{r.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={13} color="#1e3a8a" />
                        <span style={{ color: '#4b5563' }}>Kapasitas {r.capacity} Orang</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={13} color="#1e3a8a" />
                        <span style={{ color: '#4b5563' }}>PIC: {r.pic_name || '-'}</span>
                      </div>
                    </div>
                    <Link
                      to={`/katalog/${r.id}`}
                      onClick={() => window.scrollTo(0, 0)}
                      style={{
                        marginTop: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        padding: '10px',
                        background: 'transparent',
                        border: '1px solid #1e3a8a',
                        color: '#1e3a8a',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '13px',
                        textDecoration: 'none'
                      }}
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      <Footer />

      {/* Modern Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e3a8a',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideDown 0.3s ease-out'
        }}>
          <AlertCircle size={20} color="#facc15" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
          <button 
            onClick={() => setToast({ show: false, message: '' })}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RoomDetailPage;
