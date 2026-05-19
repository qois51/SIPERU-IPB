import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const STEPS = ['Pilih Ruangan', 'Form Booking', 'Upload Dokumen', 'Review', 'Menunggu Approval'];
const Stepper = ({ current }) => (
  <div style={{
    background: 'white',
    borderRadius: '14px',
    padding: '20px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: '32px',
    width: '100%',
    maxWidth: '800px',
  }}>
    {STEPS.map((step, i) => {
      const num = i + 1;
      const done = num < current;
      const active = num === current;
      return (
        <React.Fragment key={num}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px',
              background: done ? '#1e3a8a' : active ? '#1e3a8a' : '#f3f4f6',
              color: done || active ? 'white' : '#9ca3af',
              border: active ? '3px solid #1e3a8a' : 'none',
              boxShadow: active ? '0 0 0 4px rgba(30,58,138,0.15)' : 'none',
              transition: 'all 0.2s',
            }}>
              {done ? '✓' : num}
            </div>
            <span style={{
              fontSize: '11px', fontWeight: active ? 700 : 500,
              color: active ? '#1e3a8a' : done ? '#374151' : '#9ca3af',
              textAlign: 'center', lineHeight: 1.3,
            }}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: '2px', background: done ? '#1e3a8a' : '#e5e7eb',
              margin: '-14px 6px 0', transition: 'background 0.2s',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const BookingSuccess = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <Navbar />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        
        {/* Stepper with Step 5 active */}
        <Stepper current={5} />

        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', padding: '32px', maxWidth: '450px', width: '100%', textAlign: 'center' }}>
          {/* Success Icon */}
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>Reservasi Berhasil Diajukan!</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
            Pengajuan peminjaman ruangan Anda telah berhasil dikirim. Admin akan segera memproses permintaan Anda.
          </p>

          {/* Info Card / Next Steps Timeline */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '15px', color: '#1e3a8a', fontWeight: 700, marginBottom: '16px' }}>Apa selanjutnya?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, zIndex: 1 }}>1</div>
                  <div style={{ width: '2px', height: '100%', background: '#e2e8f0', margin: '4px 0 -16px' }}></div>
                </div>
                <div style={{ flex: 1, paddingBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>Verifikasi Dokumen</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Admin akan memverifikasi dokumen pengajuan Anda.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, zIndex: 1 }}>2</div>
                  <div style={{ width: '2px', height: '100%', background: '#e2e8f0', margin: '4px 0 -16px' }}></div>
                </div>
                <div style={{ flex: 1, paddingBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>Notifikasi Status</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Anda akan mendapat notifikasi status persetujuan.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1e3a8a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, zIndex: 1 }}>3</div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#334155', margin: 0 }}>E-Pass Tersedia</p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>Jika disetujui, E-Pass digital dapat digunakan.</p>
                </div>
              </div>

            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#1e3a8a', color: 'white', padding: '14px 24px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(30,58,138,0.2)'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Lihat Dashboard
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                background: 'white', color: '#1e3a8a', padding: '14px 24px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', border: '2px solid #e2e8f0', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <Home size={18} color="#64748b" />
              <span style={{ color: '#475569' }}>Kembali ke Beranda</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
