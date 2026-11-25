import api from './api.js';

export const bankService = {
  getActiveBanks: async () => {
    const response = await api.get('/banks/active');
    return response.data;
  },

  getAllBanks: async () => {
    const response = await api.get('/banks');
    return response.data;
  },
};

export default bankService;
