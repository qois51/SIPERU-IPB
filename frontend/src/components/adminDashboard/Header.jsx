import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, UserCircle, LogOut, Settings, User, CheckCircle2, Clock, ChevronRight, X, MailCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const Header = ({ toggleSidebar, onMenuChange }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_read_ids') || '[]'); } catch { return []; }
  });
  const notifRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Fetch pending bookings every 30 seconds
  const fetchPending = async () => {
    try {
      const res = await adminService.getBookings({ status: 'Pending', perPage: 20 });
      const bookings = res.data?.bookings || res.bookings || [];
      setPendingBookings(bookings);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persist readIds
  useEffect(() => {
    localStorage.setItem('notif_read_ids', JSON.stringify(readIds));
  }, [readIds]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Unread = pending bookings whose IDs are NOT in readIds
  const unreadBookings = pendingBookings.filter(b => !readIds.includes(b.id));
  const unreadCount = unreadBookings.length;

  // Show latest 5 (unread first, then read)
  const displayBookings = [
    ...unreadBookings,
    ...pendingBookings.filter(b => readIds.includes(b.id))
  ].slice(0, 5);

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setReadIds(prev => [...prev, id]);
  };

  const handleMarkAllRead = () => {
    setReadIds(prev => [...prev, ...pendingBookings.map(b => b.id)]);
  };

  const handleClickNotif = (b) => {
    if (!readIds.includes(b.id)) {
      setReadIds(prev => [...prev, b.id]);
    }
    setShowNotifDropdown(false);
    if (onMenuChange) onMenuChange('verifikasi');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <Menu size={24} style={{ cursor: 'pointer' }} onClick={toggleSidebar} />
      </div>
      
      <div className="header-right">
        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div
            className="notification-badge"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            style={{ cursor: 'pointer' }}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </div>

          {showNotifDropdown && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: '380px', background: 'white', borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
              zIndex: 1000, overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Notifikasi</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pengajuan menunggu persetujuan</div>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: '#dbeafe', color: '#1e3a8a', fontSize: '11px', fontWeight: 700,
                      padding: '5px 12px', borderRadius: '999px', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px', transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#bfdbfe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#dbeafe'}
                  >
                    <MailCheck size={12} /> Tandai sudah dibaca
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {displayBookings.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
                    }}>
                      <CheckCircle2 size={24} color="#16a34a" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Semua sudah dilihat!</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tidak ada pengajuan baru saat ini</div>
                  </div>
                ) : (
                  displayBookings.map((b) => {
                    const isRead = readIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => handleClickNotif(b)}
                        style={{
                          padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px',
                          cursor: 'pointer', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s',
                          background: isRead ? '#fafafa' : 'white', opacity: isRead ? 0.55 : 1
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = isRead ? '#f3f4f6' : '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = isRead ? '#fafafa' : 'white'}
                      >
                        {/* Unread dot */}
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isRead ? '#f1f5f9' : '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                          <Clock size={16} color={isRead ? '#94a3b8' : '#d97706'} />
                          {!isRead && (
                            <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', border: '2px solid white' }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: isRead ? 500 : 700, fontSize: '13px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {b.activity_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {b.room_name} • {formatDate(b.date)}, {b.start_time?.substring(0, 5)} - {b.end_time?.substring(0, 5)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            oleh {b.user_name || b.nama_peminjam}
                          </div>
                        </div>
                        {!isRead ? (
                          <button
                            onClick={(e) => handleDismiss(b.id, e)}
                            title="Tandai dibaca"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, marginTop: '2px', opacity: 0.4, transition: 'opacity 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                          >
                            <X size={14} color="#64748b" />
                          </button>
                        ) : (
                          <ChevronRight size={14} color="#cbd5e1" style={{ marginTop: '4px', flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {displayBookings.length > 0 && (
                <div
                  onClick={() => { setShowNotifDropdown(false); if (onMenuChange) onMenuChange('verifikasi'); }}
                  style={{ padding: '12px 20px', textAlign: 'center', borderTop: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1e3a8a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Lihat Semua Pengajuan →
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} className="user-profile-wrapper" style={{ position: 'relative' }}>
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
              position: 'absolute', top: '100%', right: 0, marginTop: '12px',
              background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              width: '240px', zIndex: 1000, overflow: 'hidden', border: '1px solid #f3f4f6'
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
