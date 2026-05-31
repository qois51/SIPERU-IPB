import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, Search, X, Send } from 'lucide-react';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const HelpCenterPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminService.getHelpRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReplyClick = (req) => {
    setSelectedRequest(req);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setReplying(true);
    try {
      await adminService.replyHelpRequest(selectedRequest.id, replyMessage);
      alert('Balasan berhasil dikirim!');
      setShowReplyModal(false);
      fetchRequests();
    } catch (err) {
      alert('Gagal mengirim balasan: ' + (err.response?.data?.detail || err.message));
    } finally {
      setReplying(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner text="Memuat data HelpCenter..." />;

  return (
    <div className="help-center-container">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">HELP CENTER</h2>
          <p style={{ opacity: 0.6, fontSize: '14px', marginTop: '8px' }}>Pusat bantuan dan pengajuan dari pengguna</p>
        </div>
      </div>

      <div className="search-bar-wrapper" style={{ marginBottom: '24px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={20} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }}
        />
      </div>

      <div className="table-container" style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Pengirim</th>
              <th style={{ width: '40%' }}>Pesan / Keperluan</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Status</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                  Tidak ada pesan masuk.
                </td>
              </tr>
            ) : filteredRequests.map((req) => (
              <tr key={req.id}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{req.nama}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Mail size={12} /> {req.email}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    {new Date(req.created_at).toLocaleString('id-ID')}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#334155', verticalAlign: 'top' }}>
                  {req.pesan}
                  {req.reply && (
                    <div style={{ marginTop: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #1e3a8a' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '4px' }}>Balasan Anda:</span>
                      {req.reply}
                    </div>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                  {req.status === 'Pending' ? (
                    <span style={{ background: '#fffbeb', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Pending
                    </span>
                  ) : (
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={14} /> Dibalas
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'center', verticalAlign: 'top' }}>
                  <button 
                    onClick={() => handleReplyClick(req)}
                    style={{ background: req.status === 'Pending' ? '#1e3a8a' : '#f1f5f9', color: req.status === 'Pending' ? 'white' : '#64748b', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {req.status === 'Pending' ? <Send size={14} /> : <Search size={14} />}
                    {req.status === 'Pending' ? 'Balas' : 'Lihat Detail'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={() => setShowReplyModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={20} />
            </button>
            <h3 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
              {selectedRequest.status === 'Pending' ? 'Balas Pesan' : 'Detail Pesan'}
            </h3>
            
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>PESAN DARI PENGGUNA</p>
              <div style={{ fontSize: '14px', color: '#1e293b', whiteSpace: 'pre-wrap' }}>{selectedRequest.pesan}</div>
            </div>

            {selectedRequest.status === 'Pending' ? (
              <>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: '#334155' }}>Balasan Anda (via Email)</label>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Ketik balasan di sini..."
                  rows={5}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={replying || !replyMessage.trim()}
                  style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: replying ? '#cbd5e1' : '#1e3a8a', color: 'white', fontWeight: 700, fontSize: '14px', cursor: replying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {replying ? 'Mengirim Balasan...' : <><Send size={16} /> Kirim Balasan</>}
                </button>
              </>
            ) : (
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>SUDAH DIBALAS OLEH ADMIN</p>
                <div style={{ fontSize: '14px', color: '#15803d', whiteSpace: 'pre-wrap' }}>{selectedRequest.reply}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenterPage;
