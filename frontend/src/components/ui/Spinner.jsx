import React from 'react';

export const Spinner = ({ size = 'md', color = 'crimson', text = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colors = {
    crimson: 'border-crimson-200 border-t-crimson-800',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-200 border-t-slate-700',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size] || sizes.md} ${colors[color] || colors.crimson} rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default Spinner;
