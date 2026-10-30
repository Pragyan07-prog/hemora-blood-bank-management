import React from 'react';
import Spinner from './Spinner';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-crimson-900 hover:bg-crimson-800 text-white shadow-sm hover:shadow-md focus:ring-crimson-700',
    secondary: 'bg-white border border-slate-200 hover:border-crimson-300 hover:bg-crimson-50/40 text-slate-700 focus:ring-crimson-200 shadow-sm',
    danger: 'bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm hover:shadow-md focus:ring-crimson-500',
    outline: 'border border-crimson-800 text-crimson-800 hover:bg-crimson-50 focus:ring-crimson-300',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    soft: 'bg-crimson-100 text-crimson-900 hover:bg-crimson-200 focus:ring-crimson-300',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' ? 'slate' : 'white'} />
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
