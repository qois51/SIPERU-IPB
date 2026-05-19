import React from 'react';
import StatCard from './StatCard';

const StatCards = ({ stats }) => {
  return (
    <div className="dashboard-stats-grid">
      <StatCard type="dashboard" label="Menunggu Verifikasi" value={stats?.pending || 0} color="#B91C1C" />
      <StatCard type="dashboard" label="Reservasi Aktif" value={stats?.active || 0} color="#1E3A8A" />
      <StatCard type="dashboard" label="Total Ruangan Tersedia" value={stats?.total_rooms || 0} color="#FFFFFF" />
    </div>
  );
};

export default StatCards;
