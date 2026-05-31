import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ArrowLeft, Save, User, Mail, CreditCard, Shield, Key, Image as ImageIcon, X } from 'lucide-react';

const UserForm = ({ user, onBack, onSuccess, onZoomImage }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'mahasiswa',
    full_name: '',
    nim_nip: '',
    email: '',
    profile_image: null
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToastMsg = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '' // Don't show hashed password, leave empty for no change
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate email
    if (!formData.email.includes('@')) {
      showToastMsg('Email tidak valid!', 'error');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      if (user) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        if (!formData.password) {
          showToastMsg('Password wajib diisi untuk user baru!', 'error');
          setLoading(false);
          return;
        }
        await api.post(`/users/`, payload);
      }
      showToastMsg('Data pengguna berhasil disimpan!', 'success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || 'Gagal menyimpan data user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToastMsg('Ukuran file terlalu besar (Maks 2MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="user-form-container">
      <div className="back-link" onClick={onBack} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={20} /> Kembali
      </div>

      <div className="form-header">
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>{user ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}</h2>
        <p style={{ opacity: 0.7, margin: '8px 0 32px' }}>Lengkapi data identitas pengguna di bawah ini.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-form">
        <div className="form-section">
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            {/* Left side: Avatar Upload */}
            <div className="avatar-upload-section" style={{ textAlign: 'center' }}>
              <div 
                className="profile-image-preview" 
                onClick={() => formData.profile_image && onZoomImage(formData.profile_image)}
                style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%', 
                  background: '#f3f4f6', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '16px',
                  overflow: 'hidden',
                  border: '4px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: formData.profile_image ? 'zoom-in' : 'default',
                  position: 'relative'
                }}
              >
                {formData.profile_image ? (
                  <img src={formData.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={80} color="#9ca3af" />
                )}
                {formData.profile_image && (
                   <button 
                    type="button" 
                    className="remove-avatar-btn"
                    onClick={(e) => { e.stopPropagation(); setFormData({...formData, profile_image: null}); }}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <label className="premium-upload-btn">
                Pilih Foto Profil
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
              </label>
              <p style={{ fontSize: '12px', opacity: 0.5, marginTop: '8px' }}>Format: JPG, PNG (Maks 2MB)</p>
            </div>

            {/* Right side: Form Fields */}
            <div style={{ flex: 1 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Masukkan nama lengkap"
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>NIM / NIP</label>
                  <div className="input-wrapper">
                    <CreditCard className="input-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Contoh: 12345678"
                      value={formData.nim_nip} 
                      onChange={e => setFormData({...formData, nim_nip: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      placeholder="alamat@email.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Role / Jabatan</label>
                  <div className="input-wrapper">
                    <Shield className="input-icon" size={18} />
                    <select 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      required
                    >
                      <option value="mahasiswa">Mahasiswa</option>
                      <option value="dosen">Dosen</option>
                      <option value="satpam">Satpam</option>
                      <option value="pic">PIC Ruangan</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Username</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Username untuk login"
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password {user && '(Biarkan kosong jika tidak ingin mengubah)'}</label>
                  <div className="input-wrapper">
                    <Key className="input-icon" size={18} />
                    <input 
                      type="password" 
                      placeholder="Minimal 6 karakter"
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      required={!user}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '40px' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '12px 32px' }}>
            {loading ? 'Sedang Menyimpan...' : user ? 'Simpan Perubahan' : 'Tambah User'} <Save size={20} />
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

export default UserForm;
