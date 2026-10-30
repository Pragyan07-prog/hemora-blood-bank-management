import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    crimson: 'bg-crimson-100 text-crimson-900 border-crimson-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const dotColors = {
    default: 'bg-slate-500',
    crimson: 'bg-crimson-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-rose-600',
    info: 'bg-blue-600',
    purple: 'bg-purple-600',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
};

export default Badge;
