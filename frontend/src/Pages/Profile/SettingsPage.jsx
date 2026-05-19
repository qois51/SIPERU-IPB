import React, { useState } from 'react';
import { Lock, Bell, Shield, ChevronRight, Check } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('password');
  
  // Password State
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passStatus, setPassStatus] = useState('');

  // Notif State
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, promo: false });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      setPassStatus('error');
      return;
    }
    setPassStatus('success');
    setTimeout(() => {
      setPassStatus('');
      setPassData({ old: '', new: '', confirm: '' });
    }, 3000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar />
      
      <div style={{ flexGrow: 1, paddingTop: '32px', paddingBottom: '64px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Sidebar */}
          <div style={{ width: '280px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Pengaturan</h2>
            </div>
            <div style={{ padding: '16px' }}>
              {[
                { id: 'password', icon: Lock, label: 'Ganti Password' },
                { id: 'notif', icon: Bell, label: 'Notifikasi' },
                { id: 'privacy', icon: Shield, label: 'Privasi & Keamanan' }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
                      background: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#1e3a8a' : '#64748b',
                      fontWeight: isActive ? 700 : 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} color={isActive ? '#3b82f6' : '#94a3b8'} />
                      {tab.label}
                    </div>
                    {isActive && <ChevronRight size={16} color="#3b82f6" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div style={{ flexGrow: 1, background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '400px' }}>
            
            {activeTab === 'password' && (
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Ganti Password</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Pastikan password baru Anda menggunakan kombinasi yang kuat dan unik.</p>
                
                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Password Saat Ini</label>
                    <input type="password" value={passData.old} onChange={e => setPassData({...passData, old: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Password Baru</label>
                    <input type="password" value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Konfirmasi Password Baru</label>
                    <input type="password" value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>

                  {passStatus === 'error' && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>Konfirmasi password tidak cocok!</div>}
                  {passStatus === 'success' && <div style={{ color: '#10b981', fontSize: '14px', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><Check size={18} /> Password berhasil diperbarui!</div>}

                  <button type="submit" className="btn-primary" style={{ padding: '12px 24px', borderRadius: '10px', width: '100%' }}>Simpan Password Baru</button>
                </form>
              </div>
            )}

            {activeTab === 'notif' && (
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Preferensi Notifikasi</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Atur bagaimana Anda ingin menerima pembaruan dari SIPBeru.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Notifikasi Email</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Terima update status peminjaman via email.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                      <input type="checkbox" checked={notifPrefs.email} onChange={e => setNotifPrefs({...notifPrefs, email: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: notifPrefs.email ? '#3b82f6' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}></span>
                      <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: notifPrefs.email ? '24px' : '4px', bottom: '3px', background: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Push Notifications</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Tampilkan notifikasi di browser Anda saat aplikasi terbuka.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                      <input type="checkbox" checked={notifPrefs.push} onChange={e => setNotifPrefs({...notifPrefs, push: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: notifPrefs.push ? '#3b82f6' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}></span>
                      <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: notifPrefs.push ? '24px' : '4px', bottom: '3px', background: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Info & Promo</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Dapatkan informasi mengenai fitur baru dan pengumuman.</p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                      <input type="checkbox" checked={notifPrefs.promo} onChange={e => setNotifPrefs({...notifPrefs, promo: e.target.checked})} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: notifPrefs.promo ? '#3b82f6' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}></span>
                      <span style={{ position: 'absolute', content: '""', height: '20px', width: '20px', left: notifPrefs.promo ? '24px' : '4px', bottom: '3px', background: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Privasi & Keamanan</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>Pengaturan terkait keamanan akun dan data Anda.</p>
                
                <div style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Autentikasi Dua Langkah (2FA)</h4>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Tingkatkan keamanan akun Anda dengan verifikasi dua langkah.</p>
                    </div>
                  </div>
                  <button style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Aktifkan 2FA</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SettingsPage;
