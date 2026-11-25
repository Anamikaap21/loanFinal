import express from 'express';
import {
  createCallbackRequest,
  getCallbackRequests,
} from '../controllers/callbackController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public callback request submission
router.post('/', createCallbackRequest);

// Protected callback request management for Admin & Employees
router.get('/', authMiddleware, roleMiddleware('admin', 'employee'), getCallbackRequests);

export default router;
