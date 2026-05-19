import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPicker = ({ selectedDate, onDateSelect, bookedDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthName = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const isBooked = (day) => {
    const dateStr = formatDate(day);
    return bookedDates.includes(dateStr);
  };

  const formatDate = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isSelected = (day) => selectedDate === formatDate(day);
  const isPast = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d < today;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const past = isPast(day);
          const selected = isSelected(day);
          const booked = isBooked(day);

          return (
            <button
              key={day}
              onClick={() => !past && onDateSelect(formatDate(day))}
              disabled={past}
              className={`
                w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                ${selected ? 'bg-[#1e3a8a] text-white font-bold shadow-md' : ''}
                ${past ? 'text-gray-300 cursor-not-allowed' : ''}
                ${!selected && !past ? 'hover:bg-blue-50 text-gray-700' : ''}
                ${booked && !selected ? 'bg-yellow-50 text-yellow-700 font-medium' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#1e3a8a]" /> Dipilih
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" /> Ada booking
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
