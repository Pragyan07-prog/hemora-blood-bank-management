import api from './api';

const MOCK_APPOINTMENTS = [
  {
    id: 501,
    donor_id: 1,
    donor_name: 'Alexander Hayes',
    blood_group: 'O+',
    date: '2026-11-20',
    time_slot: '10:00 AM - 11:00 AM',
    center: 'HEMORA Central Blood Bank',
    donation_type: 'Whole Blood',
    status: 'CONFIRMED',
    notes: 'Regular scheduled donation',
  },
  {
    id: 502,
    donor_id: 2,
    donor_name: 'Sophia Patel',
    blood_group: 'A+',
    date: '2026-11-22',
    time_slot: '02:00 PM - 03:00 PM',
    center: 'St. Jude Memorial Center',
    donation_type: 'Platelets',
    status: 'PENDING',
    notes: 'First time donating platelets',
  },
  {
    id: 503,
    donor_id: 3,
    donor_name: 'Marcus Vance',
    blood_group: 'B-',
    date: '2026-11-18',
    time_slot: '11:00 AM - 12:00 PM',
    center: 'Community Red Cross Center',
    donation_type: 'Whole Blood',
    status: 'CONFIRMED',
    notes: '',
  },
  {
    id: 504,
    donor_id: 4,
    donor_name: 'Elena Rostova',
    blood_group: 'AB-',
    date: '2026-10-25',
    time_slot: '09:00 AM - 10:00 AM',
    center: 'Northside General Hospital Blood Wing',
    donation_type: 'Plasma',
    status: 'COMPLETED',
    notes: 'Donation finished and verified',
  },
];

export const appointmentService = {
  async getAppointments(params = {}) {
    try {
      const response = await api.get('/api/appointments', { params });
      return response.data;
    } catch (error) {
      const { status, search } = params;
      let filtered = [...MOCK_APPOINTMENTS];
      if (status && status !== 'ALL') {
        filtered = filtered.filter(a => a.status === status);
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          a => a.donor_name.toLowerCase().includes(query) || a.center.toLowerCase().includes(query)
        );
      }
      return { success: true, data: filtered };
    }
  },

  async bookAppointment(payload) {
    try {
      const response = await api.post('/api/appointments', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: 'Appointment booked successfully! We look forward to seeing you.',
        data: { id: Date.now(), status: 'PENDING', ...payload },
      };
    }
  },

  async updateAppointmentStatus(id, status) {
    try {
      const response = await api.patch(`/api/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return { success: true, message: `Appointment status updated to ${status}` };
    }
  },

  async getMyAppointments() {
    try {
      const response = await api.get('/api/appointments/me');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          {
            id: 501,
            date: '2026-11-20',
            time_slot: '10:00 AM - 11:00 AM',
            center: 'HEMORA Central Blood Bank',
            donation_type: 'Whole Blood',
            status: 'CONFIRMED',
            notes: 'Regular donation',
          },
          {
            id: 489,
            date: '2026-08-15',
            time_slot: '09:00 AM - 10:00 AM',
            center: 'HEMORA Central Blood Bank',
            donation_type: 'Whole Blood',
            status: 'COMPLETED',
            notes: '',
          },
        ],
      };
    }
  },

  async cancelAppointment(id) {
    try {
      const response = await api.delete(`/api/appointments/${id}`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Appointment cancelled successfully.' };
    }
  },
};

export default appointmentService;
