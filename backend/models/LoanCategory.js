import mongoose from 'mongoose';

const loanCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Loan category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: [String],
      default: [],
    },
    requiredDocuments: {
      type: [String],
      default: [],
    },
    minAmount: {
      type: Number,
      default: 50000,
    },
    maxAmount: {
      type: Number,
      default: 50000000,
    },
    minInterestRate: {
      type: Number,
      default: 8.5,
    },
    maxInterestRate: {
      type: Number,
      default: 15.0,
    },
    interestRateRange: {
      min: { type: Number, default: 8.5 },
      max: { type: Number, default: 15.0 },
    },
    minTenureMonths: {
      type: Number,
      default: 12,
    },
    maxTenureMonths: {
      type: Number,
      default: 360,
    },
    iconName: {
      type: String,
      default: 'CreditCard',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure slug and isActive/status synchronization
loanCategorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (this.minInterestRate !== undefined && this.maxInterestRate !== undefined) {
    this.interestRateRange = {
      min: Number(this.minInterestRate),
      max: Number(this.maxInterestRate),
    };
  }
  if (this.status) {
    this.isActive = this.status.toLowerCase() === 'active' && !this.isDeleted;
  }
  next();
});

const LoanCategory = mongoose.model('LoanCategory', loanCategorySchema);
export default LoanCategory;
