import React from 'react';
import { Home, FileCheck, DoorOpen, Users, Calendar, FileBarChart, ScanLine, HelpCircle } from 'lucide-react';
import SidebarItem from './SidebarItem';

const ALL_MENU_ITEMS = [
  { key: 'beranda', icon: Home, label: 'Beranda' },
  { key: 'verifikasi', icon: FileCheck, label: 'Verifikasi' },
  { key: 'ruangan', icon: DoorOpen, label: 'Ruangan' },
  { key: 'user', icon: Users, label: 'Kelola User' },
  { key: 'scanner', icon: ScanLine, label: 'Scan E-Pass' },
  { key: 'kalender', icon: Calendar, label: 'Kalender' },
  { key: 'laporan', icon: FileBarChart, label: 'Laporan' },
  { key: 'helpcenter', icon: HelpCircle, label: 'Help Center' },
];

const ROLE_MENUS = {
  admin: ['beranda', 'verifikasi', 'ruangan', 'user', 'scanner', 'kalender', 'laporan', 'helpcenter'],
  satpam: ['beranda', 'scanner', 'kalender'],
  pic: ['beranda', 'verifikasi', 'ruangan', 'kalender', 'laporan'],
  dosen: ['beranda', 'verifikasi', 'ruangan', 'kalender', 'laporan'],
};

const ROLE_LABELS = {
  admin: 'Admin Dashboard',
  satpam: 'Satpam Dashboard',
  pic: 'PIC Ruangan',
  dosen: 'Dosen Dashboard',
};

const Sidebar = ({ isOpen, activeMenu, onMenuChange }) => {
  const role = localStorage.getItem('role') || 'admin';
  const allowedKeys = ROLE_MENUS[role] || ROLE_MENUS['admin'];
  const visibleItems = ALL_MENU_ITEMS.filter(item => allowedKeys.includes(item.key));

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src="/loginAsset/logologin.png" alt="Logo" style={{ width: '50px' }} />
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.1', margin: 0 }}>
            S<span style={{ color: '#fbbf24' }}>IPB</span>eru
          </h3>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>{ROLE_LABELS[role] || 'Dashboard'}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <div key={item.key} onClick={() => onMenuChange(item.key)}>
            <SidebarItem
              icon={item.icon}
              label={item.label}
              active={activeMenu === item.key || (item.key === 'verifikasi' && activeMenu === 'verifikasi-detail')}
            />
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
