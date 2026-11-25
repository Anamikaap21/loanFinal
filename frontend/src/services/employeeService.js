import api from './api.js';

export const employeeService = {
  // 1. Dashboard Metrics
  getDashboardMetrics: async () => {
    const response = await api.get('/employee/dashboard/metrics');
    return response.data;
  },

  // 2. Profile Management
  getProfile: async () => {
    const response = await api.get('/employee/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/employee/profile', data);
    return response.data;
  },

  // 3. Assigned Leads & Processing
  createLead: async (data) => {
    const response = await api.post('/employee/leads', data);
    return response.data;
  },
  getAssignedLeads: async (params = {}) => {
    const response = await api.get('/employee/leads', { params });
    return response.data;
  },
  getDocumentVerificationLeads: async (params = {}) => {
    const response = await api.get('/employee/verification-leads', { params });
    return response.data;
  },
  getAssignedEmployeeLeads: async (params = {}) => {
    const response = await api.get('/employee/employee-leads', { params });
    return response.data;
  },
  getAssignedWebsiteLeads: async (params = {}) => {
    const response = await api.get('/employee/website-leads', { params });
    return response.data;
  },
  getAssignedPartnerLeads: async (params = {}) => {
    const response = await api.get('/employee/partner-leads', { params });
    return response.data;
  },
  getLeadDetails: async (id) => {
    const response = await api.get(`/employee/leads/${id}`);
    return response.data;
  },
  updateLeadStatus: async (id, data) => {
    const response = await api.put(`/employee/leads/${id}/status`, data);
    return response.data;
  },
  addLeadDocument: async (id, data) => {
    const response = await api.post(`/employee/leads/${id}/documents`, data);
    return response.data;
  },

  // 4. Assigned Support Callbacks
  getAssignedCallbacks: async (params = {}) => {
    const response = await api.get('/employee/callbacks', { params });
    return response.data;
  },
  updateCallback: async (id, data) => {
    const response = await api.put(`/employee/callbacks/${id}`, data);
    return response.data;
  },
};

export default employeeService;
