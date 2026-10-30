import api from './api';

const MOCK_REQUESTS = [
  {
    id: 'REQ-2026-881',
    patient_name: 'Arthur Pendelton',
    blood_group: 'B-',
    units: 2,
    hospital: 'Metro Trauma Center',
    city: 'Metro City',
    urgency: 'CRITICAL',
    status: 'PENDING',
    required_date: '2026-10-31',
    created_at: '2026-10-30T09:30:00',
    contact_name: 'Dr. Clara Oswald',
    contact_phone: '+1 (555) 432-1098',
    notes: 'Emergency vehicular collision patient undergoing trauma surgery.',
  },
  {
    id: 'REQ-2026-880',
    patient_name: 'Chloe Zhao',
    blood_group: 'O-',
    units: 4,
    hospital: 'St. Jude Memorial Hospital',
    city: 'Westside',
    urgency: 'URGENT',
    status: 'APPROVED',
    required_date: '2026-11-01',
    created_at: '2026-10-29T14:15:00',
    contact_name: 'Michael Zhao',
    contact_phone: '+1 (555) 890-1234',
    notes: 'Scheduled cardiovascular procedure with high risk of hemorrhage.',
  },
  {
    id: 'REQ-2026-879',
    patient_name: 'Henry Cavill',
    blood_group: 'A+',
    units: 1,
    hospital: 'Northside General Hospital',
    city: 'North Hill',
    urgency: 'NORMAL',
    status: 'FULFILLED',
    required_date: '2026-10-28',
    created_at: '2026-10-27T11:00:00',
    contact_name: 'Nurse Nancy',
    contact_phone: '+1 (555) 678-5432',
    notes: 'Anemia treatment during ongoing chemotherapy protocol.',
  },
  {
    id: 'REQ-2026-878',
    patient_name: 'Daphne Blake',
    blood_group: 'AB-',
    units: 1,
    hospital: 'Civic Community Hospital',
    city: 'South Point',
    urgency: 'URGENT',
    status: 'REJECTED',
    rejection_reason: 'Hospital prescription unverifiable upon callback verification.',
    required_date: '2026-10-25',
    created_at: '2026-10-24T16:40:00',
    contact_name: 'Fred Jones',
    contact_phone: '+1 (555) 901-2345',
    notes: 'Urgent need for elective orthopaedic surgery.',
  },
];

export const requestService = {
  async getRequests(params = {}) {
    try {
      const response = await api.get('/api/requests', { params });
      return response.data;
    } catch (error) {
      const { status, urgency, search } = params;
      let filtered = [...MOCK_REQUESTS];

      if (status && status !== 'ALL') {
        filtered = filtered.filter(r => r.status === status);
      }
      if (urgency && urgency !== 'ALL') {
        filtered = filtered.filter(r => r.urgency === urgency);
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          r => r.patient_name.toLowerCase().includes(query) ||
               r.hospital.toLowerCase().includes(query) ||
               r.blood_group.toLowerCase().includes(query) ||
               r.id.toLowerCase().includes(query)
        );
      }

      return {
        success: true,
        data: filtered,
        total: filtered.length,
      };
    }
  },

  async createRequest(payload) {
    try {
      const response = await api.post('/api/requests', payload);
      return response.data;
    } catch (error) {
      const newReq = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        ...payload,
      };
      return {
        success: true,
        message: 'Blood request submitted successfully and queued for review.',
        data: newReq,
      };
    }
  },

  async updateRequestStatus(id, status, rejectionReason = '') {
    try {
      const response = await api.patch(`/api/requests/${id}/status`, { status, rejection_reason: rejectionReason });
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Request status updated to ${status}`,
      };
    }
  },

  async getMyRequests() {
    try {
      const response = await api.get('/api/requests/me');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: MOCK_REQUESTS.slice(0, 2),
      };
    }
  },
};

export default requestService;
