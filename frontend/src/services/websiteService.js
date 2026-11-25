import api from './api.js';

export const websiteService = {
  getContent: async () => {
    const response = await api.get('/website/content');
    return response.data;
  },

  getSection: async (sectionKey) => {
    const response = await api.get(`/website/content/${sectionKey}`);
    return response.data;
  },
};

export default websiteService;
