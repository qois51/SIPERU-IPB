import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ErrorAlert = ({ message, onClose = null }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="p-0.5 hover:bg-red-100 rounded">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
