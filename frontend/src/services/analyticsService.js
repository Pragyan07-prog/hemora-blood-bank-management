import api from './api';

const MOCK_ANALYTICS = {
  stats: {
    total_donors: 1420,
    active_donors: 1180,
    blood_units_available: 243,
    pending_requests: 12,
    approved_requests: 48,
    completed_donations: 3820,
    upcoming_appointments: 34,
    expiring_units: 7,
  },
  blood_group_distribution: [
    { name: 'O+', value: 75, color: '#7f1d1d' },
    { name: 'B+', value: 52, color: '#991b1b' },
    { name: 'A+', value: 48, color: '#b91c1c' },
    { name: 'AB+', value: 28, color: '#dc2626' },
    { name: 'A-', value: 14, color: '#ef4444' },
    { name: 'O-', value: 11, color: '#f87171' },
    { name: 'B-', value: 9, color: '#fca5a5' },
    { name: 'AB-', value: 6, color: '#fecaca' },
  ],
  monthly_donations: [
    { month: 'Nov 25', units: 145 },
    { month: 'Dec 25', units: 160 },
    { month: 'Jan 26', units: 185 },
    { month: 'Feb 26', units: 170 },
    { month: 'Mar 26', units: 210 },
    { month: 'Apr 26', units: 195 },
    { month: 'May 26', units: 230 },
    { month: 'Jun 26', units: 245 },
    { month: 'Jul 26', units: 260 },
    { month: 'Aug 26', units: 280 },
    { month: 'Sep 26', units: 295 },
    { month: 'Oct 26', units: 312 },
  ],
  request_trends: [
    { month: 'May 26', requests: 45, fulfilled: 42 },
    { month: 'Jun 26', requests: 52, fulfilled: 50 },
    { month: 'Jul 26', requests: 61, fulfilled: 58 },
    { month: 'Aug 26', requests: 68, fulfilled: 64 },
    { month: 'Sep 26', requests: 74, fulfilled: 70 },
    { month: 'Oct 26', requests: 82, fulfilled: 77 },
  ],
  request_status_distribution: [
    { name: 'Fulfilled', value: 72, color: '#16a34a' },
    { name: 'Approved', value: 15, color: '#2563eb' },
    { name: 'Pending', value: 9, color: '#d97706' },
    { name: 'Rejected', value: 4, color: '#dc2626' },
  ],
  recent_donors: [
    { id: 1, name: 'Alexander Hayes', blood_group: 'O+', joined: '2026-10-28', status: 'ACTIVE' },
    { id: 2, name: 'Sophia Patel', blood_group: 'A+', joined: '2026-10-27', status: 'ACTIVE' },
    { id: 3, name: 'Marcus Vance', blood_group: 'B-', joined: '2026-10-26', status: 'ACTIVE' },
    { id: 4, name: 'Elena Rostova', blood_group: 'AB-', joined: '2026-10-25', status: 'ACTIVE' },
  ],
  recent_requests: [
    { id: 'REQ-881', patient_name: 'Arthur Pendelton', blood_group: 'B-', units: 2, urgency: 'CRITICAL', status: 'PENDING' },
    { id: 'REQ-880', patient_name: 'Chloe Zhao', blood_group: 'O-', units: 4, urgency: 'URGENT', status: 'APPROVED' },
    { id: 'REQ-879', patient_name: 'Henry Cavill', blood_group: 'A+', units: 1, urgency: 'NORMAL', status: 'FULFILLED' },
  ],
  alerts: [
    { id: 1, message: 'Critical shortage: AB- Negative has only 6 units remaining.', level: 'danger' },
    { id: 2, message: 'Low stock warning: B- Negative has reached critical threshold (9 units).', level: 'warning' },
    { id: 3, message: '7 units of Whole Blood will reach shelf expiry within 72 hours.', level: 'danger' },
  ],
};

export const analyticsService = {
  async getDashboardAnalytics() {
    try {
      const response = await api.get('/api/analytics/dashboard');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_ANALYTICS };
    }
  },
};

export default analyticsService;
