import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { uploadLeadDocuments } from '../middleware/uploadMiddleware.js';
import {
  getDashboardMetrics,
  getProfile,
  updateProfile,
  createLead,
  getAssignedLeads,
  getDocumentVerificationLeads,
  getLeadDetails,
  updateLeadStatus,
  addLeadDocument,
  getAssignedCallbacks,
  updateCallback,
} from '../controllers/employeeController.js';

const router = express.Router();

// Role-Guard: All routes require authentication + Employee role
router.use(authMiddleware);
router.use(roleMiddleware('employee'));

// 1. Dashboard Metrics
router.get('/dashboard/metrics', getDashboardMetrics);

// 2. Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// 3. Lead Sourcing & Processing
router.post('/leads', uploadLeadDocuments, createLead);
router.get('/leads', getAssignedLeads);
router.get('/verification-leads', getDocumentVerificationLeads);
router.get('/document-verification/leads', getDocumentVerificationLeads);
router.get('/employee-leads', (req, res, next) => {
  req.query.source = 'employee';
  return getAssignedLeads(req, res, next);
});
router.get('/website-leads', (req, res, next) => {
  req.query.source = 'website';
  return getAssignedLeads(req, res, next);
});
router.get('/partner-leads', (req, res, next) => {
  req.query.source = 'partner';
  return getAssignedLeads(req, res, next);
});
router.get('/leads/:id', getLeadDetails);
router.put('/leads/:id/status', updateLeadStatus);
router.post('/leads/:id/documents', addLeadDocument);

// 4. Assigned Support & Callbacks
router.get('/callbacks', getAssignedCallbacks);
router.put('/callbacks/:id', updateCallback);

export default router;
