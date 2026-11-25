import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';
import Lead from '../models/Lead.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DOCS_DIR = path.join(__dirname, '../uploads/documents');

// Helper to resolve employee record for a user
const getEmployeeForUser = async (userId) => {
  return await Employee.findOne({ user: userId });
};

// Helper to resolve partner record for a user
const getPartnerForUser = async (userId) => {
  return await Partner.findOne({ user: userId });
};

// Helper to resolve absolute file path
const resolveFilePath = (filePath, fileName) => {
  if (filePath && path.isAbsolute(filePath) && fs.existsSync(filePath)) {
    return filePath;
  }
  if (filePath) {
    const relAttempt = path.resolve(__dirname, '..', filePath.replace(/^\/?/, ''));
    if (fs.existsSync(relAttempt)) return relAttempt;
  }
  if (fileName) {
    const directAttempt = path.join(DEFAULT_DOCS_DIR, fileName);
    if (fs.existsSync(directAttempt)) return directAttempt;
  }
  return null;
};

// Helper to save documents from multipart uploaded files
export const saveLeadDocuments = async ({
  lead,
  files,
  uploadedBy = null,
  uploadedByRole = 'customer',
}) => {
  if (!files || typeof files !== 'object') return [];
  const createdDocs = [];

  const mappings = [
    {
      keys: ['aadhaarCard', 'aadhaar_card'],
      type: 'aadhaar_card',
      title: 'Aadhaar Card',
    },
    {
      keys: ['panCard', 'pan_card'],
      type: 'pan_card',
      title: 'PAN Card',
    },
    {
      keys: ['bankProof', 'bank_proof'],
      type: 'bank_proof',
      title: 'Bank Proof (Cancelled Cheque / Passbook)',
    },
    {
      keys: ['salarySlip', 'salary_slip'],
      type: 'salary_slip',
      title: 'Salary Slip',
    },
    {
      keys: ['itr'],
      type: 'itr',
      title: 'ITR Filing',
    },
  ];

  for (const item of mappings) {
    let fileObj = null;
    for (const k of item.keys) {
      if (files[k] && Array.isArray(files[k]) && files[k].length > 0) {
        fileObj = files[k][0];
        break;
      } else if (files[k] && files[k].filename) {
        fileObj = files[k];
        break;
      }
    }

    if (fileObj) {
      const doc = new Document({
        lead: lead._id,
        documentType: item.type,
        title: item.title,
        fileName: fileObj.filename,
        originalName: fileObj.originalname || fileObj.filename,
        filePath: fileObj.path,
        fileSize: fileObj.size,
        mimeType: fileObj.mimetype || 'application/pdf',
        uploadedBy: uploadedBy || null,
        uploadedByRole,
        verificationStatus: 'pending',
      });
      await doc.save();
      createdDocs.push(doc);
    }
  }

  // Automatically recalculate verification status and documents count
  await lead.recalculateDocumentVerificationStatus();
  await lead.save();

  return createdDocs;
};

