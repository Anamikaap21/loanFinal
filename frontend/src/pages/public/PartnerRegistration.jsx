import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  CreditCard,
  ShieldCheck,
  Landmark,
  FileText,
  Home,
  Check
} from 'lucide-react';
import authService from '../../services/authService.js';
import KycDocumentUploadFields from '../../components/common/KycDocumentUploadFields.jsx';

export default function PartnerRegistration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
    businessName: '',
    panNumber: '',
    notes: '',
    password: '',
    confirmPassword: '',
    // Mandatory Bank Details
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  });

  // Mandatory KYC Files
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ifscCode' || name === 'panNumber' ? value.toUpperCase() : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 2. Bank details validation
    if (
      !formData.accountHolderName.trim() ||
      !formData.accountNumber.trim() ||
      !formData.ifscCode.trim() ||
      !formData.bankName.trim()
    ) {
      setError('All bank account details (Account Holder Name, Account Number, IFSC Code, and Bank Name) are mandatory.');
      return;
    }

    // 3. Mandatory KYC uploads validation
    if (!aadhaarFile || !panFile || !bankProofFile) {
      const missing = [];
      if (!aadhaarFile) missing.push('Aadhaar Card');
      if (!panFile) missing.push('PAN Card');
      if (!bankProofFile) missing.push('Bank Proof (Cancelled Cheque / Passbook / Statement)');
      setError(`Mandatory KYC documents missing: ${missing.join(', ')}. You must upload all 3 documents to complete registration.`);
      return;
    }

    setLoading(true);

    try {
      // Build multipart FormData
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('aadhaarCard', aadhaarFile);
      submitData.append('panCard', panFile);
      submitData.append('bankProof', bankProofFile);

      const res = await authService.registerPartner(submitData);

      setSubmittedInfo(res.data || {});
      setSuccess(true);
    } catch (err) {
      console.error('Partner registration failed:', err);
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please check your information and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-w-0 max-w-full bg-brand-bg">
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-brand-border shadow-md min-w-0">
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-brand-border">
          <div className="inline-flex p-3 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-textPrimary">
            Register as a <span className="text-brand-red">Channel Partner</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-brand-textSecondary max-w-xl mx-auto">
            Join the RealCred Direct Selling Agent (DSA) Network. Submit your profile, bank details, and KYC credentials for Admin verification.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-brand-red/30 text-brand-red text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Registration Success Confirmation Screen */}
        {success ? (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verification Pending</span>
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-brand-textPrimary">
                Registration Submitted Successfully
              </h2>

              <p className="text-sm text-brand-textSecondary leading-relaxed">
                Your registration has been submitted successfully. Your KYC documents are pending Admin verification. Your Partner CRM account will be activated after approval.
              </p>
            </div>

            {/* Registration Details Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-brand-bg border border-brand-border text-left space-y-2.5 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                <span className="text-brand-textSecondary">Registration ID:</span>
                <span className="text-brand-red font-bold text-sm tracking-wider">
                  {submittedInfo?.registrationId || 'PREG-PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-textSecondary">Partner DSA Code:</span>
                <span className="text-brand-textPrimary font-bold">
                  {submittedInfo?.partnerCode || 'RCP-PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-textSecondary">Account Status:</span>
                <span className="text-amber-700 font-bold uppercase">
                  {submittedInfo?.accountStatus || 'INACTIVE'} (Pending Approval)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-textSecondary">KYC Review:</span>
                <span className="text-brand-red font-bold">
                  Sent to Admin Verification Desk
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login?role=partner"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-brand-red/25"
              >
                <span>Partner CRM Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-brand-border hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Personal & Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                <User className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
                  1. Personal & Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Chandra"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="partner@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* Business / Firm Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Business / Firm Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Chandra Financials"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Noida / Delhi"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* PAN Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    PAN Card Number *
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs uppercase font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. Mandatory Bank Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                <Landmark className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
                  2. Mandatory Bank Account Details (For Payouts)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    placeholder="As registered in bank passbook"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. HDFC Bank / ICICI Bank"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                {/* IFSC Code */}
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs uppercase font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Mandatory KYC Documents Uploads */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                <ShieldCheck className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
                  3. Mandatory Partner KYC Documents
                </h3>
              </div>

              <KycDocumentUploadFields
                aadhaarFile={aadhaarFile}
                setAadhaarFile={setAadhaarFile}
                panFile={panFile}
                setPanFile={setPanFile}
                bankProofFile={bankProofFile}
                setBankProofFile={setBankProofFile}
                accentColor="red"
                isOptional={false}
              />
            </div>

            {/* 4. Password & Security Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
                <Lock className="w-4 h-4 text-brand-red" />
                <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
                  4. Partner CRM Login Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-red/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Registration & Uploading KYC...</span>
                </div>
              ) : (
                <>
                  <span>Submit Partner Registration For Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-xs text-brand-textSecondary pt-4 border-t border-brand-border">
              Already have an active Channel Partner account?{' '}
              <Link to="/login?role=partner" className="text-brand-red font-bold hover:underline">
                Login here
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
