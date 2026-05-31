import React from 'react';

const Rules = () => {
  const rules = [
    { 
      id: 1, 
      title: 'Akun Mahasiswa Aktif', 
      desc: 'Peminjam harus merupakan mahasiswa aktif yang terdaftar di sistem. Login menggunakan NIM dan password yang diberikan pihak kampus.',
      color: '#1e3a8a'
    },
    { 
      id: 2, 
      title: 'Surat Pengajuan Resmi', 
      desc: 'Wajib melampirkan scan surat pengajuan yang telah ditandatangani oleh Ketua Organisasi/Kepala Departemen/Pejabat berwenang.',
      color: '#059669'
    },
    { 
      id: 3, 
      title: 'Pengajuan Minimal 3 Hari Kerja', 
      desc: 'Peminjaman harus diajukan minimal 3 hari kerja sebelum tanggal penggunaan ruangan agar PIC memiliki cukup waktu untuk verifikasi.',
      color: '#b91c1c'
    },
    { 
      id: 4, 
      title: 'Kegiatan Akademik & Non-Akademik Resmi', 
      desc: 'Ruangan hanya dapat dipinjam untuk kegiatan yang bersifat formal seperti seminar, pelatihan, rapat organisasi resmi, atau kepanitiaan kampus.',
      color: '#d97706'
    },
    { 
      id: 5, 
      title: 'Kondisi Ruangan Dikembalikan Semula', 
      desc: 'Peminjam bertanggung jawab atas kebersihan dan kerapian ruangan. Peralatan harus dikembalikan pada posisi semula setelah kegiatan selesai.',
      color: '#1e3a8a'
    },
    { 
      id: 6, 
      title: 'E-Pass Wajib Ditunjukkan di Lokasi', 
      desc: 'Saat tiba di ruangan, mahasiswa wajib menunjukkan E-Pass digital kepada Penjaga Ruangan untuk proses scan QR Code dan verifikasi identitas.',
      color: '#1e3a8a'
    },
  ];

  return (
    <section id="rules" className="rules-section">
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px' }}>
        <div className="section-heading" style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px' }}>Ketentuan Peminjaman Ruangan</h2>
          <p style={{ fontSize: '18px' }}>Dirancang Khusus untuk kemudahan mahasiswa. PIC Ruangan, dan Penjaga RUangan dalam mengelola peminjaman fasilitas kampus</p>
        </div>

        <div className="rules-grid" style={{ gap: '32px', padding: 0 }}>
          {rules.map(rule => (
            <div key={rule.id} className="rule-item" style={{ padding: '28px', gap: '20px' }}>
              <div className="rule-number" style={{ backgroundColor: rule.color, width: '42px', height: '42px', fontSize: '18px' }}>{rule.id}</div>
              <div>
                <h5 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{rule.title}</h5>
                <p style={{ fontSize: '14px', opacity: 0.75, margin: '6px 0 0', lineHeight: '1.5' }}>{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Rules;
