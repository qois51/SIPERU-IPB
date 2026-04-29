/*---- Punya Agoy ----*/

import React, { useState } from 'react';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    fakultas: '',
    namaRuangan: '',
    nama: '',
    nim: '',
    fakultasPeminjam: '',
    departemen: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    /* Latar belakang utama menggunakan overlay biru transparan agar mirip desain */
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 py-12" 
         style={{ 
           backgroundImage: 'linear-gradient(rgba(38, 60, 146, 0.8), rgba(38, 60, 146, 0.8)), url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      
      {/* Kotak Form Utama */}
      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30 overflow-y-auto max-h-[90vh]">
        
        <form className="space-y-8 text-white">
          
          {/* Section 1: Detail Ruangan */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Detail Ruangan</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Fakultas</label>
              <select name="fakultas" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/60/60995.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-reverse">
                <option value="">--Pilih--</option>
                <option value="FMIPA">FMIPA</option>
                <option value="FEM">FEM</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Nama Ruangan</label>
              <select name="namaRuangan" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none appearance-none bg-[url('https://cdn-icons-png.flaticon.com/512/60/60995.png')] bg-[length:12px] bg-[right_1.5rem_center] bg-no-reverse">
                <option value="">--Pilih--</option>
                <option value="LSI">LSI</option>
                <option value="RK U-201">RK U-201</option>
              </select>
            </div>
          </section>

          {/* Section 2: Identitas Peminjam */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Identitas Peminjam</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nama</label>
              <input type="text" name="nama" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">NIM</label>
              <input type="text" name="nim" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Fakultas</label>
              <input type="text" name="fakultasPeminjam" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Departemen</label>
              <input type="text" name="departemen" onChange={handleChange} className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-[#263C92]/50 outline-none" />
            </div>
          </section>

        </form>
      </div>
    </div>
  );
};

export default BookingForm;