import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Mail, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'mahasiswa' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp & new pass
  const [forgotData, setForgotData] = useState({ email: '', otp: '', newPassword: '' });
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Help center state
  const [helpData, setHelpData] = useState({ nama: '', email: '', pesan: '' });
  const [helpSuccess, setHelpSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const role = response.data.role;
      if (role === 'admin' || role === 'satpam' || role === 'karyawan') {
        navigate('/admin');
      } else {
        // mahasiswa, dosen dan role lainnya → kembali ke landing page / dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa kredensial Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      if (forgotStep === 1) {
        const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotData.email });
        setForgotMsg(res.data.message);
        setForgotStep(2);
      } else {
        const res = await axios.post(`${API_URL}/auth/reset-password`, { 
          email: forgotData.email, 
          otp: forgotData.otp, 
          new_password: forgotData.newPassword 
        });
        setForgotMsg(res.data.message);
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotData({ email: '', otp: '', newPassword: '' });
          setForgotMsg('');
        }, 2000);
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for help center
    setTimeout(() => {
      setLoading(false);
      setHelpSuccess(true);
      setTimeout(() => {
        setShowHelpModal(false);
        setHelpSuccess(false);
        setHelpData({ nama: '', email: '', pesan: '' });
      }, 3000);
    }, 1500);
  };

  return (
    <div className="login-right" style={{ position: 'relative' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Selamat Datang Kembali</h2>
      <div style={{ height: '4px', width: '60px', background: '#e5e7eb', marginBottom: '32px' }}></div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Jenis Pengguna</label>
          <div className="input-wrapper">
            <GraduationCap className="input-icon" size={20} />
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="admin">Admin</option>
              <option value="satpam">Satpam</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>ID Pengguna Atau Email</label>
          <div className="input-wrapper">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="NIM / NIP / ID Petugas / Email"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Masukkan password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ paddingRight: '40px' }}
              required
            />
            <button 
              type="button" 
              style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} /> Ingat saya
          </label>
          <button type="button" onClick={() => setShowForgotModal(true)} style={{ color: '#1e3a8a', background: 'none', border: 'none', padding: 0, textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}>Lupa password ?</button>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '24px' }}>
          {loading ? 'Processing...' : 'Masuk'} <ArrowRight size={20} />
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#374151' }}>
          Belum punya akun? <button type="button" onClick={() => setShowHelpModal(true)} style={{ color: '#1e3a8a', background: 'none', border: 'none', padding: 0, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>Hubungi HelpCenter untuk mendaftar</button>
        </p>
      </form>

      {/* MODAL LUPA PASSWORD */}
      {showForgotModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowForgotModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#6b7280" />
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Lupa Password</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              {forgotStep === 1 ? 'Masukkan email Anda untuk menerima kode OTP.' : 'Masukkan kode OTP dan password baru.'}
            </p>
            
            <form onSubmit={handleForgotSubmit}>
              {forgotStep === 1 ? (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px' }}>Email Terdaftar</label>
                  <div className="input-wrapper" style={{ marginTop: '4px' }}>
                    <Mail className="input-icon" size={18} />
                    <input type="email" value={forgotData.email} onChange={(e) => setForgotData({...forgotData, email: e.target.value})} placeholder="email@apps.ipb.ac.id" required style={{ padding: '10px 12px 10px 40px', fontSize: '14px' }} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px' }}>Kode OTP</label>
                    <input type="text" value={forgotData.otp} onChange={(e) => setForgotData({...forgotData, otp: e.target.value})} placeholder="Masukkan 6 digit OTP" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginTop: '4px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px' }}>Password Baru</label>
                    <input type="password" value={forgotData.newPassword} onChange={(e) => setForgotData({...forgotData, newPassword: e.target.value})} placeholder="Minimal 6 karakter" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginTop: '4px' }} />
                  </div>
                </>
              )}
              
              {forgotError && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{forgotError}</p>}
              {forgotMsg && <p style={{ color: '#16a34a', fontSize: '13px', marginBottom: '12px' }}>{forgotMsg}</p>}
              
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Processing...' : (forgotStep === 1 ? 'Kirim OTP' : 'Reset Password')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HELP CENTER */}
      {showHelpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowHelpModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#6b7280" />
            </button>
            
            {helpSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Pengajuan Terkirim!</h3>
                <p style={{ fontSize: '14px', color: '#64748b' }}>HelpCenter akan segera menghubungi Anda melalui email yang didaftarkan.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>Hubungi HelpCenter</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Isi form di bawah ini untuk permintaan pembuatan akun atau bantuan lainnya.</p>
                
                <form onSubmit={handleHelpSubmit}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px' }}>Nama Lengkap</label>
                    <input type="text" value={helpData.nama} onChange={(e) => setHelpData({...helpData, nama: e.target.value})} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginTop: '4px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px' }}>Email (Wajib Aktif)</label>
                    <input type="email" value={helpData.email} onChange={(e) => setHelpData({...helpData, email: e.target.value})} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginTop: '4px' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px' }}>Pesan / Keperluan</label>
                    <textarea value={helpData.pesan} onChange={(e) => setHelpData({...helpData, pesan: e.target.value})} placeholder="Contoh: Mohon buatkan akun untuk UKM Fotografi..." required rows={4} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', marginTop: '4px', resize: 'vertical' }} />
                  </div>
                  
                  <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
                    {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginForm;
