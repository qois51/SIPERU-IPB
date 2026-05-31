import React, { useState, useEffect, useRef } from 'react';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  Search, 
  Info,
  TrendingUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import adminService from '../../../services/adminService';
import ExportLaporanPDF from './ExportLaporanPDF';
import html2pdf from 'html2pdf.js';

const LaporanPage = () => {
  const [period, setPeriod] = useState('1month'); // '1month', '6months', '1year', 'all'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  
  // Table search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const pdfRef = useRef();

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getReportsStats(period);
      setData(res.data || res);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching reports stats:', err);
      setError(err.message || 'Gagal memuat data laporan peminjaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [period]);

  const handleExportPDF = () => {
    const element = pdfRef.current;
    if (!element || !data) return;

    const periodLabels = {
      '1month': '1_Bulan_Terakhir',
      '6months': '6_Bulan_Terakhir',
      '1year': '1_Tahun_Terakhir',
      'all': 'Semua_Periode'
    };
    
    const filename = `Laporan_SIPERU_IPB_${periodLabels[period]}_${new Date().toISOString().slice(0, 10)}.pdf`;

    element.style.display = 'block';

    const opt = {
      margin:       [0, 0, 0, 0],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    });
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'pending' || s === 'menunggu') return { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500', label: 'Menunggu' };
    if (s === 'approved' || s === 'disetujui') return { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500', label: 'Disetujui' };
    if (s === 'rejected' || s === 'ditolak') return { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', dot: 'bg-rose-500', label: 'Ditolak' };
    if (s === 'completed' || s === 'selesai') return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500', label: 'Selesai' };
    if (s === 'checkedin') return { bg: 'bg-violet-50 text-violet-700 border-violet-200/60', dot: 'bg-violet-500', label: 'Check-In' };
    if (s === 'cancelled' || s === 'batal') return { bg: 'bg-slate-50 text-slate-600 border-slate-200/60', dot: 'bg-slate-500', label: 'Dibatalkan' };
    return { bg: 'bg-slate-50 text-slate-700 border-slate-200/60', dot: 'bg-slate-500', label: status };
  };

  // Filter bookings based on search
  const filteredBookings = data?.bookings?.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      (b.booking_code && b.booking_code.toLowerCase().includes(term)) ||
      (b.room_name && b.room_name.toLowerCase().includes(term)) ||
      (b.nama_peminjam && b.nama_peminjam.toLowerCase().includes(term)) ||
      (b.program_studi && b.program_studi.toLowerCase().includes(term)) ||
      (b.organization && b.organization.toLowerCase().includes(term)) ||
      (b.activity_name && b.activity_name.toLowerCase().includes(term))
    );
  }) || [];

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const summary = data?.summary || {
    total_bookings: 0,
    total_approved: 0,
    total_completed: 0,
    total_pending: 0,
    total_rejected: 0,
    total_participants: 0,
    total_duration_hours: 0
  };

  const approvalRate = summary.total_bookings > 0 
    ? Math.round((summary.total_approved / summary.total_bookings) * 100) 
    : 0;

  // Circular progress calculations for approval rate
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (approvalRate / 100) * circumference;

  // Maximum count for normalizing charts
  const maxRoomCount = Math.max(...(data?.by_room?.map(r => r.count) || [1]), 1);
  const maxDeptCount = Math.max(...(data?.by_department?.map(d => d.count) || [1]), 1);
  const maxOrgCount = Math.max(...(data?.by_organization?.map(o => o.count) || [1]), 1);

  // Awards/Rankings styles
  const getRankBadge = (idx) => {
    if (idx === 0) return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: '1st', color: '#d97706' };
    if (idx === 1) return { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: '2nd', color: '#475569' };
    if (idx === 2) return { bg: 'bg-orange-100 text-orange-800 border-orange-200', label: '3rd', color: '#ea580c' };
    return { bg: 'bg-slate-50 text-slate-500 border-slate-100', label: `${idx + 1}th`, color: '#94a3b8' };
  };

  return (
    <div className="laporan-page-root" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .laporan-page-root {
          padding: 8px 0 32px 0;
          max-width: 100%;
          overflow-x: hidden;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lp-animate-fade-up {
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .lp-delay-1 { animation-delay: 80ms; }
        .lp-delay-2 { animation-delay: 160ms; }
        .lp-delay-3 { animation-delay: 240ms; }
        .lp-delay-4 { animation-delay: 320ms; }
        
        /* Loading pulse ring */
        .lp-pulse-ring {
          position: absolute;
          width: 56px;
          height: 56px;
          border: 3px solid #dbeafe;
          border-radius: 50%;
          animation: lpPulseRing 1.5s ease-out infinite;
        }
        .lp-loader {
          width: 56px;
          height: 56px;
          border: 3px solid transparent;
          border-top: 3px solid #1e3a8a;
          border-radius: 50%;
          animation: lpSpin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        }
        @keyframes lpPulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes lpSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .lp-spin-slow {
          animation: lpSpin 5s linear infinite;
        }

        /* Stat card hover */
        .lp-stat-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lp-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.08), 0 4px 10px -4px rgba(0, 0, 0, 0.04);
        }

        /* Panel hover */
        .lp-panel {
          transition: box-shadow 0.3s ease;
        }
        .lp-panel:hover {
          box-shadow: 0 8px 24px -6px rgba(0, 0, 0, 0.07), 0 2px 8px -2px rgba(0, 0, 0, 0.03);
        }

        /* Table */
        .lp-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .lp-table-wrap table {
          min-width: 820px;
        }
        .lp-table-wrap th {
          white-space: nowrap;
        }
        .lp-table-wrap td {
          vertical-align: top;
        }

        /* Period button */
        .lp-period-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Org card */
        .lp-org-card {
          transition: all 0.25s ease;
        }
        .lp-org-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px -4px rgba(0, 0, 0, 0.06);
        }

        /* Pagination btn */
        .lp-page-btn {
          transition: all 0.2s ease;
        }

        /* Export CTA */
        .lp-export-cta {
          transition: all 0.3s ease;
        }
        .lp-export-cta:hover {
          transform: scale(1.015);
          box-shadow: 0 16px 40px -8px rgba(30, 58, 138, 0.35);
        }
        .lp-export-cta:active {
          transform: scale(0.98);
        }

        /* Scrollbar for table */
        .lp-table-wrap::-webkit-scrollbar {
          height: 6px;
        }
        .lp-table-wrap::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .lp-table-wrap::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        /* Responsive: stack grids on smaller available widths */
        @media (max-width: 1100px) {
          .lp-org-status-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 860px) {
          .lp-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {/* ===== HEADER SECTION ===== */}
      <div className="lp-animate-fade-up" style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Title area */}
          <div>
            <div className="admin-page-header" style={{ marginBottom: '8px' }}>
              <h2 className="admin-page-title">LAPORAN & ANALITIK</h2>
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.6, maxWidth: '640px', margin: 0, color: '#94a3b8' }}>
              Himpunan performa operasional, statistik tingkat okupansi ruangan, instansi teraktif, serta dokumen riwayat resmi untuk Institut Pertanian Bogor.
            </p>
          </div>

          {/* Period Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(241, 245, 249, 0.9)', 
            padding: '5px', 
            borderRadius: '16px', 
            border: '1px solid rgba(226, 232, 240, 0.5)', 
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
            width: 'fit-content',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            {[
              { value: '1month', label: '1 Bulan' },
              { value: '6months', label: '6 Bulan' },
              { value: '1year', label: '1 Tahun' },
              { value: 'all', label: 'Semua Periode' }
            ].map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className="lp-period-btn"
                style={{
                  padding: '9px 18px',
                  fontSize: '12px',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  ...(period === p.value 
                    ? { background: '#1e3a8a', color: 'white', boxShadow: '0 4px 12px -2px rgba(30, 58, 138, 0.2)' }
                    : { background: 'transparent', color: '#64748b' }
                  )
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#fff1f2', 
          border: '1px solid #fecdd3', 
          borderRadius: '16px', 
          padding: '16px 20px', 
          marginBottom: '28px', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '14px' 
        }}>
          <Info style={{ flexShrink: 0, marginTop: '2px', color: '#f43f5e' }} size={18} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '13px', color: '#be123c', margin: '0 0 3px 0' }}>Terjadi Hambatan Komunikasi</h4>
            <p style={{ fontSize: '12px', fontWeight: 500, color: '#e11d48', margin: 0, opacity: 0.9 }}>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div className="lp-pulse-ring" />
            <div className="lp-loader" />
          </div>
          <span style={{ color: '#64748b', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '8px' }} className="animate-pulse">Menghimpun statistik dari server...</span>
        </div>
      ) : (
        <>
          {/* ===== STATS METRIC GRID ===== */}
          <div className="lp-animate-fade-up" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '20px', 
            marginBottom: '32px' 
          }}>
            {/* CARD 1: Total Peminjaman */}
            <div className="lp-stat-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, width: '80px', height: '80px', background: 'linear-gradient(180deg, rgba(59,130,246,0.06), transparent)', borderBottomLeftRadius: '100%', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Peminjaman</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '6px', margin: '8px 0 0 0' }}>
                    {summary.total_bookings}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Berkas</span>
                  </h3>
                </div>
                <div style={{ padding: '12px', background: 'rgba(219, 234, 254, 0.5)', color: '#1e40af', borderRadius: '14px', border: '1px solid rgba(191, 219, 254, 0.4)' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
                <span style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '3px', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                  <TrendingUp size={10} /> Aktif
                </span>
                <span>Seluruh usulan peminjam</span>
              </div>
            </div>

            {/* CARD 2: Approval Rate (Radial Progress Chart) */}
            <div className="lp-stat-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tingkat Approval</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '8px 0 0 0' }}>{approvalRate}%</h3>
                </div>
                
                {/* Radial SVG */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg style={{ width: '60px', height: '60px', transform: 'rotate(-90deg)' }}>
                    <circle cx="30" cy="30" r={radius} stroke="#f1f5f9" strokeWidth="5" fill="transparent" />
                    <circle 
                      cx="30" 
                      cy="30" 
                      r={radius} 
                      stroke="#059669" 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray={circumference} 
                      strokeDashoffset={strokeDashoffset} 
                      strokeLinecap="round" 
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 900, color: '#059669' }}>{approvalRate}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
                <span style={{ color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>Rasio</span>
                <span>Persetujuan usul kegiatan</span>
              </div>
            </div>

            {/* CARD 3: Accumulated Usage in Hours */}
            <div className="lp-stat-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, width: '80px', height: '80px', background: 'linear-gradient(180deg, rgba(245,158,11,0.06), transparent)', borderBottomLeftRadius: '100%', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Akumulasi Durasi</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '8px 0 0 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    {summary.total_duration_hours}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Jam</span>
                  </h3>
                </div>
                <div style={{ padding: '12px', background: 'rgba(254, 243, 199, 0.5)', color: '#92400e', borderRadius: '14px', border: '1px solid rgba(253, 230, 138, 0.4)' }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
                <span style={{ color: '#b45309', background: '#fffbeb', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>Durasi</span>
                <span>Waktu ruangan aktif terpakai</span>
              </div>
            </div>

            {/* CARD 4: Total Participants */}
            <div className="lp-stat-card" style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, width: '80px', height: '80px', background: 'linear-gradient(180deg, rgba(147,51,234,0.06), transparent)', borderBottomLeftRadius: '100%', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Partisipan</span>
                  <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: '8px 0 0 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    {summary.total_participants}
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Orang</span>
                  </h3>
                </div>
                <div style={{ padding: '12px', background: 'rgba(243, 232, 255, 0.5)', color: '#7e22ce', borderRadius: '14px', border: '1px solid rgba(233, 213, 255, 0.4)' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '16px', borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
                <span style={{ color: '#7e22ce', background: '#faf5ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>Estimasi</span>
                <span>Jumlah civitas akademik hadir</span>
              </div>
            </div>
          </div>

          {/* ===== ANALYSIS CHARTS & RANKINGS ===== */}
          <div className="lp-animate-fade-up lp-delay-1 lp-charts-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
            gap: '24px', 
            marginBottom: '28px' 
          }}>
            {/* LEFT PANEL: Top Rooms Usage */}
            <div className="lp-panel" style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                    Intensitas Pemanfaatan Ruang
                  </h4>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Daftar ruangan paling dicari dan jam okupansi.</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Top 5 Ruang</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data?.by_room && data.by_room.length > 0 ? (
                  data.by_room.slice(0, 5).map((room, idx) => {
                    const badge = getRankBadge(idx);
                    return (
                      <div key={room.room_name} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div 
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            border: `1.5px solid ${badge.color}`, color: badge.color, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '11px', fontWeight: 900, flexShrink: 0 
                          }}
                          className={badge.bg}
                        >
                          {badge.label}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>{room.room_name}</span>
                            <span style={{ color: '#1e40af', flexShrink: 0, fontWeight: 700, background: '#f8fafc', padding: '3px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px' }}>
                              {room.count}x · {room.hours} Jam
                            </span>
                          </div>
                          <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '99px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}>
                            <div 
                              style={{ 
                                background: 'linear-gradient(90deg, #2563eb, #4338ca)', 
                                height: '100%', borderRadius: '99px', 
                                width: `${(room.count / maxRoomCount) * 100}%`,
                                transition: 'width 1s ease-out'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 500, fontStyle: 'italic' }}>
                    Belum ada rekaman peminjaman ruangan.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Top Active Departments / Study Programs */}
            <div className="lp-panel" style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                    Departemen / Prodi Teraktif
                  </h4>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Distribusi pemesanan berdasarkan institusi pemohon.</p>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Top 5 Prodi</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data?.by_department && data.by_department.length > 0 ? (
                  data.by_department.slice(0, 5).map((dept, idx) => {
                    const badge = getRankBadge(idx);
                    return (
                      <div key={dept.program_studi} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div 
                          style={{ 
                            width: '36px', height: '36px', borderRadius: '10px', 
                            border: `1.5px solid ${badge.color}`, color: badge.color, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontSize: '11px', fontWeight: 900, flexShrink: 0 
                          }}
                          className={badge.bg}
                        >
                          {badge.label}
                        </div>
                        
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '12px' }}>{dept.program_studi}</span>
                            <span style={{ color: '#065f46', flexShrink: 0, fontWeight: 700, background: '#f8fafc', padding: '3px 10px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px' }}>
                              {dept.count} Booking
                            </span>
                          </div>
                          <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '99px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}>
                            <div 
                              style={{ 
                                background: 'linear-gradient(90deg, #059669, #0f766e)', 
                                height: '100%', borderRadius: '99px', 
                                width: `${(dept.count / maxDeptCount) * 100}%`,
                                transition: 'width 1s ease-out'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 500, fontStyle: 'italic' }}>
                    Belum ada data instansi departemen.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== ORGANIZATIONS + STATUS BREAKDOWN ===== */}
          <div className="lp-animate-fade-up lp-delay-2 lp-org-status-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', 
            gap: '24px', 
            marginBottom: '32px' 
          }}>
            {/* PANEL 1: Top Organizations */}
            <div className="lp-panel" style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  Organisasi / Unit Kegiatan Peminjam
                </h4>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Frekuensi peminjaman berdasarkan entitas organisasi pemohon.</p>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {data?.by_organization && data.by_organization.length > 0 ? (
                  data.by_organization.slice(0, 6).map((org, idx) => (
                    <div 
                      key={org.organization} 
                      className="lp-org-card"
                      style={{ 
                        padding: '16px 18px', 
                        background: '#f8fafc', 
                        border: '1px solid rgba(226, 232, 240, 0.4)', 
                        borderRadius: '14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#1d4ed8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '5px' }}>
                          <Bookmark size={9} /> Rank {idx + 1}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.organization}</div>
                      </div>
                      <div style={{ 
                        background: '#1e3a8a', color: 'white', fontWeight: 800, 
                        fontSize: '11px', padding: '8px 14px', borderRadius: '10px', 
                        flexShrink: 0, boxShadow: '0 2px 6px rgba(30, 58, 138, 0.15)',
                        whiteSpace: 'nowrap'
                      }}>
                        {org.count} Peminjaman
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 500, fontStyle: 'italic' }}>
                    Belum ada data aktivitas organisasi.
                  </div>
                )}
              </div>
            </div>

            {/* PANEL 2: Status Breakdown */}
            <div className="lp-panel" style={{ background: 'white', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  Status Operasional
                </h4>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Klasifikasi status peminjaman secara administratif.</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data?.status_breakdown ? (
                  Object.entries(data.status_breakdown)
                    .filter(([_, val]) => val > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, val]) => {
                      const statusConf = getStatusColor(key);
                      return (
                        <div 
                          key={key} 
                          style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '12px 14px', borderRadius: '12px', 
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                          className="hover:bg-slate-50 hover:border-slate-100"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ position: 'relative', display: 'flex', width: '12px', height: '12px' }}>
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-35 ${statusConf.dot}`} />
                              <span className={`relative inline-flex rounded-full h-3 w-3 ${statusConf.dot}`} />
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>{statusConf.label}</span>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', background: 'rgba(241,245,249,0.8)', border: '1px solid rgba(226,232,240,0.3)', padding: '6px 14px', borderRadius: '10px' }}>
                            {val} Berkas
                          </span>
                        </div>
                      );
                    })
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px', fontWeight: 500, fontStyle: 'italic' }}>
                    Tidak ada log status.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== DETAILED DATA TABLE ===== */}
          <div className="lp-panel lp-animate-fade-up lp-delay-3" style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: '32px' }}>
            {/* Table Header Controls */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  Rincian Riwayat Reservasi
                </h4>
                <p style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8', margin: 0 }}>Daftar menyeluruh seluruh berkas reservasi aktif pada rentang waktu ini.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '240px', minWidth: '200px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Cari kode, ruangan, atau nama..."
                    style={{ 
                      width: '100%', paddingLeft: '36px', paddingRight: '14px', 
                      paddingTop: '10px', paddingBottom: '10px',
                      fontSize: '12px', fontWeight: 600, 
                      border: '1px solid #e2e8f0', borderRadius: '12px', 
                      outline: 'none', color: '#475569',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#1e3a8a'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Show entries select */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '12px', gap: '8px', flexShrink: 0 }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                    <SlidersHorizontal size={12} /> Tampilkan:
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    style={{ border: 'none', fontSize: '12px', fontWeight: 800, color: '#334155', background: 'transparent', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="lp-table-wrap">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(248, 250, 252, 0.5)', borderBottom: '1px solid #f1f5f9' }}>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', width: '50px' }}>No</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Kode</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ruangan</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Studi / Instansi</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Agenda & Peminjam</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Jadwal & Waktu</th>
                    <th style={{ padding: '14px 20px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.length > 0 ? (
                    currentBookings.map((b, idx) => {
                      const statusStyle = getStatusColor(b.status);
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }} className="hover:bg-slate-50/30">
                          <td style={{ padding: '16px 20px', textAlign: 'center', color: '#94a3b8', fontWeight: 800, fontSize: '12px' }}>{indexOfFirstItem + idx + 1}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 800, color: '#1e293b', letterSpacing: '0.03em', fontSize: '12px' }}>{b.booking_code || '-'}</td>
                          <td style={{ padding: '16px 20px', fontWeight: 800, color: '#1e293b', fontSize: '12px' }}>{b.room_name}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#334155', fontSize: '12px' }}>{b.program_studi || 'Umum'}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>{b.organization || 'Individu'}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '12px' }}>{b.activity_name}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              Oleh: <span style={{ color: '#475569', fontWeight: 800 }}>{b.nama_peminjam || '-'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#334155', fontSize: '12px' }}>{b.date ? b.date.split('-').reverse().join('/') : '-'}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginTop: '4px' }}>{b.start_time.replace(':', '.')} - {b.end_time.replace(':', '.')} WIB</div>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                            <span className={`${statusStyle.bg}`} style={{ 
                              padding: '5px 12px', borderRadius: '10px', fontSize: '9px', 
                              fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', 
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              border: '1px solid'
                            }}>
                              <span className={statusStyle.dot} style={{ width: '5px', height: '5px', borderRadius: '50%', display: 'inline-block' }} />
                              {statusStyle.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '56px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: 700, fontStyle: 'italic', background: 'rgba(248, 250, 252, 0.2)' }}>
                        Tidak ditemukan ajuan data peminjaman yang cocok dengan pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div style={{ padding: '20px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', gap: '12px' }}>
                <div style={{ fontWeight: 700 }}>
                  Menampilkan <span style={{ fontWeight: 900, color: '#334155' }}>{indexOfFirstItem + 1}</span> hingga <span style={{ fontWeight: 900, color: '#334155' }}>{Math.min(indexOfLastItem, totalItems)}</span> dari <span style={{ fontWeight: 900, color: '#334155' }}>{totalItems}</span> berkas.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="lp-page-btn"
                    style={{ 
                      padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                      background: 'white', cursor: currentPage === 1 ? 'default' : 'pointer',
                      opacity: currentPage === 1 ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className="lp-page-btn"
                      style={{
                        padding: '6px 12px', borderRadius: '10px', fontWeight: 800, fontSize: '12px',
                        cursor: 'pointer', border: 'none',
                        ...(currentPage === i + 1 
                          ? { background: '#1e3a8a', color: 'white', boxShadow: '0 2px 8px rgba(30,58,138,0.2)' }
                          : { background: 'white', color: '#475569', border: '1px solid #e2e8f0' }
                        )
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="lp-page-btn"
                    style={{ 
                      padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                      background: 'white', cursor: currentPage === totalPages ? 'default' : 'pointer',
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== EXPORT CALL-TO-ACTION ===== */}
          <div className="lp-animate-fade-up lp-delay-4" style={{ 
            background: '#0f172a', color: 'white', borderRadius: '24px', 
            padding: '36px 32px', 
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.3)', 
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', 
            gap: '24px', position: 'relative', overflow: 'hidden', 
            marginBottom: '16px', border: '1px solid rgba(51, 65, 85, 0.6)' 
          }}>
            {/* Mesh gradient background */}
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '250px', height: '250px', background: '#2563eb', borderRadius: '50%', opacity: 0.15, filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '40px', bottom: '-40px', width: '200px', height: '200px', background: '#059669', borderRadius: '50%', opacity: 0.08, filter: 'blur(60px)', pointerEvents: 'none' }} />
            
            <div style={{ zIndex: 1, flex: 1, minWidth: '280px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#60a5fa', background: 'rgba(30, 64, 175, 0.3)', padding: '5px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid rgba(37, 99, 235, 0.2)', display: 'inline-block', marginBottom: '14px' }}>
                Dokumen Resmi A4
              </span>
              <h3 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', lineHeight: 1.3, margin: '0 0 10px 0' }}>
                Unduh Laporan Penggunaan Resmi
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, maxWidth: '560px', lineHeight: 1.7, margin: 0 }}>
                Ekspor berkas rekapitulasi formal peminjaman ruangan berstandar akademik tinggi, lengkap dengan visualisasi intensitas ruang, kontribusi program studi teraktif, persetujuan administrasi resmi, dan lembar pengesahan tanda tangan.
              </p>
            </div>

            <button
              onClick={handleExportPDF}
              className="lp-export-cta"
              style={{ 
                zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px', 
                background: 'linear-gradient(135deg, #1d4ed8, #3730a3)', 
                color: 'white', fontWeight: 800, fontSize: '14px',
                padding: '14px 28px', borderRadius: '14px', 
                boxShadow: '0 6px 20px -4px rgba(29, 78, 216, 0.3)', 
                border: '1px solid rgba(37, 99, 235, 0.2)', 
                cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              <Download size={17} /> Ekspor Laporan (PDF) <ArrowUpRight size={15} style={{ opacity: 0.8 }} />
            </button>
          </div>

          {/* HIDDEN PRINT-READY PDF CONTAINER */}
          <div style={{ display: 'none' }}>
            <ExportLaporanPDF 
              ref={pdfRef} 
              data={data} 
              period={period}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LaporanPage;
