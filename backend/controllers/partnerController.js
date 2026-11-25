import mongoose from 'mongoose';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Lead, { LEAD_STATUSES, EMPLOYMENT_TYPES } from '../models/Lead.js';
import LoanCategory from '../models/LoanCategory.js';
import Bank from '../models/Bank.js';
import Payout from '../models/Payout.js';
import Invoice from '../models/Invoice.js';
import Document from '../models/Document.js';
import { saveLeadDocuments } from './documentController.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateInvoicePDF } from '../services/invoiceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to retrieve Partner document from authenticated User
const getPartnerForUser = async (userId) => {
  const partner = await Partner.findOne({ user: userId });
  if (!partner) {
    const error = new Error('No channel partner profile found for this user account.');
    error.statusCode = 404;
    throw error;
  }
  return partner;
};

// ==========================================
// 1. DASHBOARD METRICS
// ==========================================
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);

    // Fetch lead counts for this partner
    const [
      totalLeads,
      activePipelineCount,
      disbursedCount,
      invoicesCount,
    ] = await Promise.all([
      Lead.countDocuments({ partnerId: partner._id }),
      Lead.countDocuments({
        partnerId: partner._id,
        status: { $nin: ['Disbursement', 'PDD', 'Payout', 'Cancelled'] },
      }),
      Lead.countDocuments({
        partnerId: partner._id,
        status: { $in: ['Disbursement', 'PDD', 'Payout'] },
      }),
      Invoice.countDocuments({ partner: partner._id }),
    ]);

    // 8-stage breakdown counts
    const statusCounts = {};
    for (const st of LEAD_STATUSES) {
      statusCounts[st] = await Lead.countDocuments({
        partnerId: partner._id,
        status: st,
      });
    }

    // Disbursed volume aggregate
    const disbursementAggregate = await Lead.aggregate([
      {
        $match: {
          partnerId: partner._id,
          status: { $in: ['Disbursement', 'PDD', 'Payout'] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [
                { $gt: ['$disbursedAmount', 0] },
                '$disbursedAmount',
                '$requiredLoanAmount',
              ],
            },
          },
        },
      },
    ]);
    const totalDisbursedVolume = disbursementAggregate[0]?.totalAmount || 0;

    // Financial payouts aggregates
    const payoutsAggregate = await Payout.aggregate([
      { $match: { partner: partner._id } },
      {
        $group: {
          _id: '$status',
          totalGross: { $sum: '$grossCommissionAmount' },
          totalTds: { $sum: '$tdsAmount' },
          totalNet: { $sum: '$netPayoutAmount' },
        },
      },
    ]);

    let totalEarnedPayout = 0;
    let pendingPayout = 0;
    payoutsAggregate.forEach((p) => {
      if (p._id === 'completed') {
        totalEarnedPayout += p.totalNet;
      } else if (['pending', 'processing'].includes(p._id)) {
        pendingPayout += p.totalNet;
      }
    });

    // Recent 5 leads
    const recentLeads = await Lead.find({ partnerId: partner._id })
      .populate('loanCategory', 'name slug')
      .populate('preferredBank', 'name bankCode')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 payouts
    const recentPayouts = await Payout.find({ partner: partner._id })
      .populate('lead', 'leadId customerName disbursedAmount requiredLoanAmount')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      status: 'success',
      data: {
        partner: {
          partnerCode: partner.partnerCode,
          businessName: partner.businessName,
          accountStatus: partner.accountStatus,
          defaultCommissionRate: partner.defaultCommissionRate,
          commissionType: partner.commissionType,
          bankDetails: partner.bankDetails,
        },
        summary: {
          totalLeadsSubmitted: totalLeads,
          activePipelineCount,
          disbursedCount,
          totalDisbursedVolume,
          totalEarnedPayout,
          pendingPayout,
          invoicesCount,
        },
        statusBreakdown: statusCounts,
        recentLeads,
        recentPayouts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PROFILE MANAGEMENT
// ==========================================
export const getProfile = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone role'
    );
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner profile not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const {
      name,
      phone,
      businessName,
      panNumber,
      address,
      bankDetails,
      currentPassword,
      newPassword,
    } = req.body;

    // Update User document
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User account not found.',
      });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password is required to set a new password.',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password does not match records.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 6 characters.',
        });
      }
      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    // Update Partner document
    if (businessName !== undefined) partner.businessName = businessName.trim();
    if (panNumber !== undefined) partner.panNumber = panNumber.toUpperCase().trim();
    if (address) {
      partner.address = {
        ...partner.address,
        ...address,
      };
    }
    if (bankDetails) {
      partner.bankDetails = {
        accountHolderName: bankDetails.accountHolderName?.trim() || partner.bankDetails?.accountHolderName || '',
        accountNumber: bankDetails.accountNumber?.trim() || partner.bankDetails?.accountNumber || '',
        bankName: bankDetails.bankName?.trim() || partner.bankDetails?.bankName || '',
        ifscCode: bankDetails.ifscCode?.toUpperCase().trim() || partner.bankDetails?.ifscCode || '',
      };
    }

    await partner.save();

    const updated = await Partner.findById(partner._id).populate(
      'user',
      'name email phone role'
    );

    return res.status(200).json({
      status: 'success',
      message: 'Partner profile and settlement banking details updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. CREATE LEAD (PARTNER REFERRAL)
// ==========================================
export const createLead = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);

    if (partner.accountStatus !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Your partner account is currently inactive or suspended. Cannot submit new loan leads.',
      });
    }

    const {
      customerName,
      customerPhone,
      customerEmail = '',
      city,
      employmentType = 'Salaried',
      otherEmploymentDetails = '',
      loanCategory,
      requiredLoanAmount,
      preferredBank,
      panNumber = '',
      monthlyIncome = 0,
      remarks = '',
    } = req.body;

    if (!customerName || !customerPhone || !city || !loanCategory || !requiredLoanAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide Customer Name, Mobile Number, City, Loan Category, and Required Loan Amount.',
      });
    }

    if (employmentType && !EMPLOYMENT_TYPES.includes(employmentType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid employment type '${employmentType}'. Must be one of: ${EMPLOYMENT_TYPES.join(', ')}`,
      });
    }

    // Verify loan category exists
    const categoryDoc = await LoanCategory.findById(loanCategory);
    if (!categoryDoc) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category selected.',
      });
    }

    // Check optional preferred bank: MUST be strictly active and not deleted
    let bankDoc = null;
    if (preferredBank) {
      if (!mongoose.Types.ObjectId.isValid(preferredBank)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid preferred bank identifier.',
        });
      }

      bankDoc = await Bank.findOne({
        _id: preferredBank,
        status: { $in: ['active', 'ACTIVE'] },
        isDeleted: { $ne: true },
      });

      if (!bankDoc) {
        return res.status(400).json({
          status: 'error',
          message: 'The selected bank is currently inactive or unavailable for new applications.',
        });
      }
    }

    // Generate unique Lead ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const leadId = `RCL-${Date.now().toString().slice(-6)}${randomSuffix}`;

    const newLead = new Lead({
      leadId,
      source: 'partner',
      partnerId: partner._id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      city: city.trim(),
      employmentType: employmentType || 'Salaried',
      otherEmploymentDetails: otherEmploymentDetails ? otherEmploymentDetails.trim() : '',
      loanCategory: categoryDoc._id,
      categoryName: categoryDoc.name,
      preferredBank: bankDoc ? bankDoc._id : null,
      bankName: bankDoc ? bankDoc.name : '',
      requiredLoanAmount: Number(requiredLoanAmount),
      monthlyIncome: Number(monthlyIncome) || 0,
      panNumber: panNumber ? panNumber.toUpperCase().trim() : '',
      status: 'Lead',
      isEligibleForPayout: false,
      payoutStatus: 'not_eligible',
      remarks: remarks.trim(),
      statusHistory: [
        {
          status: 'Lead',
          previousStatus: null,
          changedBy: req.user._id,
          changedByName: req.user.name,
          changedAt: new Date(),
          remarks: remarks.trim() || `New referral file submitted by Partner ${partner.partnerCode} (${req.user.name}).`,
        },
      ],
    });

    await newLead.save();

    // Save uploaded KYC documents
    const savedDocs = await saveLeadDocuments({
      lead: newLead,
      files: req.files,
      uploadedBy: req.user._id,
      uploadedByRole: 'partner',
    });

    // Increment partner leads submitted count
    partner.totalLeadsSubmitted += 1;
    await partner.save();

    const populatedLead = await Lead.findById(newLead._id)
      .populate('loanCategory', 'name slug')
      .populate('preferredBank', 'name bankCode');

    return res.status(201).json({
      status: 'success',
      message: 'Loan lead submitted successfully to RealCred operations desk.',
      data: {
        ...populatedLead.toObject(),
        documentsCount: savedDocs.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. MY LEADS (SEARCH & FILTER)
// ==========================================
export const getMyLeads = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const { status, search } = req.query;

    const filter = { partnerId: partner._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { leadId: { $regex: term, $options: 'i' } },
        { customerName: { $regex: term, $options: 'i' } },
        { customerPhone: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('loanCategory', 'name slug interestRateStartingFrom')
      .populate('preferredBank', 'name bankCode')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. LEAD DETAILS (PARTNER ISOLATED)
// ==========================================
export const getLeadDetails = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('loanCategory')
      .populate('preferredBank')
      .populate('statusHistory.changedBy', 'name role');

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead file not found.',
      });
    }

    // Strict partner isolation: Partner can ONLY view their own leads
    if (!lead.partnerId || lead.partnerId.toString() !== partner._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view loan files referred by your partner account.',
      });
    }

    // Fetch payout info and documents if exists
    const [payout, documents] = await Promise.all([
      Payout.findOne({ lead: lead._id }).populate('invoice'),
      Document.find({ lead: lead._id }).sort({ createdAt: 1 }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        lead,
        payout,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. PIPELINE TRACKER
// ==========================================
export const getPipeline = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);

    const leads = await Lead.find({ partnerId: partner._id })
      .populate('loanCategory', 'name slug')
      .populate('preferredBank', 'name bankCode')
      .sort({ updatedAt: -1 });

    // Group leads by 8 stages
    const pipeline = {};
    for (const st of LEAD_STATUSES) {
      pipeline[st] = [];
    }

    leads.forEach((l) => {
      if (pipeline[l.status]) {
        pipeline[l.status].push(l);
      }
    });

    return res.status(200).json({
      status: 'success',
      totalCount: leads.length,
      data: {
        pipeline,
        allLeads: leads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. MY PAYOUTS
// ==========================================
export const getMyPayouts = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const { status } = req.query;

    const filter = { partner: partner._id };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const payouts = await Payout.find(filter)
      .populate('lead', 'leadId customerName customerPhone requiredLoanAmount disbursedAmount status')
      .populate('invoice')
      .sort({ createdAt: -1 });

    // Compute totals
    let totalGross = 0;
    let totalTds = 0;
    let totalNet = 0;
    let totalPaid = 0;
    let totalPending = 0;

    payouts.forEach((p) => {
      totalGross += p.grossCommissionAmount || 0;
      totalTds += p.tdsAmount || 0;
      totalNet += p.netPayoutAmount || 0;
      if (p.status === 'completed' || p.status === 'paid') {
        totalPaid += p.netPayoutAmount || 0;
      } else if (['pending', 'processing'].includes(p.status)) {
        totalPending += p.netPayoutAmount || 0;
      }
    });

    return res.status(200).json({
      status: 'success',
      count: payouts.length,
      data: {
        payouts,
        summary: {
          totalGross,
          totalTds,
          totalNet,
          totalPaid,
          totalPending,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. MY INVOICES
// ==========================================
export const getMyInvoices = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);

    const invoices = await Invoice.find({ partner: partner._id })
      .populate('lead', 'leadId customerName customerPhone disbursedAmount')
      .populate('payout')
      .sort({ invoiceDate: -1 });

    return res.status(200).json({
      status: 'success',
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceDetails = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const { id } = req.params;

    const invoice = await Invoice.findById(id)
      .populate('lead')
      .populate('payout');

    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found.',
      });
    }

    if (invoice.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view invoices issued to your partner account.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const partner = await getPartnerForUser(req.user._id);
    const { id } = req.params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found.',
      });
    }

    if (invoice.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only download invoices issued to your partner account.',
      });
    }

    const pdfPath = path.join(__dirname, '..', 'uploads', 'invoices', `${invoice.invoiceNumber}.pdf`);
    if (!fs.existsSync(pdfPath)) {
      await generateInvoicePDF(invoice);
    }

    return res.download(pdfPath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. PARTNER KYC STATUS & RESTRICTED DOCUMENT RESUBMISSION
// ==========================================
export const getPartnerKycStatus = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner record not found.',
      });
    }

    const documents = await Document.find({ partner: partner._id }).sort({ createdAt: 1 });

    const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
    const verifiedDocsCount = documents.filter(
      (d) => (d.verificationStatus || '').toLowerCase() === 'verified'
    ).length;

    return res.status(200).json({
      status: 'success',
      data: {
        partnerId: partner._id,
        partnerCode: partner.partnerCode,
        registrationId: partner.registrationId,
        registrationStatus: partner.registrationStatus,
        accountStatus: partner.accountStatus,
        kycStatus: partner.kycStatus,
        rejectionRemarks: partner.rejectionRemarks,
        reuploadRemarks: partner.reuploadRemarks,
        bankDetails: partner.bankDetails,
        documents,
        resubmissionHistory: partner.resubmissionHistory || [],
        verifiedCount: verifiedDocsCount,
        mandatoryTotal: 3,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resubmitPartnerDocument = async (req, res, next) => {
  try {
    const partner = await Partner.findOne({ user: req.user._id });
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner record not found.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select a replacement file to upload (PDF, JPG, PNG up to 10MB).',
      });
    }

    const { documentId, documentType } = req.body;
    let doc = null;

    if (documentId) {
      doc = await Document.findOne({ _id: documentId, partner: partner._id });
    } else if (documentType) {
      doc = await Document.findOne({ documentType, partner: partner._id });
    }

    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Existing KYC document not found to replace.',
      });
    }

    const oldName = doc.fileName;
    const prevStatus = doc.verificationStatus;

    doc.fileName = req.file.filename;
    doc.originalName = req.file.originalname || req.file.filename;
    doc.filePath = req.file.path;
    doc.fileSize = req.file.size;
    doc.mimeType = req.file.mimetype || 'application/pdf';
    doc.verificationStatus = 'pending';
    doc.rejectionReason = '';
    doc.reuploadReason = '';

    doc.verificationHistory.push({
      previousStatus: prevStatus,
      newStatus: 'pending',
      timestamp: new Date(),
      remarks: 'Partner submitted updated replacement document',
    });

    await doc.save();

    // Sync partner.kycDocuments
    const kItem = partner.kycDocuments.find(
      (k) => k.document && k.document.toString() === doc._id.toString()
    );
    if (kItem) {
      kItem.status = 'pending';
      kItem.rejectionReason = '';
      kItem.reuploadReason = '';
    }

    partner.resubmissionHistory.push({
      documentType: doc.documentType,
      documentId: doc._id,
      previousFileName: oldName,
      newFileName: req.file.filename,
      submittedAt: new Date(),
      reason: 'Partner resubmitted replacement KYC document',
    });

    // Check if any other docs are still in reupload_required or rejected
    const allPartnerDocs = await Document.find({ partner: partner._id });
    const hasRemainingReupload = allPartnerDocs.some(
      (d) =>
        ['reupload_required', 'action_required', 'rejected'].includes(
          (d.verificationStatus || '').toLowerCase()
        ) && d._id.toString() !== doc._id.toString()
    );

    if (!hasRemainingReupload) {
      partner.registrationStatus = 'PENDING';
      partner.kycStatus = 'pending';
      partner.reuploadRemarks = '';
    }

    await partner.save();

    return res.status(200).json({
      status: 'success',
      message: `Document "${doc.title}" has been resubmitted successfully and sent to Admin for verification.`,
      data: {
        document: doc,
        registrationStatus: partner.registrationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
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
};
