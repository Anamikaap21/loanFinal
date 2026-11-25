import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';
import Bank from '../models/Bank.js';
import LoanCategory from '../models/LoanCategory.js';
import Lead, { LEAD_STATUSES, EMPLOYMENT_TYPES } from '../models/Lead.js';
import LoanApplication from '../models/LoanApplication.js';
import Document from '../models/Document.js';
import CallbackRequest from '../models/CallbackRequest.js';
import Payout from '../models/Payout.js';
import { saveLeadDocuments } from './documentController.js';
import bcrypt from 'bcryptjs';

// Helper to get Employee document from authenticated User
const getEmployeeForUser = async (userId) => {
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    const error = new Error('No employee profile found for this user account.');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

// ==========================================
// 1. DASHBOARD METRICS
// ==========================================
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);

    const [
      totalAssigned,
      assignedWebsiteLeads,
      assignedPartnerLeads,
      assignedEmployeeLeads,
      callbacksCount,
    ] = await Promise.all([
      Lead.countDocuments({ assignedTo: employee._id }),
      Lead.countDocuments({ assignedTo: employee._id, source: 'website' }),
      Lead.countDocuments({ assignedTo: employee._id, source: 'partner' }),
      Lead.countDocuments({ assignedTo: employee._id, source: 'employee' }),
      CallbackRequest.countDocuments({
        $or: [{ assignedTo: employee._id }, { status: 'pending' }],
      }),
    ]);

    // 8-stage breakdown for this officer's files
    const statusCounts = {};
    for (const st of LEAD_STATUSES) {
      statusCounts[st] = await Lead.countDocuments({
        assignedTo: employee._id,
        status: st,
      });
    }

    // Disbursed volume by this officer
    const disbursementAggregate = await Lead.aggregate([
      {
        $match: {
          assignedTo: employee._id,
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

    // Recent 5 assigned leads
    const recentLeads = await Lead.find({ assignedTo: employee._id })
      .populate('loanCategory', 'name slug')
      .populate('preferredBank', 'name bankCode')
      .populate({
        path: 'partnerId',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ updatedAt: -1 })
      .limit(5);

    // Callbacks assigned or pending
    const assignedCallbacks = await CallbackRequest.find({
      $or: [{ assignedTo: employee._id }, { status: 'pending' }],
    })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      status: 'success',
      data: {
        employee: {
          employeeId: employee.employeeId,
          designation: employee.designation,
          department: employee.department,
        },
        summary: {
          totalAssigned,
          assignedWebsiteLeads,
          assignedPartnerLeads,
          assignedEmployeeLeads,
          totalDisbursedVolume,
          pendingCallbacks: callbacksCount,
          sanctionedCount: statusCounts['Sanction'] || 0,
          disbursedCount: (statusCounts['Disbursement'] || 0) + (statusCounts['PDD'] || 0) + (statusCounts['Payout'] || 0),
        },
        statusBreakdown: statusCounts,
        recentLeads,
        assignedCallbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. EMPLOYEE PROFILE MANAGEMENT
// ==========================================
export const getProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone role status avatar lastLogin'
    );
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, currentPassword, newPassword } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Password change check
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Please provide your current password to set a new password.',
        });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password does not match.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 6 characters.',
        });
      }
      user.password = newPassword;
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    await user.save();

    if (address) {
      employee.address = {
        ...employee.address,
        ...address,
      };
      await employee.save();
    }

    const updated = await Employee.findById(employee._id).populate(
      'user',
      'name email phone role status'
    );

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. ASSIGNED LEADS & PROCESSING
// ==========================================
export const getAssignedLeads = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { source, status, search } = req.query;

    const filter = { assignedTo: employee._id };
    if (source && source !== 'all') filter.source = source;
    if (status && status !== 'all') filter.status = status;

    if (search) {
      filter.$or = [
        { leadId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('loanCategory', 'name slug interestRateStartingFrom')
      .populate('preferredBank', 'name bankCode')
      .populate({
        path: 'partnerId',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ updatedAt: -1 });

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
// 3B. ASSIGNED LEADS FOR DOCUMENT VERIFICATION DASHBOARD
// ==========================================
export const getDocumentVerificationLeads = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { search, source, verificationStatus } = req.query;

    const baseFilter = {
      $or: [{ assignedTo: employee._id }, { creatorEmployee: employee._id }],
    };

    const filter = { ...baseFilter };

    if (source && source !== 'all') {
      filter.source = source;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      if (['action_required', 'reupload_required'].includes(verificationStatus)) {
        filter.documentVerificationStatus = {
          $in: ['action_required', 'reupload_required', 'Re-upload Required'],
        };
      } else {
        filter.documentVerificationStatus = verificationStatus;
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$and = [
        {
          $or: [
            { leadId: { $regex: term, $options: 'i' } },
            { customerName: { $regex: term, $options: 'i' } },
            { customerPhone: { $regex: term, $options: 'i' } },
            { city: { $regex: term, $options: 'i' } },
          ],
        },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('loanCategory', 'name slug interestRateStartingFrom')
      .populate('preferredBank', 'name bankCode')
      .populate({
        path: 'partnerId',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ updatedAt: -1 });

    // Compute metric counter cards for this officer's queue
    const [totalAssigned, pendingCount, verifiedCount, rejectedCount, reuploadCount] =
      await Promise.all([
        Lead.countDocuments(baseFilter),
        Lead.countDocuments({
          ...baseFilter,
          documentVerificationStatus: {
            $in: ['pending', 'Pending', 'incomplete', 'under_review'],
          },
        }),
        Lead.countDocuments({
          ...baseFilter,
          documentVerificationStatus: { $in: ['verified', 'Verified'] },
        }),
        Lead.countDocuments({
          ...baseFilter,
          documentVerificationStatus: { $in: ['rejected', 'Rejected'] },
        }),
        Lead.countDocuments({
          ...baseFilter,
          documentVerificationStatus: {
            $in: ['action_required', 'reupload_required', 'Re-upload Required'],
          },
        }),
      ]);

    // Attach document submission and verification progress per lead
    const leadIds = leads.map((l) => l._id);
    const allDocs = await Document.find({ lead: { $in: leadIds } });

    const leadsWithStats = leads.map((lead) => {
      const docs = allDocs.filter((d) => d.lead.toString() === lead._id.toString());
      const verifiedDocsCount = docs.filter(
        (d) => (d.verificationStatus || '').toLowerCase() === 'verified'
      ).length;
      const totalSubmitted = docs.length;
      const mandatoryTotal = 3;
      const progressPercent = Math.min(
        100,
        Math.round((verifiedDocsCount / mandatoryTotal) * 100)
      );

      return {
        ...lead.toObject(),
        documentsSummary: {
          totalSubmitted,
          verifiedCount: verifiedDocsCount,
          mandatoryTotal,
          progressPercent,
        },
      };
    });

    return res.status(200).json({
      status: 'success',
      count: leadsWithStats.length,
      metrics: {
        totalAssigned,
        pendingCount,
        verifiedCount,
        rejectedCount,
        reuploadCount,
      },
      data: leadsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadDetails = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('loanCategory')
      .populate('preferredBank')
      .populate({
        path: 'partnerId',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('statusHistory.changedBy', 'name email role');

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead file not found.',
      });
    }

    // Role check: Officer can view files assigned to them or created by them
    const isAssigned = lead.assignedTo && lead.assignedTo.toString() === employee._id.toString();
    const isCreator = lead.creatorEmployee && lead.creatorEmployee.toString() === employee._id.toString();
    if (!isAssigned && !isCreator) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. This loan file is not assigned to or created by your desk.',
      });
    }

    const [applications, documents] = await Promise.all([
      LoanApplication.find({ lead: lead._id }),
      Document.find({ lead: lead._id })
        .populate('uploadedBy', 'name email role')
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: 1 }),
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        lead,
        applications,
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { id } = req.params;
    const {
      status,
      remarks = '',
      sanctionedAmount,
      sanctionDate,
      sanctionReferenceNumber,
      disbursedAmount,
      disbursementDate,
      disbursementReferenceNumber,
    } = req.body;

    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid lead status. Must be one of: ${LEAD_STATUSES.join(', ')}`,
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead file not found.',
      });
    }

    if (!lead.assignedTo || lead.assignedTo.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only update loan files assigned to you.',
      });
    }

    // Requirement 6: Enforce completed KYC document verification before advancing past In Process stage
    if (['Sanction', 'Disbursement', 'PDD', 'Payout'].includes(status)) {
      if ((lead.documentVerificationStatus || '').toLowerCase() !== 'verified') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot advance file to '${status}'. All 3 mandatory KYC documents (Aadhaar Card, PAN Card, and Bank Proof) must be Fully Verified before advancing past appraisal stage. Current document verification status: ${lead.documentVerificationStatus || 'pending'}.`,
        });
      }
    }

    const previousStatus = lead.status;
    lead.status = status;

    // Sanction stage update
    if (status === 'Sanction' || sanctionedAmount) {
      if (sanctionedAmount) lead.sanctionedAmount = Number(sanctionedAmount);
      if (sanctionDate) lead.sanctionDate = new Date(sanctionDate);
      if (sanctionReferenceNumber) lead.sanctionReferenceNumber = sanctionReferenceNumber.trim();
    }

    // Disbursement stage update & automatic partner payout trigger
    if (status === 'Disbursement' || disbursedAmount) {
      if (disbursedAmount) lead.disbursedAmount = Number(disbursedAmount);
      else if (!lead.disbursedAmount) lead.disbursedAmount = lead.requiredLoanAmount;
      if (disbursementDate) lead.disbursementDate = new Date(disbursementDate);
      else if (!lead.disbursementDate) lead.disbursementDate = new Date();
      if (disbursementReferenceNumber) lead.disbursementReferenceNumber = disbursementReferenceNumber.trim();

      // IF PARTNER REFERRAL: trigger immediate payout eligibility and auto-generate Payout
      if (lead.source === 'partner' && lead.partnerId) {
        lead.isEligibleForPayout = true;
        if (lead.payoutStatus === 'not_eligible') {
          lead.payoutStatus = 'eligible';
        }

        const existingPayout = await Payout.findOne({ lead: lead._id });
        if (!existingPayout) {
          const partner = await Partner.findById(lead.partnerId);
          if (partner) {
            const commissionRate = partner.defaultCommissionRate || 1.5;
            const loanDisbursed = lead.disbursedAmount || lead.requiredLoanAmount;
            const grossCommission = (loanDisbursed * commissionRate) / 100;
            const tdsAmount = (grossCommission * 5) / 100;
            const netPayout = grossCommission - tdsAmount;

            const payoutDoc = new Payout({
              payoutNumber: `RCPAY-${Date.now().toString().slice(-6)}`,
              lead: lead._id,
              partner: partner._id,
              partnerUser: partner.user,
              disbursedLoanAmount: loanDisbursed,
              commissionType: 'percentage',
              commissionRate,
              grossCommissionAmount: grossCommission,
              tdsRate: 5,
              tdsAmount,
              netPayoutAmount: netPayout,
              status: 'pending',
              remarks: `Automatic payout generated upon Employee progressing file to Disbursement.`,
            });
            await payoutDoc.save();
            lead.payoutId = payoutDoc._id;
            lead.payoutStatus = 'pending';

            partner.totalDisbursedAmount += loanDisbursed;
            await partner.save();
          }
        }
      }
    }

    // Append to status history
    lead.statusHistory.push({
      status,
      previousStatus,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      remarks: remarks.trim() || `Status updated from ${previousStatus} to ${status} by Loan Officer.`,
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('loanCategory')
      .populate('preferredBank')
      .populate('statusHistory.changedBy', 'name email role');

    return res.status(200).json({
      status: 'success',
      message: `Lead status updated to ${status}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const addLeadDocument = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { id } = req.params;
    const {
      documentType = 'other',
      title,
      documentName,
      fileName,
      filePath,
      fileUrl,
      fileSize,
      mimeType,
      remarks,
    } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead file not found.',
      });
    }

    if (!lead.assignedTo || lead.assignedTo.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only attach documents to your assigned files.',
      });
    }

    const doc = new Document({
      lead: lead._id,
      documentType,
      title: title?.trim() || documentName?.trim() || 'Customer Verification Document',
      fileName: fileName?.trim() || 'document.pdf',
      filePath: filePath?.trim() || fileUrl?.trim() || '/uploads/documents/sample-kyc.pdf',
      fileSize: Number(fileSize) || 102400,
      mimeType: mimeType?.trim() || 'application/pdf',
      uploadedBy: req.user._id,
      verificationStatus: 'verified',
      remarks: remarks?.trim() || '',
    });

    await doc.save();

    // Increment document count on lead
    lead.documentsCount += 1;
    await lead.save();

    return res.status(201).json({
      status: 'success',
      message: 'Document recorded successfully.',
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. SUPPORT & CALLBACKS ASSIGNED
// ==========================================
export const getAssignedCallbacks = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { status } = req.query;

    const filter = {
      $or: [{ assignedTo: employee._id }, { status: 'pending' }],
    };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const callbacks = await CallbackRequest.find(filter)
      .populate('assignedTo', 'employeeId designation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: callbacks.length,
      data: callbacks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCallback = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);
    const { id } = req.params;
    const { status, remarks } = req.body;

    const callback = await CallbackRequest.findById(id);
    if (!callback) {
      return res.status(404).json({
        status: 'error',
        message: 'Callback request not found.',
      });
    }

    if (status) callback.status = status;
    if (remarks !== undefined) callback.remarks = remarks.trim();
    if (!callback.assignedTo) callback.assignedTo = employee._id;

    await callback.save();

    return res.status(200).json({
      status: 'success',
      message: 'Callback inquiry updated.',
      data: callback,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. EMPLOYEE LEAD CREATION (OFFICER SOURCING)
// ==========================================
export const createLead = async (req, res, next) => {
  try {
    const employee = await getEmployeeForUser(req.user._id);

    if (employee.accountStatus && employee.accountStatus !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Your employee account is currently inactive. Cannot create new customer leads.',
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
        message: `Invalid employment type '${employmentType}'. Allowed types: ${EMPLOYMENT_TYPES.join(', ')}`,
      });
    }

    const categoryDoc = await LoanCategory.findById(loanCategory);
    if (!categoryDoc) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid loan category selected.',
      });
    }

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
          message: 'The selected bank is inactive or unavailable for new applications.',
        });
      }
    }

    // Unique Lead ID formatted with RCL-E-
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const leadId = `RCL-E-${Date.now().toString().slice(-6)}${randomSuffix}`;

    const newLead = new Lead({
      leadId,
      source: 'employee',
      createdBy: req.user._id,
      creatorEmployee: employee._id,
      creatorEmployeeId: employee.employeeId,
      creatorEmployeeName: req.user.name,
      assignedTo: employee._id,
      assignedAt: new Date(),
      assignedBy: req.user._id,
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
      remarks: remarks ? remarks.trim() : '',
      statusHistory: [
        {
          status: 'Lead',
          previousStatus: null,
          changedBy: req.user._id,
          changedByName: req.user.name,
          changedAt: new Date(),
          remarks: `Lead sourced and initiated by loan officer ${req.user.name} (${employee.employeeId})`,
        },
      ],
    });

    await newLead.save();

    // Save uploaded KYC documents
    const savedDocs = await saveLeadDocuments({
      lead: newLead,
      files: req.files,
      uploadedBy: req.user._id,
      uploadedByRole: 'employee',
    });

    const populatedLead = await Lead.findById(newLead._id)
      .populate('loanCategory', 'name slug interestRateStartingFrom')
      .populate('preferredBank', 'name bankCode')
      .populate({
        path: 'creatorEmployee',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'assignedTo',
        populate: { path: 'user', select: 'name email phone' },
      });

    return res.status(201).json({
      status: 'success',
      message: `Customer lead created successfully with ID ${leadId}.`,
      data: {
        ...populatedLead.toObject(),
        documentsCount: savedDocs.length,
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
  getAssignedLeads,
  getDocumentVerificationLeads,
  getLeadDetails,
  updateLeadStatus,
  addLeadDocument,
  getAssignedCallbacks,
  updateCallback,
};
