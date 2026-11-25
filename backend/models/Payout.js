import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    payoutNumber: {
      type: String,
      required: [true, 'Payout number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated Lead reference is required'],
      unique: true, // Strictly prevents duplicate payout creation for the same eligible lead
      index: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: [true, 'Partner reference is required'],
      index: true,
    },
    partnerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Partner User reference is required'],
    },
    // Financial snapshot fields (immutable historical snapshot)
    disbursedLoanAmount: {
      type: Number,
      required: [true, 'Disbursed loan amount is required'],
      min: [0, 'Loan amount cannot be negative'],
    },
    commissionType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Commission type is required'],
    },
    commissionRate: {
      type: Number,
      required: [true, 'Commission rate is required'],
      min: [0, 'Commission rate cannot be negative'],
    },
    grossCommissionAmount: {
      type: Number,
      required: [true, 'Gross commission amount is required'],
      min: [0, 'Gross commission cannot be negative'],
    },
    tdsRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    tdsAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPayoutAmount: {
      type: Number,
      required: [true, 'Net payout amount is required'],
      min: [0, 'Net payout cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payoutDate: {
      type: Date,
      default: Date.now,
    },
    paymentDetails: {
      paymentDate: { type: Date, default: null },
      paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'neft', 'rtgs', 'upi', 'cheque', 'other', null],
        default: null,
      },
      transactionReference: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
    },
    isInvoiceGenerated: {
      type: Boolean,
      default: false,
      index: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ partner: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
