import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getDashboardMetrics,
  getAllBanks,
  createBank,
  updateBank,
  toggleBankStatus,
  deleteBank,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getAllPartners,
  updatePartner,
  getAllLeads,
  getLeadById,
  assignLead,
  updateLeadStatus,
  deleteLead,
  getAllCallbacks,
  updateCallback,
  getAllPayouts,
  getPartnerLeadsForPayout,
  createPayout,
  updatePayout,
  getAllInvoices,
  generateInvoiceForPayout,
  downloadInvoicePDF,
  getWebsiteContent,
  updateWebsiteContent,
} from '../controllers/adminController.js';
import {
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from '../controllers/loanCategoryController.js';
import {
  getAllPartnerVerifications,
  getPartnerVerificationDetails,
  verifyPartnerDocument,
  rejectPartnerDocument,
  requestReuploadPartnerDocument,
  approvePartnerRegistration,
  rejectPartnerRegistration,
  requestPartnerResubmission,
} from '../controllers/adminPartnerVerificationController.js';

const router = express.Router();

// Strict security: all admin routes require valid JWT AND admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// 1. Dashboard Metrics
router.get('/dashboard/metrics', getDashboardMetrics);

// 2. Bank Management
router.get('/banks', getAllBanks);
router.post('/banks', createBank);
router.put('/banks/:id', updateBank);
router.patch('/banks/:id/status', toggleBankStatus);
router.delete('/banks/:id', deleteBank);

// 2b. Loan Category Management
router.get('/loan-categories', getAllCategoriesAdmin);
router.get('/loan-categories/:id', getCategoryByIdAdmin);
router.post('/loan-categories', createCategory);
router.put('/loan-categories/:id', updateCategory);
router.patch('/loan-categories/:id/status', toggleCategoryStatus);
router.delete('/loan-categories/:id', deleteCategory);

router.get('/categories', getAllCategoriesAdmin);
router.get('/categories/:id', getCategoryByIdAdmin);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.patch('/categories/:id/status', toggleCategoryStatus);
router.delete('/categories/:id', deleteCategory);

// 3. Employee Management
router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', toggleEmployeeStatus);

// 4. Partner Management
router.get('/partners', getAllPartners);
router.put('/partners/:id', updatePartner);

// 5. Lead Management & Dual Lead Views
router.get('/leads', getAllLeads);
router.get('/website-leads', (req, res, next) => {
  req.query.source = 'website';
  return getAllLeads(req, res, next);
});
router.get('/employee-leads', (req, res, next) => {
  req.query.source = 'employee';
  return getAllLeads(req, res, next);
});
router.get('/partner-leads', (req, res, next) => {
  req.query.source = 'partner';
  return getAllLeads(req, res, next);
});
router.get('/leads/:id', getLeadById);
router.put('/leads/:id/assign', assignLead);
router.put('/leads/:id/status', updateLeadStatus);
router.delete('/leads/:id', deleteLead);

// 6. Support & Callbacks Desk
router.get('/callbacks', getAllCallbacks);
router.put('/callbacks/:id', updateCallback);

// 7. Payout Management
router.get('/payouts', getAllPayouts);
router.get('/payouts/partner-leads/:partnerId', getPartnerLeadsForPayout);
router.post('/payouts', createPayout);
router.put('/payouts/:id', updatePayout);

// 8. Invoice Management
router.get('/invoices', getAllInvoices);
router.post('/invoices/generate/:payoutId', generateInvoiceForPayout);
router.get('/invoices/:id/pdf', downloadInvoicePDF);

// 9. Website Content CMS
router.get('/website-content', getWebsiteContent);
router.put('/website-content', updateWebsiteContent);

// 10. Partner KYC Verification Desk
router.get('/partner-verifications', getAllPartnerVerifications);
router.get('/partner-verifications/:id', getPartnerVerificationDetails);
router.put('/partner-verifications/:id/documents/:docId/verify', verifyPartnerDocument);
router.put('/partner-verifications/:id/documents/:docId/reject', rejectPartnerDocument);
router.put('/partner-verifications/:id/documents/:docId/request-reupload', requestReuploadPartnerDocument);
router.put('/partner-verifications/:id/approve', approvePartnerRegistration);
router.put('/partner-verifications/:id/reject', rejectPartnerRegistration);
router.put('/partner-verifications/:id/request-resubmission', requestPartnerResubmission);

export default router;
