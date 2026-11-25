import mongoose from 'mongoose';

const callbackRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: [true, 'Request Number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
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
    loanType: {
      type: String,
      default: '',
      trim: true,
    },
    preferredContactTime: {
      type: String,
      default: 'Anytime',
      trim: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'contacted', 'completed', 'cancelled'],
      default: 'pending',
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
    completedAt: {
      type: Date,
      default: null,
    },
    resolutionRemarks: {
      type: String,
      default: '',
    },
    callLogs: [
      {
        contactedAt: { type: Date, default: Date.now },
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        employeeName: { type: String, default: '' },
        remarks: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

callbackRequestSchema.index({ status: 1, createdAt: -1 });

const CallbackRequest = mongoose.model('CallbackRequest', callbackRequestSchema);
export default CallbackRequest;
