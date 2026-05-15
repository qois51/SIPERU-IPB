import React from 'react';
import { Search } from 'lucide-react';

const CatalogControls = ({ searchQuery, setSearchQuery, sortBy, setSortBy }) => {
  return (
    <div 
      className="catalog-controls" 
      style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '32px',
        width: '100%'
      }}
    >
      {/* Kotak Pencarian */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          border: '1px solid #94a3b8', 
          borderRadius: '6px', 
          padding: '8px 12px',
          background: 'white',
          width: '280px'
        }}
      >
        <Search size={16} color="#94a3b8" style={{ marginRight: '8px', flexShrink: 0 }} />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search" 
          style={{ 
            border: 'none', 
            outline: 'none', 
            width: '100%', 
            fontSize: '13px',
            color: '#000' 
          }} 
        />
      </div>

      {/* Menu Urutkan */}
      <select 
        value={sortBy} 
        onChange={(e) => setSortBy(e.target.value)}
        style={{ 
          padding: '8px 16px', 
          borderRadius: '6px', 
          border: '1px solid #1e3a8a', 
          background: 'white', 
          color: '#1e3a8a', 
          fontWeight: 700, 
          fontSize: '13px',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="new">Sort: New</option>
        <option value="name_asc">Sort: A - Z</option>
        <option value="name_desc">Sort: Z - A</option>
        <option value="cap_desc">Kapasitas: Terbesar</option>
        <option value="cap_asc">Kapasitas: Terkecil</option>
      </select>
    </div>
  );
};

export default CatalogControls;
