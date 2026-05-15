import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import LandingPage from './pages/LandingPage/LandingPage';
import CatalogPage from './pages/Catalog/CatalogPage';
import RoomDetailPage from './pages/Catalog/RoomDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Rute publik */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/katalog/:id" element={<RoomDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

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
