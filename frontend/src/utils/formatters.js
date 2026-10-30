import { format, parseISO, isValid } from 'date-fns';

export const formatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, formatStr) : 'Invalid Date';
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString) => {
  return formatDate(dateString, 'MMM dd, yyyy hh:mm a');
};

export const formatTime = (dateString) => {
  return formatDate(dateString, 'hh:mm a');
};

export const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '';
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumberString;
};

export const getBloodGroupColor = (group) => {
  const colors = {
    'A+': 'bg-crimson-100 text-crimson-800 border-crimson-200',
    'A-': 'bg-rose-100 text-rose-800 border-rose-200',
    'B+': 'bg-blue-100 text-blue-800 border-blue-200',
    'B-': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'AB+': 'bg-purple-100 text-purple-800 border-purple-200',
    'AB-': 'bg-violet-100 text-violet-800 border-violet-200',
    'O+': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'O-': 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return colors[group] || 'bg-slate-100 text-slate-800 border-slate-200';
};

export const getUrgencyColor = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'URGENT':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'NORMAL':
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'VERIFIED':
    case 'APPROVED':
    case 'FULFILLED':
    case 'COMPLETED':
    case 'ACTIVE':
    case 'ELIGIBLE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'PENDING':
    case 'UPCOMING':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'REJECTED':
    case 'CANCELLED':
    case 'MISSED':
    case 'INACTIVE':
    case 'NOT_ELIGIBLE':
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
