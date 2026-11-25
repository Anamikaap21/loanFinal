import api from './api.js';

export const loanService = {
  getHomepageProducts: async () => {
    const response = await api.get('/loans/homepage-products');
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/loans/products');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/loans/categories');
    return response.data;
  },

  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/loans/categories/${slug}`);
    return response.data;
  },

  applyForLoan: async (formData) => {
    const response = await api.post('/loans/apply', formData);
    return response.data;
  },

  requestCallback: async (callbackData) => {
    const response = await api.post('/callbacks', callbackData);
    return response.data;
  },
};

export default loanService;
