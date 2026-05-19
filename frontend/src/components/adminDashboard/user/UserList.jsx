import React, { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { User, Edit2, Trash2, Search } from 'lucide-react';

const ROLE_FILTERS = ['Semua', 'mahasiswa', 'dosen', 'satpam', 'admin'];

const UserList = ({ onAddUser, onEditUser, onZoomImage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState('Semua');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      const userData = res.data?.users || res.users || res.data || res || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      try {
        alert('Fitur hapus belum diimplementasikan di service admin.');
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus user');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nim_nip?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = activeRole === 'Semua' || u.role === activeRole;
    return matchSearch && matchRole;
  });

  const countByRole = (role) =>
    role === 'Semua' ? users.length : users.filter(u => u.role === role).length;

  if (loading) return <div>Memuat data user...</div>;

  return (
    <div className="user-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0 }}>Kelola Pengguna</h2>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>Manajemen data mahasiswa, dosen, satpam, dan admin.</p>
        </div>
        <button className="btn-primary" onClick={onAddUser} style={{ width: 'auto', padding: '10px 24px' }}>
          + Tambah User Baru
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {ROLE_FILTERS.map(role => {
          const isActive = activeRole === role;
          const count = countByRole(role);
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                border: `1px solid ${isActive ? '#1e3a8a' : '#e5e7eb'}`,
                background: isActive ? '#1e3a8a' : 'white',
                color: isActive ? 'white' : '#374151',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {role === 'Semua' ? 'Semua' : role.charAt(0).toUpperCase() + role.slice(1)}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                color: isActive ? 'white' : '#6b7280',
                borderRadius: '999px',
                padding: '1px 7px',
                fontSize: '11px',
                fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="search-bar-wrapper" style={{ marginBottom: '24px', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={20} />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, username, atau NIM/NIP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none' }}
        />
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User</th>
              <th>NIM / NIP</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                  Tidak ada user yang sesuai filter.
                </td>
              </tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      className="user-avatar-mini"
                      onClick={() => u.profile_image && onZoomImage(u.profile_image)}
                      style={{ cursor: u.profile_image ? 'zoom-in' : 'default' }}
                    >
                      {u.profile_image ? (
                        <img src={u.profile_image} alt={u.username} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color="#9ca3af" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                      <div style={{ fontSize: '12px', opacity: 0.6 }}>@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td>{u.nim_nip}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`status-pill ${u.role}`}>
                    {u.role}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button className="btn-action edit" onClick={() => onEditUser(u)} title="Edit User">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-action delete" onClick={() => handleDelete(u.id)} title="Hapus User">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
