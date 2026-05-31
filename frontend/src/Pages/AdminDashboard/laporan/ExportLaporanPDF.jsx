import React, { forwardRef } from 'react';

const ExportLaporanPDF = forwardRef(({ data, period }, ref) => {
  const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const getPeriodLabel = (p) => {
    if (p === '1month') return '1 Bulan Terakhir';
    if (p === '6months') return '6 Bulan Terakhir';
    if (p === '1year') return '1 Tahun Terakhir';
    return 'Semua Periode (Keseluruhan)';
  };

  const getStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'menunggu') return 'Menunggu';
    if (s === 'approved' || s === 'disetujui') return 'Disetujui';
    if (s === 'rejected' || s === 'ditolak') return 'Ditolak';
    if (s === 'completed' || s === 'selesai') return 'Selesai';
    if (s === 'checkedin') return 'Check-In';
    if (s === 'cancelled' || s === 'batal') return 'Batal';
    return status;
  };

  const summary = data?.summary || {
    total_bookings: 0,
    total_approved: 0,
    total_completed: 0,
    total_pending: 0,
    total_rejected: 0,
    total_participants: 0,
    total_duration_hours: 0
  };

  const approvalRate = summary.total_bookings > 0 
    ? Math.round((summary.total_approved / summary.total_bookings) * 100) 
    : 0;

  return (
    <div 
      ref={ref} 
      style={{ 
        padding: '30px 30px 30px 35px', 
        fontFamily: '"Times New Roman", Times, serif', 
        color: '#1f2937', 
        background: '#fff', 
        width: '210mm', 
        minHeight: '297mm', 
        boxSizing: 'border-box' 
      }}
    >
      {/* 1. KOP SURAT RESMI */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px double #1e3a8a', paddingBottom: '14px', marginBottom: '25px' }}>
        <img
          src="/loginAsset/logologin.png"
          alt="Logo IPB"
          style={{ width: '70px', height: 'auto', objectFit: 'contain', marginRight: '20px', flexShrink: 0 }}
        />
        <div style={{ flex: 1, textAlign: 'center', marginRight: '40px' }}>
          <div style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
          <div style={{ fontSize: '16px', color: '#1e3a8a', fontWeight: 'bold', marginTop: '2px' }}>INSTITUT PERTANIAN BOGOR (IPB UNIVERSITY)</div>
          <div style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 'bold', marginTop: '1px' }}>DIREKTORAT SARANA & PRASARANA</div>
          <div style={{ fontSize: '10px', color: '#4b5563', fontStyle: 'italic', marginTop: '2px' }}>Kampus IPB Dramaga, Bogor, Jawa Barat 16680. Telp/Fax: (0251) 8622642 | Email: sarpras@apps.ipb.ac.id</div>
        </div>
      </div>

      {/* 2. JUDUL LAPORAN */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline' }}>
          Laporan Statistik Penggunaan Ruangan & Fasilitas
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 'bold' }}>
          Periode Analisis: {getPeriodLabel(period)}
        </p>
      </div>

      {/* 3. METADATA & EXECUTIVE SUMMARY CARDS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        {/* Left info box */}
        <div style={{ flex: 1.2, background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '11px', color: '#1e3a8a', fontWeight: 'bold', borderBottom: '1px solid #94a3b8', paddingBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Informasi Dokumen Laporan
          </h3>
          <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', lineHeight: '1.6' }}>
            <tbody>
              <tr><td style={{ width: '38%', color: '#475569' }}>Dicetak Oleh</td><td style={{ fontWeight: 'bold' }}>: Administrator Sistem (SIPBeru)</td></tr>
              <tr><td style={{ color: '#475569' }}>Klasifikasi Dokumen</td><td style={{ fontWeight: 'bold' }}>: Internal Akademik Resmi</td></tr>
              <tr><td style={{ color: '#475569' }}>Tanggal Pembuatan</td><td style={{ fontWeight: 'bold' }}>: {currentDate}</td></tr>
              <tr><td style={{ color: '#475569' }}>Waktu Sinkronisasi</td><td style={{ fontWeight: 'bold' }}>: {currentTime} WIB</td></tr>
              <tr><td style={{ color: '#475569' }}>Total Rekam Aktivitas</td><td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>: {summary.total_bookings} Data Terpilih</td></tr>
            </tbody>
          </table>
        </div>

        {/* Right metrics grid */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1', marginBottom: '4px' }}>{summary.total_bookings}</div>
            <div style={{ fontSize: '8px', color: '#3b82f6', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TOTAL PENGAJUAN</div>
          </div>
          <div style={{ background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857', lineHeight: '1', marginBottom: '4px' }}>{approvalRate}%</div>
            <div style={{ fontSize: '8px', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TINGKAT APPROVAL</div>
          </div>
          <div style={{ background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#b45309', lineHeight: '1', marginBottom: '4px' }}>{summary.total_duration_hours}</div>
            <div style={{ fontSize: '8px', color: '#d97706', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TOTAL DURASI (JAM)</div>
          </div>
          <div style={{ background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b21a8', lineHeight: '1', marginBottom: '4px' }}>{summary.total_participants}</div>
            <div style={{ fontSize: '8px', color: '#8b5cf6', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TOTAL PARTISIPAN</div>
          </div>
        </div>
      </div>

      {/* 4. SEKSI ANALISIS RUANGAN & DEPARTEMEN */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', pageBreakInside: 'avoid' }}>
        {/* Table Rooms ranking */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '3px' }}>
            A. Intensitas Penggunaan Ruangan
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: 'white' }}>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>No</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Nama Ruangan</th>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Frekuensi</th>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Total Jam</th>
              </tr>
            </thead>
            <tbody>
              {data?.by_room && data.by_room.length > 0 ? (
                data.by_room.slice(0, 5).map((room, idx) => (
                  <tr key={room.room_name} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                    <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{room.room_name}</td>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{room.count} Kali</td>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{room.hours} Jam</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1', fontStyle: 'italic' }}>
                    Belum ada data peminjaman ruangan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Department ranking */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '3px' }}>
            B. Departemen / Studi Teraktif
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: 'white' }}>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>No</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Program Studi / Departemen</th>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Total Ajuan</th>
              </tr>
            </thead>
            <tbody>
              {data?.by_department && data.by_department.length > 0 ? (
                data.by_department.slice(0, 5).map((dept, idx) => (
                  <tr key={dept.program_studi} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                    <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{dept.program_studi}</td>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{dept.count} Booking</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1', fontStyle: 'italic' }}>
                    Belum ada data peminjaman departemen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SEKSI ANALISIS ORGANISASI & STATUS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', pageBreakInside: 'avoid' }}>
        {/* Table Organizations ranking */}
        <div style={{ flex: 1.2 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '3px' }}>
            C. Aktivitas Peminjaman Unit / Organisasi
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: 'white' }}>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>No</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Nama Unit / Organisasi Civitas</th>
                <th style={{ padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Frekuensi</th>
              </tr>
            </thead>
            <tbody>
              {data?.by_organization && data.by_organization.length > 0 ? (
                data.by_organization.slice(0, 5).map((org, idx) => (
                  <tr key={org.organization} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{idx + 1}</td>
                    <td style={{ padding: '5px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{org.organization}</td>
                    <td style={{ padding: '5px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{org.count} Peminjaman</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1', fontStyle: 'italic' }}>
                    Belum ada data peminjaman organisasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Status breakdown list */}
        <div style={{ flex: 0.8, background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '11px', color: '#475569', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '3px', textTransform: 'uppercase' }}>
            Status Berkas Ajuan:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '10px' }}>
            {data?.status_breakdown ? (
              Object.entries(data.status_breakdown)
                .filter(([_, val]) => val > 0)
                .map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ fontWeight: 'bold', color: '#4b5563' }}>● {getStatusLabel(key)}:</span>
                    <span style={{ fontWeight: 'bold' }}>{val} Berkas</span>
                  </div>
                ))
            ) : (
              <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>Tidak ada berkas.</div>
            )}
          </div>
        </div>
      </div>

      {/* Page Break here for attaching detailed logs */}
      <div style={{ pageBreakBefore: 'always' }} />

      {/* 6. LAMPIRAN RINCIAN HISTORI PEMINJAMAN */}
      <h3 style={{ margin: '20px 0 10px', fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1.5px solid #1e3a8a', paddingBottom: '3px' }}>
        D. Lampiran - Rincian Histori Peminjaman Ruangan
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginBottom: '35px' }}>
        <thead>
          <tr style={{ background: '#1e3a8a', color: 'white' }}>
            <th style={{ padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1' }}>No</th>
            <th style={{ padding: '6px 4px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Kode Booking</th>
            <th style={{ padding: '6px 4px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Nama Ruangan</th>
            <th style={{ padding: '6px 4px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Program Studi</th>
            <th style={{ padding: '6px 4px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Kegiatan / Peminjam</th>
            <th style={{ padding: '6px 4px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Waktu Kegiatan</th>
            <th style={{ padding: '6px 4px', textAlign: 'center', border: '1px solid #cbd5e1' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.bookings && data.bookings.length > 0 ? (
            data.bookings.map((b, idx) => (
              <tr key={b.id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '5px 4px', textAlign: 'center', border: '1px solid #cbd5e1', color: '#64748b' }}>{idx + 1}</td>
                <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1', fontWeight: 'bold', fontFamily: 'monospace' }}>{b.booking_code || '-'}</td>
                <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1' }}>{b.room_name}</td>
                <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1' }}>{b.program_studi || 'Umum'}</td>
                <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: 'bold' }}>{b.activity_name}</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>{b.nama_peminjam || '-'} ({b.organization || '-'})</div>
                </td>
                <td style={{ padding: '5px 4px', border: '1px solid #cbd5e1' }}>
                  <div>{b.date ? b.date.split('-').reverse().join('/') : '-'}</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>{b.start_time.replace(':', '.')} - {b.end_time.replace(':', '.')} WIB</div>
                </td>
                <td style={{ padding: '5px 4px', textAlign: 'center', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>
                  {getStatusLabel(b.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ padding: '15px', textAlign: 'center', border: '1px solid #cbd5e1', fontStyle: 'italic', color: '#64748b' }}>
                Tidak ada riwayat peminjaman ruangan dalam periode ini.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 7. BLOK TANDA TANGAN (SIGNATURE BLOCK) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pageBreakInside: 'avoid', marginTop: '30px' }}>
        <div style={{ width: '40%', fontSize: '10px', color: '#4b5563', lineHeight: '1.5' }}>
          <strong>Catatan Penting:</strong><br/>
          1. Dokumen ini disahkan secara digital oleh server SIPBeru IPB University.<br/>
          2. Statistik di atas mencakup seluruh riwayat pengajuan peminjaman ruangan yang valid secara hukum.
        </div>
        <div style={{ textAlign: 'center', width: '40%', fontSize: '11px' }}>
          <div>Bogor, {currentDate}</div>
          <div style={{ marginTop: '2px', fontWeight: 'bold' }}>Menyetujui / Mengesahkan,</div>
          <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Direktur Sarana & Prasarana IPB</div>
          
          {/* Spacing for physical signature or stamp */}
          <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '9px', color: '#cbd5e1', border: '1px dashed #cbd5e1', padding: '6px 12px', borderRadius: '4px' }}>
              STAMPEL & PARAF DIGITAL RESMI
            </div>
          </div>
          
          <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Dr. Ir. H. Ahmad Fauzi, M.T.</div>
          <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '1px' }}>NIP. 197408121999031002</div>
        </div>
      </div>

      {/* FOOTER PADA HALAMAN DOKUMEN */}
      <div style={{ borderTop: '1px solid #cbd5e1', marginTop: '30px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#9ca3af' }}>
        <div>SIPBeru IPB University — Sistem Informasi Peminjaman Ruangan Akademik</div>
        <div>Halaman Lampiran Cetak | Tanggal Unduh: {currentDate} pukul {currentTime} WIB</div>
      </div>
    </div>
  );
});

ExportLaporanPDF.displayName = 'ExportLaporanPDF';
export default ExportLaporanPDF;
