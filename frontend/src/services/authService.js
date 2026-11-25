import api from './api.js';

export const authService = {
  // Login with role selection
  login: async ({ emailOrPhone, password, role }) => {
    const response = await api.post('/auth/login', {
      emailOrPhone,
      password,
      role,
    });
    return response.data;
  },

  // Channel Partner self-registration
  registerPartner: async (partnerData) => {
    const response = await api.post('/auth/register-partner', partnerData);
    return response.data;
  },

  // Get current authenticated user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('realcred_token');
      localStorage.removeItem('realcred_user');
    }
  },

  // Change password
  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
