import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User reference is required'],
      unique: true,
      index: true,
    },
    partnerCode: {
      type: String,
      required: [true, 'Partner Code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    registrationId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    registrationStatus: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'RESUBMISSION_REQUIRED',
        'pending',
        'approved',
        'rejected',
        'resubmission_required',
        'action_required',
      ],
      default: 'PENDING',
      index: true,
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      default: '',
      index: true,
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      fullAddress: { type: String, trim: true, default: '' },
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'inactive', // New partner registrations start as inactive pending admin approval
      index: true,
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    defaultCommissionRate: {
      type: Number,
      default: 1.5, // e.g. 1.5% for percentage, or fixed amount in rupees
      min: [0, 'Commission rate cannot be negative'],
    },
    bankDetails: {
      accountHolderName: { type: String, trim: true, default: '' },
      accountNumber: { type: String, trim: true, default: '' },
      bankName: { type: String, trim: true, default: '' },
      ifscCode: { type: String, uppercase: true, trim: true, default: '' },
    },
    totalDisbursedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommissionEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalLeadsSubmitted: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    kycDocuments: [
      {
        document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        documentType: {
          type: String,
          enum: ['aadhaar_card', 'pan_card', 'bank_proof'],
        },
        status: {
          type: String,
          enum: ['pending', 'verified', 'rejected', 'reupload_required'],
          default: 'pending',
        },
        verifiedAt: { type: Date, default: null },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        rejectionReason: { type: String, default: '', trim: true },
        reuploadReason: { type: String, default: '', trim: true },
      },
    ],
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'reupload_required', 'action_required'],
      default: 'pending',
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    reuploadRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    resubmissionHistory: [
      {
        documentType: { type: String, default: '' },
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        previousFileName: { type: String, default: '' },
        newFileName: { type: String, default: '' },
        submittedAt: { type: Date, default: Date.now },
        reason: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

partnerSchema.virtual('userProfile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
