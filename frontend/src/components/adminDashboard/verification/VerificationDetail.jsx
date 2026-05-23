import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Printer, Maximize2, CheckCircle, XCircle, X, Loader2, ExternalLink } from 'lucide-react';
import adminService from '../../../services/adminService';
import bookingService from '../../../services/bookingService';
import BookingStatusBadge from '../../common/BookingStatusBadge';
import { formatDateID, formatTimeRange } from '../../../utils/formatDate';

const BACKEND_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

// ── Modal Overlay ──
const ModalOverlay = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: 'white', borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)', width: '100%', maxWidth: '480px',
        overflow: 'hidden'
      }}>
        {children}
      </div>
    </div>
  );
};

const VerificationDetail = ({ item, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  if (!item) return null;

  const isApproved = item.status === 'Approved';
  const isRejected = item.status === 'Rejected';
  const isPending = item.status === 'Pending';

  const getDocumentUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${BACKEND_URL}/${path}`;
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await adminService.approveBooking(item.id, approveNotes || 'Disetujui oleh admin.');
      setShowApproveModal(false);
      setSuccessMessage('Pengajuan berhasil disetujui! QR Code E-Pass telah digenerate.');
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      alert('Harap isi alasan penolakan.');
      return;
    }
    setLoading(true);
    try {
      await adminService.rejectBooking(item.id, rejectNotes);
      setShowRejectModal(false);
      setSuccessMessage('Pengajuan berhasil ditolak.');
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message || 'Gagal menolak pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    await bookingService.downloadEPassPDF(item.id, item.booking_code);
  };

  return (
    <div className="verification-detail">
      <div className="back-link" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Kembali
      </div>

      <div className="detail-layout">
        {/* Document Preview */}
        <div className="preview-container">
        <div className="preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={18} />
              <span>Surat Pengajuan: {item.activity_name}</span>
            </div>
            <div className="preview-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="page-info" style={{ fontSize: '12px', opacity: 0.7 }}>1 / 1</span>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
              {(item.surat_file) && (
                <>
                  <Printer
                    size={18}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                    title="Cetak Dokumen"
                    onClick={() => {
                      const url = getDocumentUrl(item.surat_file);
                      const w = window.open(url);
                      if (w) setTimeout(() => w.print(), 1500);
                    }}
                  />
                  <Maximize2
                    size={18}
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                    title="Buka di Tab Baru"
                    onClick={() => window.open(getDocumentUrl(item.surat_file), '_blank')}
                  />
                  <a
                    href={getDocumentUrl(item.surat_file)}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'white', display: 'flex', alignItems: 'center' }}
                    title="Download Dokumen"
                  >
                    <Download size={18} />
                  </a>
                </>
              )}
            </div>
          </div>
          <div className={`preview-body ${item.surat_file ? 'with-doc' : 'no-doc'}`}>
            {item.surat_file ? (
              <iframe
                src={`${getDocumentUrl(item.surat_file)}#toolbar=1`}
                title="Surat Pengajuan"
                style={{ width: '100%', height: '700px', border: 'none' }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                 <h2 style={{ color: '#333' }}>{item.activity_name.toUpperCase()}</h2>
                 <h3>{item.organization}</h3>
                 <p style={{ textAlign: 'left', marginTop: '20px', lineHeight: '1.6' }}>
                   <strong>Keperluan:</strong> <br/>
                   {item.purpose}
                 </p>
                 {item.deskripsi_kegiatan && (
                   <p style={{ textAlign: 'left', marginTop: '12px', lineHeight: '1.6' }}>
                     <strong>Deskripsi:</strong> <br/>
                     {item.deskripsi_kegiatan}
                   </p>
                 )}
                 <div style={{ marginTop: '40px', textAlign: 'left' }}>
                    <strong>A. Penyajian</strong>
                    <p style={{ fontSize: '13px', opacity: 0.8 }}>Dokumen pengajuan resmi belum diunggah. Informasi di atas adalah ringkasan dari formulir online.</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Card */}
        <div className="detail-card">
          <h3 style={{ textAlign: 'center', marginBottom: '24px', color: '#1E3A8A' }}>Detail Peminjaman</h3>
          <ul className="detail-info-list">
            <li>
              <strong>Kode Booking:</strong>{' '}
              {isApproved ? (
                <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.booking_code}</span>
              ) : (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>Tersedia setelah disetujui</span>
              )}
            </li>
            <li><strong>Nama Peminjam:</strong> {item.nama_peminjam || item.user_name}</li>
            <li><strong>NIM/NIP:</strong> {item.nim_nip || '-'}</li>
            <li><strong>Program Studi:</strong> {item.program_studi || '-'}</li>
            <li><strong>Email:</strong> {item.email || '-'}</li>
            <li><strong>Nomor HP:</strong> {item.nomor_hp || '-'}</li>
            <li style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}><strong>Nama Kegiatan:</strong> {item.activity_name}</li>
            <li><strong>Jenis Kegiatan:</strong> {item.jenis_kegiatan || '-'}</li>
            <li><strong>Organisasi:</strong> {item.organization}</li>
            <li><strong>Nama Ruangan:</strong> {item.room_name}</li>
            <li><strong>Harga Sewa:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.room_price || 0)} / Sesi</li>
            <li><strong>Jadwal:</strong> <span className="badge-day-small">{item.date ? new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' }) : '-'}</span> {formatDateID(item.date)}, {formatTimeRange(item.start_time, item.end_time)}</li>
            <li><strong>Fasilitas:</strong> {item.facilities?.join(', ') || '-'}</li>
            <li><strong>Status:</strong> <BookingStatusBadge status={item.status} /></li>
          </ul>

          {/* Notes from admin (after approved/rejected) */}
          {item.notes && (
            <div style={{
              padding: '14px 16px', borderRadius: '12px', marginTop: '16px',
              background: isRejected ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${isRejected ? '#fecaca' : '#bbf7d0'}`
            }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: isRejected ? '#991b1b' : '#166534', marginBottom: '4px' }}>
                Catatan Admin:
              </p>
              <p style={{ fontSize: '13px', color: isRejected ? '#b91c1c' : '#15803d', margin: 0, lineHeight: '1.5' }}>
                {item.notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {isPending ? (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowApproveModal(true)}
                style={{
                  flex: 1, padding: '12px', border: 'none', borderRadius: '12px', cursor: 'pointer',
                  background: '#1e3a8a', color: 'white', fontWeight: 700, fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#15307a'}
                onMouseLeave={e => e.currentTarget.style.background = '#1e3a8a'}
              >
                <CheckCircle size={16} /> Setujui
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                style={{
                  flex: 1, padding: '12px', border: '2px solid #ef4444', borderRadius: '12px', cursor: 'pointer',
                  background: 'transparent', color: '#ef4444', fontWeight: 700, fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <XCircle size={16} /> Tolak
              </button>
            </div>
          ) : (
            <div style={{
              marginTop: '20px', padding: '14px 16px', borderRadius: '12px', textAlign: 'center',
              fontSize: '14px', fontWeight: 700,
              background: isApproved ? '#dcfce7' : isRejected ? '#fef2f2' : '#f1f5f9',
              color: isApproved ? '#166534' : isRejected ? '#991b1b' : '#475569'
            }}>
              {isApproved && '✓ Pengajuan ini sudah disetujui'}
              {isRejected && '✗ Pengajuan ini sudah ditolak'}
              {item.status === 'Completed' && '✓ Peminjaman sudah selesai'}
            </div>
          )}

          {/* Download E-Pass for Approved */}
          {isApproved && (
            <button
              onClick={handleDownloadPDF}
              style={{
                width: '100%', marginTop: '12px', padding: '14px', border: 'none', borderRadius: '12px',
                cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 4px 12px rgba(30,58,138,0.3)', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(30,58,138,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,138,0.3)'; }}
            >
              <Download size={18} /> Download E-Pass PDF
            </button>
          )}
        </div>
      </div>

      {/* ═══ Approve Modal ═══ */}
      <ModalOverlay isOpen={showApproveModal} onClose={() => setShowApproveModal(false)}>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Setujui Pengajuan</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Konfirmasi persetujuan peminjaman ruangan</p>
            </div>
            <button onClick={() => setShowApproveModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="#94a3b8" />
            </button>
          </div>

          {/* Summary */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={18} color="#16a34a" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#166534' }}>Anda akan menyetujui:</span>
            </div>
            <div style={{ fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
              <strong>{item.activity_name}</strong> — {item.room_name}<br />
              {formatDateID(item.date)}, {formatTimeRange(item.start_time, item.end_time)}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Catatan Admin <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
              placeholder="Contoh: Disetujui. Silakan datang 15 menit sebelum acara."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1d5db',
                outline: 'none', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit',
                transition: 'border 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#1e3a8a'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowApproveModal(false)}
              style={{
                flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px',
                background: 'white', color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '12px',
                background: '#16a34a', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'lucide-spin 0.8s linear infinite' }} /> : <CheckCircle size={16} />}
              {loading ? 'Memproses...' : 'Ya, Setujui'}
            </button>
          </div>
        </div>
      </ModalOverlay>

      {/* ═══ Reject Modal ═══ */}
      <ModalOverlay isOpen={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>Tolak Pengajuan</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Berikan alasan penolakan peminjaman</p>
            </div>
            <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={20} color="#94a3b8" />
            </button>
          </div>

          {/* Summary */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <XCircle size={18} color="#dc2626" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#991b1b' }}>Anda akan menolak:</span>
            </div>
            <div style={{ fontSize: '13px', color: '#b91c1c', lineHeight: '1.6' }}>
              <strong>{item.activity_name}</strong> — {item.room_name}<br />
              {formatDateID(item.date)}, {formatTimeRange(item.start_time, item.end_time)}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
              Alasan Penolakan <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
              placeholder="Contoh: Ruangan sudah digunakan untuk acara internal kampus pada tanggal tersebut."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1d5db',
                outline: 'none', fontSize: '13px', resize: 'vertical', fontFamily: 'inherit',
                transition: 'border 0.2s', boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowRejectModal(false)}
              style={{
                flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '12px',
                background: 'white', color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '12px',
                background: '#dc2626', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'lucide-spin 0.8s linear infinite' }} /> : <XCircle size={16} />}
              {loading ? 'Memproses...' : 'Ya, Tolak'}
            </button>
          </div>
        </div>
      </ModalOverlay>

      {/* ═══ Success Modal ═══ */}
      <ModalOverlay isOpen={showSuccessModal} onClose={() => {}}>
        <div style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
            background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CheckCircle size={32} color="#16a34a" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Berhasil!</h3>
          <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
            {successMessage}
          </p>
          <button
            onClick={() => { setShowSuccessModal(false); onBack(); }}
            style={{
              width: '100%', padding: '14px', border: 'none', borderRadius: '12px', cursor: 'pointer',
              background: '#1e3a8a', color: 'white', fontWeight: 700, fontSize: '14px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#15307a'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e3a8a'}
          >
            Kembali ke Daftar
          </button>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default VerificationDetail;
