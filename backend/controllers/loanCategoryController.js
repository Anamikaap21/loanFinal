import mongoose from 'mongoose';
import LoanCategory from '../models/LoanCategory.js';
import Lead from '../models/Lead.js';
import LoanApplication from '../models/LoanApplication.js';

// Helper to convert comma/newline-separated strings or arrays into clean string array
const parseStringArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// ==========================================
// ADMIN ENDPOINTS (Role-Guard: Admin)
// ==========================================

// 1. GET ALL CATEGORIES FOR ADMIN (Includes Inactive)
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = { isDeleted: { $ne: true } };

    if (status && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'active') {
        filter.isActive = { $ne: false };
        filter.status = { $nin: ['inactive', 'INACTIVE'] };
      } else if (s === 'inactive') {
        filter.$or = [{ status: 'inactive' }, { isActive: false }];
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { tagline: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const categories = await LoanCategory.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET SINGLE CATEGORY BY ID FOR ADMIN
export const getCategoryByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category ID format.',
      });
    }

    const category = await LoanCategory.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan category not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 3. CREATE LOAN CATEGORY
export const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      shortName = '',
      tagline = '',
      description,
      features = [],
      eligibility = [],
      requiredDocuments = [],
      documentChecklist = [],
      baseInterestRate = '',
      maximumTenure = '',
      maximumFacility = '',
      processingTime = '',
      minAmount = 50000,
      maxAmount = 50000000,
      minInterestRate = 8.5,
      maxInterestRate = 15.0,
      minTenureMonths = 12,
      maxTenureMonths = 360,
      iconName = 'CreditCard',
      status = 'active',
      displayOrder = 0,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Category Name is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Category Description is required.',
      });
    }

    // Normalize slug
    const cleanName = name.trim();
    const cleanSlug = (slug && slug.trim())
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check duplicate name or slug (among non-deleted)
    const existing = await LoanCategory.findOne({
      isDeleted: { $ne: true },
      $or: [{ name: cleanName }, { slug: cleanSlug }],
    });

    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: existing.name.toLowerCase() === cleanName.toLowerCase()
          ? `Loan Category with name '${cleanName}' already exists.`
          : `Loan Category with slug '${cleanSlug}' already exists.`,
      });
    }

    const parsedMinRate = Number(minInterestRate) || 8.5;
    const parsedMaxRate = Number(maxInterestRate) || 15.0;

    const newCategory = new LoanCategory({
      name: cleanName,
      slug: cleanSlug,
      shortName: shortName.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      baseInterestRate: baseInterestRate.trim(),
      maximumTenure: maximumTenure.trim(),
      maximumFacility: maximumFacility.trim(),
      processingTime: processingTime.trim(),
      features: parseStringArray(features),
      eligibility: parseStringArray(eligibility),
      requiredDocuments: parseStringArray(requiredDocuments),
      documentChecklist: parseStringArray(documentChecklist),
      minAmount: Number(minAmount) || 50000,
      maxAmount: Number(maxAmount) || 50000000,
      minInterestRate: parsedMinRate,
      maxInterestRate: parsedMaxRate,
      interestRateRange: { min: parsedMinRate, max: parsedMaxRate },
      minTenureMonths: Number(minTenureMonths) || 12,
      maxTenureMonths: Number(maxTenureMonths) || 360,
      iconName: iconName.trim() || 'CreditCard',
      status: status.toLowerCase() === 'inactive' ? 'inactive' : 'active',
      isActive: status.toLowerCase() === 'active',
      isDeleted: false,
      displayOrder: Number(displayOrder) || 0,
    });

    await newCategory.save();

    return res.status(201).json({
      status: 'success',
      message: `Loan Category '${newCategory.name}' created successfully.`,
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE LOAN CATEGORY
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category ID format.',
      });
    }

    const category = await LoanCategory.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan category not found.',
      });
    }

    const {
      name,
      slug,
      shortName,
      tagline,
      description,
      features,
      eligibility,
      requiredDocuments,
      documentChecklist,
      baseInterestRate,
      maximumTenure,
      maximumFacility,
      processingTime,
      minAmount,
      maxAmount,
      minInterestRate,
      maxInterestRate,
      minTenureMonths,
      maxTenureMonths,
      iconName,
      status,
      displayOrder,
    } = req.body;

    if (name && name.trim()) {
      const cleanName = name.trim();
      // Check duplicate name
      const duplicate = await LoanCategory.findOne({
        _id: { $ne: id },
        name: cleanName,
        isDeleted: { $ne: true },
      });
      if (duplicate) {
        return res.status(409).json({
          status: 'error',
          message: `Another category already exists with name '${cleanName}'.`,
        });
      }
      category.name = cleanName;
    }

    if (slug && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const duplicateSlug = await LoanCategory.findOne({
        _id: { $ne: id },
        slug: cleanSlug,
        isDeleted: { $ne: true },
      });
      if (duplicateSlug) {
        return res.status(409).json({
          status: 'error',
          message: `Another category already exists with slug '${cleanSlug}'.`,
        });
      }
      category.slug = cleanSlug;
    }

    if (tagline !== undefined) category.tagline = tagline.trim();
    if (shortName !== undefined) category.shortName = shortName.trim();
    if (baseInterestRate !== undefined) category.baseInterestRate = baseInterestRate.trim();
    if (maximumTenure !== undefined) category.maximumTenure = maximumTenure.trim();
    if (maximumFacility !== undefined) category.maximumFacility = maximumFacility.trim();
    if (processingTime !== undefined) category.processingTime = processingTime.trim();
    if (description !== undefined && description.trim()) category.description = description.trim();
    if (features !== undefined) category.features = parseStringArray(features);
    if (eligibility !== undefined) category.eligibility = parseStringArray(eligibility);
    if (requiredDocuments !== undefined) category.requiredDocuments = parseStringArray(requiredDocuments);
    if (documentChecklist !== undefined) category.documentChecklist = parseStringArray(documentChecklist);
    if (minAmount !== undefined) category.minAmount = Number(minAmount);
    if (maxAmount !== undefined) category.maxAmount = Number(maxAmount);
    if (minInterestRate !== undefined) {
      category.minInterestRate = Number(minInterestRate);
      category.interestRateRange.min = Number(minInterestRate);
    }
    if (maxInterestRate !== undefined) {
      category.maxInterestRate = Number(maxInterestRate);
      category.interestRateRange.max = Number(maxInterestRate);
    }
    if (minTenureMonths !== undefined) category.minTenureMonths = Number(minTenureMonths);
    if (maxTenureMonths !== undefined) category.maxTenureMonths = Number(maxTenureMonths);
    if (iconName !== undefined) category.iconName = iconName.trim();
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);

    if (status !== undefined) {
      const normalizedStatus = status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
      category.status = normalizedStatus;
      category.isActive = normalizedStatus === 'active';
    }

    await category.save();

    return res.status(200).json({
      status: 'success',
      message: `Loan Category '${category.name}' updated successfully.`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 5. TOGGLE CATEGORY ACTIVE/INACTIVE STATUS
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category ID format.',
      });
    }

    const category = await LoanCategory.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan category not found.',
      });
    }

    const currentStatus = (category.status || '').toLowerCase();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    category.status = newStatus;
    category.isActive = newStatus === 'active';

    await category.save();

    return res.status(200).json({
      status: 'success',
      message: `Loan Category '${category.name}' is now ${newStatus.toUpperCase()}.`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE LOAN CATEGORY (Safe Soft Delete preserving historical application integrity)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category ID format.',
      });
    }

    const category = await LoanCategory.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan category not found.',
      });
    }

    // Check historical associations in Leads and LoanApplications
    const [leadCount, appCount] = await Promise.all([
      Lead.countDocuments({ loanCategory: id }),
      LoanApplication.countDocuments({ loanCategory: id }),
    ]);

    // Perform safe soft deletion to protect historical record relationships
    category.isDeleted = true;
    category.status = 'inactive';
    category.isActive = false;
    await category.save();

    const historicalNotice = (leadCount > 0 || appCount > 0)
      ? ` Note: Preserved historical links to ${leadCount} lead(s) and ${appCount} loan application(s).`
      : '';

    return res.status(200).json({
      status: 'success',
      message: `Loan Category '${category.name}' deleted successfully.${historicalNotice}`,
      data: { id: category._id, isDeleted: true },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// PUBLIC ENDPOINTS (Open to Website Visitors)
// ==========================================

// 7. GET ACTIVE CATEGORIES FOR PUBLIC WEBSITE
export const getActiveCategoriesPublic = async (req, res, next) => {
  try {
    const categories = await LoanCategory.find({
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      status: { $nin: ['inactive', 'INACTIVE'] },
      slug: { $not: /^test-/i },
    }).sort({ displayOrder: 1, createdAt: 1 });

    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// 8. GET ACTIVE CATEGORY DETAILS BY SLUG OR ID FOR PUBLIC WEBSITE
export const getActiveCategoryBySlugPublic = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.toLowerCase().startsWith('test-')) {
      return res.status(404).json({
        status: 'error',
        message: `Loan product '${slug}' is currently unavailable or inactive.`,
      });
    }

    const normalizedSlug = slug.toLowerCase();
    const filter = {
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      status: { $nin: ['inactive', 'INACTIVE'] },
    };

    if (normalizedSlug === 'od' || normalizedSlug === 'overdraft') {
      filter.slug = { $in: ['od', 'overdraft', 'od-overdraft-facility', 'overdraft-facility'] };
    } else if (mongoose.Types.ObjectId.isValid(slug)) {
      filter.$or = [{ slug: normalizedSlug }, { _id: slug }];
    } else {
      filter.slug = normalizedSlug;
    }

    const category = await LoanCategory.findOne(filter);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: `Loan product '${slug}' is currently unavailable or inactive.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getActiveCategoriesPublic,
  getActiveCategoryBySlugPublic,
};
