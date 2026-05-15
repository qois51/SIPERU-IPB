import React from 'react';

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

  // Use dynamic list from backend; fallback to defaults if API hasn't loaded yet
  const defaultFacilities = ['AC', 'Proyektor', 'Sound System', 'Meja', 'Kursi', 'Papan Tulis', 'Podium', 'Komputer', 'WiFi'];
  const facilitiesList = availableFacilities.length > 0 ? availableFacilities : defaultFacilities;

  return (
    <div 
      className="catalog-sidebar" 
      style={{ 
        background: 'white', 
        border: '1px solid #1e3a8a', 
        borderRadius: '12px', 
        padding: '28px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '24px',
        alignSelf: 'start',
        position: 'sticky',
        top: '100px'
      }}
    >
      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#000', margin: 0 }}>
        Filter Ruangan
      </h3>

      {/* Lokasi / Gedung */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Lokasi/Gedung</label>
        <select 
          value={selectedLocation} 
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{ 
            padding: '10px 12px', 
            borderRadius: '20px', 
            border: '1px solid #1e3a8a', 
            background: 'white', 
            fontSize: '13px', 
            color: '#1e3a8a', 
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">Semua Lokasi</option>
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* Kapasitas Ruangan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Kapasitas Ruangan</label>
        
        {/* Functioning Range Slider */}
        <input 
          type="range" 
          min="1" 
          max="500" 
          value={maxCap || 500} 
          onChange={(e) => setMaxCap(e.target.value)}
          style={{ 
            width: '100%', 
            accentColor: '#2563eb', 
            cursor: 'pointer',
            height: '6px'
          }} 
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input 
            type="number" 
            value={minCap} 
            onChange={(e) => setMinCap(e.target.value)} 
            placeholder="1" 
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: '1px solid #94a3b8', 
              textAlign: 'center', 
              fontSize: '13px' 
            }} 
          />
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>-</span>
          <input 
            type="number" 
            value={maxCap} 
            onChange={(e) => setMaxCap(e.target.value)} 
            placeholder="200" 
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: '1px solid #94a3b8', 
              textAlign: 'center', 
              fontSize: '13px' 
            }} 
          />
        </div>
      </div>

      {/* Fasilitas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Fasilitas</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
          {facilitiesList.map((fac) => {
            const isChecked = selectedFacilities.includes(fac);
            return (
              <label 
                key={fac} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  fontSize: '13px', 
                  color: '#334155', 
                  cursor: 'pointer' 
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => toggleFacility(fac)}
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    accentColor: '#1e3a8a', 
                    cursor: 'pointer',
                    borderRadius: '4px' 
                  }} 
                />
                <span>{fac}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tanggal yang Diinginkan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: 700, color: '#000' }}>Tanggal yang Diinginkan</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ 
            padding: '10px 12px', 
            borderRadius: '6px', 
            border: '1px solid #1e3a8a', 
            fontSize: '13px', 
            color: '#000', 
            outline: 'none',
            cursor: 'pointer' 
          }} 
        />
      </div>

      {/* Tombol Aksi */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button 
          onClick={onResetFilter}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: 'transparent', 
            color: '#dc2626', 
            border: '1px solid #dc2626', 
            borderRadius: '6px', 
            fontWeight: 700, 
            fontSize: '14px', 
            cursor: 'pointer'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Reset
        </button>
        <button 
          onClick={onApplyFilter}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#1e3a8a', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            fontWeight: 700, 
            fontSize: '14px', 
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.15)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = 0.9; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = 1; }}
        >
          Terapkan
        </button>
      </div>

    </div>
  );
};

export default CatalogSidebar;
