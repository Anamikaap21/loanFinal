import mongoose from 'mongoose';
import { EMPLOYMENT_TYPES } from './Lead.js';

const loanApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: [true, 'Application Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated Lead ID is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    email: {
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
    loanCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanCategory',
      required: [true, 'Loan category is required'],
    },
    preferredBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      default: null,
    },
    requiredLoanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [10000, 'Minimum loan amount is ₹10,000'],
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
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    additionalDetails: {
      type: String,
      default: '',
    },
    submittedDocuments: [
      {
        documentType: String,
        originalName: String,
        fileUrl: String,
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'converted_to_lead', 'rejected'],
      default: 'submitted',
      index: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);
export default LoanApplication;
