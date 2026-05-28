import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, Share2, User, BookOpen, MapPin, Clock, Users, Mail, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingStepper from '../../components/booking/BookingStepper';
import BookingStatusBadge from '../../components/common/BookingStatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import bookingService from '../../services/bookingService';
import { PROGRESS_STEPS } from '../../utils/constants';
import { formatDateID, formatTimeRange } from '../../utils/formatDate';

// Map booking status to progress step
// The stepper marks steps < currentStep as completed (checkmark)
const statusToStep = {
  Draft:     1,
  Pending:   3,   // steps 1,2 checked
  Rejected:  3,   // steps 1,2 checked, step 3 shows rejected
  Approved:  5,   // steps 1-4 checked (including E-Pass Terbit)
  CheckedIn: 6,   // steps 1-5 checked (including Ambil Kunci)
  Completed: 8,   // steps 1-7 ALL checked (6+7 together)
  Expired:   8,
};

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(id);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!booking) return;
    await bookingService.downloadEPassPDF(booking.id, booking.booking_code);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flexGrow: 1 }}><LoadingSpinner text="Memuat detail booking..." /></div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Booking tidak ditemukan.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const progressStep = statusToStep[booking.status] || 1;
  const qrValue = `SIPERU|${booking.booking_code}|${booking.nama_peminjam || ''}|${booking.room_name || ''}|${booking.date}|${booking.start_time}-${booking.end_time}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <Navbar />

      <div style={{ flexGrow: 1, paddingTop: '24px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Dashboard</Link>
            <span>&gt;</span>
            <span style={{ color: '#1e3a8a', fontWeight: 500 }}>Detail E-Pass</span>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Detail E-Pass</h1>
          {booking.status === 'Approved' || booking.status === 'CheckedIn' ? (
            <p style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 700, marginBottom: '24px' }}>{booking.booking_code}</p>
          ) : booking.status === 'Completed' || booking.status === 'Expired' ? (
            <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: 700, marginBottom: '24px' }}>{booking.booking_code} — EXPIRED</p>
          ) : (
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>Kode booking tersedia setelah disetujui</p>
          )}

          {/* Progress Stepper */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Progres Pengajuan</h3>
            <BookingStepper currentStep={progressStep} steps={PROGRESS_STEPS} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Left: Booking Info */}
            <div>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', marginBottom: '16px' }}>Informasi Booking</h2>

                {/* Data Peminjam */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fde047', color: '#1e3a8a', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <User size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Data Peminjam</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  {[
                    ['Nama Peminjam', booking.nama_peminjam],
                    ['NIM/NIP', booking.nim_nip],
                    ['Program Studi/unit', booking.program_studi],
                    ['Email Aktif', booking.email],
                    ['Nomor HP Aktif', booking.nomor_hp],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>{label}</label>
                      <div style={{ padding: '12px 16px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        {value || '-'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Data Kegiatan */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fde047', color: '#1e3a8a', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <BookOpen size={18} />
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>Data Kegiatan</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {[
                    ['Nama Kegiatan', booking.activity_name],
                    ['Jenis Kegiatan', booking.jenis_kegiatan],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>{label}</label>
                      <div style={{ padding: '12px 16px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                        {value || '-'}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>Deskripsi Kegiatan</label>
                    <div style={{ padding: '12px 16px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: '#1f2937', minHeight: '80px' }}>
                      {booking.deskripsi_kegiatan || '-'}
                    </div>
                  </div>
                  
                  {/* Fasilitas Tambahan */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '6px' }}>Fasilitas Tambahan</label>
                    <div style={{ padding: '12px 16px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '8px', minHeight: '50px' }}>
                      {booking.facilities && booking.facilities.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(Array.isArray(booking.facilities) ? booking.facilities : booking.facilities.split(',')).map((fac, idx) => (
                            <span key={idx} style={{ 
                              background: '#1e3a8a', color: 'white', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 
                            }}>
                              {typeof fac === 'object' ? fac.name : fac}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280' }}>Tidak ada fasilitas tambahan</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes (dynamic color based on status) */}
                {booking.notes && (
                  <div style={{ 
                    background: (booking.status === 'Approved' || booking.status === 'CheckedIn' || booking.status === 'Completed') ? '#f0fdf4' : booking.status === 'Rejected' ? '#fef2f2' : '#fefce8', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    border: `1px solid ${(booking.status === 'Approved' || booking.status === 'CheckedIn' || booking.status === 'Completed') ? '#bbf7d0' : booking.status === 'Rejected' ? '#fecaca' : '#fef08a'}` 
                  }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: (booking.status === 'Approved' || booking.status === 'CheckedIn' || booking.status === 'Completed') ? '#166534' : booking.status === 'Rejected' ? '#991b1b' : '#854d0e', 
                      marginBottom: '4px' 
                    }}>Catatan Admin:</p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: (booking.status === 'Approved' || booking.status === 'CheckedIn' || booking.status === 'Completed') ? '#15803d' : booking.status === 'Rejected' ? '#b91c1c' : '#ca8a04' 
                    }}>{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: E-Pass Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* E-Pass Digital */}
              <div style={{ background: '#2f458d', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>E-Pass Digital</p>                  <p style={{ color: '#fde047', fontWeight: 800, fontSize: '16px', marginBottom: '24px' }}>
                    {booking.status === 'Approved' || booking.status === 'CheckedIn' 
                      ? booking.booking_code 
                      : booking.status === 'Completed' || booking.status === 'Expired'
                        ? `${booking.booking_code} — EXPIRED`
                        : booking.status === 'Rejected'
                          ? 'Ditolak'
                          : 'Menunggu Persetujuan'}
                  </p>
                  
                  {/* QR Code */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'white', borderRadius: '12px', marginBottom: '20px', width: '200px', height: '200px' }}>
                    {booking.status === 'Approved' || booking.status === 'CheckedIn' ? (
                      <QRCodeSVG value={qrValue} size={168} fgColor="#000000" level="M" />
                    ) : booking.status === 'Completed' || booking.status === 'Expired' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>EXPIRED</span>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>E-Pass tidak berlaku</div>
                      </div>
                    ) : booking.status === 'Rejected' ? (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '6px' }}>DITOLAK</span>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Pengajuan ditolak admin</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#9ca3af', textAlign: 'center' }}>QR Code Belum Tersedia</span>
                    )}
                  </div>
 
                  {/* Info */}
                  <p style={{ fontSize: '15px', color: 'white', margin: '0 0 4px' }}>{booking.room_name}</p>
                  <p style={{ fontSize: '13px', color: '#bfdbfe', margin: '0 0 4px' }}>{booking.room_location || 'Gedung Rektorat, Lantai 4'}</p>
                  <p style={{ fontSize: '14px', color: 'white', margin: '0 0 4px' }}>{formatDateID(booking.date)}</p>
                  <p style={{ fontSize: '14px', color: 'white', margin: '0 0 4px' }}>{formatTimeRange(booking.start_time, booking.end_time)}</p>
                  <p style={{ fontSize: '14px', color: 'white', margin: '0 0 16px' }}>{booking.nama_peminjam}</p>
                  
                  {/* Status Badge */}
                  <div style={{ display: 'inline-block', padding: '6px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 600,
                    background: booking.status === 'Approved' ? '#22c55e' : booking.status === 'CheckedIn' ? '#2563eb' : booking.status === 'Completed' || booking.status === 'Expired' || booking.status === 'Rejected' ? '#dc2626' : '#eab308',
                    color: 'white'
                  }}>
                    {booking.status === 'Approved' 
                      ? 'Valid' 
                      : booking.status === 'CheckedIn' 
                        ? 'Sedang Digunakan' 
                        : booking.status === 'Completed' || booking.status === 'Expired' 
                          ? 'EXPIRED' 
                          : booking.status === 'Rejected'
                            ? 'Ditolak'
                            : 'Menunggu Persetujuan'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'Approved' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={handleDownloadPDF}
                    style={{ background: '#facc15', color: '#854d0e', fontWeight: 700, padding: '12px', border: '1px solid #eab308', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fde047'}
                    onMouseOut={e => e.currentTarget.style.background = '#facc15'}
                  >
                    Unduh E-Pass Digital
                  </button>
                  <button
                    style={{ background: 'white', color: '#1e3a8a', fontWeight: 700, padding: '12px', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background = 'white'}
                  >
                    Bagikan E-Pass
                  </button>
                </div>
              )}

              {/* Ringkasan Peminjaman */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1f2937', marginBottom: '16px' }}>Ringkasan Peminjaman</h4>
                {/* Fallback image if no room image available */}
                <div style={{ width: '100%', height: '140px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px' }}>Nama Ruangan</p>
                    <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>{booking.room_name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px' }}>Lokasi</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{booking.room_location || 'Gedung Rektorat, Lantai 4'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px' }}>Jam</p>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>{formatTimeRange(booking.start_time, booking.end_time).replace('WIB', '').trim()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 2px' }}>Harga</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {booking.room_price != null
                        ? `Rp ${booking.room_price.toLocaleString('id-ID')} / Sesi`
                        : 'Gratis'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PIC Ruangan */}
              <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>PIC Ruangan</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {booking.room_pic_image_url ? (
                      <img src={booking.room_pic_image_url} alt={booking.room_pic_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>{booking.room_pic_name || '-'}</p>
                    {booking.room_pic_email && <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} /> {booking.room_pic_email}</p>}
                    {booking.room_pic_phone && <p style={{ fontSize: '11px', color: '#475569', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> {booking.room_pic_phone}</p>}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingDetail;
