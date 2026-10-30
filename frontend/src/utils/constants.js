export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

export const BLOOD_COMPATIBILITY = {
  'A+': {
    give: ['A+', 'AB+'],
    receive: ['A+', 'A-', 'O+', 'O-'],
  },
  'A-': {
    give: ['A+', 'A-', 'AB+', 'AB-'],
    receive: ['A-', 'O-'],
  },
  'B+': {
    give: ['B+', 'AB+'],
    receive: ['B+', 'B-', 'O+', 'O-'],
  },
  'B-': {
    give: ['B+', 'B-', 'AB+', 'AB-'],
    receive: ['B-', 'O-'],
  },
  'AB+': {
    give: ['AB+'],
    receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  },
  'AB-': {
    give: ['AB+', 'AB-'],
    receive: ['AB-', 'A-', 'B-', 'O-'],
  },
  'O+': {
    give: ['O+', 'A+', 'B+', 'AB+'],
    receive: ['O+', 'O-'],
  },
  'O-': {
    give: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Donor
    receive: ['O-'],
  },
};

export const DONATION_TYPES = [
  'Whole Blood',
  'Platelets',
  'Plasma',
  'Red Blood Cells',
];

export const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

export const DONATION_CENTERS = [
  { id: 1, name: 'HEMORA Central Blood Bank', city: 'Metro City', address: '100 Medical Center Blvd, Suite 101' },
  { id: 2, name: 'St. Jude Memorial Center', city: 'Metro City', address: '45 Health Way, Floor 2' },
  { id: 3, name: 'Community Red Cross Center', city: 'Westside', address: '88 River Street' },
  { id: 4, name: 'Northside General Hospital Blood Wing', city: 'North Hill', address: '220 Hospital Road' },
  { id: 5, name: 'Apex Civic Blood Donation Center', city: 'South Point', address: '14 Civic Plaza' },
];

export const REQUEST_URGENCY = {
  NORMAL: 'NORMAL',
  URGENT: 'URGENT',
  CRITICAL: 'CRITICAL',
};

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  MISSED: 'MISSED',
};

export const DONATION_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DONOR: 'DONOR',
  STAFF: 'STAFF',
};
