/*---- Punya Agoy ----*/

import React from 'react';
import { useNavigate } from 'react-router-dom';

const UploadSurat = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" 
         style={{ 
           backgroundImage: 'url("/assets/bg-kampus.jpg")', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
  
      
      <div className="w-full max-w-4xl bg-[#263C92]/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        
        <form onSubmit={(e) => { e.preventDefault(); navigate('/review'); }} className="space-y-8 text-white">
          <h2 className="text-3xl font-bold mb-8 border-b border-white/20 pb-2">Upload Surat</h2>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nama Ruangan</label>
            <div className="relative flex items-center">
              <select className="w-full p-4 pr-12 rounded-xl border-none bg-white text-gray-800 outline-none appearance-none">
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">Kode Peminjaman</label>
            <div className="relative flex items-center">
              <select className="w-full p-4 pr-12 rounded-xl border-none bg-white text-gray-800 outline-none appearance-none">
                <option value="">--Pilih--</option>
                <option value="A-001">KOD-001</option>
                <option value="B-002">KOD-002</option>
              </select>
              <div className="absolute right-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Upload Surat (*pdf)</label>
            <input 
              type="file" 
              className="w-full p-2 rounded-full bg-white text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#263C92] file:text-white hover:file:bg-blue-800 file:cursor-pointer transition"
            />
          </div>

          <div className="pt-6 flex justify-end">
            <button type="submit" className="bg-[#009B4D] text-[#FFFFFF] font-extrabold py-3 px-12 rounded-xl hover:bg-[#008542] transition duration-300 shadow-xl text-lg">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadSurat;