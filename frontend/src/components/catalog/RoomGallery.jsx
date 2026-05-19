import React, { useState, useEffect } from 'react';
import { ChevronRight, X, ZoomIn } from 'lucide-react';

const RoomGallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fallbackImages = [
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1925&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=2069&auto=format&fit=crop',
  ];

  const displayImages = images.length > 0 ? images : fallbackImages;

  const next = () => setActiveIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));

  const openLightbox = (idx) => {
    setLightboxIndex(idx);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const lightboxNext = () => setLightboxIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1));
  const lightboxPrev = () => setLightboxIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1));

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxNext();
      if (e.key === 'ArrowLeft') lightboxPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, lightboxIndex]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isLightboxOpen]);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Main Image with zoom cursor */}
        <div
          onClick={() => openLightbox(activeIndex)}
          style={{
            width: '100%', height: '420px', borderRadius: '12px',
            overflow: 'hidden', position: 'relative', cursor: 'zoom-in',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <img
            src={displayImages[activeIndex]}
            alt={`Room image ${activeIndex + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
          {/* Zoom hint badge */}
          <div style={{
            position: 'absolute', bottom: '14px', right: '14px',
            background: 'rgba(0,0,0,0.55)', color: 'white',
            padding: '6px 12px', borderRadius: '20px',
            fontSize: '12px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            backdropFilter: 'blur(4px)'
          }}>
            <ZoomIn size={14} /> Klik untuk perbesar
          </div>
        </div>

        {/* Thumbnails Row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', flexGrow: 1 }}>
            {displayImages.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: '120px', height: '88px', borderRadius: '8px',
                  overflow: 'hidden', cursor: 'pointer', flexShrink: 0,
                  border: activeIndex === idx ? '3px solid #1e3a8a' : '2px solid #e2e8f0',
                  transition: 'border-color 0.2s, opacity 0.2s',
                  opacity: activeIndex === idx ? 1 : 0.75
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = 1; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = activeIndex === idx ? 1 : 0.75; }}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          {displayImages.length > 3 && (
            <button
              onClick={next}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#1e3a8a', color: 'white', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* ─── Lightbox Modal ─── */}
      {isLightboxOpen && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: 'none', borderRadius: '50%', width: '44px', height: '44px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)', zIndex: 10000
            }}
          >
            <X size={22} />
          </button>

          {/* Prev arrow */}
          {displayImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              style={{
                position: 'absolute', left: '24px',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: 'none', borderRadius: '50%', width: '48px', height: '48px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)', fontSize: '22px', fontWeight: 'bold'
              }}
            >
              ‹
            </button>
          )}

          {/* Main zoomed image */}
          <img
            src={displayImages[lightboxIndex]}
            alt={`Zoomed image ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '88vh',
              objectFit: 'contain', borderRadius: '12px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              userSelect: 'none'
            }}
          />

          {/* Next arrow */}
          {displayImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              style={{
                position: 'absolute', right: '24px',
                background: 'rgba(255,255,255,0.15)', color: 'white',
                border: 'none', borderRadius: '50%', width: '48px', height: '48px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)', fontSize: '22px', fontWeight: 'bold'
              }}
            >
              ›
            </button>
          )}

          {/* Image counter */}
          <div style={{
            position: 'absolute', bottom: '24px',
            background: 'rgba(255,255,255,0.15)', color: 'white',
            padding: '6px 18px', borderRadius: '20px',
            fontSize: '13px', fontWeight: 700,
            backdropFilter: 'blur(6px)'
          }}>
            {lightboxIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export default RoomGallery;
