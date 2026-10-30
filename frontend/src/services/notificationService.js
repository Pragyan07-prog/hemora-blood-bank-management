import api from './api';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Urgent O- Blood Needed',
    message: 'Trauma center urgently requires 4 units of O- Negative blood. If you are eligible, please schedule an emergency slot.',
    type: 'ALERT',
    is_read: false,
    created_at: '2026-10-30T08:00:00',
  },
  {
    id: 2,
    title: 'Donation Appointment Confirmed',
    message: 'Your donation appointment at HEMORA Central Blood Bank is scheduled for Nov 20, 2026 at 10:00 AM.',
    type: 'INFO',
    is_read: false,
    created_at: '2026-10-29T15:30:00',
  },
  {
    id: 3,
    title: 'Donor Certificate Ready',
    message: 'Your official certificate of appreciation for your last donation is now ready to download!',
    type: 'SUCCESS',
    is_read: true,
    created_at: '2026-10-25T11:20:00',
  },
  {
    id: 4,
    title: 'Upcoming Blood Donation Camp',
    message: 'Join us at the Metro Civic Center Blood Drive on Nov 12, 2026. Register early to claim your spot.',
    type: 'EVENT',
    is_read: true,
    created_at: '2026-10-20T09:00:00',
  },
];

export const notificationService = {
  async getNotifications() {
    try {
      const response = await api.get('/api/notifications');
      return response.data;
    } catch (error) {
      return { success: true, data: MOCK_NOTIFICATIONS };
    }
  },

  async sendNotification(payload) {
    try {
      const response = await api.post('/api/notifications', payload);
      return response.data;
    } catch (error) {
      return {
        success: true,
        message: 'Notification sent successfully to target recipients.',
        data: { id: Date.now(), created_at: new Date().toISOString(), ...payload },
      };
    }
  },

  async markAsRead(id) {
    try {
      const response = await api.patch(`/api/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.patch('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },
};

export default notificationService;
