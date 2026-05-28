import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import adminService from '../../services/adminService';
import Sidebar from '../../components/adminDashboard/Sidebar';
import Header from '../../components/adminDashboard/Header';
import StatCards from '../../components/adminDashboard/StatCards';
import ActivityList from '../../components/adminDashboard/ActivityList';
import VerificationPage from './verification/VerificationPage';
import RoomPage from './room/RoomPage';
import UserPage from './user/UserPage';
import EPassScanner from './scanner/EPassScanner';
import LaporanPage from './laporan/LaporanPage';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'beranda';
  
  const [dashboardData, setDashboardData] = useState({ stats: null, upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        // Backend returns { success, message, data: { stats, upcoming } }
        const payload = res.data || res;
        setDashboardData({
          stats: payload.stats || payload,
          upcoming: payload.upcoming || [],
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleMenuChange = (view) => {
    setSearchParams({ view });
  };

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
      case 'scanner':
        return <EPassScanner />;
      case 'laporan':
        return <LaporanPage />;
      default:
        return <div>Halaman tidak ditemukan</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} activeMenu={activeView} onMenuChange={handleMenuChange} />
      <div className={`dashboard-main ${!isSidebarOpen ? 'full' : ''}`}>
        <Header toggleSidebar={toggleSidebar} onMenuChange={handleMenuChange} />
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
