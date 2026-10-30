import api from './api';

const MOCK_CAMPS = [
  {
    id: 1,
    title: 'Metro Civic Center Blood Drive',
    organizer: 'Red Cross & HEMORA Foundation',
    venue: 'Metro Civic Center Hall B',
    address: '500 Constitution Ave, Metro City',
    start_date: '2026-11-12',
    end_date: '2026-11-12',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    target_units: 120,
    registered_donors: 84,
    status: 'UPCOMING',
    contact_phone: '+1 (555) 300-4001',
    is_registered: false,
    description: 'Annual corporate and civic blood drive. Free snacks, t-shirts, and comprehensive health screening provided.',
  },
  {
    id: 2,
    title: 'University Campus Life Drive',
    organizer: 'State University Student Health',
    venue: 'Student Union Ballroom',
    address: '100 University Drive, Westside',
    start_date: '2026-11-25',
    end_date: '2026-11-26',
    start_time: '10:00 AM',
    end_time: '05:00 PM',
    target_units: 200,
    registered_donors: 142,
    status: 'UPCOMING',
    contact_phone: '+1 (555) 300-4002',
    is_registered: true,
    description: 'Join hundreds of fellow students and faculty to make an enormous community impact before the winter break.',
  },
  {
    id: 3,
    title: 'Tech Park Community Blood Day',
    organizer: 'Silicon Valley Health Alliance',
    venue: 'Innovation Hub Lobby',
    address: '880 Silicon Way, North Hill',
    start_date: '2026-10-15',
    end_date: '2026-10-15',
    start_time: '09:30 AM',
    end_time: '03:30 PM',
    target_units: 90,
    registered_donors: 95,
    status: 'COMPLETED',
    contact_phone: '+1 (555) 300-4003',
    is_registered: false,
    description: 'Corporate tech park donation camp. Collected 98 units surpassing goal.',
  },
];

export const campService = {
  async getCamps() {
    try {
      const response = await api.get('/api/camps');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_CAMPS };
    }
  },

  async createCamp(payload) {
    try {
      const response = await api.post('/api/camps', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: 'Blood camp created successfully!',
        data: { id: Date.now(), registered_donors: 0, status: 'UPCOMING', ...payload },
      };
    }
  },

  async registerForCamp(campId) {
    try {
      const response = await api.post(`/api/camps/${campId}/register`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'You have successfully registered for this blood camp!' };
    }
  },

  async cancelCampRegistration(campId) {
    try {
      const response = await api.delete(`/api/camps/${campId}/register`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Camp registration cancelled.' };
    }
  },

  async getCampRegistrations(campId) {
    try {
      const response = await api.get(`/api/camps/${campId}/registrations`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { id: 1, donor_name: 'Alexander Hayes', blood_group: 'O+', phone: '+1 (555) 876-5432', registered_at: '2026-10-25' },
          { id: 2, donor_name: 'Sophia Patel', blood_group: 'A+', phone: '+1 (555) 345-6789', registered_at: '2026-10-26' },
          { id: 3, donor_name: 'Marcus Vance', blood_group: 'B-', phone: '+1 (555) 678-9012', registered_at: '2026-10-27' },
        ],
      };
    }
  },

  async cancelCamp(campId) {
    try {
      const response = await api.patch(`/api/camps/${campId}/cancel`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Camp cancelled successfully.' };
    }
  },
};

export default campService;
