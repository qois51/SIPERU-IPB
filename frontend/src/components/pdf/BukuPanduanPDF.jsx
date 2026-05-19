import React, { forwardRef } from 'react';

/* ─── STYLE TOKENS ──────────────────────────────────────────────── */
const IPB = {
  navy: '#0d2260',
  navyMd: '#1e3a8a',
  gold: '#f59e0b',
  goldLt: '#fef3c7',
  white: '#ffffff',
  slate: '#334155',
  slateL: '#64748b',
  bg: '#f8fafc',
  border: '#cbd5e1',
  borderL: '#e2e8f0',
};

const S = {
  /* page */
  page: {
    fontFamily: "'Times New Roman', Times, serif",
    background: '#ffffff',
    width: '210mm',
    boxSizing: 'border-box',
    color: '#1e293b',
  },

  /* cover */
  cover: {
    height: '297mm',
    background: `linear-gradient(160deg, ${IPB.navy} 0%, #1a2f6e 55%, #1e3a8a 100%)`,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 60px',
    boxSizing: 'border-box',
    position: 'relative',
    pageBreakAfter: 'always',
  },

  /* content wrapper */
  content: {
    padding: '30mm 25mm 25mm 30mm',
    boxSizing: 'border-box',
  },

  /* running header */
  hdr: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1.5px solid ${IPB.navyMd}`,
    paddingBottom: '7px',
    marginBottom: '20px',
  },

  /* typography */
  secTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: IPB.navy,
    marginTop: '28px',
    marginBottom: '10px',
    borderBottom: `2px solid ${IPB.navy}`,
    paddingBottom: '5px',
    pageBreakAfter: 'avoid',
  },
  sub: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: IPB.navyMd,
    marginTop: '14px',
    marginBottom: '7px',
    paddingLeft: '10px',
    borderLeft: `4px solid ${IPB.gold}`,
    pageBreakAfter: 'avoid',
  },
  sub2: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: IPB.slate,
    marginTop: '10px',
    marginBottom: '5px',
    pageBreakAfter: 'avoid',
  },

  /* body text */
  txt: {
    fontSize: '12px',
    lineHeight: '1.75',
    marginBottom: '10px',
    textAlign: 'justify',
    color: '#1e293b',
    pageBreakInside: 'avoid',
  },
  ul: {
    fontSize: '12px',
    lineHeight: '1.75',
    marginBottom: '10px',
    paddingLeft: '22px',
    color: '#1e293b',
    pageBreakInside: 'avoid',
  },
  ol: {
    fontSize: '12px',
    lineHeight: '1.75',
    marginBottom: '10px',
    paddingLeft: '22px',
    color: '#1e293b',
    pageBreakInside: 'avoid',
  },

  /* callout boxes */
  note: {
    background: '#eff6ff',
    borderLeft: `4px solid ${IPB.navyMd}`,
    padding: '10px 13px',
    borderRadius: '0 4px 4px 0',
    fontSize: '11.5px',
    color: '#1e40af',
    marginBottom: '12px',
    lineHeight: '1.6',
    pageBreakInside: 'avoid',
  },
  warn: {
    background: '#fff7ed',
    borderLeft: '4px solid #ea580c',
    padding: '10px 13px',
    borderRadius: '0 4px 4px 0',
    fontSize: '11.5px',
    color: '#7c2d12',
    marginBottom: '12px',
    lineHeight: '1.6',
    pageBreakInside: 'avoid',
  },
  success: {
    background: '#f0fdf4',
    borderLeft: '4px solid #16a34a',
    padding: '10px 13px',
    borderRadius: '0 4px 4px 0',
    fontSize: '11.5px',
    color: '#166534',
    marginBottom: '12px',
    lineHeight: '1.6',
    pageBreakInside: 'avoid',
  },

  /* image block */
  imgBox: {
    border: `1.5px solid ${IPB.border}`,
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '14px',
    pageBreakInside: 'avoid',
    background: '#f1f5f9',
  },
  imgCap: {
    textAlign: 'center',
    fontSize: '11px',
    color: IPB.slateL,
    padding: '5px 8px',
    background: '#f1f5f9',
    fontStyle: 'italic',
    borderTop: `1px solid ${IPB.borderL}`,
  },

  /* footer */
  pgFooter: {
    borderTop: `1.5px solid ${IPB.navy}`,
    marginTop: '30px',
    paddingTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

/* ─── REUSABLE COMPONENTS ───────────────────────────────────────── */

function PageHeader() {
  return (
    <div style={S.hdr}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/loginAsset/logologin.png" alt="IPB" style={{ width: 'auto', height: '24px', objectFit: 'contain' }} />
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: IPB.navy }}>
          Buku Panduan SIPBeru IPB
        </span>
      </div>
      <span style={{ fontSize: '9px', color: IPB.slateL, letterSpacing: '0.3px' }}>
        Direktorat Sarana &amp; Prasarana · IPB University · 2026
      </span>
    </div>
  );
}

function SectionBreak() {
  return <div className="html2pdf__page-break" />;
}

function Screenshot({ label, src, caption }) {
  return (
    <div style={S.imgBox}>
      <img
        src={src}
        alt={label}
        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
        onError={e => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback jika gambar tidak ada */}
      <div style={{
        display: 'none', alignItems: 'center', justifyContent: 'center',
        height: '120px', background: '#f1f5f9',
        fontSize: '11px', color: IPB.slateL, fontStyle: 'italic',
      }}>
        [ Screenshot: {label} ]
      </div>
      <div style={S.imgCap}>
        Gambar {caption ? caption + ' — ' : ''}Tampilan {label} pada SIPBeru IPB
      </div>
    </div>
  );
}

function TocRow({ label, page }) {
  const isMain = !label.startsWith(' ');
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: isMain ? '5px' : '3px' }}>
      <span style={{
        fontSize: isMain ? '12px' : '11.5px',
        fontWeight: isMain ? 'bold' : 'normal',
        color: isMain ? IPB.navy : IPB.slate,
        paddingLeft: isMain ? 0 : '16px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        {label.trim()}
      </span>
      <span style={{ flex: 1, borderBottom: '1.5px dotted #94a3b8', margin: '0 5px', minWidth: '20px' }} />
      <span style={{
        fontSize: '12px',
        fontWeight: isMain ? 'bold' : 'normal',
        color: IPB.navy,
        minWidth: '20px',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        {page}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{
      border: `1px solid ${IPB.borderL}`,
      borderRadius: '5px',
      padding: '10px',
      background: '#f8fafc',
      pageBreakInside: 'avoid',
    }}>
      <div style={{ fontSize: '18px', marginBottom: '5px', color: IPB.navyMd }}>{icon}</div>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color: IPB.navy, marginBottom: '3px' }}>{title}</div>
      <div style={{ fontSize: '10.5px', color: '#475569', lineHeight: '1.5' }}>{desc}</div>
    </div>
  );
}

function StepItem({ num, title, desc, color = IPB.navy }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '7px', alignItems: 'flex-start' }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', fontWeight: 'bold', flexShrink: 0,
        fontFamily: 'Arial, sans-serif',
      }}>
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#1e293b', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>{desc}</div>
      </div>
    </div>
  );
}

function RoleCard({ role, color, bg, items }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${color}25`,
      borderRadius: '6px', padding: '10px',
      borderTop: `3px solid ${color}`,
      pageBreakInside: 'avoid',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', color, marginBottom: '7px', textAlign: 'center' }}>
        {role}
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          fontSize: '10px', color: '#374151',
          padding: '3px 0', borderBottom: `1px dashed ${IPB.borderL}`,
          lineHeight: '1.4', display: 'flex', alignItems: 'flex-start', gap: '4px',
        }}>
          <span style={{ color, flexShrink: 0, marginTop: '1px' }}>✓</span> {item}
        </div>
      ))}
    </div>
  );
}

function StatusCard({ color, bg, border, label, desc }) {
  return (
    <div style={{ flex: 1, background: bg, border: `1.5px solid ${border}`, borderRadius: '6px', padding: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: border, flexShrink: 0 }} />
        <span style={{ fontSize: '11.5px', fontWeight: 'bold', color }}>{label}</span>
      </div>
      <div style={{ fontSize: '10px', color, lineHeight: '1.5' }}>{desc}</div>
    </div>
  );
}

function TroubleCard({ problem, solution }) {
  return (
    <div style={{
      border: `1px solid ${IPB.borderL}`, borderRadius: '5px',
      padding: '9px 11px', marginBottom: '7px',
      borderLeft: '4px solid #6366f1',
      pageBreakInside: 'avoid',
    }}>
      <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#4338ca', marginBottom: '3px' }}>
        ⚠ {problem}
      </div>
      <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>{solution}</div>
    </div>
  );
}

function FaqItem({ q, a, idx }) {
  return (
    <div style={{
      marginBottom: '7px', padding: '9px 11px',
      background: idx % 2 === 0 ? '#f8fafc' : '#fff',
      border: `1px solid ${IPB.borderL}`, borderRadius: '5px',
      pageBreakInside: 'avoid',
    }}>
      <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: IPB.navy, marginBottom: '3px' }}>Q: {q}</div>
      <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>A: {a}</div>
    </div>
  );
}

