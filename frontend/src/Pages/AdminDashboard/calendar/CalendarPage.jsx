import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  X,
  Filter,
  Users,
  BookOpen,
  FileText,
  ArrowRight,
} from 'lucide-react';
import adminService from '../../../services/adminService';

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const STATUS_CONFIG = {
  Pending:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a', dot: '#f59e0b', label: 'Menunggu' },
  Approved:  { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', dot: '#3b82f6', label: 'Disetujui' },
  Rejected:  { bg: '#fee2e2', color: '#991b1b', border: '#fecaca', dot: '#ef4444', label: 'Ditolak' },
  CheckedIn: { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe', dot: '#8b5cf6', label: 'Check-In' },
  Completed: { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', dot: '#10b981', label: 'Selesai' },
  Expired:   { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8', label: 'Expired' },
  Cancelled: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8', label: 'Dibatalkan' },
};

const EVENT_COLORS = [
  { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af' },
  { bg: '#fce7f3', border: '#f9a8d4', text: '#9d174d' },
  { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
  { bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6' },
  { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  { bg: '#e0e7ff', border: '#a5b4fc', text: '#3730a3' },
  { bg: '#ccfbf1', border: '#5eead4', text: '#134e4a' },
  { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f' },
];

function getRoomColor(roomName, roomColorMap) {
  if (!roomColorMap.current[roomName]) {
    const idx = Object.keys(roomColorMap.current).length % EVENT_COLORS.length;
    roomColorMap.current[roomName] = EVENT_COLORS[idx];
  }
  return roomColorMap.current[roomName];
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = new Date(year, month, 0);
  const daysInPrev = prevMonth.getDate();

  const days = [];

  // Previous month trailing days
  for (let i = startDow - 1; i >= 0; i--) {
    days.push({ day: daysInPrev - i, currentMonth: false, date: new Date(year, month - 1, daysInPrev - i) });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }

  // Next month leading days
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
  }

  return days;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${MONTHS_ID[parseInt(m) - 1]} ${y}`;
}

const CalendarPage = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const roomColorMap = useRef({});

  useEffect(() => {
    fetchEvents();
  }, [currentYear, currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCalendarEvents(currentYear, currentMonth + 1);
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(null);
  };

  const calendarDays = getCalendarDays(currentYear, currentMonth);

  // Get unique rooms for filter
  const uniqueRooms = [...new Set(events.map(e => e.room_name).filter(Boolean))].sort();
  
  // Filter events
  const filteredEvents = events.filter(e => {
    if (filterRoom !== 'all' && e.room_name !== filterRoom) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  // Group events by date
  const eventsByDate = {};
  filteredEvents.forEach(e => {
    if (!e.date) return;
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const dayStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDayEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  // Count total events for the month
  const totalEvents = filteredEvents.length;
  const approvedCount = filteredEvents.filter(e => e.status === 'Approved' || e.status === 'CheckedIn' || e.status === 'Completed').length;
  const pendingCount = filteredEvents.filter(e => e.status === 'Pending').length;

  return (
    <div className="calendar-page-root" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .calendar-page-root {
          padding: 8px 0 32px 0;
          max-width: 100%;
          overflow-x: hidden;
        }

        @keyframes calFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes calFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes calSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes calPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes lpSpin {
          to { transform: rotate(360deg); }
        }
        .cal-animate-fade-up {
          animation: calFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .cal-animate-fade-in {
          animation: calFadeIn 0.3s ease forwards;
        }
        .cal-delay-1 { animation-delay: 80ms; }
        .cal-delay-2 { animation-delay: 160ms; }

        /* Calendar Grid */
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .cal-header-cell {
          padding: 14px 8px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .cal-day-cell {
          min-height: 110px;
          padding: 8px;
          background: white;
          border: 0.5px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          vertical-align: top;
        }
        .cal-day-cell:hover {
          background: #f8fafc;
          z-index: 1;
          box-shadow: inset 0 0 0 2px #dbeafe;
        }
        .cal-day-cell.today {
          background: #eff6ff;
        }
        .cal-day-cell.today:hover {
          background: #dbeafe;
        }
        .cal-day-cell.outside {
          background: #fafbfc;
          opacity: 0.5;
        }
        .cal-day-cell.selected {
          box-shadow: inset 0 0 0 2px #1e3a8a;
          background: #eff6ff;
          z-index: 2;
        }
        .cal-day-number {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }
        .cal-day-cell.today .cal-day-number {
          background: #1e3a8a;
          color: white;
          font-weight: 800;
        }
        .cal-day-cell.outside .cal-day-number {
          color: #cbd5e1;
        }

        /* Event Chip */
        .cal-event-chip {
          padding: 3px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 3px;
          cursor: pointer;
          transition: all 0.15s ease;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border-left: 3px solid;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .cal-event-chip:hover {
          transform: scale(1.03);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* More Indicator */
        .cal-more-indicator {
          font-size: 9px;
          font-weight: 800;
          color: #6366f1;
          padding: 2px 6px;
          cursor: pointer;
          border-radius: 4px;
          text-align: center;
        }
        .cal-more-indicator:hover {
          background: #eef2ff;
        }

        /* Modal Overlay */
        .cal-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: calFadeIn 0.2s ease;
        }
        .cal-modal {
          background: white;
          border-radius: 24px;
          width: 480px;
          max-width: 90vw;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.25);
          animation: calSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Day Panel (right sidebar) */
        .cal-day-panel {
          background: white;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          animation: calSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Stat mini card */
        .cal-stat-mini {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cal-stat-mini:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.06);
        }

        /* Filter button */
        .cal-filter-btn {
          transition: all 0.2s ease;
        }
        .cal-filter-btn:hover {
          background: #f1f5f9;
        }

        /* Scrollbar */
        .cal-modal::-webkit-scrollbar,
        .cal-day-panel-events::-webkit-scrollbar {
          width: 5px;
        }
        .cal-modal::-webkit-scrollbar-track,
        .cal-day-panel-events::-webkit-scrollbar-track {
          background: transparent;
        }
        .cal-modal::-webkit-scrollbar-thumb,
        .cal-day-panel-events::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }

        /* Loading skeleton */
        .cal-skeleton {
          animation: calPulse 1.5s ease-in-out infinite;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          border-radius: 8px;
        }

        /* Nav button */
        .cal-nav-btn {
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 12px;
          padding: 10px;
        }
        .cal-nav-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .cal-nav-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 900px) {
          .cal-layout {
            grid-template-columns: 1fr !important;
          }
          .cal-day-cell {
            min-height: 80px;
          }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="cal-animate-fade-up" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '14px', margin: '0 0 8px 0', lineHeight: 1.2, color: '#1e293b' }}>
              <div style={{ padding: '10px', background: 'linear-gradient(135deg, #1d4ed8, #3730a3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px -4px rgba(29, 78, 216, 0.25)' }}>
                <CalendarIcon size={24} color="white" />
              </div>
              Kalender Peminjaman
            </h2>
            <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.6, maxWidth: '640px', margin: 0, color: '#94a3b8' }}>
              Visualisasi jadwal seluruh peminjaman ruangan dalam format kalender. Klik tanggal untuk melihat detail event.
            </p>
          </div>

          {/* Month Navigation + Quick Stats */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="cal-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={18} color="#475569" />
              </button>

              <div style={{ minWidth: '200px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                  {MONTHS_ID[currentMonth]} {currentYear}
                </h3>
              </div>

              <button className="cal-nav-btn" onClick={nextMonth}>
                <ChevronRight size={18} color="#475569" />
              </button>

              <button
                onClick={goToToday}
                style={{
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  color: '#1e3a8a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.target.style.background = '#eff6ff'; e.target.style.borderColor = '#bfdbfe'; }}
                onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
              >
                Hari Ini
              </button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div className="cal-stat-mini" style={{ background: '#eff6ff', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #dbeafe' }}>
                <CalendarIcon size={14} color="#1e40af" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e40af' }}>{totalEvents} Event</span>
              </div>
              <div className="cal-stat-mini" style={{ background: '#ecfdf5', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #d1fae5' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#065f46' }}>{approvedCount} Disetujui</span>
              </div>
              <div className="cal-stat-mini" style={{ background: '#fffbeb', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #fef3c7' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#92400e' }}>{pendingCount} Menunggu</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
              <Filter size={14} />
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>
            </div>

            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                color: '#475569',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Semua Ruangan</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                color: '#475569',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== CALENDAR + DAY PANEL LAYOUT ===== */}
      <div className="cal-animate-fade-up cal-delay-1 cal-layout" style={{ display: 'grid', gridTemplateColumns: selectedDay ? '1fr 360px' : '1fr', gap: '24px', transition: 'grid-template-columns 0.3s ease' }}>
        {/* Calendar Grid */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 48, height: 48, border: '3px solid transparent', borderTop: '3px solid #1e3a8a', borderRadius: '50%', animation: 'lpSpin 0.8s linear infinite' }} />
              </div>
              <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Memuat kalender...</span>
            </div>
          ) : (
            <div className="cal-grid">
              {/* Day Headers */}
              {DAYS_ID.map(day => (
                <div key={day} className="cal-header-cell">{day}</div>
              ))}

              {/* Day Cells */}
              {calendarDays.map((dayObj, idx) => {
                const dateKey = dayStr(dayObj.date);
                const dayEvents = eventsByDate[dateKey] || [];
                const isTodayCell = isToday(dayObj.date);
                const isSelected = selectedDay === dateKey;
                const maxVisible = 3;

                return (
                  <div
                    key={idx}
                    className={`cal-day-cell ${!dayObj.currentMonth ? 'outside' : ''} ${isTodayCell ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (dayObj.currentMonth) {
                        setSelectedDay(isSelected ? null : dateKey);
                      }
                    }}
                  >
                    <div className="cal-day-number">{dayObj.day}</div>

                    {dayEvents.slice(0, maxVisible).map((event, eIdx) => {
                      const roomColor = getRoomColor(event.room_name, roomColorMap);
                      return (
                        <div
                          key={event.id || eIdx}
                          className="cal-event-chip"
                          style={{
                            background: roomColor.bg,
                            color: roomColor.text,
                            borderLeftColor: roomColor.border,
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          title={`${event.activity_name} — ${event.room_name} (${event.start_time}-${event.end_time})`}
                        >
                          <span style={{ fontSize: '9px', fontWeight: 800, opacity: 0.7 }}>{event.start_time}</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.activity_name}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > maxVisible && (
                      <div
                        className="cal-more-indicator"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(dateKey);
                        }}
                      >
                        +{dayEvents.length - maxVisible} lainnya
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Room Color Legend */}
          {!loading && Object.keys(roomColorMap.current).length > 0 && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '4px' }}>Legenda Ruangan:</span>
              {Object.entries(roomColorMap.current).map(([room, color]) => (
                <div key={room} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '3px', background: color.border, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>{room}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Day Detail Panel */}
        {selectedDay && (
          <div className="cal-day-panel">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>Detail Tanggal</p>
                <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', margin: 0 }}>{formatDate(selectedDay)}</h4>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.target.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.target.style.background = '#f1f5f9'; }}
              >
                <X size={16} color="#64748b" />
              </button>
            </div>

            <div className="cal-day-panel-events" style={{ padding: '16px', maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
              {selectedDayEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <CalendarIcon size={32} color="#e2e8f0" style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', margin: 0 }}>Tidak ada peminjaman pada tanggal ini</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedDayEvents.map((event, idx) => {
                    const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.Pending;
                    const roomColor = getRoomColor(event.room_name, roomColorMap);
                    return (
                      <div
                        key={event.id || idx}
                        style={{
                          background: '#fafbfc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: `4px solid ${roomColor.border}`,
                        }}
                        onClick={() => setSelectedEvent(event)}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fafbfc'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h5 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0, lineHeight: 1.3 }}>{event.activity_name}</h5>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: statusCfg.bg,
                            color: statusCfg.color,
                            border: `1px solid ${statusCfg.border}`,
                            flexShrink: 0,
                            marginLeft: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}>
                            {statusCfg.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                            <Clock size={11} />
                            <span>{event.start_time} — {event.end_time}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                            <MapPin size={11} />
                            <span>{event.room_name}</span>
                          </div>
                          {event.nama_peminjam && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                              <User size={11} />
                              <span>{event.nama_peminjam}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Detail <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== EVENT DETAIL MODAL ===== */}
      {selectedEvent && (
        <div className="cal-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div style={{ flex: 1, paddingRight: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {(() => {
                    const statusCfg = STATUS_CONFIG[selectedEvent.status] || STATUS_CONFIG.Pending;
                    return (
                      <span style={{
                        fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                        background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>
                        {statusCfg.label}
                      </span>
                    );
                  })()}
                  {selectedEvent.booking_code && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {selectedEvent.booking_code}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', margin: 0, lineHeight: 1.3 }}>
                  {selectedEvent.activity_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '12px', padding: '10px', cursor: 'pointer', display: 'flex', flexShrink: 0, transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px' }}>
              {/* Schedule Card */}
              <div style={{ background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #dbeafe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ padding: '8px', background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <CalendarIcon size={16} color="#1e40af" />
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px 0' }}>Jadwal Peminjaman</p>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                      {formatDate(selectedEvent.date)}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="#3b82f6" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                      {selectedEvent.start_time} — {selectedEvent.end_time}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="#3b82f6" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                      {selectedEvent.room_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Peminjam */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <User size={14} color="#6366f1" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Peminjam</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>{selectedEvent.nama_peminjam || '-'}</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>{selectedEvent.nim_nip || '-'}</p>
                </div>

                {/* Organisasi */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Users size={14} color="#f59e0b" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Organisasi</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>{selectedEvent.organization || 'Individu'}</p>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', margin: 0 }}>{selectedEvent.program_studi || '-'}</p>
                </div>

                {/* Peserta */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Users size={14} color="#10b981" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jumlah Peserta</span>
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#1e293b', margin: 0 }}>{selectedEvent.participants || 1} <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>Orang</span></p>
                </div>

                {/* Jenis Kegiatan */}
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <BookOpen size={14} color="#ec4899" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jenis Kegiatan</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{selectedEvent.jenis_kegiatan || '-'}</p>
                </div>
              </div>

              {/* Purpose / Description */}
              {(selectedEvent.purpose || selectedEvent.deskripsi_kegiatan) && (
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FileText size={14} color="#8b5cf6" />
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keterangan</span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                    {selectedEvent.deskripsi_kegiatan || selectedEvent.purpose || '-'}
                  </p>
                </div>
              )}

              {/* Facilities */}
              {selectedEvent.facilities && selectedEvent.facilities.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '16px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔧 Fasilitas Diminta</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedEvent.facilities.map((f, i) => (
                      <span key={i} style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                        background: '#eff6ff', color: '#1e40af', border: '1px solid #dbeafe',
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
