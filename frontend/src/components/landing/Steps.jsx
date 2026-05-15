import React from 'react';
import { Search, Calendar, FileText, QrCode } from 'lucide-react';

const Steps = () => {
  const steps = [
    { id: 1, title: 'Pilih Ruangan', desc: 'Cari di katalog, cek ketersediaan kalender', icon: Search },
    { id: 2, title: 'Isi Form Reservasi', desc: 'Kunci slot sementara (status: Pending)', icon: Calendar },
    { id: 3, title: 'Unggah Surat', desc: 'Scan surat TTD diunggah ke sistem', icon: FileText },
    { id: 4, title: 'Dapatkan E-Pass', desc: 'Setelah PIC menyetujui, E-Pass otomatis terbit', icon: QrCode },
  ];

  return (
    <section className="steps-section">
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px' }}>
        <div className="section-heading" style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px' }}>Alur Peminjaman Ruangan</h2>
          <p style={{ fontSize: '18px' }}>Proses yang mudah dan transparan dari awal hingga mendapatkan E-Pass</p>
        </div>
        
        <div className="steps-grid" style={{ gap: '32px' }}>
          {steps.map(step => (
            <div key={step.id} className="step-card" style={{ padding: '48px 32px' }}>
              <div className="step-number" style={{ width: '48px', height: '48px', fontSize: '20px', marginBottom: '24px' }}>{step.id}</div>
              <step.icon size={48} color="#1e3a8a" style={{ marginBottom: '20px' }} />
              <h4 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: 800 }}>{step.title}</h4>
              <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.5' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;
