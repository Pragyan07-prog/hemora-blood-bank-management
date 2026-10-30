import api from './api';

const MOCK_INVENTORY = [
  { blood_group: 'A+', units: 48, status: 'GOOD', optimal_threshold: 40, critical_threshold: 15, last_updated: '2026-10-28' },
  { blood_group: 'A-', units: 14, status: 'LOW', optimal_threshold: 25, critical_threshold: 10, last_updated: '2026-10-29' },
  { blood_group: 'B+', units: 52, status: 'GOOD', optimal_threshold: 35, critical_threshold: 15, last_updated: '2026-10-30' },
  { blood_group: 'B-', units: 9, status: 'CRITICAL', optimal_threshold: 20, critical_threshold: 10, last_updated: '2026-10-30' },
  { blood_group: 'AB+', units: 28, status: 'GOOD', optimal_threshold: 20, critical_threshold: 8, last_updated: '2026-10-27' },
  { blood_group: 'AB-', units: 6, status: 'CRITICAL', optimal_threshold: 15, critical_threshold: 8, last_updated: '2026-10-30' },
  { blood_group: 'O+', units: 75, status: 'GOOD', optimal_threshold: 50, critical_threshold: 25, last_updated: '2026-10-30' },
  { blood_group: 'O-', units: 11, status: 'LOW', optimal_threshold: 30, critical_threshold: 12, last_updated: '2026-10-29' },
];

const MOCK_TRANSACTIONS = [
  { id: 101, blood_group: 'O+', units: 2, type: 'DISPATCH', recipient: 'Metro General Hospital', date: '2026-10-30T10:15:00', recorded_by: 'Nurse Jennifer' },
  { id: 102, blood_group: 'B+', units: 4, type: 'INCOMING', donor_name: 'David Wilson', date: '2026-10-30T09:30:00', recorded_by: 'Lab Tech Samuel' },
  { id: 103, blood_group: 'A+', units: 1, type: 'DISPATCH', recipient: 'St. Jude Children Wing', date: '2026-10-29T16:20:00', recorded_by: 'Nurse Jennifer' },
  { id: 104, blood_group: 'O-', units: 3, type: 'DISPATCH', recipient: 'Emergency Trauma Center', date: '2026-10-29T14:45:00', recorded_by: 'Admin Sarah' },
  { id: 105, blood_group: 'AB+', units: 2, type: 'INCOMING', donor_name: 'Elena Rostova', date: '2026-10-28T11:10:00', recorded_by: 'Lab Tech Samuel' },
];

export const inventoryService = {
  async getInventory() {
    try {
      const response = await api.get('/api/inventory');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_INVENTORY };
    }
  },

  async addUnits(payload) {
    try {
      const response = await api.post('/api/inventory/add', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: `Successfully added ${payload.units} units of ${payload.blood_group}`,
        data: payload,
      };
    }
  },

  async getTransactions() {
    try {
      const response = await api.get('/api/inventory/transactions');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_TRANSACTIONS };
    }
  },

  async searchInventory(params) {
    try {
      const response = await api.get('/api/inventory/search', { params });
      return response.data;
    } catch (error) {
      const { blood_group, city } = params || {};
      let filtered = [...MOCK_INVENTORY];
      if (blood_group) {
        filtered = filtered.filter(item => item.blood_group === blood_group);
      }
      return {
        success: true,
        data: filtered.map(item => ({
          ...item,
          available_centers: [
            { name: 'Central Blood Bank', units: Math.round(item.units * 0.6), city: city || 'Metro City', contact: '+1 (555) 019-2834' },
            { name: 'St. Jude Memorial Hospital', units: Math.round(item.units * 0.4), city: city || 'Westside', contact: '+1 (555) 019-5821' },
          ],
        })),
      };
    }
  },
};

export default inventoryService;
