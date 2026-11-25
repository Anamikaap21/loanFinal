import mongoose from 'mongoose';

const leadAssignmentSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required'],
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner User reference is required'],
    },
    status: {
      type: String,
      enum: ['active', 'reassigned', 'completed', 'revoked'],
      default: 'active',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

leadAssignmentSchema.index({ lead: 1, employee: 1, status: 1 });

const LeadAssignment = mongoose.model('LeadAssignment', leadAssignmentSchema);
export default LeadAssignment;
