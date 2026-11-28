import mongoose from 'mongoose';
import LoanCategory from '../models/LoanCategory.js';
import Lead, { EMPLOYMENT_TYPES } from '../models/Lead.js';
import LoanApplication from '../models/LoanApplication.js';
import Bank from '../models/Bank.js';
import { saveLeadDocuments } from './documentController.js';

export const getLoanCategories = async (req, res, next) => {
  try {
    const categories = await LoanCategory.find({
      isActive: true,
      status: { $nin: ['inactive', 'INACTIVE'] },
      slug: { $not: /^test-/i },
    }).sort({ displayOrder: 1 });
    return res.status(200).json({
      status: 'success',
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getLoanCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug || slug.toLowerCase().startsWith('test-')) {
      return res.status(404).json({
        status: 'error',
        message: `Loan category '${slug}' not found.`,
      });
    }

    const normalizedSlug = slug.toLowerCase();
    let query = { slug: normalizedSlug, isActive: true };
    if (normalizedSlug === 'od' || normalizedSlug === 'overdraft') {
      query = {
        slug: { $in: ['od', 'overdraft', 'od-overdraft-facility', 'overdraft-facility'] },
        isActive: true,
      };
    }

    const category = await LoanCategory.findOne(query);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: `Loan category '${slug}' not found.`,
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

// Canonical 37 Verified Authentic Bank Logos
const VERIFIED_BANK_LOGOS = {
  BOB: '/assets/banks/bob.svg',
  BOI: '/assets/banks/boi.png',
  BOM: '/assets/banks/bom.svg',
  CANARA: '/assets/banks/canara.svg',
  IDBI: '/assets/banks/idbi.svg',
  INDIANBANK: '/assets/banks/indianbank.svg',
  PNB: '/assets/banks/pnb.svg',
  SBI: '/assets/banks/sbi.svg',
  UCO: '/assets/banks/uco.jpg',
  UNIONBANK: '/assets/banks/unionbank.svg',
  AUBANK: '/assets/banks/aubank.svg',
  AXIS: '/assets/banks/axis.svg',
  DCB: '/assets/banks/dcb.svg',
  FEDERAL: '/assets/banks/federal.svg',
  HDFC: '/assets/banks/hdfc.svg',
  HSBC: '/assets/banks/hsbc.svg',
  ICICI: '/assets/banks/icici.svg',
  IDFC: '/assets/banks/idfc.svg',
  INDUSIND: '/assets/banks/indusind.svg',
  KOTAK: '/assets/banks/kotak.svg',
  ABHFL: '/assets/banks/abhfl.svg',
  AXISFIN: '/assets/banks/axisfin.webp',
  BAJAJHFL: '/assets/banks/bajajhfl.svg',
  CHOLA: '/assets/banks/chola.svg',
  EASYHOME: '/assets/banks/easyhome.svg',
  GODREJHFL: '/assets/banks/godrejhfl.svg',
  HINDUJA: '/assets/banks/hinduja.png',
  ICICIHFC: '/assets/banks/icicihfc.png',
  IIFL: '/assets/banks/iifl.svg',
  LTFIN: '/assets/banks/ltfin.svg',
  LICHFL: '/assets/banks/lichfl.svg',
  MOTILAL: '/assets/banks/motilal.svg',
  PIRAMAL: '/assets/banks/piramal.svg',
  PNBHFL: '/assets/banks/pnbhfl.png',
  SAMMAN: '/assets/banks/samman.png',
  TATAHFC: '/assets/banks/tatahfc.svg',
  VASTU: '/assets/banks/vastu.svg',
};

export const getHomepageProducts = async (req, res, next) => {
  try {
    // Expected data flow: Admin Panel → Bank Management → MongoDB → Backend API → Public Homepage → Our Products
    // Strictly filter only ACTIVE, NON-DELETED banks directly at the database query level
    const activeBanks = await Bank.find({
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    }).sort({ name: 1 });

    const products = activeBanks.map((bank) => {
      const minRate = bank.interestRateRange?.min ?? 8.5;
      const maxRate = bank.interestRateRange?.max ?? 14.5;
      const maxYears = Math.round((bank.maxTenureMonths || 360) / 12);
      const fee = bank.processingFeeDetails || 'Up to 1% + GST';
      const code = (bank.bankCode || '').toUpperCase().trim();
      const verifiedLogo = VERIFIED_BANK_LOGOS[code] || bank.logoUrl || '';

      return {
        _id: bank._id,
        bankId: bank._id,
        name: bank.name,
        bankName: bank.name,
        bankCode: bank.bankCode,
        logoUrl: verifiedLogo,
        description:
          bank.description ||
          'Premier institutional lending partner providing competitive retail and commercial financing.',
        interestRateRange: { min: minRate, max: maxRate },
        maxTenureMonths: bank.maxTenureMonths || 360,
        maxTenureYears: maxYears,
        processingFeeDetails: fee,
        status: bank.status,
        category: bank.category || 'Private Banks',
        roi: bank.roi || `${minRate}% – ${maxRate}% p.a.`,
        maxLTV: bank.maxLTV || '75%',
        maxTenure: bank.maxTenure || `Up to ${maxYears} Years`,
        processingTime: bank.processingTime || '10-15 days',
        features: [
          `Interest rates starting from ${minRate}% p.a.`,
          `Flexible repayment tenure up to ${maxYears} years`,
          `Processing fee: ${fee}`,
          `Direct institution login & dedicated RealCred relationship desk`,
        ],
        minAmount: 50000,
        maxAmount: 150000000,
      };
    });

    return res.status(200).json({
      status: 'success',
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const submitWebsiteLoanApplication = async (req, res, next) => {
  try {
    const {
      fullName,
      mobileNumber,
      email = '',
      city,
      loanCategoryId,
      preferredBankId = null,
      requiredLoanAmount,
      employmentType,
      otherEmploymentDetails = '',
      monthlyIncome = 0,
      additionalDetails = '',
    } = req.body;

    // Validation
    if (!fullName || !mobileNumber || !city || !loanCategoryId || !requiredLoanAmount || !employmentType) {
      return res.status(400).json({
        status: 'error',
        message: 'Please fill in all mandatory fields: Full Name, Mobile Number, City, Loan Category, Loan Amount, and Employment Type.',
      });
    }

    if (!EMPLOYMENT_TYPES.includes(employmentType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid employment type '${employmentType}'. Must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      });
    }

    const loanAmountNumber = Number(requiredLoanAmount);
    if (isNaN(loanAmountNumber) || loanAmountNumber < 10000) {
      return res.status(400).json({
        status: 'error',
        message: 'Loan amount must be a valid number of at least ₹10,000.',
      });
    }

    // Verify category exists
    const category = await LoanCategory.findById(loanCategoryId);
    if (!category) {
      return res.status(400).json({
        status: 'error',
        message: 'Selected loan category is invalid or inactive.',
      });
    }

    // Verify bank if provided: MUST be strictly active and not deleted
    let bankName = '';
    if (preferredBankId) {
      if (!mongoose.Types.ObjectId.isValid(preferredBankId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid preferred bank identifier.',
        });
      }

      const bank = await Bank.findOne({
        _id: preferredBankId,
        status: { $in: ['active', 'ACTIVE'] },
        isDeleted: { $ne: true },
      });

      if (!bank) {
        return res.status(400).json({
          status: 'error',
          message: 'The selected bank is currently inactive or unavailable for new applications.',
        });
      }

      bankName = bank.name;
    }

    const timestamp = Date.now().toString().slice(-6);
    const leadCode = `RCL-W-${timestamp}`;
    const appCode = `RCAPP-${timestamp}`;

    // 1. Create Lead in MongoDB (Master Prompt: website-origin lead with partnerId = null)
    const newLead = new Lead({
      leadId: leadCode,
      source: 'website',
      partnerId: null, // Strictly direct website lead with no partner association
      customerName: fullName.trim(),
      customerPhone: mobileNumber.trim(),
      customerEmail: email.trim().toLowerCase(),
      city: city.trim(),
      employmentType,
      otherEmploymentDetails: otherEmploymentDetails ? otherEmploymentDetails.trim() : '',
      loanCategory: category._id,
      categoryName: category.name,
      preferredBank: preferredBankId || null,
      bankName: bankName || 'Any Suitable Bank',
      requiredLoanAmount: loanAmountNumber,
      additionalDetails: additionalDetails.trim(),
      status: 'Lead',
      statusHistory: [
        {
          status: 'Lead',
          changedByName: 'RealCred Website Application Form',
          remarks: 'Direct loan application submitted via public website.',
          changedAt: new Date(),
        },
      ],
      isEligibleForPayout: false,
      payoutStatus: 'not_eligible',
    });

    await newLead.save();

    // 2. Save any uploaded KYC verification documents
    const savedDocs = await saveLeadDocuments({
      lead: newLead,
      files: req.files,
      uploadedBy: null,
      uploadedByRole: 'customer',
    });

    // 3. Create LoanApplication document
    const application = new LoanApplication({
      applicationNumber: appCode,
      lead: newLead._id,
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim().toLowerCase(),
      city: city.trim(),
      loanCategory: category._id,
      preferredBank: preferredBankId || null,
      requiredLoanAmount: loanAmountNumber,
      employmentType,
      otherEmploymentDetails: otherEmploymentDetails ? otherEmploymentDetails.trim() : '',
      monthlyIncome: Number(monthlyIncome) || 0,
      additionalDetails: additionalDetails.trim(),
      status: 'submitted',
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    await application.save();

    return res.status(201).json({
      status: 'success',
      message: 'Your loan application has been submitted successfully! A dedicated RealCred loan relationship manager will contact you shortly.',
      data: {
        applicationNumber: appCode,
        leadId: leadCode,
        customerName: newLead.customerName,
        category: category.name,
        loanAmount: newLead.requiredLoanAmount,
        documentVerificationStatus: newLead.documentVerificationStatus,
        documentsCount: savedDocs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getLoanCategories,
  getLoanCategoryBySlug,
  submitWebsiteLoanApplication,
};
