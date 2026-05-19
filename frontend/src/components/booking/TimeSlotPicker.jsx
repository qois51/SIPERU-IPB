import React from 'react';
import { Clock } from 'lucide-react';

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00',
];

/**
 * Check if a slot overlaps with any booked slot.
 */
const isSlotBooked = (slot, bookedSlots) => {
  return bookedSlots.some(
    (b) => slot >= b.start_time && slot < b.end_time
  );
};

const TimeSlotPicker = ({
  selectedStart,
  selectedEnd,
  onStartSelect,
  onEndSelect,
  bookedSlots = [],
}) => {
  const handleSlotClick = (slot) => {
    if (isSlotBooked(slot, bookedSlots)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start fresh selection
      onStartSelect(slot);
      onEndSelect('');
    } else {
      // Set end time (must be after start)
      if (slot > selectedStart) {
        // Check no booked slot in between
        const hasConflict = bookedSlots.some(
          (b) => b.start_time < slot && b.end_time > selectedStart
        );
        if (hasConflict) {
          onStartSelect(slot);
          onEndSelect('');
        } else {
          onEndSelect(slot);
        }
      } else {
        onStartSelect(slot);
        onEndSelect('');
      }
    }
  };

  const isInRange = (slot) => {
    if (!selectedStart || !selectedEnd) return false;
    return slot >= selectedStart && slot < selectedEnd;
  };

  const isStart = (slot) => slot === selectedStart;
  const isEnd = (slot) => slot === selectedEnd;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#1e3a8a]" />
        <h3 className="font-bold text-gray-800">Pilih Waktu</h3>
      </div>

      {selectedStart && (
        <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg text-sm text-[#1e3a8a] font-medium">
          {selectedStart}{selectedEnd ? ` - ${selectedEnd}` : ' — Pilih jam selesai'}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {TIME_SLOTS.map((slot) => {
          const booked = isSlotBooked(slot, bookedSlots);
          const inRange = isInRange(slot);
          const start = isStart(slot);
          const end = isEnd(slot);

          return (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              disabled={booked}
              className={`
                py-2 text-xs font-medium rounded-lg transition-all
                ${booked
                  ? 'bg-red-50 text-red-400 cursor-not-allowed line-through'
                  : ''}
                ${start
                  ? 'bg-[#1e3a8a] text-white font-bold shadow-md'
                  : ''}
                ${end
                  ? 'bg-[#1e3a8a] text-white font-bold shadow-md'
                  : ''}
                ${inRange && !start && !end
                  ? 'bg-blue-100 text-[#1e3a8a]'
                  : ''}
                ${!booked && !inRange && !start && !end
                  ? 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-[#1e3a8a]'
                  : ''}
              `}
            >
              {slot.replace(':', '.')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-50 border" /> Tersedia
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#1e3a8a]" /> Dipilih
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Terpakai
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;
