import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode, CheckCircle, XCircle, AlertTriangle, User, Building2,
  Calendar, Clock, Tag, Loader2, RotateCcw, Camera, ShieldCheck,
  LogIn, LogOut, Lock, Hash
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../../services/api';

/* ─── helpers ─── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const fmtTime = (t) => t ? String(t).slice(0, 5) : '-';

const STATUS = {
  Approved:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', Icon: ShieldCheck,   label: 'VALID — Siap Ambil Kunci' },
  CheckedIn: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', Icon: LogIn,          label: 'Sedang Digunakan' },
  Completed: { color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', Icon: Lock,           label: 'EXPIRED — Selesai' },
  Expired:   { color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', Icon: Lock,           label: 'EXPIRED — Selesai' },
  Pending:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: AlertTriangle,  label: 'Menunggu Verifikasi' },
  Rejected:  { color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', Icon: XCircle,        label: 'Ditolak' },
  Draft:     { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', Icon: AlertTriangle,  label: 'Draft' },
};

/* ─── Digit box components (defined outside to prevent re-mount) ─── */
const StaticBox = ({ ch }) => (
  <div style={{ width: 48, height: 56, border: '2px solid #e5e7eb', borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#9ca3af', fontFamily: 'monospace' }}>
    {ch}
  </div>
);

const Dash = () => (
  <span style={{ fontSize: 22, color: '#d1d5db', fontWeight: 300, alignSelf: 'center' }}>–</span>
);

const DigitInput = ({ refEl, value, onChange, onKeyDown }) => (
  <input
    ref={refEl} type="text" inputMode="numeric" maxLength={1} value={value}
    onChange={onChange} onKeyDown={onKeyDown}
    onFocus={e => { e.target.style.borderColor = '#1e3a8a'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.12)'; }}
    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
    style={{ width: 48, height: 56, border: '2px solid #e5e7eb', borderRadius: 10, textAlign: 'center', fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: '#1e293b', outline: 'none', background: 'white', transition: 'border-color 0.15s, box-shadow 0.15s' }}
  />
);

/* ─── OTP Input ─── */
const OtpInput = ({ onVerify, loading }) => {
  const [yr, setYr] = useState(['', '', '', '']);
  const [cd, setCd] = useState(['', '', '', '']);
  const yR = [useRef(), useRef(), useRef(), useRef()];
  const cR = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { yR[0].current?.focus(); }, []);

  const change = (refs, arr, setArr, nextG, i, val) => {
    const c = val.replace(/\D/g, '').slice(-1);
    const upd = [...arr]; upd[i] = c; setArr(upd);
    if (c) {
      if (i < 3) refs[i + 1].current?.focus();
      else if (nextG) nextG[0].current?.focus();
      // last box of last group: just move focus, no auto-submit
    }
  };

  const keydn = (refs, arr, prevG, nextG, i, e) => {
    if (e.key === 'Backspace' && !arr[i] && i === 0 && prevG) prevG[3].current?.focus();
    if (e.key === 'Backspace' && !arr[i] && i > 0) refs[i - 1].current?.focus();
    if (e.key === 'ArrowLeft'  && i > 0) refs[i - 1].current?.focus();
    if (e.key === 'ArrowRight' && i < 3) refs[i + 1].current?.focus();
    if (e.key === 'Enter') {
      if (i < 3) refs[i + 1].current?.focus();
      else if (nextG) nextG[0].current?.focus();
      // Enter on last box: do NOT auto-submit, user must click Verifikasi
    }
  };

  const ok = yr.every(d => d) && cd.every(d => d);

  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 20 }}>Kode Booking</label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <StaticBox ch="B" /><StaticBox ch="K" />
        </div>
        <Dash />
        <div style={{ display: 'flex', gap: 4 }}>
          {yr.map((v, i) => (
            <DigitInput key={i} refEl={yR[i]} value={v}
              onChange={e => change(yR, yr, setYr, cR, i, e.target.value)}
              onKeyDown={e => keydn(yR, yr, null, cR, i, e)} />
          ))}
        </div>
        <Dash />
        <div style={{ display: 'flex', gap: 4 }}>
          {cd.map((v, i) => (
            <DigitInput key={i} refEl={cR[i]} value={v}
              onChange={e => change(cR, cd, setCd, null, i, e.target.value)}
              onKeyDown={e => keydn(cR, cd, yR, null, i, e)} />
          ))}
        </div>
      </div>

      {ok && (
        <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe', marginBottom: 16, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
          Kode Booking : <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>BK-{yr.join('')}-{cd.join('')}</span>
        </div>
      )}

      <button
        onClick={() => onVerify(`BK-${yr.join('')}-${cd.join('')}`)}
        disabled={loading || !ok}
        style={{
          width: '100%', padding: '13px 20px', border: 'none', borderRadius: 12,
          cursor: ok && !loading ? 'pointer' : 'not-allowed',
          background: ok && !loading ? '#1e3a8a' : '#e5e7eb',
          color: ok && !loading ? 'white' : '#9ca3af',
          fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
        }}
      >
        {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
        {loading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>
      <p style={{ margin: '10px 0 0', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
        Tekan Enter di kotak terakhir untuk langsung verifikasi
      </p>
    </div>
  );
};

/* ─── Result Card ─── */
const ResultCard = ({ result, onReset, onCheckIn, onCheckOut, actionLoading }) => {
  if (result.error) return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #fecdd3', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <XCircle size={28} color="#dc2626" />
      </div>
      <p style={{ fontWeight: 800, fontSize: 18, color: '#dc2626', margin: '0 0 8px' }}>Kode Tidak Ditemukan</p>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>{result.error}</p>
      <button onClick={onReset} style={{ padding: '11px 28px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <RotateCcw size={14} /> Scan Berikutnya
      </button>
    </div>
  );

  const b = result.booking;
  const s = STATUS[b.status] || STATUS.Pending;
  const { Icon } = s;

  return (
    <div>
      {/* Status strip */}
      <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${s.border}`, flexShrink: 0 }}>
          <Icon size={22} color={s.color} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Status Verifikasi</p>
          <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: s.color }}>{s.label}</p>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1e3a8a', background: '#eff6ff', padding: '4px 12px', borderRadius: 8 }}>
          {b.booking_code}
        </span>
      </div>

      {/* Detail */}
      <div style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
          {[
            [User,      'Peminjam',  b.nama_peminjam || b.user_name],
            [Hash,      'NIM/NIP',   b.nim_nip || '-'],
            [Building2, 'Ruangan',   b.room_name],
            [Calendar,  'Tanggal',   fmtDate(b.date)],
            [Clock,     'Waktu',     `${fmtTime(b.start_time)} – ${fmtTime(b.end_time)} WIB`],
            [Tag,       'Kegiatan',  b.activity_name],
          ].map(([Ic, label, val], idx) => (
            <div key={idx} style={{ gridColumn: idx >= 4 ? 'span 2' : 'span 1', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Ic size={14} color="#64748b" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{val || '-'}</p>
              </div>
            </div>
          ))}
        </div>
        {b.notes && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#92400e' }}>Catatan Admin</p>
            <p style={{ margin: 0, fontSize: 13, color: '#78350f' }}>{b.notes}</p>
          </div>
        )}
      </div>

      {/* Action buttons based on status */}
      {b.status === 'Approved' && (
        <button onClick={() => onCheckIn(b.booking_code)} disabled={actionLoading}
          style={{ width: '100%', padding: 14, background: '#16a34a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, opacity: actionLoading ? 0.7 : 1 }}>
          {actionLoading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogIn size={18} />}
          {actionLoading ? 'Memproses...' : 'Ambil Kunci'}
        </button>
      )}

      {b.status === 'CheckedIn' && (
        <button onClick={() => onCheckOut(b.booking_code)} disabled={actionLoading}
          style={{ width: '100%', padding: 14, background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, opacity: actionLoading ? 0.7 : 1 }}>
          {actionLoading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <LogOut size={18} />}
          {actionLoading ? 'Memproses...' : 'Kembalikan Kunci'}
        </button>
      )}

      {(b.status === 'Completed' || b.status === 'Expired') && (
        <div style={{ padding: '14px 16px', background: '#fff1f2', borderRadius: 12, border: '1px solid #fecdd3', textAlign: 'center', marginBottom: 10 }}>
          <Lock size={18} color="#dc2626" style={{ marginBottom: 4 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#dc2626' }}>E-Pass Expired</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Peminjaman sudah selesai. Barcode tidak bisa digunakan lagi.</p>
        </div>
      )}

      {(b.status === 'Pending' || b.status === 'Rejected' || b.status === 'Draft') && (
        <div style={{ padding: '14px 16px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fde68a', textAlign: 'center', marginBottom: 10 }}>
          <AlertTriangle size={18} color="#d97706" style={{ marginBottom: 4 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#92400e' }}>Belum Bisa Diverifikasi</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Booking belum disetujui. Status: {b.status}</p>
        </div>
      )}

      <button onClick={onReset} style={{ width: '100%', padding: 13, background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <RotateCcw size={15} /> Scan Berikutnya
      </button>
    </div>
  );
};

/* ─── Main ─── */
const EPassScanner = () => {
  const [mode,          setMode]         = useState('scan');
  const [camOn,         setCamOn]        = useState(false);
  const [camActive,     setCamActive]    = useState(false);
  const [camError,      setCamError]     = useState('');
  const [loading,       setLoading]      = useState(false);
  const [actionLoading, setActionLoading]= useState(false);
  const [result,        setResult]       = useState(null);
  const html5Ref = useRef(null);

  const css = `
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    #qr-reader__scan_region { border:none!important; }
    #qr-reader__scan_region img { display:none!important; }
    #qr-reader__dashboard { display:none!important; }
    #qr-reader video { border-radius:10px!important; width:100%!important; }
  `;

  const stopCam = async () => {
    if (html5Ref.current) {
      try { await html5Ref.current.stop(); } catch {}
      try { html5Ref.current.clear(); } catch {}
      html5Ref.current = null;
    }
    setCamActive(false);
  };

  const startCam = async () => {
    setCamError('');
    try {
      const qr = new Html5Qrcode('qr-reader');
      html5Ref.current = qr;
      await qr.start(
        { facingMode: 'environment' },
        { fps: 30, qrbox: (w, h) => { const s = Math.min(w, h) * 0.88; return { width: s, height: s }; }, disableFlip: false },
        (text) => {
          const m1 = text.match(/Kode:\s*([A-Za-z0-9-]+)/i);
          const m2 = text.match(/(BK-\d{4}-\d+)/i);
          const code = (m1?.[1] || m2?.[1] || text.trim()).toUpperCase();
          stopCam();
          verify(code);
        },
        () => {}
      );
      setCamActive(true);
    } catch (err) {
      setCamError(
        err?.message?.includes('ermission')
          ? 'Izin kamera ditolak. Berikan akses kamera di browser.'
          : 'Gagal membuka kamera. Pastikan perangkat memiliki kamera.'
      );
    }
  };

  // Start/stop based on camOn AND mode=scan
  useEffect(() => {
    if (mode === 'scan' && camOn) {
      startCam();
    } else {
      stopCam();
    }
  }, [mode, camOn]);

  // Stop on unmount
  useEffect(() => { return () => { stopCam(); }; }, []);

  const toggleCam = () => setCamOn(prev => !prev);

  const verify = async (code) => {
    if (!code) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/bookings/verify-code?code=${encodeURIComponent(code)}`);
      setResult({ booking: res.data?.data || res.data, error: null });
    } catch (err) {
      setResult({ booking: null, error: err.response?.data?.message || 'Kode tidak ditemukan.' });
    } finally { setLoading(false); }
  };

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
    setCamOn(false);
    await stopCam();
  };

  const switchMode = async (m) => {
    if (m === mode) return;
    setMode(m);
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QrCode size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Scan E-Pass</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Verifikasi peminjaman ruangan oleh PIC</p>
          </div>
        </div>
      </div>

      {result ? (
        <ResultCard result={result} onReset={reset} onCheckIn={handleCheckIn} onCheckOut={handleCheckOut} actionLoading={actionLoading} />
      ) : (
        <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>

          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
            {[
              { key: 'scan',   label: 'Scan QR Code', Icon: Camera },
              { key: 'manual', label: 'Input Manual',  Icon: QrCode },
            ].map(({ key, label, Icon: Ic }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  flex: 1, padding: '16px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                  background: mode === key ? 'white' : '#fafafa',
                  color: mode === key ? '#1e3a8a' : '#94a3b8',
                  borderBottom: mode === key ? '2px solid #1e3a8a' : '2px solid transparent',
                }}
              >
                <Ic size={16} /> {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {mode === 'scan' ? (
              <div>
                {/* Camera status bar */}
                {camOn && camActive ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>Kamera aktif — arahkan ke QR Code mahasiswa</span>
                    </div>
                    <button onClick={toggleCam} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #dc2626', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, background: '#fff1f2', color: '#dc2626', transition: 'all 0.2s' }}>
                      <Camera size={13} /> Matikan
                    </button>
                  </div>
                ) : camOn ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Loader2 size={14} color="#64748b" style={{ animation: 'spin 0.8s linear infinite' }} />
                      <span style={{ fontSize: 13, color: '#64748b' }}>Memulai kamera...</span>
                    </div>
                    <button onClick={toggleCam} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #dc2626', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, background: '#fff1f2', color: '#dc2626' }}>
                      <Camera size={13} /> Matikan
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Kamera mati</span>
                    <button onClick={toggleCam} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1.5px solid #1e3a8a', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, background: '#eff6ff', color: '#1e3a8a', transition: 'all 0.2s' }}>
                      <Camera size={13} /> Nyalakan
                    </button>
                  </div>
                )}

                {/* Camera viewport */}
                <div style={{ borderRadius: 12, overflow: 'hidden', background: '#0f172a', position: 'relative', minHeight: 260 }}>
                  <div id="qr-reader" style={{ width: '100%' }} />
                  {(!camOn || !camActive) && !camError && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      {camOn ? (
                        <>
                          <Loader2 size={28} color="rgba(255,255,255,0.5)" style={{ animation: 'spin 0.8s linear infinite' }} />
                          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>Memulai kamera...</p>
                        </>
                      ) : (
                        <>
                          <Camera size={36} color="rgba(255,255,255,0.2)" />
                          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Tekan "Nyalakan" untuk membuka kamera</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {camError && (
                  <div style={{ marginTop: 14, padding: '14px 16px', background: '#fff1f2', borderRadius: 12, border: '1px solid #fecdd3' }}>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: '#dc2626', fontWeight: 600 }}>{camError}</p>
                    <button onClick={() => { setCamError(''); setCamOn(true); }}
                      style={{ padding: '8px 16px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <OtpInput onVerify={verify} loading={loading} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EPassScanner;
