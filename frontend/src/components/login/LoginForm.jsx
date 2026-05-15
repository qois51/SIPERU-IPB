import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'mahasiswa' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      const role = response.data.role;
      if (role === 'admin' || role === 'satpam' || role === 'karyawan') {
        navigate('/admin');
      } else {
        // mahasiswa dan role lainnya → kembali ke landing page
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal, periksa kredensial Anda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-right">
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
              <option value="admin">Admin</option>
              <option value="satpam">Satpam</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>ID Pengguna Or Email</label>
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
          <a href="#" style={{ color: '#1e3a8a', textDecoration: 'none', fontWeight: 600 }}>Lupa password ?</a>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '24px' }}>
          {loading ? 'Processing...' : 'Masuk'} <ArrowRight size={20} />
        </button>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#374151' }}>
          Belum punya akun? <a href="#" style={{ color: '#1e3a8a', fontWeight: 700, textDecoration: 'none' }}>Hubungi HelpCenter untuk mendaftar</a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
