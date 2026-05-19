import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './Pages/Login/LoginPage';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard';
import LandingPage from './Pages/LandingPage/LandingPage';
import CatalogPage from './Pages/Catalog/CatalogPage';
import RoomDetailPage from './Pages/Catalog/RoomDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

// New Pages — Phase 5-8
import BookingForm from './Pages/Booking/BookingForm';
import BookingSuccess from './Pages/Booking/BookingSuccess';
import BookingDetail from './Pages/Booking/BookingDetail';
import DashboardPengajuan from './Pages/Dashboard/DashboardPengajuan';
import ProfilePage from './Pages/Profile/ProfilePage';
import SettingsPage from './Pages/Profile/SettingsPage';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Rute publik */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/katalog/:id" element={<RoomDetailPage />} />
          <Route path="/catalog/:id" element={<RoomDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rute mahasiswa — memerlukan login */}
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

          {/* Rute terproteksi — hanya admin, satpam, karyawan */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'satpam', 'karyawan']} redirectTo="/">
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
