import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      q: "Berapa lama proses persetujuan peminjaman?",
      a: "Proses verifikasi dan persetujuan biasanya memakan waktu maksimal 1x24 jam hari kerja setelah seluruh dokumen persyaratan diajukan dengan lengkap."
    },
    {
      q: "Dokumen apa saja yang perlu diunggah?",
      a: "Anda perlu mengunggah surat permohonan peminjaman resmi yang telah ditandatangani oleh penanggung jawab kegiatan atau pimpinan organisasi/fakultas."
    },
    {
      q: "Bagaimana jika E-Pass tidak bisa ditampilkan saat di lokasi?",
      a: "Anda dapat menyebutkan kode peminjaman (Booking ID) atau menunjukkan kartu identitas terdaftar kepada petugas penanggung jawab ruangan di lokasi."
    },
    {
      q: "Apakah bisa meminjam ruangan lintas departemen/fakultas?",
      a: "Bisa, selama ruangan tersebut berstatus fasilitas umum universitas atau telah mendapatkan persetujuan/izin khusus dari pihak fakultas terkait."
    },
    {
      q: "Apakah ada biaya peminjaman ruangan?",
      a: "Peminjaman ruangan untuk kegiatan resmi akademik dan kemahasiswaan IPB University tidak dipungut biaya (gratis)."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '1400px', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '60px' }}>
        
        {/* Left Column: Info & Contacts */}
        <div className="faq-info">
          <div style={{ display: 'inline-block', background: '#e2e8f0', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 800, color: '#1e3a8a', marginBottom: '20px' }}>
            FAQ
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', lineHeight: '1.2', color: '#000' }}>
            Pertanyaan yang Sering Ditanyakan
          </h2>
          
          {/* Colored Accent Bars */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
            <div style={{ width: '24px', height: '4px', backgroundColor: '#fbbf24', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '4px', backgroundColor: '#1e3a8a', borderRadius: '2px' }}></div>
            <div style={{ width: '24px', height: '4px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
          </div>

          {/* Contacts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <MapPin size={20} color="#1e3a8a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: '1.4' }}>
                Gedung Direktorat Sarana & Prasarana,<br />Lantai 3, Kampus Darmaga
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Mail size={20} color="#1e3a8a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: '1.4' }}>
                sipinjam@kampus.ac.id
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Phone size={20} color="#1e3a8a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: '1.4' }}>
                (+62) 856-5530-7802
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Clock size={20} color="#1e3a8a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#000', lineHeight: '1.4' }}>
                08.00 - 16.00 WIB<br />Senin - Jumat
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Accordion Questions */}
        <div className="faq-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((item, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx} 
                style={{ 
                  border: '1px solid #1e3a8a', 
                  borderRadius: '6px', 
                  background: 'white',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                <div 
                  onClick={() => toggleAccordion(idx)}
                  style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    background: isOpen ? '#f8fafc' : 'white'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#000' }}>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp size={20} color="#1e3a8a" style={{ flexShrink: 0, strokeWidth: 2.5 }} />
                  ) : (
                    <ChevronDown size={20} color="#1e3a8a" style={{ flexShrink: 0, strokeWidth: 2.5 }} />
                  )}
                </div>
                
                {isOpen && (
                  <div style={{ padding: '0 20px 16px', borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '12px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQ;
