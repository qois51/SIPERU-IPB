import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Home, MapPin, Users, Clock, Layers, User, Mail, Phone, Image as ImageIcon, X, Plus, Banknote } from 'lucide-react';
import api from '../../../services/api';

const formatRupiah = (value) => {
  if (value === null || value === undefined) return '';
  const clean = value.toString().replace(/\D/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(clean));
};

const RoomForm = ({ room, onBack, onSuccess, onZoomImage }) => {
  const DEFAULT_IMAGE = '/loginAsset/ruanganTerdaftar.png';
  const DEFAULT_PIC_IMAGE = ''; // Empty for placeholder icon

  // Retrieve current logged-in admin data to auto-populate PIC fields
  const activeUserStr = localStorage.getItem('user');
  const activeUser = activeUserStr ? JSON.parse(activeUserStr) : {};

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    price: '',
    operational_hours: '',
    facilities: '',
    pic_name: room ? '' : (activeUser.full_name || activeUser.username || ''),
    pic_email: room ? '' : (activeUser.email || ''),
    pic_phone: room ? '' : (activeUser.phone || ''),
    image_url: [], // Changed to array for multiple images
    pic_image_url: room ? DEFAULT_PIC_IMAGE : (activeUser.profile_image || DEFAULT_PIC_IMAGE),
    op_start_day: 'Senin',
    op_end_day: 'Jumat',
    op_start: '08:00',
    op_end: '17:00'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (room) {
      // Parse operational_hours: "Senin - Jumat, 08:00 - 17:00"
      const parts = (room.operational_hours || '').split(', ');
      const dayRange = parts[0] || '';
      const times = parts[1] || '';

      const [startDay, endDay] = dayRange.includes(' - ') ? dayRange.split(' - ') : [dayRange, ''];
      const [start, end] = times.includes(' - ') ? times.split(' - ') : ['08:00', '17:00'];

      setFormData({
        ...room,
        price: formatRupiah(room.price),
        facilities: Array.isArray(room.facilities) ? room.facilities.join(',') : room.facilities,
        image_url: Array.isArray(room.image_url) ? room.image_url : (room.image_url ? room.image_url.split('|') : []),
        op_start_day: (startDay || 'Senin').trim(),
        op_end_day: (endDay || 'Jumat').trim(),
        op_start: (start || '08:00').trim(),
        op_end: (end || '17:00').trim()
      });
    }
  }, [room]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const operational_hours = `${formData.op_start_day} - ${formData.op_end_day}, ${formData.op_start} - ${formData.op_end}`;

      const payload = {
        name: formData.name,
        location: formData.location,
        capacity: parseInt(formData.capacity) || 0,
        price: parseInt(formData.price.toString().replace(/\D/g, '')) || 0,
        operational_hours: operational_hours,
        facilities: formData.facilities,
        pic_name: formData.pic_name,
        pic_email: formData.pic_email,
        pic_phone: formData.pic_phone,
        image_url: formData.image_url.join('|'),
        pic_image_url: formData.pic_image_url
      };

      if (room) {
        await api.put(`/rooms/${room.id}`, payload);
      } else {
        await api.post(`/rooms/`, payload);
      }
      showToastMsg('Data ruangan berhasil disimpan!', 'success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || 'Gagal menyimpan data ruangan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-form-container">
      <div className="back-link" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Kembali
      </div>

      <div className="form-header">
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{room ? 'Edit Data Ruangan' : 'Tambah Ruangan Baru'}</h2>
        <p style={{ opacity: 0.7, margin: '8px 0 32px' }}>Lengkapi informasi di bawah ini untuk mengelola aset ruangan.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-form">
        <div className="form-section">
          <h3 className="section-title">Informasi Dasar</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Ruangan</label>
              <div className="input-wrapper">
                <Home className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Contoh: Ruangan Seminar D"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Lokasi</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Contoh: Gedung Rektorat, Lantai 4"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Kapasitas (Orang)</label>
              <div className="input-wrapper">
                <Users className="input-icon" size={18} />
                <input
                  type="number"
                  placeholder="Jumlah maksimal orang"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Harga Sewa (Rp)</label>
              <div className="input-wrapper">
                <Banknote className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Contoh: 150.000"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: formatRupiah(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Hari Operasional</label>
              <div className="day-range-wrapper">
                <select
                  value={formData.op_start_day || 'Senin'}
                  onChange={e => setFormData({ ...formData, op_start_day: e.target.value })}
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <span>s/d</span>
                <select
                  value={formData.op_end_day || 'Jumat'}
                  onChange={e => setFormData({ ...formData, op_end_day: e.target.value })}
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Jam Operasional</label>
              <div className="time-range-wrapper">
                <input
                  type="time"
                  value={formData.op_start || '08:00'}
                  onChange={e => setFormData({ ...formData, op_start: e.target.value })}
                />
                <span>s/d</span>
                <input
                  type="time"
                  value={formData.op_end || '17:00'}
                  onChange={e => setFormData({ ...formData, op_end: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Fasilitas</label>
              <div className="input-wrapper">
                <Layers className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Gunakan koma sebagai pemisah (AC, Proyektor, Sound System)"
                  value={formData.facilities}
                  onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Foto Ruangan (Maks 6 Foto)</label>
              <div className="multi-upload-container">
                <div className="image-grid-preview">
                  {formData.image_url.map((img, index) => (
                    <div key={index} className="preview-item-small">
                      <img
                        src={img}
                        alt={`Preview ${index}`}
                        onClick={() => onZoomImage(img)}
                        style={{ cursor: 'zoom-in' }}
                      />
                      <button
                        type="button"
                        className="remove-img-small"
                        onClick={() => {
                          const newImgs = [...formData.image_url];
                          newImgs.splice(index, 1);
                          setFormData({ ...formData, image_url: newImgs });
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {formData.image_url.length < 6 && (
                    <label className="add-image-placeholder">
                      <Plus size={32} />
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({
                                ...formData,
                                image_url: [...formData.image_url, reader.result]
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <p className="upload-hint">Format: JPG, PNG, atau WEBP (Maks 2MB per foto)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Informasi Penanggung Jawab (PIC)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Nama PIC</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Nama Lengkap PIC"
                  value={formData.pic_name}
                  onChange={e => setFormData({ ...formData, pic_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email PIC</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="alamat@gmail.com"
                  value={formData.pic_email}
                  onChange={e => setFormData({ ...formData, pic_email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Telepon PIC</label>
              <div className="input-wrapper">
                <Phone className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={formData.pic_phone}
                  onChange={e => setFormData({ ...formData, pic_phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Foto PIC</label>
              <div className="pic-upload-area">
                <div className="pic-preview-box">
                  {formData.pic_image_url ? (
                    <>
                      <img
                        src={formData.pic_image_url}
                        alt="PIC"
                        onClick={() => onZoomImage(formData.pic_image_url)}
                        style={{ cursor: 'zoom-in' }}
                      />
                      <button
                        type="button"
                        className="remove-img-badge"
                        onClick={() => setFormData({ ...formData, pic_image_url: DEFAULT_PIC_IMAGE })}
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="no-pic-placeholder">
                      <User size={30} />
                    </div>
                  )}
                </div>
                <div className="upload-info">
                  <label className="premium-upload-btn">
                    Upload Foto PIC
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, pic_image_url: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sedang Menyimpan...' : room ? 'Simpan Perubahan' : 'Tambah Ruangan'} <Save size={20} />
          </button>
        </div>
      </form>

      {/* Premium Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            border: toast.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: toast.type === 'success' ? '#156534' : '#991b1b',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 9999,
            animation: 'slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontWeight: 600,
            fontSize: '15px'
          }}
        >
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          {toast.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default RoomForm;
