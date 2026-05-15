import React from 'react';
import { ArrowLeft, FileText, Download, Printer, Maximize2 } from 'lucide-react';
import axios from 'axios';

const VerificationDetail = ({ item, onBack }) => {
  const [loading, setLoading] = React.useState(false);

  if (!item) return null;

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${item.id}/status`, { status: newStatus });
      alert(`Pengajuan berhasil di${newStatus === 'Approved' ? 'setujui' : 'tolak'}`);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status pengajuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-detail">
      <div className="back-link" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Kembali
      </div>

      <div className="detail-layout">
        <div className="preview-container">
          <div className="preview-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={18} />
              <span>Surat Pengajuan: {item.activity_name}</span>
            </div>
            <div className="preview-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="page-info" style={{ fontSize: '12px', opacity: 0.7 }}>1 / 1</span>
              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
              <Printer size={18} style={{ cursor: 'pointer', opacity: 0.8 }} />
              <Maximize2 size={18} style={{ cursor: 'pointer', opacity: 0.8 }} />
              {item.document_url && (
                <a href={item.document_url} download style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                  <Download size={18} />
                </a>
              )}
            </div>
          </div>
          <div className={`preview-body ${item.document_url ? 'with-doc' : 'no-doc'}`}>
            {item.document_url ? (
              <iframe
                src={`${item.document_url}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Proposal Document"
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
                 <div style={{ marginTop: '40px', textAlign: 'left' }}>
                    <strong>A. Penyajian</strong>
                    <p style={{ fontSize: '13px', opacity: 0.8 }}>Dokumen pengajuan resmi belum diunggah. Informasi di atas adalah ringkasan dari formulir online.</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        <div className="detail-card">
          <h3 style={{ textAlign: 'center', marginBottom: '24px', color: '#1E3A8A' }}>Detail Peminjaman</h3>
          <ul className="detail-info-list">
            <li><strong>Nama Kegiatan:</strong> {item.activity_name}</li>
            <li><strong>Nama Ruangan:</strong> {item.room_name}</li>
            <li><strong>Harga Sewa:</strong> {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.room_price || 0)} / Sesi</li>
            <li><strong>Jadwal:</strong> <span className="badge-day-small">{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' })}</span> {item.date}, {item.start_time} - {item.end_time}</li>
            <li><strong>Jumlah Peserta:</strong> {item.participants}</li>
            <li><strong>Nama Peminjam:</strong> {item.organization}</li>
            <li><strong>Contact Person:</strong> <span style={{ color: '#1E3A8A', fontStyle: 'italic' }}>{item.user_name}</span></li>
            <li><strong>Status:</strong> <span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></li>
          </ul>

          <div className="detail-actions">
            <button 
              className="btn-approve" 
              onClick={() => handleStatusUpdate('Approved')}
              disabled={loading || item.status !== 'Pending'}
            >
              {loading ? 'Processing...' : 'Setujui'}
            </button>
            <button 
              className="btn-reject" 
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={loading || item.status !== 'Pending'}
            >
              {loading ? 'Processing...' : 'Tolak'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetail;
