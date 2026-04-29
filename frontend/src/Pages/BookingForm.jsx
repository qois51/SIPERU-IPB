/*---- Punya Agoy ----*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault(); // Biar gk reload halaman
    navigate('/upload'); // Pindah halaman ke /upload
  };
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
    <div className="min-h-screen flex items-center justify-center p-4 py-12" 
         style={{ 
      
           backgroundImage: 'url("/assets/bg-kampus.jpg")', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      
   
      <div className="w-full max-w-4xl bg-[#263C92]/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 overflow-y-auto max-h-[90vh]">
        
        <form onSubmit={handleSubmit} className="space-y-8 text-white">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2">Detail Ruangan</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Fakultas</label>
              <div className="relative flex items-center">
                <select name="fakultas" onChange={handleChange} className="w-full p-4 pr-12 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-white/30 outline-none appearance-none transition">
                  <option value="">--Pilih--</option>
                  <option value="FMIPA">FMIPA</option>
                  <option value="FEM">FEM</option>
                </select>
                {/* Segitiga Pojok Kanan */}
                <div className="absolute right-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Nama Ruangan</label>
              <div className="relative flex items-center">
                <select name="namaRuangan" onChange={handleChange} className="w-full p-4 pr-12 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-white/30 outline-none appearance-none transition">
                  <option value="">--Pilih--</option>
                  <option value="LSI">LSI</option>
                  <option value="RK U-201">RK U-201</option>
                </select>
                <div className="absolute right-4 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Identitas Peminjam */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/20 pb-2">Identitas Peminjam</h2>
            
            {["Nama", "NIM", "Fakultas", "Departemen"].map((label) => (
              <div key={label} className="space-y-2">
                <label className="block text-sm font-medium text-white/90">{label}</label>
                <input 
                  type="text" 
                  name={label.toLowerCase()} 
                  onChange={handleChange} 
                  className="w-full p-4 rounded-xl border-none bg-white text-gray-800 focus:ring-4 focus:ring-white/30 outline-none transition" 
                />
              </div>
            ))}
          </section>

          <div className="pt-6">
            <button type="submit" className="w-full bg-[#009B4D] text-[#FFFFFF] font-extrabold py-4 px-6 rounded-xl hover:bg-[#008542] transition duration-300 shadow-xl text-lg">
              Ajukan Peminjaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;