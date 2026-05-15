import React from 'react';
import { Globe, Phone, Mail, MapPin, Download, ChevronRight, Shield, Monitor, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <footer style={{ background: '#263C92', color: 'white' }}>
      <div className="footer-grid" style={{ padding: '60px 80px' }}>
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
            <NavItem text="Alur Peminjaman" href="/#faq" />
            <NavItem text="Syarat & Ketentuan" href="/#faq" />
            <NavItem text="FAQ" href="/#faq" />
          </ul>
        </div>

        {/* Akun */}
        <div>
          <h4 style={{ marginBottom: '24px', fontSize: '18px' }}>Akun</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <NavItem text="Login" to="/login" />
            <NavItem text="E-Pass Saya" to="/login" />
            <NavItem text="Dashboard" to="/admin" />
            <NavItem text="Riwayat Peminjaman" to="/login" />
            <NavItem text="Status Pengajuan" to="/login" />
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
            <a href="mailto:sipinjam@kampus.ac.id" style={{ color: 'white', textDecoration: 'none' }}>sipinjam@kampus.ac.id</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '24px' }}>
            <Globe size={20} color="#fbbf24" />
            <span>08.00 - 16.00 WIB Senin - Jumat</span>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid white', padding: '12px 20px', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            <Download size={20} /> Unduh Buku Panduan
          </button>
        </div>
      </div>
      <img src="/footerAsset/footer.png" alt="Pattern" style={{ width: '100%', height: 'auto', display: 'block' }} />
    </footer>
  );
};

export default Footer;
