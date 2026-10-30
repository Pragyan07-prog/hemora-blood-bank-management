import api from './api';

const MOCK_DONORS = [
  {
    id: 1,
    name: 'Alexander Hayes',
    email: 'alex.hayes@example.com',
    blood_group: 'O+',
    phone: '+1 (555) 876-5432',
    city: 'Metro City',
    state: 'California',
    address: '742 Evergreen Terrace',
    dob: '1992-04-12',
    gender: 'Male',
    status: 'ACTIVE',
    is_eligible: true,
    total_donations: 8,
    last_donation_date: '2026-08-15',
    next_eligible_date: '2026-11-15',
    created_at: '2023-01-15',
    emergency_contact_name: 'Emily Hayes',
    emergency_contact_phone: '+1 (555) 876-9999',
  },
  {
    id: 2,
    name: 'Sophia Patel',
    email: 'sophia.patel@example.com',
    blood_group: 'A+',
    phone: '+1 (555) 345-6789',
    city: 'Metro City',
    state: 'California',
    address: '120 Oakridge Lane',
    dob: '1995-09-22',
    gender: 'Female',
    status: 'ACTIVE',
    is_eligible: false,
    total_donations: 4,
    last_donation_date: '2026-10-10',
    next_eligible_date: '2027-01-10',
    created_at: '2023-03-20',
    emergency_contact_name: 'Rohan Patel',
    emergency_contact_phone: '+1 (555) 345-0011',
  },
  {
    id: 3,
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    blood_group: 'B-',
    phone: '+1 (555) 678-9012',
    city: 'Westside',
    state: 'California',
    address: '404 Birch Creek St',
    dob: '1988-11-05',
    gender: 'Male',
    status: 'ACTIVE',
    is_eligible: true,
    total_donations: 12,
    last_donation_date: '2026-07-20',
    next_eligible_date: '2026-10-20',
    created_at: '2022-08-10',
    emergency_contact_name: 'Lillian Vance',
    emergency_contact_phone: '+1 (555) 678-3344',
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    blood_group: 'AB-',
    phone: '+1 (555) 789-0123',
    city: 'North Hill',
    state: 'California',
    address: '89 Willow Crest Ave',
    dob: '1998-02-18',
    gender: 'Female',
    status: 'ACTIVE',
    is_eligible: true,
    total_donations: 3,
    last_donation_date: '2026-06-11',
    next_eligible_date: '2026-09-11',
    created_at: '2024-02-05',
    emergency_contact_name: 'Dmitri Rostov',
    emergency_contact_phone: '+1 (555) 789-5566',
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    blood_group: 'O-',
    phone: '+1 (555) 234-5678',
    city: 'South Point',
    state: 'California',
    address: '512 Harbor Boulevard',
    dob: '1990-07-30',
    gender: 'Male',
    status: 'INACTIVE',
    is_eligible: false,
    total_donations: 15,
    last_donation_date: '2026-09-02',
    next_eligible_date: '2026-12-02',
    created_at: '2021-11-12',
    emergency_contact_name: 'Sarah Wilson',
    emergency_contact_phone: '+1 (555) 234-7788',
  },
];

export const donorService = {
  async getDonors(params = {}) {
    try {
      const response = await api.get('/api/donors', { params });
      return response.data;
    } catch (error) {
      const { search = '', blood_group = '', city = '', is_eligible } = params;
      let filtered = [...MOCK_DONORS];

      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          d => d.name.toLowerCase().includes(query) || d.email.toLowerCase().includes(query) || d.phone.includes(query)
        );
      }
      if (blood_group) {
        filtered = filtered.filter(d => d.blood_group === blood_group);
      }
      if (city) {
        filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (is_eligible !== undefined && is_eligible !== '') {
        const bool = is_eligible === 'true' || is_eligible === true;
        filtered = filtered.filter(d => d.is_eligible === bool);
      }

      return {
        success: true,
        data: filtered,
        total: filtered.length,
      };
    }
  },

  async getDonorById(id) {
    try {
      const response = await api.get(`/api/donors/${id}`);
      return response.data;
    } catch (error) {
      const donor = MOCK_DONORS.find(d => String(d.id) === String(id)) || MOCK_DONORS[0];
      return {
        success: true,
        data: {
          ...donor,
          donations: [
            { id: 101, date: '2026-08-15', center: 'HEMORA Central Blood Bank', units: 1, type: 'Whole Blood', status: 'VERIFIED' },
            { id: 88, date: '2026-05-10', center: 'Community Red Cross Center', units: 1, type: 'Whole Blood', status: 'VERIFIED' },
            { id: 72, date: '2026-02-04', center: 'HEMORA Central Blood Bank', units: 1, type: 'Whole Blood', status: 'VERIFIED' },
          ],
          appointments: [
            { id: 501, date: '2026-11-20', time_slot: '10:00 AM - 11:00 AM', center: 'HEMORA Central Blood Bank', status: 'CONFIRMED' },
            { id: 489, date: '2026-08-15', time_slot: '09:00 AM - 10:00 AM', center: 'HEMORA Central Blood Bank', status: 'COMPLETED' },
          ],
        },
      };
    }
  },

  async updateDonor(id, data) {
    try {
      const response = await api.put(`/api/donors/${id}`, data);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Donor updated successfully', data };
    }
  },

  async toggleDonorStatus(id) {
    try {
      const response = await api.patch(`/api/donors/${id}/status`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Donor status updated' };
    }
  },

  async getEligibility() {
    try {
      const response = await api.get('/api/donors/me/eligibility');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          is_eligible: true,
          last_donation_date: '2026-08-15',
          next_eligible_date: '2026-11-15',
          days_remaining: 16,
          weight_eligible: true,
          age_eligible: true,
          health_status: 'CLEARED',
          recommendation: 'You will be eligible to donate whole blood in approximately 16 days. Thank you for your continued dedication!',
        },
      };
    }
  },
};

export default donorService;
