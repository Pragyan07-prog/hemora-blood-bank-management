import React from 'react';
import { getStatusColor, getUrgencyColor } from '../../utils/formatters';

export const StatusBadge = ({ status, type = 'status', className = '' }) => {
  if (!status) return null;

  const colorClass = type === 'urgency' ? getUrgencyColor(status) : getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 mr-1.5" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
