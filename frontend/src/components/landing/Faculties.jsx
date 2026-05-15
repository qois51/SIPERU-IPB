import React from 'react';

const Faculties = () => {
  const faculties = [
    { name: 'FPIK', color: '#3b82f6' },
    { name: 'FAPERTA', color: '#10b981' },
    { name: 'FMIPA', color: '#6366f1' },
    { name: 'FAHUTAN', color: '#4b5563' },
    { name: 'FAPET', color: '#b45309' },
    { name: 'FEM', color: '#f59e0b' },
    { name: 'FK', color: '#10b981' },
    { name: 'FEMA', color: '#0891b2' },
  ];

  return (
    <section className="faculties-section">
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px' }}>
        <div className="section-heading" style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px' }}>Butuh Ruangan di <span style={{ color: '#1e3a8a' }}>Fakultas Kamu?</span></h2>
          <p style={{ fontSize: '18px' }}>Ajukan peminjaman ruangan dengan lebih mudah sesuai fakultas untuk mendukung kegiatan akademik, organisasi, seminar, maupun diskusi mahasiswa.</p>
        </div>

        <img
          src="/landing/faculties/fakultas.png"
          alt="Fakultas IPB University"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </section>
  );
};

export default Faculties;
