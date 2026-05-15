import React from 'react';
import StatCard from '../adminDashboard/StatCard';

const LoginStats = () => {
  return (
    <div className="login-left">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
        <img src="/loginAsset/logologin.png" alt="Logo SIPBeru" style={{ width: '130px', height: 'auto' }} />
        <div>
          <h1 style={{ fontSize: '54px', fontWeight: 800, lineHeight: '1.0' }}>
            S<span style={{ color: '#fbbf24' }}>IPB</span>eru
          </h1>
          <p style={{ fontSize: '24px', color: '#fbbf24', fontWeight: 600 }}>Sistem Peminjaman Ruangan</p>
        </div>
      </div>

      <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', opacity: 0.9 }}>
        Platform untuk meminjam tempat untuk kebutuhan kuliah atau acara dengan cara yang lebih mudah, cepat, dan transparan.
      </p>

      <div className="stats-grid">
        <StatCard imgSrc="/loginAsset/cardIcon/ruanganTerdaftar.png" value="550+" label="Ruangan Terdaftar" />
        <StatCard imgSrc="/loginAsset/cardIcon/mahasiswaAktif.png" value="16,500+" label="Mahasiswa Aktif" />
        <StatCard imgSrc="/loginAsset/cardIcon/peminjamanBerhasil.png" value="5,500+" label="Peminjaman Berhasil" />
        <StatCard imgSrc="/loginAsset/cardIcon/ratarataWaktu.png" value="< 4 Jam" label="Rata-Rata Waktu Approval" />
      </div>
    </div>
  );
};

export default LoginStats;
