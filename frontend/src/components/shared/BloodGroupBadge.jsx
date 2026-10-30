import React from 'react';
import { getBloodGroupColor } from '../../utils/formatters';

export const BloodGroupBadge = ({ bloodGroup, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-extrabold tracking-wide',
    lg: 'text-sm px-3.5 py-1.5 font-black tracking-wider',
    xl: 'text-lg px-4 py-2 font-black tracking-widest',
  };

  const colorClass = getBloodGroupColor(bloodGroup);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border shadow-2xs font-heading ${colorClass} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <span className="text-crimson-600 mr-1 text-[10px]">🩸</span>
      {bloodGroup || 'N/A'}
    </span>
  );
};

export default BloodGroupBadge;
