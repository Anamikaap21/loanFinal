import express from 'express';
import { getActiveBanks, getAllBanks, getBankById } from '../controllers/bankController.js';

const router = express.Router();

// Public routes: strictly filtered to active banks only
router.get('/active', getActiveBanks);
router.get('/:id', getBankById);
router.get('/', getAllBanks);

export default router;
