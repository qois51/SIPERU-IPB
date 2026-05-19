import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#1e3a8a] hover:bg-[#15307a] text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
  success: 'bg-[#009B4D] hover:bg-[#008542] text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'bg-transparent hover:bg-[#1e3a8a]/10 text-[#1e3a8a] border-2 border-[#1e3a8a]',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md active:scale-[0.98]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </button>
  );
};

export default Button;
