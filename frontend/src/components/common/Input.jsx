import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  error = '',
  icon: Icon = null,
  register = null,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputProps = register ? register(name) : { name };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border bg-white text-gray-800
            transition-all duration-200 outline-none
            focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a]
            disabled:bg-gray-50 disabled:text-gray-400
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'}
          `}
          {...inputProps}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
