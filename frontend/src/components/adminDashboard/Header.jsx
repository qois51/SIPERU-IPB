import React, { useState } from 'react';
import { Menu, Bell, UserCircle, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Menu size={24} style={{ cursor: 'pointer' }} onClick={toggleSidebar} />
      </div>
      
      <div className="header-right">
        <div className="notification-badge">
          <Bell size={24} />
          <span className="badge-count">5</span>
        </div>
        
        <div className="user-profile-wrapper" style={{ position: 'relative' }}>
          <div 
            className="user-profile" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="user-info-text" style={{ textAlign: 'right', marginRight: '4px' }}>
               <div style={{ fontWeight: 700, fontSize: '14px' }}>{user?.full_name || 'Admin'}</div>
               <div style={{ fontSize: '12px', opacity: 0.6, textTransform: 'capitalize' }}>{user?.role || 'Administrator'}</div>
            </div>
            
            {user?.profile_image ? (
              <img src={user.profile_image} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
            ) : (
              <UserCircle size={32} color="#1e3a8a" />
            )}
          </div>

          {showDropdown && (
            <div className="profile-dropdown" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              width: '240px',
              zIndex: 1000,
              overflow: 'hidden',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ padding: '16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>{user?.full_name || 'Administrator'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{user?.username ? `@${user.username}` : '@admin'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{user?.email || 'email@sipberu.ac.id'}</div>
              </div>
              
              <div className="dropdown-items" style={{ padding: '8px' }}>
                <div className="dropdown-item" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                  <User size={18} /> Profil Saya
                </div>
                <div className="dropdown-item" style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                  <Settings size={18} /> Pengaturan
                </div>
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />
                <div 
                  className="dropdown-item logout" 
                  onClick={handleLogout}
                  style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }}
                >
                  <LogOut size={18} /> Keluar Aplikasi
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
