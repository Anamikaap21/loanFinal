import mongoose from 'mongoose';

export const DOCUMENT_TYPES = [
  'pan_card',
  'aadhaar_card',
  'bank_proof',
  'salary_slip',
  'bank_statement',
  'itr',
  'property_docs',
  'photo',
  'business_proof',
  'other',
];

export const DOCUMENT_VERIFICATION_STATUSES = [
  'pending',
  'verified',
  'rejected',
  'reupload_required',
  'Pending',
  'Verified',
  'Rejected',
  'Re-upload Required',
];

const documentSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      default: null,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['lead', 'partner'],
      default: 'lead',
      index: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: DOCUMENT_TYPES,
        message: `'{VALUE}' is not a valid document type. Allowed types: ${DOCUMENT_TYPES.join(', ')}`,
      },
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalName: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for public website submissions
    },
    uploadedByRole: {
      type: String,
      enum: ['customer', 'partner', 'employee', 'admin'],
      default: 'customer',
    },
    verificationStatus: {
      type: String,
      enum: {
        values: DOCUMENT_VERIFICATION_STATUSES,
        message: `'{VALUE}' is not a valid verification status`,
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    reuploadReason: {
      type: String,
      default: '',
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedByEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    verifiedByName: {
      type: String,
      default: '',
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    verificationRemarks: {
      type: String,
      default: '',
      trim: true,
    },
    verificationHistory: [
      {
        previousStatus: { type: String, default: null },
        newStatus: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedByEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        changedByName: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String, default: '' },
        remarks: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ lead: 1, documentType: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
