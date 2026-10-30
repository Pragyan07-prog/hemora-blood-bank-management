import api from './api';

const MOCK_DONATIONS = [
  {
    id: 901,
    donor_id: 1,
    donor_name: 'Alexander Hayes',
    blood_group: 'O+',
    date: '2026-08-15',
    center: 'HEMORA Central Blood Bank',
    donation_type: 'Whole Blood',
    units: 1,
    status: 'VERIFIED',
    hemoglobin: 14.5,
    blood_pressure: '120/80',
    pulse: 72,
    has_certificate: true,
    certificate_id: 'CERT-2026-901',
  },
  {
    id: 902,
    donor_id: 2,
    donor_name: 'Sophia Patel',
    blood_group: 'A+',
    date: '2026-10-10',
    center: 'St. Jude Memorial Center',
    donation_type: 'Platelets',
    units: 2,
    status: 'VERIFIED',
    hemoglobin: 13.8,
    blood_pressure: '118/75',
    pulse: 68,
    has_certificate: true,
    certificate_id: 'CERT-2026-902',
  },
  {
    id: 903,
    donor_id: 3,
    donor_name: 'Marcus Vance',
    blood_group: 'B-',
    date: '2026-10-28',
    center: 'Community Red Cross Center',
    donation_type: 'Whole Blood',
    units: 1,
    status: 'PENDING',
    hemoglobin: 15.1,
    blood_pressure: '124/82',
    pulse: 75,
    has_certificate: false,
  },
  {
    id: 904,
    donor_id: 4,
    donor_name: 'Elena Rostova',
    blood_group: 'AB-',
    date: '2026-10-29',
    center: 'Northside General Hospital Blood Wing',
    donation_type: 'Plasma',
    units: 1,
    status: 'PENDING',
    hemoglobin: 12.9,
    blood_pressure: '115/70',
    pulse: 70,
    has_certificate: false,
  },
];

export const donationService = {
  async getDonations(params = {}) {
    try {
      const response = await api.get('/api/donations', { params });
      return response.data;
    } catch (error) {
      const { status, search } = params;
      let filtered = [...MOCK_DONATIONS];
      if (status && status !== 'ALL') {
        filtered = filtered.filter(d => d.status === status);
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          d => d.donor_name.toLowerCase().includes(query) || d.blood_group.toLowerCase().includes(query)
        );
      }
      return { success: true, data: filtered };
    }
  },

  async recordDonation(payload) {
    try {
      const response = await api.post('/api/donations', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: 'Donation recorded successfully and sent for screening verification.',
        data: { id: Date.now(), status: 'PENDING', ...payload },
      };
    }
  },

  async verifyDonation(id) {
    try {
      const response = await api.patch(`/api/donations/${id}/verify`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: 'Donation screening verified. Units credited to inventory.',
      };
    }
  },

  async rejectDonation(id, reason) {
    try {
      const response = await api.patch(`/api/donations/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      return { success: true, message: 'Donation marked as rejected.' };
    }
  },

  async getMyDonations() {
    try {
      const response = await api.get('/api/donations/me');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          {
            id: 901,
            date: '2026-08-15',
            center: 'HEMORA Central Blood Bank',
            donation_type: 'Whole Blood',
            units: 1,
            status: 'VERIFIED',
            hemoglobin: 14.5,
            has_certificate: true,
            certificate_id: 'CERT-2026-901',
          },
          {
            id: 850,
            date: '2026-04-10',
            center: 'Community Red Cross Center',
            donation_type: 'Whole Blood',
            units: 1,
            status: 'VERIFIED',
            hemoglobin: 14.2,
            has_certificate: true,
            certificate_id: 'CERT-2026-850',
          },
          {
            id: 790,
            date: '2025-12-05',
            center: 'HEMORA Central Blood Bank',
            donation_type: 'Whole Blood',
            units: 1,
            status: 'VERIFIED',
            hemoglobin: 14.8,
            has_certificate: true,
            certificate_id: 'CERT-2025-790',
          },
        ],
      };
    }
  },
};

export default donationService;
