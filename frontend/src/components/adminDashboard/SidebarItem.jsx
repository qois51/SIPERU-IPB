import React from 'react';

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`sidebar-item ${active ? 'active' : ''}`}>
    <Icon size={20} />
    <span>{label}</span>
  </div>
);

export default SidebarItem;
