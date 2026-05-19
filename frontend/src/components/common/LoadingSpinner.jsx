import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Memuat...', fullScreen = false }) => {
  // Map old string sizes to numbers so Lucide doesn't render an infinitely large SVG
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const numSize = typeof size === 'string' ? (sizeMap[size] || 24) : size;

  const spinKeyframes = `
    @keyframes lucide-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    }}>
      <style>{spinKeyframes}</style>
      <div style={{ 
        color: '#1e3a8a', /* IPB Navy Blue */
        animation: 'lucide-spin 0.8s linear infinite',
        display: 'flex'
      }}>
        <Loader2 size={numSize} strokeWidth={2.5} />
      </div>
      
      {text && (
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#6b7280', /* Gray 500 */
          margin: 0,
          letterSpacing: '0.02em'
        }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(3px)'
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '160px',
      padding: '32px 0'
    }}>
      {content}
    </div>
  );
};

export default LoadingSpinner;
