import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, User, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = localStorage.getItem('role') || '';

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinkStyle = (path) => ({
    color: 'white',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '16px',
    borderBottom: isActive(path) ? '2px solid #fbbf24' : 'none',
    paddingBottom: isActive(path) ? '4px' : '0',
  });

  return (
    <nav className="landing-navbar">
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none', color: 'white' }}>
        <img src="/loginAsset/logologin.png" alt="SIPBeru" style={{ width: '48px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
          S<span style={{ color: '#fbbf24' }}>IPB</span>eru
        </h2>
      </Link>

      {/* Nav Links */}
      <ul style={{ margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '40px', listStyle: 'none' }}>
        <li><Link to="/" style={navLinkStyle('/')}>Beranda</Link></li>
        <li><Link to="/katalog" style={navLinkStyle('/katalog')}>Katalog Ruangan</Link></li>
        {isLoggedIn && (
          <li><Link to="/admin" style={navLinkStyle('/admin')}>Dashboard</Link></li>
        )}
        <li>
          <a href="/#faq" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
            FAQ
          </a>
        </li>
      </ul>

      {/* Right Actions */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Search size={22} style={{ cursor: 'pointer', color: 'white' }} />

        {isLoggedIn ? (
          <>
            {/* Bell notification */}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={24} color="white" />
              <span style={{
                position: 'absolute', top: '-6px', right: '-8px',
                background: '#ef4444', color: 'white',
                fontSize: '10px', fontWeight: 700,
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>5</span>
            </div>

            {/* User profile + dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setShowDropdown((o) => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              >
                {/* Name + role text */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>
                    {user?.full_name || user?.username || '-'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#93c5fd', textTransform: 'capitalize' }}>
                    {role || user?.role || 'Administrator'}
                  </div>
                </div>

                {/* Avatar */}
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }}
                  />
                ) : (
                  <UserCircle size={38} color="white" />
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 16px)', right: 0,
                  background: 'white', borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  width: '240px', zIndex: 2000,
                  overflow: 'hidden', border: '1px solid #f3f4f6'
                }}>
                  {/* User header */}
                  <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>
                      {user?.full_name || user?.username || '-'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                      {user?.username ? `@${user.username}` : '@admin'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {user?.email || 'email@sipberu.ac.id'}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px' }}>
                    <div
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', color: '#1e293b', fontSize: '14px', fontWeight: 500 }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <User size={18} color="#475569" /> Profil Saya
                    </div>
                    <div
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', color: '#1e293b', fontSize: '14px', fontWeight: 500 }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Settings size={18} color="#475569" /> Pengaturan
                    </div>
                    <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                    <div
                      onClick={handleLogout}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', fontSize: '14px', fontWeight: 600 }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut size={18} color="#ef4444" /> Keluar Aplikasi
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Divider */}
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.3)' }} />
            <Link to="/login">
              <button className="btn-login-nav">Login</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
