import React, { useRef, useState } from 'react';
import { Globe, Phone, Mail, MapPin, Download, ChevronRight, Shield, Monitor, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import BukuPanduanPDF from './pdf/BukuPanduanPDF';

const FooterBadge = ({ icon: Icon, text }) => (
  <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid white', padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
    {Icon && <Icon size={14} />} {text}
  </div>
);

const NavItem = ({ text, to, href }) => {
  const content = (
    <li style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', textDecoration: 'none', fontSize: '14px' }}>
      <ChevronRight size={16} color="#fbbf24" /> {text}
    </li>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none', color: 'white' }}>{content}</Link>;
  }
  if (href) {
    return <a href={href} style={{ textDecoration: 'none', color: 'white' }}>{content}</a>;
  }
  return content;
};

const SocialBox = ({ imgSrc }) => (
  <div style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
    <img src={imgSrc} alt="Social Icon" style={{ width: '60px', height: 'auto' }} />
  </div>
);

const Footer = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef();

  const handleDownloadPanduan = () => {
    const element = pdfRef.current;
    if (!element || isGenerating) return;

    setIsGenerating(true);
    element.style.display = 'block';

    const opt = {
      margin: [0, 0, 0, 0], // Margin is handled by the component's internal padding
      filename: 'Buku_Panduan_SIPERU_IPB.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(150);
        pdf.text('Halaman ' + i + ' dari ' + totalPages, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
    }).save().then(() => {
      element.style.display = 'none';
      setIsGenerating(false);
    });
  };

  return (
    <footer style={{ background: '#263C92', color: 'white' }}>
      <div className="footer-grid" style={{ padding: '60px 24px' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <img src="/loginAsset/logologin.png" alt="Logo SIPBeru" style={{ width: '60px', height: 'auto' }} />
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: '1.0' }}>
                S<span style={{ color: '#fbbf24' }}>IPB</span>eru
              </h2>
              <p style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>Sistem Peminjaman Ruangan</p>
            </div>
          </div>
          <p style={{ opacity: 0.9, fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
            Platform digital resmi untuk peminjaman ruangan dan fasilitas kampus.
            Mengubah birokrasi berhari-hari menjadi kepastian dalam satu klik.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <SocialBox imgSrc="/footerAsset/socialAsset/instagram.png" />
            <SocialBox imgSrc="/footerAsset/socialAsset/linkedn.png" />
            <SocialBox imgSrc="/footerAsset/socialAsset/facebook.png" />
            <SocialBox imgSrc="/footerAsset/socialAsset/x.png" />
            <SocialBox imgSrc="/footerAsset/socialAsset/youtube.png" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <FooterBadge icon={Shield} text="Zona Integritas" />
            <FooterBadge icon={Monitor} text="Smart Campus" />
            <FooterBadge icon={Trophy} text="Top 399 QS" />
            <FooterBadge icon={Trophy} text="Top 10 In Asia Foresty" />
          </div>
        </div>

        {/* Navigasi */}
        <div>
          <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Navigasi</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <NavItem text="Beranda" to="/" />
            <NavItem text="Katalog Ruangan" to="/katalog" />
            <NavItem text="Alur Peminjaman" to="/#steps" />
            <NavItem text="Syarat & Ketentuan" to="/#rules" />
            <NavItem text="FAQ" to="/#faq" />
          </ul>
        </div>

        {/* Akun */}
        <div>
          <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Akun</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <NavItem text="Login" to="/login" />
            <NavItem text="E-Pass Saya" to="/dashboard" />
            <NavItem text="Dashboard" to="/admin" />
            <NavItem text="Riwayat Peminjaman" to="/dashboard" />
            <NavItem text="Status Pengajuan" to="/dashboard" />
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Kontak & Informasi</h4>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
            <MapPin size={20} color="#fbbf24" />
            <span>Gedung Direktorat Sarana & Prasarana, Lantai 3, Kampus Darmaga</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
            <Phone size={20} color="#fbbf24" />
            <a href="tel:+6285655307802" style={{ color: 'white', textDecoration: 'none' }}>(+62) 856-5530-7802</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
            <Mail size={20} color="#fbbf24" />
            <a href="mailto:sipinjam@kampus.ac.id" style={{ color: 'white', textDecoration: 'none' }}>sipberu@kampus.ac.id</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '24px' }}>
            <Globe size={20} color="#fbbf24" />
            <span>08.00 - 16.00 WIB Senin - Jumat</span>
          </div>
          <button
            onClick={handleDownloadPanduan}
            disabled={isGenerating}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid white', padding: '12px 20px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: isGenerating ? 'wait' : 'pointer', fontSize: '14px', fontWeight: 600, opacity: isGenerating ? 0.7 : 1 }}
          >
            <Download size={20} /> {isGenerating ? 'Membuat PDF...' : 'Unduh Buku Panduan'}
          </button>
        </div>
      </div>
      <img src="/footerAsset/footer.png" alt="Pattern" style={{ width: '100%', height: 'auto', display: 'block' }} />

      {/* Hidden PDF Content */}
      <div style={{ display: 'none' }}>
        <BukuPanduanPDF ref={pdfRef} />
      </div>
    </footer>
  );
};

export default Footer;
