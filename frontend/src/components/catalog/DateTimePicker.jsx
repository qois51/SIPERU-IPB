import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

// All possible time slots for the day
const ALL_SLOTS = [
  '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00',
  '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const DateTimePicker = ({ roomId, onSelectionChange }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots for selected date
  useEffect(() => {
    if (!selectedDate || !roomId) return;
    const dateStr = formatDate(selectedDate);
    axios.get(`http://localhost:5000/api/bookings/room/${roomId}?date=${dateStr}`)
      .then(res => {
        const slots = [];
        const payload = res.data?.data || res.data;
        if (payload && payload.booked_slots) {
          payload.booked_slots.forEach(b => {
            const startH = parseInt(b.start_time.split(':')[0], 10);
            let endH = parseInt(b.end_time.split(':')[0], 10);
            
            // If end time has minutes (e.g., 10:30), we might want to block the 10:00-11:00 slot as well
            const endM = parseInt(b.end_time.split(':')[1], 10);
            if (endM > 0) endH += 1;

            for (let h = startH; h < endH; h++) {
              const sh = String(h).padStart(2, '0');
              const eh = String(h + 1).padStart(2, '0');
              slots.push(`${sh}:00-${eh}:00`);
            }
          });
        }
        setBookedSlots(slots);
      })
      .catch(() => setBookedSlots([]));
  }, [selectedDate, roomId]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (date) => {
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Build calendar grid
  const buildCalendar = () => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // 0=Sun..6=Sat → convert to Mon-first (0=Mon..6=Sun)
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];
    // Previous month padding
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, currentMonth: false, date: new Date(viewYear, viewMonth - 1, daysInPrev - i) });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, currentMonth: true, date: new Date(viewYear, viewMonth, d) });
    }
    // Next month padding (fill to 6 rows = 42 cells)
    let next = 1;
    while (cells.length < 42) {
      cells.push({ day: next, currentMonth: false, date: new Date(viewYear, viewMonth + 1, next) });
      next++;
    }
    return cells;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelectDate = (cell) => {
    if (!cell.currentMonth) return;
    if (cell.date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return;
    setSelectedDate(cell.date);
    setSelectedSlots([]);
    if (onSelectionChange) onSelectionChange({ date: formatDate(cell.date), slots: [] });
  };

  const toggleSlot = (slot) => {
    if (bookedSlots.includes(slot)) return;
    setSelectedSlots(prev => {
      const next = prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot];
      if (onSelectionChange && selectedDate) {
        onSelectionChange({ date: formatDate(selectedDate), slots: next });
      }
      return next;
    });
  };

  const isToday = (cell) => {
    return cell.date.toDateString() === today.toDateString();
  };

  const isPast = (cell) => {
    return cell.date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSelected = (cell) => {
    return selectedDate && cell.date.toDateString() === selectedDate.toDateString();
  };

  // Compute merged slot display label
  const computeSelectedRange = () => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort();
    return `Jam Dipilih: ${sorted.join(', ')} (${sorted.length} jam)`;
  };

  const cells = buildCalendar();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar */}
      <div>
        <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px' }}>Pilih Tanggal</p>
        <div style={{ border: '1px solid #1e3a8a', borderRadius: '12px', padding: '20px', background: 'white' }}>
          {/* Month header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ChevronLeft size={20} color="#1e3a8a" />
            </button>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e3a8a' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <ChevronRight size={20} color="#1e3a8a" />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {cells.map((cell, idx) => {
              const selected = isSelected(cell);
              const past = isPast(cell);
              const today_ = isToday(cell);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDate(cell)}
                  disabled={!cell.currentMonth || past}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: selected ? '2px solid #1e3a8a' : today_ ? '2px solid #93c5fd' : '1px solid #e2e8f0',
                    background: selected ? '#1e3a8a' : today_ ? '#eff6ff' : 'white',
                    color: selected ? 'white' : !cell.currentMonth || past ? '#d1d5db' : '#000',
                    fontWeight: selected || today_ ? 700 : 400,
                    fontSize: '13px',
                    cursor: !cell.currentMonth || past ? 'default' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#eff6ff', border: '2px solid #93c5fd', borderRadius: '3px', display: 'inline-block' }}></span>
              Tersedia
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#1e3a8a', borderRadius: '3px', display: 'inline-block' }}></span>
              Dipilih
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#d1d5db', borderRadius: '3px', display: 'inline-block' }}></span>
              Tidak tersedia
            </span>
          </div>
        </div>

        {selectedDate && (
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', margin: '12px 0 0' }}>
            Tanggal Terpilih : <span style={{ color: '#2563eb' }}>{formatDisplayDate(selectedDate)}</span>
          </p>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <p style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px' }}>Pilih Jam</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {ALL_SLOTS.map(slot => {
              const booked = bookedSlots.includes(slot);
              const selected = selectedSlots.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  disabled={booked}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: selected ? '2px solid #1e3a8a' : booked ? '1px solid #d1d5db' : '1px solid #93c5fd',
                    background: selected ? '#1e3a8a' : booked ? '#e5e7eb' : '#eff6ff',
                    color: selected ? 'white' : booked ? '#6b7280' : '#1e3a8a',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: booked ? 'default' : 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {slot}
                </button>
              );
            })}
          </div>

          {/* Slot legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '3px', display: 'inline-block' }}></span>
              Tersedia
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#1e3a8a', borderRadius: '3px', display: 'inline-block' }}></span>
              Dipilih
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', background: '#e5e7eb', borderRadius: '3px', display: 'inline-block' }}></span>
              Sudah terpesan
            </span>
          </div>

          {computeSelectedRange() && (
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', margin: '12px 0 0' }}>
              {computeSelectedRange()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
