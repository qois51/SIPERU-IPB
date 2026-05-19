import React from 'react';
import { getStatusConfig } from '../../utils/formatStatus';

const BookingStatusBadge = ({ status, size = 'md' }) => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        ${sizeClasses[size] || sizeClasses.md}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      {config.labelID}
    </span>
  );
};

export default BookingStatusBadge;
