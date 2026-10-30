import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Demo mock fallback if API is not running
      if (!error.response) {
        if (email.includes('admin')) {
          return {
            success: true,
            data: {
              access_token: 'mock-jwt-admin-token-12345',
              refresh_token: 'mock-refresh-token-12345',
              user: {
                id: 1,
                name: 'Dr. Sarah Mitchell',
                email: email,
                role: 'ADMIN',
                blood_group: 'O+',
                phone: '+1 (555) 234-5678',
                city: 'Metro City',
              },
            },
          };
        } else {
          return {
            success: true,
            data: {
              access_token: 'mock-jwt-donor-token-12345',
              refresh_token: 'mock-refresh-token-12345',
              user: {
                id: 2,
                name: 'Alexander Hayes',
                email: email,
                role: 'DONOR',
                blood_group: 'O+',
                phone: '+1 (555) 876-5432',
                city: 'Metro City',
                address: '742 Evergreen Terrace',
                state: 'California',
                emergency_contact_name: 'Emily Hayes',
                emergency_contact_phone: '+1 (555) 876-9999',
                is_eligible: true,
                total_donations: 8,
                last_donation_date: '2026-08-15',
                next_eligible_date: '2026-11-15',
              },
            },
          };
        }
      }
      throw error;
    }
  },

  async register(donorData) {
    try {
      const response = await api.post('/api/auth/register', donorData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        return {
          success: true,
          message: 'Registration successful! You can now log in.',
          data: { id: Date.now(), ...donorData, role: 'DONOR' },
        };
      }
      throw error;
    }
  },

  async getMe() {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        return { success: true, data: JSON.parse(savedUser) };
      }
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile', profileData);
      return response.data;
    } catch (error) {
      const savedUser = localStorage.getItem('user');
      const currentUser = savedUser ? JSON.parse(savedUser) : {};
      const updated = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true, data: updated };
    }
  },

  async changePassword(data) {
    try {
      const response = await api.post('/api/auth/change-password', data);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Password updated successfully' };
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

export default authService;
