/*---- Punya Agoy ----*/

import React, { useState } from 'react';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    ruangan: '',
    tanggal: '',
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Form */}
        <div className="bg-blue-900 p-6">
          <h2 className="text-white text-xl font-bold">Form Peminjaman Ruangan</h2>
          <p className="text-blue-100 text-sm">Silakan isi data peminjaman dengan lengkap</p>
        </div>

        {/* Body Form */}
        <form className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
              <input type="text" className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Yoga..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">NIM</label>
              <input type="text" className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="G64..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Ruangan</label>
            <select className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition">
              <option>-- Pilih Ruangan --</option>
              <option>Auditorium FMIPA</option>
              <option>Ruang Kuliah A1</option>
            </select>
          </div>

          <button type="button" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md transition">
            Ajukan Reservasi
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;