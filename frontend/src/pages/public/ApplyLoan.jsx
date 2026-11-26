import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Building2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileCheck
} from 'lucide-react';
import loanService from '../../services/loanService.js';
import bankService from '../../services/bankService.js';
import KycDocumentUploadFields from '../../components/common/KycDocumentUploadFields.jsx';

export default function ApplyLoan() {
  const location = useLocation();

  // Data states from backend
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    city: '',
    loanCategoryId: '',
    preferredBankId: '',
    requiredLoanAmount: '',
    employmentType: 'Salaried',
    otherEmploymentDetails: '',
    monthlyIncome: '',
    additionalDetails: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  // KYC Document Upload states
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);

  // Preset loan amount quick buttons
  const amountPresets = [500000, 1500000, 3000000, 5000000, 10000000];

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setIsLoadingDropdowns(true);
        const [categoriesRes, banksRes] = await Promise.all([
          loanService.getCategories(),
          bankService.getActiveBanks(),
        ]);

        const catData = (categoriesRes.data || []).filter(
          (c) => c.isActive !== false && (c.status || '').toLowerCase() !== 'inactive'
        );
        const bankData = (banksRes.data || []).filter(
          (b) => (b.status || '').toLowerCase() === 'active' && !b.isDeleted
        );

        setCategories(catData);
        setBanks(bankData);

        // Pre-select category or bank if passed in state or query param
        const searchParams = new URLSearchParams(location.search);
        const categorySlugParam = searchParams.get('category') || location.state?.categorySlug;
        const bankParam = searchParams.get('bank');

        if (bankParam && bankData.length > 0) {
          const matchedBank = bankData.find((b) => b._id === bankParam || b.bankCode === bankParam.toUpperCase());
          if (matchedBank) {
            setFormData((prev) => ({ ...prev, preferredBankId: matchedBank._id }));
          }
        }

        if (categorySlugParam && catData.length > 0) {
          const matched = catData.find((c) => c.slug === categorySlugParam || c._id === categorySlugParam);
          if (matched) {
            setFormData((prev) => ({ ...prev, loanCategoryId: matched._id }));
          } else {
            setFormData((prev) => ({ ...prev, loanCategoryId: catData[0]._id }));
          }
        } else if (catData.length > 0) {
          setFormData((prev) => ({ ...prev, loanCategoryId: catData[0]._id }));
        }

        // Prefill loan amount, tenure, and indicative rate if passed via EMI Calculator or state
        const amountParam = searchParams.get('amount') || location.state?.amount;
        const tenureParam = searchParams.get('tenure');
        const rateParam = searchParams.get('rate');

        if (amountParam) {
          const parsedAmount = Number(amountParam);
          if (!isNaN(parsedAmount) && parsedAmount > 0) {
            setFormData((prev) => ({ ...prev, requiredLoanAmount: String(parsedAmount) }));
          }
        }

        // Prefill income and employment type if passed from Check Eligibility
        const incomeParam = searchParams.get('income') || location.state?.income;
        const employmentTypeParam = searchParams.get('employmentType') || location.state?.employmentType;

        if (incomeParam) {
          const parsedIncome = Number(incomeParam);
          if (!isNaN(parsedIncome) && parsedIncome > 0) {
            setFormData((prev) => ({ ...prev, monthlyIncome: String(parsedIncome) }));
          }
        }

        if (employmentTypeParam) {
          setFormData((prev) => ({ ...prev, employmentType: employmentTypeParam }));
        }

        if (tenureParam || rateParam) {
          setFormData((prev) => {
            if (!prev.additionalDetails) {
              const notes = [];
              if (tenureParam) notes.push(`Requested Tenure: ${tenureParam}`);
              if (rateParam) notes.push(`Indicative Rate: ${rateParam}%`);
              return { ...prev, additionalDetails: `[Calculated via RealCred EMI Calculator] ${notes.join(' • ')}` };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to load categories or banks:', err);
        setSubmitError('Unable to load loan categories or banks. Please verify your connection.');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Please enter your mobile number';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    if (!formData.city.trim()) errors.city = 'Please specify your current city';
    if (!formData.loanCategoryId) errors.loanCategoryId = 'Please select a loan category';
    if (!formData.requiredLoanAmount) {
      errors.requiredLoanAmount = 'Please enter the loan amount you require';
    } else if (Number(formData.requiredLoanAmount) < 10000) {
      errors.requiredLoanAmount = 'Minimum loan amount is ₹10,000';
    }
    if (!formData.employmentType) errors.employmentType = 'Select your employment type';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append('fullName', formData.fullName.trim());
      payload.append('mobileNumber', formData.mobileNumber.trim());
      payload.append('email', formData.email.trim());
      payload.append('city', formData.city.trim());
      payload.append('loanCategoryId', formData.loanCategoryId);
      if (formData.preferredBankId) payload.append('preferredBankId', formData.preferredBankId);
      payload.append('requiredLoanAmount', formData.requiredLoanAmount);
      payload.append('employmentType', formData.employmentType);
      payload.append('otherEmploymentDetails', formData.otherEmploymentDetails ? formData.otherEmploymentDetails.trim() : '');
      payload.append('monthlyIncome', formData.monthlyIncome || '0');
      payload.append('additionalDetails', formData.additionalDetails.trim());

      if (aadhaarFile) payload.append('aadhaarCard', aadhaarFile);
      if (panFile) payload.append('panCard', panFile);
      if (bankProofFile) payload.append('bankProof', bankProofFile);

      const res = await loanService.applyForLoan(payload);
      if (res.status === 'success') {
        setSubmissionSuccess(res.data);
      } else {
        setSubmitError(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Loan application submission error:', err);
      setSubmitError(
        err.response?.data?.message || 'Failed to submit loan application. Please verify details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionSuccess(null);
    setAadhaarFile(null);
    setPanFile(null);
    setBankProofFile(null);
    setFormData({
      fullName: '',
      mobileNumber: '',
      email: '',
      city: '',
      loanCategoryId: categories.length > 0 ? categories[0]._id : '',
      preferredBankId: '',
      requiredLoanAmount: '',
      employmentType: 'Salaried',
      otherEmploymentDetails: '',
      monthlyIncome: '',
      additionalDetails: '',
    });
  };

  // SUCCESS VIEW
  if (submissionSuccess) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-textSecondary py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-w-0 max-w-full">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-brand-border p-6 sm:p-10 shadow-xl relative overflow-hidden text-center min-w-0">
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-brand-textPrimary mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-sm text-brand-textSecondary mb-8">
            Thank you, <span className="text-brand-textPrimary font-semibold">{submissionSuccess.customerName}</span>. Your direct loan inquiry has been logged into the RealCred distribution desk.
          </p>

          {/* Reference Badges Card */}
          <div className="p-5 rounded-2xl bg-brand-bg border border-brand-border text-left mb-8 space-y-3">
            <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
              <span className="text-xs text-brand-textSecondary">Application Number</span>
              <span className="text-sm font-mono font-bold text-brand-textPrimary bg-white px-2.5 py-1 rounded-md border border-brand-border shadow-sm">
                {submissionSuccess.applicationNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
              <span className="text-xs text-brand-textSecondary">Lead Tracking ID</span>
              <span className="text-sm font-mono font-bold text-brand-red bg-brand-redLight px-2.5 py-1 rounded-md border border-brand-red/20 shadow-sm">
                {submissionSuccess.leadId}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-brand-border pb-2.5">
              <span className="text-xs text-brand-textSecondary">Loan Facility</span>
              <span className="text-xs font-semibold text-brand-textPrimary">{submissionSuccess.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-textSecondary">Required Amount</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">
                ₹{Number(submissionSuccess.loanAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* What Happens Next Steps */}
          <div className="text-left mb-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-textPrimary mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-red" />
              What Happens Next?
            </h4>
            <div className="space-y-3 text-xs text-brand-textSecondary">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                <div>A RealCred Loan Manager reviews your profile within 30 minutes.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                <div>We verify KYC documents and match interest rates across 25+ partner banks.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                <div>Direct bank login, property evaluation, formal sanction letter, and disbursal.</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetForm}
              className="flex-1 py-3 px-4 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-redLight hover:text-brand-red transition-colors shadow-sm"
            >
              Apply for Another Loan
            </button>
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl bg-brand-red text-xs font-bold text-white hover:bg-brand-deepRed transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-red/25"
            >
              Back to Home
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM VIEW
  return (
    <div className="min-h-screen bg-brand-bg text-brand-textSecondary py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-w-0 max-w-full">
      <div className="max-w-4xl mx-auto min-w-0">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Direct Digital Application</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-textPrimary tracking-tight break-words">
            Apply for Your Loan with RealCred
          </h1>
          <p className="mt-3 text-sm sm:text-base lg:text-lg text-brand-textSecondary max-w-2xl mx-auto break-words">
            Your Loan. One Guided Route. Fill in your requirements to receive doorstep advisory and multi-bank sanction support.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-3xl border border-brand-border p-5 sm:p-8 lg:p-10 shadow-md relative min-w-0">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-brand-red/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
              <div className="text-xs text-brand-red">
                <span className="font-bold">Error submitting application:</span> {submitError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Applicant Personal Details */}
            <div>
              <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-red" />
                1. Applicant Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Full Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar Sharma"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${formErrors.fullName ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                      }`}
                  />
                  {formErrors.fullName && <p className="mt-1 text-[11px] text-brand-red">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Mobile Number <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-brand-textSecondary font-semibold">+91</span>
                    <input
                      type="tel"
                      name="mobileNumber"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="98765 43210"
                      className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${formErrors.mobileNumber ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                        }`}
                    />
                  </div>
                  {formErrors.mobileNumber && <p className="mt-1 text-[11px] text-brand-red">{formErrors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Email Address <span className="text-brand-textSecondary font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ramesh.sharma@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${formErrors.email ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                      }`}
                  />
                  {formErrors.email && <p className="mt-1 text-[11px] text-brand-red">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Current City / Location <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Noida, Delhi NCR, Lucknow"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${formErrors.city ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                      }`}
                  />
                  {formErrors.city && <p className="mt-1 text-[11px] text-brand-red">{formErrors.city}</p>}
                </div>
              </div>
            </div>

            {/* 2. Loan Requirement & Preferences */}
            <div className="pt-4 border-t border-brand-border">
              <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-brand-red" />
                2. Loan Requirement & Banking Preference
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Loan Category <span className="text-brand-red">*</span>
                  </label>
                  <select
                    name="loanCategoryId"
                    value={formData.loanCategoryId}
                    onChange={handleChange}
                    disabled={isLoadingDropdowns}
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 shadow-sm ${formErrors.loanCategoryId ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                      }`}
                  >
                    {isLoadingDropdowns ? (
                      <option>Loading categories from RealCred database...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} ({cat.interestRateStartingFrom}% p.a. onwards)
                        </option>
                      ))
                    )}
                  </select>
                  {formErrors.loanCategoryId && <p className="mt-1 text-[11px] text-brand-red">{formErrors.loanCategoryId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Preferred Bank <span className="text-brand-textSecondary font-normal">(Optional)</span>
                  </label>
                  <select
                    name="preferredBankId"
                    value={formData.preferredBankId}
                    onChange={handleChange}
                    disabled={isLoadingDropdowns}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red shadow-sm"
                  >
                    <option value="">Any Suitable Bank (Best RealCred ROI Match)</option>
                    {banks.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Required Loan Amount (INR) <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-brand-textSecondary font-bold">₹</span>
                    <input
                      type="number"
                      name="requiredLoanAmount"
                      value={formData.requiredLoanAmount}
                      onChange={handleChange}
                      placeholder="e.g. 2500000"
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${formErrors.requiredLoanAmount ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                        }`}
                    />
                  </div>
                  {/* Preset Amount Pills */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-brand-textSecondary">Quick select:</span>
                    {amountPresets.map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setFormData((prev) => ({ ...prev, requiredLoanAmount: amt }))}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${Number(formData.requiredLoanAmount) === amt
                          ? 'bg-brand-red border-brand-red text-white shadow-sm'
                          : 'bg-brand-bg border-brand-border text-brand-textSecondary hover:text-brand-red hover:bg-brand-redLight'
                          }`}
                      >
                        ₹{(amt / 100000).toLocaleString('en-IN')} Lakhs
                      </button>
                    ))}
                  </div>
                  {formErrors.requiredLoanAmount && <p className="mt-1 text-[11px] text-brand-red">{formErrors.requiredLoanAmount}</p>}
                </div>
              </div>
            </div>

            {/* 3. Professional & Income Profile */}
            <div className="pt-4 border-t border-brand-border">
              <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-red" />
                3. Professional & Income Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Employment Type <span className="text-brand-red">*</span>
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red shadow-sm"
                  >
                    <option value="Salaried">Salaried (Private / MNC / Govt)</option>
                    <option value="Self-Employed Professional">Self-Employed Professional (Doctor, CA, Architect)</option>
                    <option value="Self-Employed Business">Self-Employed Business / Proprietor</option>
                    <option value="Director / Partner">Director / Partner (Pvt Ltd / LLP)</option>
                    <option value="Other">Other Category</option>
                  </select>

                  {['Other', 'other'].includes(formData.employmentType) && (
                    <div className="mt-3">
                      <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                        Specify Employment Details <span className="text-brand-textSecondary font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="otherEmploymentDetails"
                        value={formData.otherEmploymentDetails}
                        onChange={handleChange}
                        placeholder="e.g. Freelancer, Consultant, Agriculturist"
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 focus:ring-brand-red shadow-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Monthly Net Income / Turnover (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-brand-textSecondary font-bold">₹</span>
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      placeholder="e.g. 85000"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 focus:ring-brand-red shadow-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                    Additional Requirement or Note <span className="text-brand-textSecondary font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="additionalDetails"
                    rows={3}
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    placeholder="Mention any specific tenure preference, co-applicant details, property location, or existing running EMIs..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 focus:ring-brand-red resize-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 4. KYC & Verification Documents */}
            <div className="pt-4 border-t border-brand-border">
              <KycDocumentUploadFields
                aadhaarFile={aadhaarFile}
                setAadhaarFile={setAadhaarFile}
                panFile={panFile}
                setPanFile={setPanFile}
                bankProofFile={bankProofFile}
                setBankProofFile={setBankProofFile}
                accentColor="red"
                isOptional={true}
              />
            </div>

            {/* Terms and Submit */}
            <div className="pt-4 border-t border-brand-border">
              <div className="flex items-start gap-2.5 mb-6 text-xs text-brand-textSecondary">
                <ShieldCheck className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <p>
                  By submitting this application, you authorize RealCred Technology Private Limited and its verified banking partners to contact you via Phone/SMS/Email regarding your loan requirement per our{' '}
                  <Link to="/privacy-policy" className="text-brand-red hover:underline font-semibold">
                    Privacy Policy
                  </Link>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoadingDropdowns}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-red/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Submitting Application to RealCred...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Loan Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature Badges Below Form */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
            <ShieldCheck className="w-5 h-5 text-brand-red mx-auto mb-2" />
            <h4 className="text-xs font-bold text-brand-textPrimary mb-0.5">100% Data Confidentiality</h4>
            <p className="text-[11px] text-brand-textSecondary">Your information is strictly encrypted and never sold to third parties.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
            <Clock className="w-5 h-5 text-brand-red mx-auto mb-2" />
            <h4 className="text-xs font-bold text-brand-textPrimary mb-0.5">Fastest Sanctions</h4>
            <p className="text-[11px] text-brand-textSecondary">Pre-approved sanctions within 24-48 business hours with partner banks.</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-brand-border shadow-sm">
            <FileCheck className="w-5 h-5 text-brand-red mx-auto mb-2" />
            <h4 className="text-xs font-bold text-brand-textPrimary mb-0.5">Doorstep Documentation</h4>
            <p className="text-[11px] text-brand-textSecondary">Dedicated loan manager handles bank paperwork and physical verification.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
