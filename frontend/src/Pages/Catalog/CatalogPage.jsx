import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Users, User, ChevronRight, Banknote } from 'lucide-react';

// Modular Components
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CatalogSidebar from '../../components/catalog/CatalogSidebar';
import CatalogControls from '../../components/catalog/CatalogControls';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CatalogPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const getInitialSearchQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  };
  const [searchQuery, setSearchQuery] = useState(getInitialSearchQuery());
  const [sortBy, setSortBy] = useState('new');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minCap, setMinCap] = useState('');
  const [maxCap, setMaxCap] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2025-02-14');

  // Trigger Filter Application State
  const [appliedFilters, setAppliedFilters] = useState({
    location: '',
    minCap: '',
    maxCap: '',
    facilities: []
  });

  const fallbackRooms = [
    { id: 1, name: 'Ruang Seminar A', location: 'Gedung Rektorat, Lantai 4', capacity: 30, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop', facilities: ['AC', 'Proyektor', 'Sound System', 'Kursi', 'Meja'] },
    { id: 2, name: 'Ruang Seminar B', location: 'Gedung Rektorat, Lantai 4', capacity: 50, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', facilities: ['AC', 'Proyektor', 'WiFi', 'Kursi', 'Meja'] },
    { id: 3, name: 'Ruang Seminar C', location: 'Gedung Rektorat, Lantai 4', capacity: 100, pic: 'Bpk Hendra, M.T', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop', facilities: ['AC', 'Sound System', 'Podium', 'WiFi'] },
    { id: 4, name: 'Auditorium Utama', location: 'Gedung Andi Hakim Nasoetion', capacity: 300, pic: 'Prof. Dr. Arif Satria', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop', facilities: ['AC', 'Proyektor', 'Sound System', 'Papan Tulis', 'Podium', 'WiFi'] },
    { id: 5, name: 'Ruang Diskusi Terpadu', location: 'Gedung Perpustakaan', capacity: 20, pic: 'Dr. Ir. Ibnul Qayim', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop', facilities: ['AC', 'WiFi', 'Meja', 'Kursi', 'Komputer'] },
  ];

  useEffect(() => {
    // Scroll to top upon navigation
    window.scrollTo(0, 0);

    api.get(`/rooms/`)
      .then(res => {
        const data = res.data?.data || res.data || [];
        if (data && data.length > 0) {
          setRooms(data);
        } else {
          setRooms(fallbackRooms);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rooms API, using fallback data:", err);
        setRooms(fallbackRooms);
        setLoading(false);
      });
  }, []);

  // Listen to URL search parameter changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Extract unique locations dynamically for the sidebar select dropdown
  const uniqueLocations = Array.from(new Set(rooms.map(r => r.location).filter(Boolean)));

  // Extract all unique facilities from all rooms (flatten + dedupe)
  const uniqueFacilities = Array.from(
    new Set(
      rooms.flatMap(r => {
        if (Array.isArray(r.facilities)) return r.facilities;
        if (typeof r.facilities === 'string') return r.facilities.split(',').map(f => f.trim());
        return [];
      }).filter(Boolean)
    )
  ).sort();

  const toggleFacility = (facility) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  const handleApplyFilter = () => {
    setAppliedFilters({
      location: selectedLocation,
      minCap,
      maxCap,
      facilities: [...selectedFacilities]
    });
  };

  const handleResetFilter = () => {
    setSelectedLocation('');
    setMinCap('');
    setMaxCap('');
    setSelectedFacilities([]);
    setAppliedFilters({
      location: '',
      minCap: '',
      maxCap: '',
      facilities: []
    });
  };

  const getRoomImage = (room) => {
    if (room.image_url && Array.isArray(room.image_url) && room.image_url.length > 0) return room.image_url[0];
    if (room.image) return room.image;
    return 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  // Filter logic combined with search query
  const filteredRooms = rooms.filter(room => {
    // Search Query matching
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = room.name?.toLowerCase().includes(query);
      const matchLoc = room.location?.toLowerCase().includes(query);
      if (!matchName && !matchLoc) return false;
    }

    // Applied Filters
    if (appliedFilters.location && room.location !== appliedFilters.location) {
      return false;
    }
    if (appliedFilters.minCap && room.capacity < parseInt(appliedFilters.minCap)) {
      return false;
    }
    if (appliedFilters.maxCap && room.capacity > parseInt(appliedFilters.maxCap)) {
      return false;
    }
    if (appliedFilters.facilities && appliedFilters.facilities.length > 0) {
      const roomFacs = Array.isArray(room.facilities) ? room.facilities : [];
      // Verify if room contains all selected facilities
      const hasAll = appliedFilters.facilities.every(fac => roomFacs.includes(fac));
      if (!hasAll && room.facilities?.length > 0) return false;
    }

    return true;
  });

  // Sort logic
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
    if (sortBy === 'cap_desc') return b.capacity - a.capacity;
    if (sortBy === 'cap_asc') return a.capacity - b.capacity;
    return (b.id || 0) - (a.id || 0); // Default to newest
  });

  return (
    <div className="catalog-page-container" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Main Layout Container */}
      <div style={{ padding: '0 24px', width: '100%', flexGrow: 1, marginBottom: '80px' }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, margin: '16px 0 32px', color: '#000' }}>
          <Link to="/" style={{ color: '#000', textDecoration: 'none' }}>Beranda</Link>
          <ChevronRight size={16} strokeWidth={3} />
          <span>Katalog</span>
        </div>

        {/* Page Titles */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 12px', color: '#000' }}>Katalog Ruangan</h1>
          <p style={{ fontSize: '16px', color: '#64748b', margin: 0, fontWeight: 500 }}>
            Cari Ruangan yang Tepat Untuk Acaramu Disini
          </p>
        </div>

        {/* Top Search and Sort Controls Bar */}
        <CatalogControls 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          sortBy={sortBy} 
          setSortBy={setSortBy} 
        />

        {/* Main 2-Column Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Panel: Sidebar Filtering */}
          <CatalogSidebar 
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            minCap={minCap}
            setMinCap={setMinCap}
            maxCap={maxCap}
            setMaxCap={setMaxCap}
            selectedFacilities={selectedFacilities}
            toggleFacility={toggleFacility}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
            locations={uniqueLocations}
            availableFacilities={uniqueFacilities}
          />

          {/* Right Panel: Room Cards Grid */}
          <div>
            {loading ? (
              <LoadingSpinner text="Memuat katalog ruangan..." />
            ) : sortedRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', color: '#334155', margin: '0 0 8px' }}>Tidak ada ruangan yang sesuai filter</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Cobalah untuk mengatur ulang kriteria penyaringan atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {sortedRooms.map((room, idx) => (
                  <div 
                    key={room.id || idx} 
                    style={{ 
                      background: 'white', 
                      borderRadius: '12px', 
                      border: '1px solid #1e3a8a', 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
                      <img 
                        src={getRoomImage(room)} 
                        alt={room.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px', color: '#000' }}>{room.name}</h4>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#000', margin: '0 0 14px' }}>{formatPrice(room.price || 0)} / Sesi</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#1e3a8a', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={15} style={{ flexShrink: 0 }} /> 
                          <span style={{ color: '#4b5563' }}>{room.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={15} style={{ flexShrink: 0 }} /> 
                          <span style={{ color: '#4b5563' }}>Kapasitas {room.capacity} Orang</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={15} style={{ flexShrink: 0 }} /> 
                          <span style={{ color: '#4b5563' }}>PIC: {room.pic_name || room.pic || 'Bpk Hendra, M.T'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/katalog/${room.id}`)}
                        style={{ 
                          marginTop: 'auto', 
                          width: '100%', 
                          padding: '10px', 
                          background: 'transparent', 
                          border: '1px solid #1e3a8a', 
                          color: '#1e3a8a', 
                          borderRadius: '6px', 
                          fontWeight: 700, 
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default CatalogPage;
