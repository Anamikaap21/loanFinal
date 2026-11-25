import express from 'express';
import {
  getActiveCategoriesPublic,
  getActiveCategoryBySlugPublic,
} from '../controllers/loanCategoryController.js';
import {
  getHomepageProducts,
  submitWebsiteLoanApplication,
} from '../controllers/loanController.js';
import { uploadLeadDocuments } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/categories', getActiveCategoriesPublic);
router.get('/categories/:slug', getActiveCategoryBySlugPublic);
router.get('/products', getHomepageProducts);
router.get('/homepage-products', getHomepageProducts);
router.post('/apply', uploadLeadDocuments, submitWebsiteLoanApplication);

export default router;
