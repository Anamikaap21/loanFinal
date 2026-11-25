import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getActiveCategoriesPublic,
  getActiveCategoryBySlugPublic,
} from '../controllers/loanCategoryController.js';

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/active', getActiveCategoriesPublic);
router.get('/active/:slug', getActiveCategoryBySlugPublic);

// ==========================================
// ADMIN MANAGEMENT ROUTES (Auth + Role Guard)
// ==========================================
router.get('/admin', authMiddleware, roleMiddleware('admin'), getAllCategoriesAdmin);
router.get('/admin/:id', authMiddleware, roleMiddleware('admin'), getCategoryByIdAdmin);
router.post('/', authMiddleware, roleMiddleware('admin'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateCategory);
router.patch('/:id/status', authMiddleware, roleMiddleware('admin'), toggleCategoryStatus);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteCategory);

export default router;
