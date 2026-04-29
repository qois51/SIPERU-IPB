/*---- Punya Agoy ----*/

import React from 'react';

const ReviewEpass = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" 
         style={{ 
           backgroundImage: 'url("/assets/bg-kampus.jpg")', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundRepeat: 'no-repeat'
         }}>
      
      <div className="w-full max-w-4xl bg-[#263C92]/70 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 text-white font-sans">
        
        <h2 className="text-3xl font-bold mb-8 border-b border-white/20 pb-2 italic">Upload Surat</h2>
        
        <div className="space-y-8">
         
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nama Ruangan</label>
            <div className="w-full p-4 rounded-xl bg-white text-gray-800 font-bold border-none">
              RKU 2.10
            </div>
          </div>

        
          <div className="space-y-2">
            <label className="block text-sm font-medium">Kode Peminjaman</label>
            <div className="w-full p-4 rounded-xl bg-white text-gray-800 font-bold border-none">
              A-001
            </div>
          </div>

          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Upload Surat (*pdf)</label>
            <div className="w-full p-2 pl-4 rounded-xl bg-white flex items-center justify-between shadow-inner">
              <div className="flex items-center space-x-3 text-blue-900 font-bold">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="underline cursor-pointer">.....</span>
              </div>
              
           
              <button className="bg-[#1a237e] text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm hover:bg-black transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12 a2 2 0 002-2v-1M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="pt-8 flex justify-center">
            <button className="bg-[#FF0000] text-white font-bold py-3 px-16 rounded-xl hover:bg-red-700 transition duration-300 shadow-xl text-lg uppercase tracking-wider">
              Lihat E-pass
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewEpass;