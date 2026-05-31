import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Eye, Inbox, AlertTriangle, Trash2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookingStatusBadge from '../../components/common/BookingStatusBadge';
import ExportRiwayatPDF from '../../components/pdf/ExportRiwayatPDF';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import bookingService from '../../services/bookingService';
import usePagination from '../../hooks/usePagination';
import { formatDateShort, formatTimeRange } from '../../utils/formatDate';
import { BOOKING_STATUSES } from '../../utils/constants';

const DashboardPengajuan = () => {
  const navigate = useNavigate();
  const pdfRef = React.useRef();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [perPage, setPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelModalType, setCancelModalType] = useState('cancel'); // 'cancel' or 'delete'
  const [isCancelling, setIsCancelling] = useState(false);

  const pagination = usePagination(1, perPage);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch bookings
      const res = await bookingService.getMyBookings({
        page: pagination.page,
        perPage: perPage,
        status: statusFilter !== 'all' ? statusFilter : null,
        search: search || null,
      });
      setBookings(res.data?.bookings || []);
      pagination.updateFromResponse(res.data?.pagination);

      // Fetch stats
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const statsRes = await bookingService.getDashboardStats(user.id);
      setStats(statsRes.data?.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.resetPage();
    fetchData();
  };

  const handleCancel = (booking) => {
    setSelectedBookingId(booking.id);
    setCancelModalType(booking.status === 'Draft' ? 'delete' : 'cancel');
    setShowConfirmModal(true);
  };

  const confirmCancelAction = async () => {
    if (!selectedBookingId) return;
    const bookingId = selectedBookingId;
    setShowConfirmModal(false);
    setIsCancelling(true);

    try {
      await bookingService.cancelBooking(bookingId);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
      setSelectedBookingId(null);
    }
  };

  const handleExportPDF = () => {
    const element = pdfRef.current;
    if (!element) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const filename = `Riwayat_Peminjaman_${user.username || 'SIPERU'}.pdf`;

    // Sembunyikan elemen aslinya agar tak mengganggu UI, tapi tampilkan sementara untuk di-render oleh html2pdf
    element.style.display = 'block';

    const opt = {
      margin:       [0, 0, 0, 0], // Margin ditangani di dalam komponen React (padding 40px)
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Sembunyikan lagi setelah selesai
      element.style.display = 'none';
    });
  };

  const statCards = [
    { label: 'Total Pengajuan', value: stats?.total || 0, bg: '#dbeafe', text: '#1e3a8a' },
    { label: 'Menunggu Approval', value: stats?.pending || 0, bg: '#fde047', text: '#854d0e' },
    { label: 'Disetujui', value: stats?.approved || 0, bg: '#86efac', text: '#166534' },
    { label: 'Ditolak', value: stats?.rejected || 0, bg: '#fca5a5', text: '#991b1b' },
    { label: 'Draft', value: stats?.draft || 0, bg: '#f3f4f6', text: '#374151' },
    { label: 'Selesai', value: stats?.completed || 0, bg: '#e0e7ff', text: '#3730a3' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <Navbar />

      <div style={{ flexGrow: 1, paddingTop: '32px', paddingBottom: '48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>Dashboard Peminjaman</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>Pantau seluruh status pengajuanmu disini</p>

          {error && <ErrorAlert message={error} onClose={() => setError('')} />}

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '40px' }}>
            {statCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: card.bg,
                  borderRadius: '12px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '140px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '42px', fontWeight: 800, color: card.text, lineHeight: '1' }}>{card.value}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: card.text }}>{card.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Riwayat Peminjaman Title */}
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Riwayat Peminjaman</h2>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>Show</span>
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); pagination.resetPage(); }}
                style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '14px', outline: 'none', background: '#f9fafb' }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 500 }}>entries</span>
            </div>

            <form onSubmit={handleSearch} style={{ width: '300px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{ width: '100%', paddingLeft: '36px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </form>

            <div style={{ flex: 1 }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 600 }}>Filter:</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); pagination.resetPage(); }}
                  style={{ 
                    padding: '8px 36px 8px 16px', 
                    fontSize: '14px', 
                    border: '1px solid #1e3a8a', 
                    borderRadius: '6px', 
                    background: '#1e3a8a', 
                    color: 'white', 
                    fontWeight: 500, 
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Menunggu</option>
                  <option value="Approved">Disetujui</option>
                  <option value="Rejected">Ditolak</option>
                  <option value="Completed">Selesai</option>
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: 'white', borderRadius: '0', padding: '0', borderTop: '1px solid #f3f4f6' }}>
            {loading ? (
              <div style={{ padding: '40px 0' }}><LoadingSpinner size="sm" /></div>
            ) : bookings.length === 0 ? (
              <div style={{ 
                padding: '80px 20px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div style={{ 
                  background: '#f8fafc', 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                }}>
                  <Inbox size={56} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>Belum ada pengajuan</h3>
                <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '450px', lineHeight: '1.6' }}>
                  Kamu belum pernah mengajukan peminjaman ruangan. Semua histori dan status peminjamanmu akan tampil di sini.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Nama Ruangan</th>
                      <th style={{ textAlign: 'left', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Tgl. Pengajuan</th>
                      <th style={{ textAlign: 'left', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Tgl. Peminjaman</th>
                      <th style={{ textAlign: 'left', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Jam</th>
                      <th style={{ textAlign: 'left', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Nama Kegiatan</th>
                      <th style={{ textAlign: 'center', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Status</th>
                      <th style={{ textAlign: 'center', padding: '16px 8px', color: '#111827', fontWeight: 800 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '16px 8px', color: '#374151' }}>{b.room_name}</td>
                        <td style={{ padding: '16px 8px', color: '#374151' }}>{b.created_at ? String(b.created_at).substring(0, 10).split('-').reverse().join('/') : '-'}</td>
                        <td style={{ padding: '16px 8px', color: '#374151' }}>{b.booking_date ? String(b.booking_date).substring(0, 10).split('-').reverse().join('/') : (b.date ? String(b.date).substring(0, 10).split('-').reverse().join('/') : '-')}</td>
                        <td style={{ padding: '16px 8px', color: '#374151' }}>{b.start_time ? String(b.start_time).substring(0, 5).replace(':', '.') : ''} - {b.end_time ? String(b.end_time).substring(0, 5).replace(':', '.') : ''}</td>
                        <td style={{ padding: '16px 8px', color: '#374151' }}>{b.activity_name}</td>
                        <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                          <BookingStatusBadge status={b.status} />
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button
                              onClick={() => {
                                if (b.status === 'Draft') {
                                  navigate(`/booking/${b.room_id}?date=${b.date}&start=${b.start_time}&end=${b.end_time}&edit=${b.id}`);
                                } else {
                                  navigate(`/booking/${b.id}/detail`);
                                }
                              }}
                              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700, background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              {b.status === 'Draft' ? 'Lanjutkan' : 'Lihat'}
                            </button>
                            
                            {(b.status === 'Pending' || b.status === 'Draft') && (
                              <button
                                onClick={() => handleCancel(b)}
                                style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700, background: '#ffe4e6', color: '#e11d48', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                {b.status === 'Draft' ? 'Hapus' : 'Batalkan'}
                              </button>
                            )}
                            
                            {(b.status === 'Approved' || b.status === 'Completed') && (
                              <button
                                onClick={() => navigate(`/booking/${b.id}/detail`)}
                                style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700, background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                E-Pass
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {bookings.length > 0 && (
              <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNext={pagination.hasNext}
                  hasPrev={pagination.hasPrev}
                  pageNumbers={pagination.pageNumbers}
                  onPageChange={pagination.goToPage}
                />
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
            <button 
              onClick={() => navigate('/katalog')}
              style={{ padding: '14px 28px', background: '#263b80', color: 'white', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Ajukan Peminjaman Baru
            </button>
            <button 
              onClick={handleExportPDF}
              style={{ padding: '14px 28px', background: 'white', color: '#263b80', borderRadius: '8px', border: '1px solid #263b80', fontSize: '16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={18} /> Ekspor Riwayat
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Hidden Component for PDF Export */}
      <div style={{ display: 'none' }}>
        <ExportRiwayatPDF 
          ref={pdfRef} 
          bookings={bookings} 
          user={JSON.parse(localStorage.getItem('user') || '{}')} 
        />
      </div>

      {/* Premium confirmation modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Style tag for animations */}
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { transform: scale(0.95); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '32px 24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              boxSizing: 'border-box',
              animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Icon Wrapper */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: cancelModalType === 'delete' ? '#fee2e2' : '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}
            >
              {cancelModalType === 'delete' ? (
                <Trash2 size={32} color="#ef4444" />
              ) : (
                <AlertTriangle size={32} color="#d97706" />
              )}
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 12px 0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {cancelModalType === 'delete' ? 'Hapus Draft Peminjaman?' : 'Batalkan Peminjaman?'}
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '14px',
                color: '#4b5563',
                lineHeight: '1.6',
                margin: '0 0 28px 0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {cancelModalType === 'delete'
                ? 'Apakah Anda yakin ingin menghapus draft peminjaman ruangan ini? Seluruh data yang telah diisi akan dihapus secara permanen.'
                : 'Apakah Anda yakin ingin membatalkan pengajuan peminjaman ruangan ini? Tindakan ini tidak dapat diurungkan.'}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedBookingId(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: '#f3f4f6',
                  color: '#4b5563',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
              >
                Kembali
              </button>
              <button
                onClick={confirmCancelAction}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  background: cancelModalType === 'delete' ? '#ef4444' : '#d97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  outline: 'none',
                  boxShadow: cancelModalType === 'delete' 
                    ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' 
                    : '0 4px 6px -1px rgba(217, 119, 6, 0.2)'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = cancelModalType === 'delete' ? '#dc2626' : '#b45309'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = cancelModalType === 'delete' ? '#ef4444' : '#d97706'; 
                }}
              >
                {cancelModalType === 'delete' ? 'Ya, Hapus' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium cancellation loading overlay */}
      {isCancelling && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              maxWidth: '320px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxSizing: 'border-box'
            }}
          >
            <div className="cancellation-spinner" />
            <style>{`
              .cancellation-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f1f5f9;
                border-top: 4px solid #1e3a8a;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
              Memproses Pembatalan...
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
              Mohon tunggu, sistem sedang menghapus data reservasi & berkas dari server.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPengajuan;
