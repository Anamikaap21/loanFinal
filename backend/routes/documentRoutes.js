import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadSingleDocument } from '../middleware/uploadMiddleware.js';
import {
  getLeadDocuments,
  viewDocument,
  downloadDocument,
  verifyDocument,
  rejectDocument,
  requestReupload,
  reuploadDocument,
} from '../controllers/documentController.js';

const router = express.Router();

// All document routes require authentication
router.use(authMiddleware);

// 1. Get documents for a lead
router.get('/lead/:leadId', getLeadDocuments);

// 2. Inline streaming and download
router.get('/:id/view', viewDocument);
router.get('/:id/download', downloadDocument);

// 3. Employee document verification actions
router.put('/:id/verify', verifyDocument);
router.put('/:id/reject', rejectDocument);
router.put('/:id/request-reupload', requestReupload);

// 4. Document replacement / re-upload
router.post('/:id/reupload', uploadSingleDocument, reuploadDocument);

export default router;
