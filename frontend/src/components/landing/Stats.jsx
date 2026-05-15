import React from 'react';

const Stats = () => {
  const statItems = [
    { imgSrc: "/loginAsset/cardIcon/ruanganTerdaftar.png", value: "550+", label: "Ruangan Terdaftar" },
    { imgSrc: "/loginAsset/cardIcon/mahasiswaAktif.png", value: "16,500+", label: "Mahasiswa Aktif" },
    { imgSrc: "/loginAsset/cardIcon/peminjamanBerhasil.png", value: "8,500+", label: "Peminjaman Berhasil" },
    { imgSrc: "/loginAsset/cardIcon/ratarataWaktu.png", value: "< 4 Jam", label: "Rata-rata Waktu Approval" }
  ];

  return (
    <section className="stats-bar">
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', width: '100%' }}>
        {statItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
              <img src={item.imgSrc} alt={item.label} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '36px', fontWeight: 800, color: '#fbbf24', margin: 0, lineHeight: '1.1' }}>{item.value}</h3>
              <p style={{ fontSize: '15px', color: 'white', margin: '6px 0 0', opacity: 0.95, fontWeight: 500 }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
