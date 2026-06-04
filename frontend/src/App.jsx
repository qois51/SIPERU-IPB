import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard';
import LandingPage from './Pages/LandingPage/LandingPage';
import CatalogPage from './Pages/Catalog/CatalogPage';
import RoomDetailPage from './Pages/Catalog/RoomDetailPage';
import ProtectedRoute from './components/ProtectedRoute';


import BookingForm from './Pages/Booking/BookingForm';
import BookingSuccess from './Pages/Booking/BookingSuccess';
import BookingDetail from './Pages/Booking/BookingDetail';
import DashboardPengajuan from './Pages/Dashboard/DashboardPengajuan';
import ProfilePage from './Pages/Profile/ProfilePage';
import SettingsPage from './Pages/Profile/SettingsPage';


function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}


function ScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [hash]);

  return null;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <ScrollToTop />
        <ScrollToHash />
        <Routes>
          {}
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/katalog/:id" element={<RoomDetailPage />} />
          <Route path="/catalog/:id" element={<RoomDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPengajuan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:roomId"
            element={
              <ProtectedRoute>
                <BookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:bookingId/success"
            element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:id/detail"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaturan"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'satpam', 'dosen', 'pic']} redirectTo="/">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
