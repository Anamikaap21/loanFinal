import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Associated User ID is required'],
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Loan Operations',
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      fullAddress: { type: String, trim: true, default: '' },
    },
    assignedLeadsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountStatus: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Populate user information by default when needed
employeeSchema.virtual('profile', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
