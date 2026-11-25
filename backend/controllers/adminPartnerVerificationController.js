import mongoose from 'mongoose';
import Partner from '../models/Partner.js';
import User from '../models/User.js';
import Document from '../models/Document.js';

// ==========================================
// 1. GET ALL PARTNER REGISTRATION REQUESTS WITH METRICS
// ==========================================
export const getAllPartnerVerifications = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const baseFilter = {};
    if (status && status !== 'all') {
      if (['RESUBMISSION_REQUIRED', 'resubmission_required', 'reupload_required'].includes(status)) {
        baseFilter.registrationStatus = {
          $in: ['RESUBMISSION_REQUIRED', 'resubmission_required', 'reupload_required', 'action_required'],
        };
      } else {
        baseFilter.registrationStatus = new RegExp(`^${status}$`, 'i');
      }
    }

    const partners = await Partner.find(baseFilter)
      .populate('user', 'name email phone role status createdAt lastLogin')
      .populate('approvedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Fetch documents for each partner to get real-time document metrics
    const partnerIds = partners.map((p) => p._id);
    const allDocs = await Document.find({ partner: { $in: partnerIds } });

    // Search filter across partnerCode, registrationId, businessName, panNumber, user details
    let results = partners.map((partner) => {
      const partnerObj = partner.toObject();
      const pDocs = allDocs.filter((d) => d.partner.toString() === partner._id.toString());

      const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
      const verifiedDocsCount = pDocs.filter(
        (d) => (d.verificationStatus || '').toLowerCase() === 'verified'
      ).length;
      const rejectedDocsCount = pDocs.filter(
        (d) => (d.verificationStatus || '').toLowerCase() === 'rejected'
      ).length;
      const reuploadDocsCount = pDocs.filter((d) =>
        ['reupload_required', 'action_required', 're-upload required'].includes(
          (d.verificationStatus || '').toLowerCase()
        )
      ).length;

      const allMandatoryVerified =
        mandatoryTypes.every((t) =>
          pDocs.some(
            (d) => d.documentType === t && (d.verificationStatus || '').toLowerCase() === 'verified'
          )
        );

      return {
        ...partnerObj,
        documents: pDocs,
        documentsSummary: {
          totalSubmitted: pDocs.length,
          verifiedCount: verifiedDocsCount,
          rejectedCount: rejectedDocsCount,
          reuploadCount: reuploadDocsCount,
          mandatoryTotal: 3,
          allMandatoryVerified,
          progressPercent: Math.min(100, Math.round((verifiedDocsCount / 3) * 100)),
        },
      };
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter((p) => {
        return (
          p.registrationId?.toLowerCase().includes(q) ||
          p.partnerCode?.toLowerCase().includes(q) ||
          p.businessName?.toLowerCase().includes(q) ||
          p.panNumber?.toLowerCase().includes(q) ||
          p.user?.name?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q) ||
          p.user?.phone?.includes(q) ||
          p.address?.city?.toLowerCase().includes(q)
        );
      });
    }

    // Compute overarching metrics across entire partner network
    const [allCount, pendingCount, approvedCount, rejectedCount, resubmissionCount] =
      await Promise.all([
        Partner.countDocuments({}),
        Partner.countDocuments({
          registrationStatus: { $in: ['PENDING', 'pending'] },
        }),
        Partner.countDocuments({
          registrationStatus: { $in: ['APPROVED', 'approved'] },
        }),
        Partner.countDocuments({
          registrationStatus: { $in: ['REJECTED', 'rejected'] },
        }),
        Partner.countDocuments({
          registrationStatus: {
            $in: [
              'RESUBMISSION_REQUIRED',
              'resubmission_required',
              'reupload_required',
              'action_required',
            ],
          },
        }),
      ]);

    return res.status(200).json({
      status: 'success',
      count: results.length,
      metrics: {
        totalPartners: allCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        resubmissionCount,
      },
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. GET SINGLE PARTNER REGISTRATION FILE BY ID
// ==========================================
export const getPartnerVerificationDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id)
      .populate('user', 'name email phone role status createdAt lastLogin')
      .populate('approvedBy', 'name email role');

    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner registration record not found.',
      });
    }

    const documents = await Document.find({ partner: partner._id })
      .populate('uploadedBy', 'name email role')
      .populate('verifiedBy', 'name email role')
      .sort({ createdAt: 1 });

    const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
    const verifiedDocsCount = documents.filter(
      (d) => (d.verificationStatus || '').toLowerCase() === 'verified'
    ).length;
    const allMandatoryVerified = mandatoryTypes.every((t) =>
      documents.some(
        (d) => d.documentType === t && (d.verificationStatus || '').toLowerCase() === 'verified'
      )
    );

    return res.status(200).json({
      status: 'success',
      data: {
        partner: partner.toObject(),
        documents,
        documentsSummary: {
          totalSubmitted: documents.length,
          verifiedCount: verifiedDocsCount,
          mandatoryTotal: 3,
          allMandatoryVerified,
          progressPercent: Math.min(100, Math.round((verifiedDocsCount / 3) * 100)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. VERIFY INDIVIDUAL PARTNER KYC DOCUMENT
// ==========================================
export const verifyPartnerDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { remarks = '' } = req.body;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner record not found.',
      });
    }

    const doc = await Document.findOne({ _id: docId, partner: partner._id });
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found for this partner.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'verified';
    doc.verificationRemarks = remarks.trim();
    doc.rejectionReason = '';
    doc.reuploadReason = '';
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'verified',
      timestamp: new Date(),
      remarks: remarks.trim() || 'Document verified & approved by Admin',
    });

    await doc.save();

    // Sync partner.kycDocuments item if present
    const kycItem = partner.kycDocuments.find(
      (k) => k.document && k.document.toString() === doc._id.toString()
    );
    if (kycItem) {
      kycItem.status = 'verified';
      kycItem.verifiedAt = new Date();
      kycItem.verifiedBy = req.user._id;
      kycItem.rejectionReason = '';
      kycItem.reuploadReason = '';
    } else {
      partner.kycDocuments.push({
        document: doc._id,
        documentType: doc.documentType,
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
      });
    }

    // Check if all 3 mandatory documents are now verified
    const allPartnerDocs = await Document.find({ partner: partner._id });
    const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
    const allMandatoryVerified = mandatoryTypes.every((t) =>
      allPartnerDocs.some(
        (d) =>
          d.documentType === t &&
          (d._id.toString() === doc._id.toString()
            ? true
            : (d.verificationStatus || '').toLowerCase() === 'verified')
      )
    );

    if (allMandatoryVerified) {
      partner.kycStatus = 'verified';
    }

    await partner.save();

    return res.status(200).json({
      status: 'success',
      message: `Document "${doc.title}" verified successfully.`,
      data: {
        document: doc,
        allMandatoryVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. REJECT INDIVIDUAL PARTNER KYC DOCUMENT
// ==========================================
export const rejectPartnerDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Rejection reason is mandatory.',
      });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner record not found.',
      });
    }

    const doc = await Document.findOne({ _id: docId, partner: partner._id });
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found for this partner.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'rejected';
    doc.rejectionReason = reason.trim();
    doc.reuploadReason = '';
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'rejected',
      timestamp: new Date(),
      remarks: `Rejected by Admin: ${reason.trim()}`,
    });

    await doc.save();

    // Update partner kycDocuments and partner overall status
    const kycItem = partner.kycDocuments.find(
      (k) => k.document && k.document.toString() === doc._id.toString()
    );
    if (kycItem) {
      kycItem.status = 'rejected';
      kycItem.rejectionReason = reason.trim();
    }

    partner.kycStatus = 'rejected';
    partner.registrationStatus = 'REJECTED';
    partner.accountStatus = 'inactive';
    partner.rejectionRemarks = reason.trim();
    await partner.save();

    await User.findByIdAndUpdate(partner.user, { status: 'inactive' });

    return res.status(200).json({
      status: 'success',
      message: `Document "${doc.title}" was rejected.`,
      data: {
        document: doc,
        partnerStatus: partner.registrationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. REQUEST RE-UPLOAD FOR INDIVIDUAL PARTNER KYC DOCUMENT
// ==========================================
export const requestReuploadPartnerDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Specific re-upload instructions/reason are mandatory.',
      });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner record not found.',
      });
    }

    const doc = await Document.findOne({ _id: docId, partner: partner._id });
    if (!doc) {
      return res.status(404).json({
        status: 'error',
        message: 'Document record not found for this partner.',
      });
    }

    const previousStatus = doc.verificationStatus;
    doc.verificationStatus = 'reupload_required';
    doc.reuploadReason = reason.trim();
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();

    doc.verificationHistory.push({
      previousStatus,
      newStatus: 'reupload_required',
      timestamp: new Date(),
      remarks: `Re-upload requested by Admin: ${reason.trim()}`,
    });

    await doc.save();

    const kycItem = partner.kycDocuments.find(
      (k) => k.document && k.document.toString() === doc._id.toString()
    );
    if (kycItem) {
      kycItem.status = 'reupload_required';
      kycItem.reuploadReason = reason.trim();
    }

    partner.kycStatus = 'reupload_required';
    partner.registrationStatus = 'RESUBMISSION_REQUIRED';
    partner.accountStatus = 'inactive';
    partner.reuploadRemarks = reason.trim();
    await partner.save();

    await User.findByIdAndUpdate(partner.user, { status: 'inactive' });

    return res.status(200).json({
      status: 'success',
      message: `Re-upload requested for "${doc.title}". Partner notified to resubmit document.`,
      data: {
        document: doc,
        partnerStatus: partner.registrationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. FINAL PARTNER APPROVAL (REQUIRES ALL 3 MANDATORY DOCS VERIFIED)
// ==========================================
export const approvePartnerRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner registration record not found.',
      });
    }

    // Verify all 3 mandatory KYC documents: Aadhaar, PAN, Bank Proof
    const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
    const docs = await Document.find({ partner: partner._id });

    const unverifiedTypes = [];
    for (const type of mandatoryTypes) {
      const match = docs.find(
        (d) => d.documentType === type && (d.verificationStatus || '').toLowerCase() === 'verified'
      );
      if (!match) {
        const typeLabel =
          type === 'aadhaar_card'
            ? 'Aadhaar Card'
            : type === 'pan_card'
            ? 'PAN Card'
            : 'Bank Proof (Cancelled Cheque / Passbook)';
        unverifiedTypes.push(typeLabel);
      }
    }

    if (unverifiedTypes.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot approve partner registration. The following mandatory KYC documents are not yet verified: ${unverifiedTypes.join(
          ', '
        )}. All 3 documents must be individually verified first.`,
        unverifiedTypes,
      });
    }

    // Activate partner and linked user
    partner.registrationStatus = 'APPROVED';
    partner.accountStatus = 'active';
    partner.kycStatus = 'verified';
    partner.approvedAt = new Date();
    partner.approvedBy = req.user._id;
    partner.rejectionRemarks = '';
    partner.reuploadRemarks = '';

    await partner.save();
    await User.findByIdAndUpdate(partner.user, { status: 'active' });

    const populated = await Partner.findById(partner._id)
      .populate('user', 'name email phone role status')
      .populate('approvedBy', 'name email role');

    return res.status(200).json({
      status: 'success',
      message: `Partner ${partner.partnerCode} (${populated.user?.name}) has been approved and activated successfully. Partner CRM login is now enabled.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. FINAL PARTNER REJECTION
// ==========================================
export const rejectPartnerRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Mandatory rejection remarks must be provided.',
      });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner registration record not found.',
      });
    }

    partner.registrationStatus = 'REJECTED';
    partner.accountStatus = 'inactive';
    partner.kycStatus = 'rejected';
    partner.rejectionRemarks = remarks.trim();
    await partner.save();

    await User.findByIdAndUpdate(partner.user, { status: 'inactive' });

    return res.status(200).json({
      status: 'success',
      message: `Partner registration ${partner.partnerCode} has been marked as REJECTED.`,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. FINAL PARTNER REQUEST RESUBMISSION
// ==========================================
export const requestPartnerResubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Mandatory instructions/remarks must be provided for document resubmission.',
      });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner registration record not found.',
      });
    }

    partner.registrationStatus = 'RESUBMISSION_REQUIRED';
    partner.accountStatus = 'inactive';
    partner.kycStatus = 'reupload_required';
    partner.reuploadRemarks = remarks.trim();
    await partner.save();

    await User.findByIdAndUpdate(partner.user, { status: 'inactive' });

    return res.status(200).json({
      status: 'success',
      message: `Partner registration ${partner.partnerCode} updated to RESUBMISSION_REQUIRED. Partner is restricted to document resubmission.`,
      data: partner,
    });
  } catch (error) {
    next(error);
  }
};
