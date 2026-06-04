import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle, User, Building2,
  Calendar, Clock, Tag, Loader2, RotateCcw, Camera, ShieldCheck,
  LogIn, LogOut, Lock, Hash, Flashlight, X, ChevronDown,
  Wifi, WifiOff, ScanLine, Zap
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../services/api';

/* ─── Helpers ─── */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';
const fmtTime = (t) => (t ? String(t).slice(0, 5) : '-');

const STATUS_MAP = {
  Approved:  { color: '#16a34a', bg: '#052e16', border: '#14532d', Icon: ShieldCheck,  label: 'VALID — Siap Ambil Kunci',       action: 'checkin'  },
  CheckedIn: { color: '#60a5fa', bg: '#0c1a2e', border: '#1e3a8a', Icon: LogIn,         label: 'Sedang Digunakan',               action: 'checkout' },
  Completed: { color: '#f87171', bg: '#1c0a0a', border: '#7f1d1d', Icon: Lock,          label: 'Selesai / Expired',              action: null       },
  Expired:   { color: '#f87171', bg: '#1c0a0a', border: '#7f1d1d', Icon: Lock,          label: 'Selesai / Expired',              action: null       },
  Pending:   { color: '#fbbf24', bg: '#1c1100', border: '#78350f', Icon: AlertTriangle, label: 'Menunggu Verifikasi Admin',      action: null       },
  Rejected:  { color: '#f87171', bg: '#1c0a0a', border: '#7f1d1d', Icon: XCircle,       label: 'Ditolak',                        action: null       },
};

/* ─── Scan Frame Overlay ─── */
const ScanFrame = ({ scanning }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    {/* Dark vignette overlay */}
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 55% 55% at center, transparent 38%, rgba(0,0,0,0.75) 70%)',
    }} />

    {/* Scan box */}
    <div style={{
      width: 240,
      height: 240,
      position: 'relative',
    }}>
      {/* Corner markers */}
      {[
        { top: 0, left: 0, borderTop: '3px solid', borderLeft: '3px solid', borderRadius: '4px 0 0 0' },
        { top: 0, right: 0, borderTop: '3px solid', borderRight: '3px solid', borderRadius: '0 4px 0 0' },
        { bottom: 0, left: 0, borderBottom: '3px solid', borderLeft: '3px solid', borderRadius: '0 0 0 4px' },
        { bottom: 0, right: 0, borderBottom: '3px solid', borderRight: '3px solid', borderRadius: '0 0 4px 0' },
      ].map((style, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 28,
          height: 28,
          borderColor: scanning ? '#4ade80' : '#60a5fa',
          transition: 'border-color 0.3s',
          ...style,
        }} />
      ))}

      {/* Scanning line */}
      {scanning && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #4ade80, transparent)',
          animation: 'scanLine 1.8s ease-in-out infinite',
          top: '50%',
        }} />
      )}
    </div>

    {/* Bottom hint */}
    <div style={{
      position: 'absolute',
      bottom: '28%',
      left: 0,
      right: 0,
      textAlign: 'center',
    }}>
      <p style={{
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        fontWeight: 500,
        margin: 0,
        letterSpacing: '0.02em',
      }}>
        {scanning ? 'Arahkan kamera ke QR Code' : 'Memulai kamera...'}
      </p>
    </div>
  </div>
);

