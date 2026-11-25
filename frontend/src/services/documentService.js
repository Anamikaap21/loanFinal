import api from './api.js';

export const documentService = {
  // Fetch all documents for a lead
  getLeadDocuments: async (leadId) => {
    const response = await api.get(`/documents/lead/${leadId}`);
    return response.data;
  },

  // Verify a single document (Employee only)
  verifyDocument: async (documentId, remarks = '') => {
    const response = await api.put(`/documents/${documentId}/verify`, { remarks });
    return response.data;
  },

  // Reject a single document (Employee only - requires reason)
  rejectDocument: async (documentId, reason) => {
    const response = await api.put(`/documents/${documentId}/reject`, { reason });
    return response.data;
  },

  // Request document re-upload (Employee only - requires reason)
  requestReupload: async (documentId, reason) => {
    const response = await api.put(`/documents/${documentId}/request-reupload`, { reason });
    return response.data;
  },

  // Re-upload / replace a document file
  reuploadDocument: async (documentId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/documents/${documentId}/reupload`, formData);
    return response.data;
  },

  // Fetch document binary blob for inline viewing in modal / new tab
  viewDocumentBlob: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/view`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download document file directly to user device
  downloadDocument: async (documentId, filename = 'document.pdf') => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  },
};

export default documentService;
