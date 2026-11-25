import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';

export const createInitialAdmin = async () => {
  try {
    const adminEmail = ENV.INITIAL_ADMIN.email.toLowerCase().trim();
    
    // Check if the configured initial admin account already exists
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      // Ensure role is admin and status is active
      if (admin.role !== 'admin' || admin.status !== 'active') {
        admin.role = 'admin';
        admin.status = 'active';
        await admin.save();
      }
      console.log(`[Admin Setup] Initial Super Admin account verified: ${admin.email}`);
      return admin;
    }

    // Create new Super Admin account
    admin = new User({
      name: ENV.INITIAL_ADMIN.name,
      email: adminEmail,
      phone: ENV.INITIAL_ADMIN.phone,
      password: ENV.INITIAL_ADMIN.password, // hashed automatically by User.pre('save')
      role: 'admin',
      status: 'active',
    });

    await admin.save();
    console.log(`[Admin Setup] Initial Super Admin successfully created:`);
    console.log(` - Name: ${admin.name}`);
    console.log(` - Email: ${admin.email}`);
    console.log(` - Role: ${admin.role}`);
    console.log(` - Status: ${admin.status}`);
    console.log(` - Security: Password has been securely hashed with bcrypt.`);

    return admin;
  } catch (error) {
    console.error(`[Admin Setup Error] Failed to initialize admin account:`, error.message);
    throw error;
  }
};

// If run directly via CLI: node backend/scripts/createAdmin.js
if (process.argv[1]?.endsWith('createAdmin.js')) {
  mongoose
    .connect(ENV.MONGO_URI)
    .then(async () => {
      console.log('Connected to MongoDB. Running Admin Initialization Script...');
      await createInitialAdmin();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Admin Initialization Script failed:', err);
      process.exit(1);
    });
}