/* ─── Result Bottom Sheet ─── */
const ResultSheet = ({ result, onReset, onCheckIn, onCheckOut, actionLoading }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Slide-in animation
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (result.error) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
      }}>
        {/* Error state */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 32px',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(220,38,38,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            animation: 'pulse 2s infinite',
          }}>
            <XCircle size={40} color="#f87171" />
          </div>
          <h2 style={{ color: '#f87171', fontSize: 20, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>
            Kode Tidak Ditemukan
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
            {result.error}
          </p>
          <button
            onClick={onReset}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <RotateCcw size={18} /> Scan Lagi
          </button>
        </div>
      </div>
    );
  }

  const b = result.booking;
  const s = STATUS_MAP[b.status] || STATUS_MAP.Pending;
  const { Icon } = s;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Status hero */}
      <div style={{
        background: `linear-gradient(180deg, ${s.bg} 0%, #0f172a 100%)`,
        padding: '48px 24px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        borderBottom: `1px solid ${s.border}`,
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `rgba(${s.color === '#16a34a' ? '22,163,74' : s.color === '#60a5fa' ? '96,165,250' : '248,113,113'},0.15)`,
          border: `2px solid ${s.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          animation: b.status === 'Approved' ? 'pulse 2s infinite' : 'none',
        }}>
          <Icon size={34} color={s.color} />
        </div>
        <p style={{ color: s.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Status Verifikasi
        </p>
        <h2 style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: '0 0 10px' }}>
          {s.label}
        </h2>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          padding: '6px 16px',
        }}>
          <QrCode size={13} color="#94a3b8" />
          <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
            {b.booking_code || b.id_epass}
          </span>
        </div>
      </div>

      {/* Booking details */}
      <div style={{ flex: 1, padding: '20px 20px 0' }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          {[
            [User,      'Peminjam',   b.nama_peminjam || b.user_name],
            [Hash,      'NIM / NIP',  b.nim_nip || '-'],
            [Building2, 'Ruangan',    b.room_name],
            [Calendar,  'Tanggal',    fmtDate(b.date)],
            [Clock,     'Waktu',      `${fmtTime(b.start_time)} – ${fmtTime(b.end_time)} WIB`],
            [Tag,       'Keperluan',  b.activity_name || b.keperluan],
          ].map(([Ic, label, val], idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderBottom: idx < 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Ic size={15} color="#64748b" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {label}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: '#e2e8f0', wordBreak: 'break-word' }}>
                  {val || '-'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes if any */}
        {b.notes && (
          <div style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
              Catatan Admin
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#fde68a' }}>{b.notes}</p>
          </div>
        )}
      </div>

      {/* Action buttons — fixed at bottom */}
      <div style={{
        padding: '16px 20px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        background: '#0f172a',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {/* CheckIn */}
        {b.status === 'Approved' && (
          <button
            onClick={() => onCheckIn(b.booking_code || b.id_epass)}
            disabled={actionLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: actionLoading ? '#14532d' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 16,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogIn size={18} />}
            {actionLoading ? 'Memproses...' : '🔑 Ambil Kunci'}
          </button>
        )}

        {/* CheckOut */}
        {b.status === 'CheckedIn' && (
          <button
            onClick={() => onCheckOut(b.booking_code || b.id_epass)}
            disabled={actionLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: actionLoading ? '#1e3a8a' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 16,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
              opacity: actionLoading ? 0.7 : 1,
            }}
          >
            {actionLoading ? <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogOut size={18} />}
            {actionLoading ? 'Memproses...' : '🔓 Kembalikan Kunci'}
          </button>
        )}

        {/* Expired/Completed */}
        {(b.status === 'Completed' || b.status === 'Expired') && (
          <div style={{
            padding: '16px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 16,
            textAlign: 'center',
          }}>
            <Lock size={18} color="#f87171" style={{ marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f87171' }}>
              E-Pass sudah tidak berlaku
            </p>
          </div>
        )}

        {/* Pending/Rejected */}
        {(b.status === 'Pending' || b.status === 'Rejected' || b.status === 'Draft') && (
          <div style={{
            padding: '16px',
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 16,
            textAlign: 'center',
          }}>
            <AlertTriangle size={18} color="#fbbf24" style={{ marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
              Belum bisa diverifikasi
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#d97706' }}>
              Status: {b.status}
            </p>
          </div>
        )}

        {/* Scan next */}
        <button
          onClick={onReset}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <RotateCcw size={15} /> Scan Berikutnya
        </button>
      </div>
    </div>
  );
};

/* ─── Manual Input Sheet ─── */
const ManualSheet = ({ onVerify, loading, onClose }) => {
  const [code, setCode] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed) onVerify(trimmed);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#1e293b',
        borderRadius: '24px 24px 0 0',
        padding: '0 0 max(24px, env(safe-area-inset-bottom)) 0',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
        </div>

        <div style={{ padding: '8px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ color: 'white', fontSize: 17, fontWeight: 800, margin: 0 }}>
              Input Kode Manual
            </h3>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={16} />
            </button>
          </div>

          <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
            Masukkan kode booking e-pass mahasiswa. Format: <span style={{ fontFamily: 'monospace', color: '#60a5fa' }}>BK-2025-XXXX</span>
          </p>

          <input
            ref={inputRef}
            type="text"
            placeholder="BK-2025-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            style={{
              width: '100%',
              padding: '16px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              color: 'white',
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.06em',
              outline: 'none',
              marginBottom: 14,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !code.trim()}
            style={{
              width: '100%',
              padding: '16px',
              background: code.trim() && !loading
                ? 'linear-gradient(135deg, #1e3a8a, #2563eb)'
                : 'rgba(255,255,255,0.05)',
              color: code.trim() && !loading ? 'white' : '#475569',
              border: 'none',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 15,
              cursor: code.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {loading ? <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ShieldCheck size={17} />}
            {loading ? 'Memverifikasi...' : 'Verifikasi Kode'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Mobile Scanner Page ─── */
const SatpamMobileScanner = () => {
  const [camOn,         setCamOn]         = useState(false);
  const [camActive,     setCamActive]     = useState(false);
  const [camError,      setCamError]      = useState('');
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [result,        setResult]        = useState(null);
  const [showManual,    setShowManual]    = useState(false);
  const [scanSuccess,   setScanSuccess]   = useState(false);
  const html5Ref = useRef(null);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    * { box-sizing: border-box; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
    @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes scanLine {
      0%   { top: 8%;  opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 92%; opacity: 0; }
    }
    @keyframes scanSuccess {
      0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6); }
      70%  { box-shadow: 0 0 0 20px rgba(74, 222, 128, 0); }
      100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    #qr-reader__scan_region { border: none !important; }
    #qr-reader__scan_region img { display: none !important; }
    #qr-reader__dashboard { display: none !important; }
    #qr-reader video {
      border-radius: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
    }
    #qr-reader {
      width: 100% !important;
      height: 100% !important;
    }
    #qr-reader > div:first-child {
      height: 100% !important;
    }

    .satpam-mobile-scanner {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  `;

  const stopCam = useCallback(async () => {
    if (html5Ref.current) {
      try { await html5Ref.current.stop(); } catch {}
      try { html5Ref.current.clear(); } catch {}
      html5Ref.current = null;
    }
    setCamActive(false);
  }, []);

  const verify = useCallback(async (code) => {
    if (!code) return;
    setShowManual(false);
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/bookings/verify-code?code=${encodeURIComponent(code)}`);
      setResult({ booking: res.data?.data || res.data, error: null });
    } catch (err) {
      setResult({ booking: null, error: err.response?.data?.message || 'Kode tidak ditemukan.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const startCam = useCallback(async () => {
    setCamError('');
    try {
      const qr = new Html5Qrcode('qr-reader-mobile');
      html5Ref.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        {
          fps: 30,
          qrbox: () => ({ width: 220, height: 220 }),
          disableFlip: false,
        },
        (text) => {
          const m1 = text.match(/Kode:\s*([A-Za-z0-9-]+)/i);
          const m2 = text.match(/(BK-\d{4}-\d+)/i);
          const code = (m1?.[1] || m2?.[1] || text.trim()).toUpperCase();
          setScanSuccess(true);
          setTimeout(() => setScanSuccess(false), 800);
          stopCam();
          setCamOn(false);
          verify(code);
        },
        () => {}
      );
      setCamActive(true);
    } catch (err) {
      setCamError(
        err?.message?.includes('ermission')
          ? 'Izin kamera ditolak. Buka pengaturan browser dan berikan akses kamera.'
          : 'Gagal membuka kamera. Pastikan perangkat memiliki kamera yang tersedia.'
      );
    }
  }, [stopCam, verify]);

  useEffect(() => {
    if (camOn) {
      startCam();
    } else {
      stopCam();
    }
  }, [camOn]);

  useEffect(() => () => stopCam(), []);

  const handleCheckIn = async (code) => {
    setActionLoading(true);
    try {
      const res = await api.post('/bookings/check-in', { booking_code: code });
      setResult({ booking: res.data?.data || res.data, error: null });
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal check-in.');
    } finally { setActionLoading(false); }
  };

  const handleCheckOut = async (code) => {
    setActionLoading(true);
    try {
      const res = await api.post('/bookings/check-out', { booking_code: code });
      setResult({ booking: res.data?.data || res.data, error: null });
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal check-out.');
    } finally { setActionLoading(false); }
  };

  const reset = async () => {
    setResult(null);
    setCamError('');
    setScanSuccess(false);
    await stopCam();
    setCamOn(false);
  };

  const userName = localStorage.getItem('nama') || localStorage.getItem('name') || 'Satpam';

  /* ─── If result is shown ─── */
  if (result) {
    return (
      <div className="satpam-mobile-scanner" style={{ background: '#0f172a', minHeight: '100vh' }}>
        <style>{css}</style>
        <ResultSheet
          result={result}
          onReset={reset}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          actionLoading={actionLoading}
        />
      </div>
    );
  }

  /* ─── If loading after scan ─── */
  if (loading) {
    return (
      <div className="satpam-mobile-scanner" style={{
        background: '#0f172a',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        <style>{css}</style>
        <Loader2 size={48} color="#60a5fa" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 600, margin: 0 }}>
          Memverifikasi E-Pass...
        </p>
      </div>
    );
  }

  return (
    <div className="satpam-mobile-scanner" style={{
      background: '#0f172a',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{css}</style>

      {/* ── Top Bar ── */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        padding: 'max(16px, env(safe-area-inset-top)) 20px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: camActive
          ? 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)'
          : '#111827',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ScanLine size={18} color="white" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: 'white' }}>Scan E-Pass</p>
            <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 500 }}>
              Halo, {userName}
            </p>
          </div>
        </div>

        {/* Status dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: camActive ? '#4ade80' : '#475569',
            transition: 'background 0.3s',
            boxShadow: camActive ? '0 0 6px #4ade80' : 'none',
          }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: camActive ? '#4ade80' : '#475569' }}>
            {camActive ? 'Kamera aktif' : 'Standby'}
          </span>
        </div>
      </div>

      {/* ── Camera Area ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#000',
        minHeight: 340,
      }}>
        {/* The actual qr reader element */}
        <div id="qr-reader-mobile" style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }} />

        {/* Overlay when cam not active */}
        {(!camOn || !camActive) && !camError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: '#0a0f1e',
          }}>
            {camOn ? (
              <>
                <Loader2 size={36} color="#475569" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#475569', fontSize: 14, fontWeight: 500, margin: 0 }}>Memulai kamera...</p>
              </>
            ) : (
              <>
                <div style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'rgba(30,58,138,0.1)',
                  border: '2px solid rgba(30,58,138,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Camera size={44} color="#1e3a8a" />
                </div>
                <p style={{ color: '#94a3b8', fontSize: 15, fontWeight: 600, margin: 0 }}>
                  Kamera belum aktif
                </p>
                <p style={{ color: '#475569', fontSize: 13, margin: '4px 0 0', textAlign: 'center', maxWidth: 220, lineHeight: 1.5 }}>
                  Tekan "Mulai Scan" di bawah untuk mengaktifkan kamera
                </p>
              </>
            )}
          </div>
        )}

        {/* Scan frame overlay when active */}
        {camActive && <ScanFrame scanning={camActive} />}

        {/* Camera error */}
        {camError && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#0a0f1e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            gap: 16,
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'rgba(220,38,38,0.1)',
              border: '2px solid rgba(220,38,38,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Camera size={32} color="#dc2626" />
            </div>
            <p style={{ color: '#f87171', fontSize: 14, fontWeight: 600, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              {camError}
            </p>
            <button
              onClick={() => { setCamError(''); setCamOn(true); }}
              style={{
                padding: '12px 28px',
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Controls ── */}
      <div style={{
        background: '#111827',
        padding: '20px 20px max(24px, env(safe-area-inset-bottom))',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {/* Main scan button */}
        {!camActive ? (
          <button
            onClick={() => setCamOn(true)}
            disabled={camOn}
            style={{
              width: '100%',
              padding: '18px',
              background: camOn
                ? 'rgba(30,58,138,0.3)'
                : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 18,
              fontWeight: 800,
              fontSize: 17,
              cursor: camOn ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'all 0.2s',
              boxShadow: camOn ? 'none' : '0 8px 24px rgba(37,99,235,0.35)',
            }}
          >
            {camOn ? (
              <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Memulai...</>
            ) : (
              <><Camera size={20} /> Mulai Scan</>
            )}
          </button>
        ) : (
          <button
            onClick={() => { stopCam(); setCamOn(false); }}
            style={{
              width: '100%',
              padding: '18px',
              background: 'rgba(220,38,38,0.12)',
              color: '#f87171',
              border: '1.5px solid rgba(220,38,38,0.3)',
              borderRadius: 18,
              fontWeight: 800,
              fontSize: 17,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transition: 'all 0.2s',
            }}
          >
            <X size={20} /> Hentikan Kamera
          </button>
        )}

        {/* Manual input */}
        <button
          onClick={() => setShowManual(true)}
          style={{
            width: '100%',
            padding: '14px',
            background: 'transparent',
            color: '#64748b',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <Hash size={15} /> Input Kode Manual
        </button>
      </div>

      {/* ── Manual Input Sheet ── */}
      {showManual && (
        <ManualSheet
          onVerify={verify}
          loading={loading}
          onClose={() => setShowManual(false)}
        />
      )}
    </div>
  );
};

export default SatpamMobileScanner;
