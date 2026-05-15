import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/adminDashboard/Sidebar';
import Header from '../../components/adminDashboard/Header';
import StatCards from '../../components/adminDashboard/StatCards';
import ActivityList from '../../components/adminDashboard/ActivityList';
import VerificationPage from './verification/VerificationPage';
import RoomPage from './room/RoomPage';
import UserPage from './user/UserPage';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('beranda'); // 'beranda', 'verifikasi', 'ruangan', 'user'
  const [dashboardData, setDashboardData] = useState({ stats: null, upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/dashboard/stats');
        setDashboardData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (activeView) {
      case 'beranda':
        return (
          <>
            <section className="overview-section">
              <h3 style={{ marginBottom: '24px' }}>Overview</h3>
              <StatCards stats={dashboardData.stats} />
            </section>
            <ActivityList activities={dashboardData.upcoming} />
          </>
        );
      case 'verifikasi':
        return <VerificationPage />;
      case 'ruangan':
        return <RoomPage />;
      case 'user':
        return <UserPage />;
      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} activeMenu={activeView} onMenuChange={(view) => setActiveView(view)} />
      <div className={`dashboard-main ${!isSidebarOpen ? 'full' : ''}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
