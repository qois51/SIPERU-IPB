import React from 'react';
import { MapPin, Clock, Users, Phone, Mail, Tag } from 'lucide-react';

const BookingInfoCard = ({ room, startTime, endTime }) => {
  if (!room) return null;

  const imageUrl = room.image_url
    ? (Array.isArray(room.image_url) ? room.image_url[0] : room.image_url)
    : 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&auto=format&fit=crop';

  const formatTime = (t) => {
    if (!t || t.includes('NaN') || t === 'undefined') return '';
    return String(t).substring(0, 5).replace(':', '.');
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #f3f4f6',
      overflow: 'hidden',
    }}>
      {/* Title */}
      <div style={{ padding: '16px 16px 0' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>
          Informasi Peminjaman
        </p>
      </div>

      {/* Room Image */}
      <div style={{ padding: '0 16px' }}>
        <img
          src={imageUrl}
          alt={room.name}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&auto=format&fit=crop';
          }}
          style={{
            width: '100%',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '10px',
          }}
        />
      </div>

      {/* Info */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Nama Ruangan</p>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{room.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <MapPin size={14} color="#6b7280" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#4b5563' }}>{room.location}</span>
        </div>

        {startTime && !startTime.includes('NaN') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#6b7280" />
            <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>
              {formatTime(startTime)} {endTime && !endTime.includes('NaN') ? `– ${formatTime(endTime)}` : ''}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={14} color="#6b7280" />
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Kapasitas: <strong>{room.capacity}</strong> Orang</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Tag size={14} color="#6b7280" />
          <span style={{ fontSize: '13px', color: '#4b5563' }}>Harga: <strong>{room.price > 0 ? `Rp ${room.price.toLocaleString('id-ID')}` : 'Gratis'}</strong></span>
        </div>
      </div>

      {/* PIC Section */}
      {room.pic_name && (
        <div style={{ borderTop: '1px solid #f3f4f6', margin: '0 16px', paddingTop: '12px', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>PIC Ruangan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#6b7280',
              flexShrink: 0,
            }}>
              👤
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{room.pic_name}</p>
              {room.pic_email && (
                <p style={{ fontSize: '11px', color: '#6b7280' }}>📧 {room.pic_email}</p>
              )}
              {room.pic_phone && (
                <p style={{ fontSize: '11px', color: '#6b7280' }}>📞 {room.pic_phone}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingInfoCard;
