import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="cta-section">
      <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>Siap Ajukan Peminjaman Ruangan?</h2>
      <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '800px', margin: '0 auto' }}>
        Ribuan Mahasiswa telah menggunakan SIPBeru untuk kegiatan mereka. <br />
        Birokrasi lebih mudah, peminjaman lebih nyaman.
      </p>
      
      <div className="cta-buttons">
        <Link to="/login" className="btn-cta-primary">Pinjam Sekarang</Link>
        <Link to="/katalog" className="btn-cta-outline">Lihat Katalog</Link>
      </div>
    </section>
  );
};

export default CTA;
