import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({
  label,
  name,
  options = [],
  placeholder = '--Pilih--',
  error = '',
  icon: Icon = null,
  register = null,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectProps = register ? register(name) : { name };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <select
          id={name}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-gray-800
            transition-all duration-200 outline-none appearance-none
            focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]
            disabled:bg-gray-50 disabled:text-gray-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400' : 'border-gray-200'}
          `}
          {...selectProps}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Select;
