import React, { useState } from 'react';
import { User, Mail, Hash, Phone, Edit2, Shield, Camera } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ProfilePage = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const role = localStorage.getItem('role') || 'mahasiswa';

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.full_name || user.username || '',
    email: user.email || '',
    phone: user.phone || '081234567890', // placeholder if not in db
    bio: 'Mahasiswa aktif Institut Pertanian Bogor.'
  });

  const handleSave = (e) => {
    e.preventDefault();
    // Simulate save
    setTimeout(() => {
      setIsEditing(false);
      alert('Profil berhasil diperbarui!');
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />
      
      <div style={{ flexGrow: 1, paddingTop: '32px', paddingBottom: '64px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Profil Saya</h1>
            <p style={{ color: '#64748b' }}>Kelola informasi identitas dan data diri Anda di SIPBeru.</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            
            {/* Banner & Avatar section */}
            <div style={{ position: 'relative', height: '140px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
              <div style={{ position: 'absolute', bottom: '-40px', left: '32px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', objectFit: 'cover', background: 'white' }} />
                  ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={48} color="#94a3b8" />
                    </div>
                  )}
                  {isEditing && (
                    <button style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                      <Camera size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ padding: '56px 32px 32px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{formData.fullName}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                    <Shield size={16} color="#3b82f6" />
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#3b82f6' }}>{role}</span>
                  </div>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Edit2 size={16} /> Edit Profil
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Nama Lengkap</label>
                      <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Nomor Telepon</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Bio Singkat</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', minHeight: '80px' }}></textarea>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }}>Simpan Perubahan</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} color="#64748b" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>Username</p>
                      <p style={{ fontSize: '15px', color: '#0f172a', margin: 0, fontWeight: 500 }}>{user.username || '-'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Hash size={20} color="#64748b" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>NIM / NIP</p>
                      <p style={{ fontSize: '15px', color: '#0f172a', margin: 0, fontWeight: 500 }}>{user.nim_nip || '-'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={20} color="#64748b" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>Email Terdaftar</p>
                      <p style={{ fontSize: '15px', color: '#0f172a', margin: 0, fontWeight: 500 }}>{formData.email || '-'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={20} color="#64748b" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>Nomor Telepon</p>
                      <p style={{ fontSize: '15px', color: '#0f172a', margin: 0, fontWeight: 500 }}>{formData.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
