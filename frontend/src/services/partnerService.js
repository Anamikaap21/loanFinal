import api from './api.js';

export const partnerService = {
  // 1. Dashboard Metrics
  getDashboardMetrics: async () => {
    const response = await api.get('/partner/dashboard/metrics');
    return response.data;
  },

  // 2. Profile Management
  getProfile: async () => {
    const response = await api.get('/partner/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/partner/profile', data);
    return response.data;
  },

  // 3. Lead Creation & Management
  createLead: async (data) => {
    const response = await api.post('/partner/leads', data);
    return response.data;
  },
  getMyLeads: async (params = {}) => {
    const response = await api.get('/partner/leads', { params });
    return response.data;
  },
  getLeadDetails: async (id) => {
    const response = await api.get(`/partner/leads/${id}`);
    return response.data;
  },

  // 4. Pipeline Tracking
  getPipeline: async () => {
    const response = await api.get('/partner/pipeline');
    return response.data;
  },

  // 5. Commission Payouts
  getMyPayouts: async (params = {}) => {
    const response = await api.get('/partner/payouts', { params });
    return response.data;
  },

  // 6. Invoices
  getMyInvoices: async () => {
    const response = await api.get('/partner/invoices');
    return response.data;
  },
  getInvoiceDetails: async (id) => {
    const response = await api.get(`/partner/invoices/${id}`);
    return response.data;
  },

  // 7. KYC Status & Restricted Document Resubmission
  getKycStatus: async () => {
    const response = await api.get('/partner/kyc-status');
    return response.data;
  },
  resubmitDocument: async (documentId, file) => {
    const formData = new FormData();
    formData.append('documentId', documentId);
    formData.append('file', file);
    const response = await api.post('/partner/resubmit-document', formData);
    return response.data;
  },
};

export default partnerService;
