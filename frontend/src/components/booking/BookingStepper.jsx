import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Pilih Ruangan' },
  { number: 2, label: 'Form Booking' },
  { number: 3, label: 'Upload Dokumen' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Menunggu Approval' },
];

const BookingStepper = ({ currentStep = 2, steps = STEPS }) => {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '24px 32px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Step Item */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                {/* Circle */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  border: '2px solid',
                  borderColor: isUpcoming ? '#d1d5db' : '#1e3a8a',
                  background: isCompleted || isCurrent ? '#1e3a8a' : 'white',
                  color: isCompleted || isCurrent ? 'white' : '#9ca3af',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}>
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : step.number}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  fontWeight: isCurrent || isCompleted ? 600 : 400,
                  color: isCurrent || isCompleted ? '#1e3a8a' : '#9ca3af',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: step.number < currentStep ? '#1e3a8a' : '#e5e7eb',
                  margin: '0 4px',
                  marginBottom: '20px',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStepper;
