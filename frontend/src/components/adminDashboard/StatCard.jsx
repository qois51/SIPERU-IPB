import React from 'react';

const StatCard = ({ icon: Icon, imgSrc, value, label, type = 'login', color }) => {
  if (type === 'dashboard') {
    const isLight = color === '#FFFFFF';
    return (
      <div className="dashboard-stat-card" style={{ backgroundColor: color, color: isLight ? '#374151' : 'white' }}>
        <p style={{ color: 'inherit' }}>{label}</p>
        <h2 style={{ color: 'inherit' }}>{value}</h2>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="stat-icon">
        {imgSrc ? <img src={imgSrc} alt={label} style={{ width: '100%', height: 'auto' }} /> : Icon && <Icon size={24} />}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