// ==========================================
// 1. GET ALL DOCUMENTS FOR A SPECIFIC LEAD
// ==========================================
export const getLeadDocuments = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated lead record not found.',
      });
    }

    // Role-based authorization
    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user._id);
      const isAssigned = lead.assignedTo && employee && lead.assignedTo.toString() === employee._id.toString();
      const isCreator = lead.creatorEmployee && employee && lead.creatorEmployee.toString() === employee._id.toString();
      if (!isAssigned && !isCreator) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only view documents for leads assigned to or created by you.',
        });
      }
    } else if (req.user.role === 'partner') {
      const partner = await getPartnerForUser(req.user._id);
      if (!lead.partnerId || !partner || lead.partnerId.toString() !== partner._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only view documents for your referred leads.',
        });
      }
    }

    const documents = await Document.find({ lead: lead._id })
      .populate('uploadedBy', 'name email role')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      status: 'success',
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. VIEW DOCUMENT (INLINE SECURE STREAMING)
// ==========================================
export const viewDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id).populate('lead');
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = doc.lead;

    // Check authorization: Partner KYC documents vs Lead documents
    if (doc.partner) {
      if (req.user.role === 'admin') {
        // Authorized: Admin has full oversight on partner KYC compliance
      } else if (req.user.role === 'partner') {
        const partner = await getPartnerForUser(req.user._id);
        if (!partner || doc.partner.toString() !== partner._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only view your own partner KYC documents.',
          });
        }
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. Partner KYC documents are strictly restricted to Admin and the owning Partner.',
        });
      }
    } else {
      // Lead document authorization: Admin, assigned/creator Employee, or referral Partner
      if (req.user.role === 'employee') {
        const employee = await getEmployeeForUser(req.user._id);
        const isAssigned = lead?.assignedTo && employee && lead.assignedTo.toString() === employee._id.toString();
        const isCreator = lead?.creatorEmployee && employee && lead.creatorEmployee.toString() === employee._id.toString();
        if (!isAssigned && !isCreator) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only view documents for files assigned to or created by you.',
          });
        }
      } else if (req.user.role === 'partner') {
        const partner = await getPartnerForUser(req.user._id);
        if (!lead?.partnerId || !partner || lead.partnerId.toString() !== partner._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only view documents for your referred leads.',
          });
        }
      }
    }

    const absPath = resolveFilePath(doc.filePath, doc.fileName);
    if (!absPath || !fs.existsSync(absPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Physical document file not found on storage disk.',
      });
    }

    const mime = doc.mimeType || 'application/pdf';
    const filename = encodeURIComponent(doc.originalName || doc.fileName || 'document.pdf');

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const stream = fs.createReadStream(absPath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. DOWNLOAD DOCUMENT (SECURE ATTACHMENT)
// ==========================================
export const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await Document.findById(id).populate('lead');
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = doc.lead;

    // Check authorization: Partner KYC documents vs Lead documents
    if (doc.partner) {
      if (req.user.role === 'admin') {
        // Authorized: Admin can download partner KYC documents
      } else if (req.user.role === 'partner') {
        const partner = await getPartnerForUser(req.user._id);
        if (!partner || doc.partner.toString() !== partner._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only download your own partner KYC documents.',
          });
        }
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. Partner KYC documents are strictly restricted to Admin and the owning Partner.',
        });
      }
    } else {
      // Role-based authorization for Lead documents
      if (req.user.role === 'employee') {
        const employee = await getEmployeeForUser(req.user._id);
        const isAssigned = lead?.assignedTo && employee && lead.assignedTo.toString() === employee._id.toString();
        const isCreator = lead?.creatorEmployee && employee && lead.creatorEmployee.toString() === employee._id.toString();
        if (!isAssigned && !isCreator) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only download documents for files assigned to or created by you.',
          });
        }
      } else if (req.user.role === 'partner') {
        const partner = await getPartnerForUser(req.user._id);
        if (!lead?.partnerId || !partner || lead.partnerId.toString() !== partner._id.toString()) {
          return res.status(403).json({
            status: 'error',
            message: 'Access denied. You can only download documents for your referred leads.',
          });
        }
      }
    }

    const absPath = resolveFilePath(doc.filePath, doc.fileName);
    if (!absPath || !fs.existsSync(absPath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Physical document file not found on storage disk.',
      });
    }

    const mime = doc.mimeType || 'application/octet-stream';
    const filename = encodeURIComponent(doc.originalName || doc.fileName || 'document');

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const stream = fs.createReadStream(absPath);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. VERIFY DOCUMENT (EMPLOYEE ONLY)
// ==========================================
export const verifyDocument = async (req, res, next) => {
  try {
    // Admin check: Strict architectural constraint
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'Only assigned loan officers/employees can verify KYC documents. Admins are restricted to file assignment.',
      });
    }

    const employee = await getEmployeeForUser(req.user._id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan officer profile not found.',
      });
    }

    const { id } = req.params;
    const { remarks = '' } = req.body;

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = await Lead.findById(doc.lead);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated lead not found.',
      });
    }

    // Must be assigned to this employee
    if (!lead.assignedTo || lead.assignedTo.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only verify documents for files assigned to you.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'verified';
    doc.verifiedBy = req.user._id;
    doc.verifiedByEmployee = employee._id;
    doc.verifiedByName = req.user.name;
    doc.verifiedAt = new Date();
    doc.rejectionReason = '';
    doc.reuploadReason = '';
    if (remarks) doc.remarks = remarks.trim();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'verified',
      changedBy: req.user._id,
      changedByEmployee: employee._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      reason: remarks.trim() || 'Document verified by Loan Officer',
      remarks: remarks.trim(),
    });

    await doc.save();

    // Recalculate overall lead verification status
    await lead.recalculateDocumentVerificationStatus();
    await lead.save();

    return res.status(200).json({
      status: 'success',
      message: `${doc.title} verified successfully.`,
      data: {
        document: doc,
        lead: {
          _id: lead._id,
          leadId: lead.leadId,
          documentVerificationStatus: lead.documentVerificationStatus,
          documentsCount: lead.documentsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. REJECT DOCUMENT (EMPLOYEE ONLY)
// ==========================================
export const rejectDocument = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'Only assigned loan officers/employees can reject KYC documents.',
      });
    }

    const employee = await getEmployeeForUser(req.user._id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan officer profile not found.',
      });
    }

    const { id } = req.params;
    const { reason = '', remarks = '' } = req.body;
    const finalReason = reason.trim() || remarks.trim();

    if (!finalReason) {
      return res.status(400).json({
        status: 'error',
        message: 'A mandatory rejection reason is required.',
      });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = await Lead.findById(doc.lead);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated lead not found.',
      });
    }

    if (!lead.assignedTo || lead.assignedTo.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only reject documents for files assigned to you.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'rejected';
    doc.rejectionReason = finalReason;
    doc.verifiedBy = req.user._id;
    doc.verifiedByEmployee = employee._id;
    doc.verifiedByName = req.user.name;
    doc.verifiedAt = new Date();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'rejected',
      changedBy: req.user._id,
      changedByEmployee: employee._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      reason: finalReason,
      remarks: remarks.trim() || finalReason,
    });

    await doc.save();

    // Recalculate overall lead verification status
    await lead.recalculateDocumentVerificationStatus();
    await lead.save();

    return res.status(200).json({
      status: 'success',
      message: `${doc.title} marked as rejected.`,
      data: {
        document: doc,
        lead: {
          _id: lead._id,
          leadId: lead.leadId,
          documentVerificationStatus: lead.documentVerificationStatus,
          documentsCount: lead.documentsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. REQUEST RE-UPLOAD (EMPLOYEE ONLY)
// ==========================================
export const requestReupload = async (req, res, next) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        status: 'error',
        message: 'Only assigned loan officers/employees can request document re-upload.',
      });
    }

    const employee = await getEmployeeForUser(req.user._id);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Loan officer profile not found.',
      });
    }

    const { id } = req.params;
    const { reason = '', remarks = '' } = req.body;
    const finalReason = reason.trim() || remarks.trim();

    if (!finalReason) {
      return res.status(400).json({
        status: 'error',
        message: 'A mandatory reason for requesting re-upload is required.',
      });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = await Lead.findById(doc.lead);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated lead not found.',
      });
    }

    if (!lead.assignedTo || lead.assignedTo.toString() !== employee._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only request re-upload for files assigned to you.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'reupload_required';
    doc.reuploadReason = finalReason;
    doc.verifiedBy = req.user._id;
    doc.verifiedByEmployee = employee._id;
    doc.verifiedByName = req.user.name;
    doc.verifiedAt = new Date();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'reupload_required',
      changedBy: req.user._id,
      changedByEmployee: employee._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      reason: finalReason,
      remarks: remarks.trim() || finalReason,
    });

    await doc.save();

    // Recalculate overall lead verification status
    await lead.recalculateDocumentVerificationStatus();
    await lead.save();

    return res.status(200).json({
      status: 'success',
      message: `Re-upload request recorded for ${doc.title}.`,
      data: {
        document: doc,
        lead: {
          _id: lead._id,
          leadId: lead.leadId,
          documentVerificationStatus: lead.documentVerificationStatus,
          documentsCount: lead.documentsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. RE-UPLOAD / REPLACE DOCUMENT FILE
// ==========================================
export const reuploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No replacement file uploaded.',
      });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found.',
      });
    }

    const lead = await Lead.findById(doc.lead);
    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Associated lead not found.',
      });
    }

    // Authorization: Admin, assigned/creator employee, or lead partner
    if (req.user.role === 'employee') {
      const employee = await getEmployeeForUser(req.user._id);
      const isAssigned = lead.assignedTo && employee && lead.assignedTo.toString() === employee._id.toString();
      const isCreator = lead.creatorEmployee && employee && lead.creatorEmployee.toString() === employee._id.toString();
      if (!isAssigned && !isCreator) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only re-upload documents for your assigned or created files.',
        });
      }
    } else if (req.user.role === 'partner') {
      const partner = await getPartnerForUser(req.user._id);
      if (!lead.partnerId || !partner || lead.partnerId.toString() !== partner._id.toString()) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only re-upload documents for your referred leads.',
        });
      }
    }

    const previousStatus = doc.verificationStatus;
    doc.fileName = req.file.filename;
    doc.originalName = req.file.originalname;
    doc.filePath = req.file.path;
    doc.fileSize = req.file.size;
    doc.mimeType = req.file.mimetype;
    doc.verificationStatus = 'pending';
    doc.rejectionReason = '';
    doc.reuploadReason = '';

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'pending',
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      reason: 'Replacement document uploaded by user',
      remarks: `Replaced with ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
    });

    await doc.save();

    await lead.recalculateDocumentVerificationStatus();
    await lead.save();

    return res.status(200).json({
      status: 'success',
      message: `${doc.title} re-uploaded successfully and reset to pending verification.`,
      data: {
        document: doc,
        lead: {
          _id: lead._id,
          leadId: lead.leadId,
          documentVerificationStatus: lead.documentVerificationStatus,
          documentsCount: lead.documentsCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
