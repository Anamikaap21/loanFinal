import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  registerPartner,
  getMe,
  logout,
  changePassword,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadPartnerDocuments } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rate limiter for login & registration to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 60, // higher limit in test environment
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Public authentication routes
router.post('/login', authLimiter, login);
router.post('/register-partner', authLimiter, uploadPartnerDocuments, registerPartner);
router.post('/logout', logout);

// Protected user routes
router.get('/me', authMiddleware, getMe);
router.post('/change-password', authMiddleware, changePassword);

export default router;
