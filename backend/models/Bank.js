import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    bankCode: {
      type: String,
      required: [true, 'Bank code is required'],
      uppercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    contactDetails: {
      contactPerson: { type: String, trim: true, default: '' },
      email: { type: String, lowercase: true, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    category: {
      type: String,
      enum: ['PSU Banks', 'Private Banks', 'NBFCs'],
      default: 'Private Banks',
      index: true,
    },
    roi: {
      type: String,
      default: '',
      trim: true,
    },
    maxLTV: {
      type: String,
      default: '',
      trim: true,
    },
    maxTenure: {
      type: String,
      default: '',
      trim: true,
    },
    processingTime: {
      type: String,
      default: '',
      trim: true,
    },
    interestRateRange: {
      min: { type: Number, default: 8.5 },
      max: { type: Number, default: 16.0 },
    },
    maxTenureMonths: {
      type: Number,
      default: 360,
    },
    processingFeeDetails: {
      type: String,
      default: 'Up to 1% + GST',
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes with partial filter to ensure active/non-deleted uniqueness
bankSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
bankSchema.index(
  { bankCode: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Bank = mongoose.model('Bank', bankSchema);
export default Bank;
