import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants';

const UploadArea = ({ onFileSelect, currentFile = null, error = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Format file tidak diizinkan. Gunakan PDF, JPG, atau PNG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Ukuran file melebihi batas (max ${MAX_FILE_SIZE / (1024 * 1024)}MB).`;
    }
    return null;
  };

  const handleFile = (file) => {
    const err = validateFile(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError('');
    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    onFileSelect(null);
    setLocalError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayError = error || localError;

  return (
    <div className="space-y-2">
      {currentFile ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
          <FileText className="w-6 h-6 text-[#1e3a8a]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {currentFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {(currentFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-red-100 rounded-lg transition"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed
            cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-[#1e3a8a] bg-blue-100'
              : 'border-[#bfdbfe] bg-[#dbeafe] hover:border-[#1e3a8a] hover:bg-blue-100'
            }
          `}
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm font-semibold text-[#1e3a8a]">
            Klik untuk mengunggah dokumen
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Format PDF, JPG, PNG - Maks 5 Mb
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleChange}
        className="hidden"
      />

      {displayError && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          {displayError}
        </div>
      )}
    </div>
  );
};

export default UploadArea;
