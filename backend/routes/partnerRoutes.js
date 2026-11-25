import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { uploadLeadDocuments, uploadSingleDocument } from '../middleware/uploadMiddleware.js';
import Partner from '../models/Partner.js';
import {
  getDashboardMetrics,
  getProfile,
  updateProfile,
  createLead,
  getMyLeads,
  getLeadDetails,
  getPipeline,
  getMyPayouts,
  getMyInvoices,
  getInvoiceDetails,
  downloadInvoicePDF,
  getPartnerKycStatus,
  resubmitPartnerDocument,
} from '../controllers/partnerController.js';

const router = express.Router();

// Role-Guard: All routes require authentication + Partner role
router.use(authMiddleware);
router.use(roleMiddleware('partner'));

// Resolve partner record
router.use(async (req, res, next) => {
  if (!req.partner) {
    req.partner = await Partner.findOne({ user: req.user._id });
  }
  if (!req.partner) {
    return res.status(404).json({
      status: 'error',
      message: 'Partner profile record not found.',
    });
  }
  next();
});

// Partner KYC Status & Document Resubmission (Accessible for partners in RESUBMISSION_REQUIRED)
router.get('/kyc-status', getPartnerKycStatus);
router.post('/resubmit-document', uploadSingleDocument, resubmitPartnerDocument);

// Strict Approval Guard: All normal Partner CRM routes require APPROVED + ACTIVE status
const requireApprovedActivePartner = (req, res, next) => {
  const regStatus = (req.partner?.registrationStatus || '').toUpperCase();
  const accStatus = (req.partner?.accountStatus || '').toLowerCase();

  if (regStatus !== 'APPROVED' || accStatus !== 'active') {
    return res.status(403).json({
      status: 'error',
      code: 'PARTNER_NOT_APPROVED',
      message:
        'Access denied. Your Partner account is not approved or active. Access to Partner CRM features is strictly restricted until Admin approval.',
      registrationStatus: req.partner?.registrationStatus,
      accountStatus: req.partner?.accountStatus,
    });
  }
  next();
};

// 1. Dashboard Metrics
router.get('/dashboard/metrics', requireApprovedActivePartner, getDashboardMetrics);

// 2. Profile Management
router.get('/profile', getProfile);
router.put('/profile', requireApprovedActivePartner, updateProfile);

// 3. Lead Creation & Management
router.post('/leads', requireApprovedActivePartner, uploadLeadDocuments, createLead);
router.get('/leads', requireApprovedActivePartner, getMyLeads);
router.get('/leads/:id', requireApprovedActivePartner, getLeadDetails);

// 4. Pipeline Tracking
router.get('/pipeline', requireApprovedActivePartner, getPipeline);

// 5. Commission Payouts
router.get('/payouts', requireApprovedActivePartner, getMyPayouts);

// 6. Invoices
router.get('/invoices', requireApprovedActivePartner, getMyInvoices);
router.get('/invoices/:id', requireApprovedActivePartner, getInvoiceDetails);
router.get('/invoices/:id/pdf', requireApprovedActivePartner, downloadInvoicePDF);

export default router;
