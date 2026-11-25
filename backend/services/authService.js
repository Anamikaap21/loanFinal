import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';
import Document from '../models/Document.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    ENV.JWT_SECRET,
    {
      expiresIn: ENV.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const getRoleRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'employee':
      return '/employee/dashboard';
    case 'partner':
      return '/partner/dashboard';
    default:
      return '/';
  }
};

export const loginUser = async ({ emailOrPhone, password, selectedRole }) => {
  if (!emailOrPhone || !password) {
    const error = new Error('Please provide User ID/Email/Phone and Password.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedRole = selectedRole ? selectedRole.toString().trim().toLowerCase() : '';

  if (!normalizedRole || !['admin', 'employee', 'partner'].includes(normalizedRole)) {
    const error = new Error('Please select a valid role (Admin, Employee, or Partner) before logging in.');
    error.statusCode = 400;
    throw error;
  }

  const cleanIdentifier = emailOrPhone.trim().toLowerCase();

  // Find user by either email or phone, including hidden password
  const user = await User.findOne({
    $or: [{ email: cleanIdentifier }, { phone: cleanIdentifier }],
  }).select('+password');

  if (!user) {
    const error = new Error('Invalid credentials. Please verify your Email/Phone and Password.');
    error.statusCode = 401;
    throw error;
  }

  // Verify password using bcrypt
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials. Please verify your Email/Phone and Password.');
    error.statusCode = 401;
    throw error;
  }

  // Master Prompt Requirement: Role must match selected role
  if (user.role.toLowerCase() !== normalizedRole) {
    const error = new Error(
      `Role mismatch: Your account is registered as '${user.role.toUpperCase()}', but you selected '${normalizedRole.toUpperCase()}'. Please return to the Role Selection screen and choose '${user.role.toUpperCase()}'.`
    );
    error.statusCode = 403;
    error.code = 'ROLE_MISMATCH';
    error.actualRole = user.role;
    throw error;
  }

  // Partner Specific Verification Status Gate (Mandatory Backend Security)
  if (user.role === 'partner') {
    const partner = await Partner.findOne({ user: user._id });
    if (!partner) {
      const error = new Error('Partner profile record not found.');
      error.statusCode = 403;
      throw error;
    }

    const regStatus = (partner.registrationStatus || '').toUpperCase();
    const accStatus = (partner.accountStatus || '').toLowerCase();

    // 1. Pending Admin Verification
    if (regStatus === 'PENDING') {
      const error = new Error(
        'Your registration has been submitted successfully. Your KYC documents are pending Admin verification. Your Partner CRM account will be activated after approval.'
      );
      error.statusCode = 403;
      error.code = 'PARTNER_REGISTRATION_PENDING';
      error.registrationStatus = 'PENDING';
      error.registrationId = partner.registrationId;
      throw error;
    }

    // 2. Rejected by Admin
    if (regStatus === 'REJECTED') {
      const reason = partner.rejectionRemarks || 'KYC document verification criteria not met';
      const error = new Error(
        `Your partner registration was rejected by Admin. Reason: ${reason}. Please contact RealCred Administration.`
      );
      error.statusCode = 403;
      error.code = 'PARTNER_REGISTRATION_REJECTED';
      error.registrationStatus = 'REJECTED';
      error.rejectionRemarks = reason;
      throw error;
    }

    // 3. Document Resubmission Required by Admin
    if (regStatus === 'RESUBMISSION_REQUIRED' || regStatus === 'REUPLOAD_REQUIRED') {
      // Allow restricted login for document resubmission only
      user.lastLogin = new Date();
      await user.save();
      const token = generateToken(user);
      return {
        user: user.toJSON(),
        profile: partner,
        token,
        role: 'partner',
        isRestricted: true,
        registrationStatus: partner.registrationStatus,
        redirectPath: '/partner/resubmit-documents',
        message: 'Action Required: One or more KYC documents require resubmission. Please upload the requested files.',
      };
    }

    // 4. Approved & Active: Normal login allowed
    if (regStatus === 'APPROVED' && accStatus === 'active') {
      user.lastLogin = new Date();
      await user.save();
      const token = generateToken(user);
      return {
        user: user.toJSON(),
        profile: partner,
        token,
        role: 'partner',
        redirectPath: '/partner/dashboard',
      };
    }

    const error = new Error(`Partner account is currently ${partner.accountStatus || user.status}. Please contact RealCred Administration.`);
    error.statusCode = 403;
    throw error;
  }

  // Account status check for non-partners (Admin, Employee)
  if (user.status !== 'active') {
    const error = new Error(`Account is currently ${user.status}. Please contact RealCred Administration.`);
    error.statusCode = 403;
    throw error;
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Fetch role-specific profile details
  let profile = null;
  if (user.role === 'employee') {
    profile = await Employee.findOne({ user: user._id });
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: user.toJSON(),
    profile,
    token,
    role: user.role,
    redirectPath: getRoleRedirectPath(user.role),
  };
};

export const registerPartner = async (partnerData, files = {}) => {
  const {
    name,
    email,
    phone,
    password,
    city,
    state = '',
    address = '',
    businessName = '',
    panNumber = '',
    notes = '',
    accountHolderName = '',
    accountNumber = '',
    ifscCode = '',
    bankName = '',
  } = partnerData;

  // Extract nested or flat bank details
  const bHolder = accountHolderName || partnerData['bankDetails.accountHolderName'] || partnerData.bankDetails?.accountHolderName || '';
  const bAccount = accountNumber || partnerData['bankDetails.accountNumber'] || partnerData.bankDetails?.accountNumber || '';
  const bIfsc = ifscCode || partnerData['bankDetails.ifscCode'] || partnerData.bankDetails?.ifscCode || '';
  const bBank = bankName || partnerData['bankDetails.bankName'] || partnerData.bankDetails?.bankName || '';

  if (!name || !email || !phone || !password || !city) {
    const error = new Error('Name, Email, Mobile Number, City, and Password are required for Partner Registration.');
    error.statusCode = 400;
    throw error;
  }

  // Mandatory Bank Details Validation
  if (!bHolder.trim() || !bAccount.trim() || !bIfsc.trim() || !bBank.trim()) {
    const error = new Error('Mandatory bank details missing. Please provide Account Holder Name, Bank Account Number, IFSC Code, and Bank Name.');
    error.statusCode = 400;
    throw error;
  }

  // Mandatory KYC Document Uploads Validation: Aadhaar Card, PAN Card, Bank Proof
  const aadhaarFile = files?.aadhaarCard?.[0] || files?.aadhaar_card?.[0] || (files?.aadhaarCard?.filename ? files.aadhaarCard : null);
  const panFile = files?.panCard?.[0] || files?.pan_card?.[0] || (files?.panCard?.filename ? files.panCard : null);
  const bankProofFile = files?.bankProof?.[0] || files?.bank_proof?.[0] || (files?.bankProof?.filename ? files.bankProof : null);

  if (!aadhaarFile || !panFile || !bankProofFile) {
    const missing = [];
    if (!aadhaarFile) missing.push('Aadhaar Card');
    if (!panFile) missing.push('PAN Card');
    if (!bankProofFile) missing.push('Bank Proof (Cancelled Cheque / Passbook / Statement)');
    const error = new Error(`Mandatory KYC documents missing: ${missing.join(', ')}. All 3 documents are compulsory.`);
    error.statusCode = 400;
    throw error;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // Check duplicate email
  const existingEmail = await User.findOne({ email: cleanEmail });
  if (existingEmail) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate phone
  const existingPhone = await User.findOne({ phone: cleanPhone });
  if (existingPhone) {
    const error = new Error('An account with this mobile number already exists.');
    error.statusCode = 400;
    throw error;
  }

  // Create Partner User Account (Starts as inactive pending Admin verification)
  const user = new User({
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password, // automatically hashed by User schema pre('save')
    role: 'partner',
    status: 'inactive', // Inactive until Admin verifies KYC & approves
  });

  await user.save();

  // Generate Unique Partner Registration ID and Partner Code
  const timestampSuffix = Date.now().toString().slice(-6);
  const registrationId = `PREG-${timestampSuffix}`;
  const partnerCode = `RCP-${timestampSuffix}`;

  // Create Partner Profile in MongoDB
  const partner = new Partner({
    user: user._id,
    registrationId,
    partnerCode,
    businessName: businessName.trim(),
    panNumber: panNumber.trim().toUpperCase(),
    address: {
      city: city.trim(),
      state: state.trim(),
      fullAddress: address.trim(),
    },
    bankDetails: {
      accountHolderName: bHolder.trim(),
      accountNumber: bAccount.trim(),
      ifscCode: bIfsc.trim().toUpperCase(),
      bankName: bBank.trim(),
    },
    registrationStatus: 'PENDING',
    accountStatus: 'inactive',
    kycStatus: 'pending',
    notes,
  });

  await partner.save();

  // Persist the 3 Mandatory KYC Documents in Document collection
  const docAadhaar = await Document.create({
    partner: partner._id,
    entityType: 'partner',
    documentType: 'aadhaar_card',
    title: 'Partner Aadhaar Card',
    fileName: aadhaarFile.filename,
    originalName: aadhaarFile.originalname || aadhaarFile.filename,
    filePath: aadhaarFile.path,
    fileSize: aadhaarFile.size,
    mimeType: aadhaarFile.mimetype || 'application/pdf',
    uploadedBy: user._id,
    uploadedByRole: 'partner',
    verificationStatus: 'pending',
  });

  const docPan = await Document.create({
    partner: partner._id,
    entityType: 'partner',
    documentType: 'pan_card',
    title: 'Partner PAN Card',
    fileName: panFile.filename,
    originalName: panFile.originalname || panFile.filename,
    filePath: panFile.path,
    fileSize: panFile.size,
    mimeType: panFile.mimetype || 'application/pdf',
    uploadedBy: user._id,
    uploadedByRole: 'partner',
    verificationStatus: 'pending',
  });

  const docBankProof = await Document.create({
    partner: partner._id,
    entityType: 'partner',
    documentType: 'bank_proof',
    title: 'Partner Bank Proof (Cancelled Cheque / Passbook)',
    fileName: bankProofFile.filename,
    originalName: bankProofFile.originalname || bankProofFile.filename,
    filePath: bankProofFile.path,
    fileSize: bankProofFile.size,
    mimeType: bankProofFile.mimetype || 'application/pdf',
    uploadedBy: user._id,
    uploadedByRole: 'partner',
    verificationStatus: 'pending',
  });

  // Attach references to partner
  partner.kycDocuments = [
    { document: docAadhaar._id, documentType: 'aadhaar_card', status: 'pending' },
    { document: docPan._id, documentType: 'pan_card', status: 'pending' },
    { document: docBankProof._id, documentType: 'bank_proof', status: 'pending' },
  ];
  await partner.save();

  return {
    registrationId: partner.registrationId,
    partnerCode: partner.partnerCode,
    registrationStatus: 'PENDING',
    accountStatus: 'INACTIVE',
    name: user.name,
    email: user.email,
    message:
      'Your registration has been submitted successfully. Your KYC documents are pending Admin verification. Your Partner CRM account will be activated after approval.',
  };
};

export const getCurrentUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  let profile = null;
  if (user.role === 'employee') {
    profile = await Employee.findOne({ user: user._id });
  } else if (user.role === 'partner') {
    profile = await Partner.findOne({ user: user._id });
  }

  return {
    user: user.toJSON(),
    profile,
    role: user.role,
    redirectPath: getRoleRedirectPath(user.role),
  };
};

export default {
  generateToken,
  loginUser,
  registerPartner,
  getCurrentUserProfile,
  getRoleRedirectPath,
};
