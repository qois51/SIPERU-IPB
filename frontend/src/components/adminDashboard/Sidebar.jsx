import React from 'react';
import { Home, FileCheck, DoorOpen, Users, Calendar, FileBarChart } from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ isOpen, activeMenu, onMenuChange }) => {
  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src="/loginAsset/logologin.png" alt="Logo" style={{ width: '50px' }} />
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.1', margin: 0 }}>
            S<span style={{ color: '#fbbf24' }}>IPB</span>eru
          </h3>
          <p style={{ fontSize: '12px', opacity: 0.7, margin: 0 }}>Admin Dashboard</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div onClick={() => onMenuChange('beranda')}>
          <SidebarItem icon={Home} label="Beranda" active={activeMenu === 'beranda'} />
        </div>
        <div onClick={() => onMenuChange('verifikasi')}>
          <SidebarItem icon={FileCheck} label="Verifikasi" active={activeMenu === 'verifikasi' || activeMenu === 'verifikasi-detail'} />
        </div>
        <div onClick={() => onMenuChange('ruangan')}>
          <SidebarItem icon={DoorOpen} label="Ruangan" active={activeMenu === 'ruangan'} />
        </div>
        <div onClick={() => onMenuChange('user')}>
          <SidebarItem icon={Users} label="Kelola User" active={activeMenu === 'user'} />
        </div>
        <SidebarItem icon={Calendar} label="Kalender" />
        <SidebarItem icon={FileBarChart} label="Laporan" />
      </nav>
    </aside>
  );
};

export default Sidebar;
