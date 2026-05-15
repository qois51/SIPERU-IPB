import { MapPin, Users, Clock, User, Mail, Phone, Banknote } from 'lucide-react';

const RoomInfoCard = ({ room }) => {
  if (!room) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const facilities = Array.isArray(room.facilities)
    ? room.facilities
    : typeof room.facilities === 'string'
      ? room.facilities.split(',').map(f => f.trim())
      : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, margin: 0, color: '#000' }}>
        {room.name}
      </h1>

      {/* Info Box */}
      <div style={{ border: '1px solid #1e3a8a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #d1dff9', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <MapPin size={20} color="#1e3a8a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 5px', fontWeight: 500 }}>Lokasi</p>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: 0 }}>{room.location}</p>
          </div>
        </div>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #d1dff9', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Banknote size={20} color="#1e3a8a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 5px', fontWeight: 500 }}>Harga</p>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: 0 }}>{formatPrice(room.price)} / Sesi</p>
          </div>
        </div>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #d1dff9', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Users size={20} color="#1e3a8a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 5px', fontWeight: 500 }}>Kapasitas</p>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: 0 }}>Kapasitas {room.capacity} Orang</p>
          </div>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Clock size={20} color="#1e3a8a" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 5px', fontWeight: 500 }}>Jam Operasional</p>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: 0 }}>{room.operational_hours}</p>
          </div>
        </div>
      </div>

      {/* Facilities */}
      {facilities.length > 0 && (
        <div>
          <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', margin: '0 0 12px' }}>Fasilitas yang tersedia</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {facilities.map((fac, idx) => (
              <span
                key={idx}
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {fac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PIC Card */}
      {room.pic_name && (
        <div style={{ border: '1px solid #1e3a8a', borderRadius: '12px', padding: '22px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: '#e2e8f0', overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {room.pic_image_url
              ? <img src={room.pic_image_url} alt={room.pic_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={28} color="#94a3b8" />
            }
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 5px', fontWeight: 500 }}>PIC Ruangan</p>
            <p style={{ fontSize: '18px', fontWeight: 800, color: '#000', margin: '0 0 10px' }}>{room.pic_name}</p>
            {room.pic_email && (
              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} /> {room.pic_email}
              </p>
            )}
            {room.pic_phone && (
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} /> {room.pic_phone}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomInfoCard;
