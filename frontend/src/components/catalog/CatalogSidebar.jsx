import React, { useState } from 'react';
import { Filter, MapPin, Users, Zap, Calendar, X } from 'lucide-react';

const CatalogSidebar = ({ 
  selectedLocation, 
  setSelectedLocation, 
  minCap, 
  setMinCap, 
  maxCap, 
  setMaxCap, 
  selectedFacilities, 
  toggleFacility, 
  selectedDate, 
  setSelectedDate, 
  onApplyFilter,
  onResetFilter,
  locations = [],
  availableFacilities = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Use dynamic list from backend; fallback to defaults if API hasn't loaded yet
  const defaultFacilities = ['AC', 'Proyektor', 'Sound System', 'Meja', 'Kursi', 'Papan Tulis', 'Podium', 'Komputer', 'WiFi'];
  const facilitiesList = availableFacilities.length > 0 ? availableFacilities : defaultFacilities;

  // Calculate active filters count
  let activeFiltersCount = 0;
  if (selectedLocation) activeFiltersCount++;
  if (minCap > 1 || maxCap < 500) activeFiltersCount++;
  if (selectedFacilities.length > 0) activeFiltersCount += selectedFacilities.length;
  if (selectedDate) activeFiltersCount++;

  return (
    <div 
      className="catalog-sidebar" 
      style={{ 
        background: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignSelf: 'start',
        position: 'sticky',
        top: '100px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        overflow: 'hidden'
      }}
    >
      {/* Header with Gradient */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={20} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '0.5px' }}>
            Filter Ruangan
          </h3>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Lokasi / Gedung */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <MapPin size={18} color="#3b82f6" />
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Lokasi / Gedung</label>
            </div>
            <div style={{ position: 'relative' }}>
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid #cbd5e1', 
                  background: '#f8fafc', 
                  fontSize: '14px', 
                  color: '#334155', 
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                <option value="">Semua Lokasi</option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                ▼
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }}></div>

          {/* Kapasitas Ruangan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <Users size={18} color="#3b82f6" />
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Kapasitas (Orang)</label>
            </div>
            
            <div style={{ padding: '0 8px' }}>
              <input 
                type="range" 
                min="1" 
                max="500" 
                value={maxCap || 500} 
                onChange={(e) => setMaxCap(e.target.value)}
                style={{ 
                  width: '100%', 
                  accentColor: '#3b82f6', 
                  cursor: 'pointer',
                  height: '6px'
                }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>Min</span>
                <input 
                  type="number" 
                  value={minCap} 
                  onChange={(e) => setMinCap(e.target.value)} 
                  placeholder="1" 
                  style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#334155' }} 
                />
              </div>
              <span style={{ color: '#cbd5e1', fontWeight: 600 }}>-</span>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8' }}>Max</span>
                <input 
                  type="number" 
                  value={maxCap} 
                  onChange={(e) => setMaxCap(e.target.value)} 
                  placeholder="500" 
                  style={{ width: '100%', padding: '10px 12px 10px 44px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 600, color: '#334155' }} 
                />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }}></div>

          {/* Fasilitas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <Zap size={18} color="#3b82f6" />
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Fasilitas Ruangan</label>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {facilitiesList.map((fac) => {
                const isChecked = selectedFacilities.includes(fac);
                return (
                  <button
                    key={fac}
                    onClick={() => toggleFacility(fac)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '999px',
                      border: isChecked ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
                      background: isChecked ? '#eff6ff' : 'white',
                      color: isChecked ? '#1e3a8a' : '#64748b',
                      fontSize: '13px',
                      fontWeight: isChecked ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {fac}
                    {isChecked && <X size={14} color="#1e3a8a" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1px', background: '#f1f5f9' }}></div>

          {/* Tanggal yang Diinginkan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <Calendar size={18} color="#3b82f6" />
              <label style={{ fontSize: '14px', fontWeight: 700 }}>Tanggal Tersedia</label>
            </div>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ 
                width: '100%',
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: '1px solid #cbd5e1', 
                background: '#f8fafc',
                fontSize: '14px', 
                fontWeight: 600,
                color: '#334155', 
                outline: 'none',
                cursor: 'pointer' 
              }} 
            />
          </div>

          {/* Tombol Aksi */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button 
              onClick={onResetFilter}
              style={{ 
                flex: 1, 
                padding: '12px', 
                background: '#fef2f2', 
                color: '#ef4444', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '14px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
            >
              Reset Filter
            </button>
            <button 
              onClick={onApplyFilter}
              style={{ 
                flex: 1.5, 
                padding: '12px', 
                background: '#1e3a8a', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 700, 
                fontSize: '14px', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#172554'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#1e3a8a'; }}
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogSidebar;
