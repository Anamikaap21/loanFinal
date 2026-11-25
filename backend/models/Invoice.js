import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    payout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
      required: [true, 'Associated Payout reference is required'],
      unique: true,
      index: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: [true, 'Associated Partner reference is required'],
      index: true,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Associated Lead reference is required'],
      index: true,
    },
    companyDetails: {
      name: { type: String, default: 'RealCred Technology Private Limited' },
      tagline: { type: String, default: 'Your Loan. One Guided Route.' },
      domain: { type: String, default: 'https://realcred.in' },
      address: {
        type: String,
        default: 'D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India',
      },
      phone: { type: String, default: '7048976349, 8527710939' },
      email: { type: String, default: 'info@realcred.in' },
    },
    partnerDetails: {
      partnerCode: { type: String, default: '' },
      partnerName: { type: String, required: true },
      businessName: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: { type: String, default: '' },
      panNumber: { type: String, default: '' },
    },
    loanReference: {
      leadCode: { type: String, required: true },
      customerName: { type: String, required: true },
      loanCategory: { type: String, required: true },
      disbursedLoanAmount: { type: Number, required: true },
      disbursementDate: { type: Date, default: null },
    },
    financialSummary: {
      commissionType: { type: String, enum: ['percentage', 'fixed'], required: true },
      commissionRate: { type: Number, required: true },
      grossCommissionAmount: { type: Number, required: true },
      tdsAmount: { type: Number, default: 0 },
      totalPayable: { type: Number, required: true },
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    pdfFileName: {
      type: String,
      default: '',
    },
    pdfFilePath: {
      type: String,
      default: '',
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ partner: 1, invoiceDate: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
