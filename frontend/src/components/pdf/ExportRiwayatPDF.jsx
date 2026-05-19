import React, { forwardRef } from 'react';
import { formatDateShort, formatTimeRange } from '../../utils/formatDate';

const ExportRiwayatPDF = forwardRef(({ bookings, user }, ref) => {
  const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const totalPengajuan = bookings.length;
  const totalApproved = bookings.filter(b => b.status === 'Approved').length;
  const totalRejected = bookings.filter(b => b.status === 'Rejected').length;
  const totalCompleted = bookings.filter(b => b.status === 'Completed').length;
  const totalPending = bookings.filter(b => b.status === 'Pending').length;
  const approvalRate = totalPengajuan > 0 ? Math.round((totalApproved + totalCompleted) / totalPengajuan * 100) : 0;

  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'menunggu') return { bg: '#fef3c7', text: '#d97706', label: 'Menunggu' };
    if (s === 'approved' || s === 'disetujui') return { bg: '#dbeafe', text: '#1d4ed8', label: 'Disetujui' };
    if (s === 'rejected' || s === 'ditolak') return { bg: '#fee2e2', text: '#b91c1c', label: 'Ditolak' };
    if (s === 'completed' || s === 'selesai') return { bg: '#d1fae5', text: '#047857', label: 'Selesai' };
    return { bg: '#f3f4f6', text: '#374151', label: status || '-' };
  };

  // Format booking code: use booking_code field, or fallback to BK-YYYY-XXXX, or "-"
  const formatBookingCode = (booking) => {
    const s = (booking.status || '').toLowerCase();
    if (['pending', 'menunggu', 'rejected', 'ditolak', 'draft'].includes(s)) {
      return '-';
    }
    if (booking.booking_code) return booking.booking_code;
    if (booking.id) return `BK-${new Date().getFullYear()}-${booking.id.toString().padStart(4, '0')}`;
    return '-';
  };

  return (
    <div ref={ref} style={{ padding: '25px 25px 25px 30px', fontFamily: '"Times New Roman", Times, serif', color: '#1f2937', background: '#fff', width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
      {/* 1. HEADER DOKUMEN */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '3px solid #1e3a8a', paddingBottom: '16px', marginBottom: '20px' }}>
        {/* Logo - natural aspect ratio */}
        <img
          src="/loginAsset/logologin.png"
          alt="Logo IPB"
          style={{ width: '72px', height: 'auto', objectFit: 'contain', marginRight: '20px', flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Institut Pertanian Bogor</div>
          <h2 style={{ margin: '2px 0', fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#1e3a8a' }}>S</span><span style={{ color: '#f59e0b' }}>IPB</span><span style={{ color: '#1e3a8a' }}>eru</span>
          </h2>
          <p style={{ margin: '2px 0 0', color: '#4b5563', fontSize: '12px' }}>Sistem Informasi Peminjaman Ruangan Akademik & Fasilitas</p>
          <h1 style={{ margin: '12px 0 0', color: '#111827', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Laporan Riwayat Peminjaman Ruangan</h1>
        </div>
      </div>

      {/* 2. INFORMASI PENGGUNA + STATISTIK */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1.2, background: '#f8fafc', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1e3a8a', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informasi Pemohon</h3>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', lineHeight: '1.5' }}>
            <tbody>
              <tr><td style={{ padding: '3px 0', width: '42%', color: '#64748b' }}>Nama Pengguna</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {user.full_name || user.username || '-'}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Role</td><td style={{ padding: '3px 0', fontWeight: 'bold', textTransform: 'capitalize' }}>: {user.role || '-'}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Email</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {user.email || '-'}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Fakultas / Unit</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {user.faculty || 'IPB University'}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Total Pengajuan</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {totalPengajuan} data</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Tanggal Cetak</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {currentDate}</td></tr>
              <tr><td style={{ padding: '3px 0', color: '#64748b' }}>Waktu Cetak</td><td style={{ padding: '3px 0', fontWeight: 'bold' }}>: {currentTime} WIB</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', lineHeight: '1', marginBottom: '6px' }}>{totalPengajuan}</div>
            <div style={{ fontSize: '9px', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.5px' }}>TOTAL PENGAJUAN</div>
          </div>
          <div style={{ background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#047857', lineHeight: '1', marginBottom: '6px' }}>{totalCompleted}</div>
            <div style={{ fontSize: '9px', color: '#10b981', fontWeight: 700, letterSpacing: '0.5px' }}>SELESAI</div>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c', lineHeight: '1', marginBottom: '6px' }}>{totalRejected}</div>
            <div style={{ fontSize: '9px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.5px' }}>DITOLAK</div>
          </div>
          <div style={{ background: '#f5f3ff', borderRadius: '8px', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '90px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#6d28d9', lineHeight: '1', marginBottom: '6px' }}>{approvalRate}%</div>
            <div style={{ fontSize: '9px', color: '#8b5cf6', fontWeight: 700, letterSpacing: '0.5px' }}>APPROVAL RATE</div>
          </div>
        </div>
      </div>

      {/* 3. TABEL RIWAYAT */}
      <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#1e3a8a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detail Riwayat Pengajuan</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
        <thead>
          <tr style={{ background: '#1e3a8a', color: 'white' }}>
            <th style={{ padding: '9px 6px', textAlign: 'center', border: '1px solid #2d4db3' }}>No</th>
            <th style={{ padding: '9px 6px', textAlign: 'left', border: '1px solid #2d4db3' }}>Kode Booking</th>
            <th style={{ padding: '9px 6px', textAlign: 'left', border: '1px solid #2d4db3' }}>Nama Ruangan</th>
            <th style={{ padding: '9px 6px', textAlign: 'left', border: '1px solid #2d4db3' }}>Tgl. Peminjaman</th>
            <th style={{ padding: '9px 6px', textAlign: 'left', border: '1px solid #2d4db3' }}>Jam</th>
            <th style={{ padding: '9px 6px', textAlign: 'center', border: '1px solid #2d4db3' }}>Status</th>
            <th style={{ padding: '9px 6px', textAlign: 'left', border: '1px solid #2d4db3' }}>Tgl. Pengajuan</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? bookings.map((booking, index) => {
            const statusConfig = getStatusConfig(booking.status);
            return (
              <tr key={booking.id} style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{index + 1}</td>
                <td style={{ padding: '8px 6px', border: '1px solid #e2e8f0', fontWeight: 600, fontFamily: 'monospace', fontSize: '10px' }}>{formatBookingCode(booking)}</td>
                <td style={{ padding: '8px 6px', border: '1px solid #e2e8f0' }}>{booking.room_name || '-'}</td>
                <td style={{ padding: '8px 6px', border: '1px solid #e2e8f0' }}>{formatDateShort(booking.booking_date) || '-'}</td>
                <td style={{ padding: '8px 6px', border: '1px solid #e2e8f0' }}>{formatTimeRange(booking.start_time, booking.end_time).replace(' WIB', '')}</td>
                <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ background: statusConfig.bg, color: statusConfig.text, padding: '3px 7px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', fontSize: '9px' }}>
                    {statusConfig.label}
                  </span>
                </td>
                <td style={{ padding: '8px 6px', border: '1px solid #e2e8f0' }}>{formatDateShort(booking.created_at) || '-'}</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="7" style={{ padding: '20px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b', fontStyle: 'italic' }}>
                Tidak ada riwayat peminjaman
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 5. KETERANGAN STATUS */}
      <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', pageBreakInside: 'avoid' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569', fontWeight: 'bold', textTransform: 'uppercase' }}>Keterangan Status:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: '#4b5563' }}>
          <div><span style={{ color: '#d97706', fontWeight: 'bold' }}>● Menunggu:</span> Pengajuan sedang menunggu verifikasi admin.</div>
          <div><span style={{ color: '#1d4ed8', fontWeight: 'bold' }}>● Disetujui:</span> Pengajuan disetujui, ruangan siap digunakan.</div>
          <div><span style={{ color: '#b91c1c', fontWeight: 'bold' }}>● Ditolak:</span> Pengajuan ditolak (jadwal bentrok / berkas kurang).</div>
          <div><span style={{ color: '#047857', fontWeight: 'bold' }}>● Selesai:</span> Kegiatan telah selesai dilaksanakan.</div>
        </div>
      </div>

      {/* 6. FOOTER */}
      <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '9px', color: '#64748b', lineHeight: '1.6' }}>
          <strong>Catatan:</strong> Dokumen ini dicetak otomatis oleh Sistem SIPBeru IPB.<br/>
          Direktorat Sarana & Prasarana — IPB University © {new Date().getFullYear()}
        </div>
        <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'right', fontStyle: 'italic' }}>
          Dicetak: {currentDate} pukul {currentTime} WIB
        </div>
      </div>
    </div>
  );
});

ExportRiwayatPDF.displayName = 'ExportRiwayatPDF';
export default ExportRiwayatPDF;
