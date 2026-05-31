import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, BookOpen, Upload, FileText, X, ArrowLeft, ChevronDown, MapPin, Clock, Users, Tag, ChevronRight, AlertCircle, Mail, Phone } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import bookingService from '../../services/bookingService';
import { JENIS_KEGIATAN, FACILITY_OPTIONS } from '../../utils/constants';
import api from '../../services/api';

const bookingSchema = yup.object({
  nama_peminjam: yup.string().required('Nama lengkapnya belum diisi ya.'),
  nim_nip: yup.string().required('NIM/NIP jangan sampai kosong.'),
  program_studi: yup.string().required('Program studi/Unit belum diisi.'),
  email: yup.string()
    .email('Format emailnya kurang tepat.')
    .matches(/@apps\.ipb\.ac\.id$/, 'Harap gunakan email @apps.ipb.ac.id ya!')
    .required('Email wajib diisi untuk pemberitahuan.'),
  nomor_hp: yup.string()
    .matches(/^08[0-9]+$/, "Nomor HP harus diawali '08' dan hanya angka.")
    .min(10, 'Nomor HP minimal 10 digit.')
    .required('Nomor HP wajib diisi agar bisa dihubungi.'),
  activity_name: yup.string()
    .min(3, 'Nama kegiatan terlalu singkat (minimal 3 huruf).')
    .required('Nama kegiatan wajib diisi.'),
  jenis_kegiatan: yup.string().required('Pilih salah satu jenis kegiatan dulu.'),
  deskripsi_kegiatan: yup.string().required('Tolong jelaskan secara singkat kegiatanmu.'),
});

/* ── Inline form field components ── */
const Field = ({ label, children, error }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</label>
    )}
    {children}
    {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{error}</p>}
  </div>
);

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
  border: `1px solid ${hasError ? '#f87171' : '#d1d5db'}`,
  borderRadius: '8px',
  fontSize: '14px',
  color: '#1f2937',
  background: 'white',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border 0.15s',
});

const SectionHeader = ({ icon: Icon, title }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#dbeafe',
    color: '#1e40af',
    padding: '11px 16px',
    borderRadius: '8px',
    marginBottom: '4px',
  }}>
    <Icon size={17} />
    <span style={{ fontSize: '14px', fontWeight: 700 }}>{title}</span>
  </div>
);