/* ─── SIGNATURE BLOCK ───────────────────────────────────────────── */
function SignatureBlock() {
  return (
    <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'center', minWidth: '220px' }}>
        <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#374151' }}>Bogor, Mei 2026</p>
        <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#374151' }}>Hormat kami,</p>
        <div style={{ width: '180px', height: '50px', margin: '8px auto' }}>
          <img
            src="/signature.svg"
            alt="Tanda Tangan"
            style={{ width: '160px', height: '48px', objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <div style={{ borderTop: `1px solid ${IPB.slate}`, width: '180px', margin: '0 auto 4px' }} />
        <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>
          Tim Pengembang SIPBeru IPB
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: IPB.slateL }}>Direktorat Sarana &amp; Prasarana</p>
        <p style={{ margin: 0, fontSize: '11px', color: IPB.slateL }}>IPB University</p>
      </div>
    </div>
  );
}

/* ─── PAGE FOOTER ────────────────────────────────────────────────── */
function DocFooter() {
  return (
    <div style={S.pgFooter}>
      <span style={{ fontSize: '9.5px', color: IPB.slateL }}>Buku Panduan SIPBeru IPB — Edisi 2026</span>
      <span style={{ fontSize: '9.5px', color: '#94a3b8' }}>© 2026 Direktorat Sarana &amp; Prasarana · IPB University</span>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
const BukuPanduanSIPBeru = forwardRef((props, ref) => {
  return (
    <div ref={ref} style={S.page}>

      {/* ════════════ COVER ════════════ */}
      <div style={S.cover}>
        {/* top label */}
        <div style={{
          position: 'absolute', top: '32px', textAlign: 'center', width: '100%',
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '3px', color: '#93c5fd', textTransform: 'uppercase' }}>
            Institut Pertanian Bogor — IPB University
          </div>
        </div>

        {/* logos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', marginBottom: '30px' }}>
          {/* IPB logo */}
          <img
            src="/loginAsset/logologin.png"
            alt="Logo IPB"
            style={{ width: 'auto', height: '90px', maxWidth: '100%', objectFit: 'contain' }}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{
            display: 'none', width: '88px', height: '88px',
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 'bold', color: IPB.gold,
          }}>IPB</div>

          <div style={{ width: '2px', height: '70px', background: 'rgba(255,255,255,0.25)' }} />

          {/* SIPBeru logotype */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
              <span style={{ fontSize: '56px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>S</span>
              <span style={{ fontSize: '56px', fontWeight: '900', color: IPB.gold, letterSpacing: '-1px' }}>IPB</span>
              <span style={{ fontSize: '56px', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px' }}>eru</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#93c5fd', marginTop: '4px', letterSpacing: '0.5px' }}>
              Sistem Peminjaman Ruangan
            </span>
          </div>
        </div>

        {/* gold divider */}
        <div style={{ width: '72px', height: '3px', background: IPB.gold, borderRadius: '2px', marginBottom: '22px' }} />

        {/* title block */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px',
            color: '#fff', letterSpacing: '0.5px',
          }}>
            BUKU PANDUAN PENGGUNAAN SISTEM
          </h1>
          <p style={{ fontSize: '13px', color: '#bfdbfe', margin: 0 }}>
            Sistem Informasi Peminjaman Ruangan Akademik &amp; Fasilitas
          </p>
        </div>

        {/* gold divider */}
        <div style={{ width: '72px', height: '3px', background: IPB.gold, borderRadius: '2px', marginBottom: '28px' }} />

        {/* institution info */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '16px 36px',
        }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold', color: '#e0f2fe' }}>Edisi 2026</p>
          <p style={{ margin: '0 0 3px', fontSize: '11px', color: '#7dd3fc' }}>Direktorat Sarana &amp; Prasarana</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#7dd3fc' }}>Institut Pertanian Bogor (IPB University)</p>
        </div>

        {/* bottom note */}
        <div style={{ position: 'absolute', bottom: '24px', fontSize: '9px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
          Panduan resmi untuk seluruh civitas akademika IPB University
        </div>
      </div>

      {/* ════════════ CONTENT PAGES ════════════ */}
      <div style={S.content}>

        {/* ── KATA PENGANTAR ── */}
        <PageHeader />
        <h2 style={S.secTitle}>Kata Pengantar</h2>

        <p style={S.txt}>
          Perkembangan teknologi informasi dalam dunia pendidikan tinggi telah membawa perubahan mendasar pada
          berbagai aspek layanan administrasi akademik. Transformasi digital bukan lagi sekadar pilihan, melainkan
          telah menjadi kebutuhan yang mendesak untuk mendukung efektivitas, efisiensi, dan transparansi dalam
          pengelolaan layanan kampus. Institut Pertanian Bogor (IPB University), sebagai salah satu perguruan tinggi
          terkemuka di Indonesia, terus berkomitmen untuk menghadirkan inovasi layanan berbasis teknologi demi
          meningkatkan pengalaman sivitas akademika dalam berinteraksi dengan sistem administrasi kampus.
        </p>
        <p style={S.txt}>
          Salah satu layanan yang memiliki peran strategis dalam menunjang kegiatan akademik adalah layanan
          peminjaman ruangan. Dalam praktiknya, proses peminjaman ruangan secara manual kerap menimbulkan berbagai
          kendala operasional, mulai dari potensi benturan jadwal, lambatnya proses verifikasi dan persetujuan,
          kurangnya transparansi status pengajuan, hingga risiko kehilangan dokumen administrasi. Kondisi tersebut
          mendorong perlunya sebuah sistem digital yang mampu mengintegrasikan seluruh proses peminjaman ruangan
          dalam satu platform yang terstruktur, mudah digunakan, dan dapat diakses kapan saja.
        </p>
        <p style={S.txt}>
          SIPBeru IPB (Sistem Informasi Peminjaman Ruangan IPB University) hadir sebagai solusi digital berbasis web
          yang dikembangkan untuk menjawab kebutuhan tersebut. Melalui sistem ini, seluruh proses peminjaman
          ruangan—mulai dari pencarian ruangan, pengisian formulir, pengunggahan dokumen, pemantauan status
          pengajuan, hingga pengambilan E-Pass dan laporan riwayat peminjaman—dapat dilakukan secara daring, cepat,
          dan transparan.
        </p>
        <p style={S.txt}>
          Buku panduan ini disusun sebagai pedoman resmi penggunaan SIPBeru IPB yang diperuntukkan bagi seluruh
          civitas akademika, termasuk mahasiswa, dosen, tenaga kependidikan, dan administrator sistem. Panduan ini
          disajikan secara sistematis dengan bahasa yang lugas dan dilengkapi dengan ilustrasi antarmuka sistem agar
          mudah dipahami oleh semua kalangan pengguna.
        </p>
        <p style={S.txt}>
          Penyusun menyadari bahwa sistem informasi merupakan entitas yang terus berkembang. Oleh karena itu,
          panduan ini akan diperbarui secara berkala sesuai perkembangan sistem. Kritik dan saran yang membangun
          dari para pengguna sangat kami harapkan guna terus meningkatkan kualitas layanan.
        </p>
        <p style={S.txt}>
          Semoga buku panduan ini dapat memberikan manfaat nyata bagi seluruh civitas akademika IPB University dan
          mendukung terwujudnya pengelolaan fasilitas kampus yang lebih modern, tertib, dan terintegrasi.
        </p>
        <SignatureBlock />

        <SectionBreak />
        <PageHeader />

        {/* ── DAFTAR ISI ── */}
        <h2 style={S.secTitle}>Daftar Isi</h2>
        {[
          ['Kata Pengantar', '2'],
          ['Daftar Isi', '2'],
          ['1. Pengenalan SIPBeru IPB', '3'],
          ['   1.1 Gambaran Umum Sistem', '3'],
          ['   1.2 Latar Belakang Pengembangan Sistem', '3'],
          ['   1.3 Fitur Utama SIPBeru IPB', '4'],
          ['2. Tujuan dan Manfaat Sistem', '4'],
          ['   2.1 Tujuan Sistem', '4'],
          ['   2.2 Manfaat bagi Pengguna', '5'],
          ['3. Hak Akses Pengguna', '5'],
          ['4. Persyaratan Penggunaan Sistem', '6'],
          ['5. Panduan Login dan Keamanan Akun', '6'],
          ['   5.1 Membuka Halaman Login', '6'],
          ['   5.2 Langkah-Langkah Login', '7'],
          ['   5.3 Reset Password via OTP', '7'],
          ['6. Dashboard Pengguna', '7'],
          ['   6.1 Statistik Ringkasan', '8'],
          ['   6.2 Tabel Riwayat Pengajuan', '8'],
          ['7. Panduan Peminjaman Ruangan', '8'],
          ['   7.1 Membuka Katalog Ruangan', '8'],
          ['   7.2 Detail dan Kalender Ruangan', '9'],
          ['   7.3 Mengisi Formulir Peminjaman', '9'],
          ['   7.4 Upload Surat Persetujuan', '9'],
          ['   7.5 Konfirmasi dan Submit', '10'],
          ['8. Kalender dan Jadwal Ruangan', '10'],
          ['9. Status Pengajuan Peminjaman', '10'],
          ['10. Riwayat dan Export Laporan PDF', '11'],
          ['11. Panduan Penggunaan E-Pass', '11'],
          ['12. Profil dan Pengaturan Akun', '12'],
          ['13. Panduan Administrator', '12'],
          ['   13.1 Verifikasi Pengajuan', '12'],
          ['   13.2 Manajemen Ruangan', '13'],
          ['   13.3 Manajemen Pengguna', '13'],
          ['14. Aturan Penggunaan Ruangan', '13'],
          ['15. Troubleshooting Sistem', '14'],
          ['16. Frequently Asked Questions (FAQ)', '14'],
          ['17. Kontak dan Bantuan Sistem', '15'],
          ['18. Penutup', '15'],
        ].map(([label, page], i) => (
          <TocRow key={i} label={label} page={page} />
        ))}

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 1 ════ */}
        <h2 style={S.secTitle}>1. Pengenalan SIPBeru IPB</h2>

        <h3 style={S.sub}>1.1 Gambaran Umum Sistem</h3>
        <p style={S.txt}>
          SIPBeru IPB merupakan sistem informasi manajemen peminjaman ruangan berbasis web yang dikembangkan secara
          khusus untuk mendukung proses pengelolaan fasilitas ruangan akademik di lingkungan IPB University. Sistem
          ini dirancang dengan arsitektur modern yang memungkinkan pengelolaan peminjaman dilakukan secara digital,
          terpusat, dan terintegrasi dalam satu platform yang dapat diakses oleh seluruh civitas akademika.
        </p>
        <p style={S.txt}>
          Sebagai platform berbasis web, SIPBeru IPB dapat diakses melalui berbagai perangkat seperti komputer
          desktop, laptop, tablet, maupun smartphone menggunakan browser modern. Sistem ini tidak memerlukan
          instalasi aplikasi khusus, sehingga sangat memudahkan pengguna dalam mengaksesnya kapan saja dan di mana
          saja selama terhubung dengan jaringan internet.
        </p>
        <Screenshot label="Dashboard Pengguna" src="/docsAsset/dashboard.png" caption="1.1" />

        <h3 style={S.sub}>1.2 Latar Belakang Pengembangan Sistem</h3>
        <p style={S.txt}>
          Sebelum hadirnya SIPBeru IPB, proses peminjaman ruangan di lingkungan IPB University dilakukan secara
          manual melalui pengisian formulir fisik, komunikasi langsung dengan pengelola ruangan, hingga pencatatan
          jadwal pada buku log atau papan pengumuman. Metode konvensional ini menghadapi berbagai keterbatasan yang
          semakin dirasakan seiring meningkatnya intensitas kegiatan akademik dan non-akademik yang membutuhkan
          fasilitas ruangan kampus.
        </p>
        <p style={S.txt}>
          Berdasarkan identifikasi masalah yang dilakukan, terdapat beberapa kendala utama yang sering terjadi dalam
          proses peminjaman ruangan secara manual, antara lain:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '4px' }}>
            <strong>Benturan Jadwal.</strong> Tidak adanya sistem pencatatan terpusat menyebabkan sering terjadinya
            pemesanan ruangan yang sama oleh dua pihak berbeda pada waktu yang bersamaan.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Lambatnya Proses Persetujuan.</strong> Proses verifikasi yang melibatkan beberapa pihak secara
            manual membutuhkan waktu yang relatif lama, sehingga menghambat kelancaran perencanaan kegiatan.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Kurangnya Transparansi.</strong> Pemohon tidak dapat memantau perkembangan status pengajuan
            secara real-time, sehingga menimbulkan ketidakpastian dalam perencanaan kegiatan.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Risiko Kehilangan Dokumen.</strong> Dokumen administrasi fisik rentan terhadap kerusakan atau
            kehilangan, yang dapat mengakibatkan sengketa penggunaan ruangan.
          </li>
          <li>
            <strong>Efisiensi Operasional Rendah.</strong> Petugas administrasi harus meluangkan waktu ekstra untuk
            mengelola, memverifikasi, dan mencatat setiap pengajuan secara manual.
          </li>
        </ul>

        <h3 style={S.sub}>1.3 Fitur Utama SIPBeru IPB</h3>
        <p style={S.txt}>
          SIPBeru IPB dirancang dengan berbagai fitur unggulan yang saling terintegrasi untuk memberikan pengalaman
          peminjaman ruangan yang mudah, cepat, dan transparan:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <FeatureCard icon="🔐" title="Autentikasi & Keamanan" desc="Sistem login berbasis email dan password dengan mekanisme OTP untuk reset password yang aman." />
          <FeatureCard icon="🏛️" title="Katalog Ruangan Digital" desc="Daftar lengkap ruangan beserta foto, kapasitas, fasilitas, dan status ketersediaan real-time." />
          <FeatureCard icon="📅" title="Kalender Interaktif" desc="Visualisasi jadwal ruangan dalam tampilan kalender berwarna untuk memudahkan pemilihan waktu." />
          <FeatureCard icon="📝" title="Formulir Peminjaman Online" desc="Formulir digital lengkap dengan panduan pengisian dan validasi data otomatis." />
          <FeatureCard icon="📤" title="Upload Dokumen Digital" desc="Fasilitas unggah surat persetujuan dalam format PDF (maksimal 5 MB) langsung dari sistem." />
          <FeatureCard icon="🔔" title="Notifikasi Real-time" desc="Pemberitahuan otomatis terkait perubahan status pengajuan yang dapat dipantau dari dashboard." />
          <FeatureCard icon="🎫" title="E-Pass Digital" desc="Dokumen bukti persetujuan peminjaman dalam format digital yang memuat QR code verifikasi." />
          <FeatureCard icon="📊" title="Export Laporan PDF" desc="Fitur ekspor riwayat peminjaman ke dalam laporan PDF resmi dengan format akademik." />
          <FeatureCard icon="⚙️" title="Panel Administrator" desc="Dashboard khusus bagi administrator untuk mengelola pengajuan, ruangan, dan data pengguna." />
          <FeatureCard icon="👤" title="Manajemen Profil" desc="Pengelolaan data diri, foto profil, dan keamanan akun pengguna secara mandiri." />
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 2 ════ */}
        <h2 style={S.secTitle}>2. Tujuan dan Manfaat Sistem</h2>

        <h3 style={S.sub}>2.1 Tujuan Sistem</h3>
        <p style={S.txt}>
          SIPBeru IPB dikembangkan dengan tujuan yang terarah dan terukur guna mendukung transformasi digital
          layanan administrasi kampus IPB University. Berikut adalah tujuan utama pengembangan sistem:
        </p>
        <ol style={S.ol}>
          <li style={{ marginBottom: '4px' }}>
            <strong>Digitalisasi Proses Peminjaman.</strong> Menggantikan proses peminjaman ruangan yang bersifat
            manual dan konvensional dengan sistem digital yang lebih efisien, cepat, dan akurat.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Peningkatan Transparansi.</strong> Menyediakan informasi status pengajuan yang dapat dipantau
            secara real-time oleh pemohon, sehingga mengurangi ketidakpastian dan pertanyaan berulang kepada
            petugas.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Optimalisasi Pengelolaan Fasilitas.</strong> Memudahkan administrator dalam mengelola jadwal
            penggunaan ruangan secara terpusat sehingga mengurangi risiko konflik jadwal dan pemborosan fasilitas.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Dokumentasi Digital.</strong> Menyimpan seluruh data pengajuan, dokumen persetujuan, dan
            riwayat peminjaman dalam sistem digital yang aman dan mudah diakses kembali.
          </li>
          <li style={{ marginBottom: '4px' }}>
            <strong>Integrasi Layanan Kampus.</strong> Mendukung ekosistem digital IPB University yang terintegrasi
            dalam satu platform sebagai bagian dari program transformasi digital perguruan tinggi.
          </li>
          <li>
            <strong>Peningkatan Kepuasan Pengguna.</strong> Memberikan pengalaman layanan yang lebih baik kepada
            seluruh civitas akademika melalui antarmuka yang intuitif dan proses yang lebih sederhana.
          </li>
        </ol>

        <h3 style={S.sub}>2.2 Manfaat bagi Pengguna</h3>
        <h4 style={S.sub2}>a. Bagi Mahasiswa dan Organisasi Kemahasiswaan</h4>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}>Dapat mengajukan peminjaman ruangan kapan saja dan di mana saja tanpa perlu datang langsung ke kantor administrasi.</li>
          <li style={{ marginBottom: '3px' }}>Memiliki akses untuk memantau status pengajuan secara real-time langsung dari dashboard pengguna.</li>
          <li style={{ marginBottom: '3px' }}>Mendapatkan E-Pass digital sebagai bukti sah persetujuan peminjaman yang dapat ditunjukkan kepada petugas keamanan.</li>
          <li style={{ marginBottom: '3px' }}>Dapat mengunduh laporan riwayat peminjaman dalam format PDF untuk keperluan pelaporan organisasi.</li>
          <li>Menghemat waktu dan tenaga karena tidak perlu mengantre atau mengisi formulir fisik secara berulang.</li>
        </ul>
        <h4 style={S.sub2}>b. Bagi Dosen dan Tenaga Kependidikan</h4>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}>Memudahkan proses pemesanan ruangan untuk kegiatan perkuliahan, seminar, rapat, maupun praktikum tanpa hambatan birokratis yang berlebihan.</li>
          <li style={{ marginBottom: '3px' }}>Dapat melihat ketersediaan ruangan secara langsung melalui kalender interaktif sebelum mengajukan peminjaman.</li>
          <li style={{ marginBottom: '3px' }}>Meminimalkan risiko terjadinya bentrokan jadwal dengan pihak lain yang juga merencanakan kegiatan di ruangan yang sama.</li>
          <li>Proses pengajuan yang lebih cepat memungkinkan perencanaan kegiatan akademik yang lebih matang dan terorganisir.</li>
        </ul>
        <h4 style={S.sub2}>c. Bagi Administrator Sistem</h4>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}>Memiliki panel kontrol terpusat untuk mengelola seluruh pengajuan peminjaman, termasuk fitur menyetujui, menolak, dan memberikan catatan kepada pemohon.</li>
          <li style={{ marginBottom: '3px' }}>Dapat mengelola data ruangan (menambah, mengubah, menghapus) secara langsung melalui sistem tanpa perlu keahlian teknis khusus.</li>
          <li style={{ marginBottom: '3px' }}>Sistem memungkinkan pemantauan seluruh aktivitas peminjaman dalam satu tampilan dashboard yang komprehensif.</li>
          <li style={{ marginBottom: '3px' }}>Mengurangi beban kerja administratif manual sehingga petugas dapat fokus pada tugas-tugas yang lebih strategis.</li>
          <li>Seluruh data pengajuan tersimpan secara digital dan dapat ditelusuri kembali sewaktu-waktu untuk keperluan audit atau pelaporan.</li>
        </ul>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 3 ════ */}
        <h2 style={S.secTitle}>3. Hak Akses Pengguna</h2>
        <p style={S.txt}>
          SIPBeru IPB menerapkan sistem manajemen hak akses berbasis peran (Role-Based Access Control / RBAC) yang
          membedakan hak akses setiap pengguna berdasarkan peran dan tanggung jawabnya dalam sistem. Penerapan
          sistem ini bertujuan untuk menjaga keamanan data, memastikan keteraturan pengelolaan sistem, serta
          memberikan antarmuka yang sesuai dengan kebutuhan masing-masing jenis pengguna.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <RoleCard
            role="Mahasiswa / Dosen"
            color="#1e40af"
            bg="#eff6ff"
            items={['Melihat katalog ruangan', 'Melihat detail & kalender ruangan', 'Mengajukan peminjaman ruangan', 'Upload surat persetujuan', 'Memantau status pengajuan', 'Mengunduh E-Pass', 'Mengekspor riwayat PDF', 'Mengelola profil akun', 'Melihat notifikasi sistem']}
          />
          <RoleCard
            role="Satpam / Verifikator"
            color="#92400e"
            bg="#fffbeb"
            items={['Memindai QR Code E-Pass', 'Memverifikasi identitas pengguna', 'Melihat detail booking aktif', 'Konfirmasi kehadiran pengguna']}
          />
          <RoleCard
            role="Administrator"
            color="#166534"
            bg="#f0fdf4"
            items={['Semua akses pengguna reguler', 'Menyetujui / menolak pengajuan', 'Menambah catatan penolakan', 'Mengelola data ruangan', 'Menambah / edit / hapus ruangan', 'Mengelola data pengguna', 'Memantau seluruh aktivitas', 'Menghasilkan laporan sistem']}
          />
        </div>
        <div style={S.note}>
          <strong>Informasi:</strong> Peran pengguna ditentukan oleh administrator sistem pada saat pembuatan akun.
          Pengguna tidak dapat mengubah peran akun secara mandiri. Jika terdapat kesalahan peran, silakan hubungi
          administrator sistem.
        </div>

        {/* ════ BAB 4 ════ */}
        <h2 style={S.secTitle}>4. Persyaratan Penggunaan Sistem</h2>

        <h3 style={S.sub}>4.1 Perangkat dan Browser yang Didukung</h3>
        <p style={S.txt}>SIPBeru IPB dapat diakses menggunakan berbagai jenis perangkat dengan ketentuan sebagai berikut:</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginBottom: '10px' }}>
          {[
            ['🖥️', 'Komputer / Laptop', 'Rekomendasi utama. Memberikan pengalaman terbaik dengan tampilan penuh dan akses ke semua fitur sistem.'],
            ['📱', 'Smartphone / Tablet', 'Didukung dengan tampilan responsif. Cocok untuk pemantauan status dan akses fitur dasar.'],
            ['🌐', 'Google Chrome ≥ 90', 'Browser yang paling direkomendasikan untuk performa optimal.'],
            ['🌐', 'Mozilla Firefox ≥ 88', 'Kompatibel penuh dengan semua fitur sistem.'],
            ['🌐', 'Microsoft Edge ≥ 90', 'Mendukung semua fungsi sistem dengan baik.'],
            ['🌐', 'Safari ≥ 14 (iOS/macOS)', 'Didukung dengan performa yang memadai.'],
          ].map(([icon, title, desc], i) => (
            <div key={i} style={{
              border: `1px solid ${IPB.borderL}`,
              borderRadius: '4px', padding: '8px 10px', background: '#f8fafc',
            }}>
              <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: IPB.navy, marginBottom: '3px' }}>
                {icon} {title}
              </div>
              <div style={{ fontSize: '10.5px', color: '#475569', lineHeight: '1.5' }}>{desc}</div>
            </div>
          ))}
        </div>

        <h3 style={S.sub}>4.2 Koneksi Internet</h3>
        <p style={S.txt}>
          Pengguna disarankan untuk menggunakan koneksi internet yang stabil dengan kecepatan minimal 1 Mbps agar
          proses unggah dokumen, pengiriman formulir, dan pemuatan halaman dapat berjalan dengan lancar. Koneksi
          internet yang tidak stabil dapat menyebabkan gagalnya proses unggah dokumen atau pengiriman data formulir.
        </p>

        <h3 style={S.sub}>4.3 Akun Pengguna Terdaftar</h3>
        <p style={S.txt}>
          Untuk dapat menggunakan seluruh fitur SIPBeru IPB, pengguna harus memiliki akun yang telah terdaftar
          dalam sistem. Pendaftaran akun dilakukan oleh administrator sistem. Pengguna yang belum memiliki akun
          tidak dapat melakukan pengajuan peminjaman ruangan. Jika belum memiliki akun, silakan menghubungi
          Direktorat Sarana &amp; Prasarana IPB University.
        </p>

        <h3 style={S.sub}>4.4 Dokumen Pendukung</h3>
        <p style={S.txt}>
          Beberapa jenis pengajuan peminjaman ruangan mengharuskan pengguna untuk melampirkan surat persetujuan
          atau dokumen pendukung lainnya. Dokumen tersebut harus memenuhi persyaratan teknis berikut:
        </p>
        <ul style={S.ul}>
          <li><strong>Format file:</strong> PDF (Portable Document Format)</li>
          <li><strong>Ukuran maksimum:</strong> 5 MB per file</li>
          <li><strong>Isi dokumen:</strong> Surat persetujuan resmi dari pihak yang berwenang (dosen pembimbing, ketua organisasi, atau pejabat terkait)</li>
        </ul>
        <div style={S.warn}>
          <strong>Perhatian:</strong> Dokumen dalam format selain PDF (seperti .docx, .jpg, .png) tidak akan
          diterima oleh sistem. Pastikan dokumen telah dikonversi ke format PDF sebelum diunggah.
        </div>

        {/* ════ BAB 5 ════ */}
        <h2 style={S.secTitle}>5. Panduan Login dan Keamanan Akun</h2>
        <p style={S.txt}>
          Fitur autentikasi merupakan gerbang utama untuk mengakses seluruh layanan SIPBeru IPB. Sistem autentikasi
          dirancang dengan standar keamanan yang memadai untuk memastikan bahwa hanya pengguna yang memiliki akun
          terdaftar dan terverifikasi yang dapat mengakses fitur-fitur sistem.
        </p>

        <h3 style={S.sub}>5.1 Membuka Halaman Login</h3>
        <p style={S.txt}>
          Halaman login adalah halaman pertama yang ditampilkan ketika pengguna membuka alamat website SIPBeru IPB.
          Halaman ini dirancang dengan tampilan yang bersih, profesional, dan responsif agar mudah digunakan di
          berbagai perangkat. Bagian kiri menampilkan informasi umum sistem beserta statistik layanan, sementara
          bagian kanan menampilkan formulir login.
        </p>
        <Screenshot label="Halaman Login Pengguna" src="/docsAsset/login.png" caption="5.1" />

        <h3 style={S.sub}>5.2 Langkah-Langkah Login</h3>
        <p style={S.txt}>Berikut adalah langkah-langkah yang perlu diikuti untuk masuk ke dalam sistem SIPBeru IPB:</p>
        <div style={{ marginBottom: '12px' }}>
          <StepItem num="1" title="Buka Browser" desc="Buka browser (Google Chrome, Firefox, atau Edge) dan ketikkan alamat website SIPBeru IPB pada kolom URL." />
          <StepItem num="2" title="Pilih Jenis Pengguna" desc="Pilih jenis pengguna yang sesuai (Mahasiswa, Dosen, atau Petugas) dari dropdown yang tersedia." />
          <StepItem num="3" title="Masukkan ID / Email" desc="Ketikkan NIM, NIP, ID Petugas, atau alamat email yang telah terdaftar dalam sistem pada kolom yang tersedia." />
          <StepItem num="4" title="Masukkan Password" desc="Ketikkan password akun Anda pada kolom 'Password'. Klik ikon mata untuk menampilkan atau menyembunyikan karakter password." />
          <StepItem num="5" title="Klik Tombol Masuk" desc="Klik tombol 'MASUK →' berwarna biru. Sistem akan memverifikasi kredensial Anda secara otomatis." />
          <StepItem num="6" title="Berhasil Login" desc="Jika kredensial benar, sistem akan mengarahkan Anda ke halaman Dashboard utama secara otomatis." />
        </div>
        <div style={S.note}>
          <strong>Tips:</strong> Pastikan Caps Lock pada keyboard Anda dalam kondisi nonaktif saat memasukkan
          password, karena password bersifat case-sensitive (membedakan huruf besar dan kecil).
        </div>

        <h3 style={S.sub}>5.3 Reset Password via OTP</h3>
        <p style={S.txt}>
          Jika pengguna lupa password akun, SIPBeru IPB menyediakan mekanisme reset password yang aman menggunakan
          kode OTP (One Time Password) yang dikirimkan ke alamat email terdaftar.
        </p>
        <div style={{ marginBottom: '10px' }}>
          <StepItem num="1" title="Klik 'Lupa password?'" desc="Pada halaman login, klik tautan 'Lupa password?' yang terdapat di sebelah kanan bawah kolom password." color="#0369a1" />
          <StepItem num="2" title="Masukkan Email" desc="Masukkan alamat email yang terdaftar pada kolom yang tersedia, lalu klik 'Kirim Kode OTP'." color="#0369a1" />
          <StepItem num="3" title="Cek Email" desc="Buka email Anda dan cari pesan dari SIPBeru IPB yang berisi kode OTP 6 digit. Kode berlaku selama 10 menit." color="#0369a1" />
          <StepItem num="4" title="Masukkan Kode OTP" desc="Ketikkan kode OTP yang diterima pada kolom yang tersedia di halaman reset password." color="#0369a1" />
          <StepItem num="5" title="Buat Password Baru" desc="Masukkan password baru (minimal 8 karakter, kombinasi huruf dan angka), konfirmasi, lalu klik 'Simpan Password Baru'." color="#0369a1" />
          <StepItem num="6" title="Login Kembali" desc="Setelah password berhasil diubah, gunakan password baru untuk masuk ke sistem." color="#0369a1" />
        </div>
        <div style={S.warn}>
          <strong>Perhatian:</strong> Jangan berikan kode OTP kepada siapapun. Tim SIPBeru IPB tidak pernah
          meminta kode OTP melalui telepon atau media sosial.
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 6 ════ */}
        <h2 style={S.secTitle}>6. Dashboard Pengguna</h2>
        <p style={S.txt}>
          Dashboard merupakan halaman utama yang ditampilkan setelah pengguna berhasil login ke dalam sistem
          SIPBeru IPB. Halaman ini dirancang sebagai pusat informasi yang menyajikan ringkasan seluruh aktivitas
          peminjaman ruangan pengguna secara komprehensif dan real-time.
        </p>
        <Screenshot label="Dashboard Peminjaman" src="/docsAsset/dashboard.png" caption="6.0" />

        <h3 style={S.sub}>6.1 Statistik Ringkasan</h3>
        <p style={S.txt}>
          Pada bagian atas dashboard, terdapat deretan kartu statistik yang menampilkan informasi ringkasan
          aktivitas peminjaman berdasarkan status tertentu. Setiap kartu dilengkapi dengan ikon, label, dan angka
          yang menunjukkan jumlah pengajuan pada masing-masing kategori:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}><strong>Total Pengajuan:</strong> Menampilkan jumlah keseluruhan pengajuan peminjaman yang pernah diajukan oleh pengguna.</li>
          <li style={{ marginBottom: '3px' }}><strong>Menunggu Approval:</strong> Jumlah pengajuan yang masih dalam tahap pemeriksaan oleh administrator.</li>
          <li style={{ marginBottom: '3px' }}><strong>Disetujui:</strong> Jumlah pengajuan yang telah disetujui dan pengguna diizinkan menggunakan ruangan.</li>
          <li style={{ marginBottom: '3px' }}><strong>Ditolak:</strong> Jumlah pengajuan yang ditolak beserta alasan penolakan dari administrator.</li>
          <li style={{ marginBottom: '3px' }}><strong>Draft:</strong> Jumlah pengajuan yang masih disimpan sebagai draft dan belum dikirim.</li>
          <li><strong>Selesai:</strong> Jumlah pengajuan yang kegiatannya telah dilaksanakan dan diselesaikan.</li>
        </ul>

        <h3 style={S.sub}>6.2 Tabel Riwayat Pengajuan</h3>
        <p style={S.txt}>
          Di bawah kartu statistik, terdapat tabel riwayat pengajuan yang menampilkan daftar aktivitas peminjaman
          dalam format tabel yang terstruktur, memuat: Kode Booking, Nama Ruangan, Tanggal Pengajuan, Tanggal
          Peminjaman, Jam, Nama Kegiatan, Status, dan tombol Aksi (Lihat, E-Pass, dan Batalkan).
        </p>
        <Screenshot label="Tabel Riwayat Pengajuan" src="/docsAsset/riwayat.png" caption="6.2" />
        <div style={S.note}>
          <strong>Tips:</strong> Gunakan fitur filter "Semua Status" di pojok kanan tabel untuk menyaring tampilan
          riwayat berdasarkan status tertentu. Klik tombol "Ekspor Riwayat" untuk mengunduh laporan PDF.
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 7 ════ */}
        <h2 style={S.secTitle}>7. Panduan Peminjaman Ruangan</h2>
        <p style={S.txt}>
          Fitur peminjaman ruangan merupakan fitur inti dari SIPBeru IPB. Seluruh proses pengajuan peminjaman dapat
          dilakukan secara digital melalui langkah-langkah yang terstruktur dan intuitif. Berikut adalah panduan
          lengkap proses peminjaman ruangan dari awal hingga akhir.
        </p>

        <h3 style={S.sub}>7.1 Membuka Katalog Ruangan</h3>
        <p style={S.txt}>
          Langkah pertama dalam proses peminjaman adalah memilih ruangan yang akan digunakan melalui menu Katalog
          Ruangan. Pengguna dapat mengakses halaman ini melalui menu navigasi di bagian atas dengan mengklik menu
          "Katalog Ruangan".
        </p>
        <Screenshot label="Katalog Ruangan" src="/docsAsset/katalog.png" caption="7.1" />
        <p style={S.txt}>
          Pada halaman katalog, pengguna dapat melihat daftar ruangan dalam tampilan kartu (card) yang memuat
          informasi penting seperti foto ruangan, nama ruangan, lokasi gedung/fakultas, kapasitas, fasilitas yang
          tersedia, serta harga sewa per sesi. Pengguna juga dapat menggunakan fitur filter di sidebar kiri
          (lokasi/gedung, kapasitas, fasilitas, tanggal tersedia) dan fitur pencarian untuk mempersempit hasil
          pencarian.
        </p>

        <h3 style={S.sub}>7.2 Melihat Detail &amp; Kalender Ruangan</h3>
        <p style={S.txt}>
          Setelah menemukan ruangan yang sesuai, klik tombol "Lihat Detail" pada kartu ruangan untuk membuka
          halaman detail. Pada halaman ini, pengguna akan menemukan informasi lengkap mengenai ruangan beserta
          kalender interaktif dengan kode warna:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}><strong style={{ color: '#16a34a' }}>Tersedia:</strong> Slot waktu dapat dipilih untuk pengajuan peminjaman.</li>
          <li style={{ marginBottom: '3px' }}><strong style={{ color: '#d97706' }}>Dipinjam:</strong> Slot waktu sedang dalam proses verifikasi atau telah digunakan.</li>
          <li><strong style={{ color: '#dc2626' }}>Tidak Tersedia:</strong> Slot waktu tidak dapat dipesan karena berbagai alasan teknis.</li>
        </ul>
        <Screenshot label="Detail Ruangan dan Kalender" src="/docsAsset/detail.png" caption="7.2" />

        <h3 style={S.sub}>7.3 Mengisi Formulir Peminjaman</h3>
        <p style={S.txt}>
          Setelah memilih tanggal dan slot waktu, klik "Pilih Slot Tersebut" untuk melanjutkan ke formulir
          reservasi. Formulir ini terdiri dari dua bagian utama: Data Peminjam (Nama Lengkap sesuai KTM, NIM/NIP,
          Program Studi/Unit, Email Aktif, dan Nomor HP Aktif) dan Data Kegiatan (Nama Kegiatan, Jenis Kegiatan,
          Deskripsi Kegiatan, dan Kebutuhan Tambahan).
        </p>
        <Screenshot label="Form Reservasi Ruangan" src="/docsAsset/form.png" caption="7.3" />

        <h3 style={S.sub}>7.4 Upload Surat Persetujuan</h3>
        <p style={S.txt}>
          Untuk beberapa jenis kegiatan tertentu, pengguna diwajibkan mengunggah surat persetujuan sebagai dokumen
          pendukung pengajuan. Surat persetujuan ini biasanya berupa surat resmi yang ditandatangani oleh pihak
          berwenang (dosen pembimbing, ketua departemen, atau pejabat terkait).
        </p>
        <ul style={S.ul}>
          <li><strong>Format file yang diterima:</strong> PDF (Portable Document Format) saja</li>
          <li><strong>Ukuran file maksimum:</strong> 5 MB per file</li>
          <li>Pastikan dokumen dapat dibaca dengan jelas dan tidak terpotong</li>
        </ul>
        <div style={S.warn}>
          <strong>Perhatian:</strong> File dengan format selain PDF (.docx, .jpg, .png) akan ditolak secara
          otomatis oleh sistem. Pastikan Anda mengonversi dokumen ke format PDF terlebih dahulu sebelum mengunggah.
        </div>

        <h3 style={S.sub}>7.5 Konfirmasi dan Submit Pengajuan</h3>
        <p style={S.txt}>
          Setelah seluruh kolom formulir terisi dengan lengkap dan dokumen pendukung telah diunggah, periksa
          kembali seluruh data yang telah dimasukkan. Pastikan tidak ada kesalahan informasi, khususnya pada
          tanggal, waktu, dan nama kegiatan. Jika seluruh data sudah benar, klik tombol <strong>"Ajukan
            Reservasi"</strong> untuk mengirim pengajuan. Sistem akan menampilkan notifikasi konfirmasi bahwa
          pengajuan Anda telah berhasil dikirim.
        </p>
        <div style={S.success}>
          <strong>✓ Pengajuan Berhasil!</strong> Setelah pengajuan terkirim, status pengajuan akan berubah menjadi
          "Menunggu Verifikasi". Anda dapat memantau perkembangan status pengajuan melalui Dashboard atau halaman
          Riwayat.
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 8 ════ */}
        <h2 style={S.secTitle}>8. Kalender dan Jadwal Ruangan</h2>
        <p style={S.txt}>
          SIPBeru IPB menyediakan fitur kalender interaktif yang memungkinkan pengguna untuk melihat jadwal
          penggunaan ruangan secara visual dalam satu tampilan. Kalender ini menampilkan informasi ketersediaan
          ruangan berdasarkan kode warna yang mudah dipahami, sehingga pengguna dapat dengan cepat menentukan
          waktu yang tepat untuk mengajukan peminjaman.
        </p>
        <p style={S.txt}>
          Kalender dapat diakses melalui halaman detail ruangan pada bagian "Pilih Tanggal" dan "Pilih Jam".
          Sistem kalender ini diperbarui secara real-time, sehingga informasi yang ditampilkan selalu akurat
          dan terkini.
        </p>

        <h3 style={S.sub}>Kode Warna Status Kalender</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <StatusCard color="#166534" bg="#dcfce7" border="#16a34a" label="Tersedia" desc="Ruangan dapat dipinjam pada slot waktu ini. Klik untuk memilih dan melanjutkan pengajuan." />
          <StatusCard color="#854d0e" bg="#fef9c3" border="#eab308" label="Dipinjam" desc="Terdapat pengajuan yang sedang menunggu verifikasi atau telah disetujui pada slot ini." />
          <StatusCard color="#991b1b" bg="#fee2e2" border="#ef4444" label="Tidak Tersedia" desc="Ruangan tidak dapat dipesan pada slot waktu ini karena alasan teknis atau administratif." />
        </div>
        <div style={S.note}>
          <strong>Tips:</strong> Arahkan kursor mouse ke slot waktu tertentu pada kalender untuk melihat detail
          informasi kegiatan yang sedang berlangsung atau yang telah dijadwalkan pada slot tersebut.
        </div>

        {/* ════ BAB 9 ════ */}
        <h2 style={S.secTitle}>9. Status Pengajuan Peminjaman</h2>
        <p style={S.txt}>
          Setiap pengajuan peminjaman ruangan yang diajukan melalui SIPBeru IPB akan melewati beberapa tahapan
          status yang mencerminkan proses verifikasi dan persetujuan oleh administrator. Berikut adalah penjelasan
          lengkap mengenai setiap status pengajuan:
        </p>
        <div style={{ marginBottom: '14px' }}>
          {[
            { icon: '🕐', label: 'Menunggu Verifikasi (Pending)', color: '#d97706', bg: '#fffbeb', desc: 'Pengajuan telah berhasil dikirim dan sedang dalam antrian pemeriksaan oleh administrator. Pada tahap ini, administrator akan memeriksa kelengkapan data, ketersediaan ruangan, dan kesesuaian dokumen pendukung.' },
            { icon: '✅', label: 'Disetujui (Approved)', color: '#16a34a', bg: '#f0fdf4', desc: 'Pengajuan telah diperiksa dan disetujui oleh administrator. Pengguna diizinkan untuk menggunakan ruangan sesuai dengan jadwal yang telah diajukan. E-Pass digital akan tersedia untuk diunduh setelah pengajuan disetujui.' },
            { icon: '❌', label: 'Ditolak (Rejected)', color: '#dc2626', bg: '#fef2f2', desc: 'Pengajuan ditolak oleh administrator karena alasan tertentu, seperti jadwal yang bentrok, dokumen pendukung yang tidak lengkap, atau kapasitas ruangan yang tidak sesuai. Alasan penolakan akan dicantumkan oleh administrator.' },
            { icon: '🏁', label: 'Selesai (Completed)', color: '#6366f1', bg: '#eef2ff', desc: 'Status ini menandakan bahwa kegiatan telah dilaksanakan sesuai jadwal dan proses peminjaman telah selesai secara keseluruhan. Status ini diperbarui secara otomatis oleh sistem setelah tanggal kegiatan berakhir.' },
          ].map(({ icon, label, color, bg, desc }, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', marginBottom: '7px',
              background: bg, border: `1px solid ${color}30`,
              borderRadius: '6px', padding: '10px',
              borderLeft: `4px solid ${color}`,
              pageBreakInside: 'avoid',
            }}>
              <div style={{ flexShrink: 0, fontSize: '18px', paddingTop: '1px' }}>{icon}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color, marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 10 ════ */}
        <h2 style={S.secTitle}>10. Riwayat dan Export Laporan PDF</h2>
        <p style={S.txt}>
          Fitur riwayat dan export laporan merupakan salah satu fitur penting dalam SIPBeru IPB yang berfungsi
          sebagai media dokumentasi dan pelaporan aktivitas peminjaman ruangan. Melalui fitur ini, pengguna dapat
          melihat seluruh riwayat pengajuan yang pernah dilakukan beserta statusnya masing-masing.
        </p>
        <p style={S.txt}>
          Pengguna juga dapat mengekspor riwayat peminjaman ke dalam format laporan PDF resmi. Laporan PDF ini
          memuat beberapa informasi penting, di antaranya:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}><strong>Identitas Pengguna:</strong> Nama lengkap, NIM/NIP, email, dan peran pengguna dalam sistem.</li>
          <li style={{ marginBottom: '3px' }}><strong>Tabel Riwayat Peminjaman:</strong> Daftar lengkap seluruh pengajuan beserta kode booking, nama ruangan, tanggal, waktu, dan status.</li>
          <li style={{ marginBottom: '3px' }}><strong>Ringkasan Statistik:</strong> Rekapitulasi jumlah pengajuan berdasarkan status (disetujui, ditolak, menunggu, selesai).</li>
          <li style={{ marginBottom: '3px' }}><strong>Timestamp Sistem:</strong> Waktu dan tanggal pencetakan laporan sebagai bukti validitas dokumen.</li>
          <li><strong>Branding Institusi:</strong> Logo IPB University dan identitas resmi Direktorat Sarana &amp; Prasarana.</li>
        </ul>
        <div style={S.success}>
          <strong>Cara Export:</strong> Buka Dashboard → Klik tombol "Ekspor Riwayat" di bawah tabel riwayat →
          Sistem akan menghasilkan file PDF secara otomatis → File akan terunduh ke perangkat Anda.
        </div>

        {/* ════ BAB 11 ════ */}
        <h2 style={S.secTitle}>11. Panduan Penggunaan E-Pass</h2>
        <p style={S.txt}>
          E-Pass (Electronic Pass) merupakan dokumen digital resmi yang diterbitkan oleh SIPBeru IPB sebagai bukti
          persetujuan peminjaman ruangan. Dokumen ini berfungsi sebagai pengganti surat izin fisik dan dilengkapi
          dengan QR Code yang dapat dipindai untuk verifikasi keaslian.
        </p>
        <p style={S.txt}>
          E-Pass hanya akan tersedia setelah pengajuan peminjaman mendapatkan status "Disetujui" dari administrator.
          Pengguna dapat mengunduh E-Pass melalui halaman detail pengajuan atau melalui tombol "E-Pass" pada tabel
          riwayat di dashboard.
        </p>

        <h3 style={S.sub}>Tampilan dan Informasi pada E-Pass</h3>
        <p style={S.txt}>
          Setiap E-Pass yang diterbitkan memuat informasi penting berikut: kode booking, QR Code verifikasi, nama
          ruangan, lokasi dan lantai gedung, tanggal penggunaan, slot jam, nama peminjam, dan status validitas.
        </p>
        <Screenshot label="E-Pass Digital SIPBeru" src="/docsAsset/epass.png" caption="11.0" />

        <h3 style={S.sub}>Cara Menggunakan E-Pass</h3>
        <ol style={S.ol}>
          <li style={{ marginBottom: '4px' }}>Buka halaman detail pengajuan yang telah berstatus "Disetujui" dari Dashboard.</li>
          <li style={{ marginBottom: '4px' }}>Klik tombol "E-Pass" pada kolom Aksi di tabel riwayat, atau tombol "Unduh E-Pass Digital" pada halaman Detail E-Pass.</li>
          <li style={{ marginBottom: '4px' }}>E-Pass akan ditampilkan dalam format yang dapat dicetak atau disimpan sebagai file digital.</li>
          <li style={{ marginBottom: '4px' }}>Pada hari pelaksanaan kegiatan, tunjukkan E-Pass (cetak atau digital) kepada petugas keamanan.</li>
          <li style={{ marginBottom: '4px' }}>Petugas keamanan akan memindai QR Code untuk memverifikasi keaslian dan validitas E-Pass.</li>
          <li>Setelah verifikasi berhasil, pengguna diizinkan untuk menggunakan ruangan sesuai jadwal yang tertera.</li>
        </ol>
        <div style={S.warn}>
          <strong>Penting:</strong> E-Pass hanya berlaku pada tanggal dan waktu yang tertera pada dokumen.
          Penggunaan ruangan di luar jadwal yang tercantum tidak diperbolehkan dan dapat menyebabkan pencabutan
          hak penggunaan.
        </div>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 12 ════ */}
        <h2 style={S.secTitle}>12. Profil dan Pengaturan Akun</h2>
        <p style={S.txt}>
          Menu Profil memungkinkan pengguna untuk mengelola data pribadi dan pengaturan akun secara mandiri.
          Pengguna dapat mengakses halaman ini melalui ikon avatar pengguna di bagian pojok kanan atas halaman.
        </p>
        <h3 style={S.sub}>Fitur yang Tersedia pada Halaman Profil</h3>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}><strong>Melihat Informasi Akun:</strong> Menampilkan data pengguna seperti nama lengkap, NIM/NIP, email, peran (role), dan tanggal bergabung di sistem.</li>
          <li style={{ marginBottom: '3px' }}><strong>Mengubah Foto Profil:</strong> Pengguna dapat mengunggah atau mengganti foto profil dengan gambar berformat JPG, PNG, atau WEBP.</li>
          <li style={{ marginBottom: '3px' }}><strong>Mengubah Password:</strong> Pengguna dapat memperbarui password akun melalui formulir khusus yang meminta input password lama, password baru, dan konfirmasi password baru.</li>
          <li><strong>Memperbarui Data Profil:</strong> Beberapa data profil seperti nomor telepon dapat diperbarui oleh pengguna (tergantung konfigurasi sistem).</li>
        </ul>
        <div style={S.note}>
          <strong>Catatan:</strong> Data seperti NIM/NIP, nama, dan peran pengguna hanya dapat diubah oleh
          administrator sistem. Jika terdapat kesalahan pada data tersebut, silakan hubungi administrator.
        </div>

        {/* ════ BAB 13 ════ */}
        <h2 style={S.secTitle}>13. Panduan Administrator</h2>
        <p style={S.txt}>
          Administrator memiliki peran sentral dalam pengelolaan SIPBeru IPB. Selain memiliki seluruh akses yang
          dimiliki oleh pengguna reguler, administrator juga memiliki hak akses khusus untuk mengelola pengajuan,
          ruangan, dan data pengguna.
        </p>

        <h3 style={S.sub}>13.1 Verifikasi Pengajuan</h3>
        <p style={S.txt}>
          Administrator bertanggung jawab untuk memeriksa dan memverifikasi setiap pengajuan peminjaman ruangan
          yang masuk. Proses verifikasi meliputi pemeriksaan kelengkapan data formulir, validitas dokumen
          pendukung, serta ketersediaan ruangan pada jadwal yang diminta.
        </p>
        <ol style={S.ol}>
          <li style={{ marginBottom: '3px' }}>Buka menu "Manajemen Pengajuan" pada dashboard administrator.</li>
          <li style={{ marginBottom: '3px' }}>Pilih pengajuan yang berstatus "Menunggu Verifikasi" dari daftar.</li>
          <li style={{ marginBottom: '3px' }}>Periksa seluruh detail pengajuan, termasuk data kegiatan, dokumen persetujuan, dan jadwal yang diminta.</li>
          <li style={{ marginBottom: '3px' }}>Klik tombol <strong>"Setujui"</strong> jika pengajuan memenuhi syarat, atau klik tombol <strong>"Tolak"</strong> jika tidak memenuhi syarat.</li>
          <li style={{ marginBottom: '3px' }}>Jika menolak pengajuan, administrator wajib mengisi kolom alasan penolakan agar pemohon mengetahui penyebabnya.</li>
          <li>Sistem akan secara otomatis mengirimkan notifikasi kepada pemohon mengenai hasil verifikasi.</li>
        </ol>

        <h3 style={S.sub}>13.2 Manajemen Ruangan</h3>
        <p style={S.txt}>
          Administrator dapat mengelola data ruangan yang terdaftar dalam sistem melalui menu "Manajemen Ruangan".
          Fitur ini mencakup:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}><strong>Menambah Ruangan Baru:</strong> Mengisi formulir data ruangan (nama, lokasi, kapasitas, fasilitas, foto, harga) dan menyimpan ke dalam sistem.</li>
          <li style={{ marginBottom: '3px' }}><strong>Mengedit Data Ruangan:</strong> Memperbarui informasi ruangan yang telah ada, seperti perubahan kapasitas, penambahan fasilitas, atau penggantian foto.</li>
          <li style={{ marginBottom: '3px' }}><strong>Menghapus Ruangan:</strong> Menghapus ruangan dari sistem jika ruangan tidak lagi tersedia atau telah direnovasi.</li>
          <li><strong>Mengatur Status Ruangan:</strong> Mengubah status ketersediaan ruangan (aktif/nonaktif) sesuai kondisi operasional.</li>
        </ul>

        <h3 style={S.sub}>13.3 Manajemen Pengguna</h3>
        <p style={S.txt}>
          Administrator dapat mengelola data pengguna sistem melalui menu "Manajemen Pengguna". Fitur ini
          memungkinkan administrator untuk:
        </p>
        <ul style={S.ul}>
          <li style={{ marginBottom: '3px' }}>Melihat daftar seluruh pengguna yang terdaftar dalam sistem beserta peran masing-masing.</li>
          <li style={{ marginBottom: '3px' }}>Melakukan filter berdasarkan peran pengguna (Mahasiswa, Dosen, Satpam, Administrator).</li>
          <li style={{ marginBottom: '3px' }}>Mengubah peran atau status akun pengguna jika diperlukan.</li>
          <li>Menonaktifkan akun pengguna yang sudah tidak aktif atau melanggar ketentuan.</li>
        </ul>

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 14 ════ */}
        <h2 style={S.secTitle}>14. Aturan Penggunaan Ruangan</h2>
        <p style={S.txt}>
          Seluruh pengguna yang telah mendapatkan persetujuan peminjaman ruangan wajib mematuhi aturan dan
          ketentuan penggunaan ruangan yang telah ditetapkan oleh IPB University. Aturan ini dibuat untuk menjaga
          ketertiban, kebersihan, dan kelestarian fasilitas kampus.
        </p>
        <ol style={S.ol}>
          <li style={{ marginBottom: '4px' }}><strong>Menjaga Kebersihan.</strong> Pengguna wajib menjaga kebersihan ruangan selama dan setelah kegiatan berlangsung. Sampah harus dibuang pada tempat yang telah disediakan.</li>
          <li style={{ marginBottom: '4px' }}><strong>Tidak Merusak Fasilitas.</strong> Dilarang merusak, mencoret, atau mengubah kondisi fisik ruangan dan peralatan yang ada di dalamnya.</li>
          <li style={{ marginBottom: '4px' }}><strong>Menggunakan Sesuai Jadwal.</strong> Penggunaan ruangan harus sesuai dengan jadwal yang tertera pada E-Pass. Pengguna harus mengosongkan ruangan sebelum waktu berakhir.</li>
          <li style={{ marginBottom: '4px' }}><strong>Tidak Memindahkan Peralatan.</strong> Dilarang memindahkan meja, kursi, proyektor, atau peralatan lain ke luar ruangan tanpa izin resmi dari pengelola fasilitas.</li>
          <li style={{ marginBottom: '4px' }}><strong>Mematuhi Kapasitas.</strong> Jumlah peserta kegiatan tidak boleh melebihi kapasitas maksimum yang tertera pada data ruangan.</li>
          <li style={{ marginBottom: '4px' }}><strong>Membatalkan Jika Perlu.</strong> Jika kegiatan dibatalkan, pengguna diwajibkan untuk membatalkan pengajuan peminjaman melalui sistem agar slot waktu dapat digunakan oleh pihak lain.</li>
          <li><strong>Melaporkan Kerusakan.</strong> Jika menemukan kerusakan pada ruangan atau fasilitas, pengguna wajib segera melaporkannya kepada pengelola fasilitas melalui kontak yang tersedia.</li>
        </ol>
        <div style={S.warn}>
          <strong>Peringatan:</strong> Pelanggaran terhadap aturan di atas dapat mengakibatkan pembatasan akses
          peminjaman ruangan atau sanksi administratif sesuai ketentuan yang berlaku di IPB University.
        </div>

        {/* ════ BAB 15 ════ */}
        <h2 style={S.secTitle}>15. Troubleshooting Sistem</h2>
        <p style={S.txt}>
          Berikut adalah panduan penyelesaian kendala teknis yang mungkin dialami pengguna saat menggunakan
          SIPBeru IPB:
        </p>
        {[
          ['Tidak Bisa Login', 'Pastikan email/NIM/NIP dan password yang dimasukkan sudah benar. Periksa apakah Caps Lock aktif. Jika lupa password, gunakan fitur "Lupa password?" untuk reset via OTP. Pastikan akun Anda sudah terdaftar dalam sistem.'],
          ['Gagal Upload Dokumen', 'Pastikan format file adalah PDF. Periksa ukuran file (maksimal 5 MB). Coba kompres file PDF menggunakan tools online jika ukuran terlalu besar. Pastikan koneksi internet stabil saat proses unggah.'],
          ['Halaman Tidak Dapat Dimuat', 'Refresh halaman (F5 atau Ctrl+R). Bersihkan cache browser (Ctrl+Shift+Delete). Pastikan menggunakan browser versi terbaru. Coba akses menggunakan browser lain.'],
          ['Status Pengajuan Tidak Berubah', 'Status pengajuan diperbarui oleh administrator secara manual. Jika status tidak berubah dalam waktu lebih dari 3 hari kerja, hubungi administrator atau Direktorat Sarana & Prasarana.'],
          ['E-Pass Tidak Muncul', 'E-Pass hanya tersedia untuk pengajuan berstatus "Disetujui". Pastikan pengajuan Anda telah disetujui oleh administrator. Coba refresh halaman atau logout dan login kembali.'],
          ['QR Code Tidak Dapat Dipindai', 'Pastikan layar perangkat cukup terang. Bersihkan layar dari sidik jari atau noda. Perbesar tampilan QR Code. Pastikan perangkat pemindai memiliki kamera yang berfungsi dengan baik.'],
        ].map(([problem, solution], i) => (
          <TroubleCard key={i} problem={problem} solution={solution} />
        ))}

        {/* ════ BAB 16 ════ */}
        <h2 style={S.secTitle}>16. Frequently Asked Questions (FAQ)</h2>
        {[
          ['Apakah mahasiswa dapat meminjam auditorium atau aula besar?', 'Ya, mahasiswa dapat mengajukan peminjaman untuk semua jenis ruangan yang tersedia di katalog, termasuk auditorium, selama memenuhi persyaratan dan mendapatkan persetujuan dari administrator.'],
          ['Berapa lama proses verifikasi pengajuan?', 'Waktu verifikasi bergantung pada kebijakan administrator masing-masing unit. Pada umumnya, verifikasi dilakukan dalam waktu 1–3 hari kerja setelah pengajuan diterima.'],
          ['Apakah saya bisa membatalkan pengajuan yang sudah dikirim?', 'Ya, pengajuan yang masih berstatus "Menunggu Verifikasi" dapat dibatalkan oleh pengguna melalui tombol "Batalkan" pada tabel riwayat di Dashboard.'],
          ['Bagaimana jika kegiatan selesai lebih cepat dari jadwal?', 'Pengguna dipersilakan meninggalkan ruangan lebih awal. Ruangan akan tetap tercatat sebagai terpakai sampai waktu berakhir sesuai jadwal yang diajukan.'],
          ['Apakah laporan riwayat dapat diunduh?', 'Ya, pengguna dapat mengunduh laporan riwayat peminjaman dalam format PDF melalui tombol "Ekspor Riwayat" di Dashboard. Laporan akan dihasilkan secara otomatis oleh sistem.'],
          ['Siapa yang harus dihubungi jika ada kendala teknis?', 'Pengguna dapat menghubungi Direktorat Sarana & Prasarana IPB University melalui email support@sipberu.ac.id pada jam operasional Senin–Jumat, 08.00–16.00 WIB.'],
          ['Apakah SIPBeru IPB bisa diakses dari smartphone?', 'Ya, sistem dirancang dengan tampilan responsif yang dapat diakses melalui browser pada smartphone atau tablet tanpa perlu instalasi aplikasi tambahan.'],
        ].map(([q, a], i) => (
          <FaqItem key={i} q={q} a={a} idx={i} />
        ))}

        <SectionBreak />
        <PageHeader />

        {/* ════ BAB 17 ════ */}
        <h2 style={S.secTitle}>17. Kontak dan Bantuan Sistem</h2>
        <p style={S.txt}>
          Jika pengguna mengalami kendala teknis, memiliki pertanyaan, atau memerlukan bantuan terkait penggunaan
          SIPBeru IPB, silakan menghubungi tim pengelola melalui saluran komunikasi berikut:
        </p>
        <div style={{ border: `1.5px solid ${IPB.navy}`, borderRadius: '7px', overflow: 'hidden', marginBottom: '14px', pageBreakInside: 'avoid' }}>
          <div style={{ background: IPB.navy, padding: '9px 14px', color: '#fff', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
            Informasi Kontak Resmi
          </div>
          <div style={{ padding: '14px', background: '#f0f9ff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                ['🏢', 'Unit Pengelola', 'Direktorat Sarana & Prasarana IPB University'],
                ['✉️', 'Email Resmi', 'support@sipberu.ac.id'],
                ['🕐', 'Jam Operasional', 'Senin – Jumat, 08.00 – 16.00 WIB'],
                ['📍', 'Alamat', 'Kampus IPB Dramaga, Bogor 16680, Jawa Barat'],
              ].map(([icon, label, value], i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '10px', color: IPB.slateL, fontWeight: 'bold' }}>{label}</div>
                    <div style={{ fontSize: '11.5px', color: '#1e293b' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={S.note}>
          <strong>Catatan:</strong> Untuk mempercepat proses penanganan, sertakan informasi akun (nama, email,
          NIM/NIP), deskripsi masalah yang dialami, dan tangkapan layar (screenshot) kendala pada saat
          menghubungi tim pengelola.
        </div>

        {/* ════ BAB 18 ════ */}
        <h2 style={S.secTitle}>18. Penutup</h2>
        <p style={S.txt}>
          SIPBeru IPB merupakan wujud nyata dari komitmen IPB University dalam mendukung transformasi digital
          layanan administrasi kampus yang lebih modern, efektif, dan terintegrasi. Melalui sistem ini, proses
          peminjaman ruangan yang sebelumnya bersifat manual dan memakan waktu kini dapat dilakukan secara digital
          dengan lebih cepat, transparan, dan terdokumentasi dengan baik.
        </p>
        <p style={S.txt}>
          Buku panduan ini telah menyajikan seluruh informasi yang diperlukan oleh pengguna untuk dapat memahami
          dan mengoperasikan SIPBeru IPB secara mandiri. Mulai dari pengenalan sistem, alur peminjaman ruangan,
          penjelasan fitur-fitur utama, panduan langkah demi langkah, hingga mekanisme troubleshooting dan
          pertanyaan yang sering diajukan—semuanya telah diuraikan secara sistematis dan komprehensif.
        </p>
        <p style={S.txt}>
          Penyusun menyadari bahwa setiap sistem informasi senantiasa membutuhkan evaluasi dan penyempurnaan
          berkelanjutan agar dapat terus menjawab kebutuhan pengguna yang dinamis. Oleh karena itu, masukan,
          kritik, dan saran yang bersifat konstruktif dari seluruh pengguna sangat kami harapkan sebagai bahan
          pertimbangan dalam pengembangan sistem di masa mendatang.
        </p>
        <p style={S.txt}>
          Akhir kata, semoga SIPBeru IPB dapat memberikan manfaat yang sebesar-besarnya bagi seluruh civitas
          akademika IPB University dan berkontribusi dalam mewujudkan pengelolaan fasilitas kampus yang lebih
          tertib, profesional, dan berkelanjutan.
        </p>
        <SignatureBlock />
        <DocFooter />

      </div>
      {/* end content wrapper */}
    </div>
  );
});

BukuPanduanSIPBeru.displayName = 'BukuPanduanSIPBeru';
export default BukuPanduanSIPBeru;


