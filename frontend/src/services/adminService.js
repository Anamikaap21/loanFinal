import api from './api.js';

export const adminService = {
  // 1. Dashboard Metrics
  getDashboardMetrics: async () => {
    const response = await api.get('/admin/dashboard/metrics');
    return response.data;
  },

  // 2. Bank Management
  getBanks: async (params = {}) => {
    const response = await api.get('/admin/banks', { params });
    return response.data;
  },
  createBank: async (data) => {
    const response = await api.post('/admin/banks', data);
    return response.data;
  },
  updateBank: async (id, data) => {
    const response = await api.put(`/admin/banks/${id}`, data);
    return response.data;
  },
  toggleBankStatus: async (id) => {
    const response = await api.patch(`/admin/banks/${id}/status`);
    return response.data;
  },
  deleteBank: async (id) => {
    const response = await api.delete(`/admin/banks/${id}`);
    return response.data;
  },

  // 2b. Loan Category Management
  getLoanCategories: async (params = {}) => {
    const response = await api.get('/admin/loan-categories', { params });
    return response.data;
  },
  getLoanCategoryById: async (id) => {
    const response = await api.get(`/admin/loan-categories/${id}`);
    return response.data;
  },
  createLoanCategory: async (data) => {
    const response = await api.post('/admin/loan-categories', data);
    return response.data;
  },
  updateLoanCategory: async (id, data) => {
    const response = await api.put(`/admin/loan-categories/${id}`, data);
    return response.data;
  },
  toggleLoanCategoryStatus: async (id) => {
    const response = await api.patch(`/admin/loan-categories/${id}/status`);
    return response.data;
  },
  deleteLoanCategory: async (id) => {
    const response = await api.delete(`/admin/loan-categories/${id}`);
    return response.data;
  },

  // 3. Employee Management
  getEmployees: async (params = {}) => {
    const response = await api.get('/admin/employees', { params });
    return response.data;
  },
  createEmployee: async (data) => {
    const response = await api.post('/admin/employees', data);
    return response.data;
  },
  updateEmployee: async (id, data) => {
    const response = await api.put(`/admin/employees/${id}`, data);
    return response.data;
  },
  toggleEmployeeStatus: async (id) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },

  // 4. Partner Management
  getPartners: async (params = {}) => {
    const response = await api.get('/admin/partners', { params });
    return response.data;
  },
  updatePartner: async (id, data) => {
    const response = await api.put(`/admin/partners/${id}`, data);
    return response.data;
  },

  // 4b. Partner KYC Verification Desk
  getPartnerVerifications: async (params = {}) => {
    const response = await api.get('/admin/partner-verifications', { params });
    return response.data;
  },
  getPartnerVerificationDetails: async (id) => {
    const response = await api.get(`/admin/partner-verifications/${id}`);
    return response.data;
  },
  verifyPartnerDocument: async (partnerId, docId, remarks = '') => {
    const response = await api.put(
      `/admin/partner-verifications/${partnerId}/documents/${docId}/verify`,
      { remarks }
    );
    return response.data;
  },
  rejectPartnerDocument: async (partnerId, docId, reason) => {
    const response = await api.put(
      `/admin/partner-verifications/${partnerId}/documents/${docId}/reject`,
      { reason }
    );
    return response.data;
  },
  requestReuploadPartnerDocument: async (partnerId, docId, reason) => {
    const response = await api.put(
      `/admin/partner-verifications/${partnerId}/documents/${docId}/request-reupload`,
      { reason }
    );
    return response.data;
  },
  approvePartnerRegistration: async (partnerId) => {
    const response = await api.put(`/admin/partner-verifications/${partnerId}/approve`);
    return response.data;
  },
  rejectPartnerRegistration: async (partnerId, remarks) => {
    const response = await api.put(`/admin/partner-verifications/${partnerId}/reject`, { remarks });
    return response.data;
  },
  requestPartnerResubmission: async (partnerId, remarks) => {
    const response = await api.put(
      `/admin/partner-verifications/${partnerId}/request-resubmission`,
      { remarks }
    );
    return response.data;
  },

  // 5. Lead Management & Dual Desks
  getLeads: async (params = {}) => {
    const response = await api.get('/admin/leads', { params });
    return response.data;
  },
  getWebsiteLeads: async (params = {}) => {
    const response = await api.get('/admin/website-leads', { params });
    return response.data;
  },
  getEmployeeLeads: async (params = {}) => {
    const response = await api.get('/admin/employee-leads', { params });
    return response.data;
  },
  getPartnerLeads: async (params = {}) => {
    const response = await api.get('/admin/partner-leads', { params });
    return response.data;
  },
  getLeadById: async (id) => {
    const response = await api.get(`/admin/leads/${id}`);
    return response.data;
  },
  assignLead: async (id, data) => {
    const response = await api.put(`/admin/leads/${id}/assign`, data);
    return response.data;
  },
  updateLeadStatus: async (id, data) => {
    const response = await api.put(`/admin/leads/${id}/status`, data);
    return response.data;
  },
  deleteLead: async (id) => {
    const response = await api.delete(`/admin/leads/${id}`);
    return response.data;
  },

  // 6. Support & Callbacks
  getCallbacks: async (params = {}) => {
    const response = await api.get('/admin/callbacks', { params });
    return response.data;
  },
  updateCallback: async (id, data) => {
    const response = await api.put(`/admin/callbacks/${id}`, data);
    return response.data;
  },

  // 7. Payouts Management
  getPayouts: async (params = {}) => {
    const response = await api.get('/admin/payouts', { params });
    return response.data;
  },
  getPartnerLeadsForPayout: async (partnerId) => {
    const response = await api.get(`/admin/payouts/partner-leads/${partnerId}`);
    return response.data;
  },
  createPayout: async (data) => {
    const response = await api.post('/admin/payouts', data);
    return response.data;
  },
  updatePayout: async (id, data) => {
    const response = await api.put(`/admin/payouts/${id}`, data);
    return response.data;
  },

  // 8. Invoices Management
  getInvoices: async (params = {}) => {
    const response = await api.get('/admin/invoices', { params });
    return response.data;
  },
  generateInvoice: async (payoutId) => {
    const response = await api.post(`/admin/invoices/generate/${payoutId}`);
    return response.data;
  },

  // 9. Website CMS Content
  getWebsiteContent: async () => {
    const response = await api.get('/admin/website-content');
    return response.data;
  },
  updateWebsiteContent: async (data) => {
    const response = await api.put('/admin/website-content', data);
    return response.data;
  },
};

export default adminService;