/* ── Stepper ── */
const STEPS = ['Pilih Ruangan', 'Form Booking', 'Upload Dokumen', 'Review', 'Menunggu Approval'];
const Stepper = ({ current }) => (
  <div style={{
    background: 'white',
    borderRadius: '14px',
    padding: '20px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    marginBottom: '28px',
  }}>
    {STEPS.map((step, i) => {
      const num = i + 1;
      const done = num < current;
      const active = num === current;
      return (
        <React.Fragment key={num}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px',
              background: done ? '#1e3a8a' : active ? '#1e3a8a' : '#f3f4f6',
              color: done || active ? 'white' : '#9ca3af',
              border: active ? '3px solid #1e3a8a' : 'none',
              boxShadow: active ? '0 0 0 4px rgba(30,58,138,0.15)' : 'none',
              transition: 'all 0.2s',
            }}>
              {done ? '✓' : num}
            </div>
            <span style={{
              fontSize: '11px', fontWeight: active ? 700 : 500,
              color: active ? '#1e3a8a' : done ? '#374151' : '#9ca3af',
              textAlign: 'center', lineHeight: 1.3,
            }}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: '2px', background: done ? '#1e3a8a' : '#e5e7eb',
              margin: '-14px 6px 0', transition: 'background 0.2s',
            }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Main Component ── */
const BookingForm = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const showPopUpError = (msg) => {
    setModalErrorMessage(msg);
    setShowErrorModal(true);
  };

  const onInvalid = (errors) => {
    const messages = Object.values(errors).map(err => err.message);
    if (messages.length > 0) {
      showPopUpError("Beberapa informasi wajib belum terisi atau tidak sesuai:\n\n" + messages.map(m => `• ${m}`).join('\n'));
    }
  };

  const selectedDate = searchParams.get('date') || '';
  const startTime = searchParams.get('start') || '';
  const endTime = searchParams.get('end') || '';

  const { register, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      nama_peminjam: '', nim_nip: '', program_studi: '',
      email: '', nomor_hp: '', activity_name: '',
      jenis_kegiatan: '', deskripsi_kegiatan: '',
    },
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data?.data || res.data);
      } catch {
        setError('Gagal memuat data ruangan.');
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${editId}`);
          const b = res.data?.data || res.data;
          if (b) {
            setValue('nama_peminjam', b.nama_peminjam || '');
            setValue('nim_nip', b.nim_nip || '');
            setValue('program_studi', b.program_studi || '');
            setValue('email', b.email || '');
            setValue('nomor_hp', b.nomor_hp || '');
            setValue('activity_name', b.activity_name || '');
            setValue('jenis_kegiatan', b.jenis_kegiatan || '');
            setValue('deskripsi_kegiatan', b.deskripsi_kegiatan || '');
            if (b.facilities) setSelectedFacilities(b.facilities);
          }
        } catch (err) {
          console.error('Gagal memuat data draft', err);
        }
      };
      fetchBooking();
    }
  }, [searchParams, setValue]);

  const toggleFacility = (f) =>
    setSelectedFacilities(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );

  const buildPayload = (formData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      ...formData,
      organization: formData.program_studi || '-',
      purpose: formData.deskripsi_kegiatan,
      room_id: parseInt(roomId),
      user_id: user.id,
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      facilities: selectedFacilities,
    };
  };

  const onSubmit = async (formData) => {
    if (!selectedDate) { showPopUpError('Tanggal booking belum dipilih. Harap tentukan tanggalnya terlebih dahulu.'); return; }
    if (!startTime || !endTime) { showPopUpError('Waktu/Jam booking belum dipilih. Harap tentukan jam pemakaian terlebih dahulu.'); return; }
    if (!uploadFile) { showPopUpError('Dokumen Surat Izin/Surat Pengantar wajib diunggah untuk mengajukan permohonan.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const editId = searchParams.get('edit');
      const payload = buildPayload(formData);
      // When submitting for real, always set status to Pending
      payload.status = 'Pending';
      
      let res;
      if (editId) {
        res = await bookingService.updateBooking(editId, payload);
      } else {
        res = await bookingService.createBooking(payload);
      }
      
      const bookingId = res.data?.id || res.id;
      if (uploadFile && bookingId) await bookingService.uploadDocument(bookingId, uploadFile);
      navigate(`/booking/${bookingId}/success`);
    } catch (err) {
      showPopUpError(err.message || 'Gagal memproses peminjaman ruangan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = getValues();
    if (!formData.activity_name) { showPopUpError('Harap isi Nama Kegiatan terlebih dahulu untuk menyimpan draft.'); return; }
    if (!selectedDate || !startTime || !endTime) { showPopUpError('Tanggal & jam booking wajib dipilih sebelum menyimpan draft.'); return; }
    setSavingDraft(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const editId = searchParams.get('edit');
      const payload = {
        ...formData,
        organization: formData.program_studi || '-',
        purpose: formData.deskripsi_kegiatan || 'Draft',
        participants: 1,
        room_id: parseInt(roomId), 
        user_id: user.id,
        date: selectedDate, 
        start_time: startTime, 
        end_time: endTime,
        facilities: selectedFacilities,
        status: 'Draft'
      };

      if (editId) {
        await bookingService.updateBooking(editId, payload);
      } else {
        await bookingService.createBooking(payload);
      }
      navigate('/dashboard');
    } catch (err) {
      showPopUpError(err.message || 'Gagal menyimpan draft peminjaman.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    const allowed = ['application/pdf'];
    if (!allowed.includes(file.type)) { setError('Format file tidak didukung. Harap gunakan format PDF.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran file melebihi batas maksimal 5MB.'); return; }
    setUploadFile(file);
    setError('');
  };

  const formatTime = (t) => {
    if (!t || t.includes('NaN') || t === 'undefined') return '';
    return String(t).substring(0, 5).replace(':', '.');
  };

  const imageUrl = room?.image_url
    ? (Array.isArray(room.image_url) ? room.image_url[0] : room.image_url)
    : 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&auto=format&fit=crop';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ flexGrow: 1 }}><LoadingSpinner text="Memuat formulir peminjaman..." /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <div style={{ flexGrow: 1, padding: '32px 0 56px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280', marginBottom: '20px', fontWeight: 500 }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#1e3a8a'} onMouseOut={e => e.currentTarget.style.color = '#6b7280'} onClick={() => navigate(`/katalog/${roomId}`)}>
              Detail Katalog
            </span>
            <ChevronRight size={14} color="#9ca3af" />
            <span style={{ color: '#1e3a8a', fontWeight: 600 }}>Form Reservasi</span>
          </div>

          {/* Stepper */}
          <Stepper current={2} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

            {/* ═══ MAIN FORM ═══ */}
            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
              <div style={{
                background: 'white', borderRadius: '16px',
                padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                border: '1px solid #e5e7eb',
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                  Form Reservasi Ruangan
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
                  Lengkapi semua data berikut dengan benar. Data ini akan digunakan dalam proses verifikasi.
                </p>

                {error && (
                  <div style={{
                    background: '#ef4444', color: 'white', padding: '16px', borderRadius: '8px',
                    marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px',
                    fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
                  }}>
                    <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{error}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  {/* ── Data Peminjam ── */}
                  <SectionHeader icon={User} title="Data Peminjam" />

                  <Field label="Nama Peminjam" error={errors.nama_peminjam?.message}>
                    <input {...register('nama_peminjam')} placeholder="Nama Lengkap Sesuai KTM" style={inputStyle(errors.nama_peminjam)} />
                  </Field>
                  <Field label="NIM/NIP" error={errors.nim_nip?.message}>
                    <input {...register('nim_nip')} placeholder="Nomor Induk Mahasiswa/Nomor Induk Pegawai" style={inputStyle(errors.nim_nip)} />
                  </Field>
                  <Field label="Program Studi/Unit" error={errors.program_studi?.message}>
                    <input {...register('program_studi')} placeholder="Program Studi atau Unit Kerja" style={inputStyle(errors.program_studi)} />
                  </Field>
                  <Field label="Email Aktif" error={errors.email?.message}>
                    <input {...register('email')} type="email" placeholder="domain@apps.ipb.ac.id" style={inputStyle(errors.email)} />
                  </Field>
                  <Field label="Nomor HP Aktif" error={errors.nomor_hp?.message}>
                    <input {...register('nomor_hp')} placeholder="081234567890" style={inputStyle(errors.nomor_hp)} />
                  </Field>

                  {/* ── Data Kegiatan ── */}
                  <SectionHeader icon={BookOpen} title="Data Kegiatan" />

                  <Field label="Nama Kegiatan" error={errors.activity_name?.message}>
                    <input {...register('activity_name')} placeholder="Nama Kegiatan yang akan dilaksanakan" style={inputStyle(errors.activity_name)} />
                  </Field>

                  <Field label="Jenis Kegiatan" error={errors.jenis_kegiatan?.message}>
                    <div style={{ position: 'relative' }}>
                      <select {...register('jenis_kegiatan')}
                        style={{ ...inputStyle(errors.jenis_kegiatan), paddingRight: '40px', appearance: 'none', cursor: 'pointer' }}>
                        <option value="">-- Pilih Jenis Kegiatan --</option>
                        {JENIS_KEGIATAN.map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                      <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                    </div>
                  </Field>

                  <Field label="Deskripsi Kegiatan" error={errors.deskripsi_kegiatan?.message}>
                    <textarea {...register('deskripsi_kegiatan')} rows={4}
                      placeholder="Deskripsi singkat mengenai tujuan dan agenda kegiatan"
                      style={{ ...inputStyle(errors.deskripsi_kegiatan), resize: 'vertical', lineHeight: 1.6 }} />
                  </Field>

                  {/* Kebutuhan Tambahan */}
                  <Field label="Kebutuhan Tambahan">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      {FACILITY_OPTIONS.map(f => (
                        <button key={f} type="button" onClick={() => toggleFacility(f)}
                          style={{
                            padding: '8px 18px', borderRadius: '999px', fontSize: '13px', fontWeight: 500,
                            border: `1px solid ${selectedFacilities.includes(f) ? '#1e3a8a' : '#d1d5db'}`,
                            background: selectedFacilities.includes(f) ? '#1e3a8a' : 'white',
                            color: selectedFacilities.includes(f) ? 'white' : '#374151',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* ── Upload Surat ── */}
                  <SectionHeader icon={Upload} title="Upload Surat Izin/Surat Pengantar" />

                  {uploadFile ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', background: '#eff6ff', borderRadius: '10px',
                      border: '1px solid #bfdbfe',
                    }}>
                      <FileText size={22} color="#1e3a8a" />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {uploadFile.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#6b7280' }}>{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button type="button" onClick={() => setUploadFile(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444' }}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleFileDrop}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', padding: '32px 20px',
                        background: isDragging ? '#dbeafe' : '#eff6ff',
                        border: `2px dashed ${isDragging ? '#1e3a8a' : '#93c5fd'}`,
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                        gap: '8px',
                      }}>
                      <Upload size={28} color={isDragging ? '#1e3a8a' : '#3b82f6'} />
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e3a8a', margin: 0 }}>
                        Klik untuk mengunggah dokumen
                      </p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                        Format PDF – Maks 5 MB
                      </p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf"
                    onChange={(e) => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]); }}
                    style={{ display: 'none' }} />

                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => navigate(-1)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '10px',
                    border: '1px solid #d1d5db', background: 'white',
                    color: '#374151', fontWeight: 600, fontSize: '14px',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  <ArrowLeft size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  Kembali
                </button>

                <button type="button" onClick={handleSaveDraft} disabled={savingDraft}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '10px',
                    border: '1.5px solid #1e3a8a', background: 'white',
                    color: '#1e3a8a', fontWeight: 600, fontSize: '14px',
                    cursor: savingDraft ? 'not-allowed' : 'pointer', opacity: savingDraft ? 0.7 : 1,
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (!savingDraft) e.currentTarget.style.background = '#eff6ff'; }}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}>
                  {savingDraft ? 'Menyimpan...' : 'Simpan Draft'}
                </button>

                <button type="submit" disabled={submitting}
                  style={{
                    flex: 1.5, padding: '14px', borderRadius: '10px',
                    border: 'none', background: submitting ? '#94a3b8' : '#1e3a8a',
                    color: 'white', fontWeight: 700, fontSize: '14px',
                    cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { if (!submitting) e.currentTarget.style.background = '#1e40af'; }}
                  onMouseOut={e => { if (!submitting) e.currentTarget.style.background = '#1e3a8a'; }}>
                  {submitting ? 'Mengajukan...' : 'Ajukan Reservasi'}
                </button>
              </div>
            </form>

            {/* ═══ SIDEBAR ═══ */}
            <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Room Info Card */}
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ padding: '16px 16px 12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', margin: '0 0 12px' }}>Informasi Peminjaman</p>
                  <img
                    src={imageUrl} alt={room?.name || 'Ruangan'}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400&auto=format&fit=crop'}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '10px', display: 'block' }}
                  />
                </div>
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {room && (
                    <>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>Nama Ruangan</p>
                      <p style={{ fontSize: '17px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{room.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px' }}>
                        <MapPin size={13} /> {room.location}
                      </div>
                      {startTime && !startTime.includes('NaN') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>
                          <Clock size={13} /> {formatTime(startTime)} {endTime && !endTime.includes('NaN') ? `– ${formatTime(endTime)}` : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontSize: '13px', fontWeight: 600 }}>
                        <Users size={13} /> Kapasitas: {room.capacity} Orang
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e3a8a', fontSize: '13px', fontWeight: 600 }}>
                        <Tag size={13} /> Harga: {room.price > 0 ? `Rp ${room.price.toLocaleString('id-ID')}` : 'Gratis'}
                      </div>
                    </>
                  )}
                </div>

                {/* PIC Section */}
                {room?.pic_name && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 16px' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 10px' }}>PIC Ruangan</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: '#e0e7ff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#4f46e5', flexShrink: 0,
                      }}><User size={20} /></div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>{room.pic_name}</p>
                        {room.pic_email && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 1px', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {room.pic_email}</p>}
                        {room.pic_phone && <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {room.pic_phone}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Error Modal Popup */}
      {showErrorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, transition: 'all 0.3s ease',
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            maxWidth: '480px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #fee2e2', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px'
            }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
              Form Belum Lengkap
            </h3>
            <div style={{ 
              fontSize: '13px', color: '#4b5563', lineHeight: 1.6, marginBottom: '28px',
              textAlign: 'left', background: '#fef2f2', padding: '16px', borderRadius: '8px',
              border: '1px solid #fecaca', whiteSpace: 'pre-wrap', width: '100%', boxSizing: 'border-box',
              maxHeight: '240px', overflowY: 'auto'
            }}>
              {modalErrorMessage}
            </div>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              style={{
                width: '100%', padding: '12px 24px', background: '#ef4444', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', transition: 'background 0.15s', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#dc2626'}
              onMouseOut={e => e.currentTarget.style.background = '#ef4444'}
            >
              Mengerti & Perbaiki
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
