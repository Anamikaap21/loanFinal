import mongoose from 'mongoose';

export const LEAD_STATUSES = [
  'Lead',
  'Login',
  'In Process',
  'Sanction',
  'Disbursement',
  'PDD',
  'Payout',
  'Cancelled',
];

export const EMPLOYMENT_TYPES = [
  'Salaried',
  'Self-Employed Professional',
  'Self-Employed Business',
  'Director / Partner',
  'Other',
  // Preserved lowercase enum values for backward compatibility
  'salaried',
  'self_employed',
  'business',
  'other',
];

const leadSchema = new mongoose.Schema(
  {
    leadId: {
      type: String,
      required: [true, 'Lead ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      enum: {
        values: ['website', 'partner', 'employee', 'EMPLOYEE'],
        message: 'Lead source must be website, partner, or employee',
      },
      required: [true, 'Lead source is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    creatorEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    creatorEmployeeId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    creatorEmployeeName: {
      type: String,
      trim: true,
      default: '',
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer mobile number is required'],
      trim: true,
      index: true,
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: {
        values: EMPLOYMENT_TYPES,
        message: `'{VALUE}' is not a valid enum value for path 'employmentType'. Allowed options are: ${EMPLOYMENT_TYPES.join(', ')}`,
      },
      default: 'Salaried',
    },
    otherEmploymentDetails: {
      type: String,
      trim: true,
      default: '',
    },
    loanCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanCategory',
      required: [true, 'Loan category is required'],
    },
    categoryName: {
      type: String,
      trim: true,
      default: '',
    },
    preferredBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      default: null,
    },
    bankName: {
      type: String,
      trim: true,
      default: '',
    },
    requiredLoanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [10000, 'Loan amount must be at least ₹10,000'],
    },
    tenureMonths: {
      type: Number,
      default: 60,
    },
    additionalDetails: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: LEAD_STATUSES,
        message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
      },
      default: 'Lead',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        previousStatus: { type: String, default: null },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedByName: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
        remarks: { type: String, default: '' },
      },
    ],
    // Sanction stage details
    sanctionedAmount: {
      type: Number,
      default: 0,
    },
    sanctionDate: {
      type: Date,
      default: null,
    },
    sanctionReferenceNumber: {
      type: String,
      default: '',
    },
    // Disbursement stage details (triggers immediate partner payout eligibility)
    disbursedAmount: {
      type: Number,
      default: 0,
    },
    disbursementDate: {
      type: Date,
      default: null,
    },
    disbursementReferenceNumber: {
      type: String,
      default: '',
    },
    // Payout Tracking
    isEligibleForPayout: {
      type: Boolean,
      default: false,
      index: true,
    },
    payoutStatus: {
      type: String,
      enum: ['not_eligible', 'eligible', 'pending', 'completed'],
      default: 'not_eligible',
      index: true,
    },
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
      default: null,
    },
    documentVerificationStatus: {
      type: String,
      enum: [
        'pending',
        'incomplete',
        'under_review',
        'verified',
        'rejected',
        'action_required',
        'reupload_required',
        'Pending',
        'Verified',
        'Rejected',
        'Re-upload Required',
      ],
      default: 'pending',
      index: true,
    },
    documentsCount: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for high performance querying in CRM tables
leadSchema.index({ source: 1, status: 1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ creatorEmployee: 1, status: 1 });
leadSchema.index({ partnerId: 1, status: 1 });
leadSchema.index({ createdAt: -1 });

// Ensure direct website and employee leads never carry a partner ID
leadSchema.pre('save', function (next) {
  if (this.source === 'website' || this.source === 'employee' || this.source === 'EMPLOYEE') {
    this.partnerId = null;
    this.isEligibleForPayout = false;
    this.payoutStatus = 'not_eligible';
  } else if (this.source === 'partner' && this.status === 'Disbursement' && !this.payoutId) {
    // When a partner lead reaches disbursement, it is immediately eligible for payout
    this.isEligibleForPayout = true;
    if (this.payoutStatus === 'not_eligible') {
      this.payoutStatus = 'eligible';
    }
  }
  next();
});

leadSchema.methods.recalculateDocumentVerificationStatus = async function () {
  const Document = mongoose.model('Document');
  const docs = await Document.find({ lead: this._id });
  const requiredTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];

  const foundTypes = docs.map((d) => d.documentType);
  const hasAllRequired = requiredTypes.every((t) => foundTypes.includes(t));

  if (docs.length === 0 || !hasAllRequired) {
    this.documentVerificationStatus = 'pending';
    this.documentsCount = docs.length;
    return this.documentVerificationStatus;
  }

  const anyRejected = docs.some((d) => (d.verificationStatus || '').toLowerCase() === 'rejected');
  const anyReupload = docs.some((d) =>
    ['reupload_required', 're-upload required'].includes((d.verificationStatus || '').toLowerCase())
  );
  const allRequiredVerified = requiredTypes.every((t) => {
    const doc = docs.find((d) => d.documentType === t);
    return doc && (doc.verificationStatus || '').toLowerCase() === 'verified';
  });

  if (allRequiredVerified) {
    this.documentVerificationStatus = 'verified';
  } else if (anyRejected) {
    this.documentVerificationStatus = 'rejected';
  } else if (anyReupload) {
    this.documentVerificationStatus = 'action_required';
  } else {
    this.documentVerificationStatus = 'pending';
  }

  this.documentsCount = docs.length;
  return this.documentVerificationStatus;
};

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
