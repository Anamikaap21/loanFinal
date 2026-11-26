import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Building2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  HelpCircle,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';
import loanService from '../../../services/loanService.js';
import bankService from '../../../services/bankService.js';
import KycDocumentUploadFields from '../../../components/common/KycDocumentUploadFields.jsx';

export default function EmployeeCreateLead() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [city, setCity] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [otherEmploymentDetails, setOtherEmploymentDetails] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loanCategory, setLoanCategory] = useState('');
  const [requiredLoanAmount, setRequiredLoanAmount] = useState('');
  const [preferredBank, setPreferredBank] = useState('');
  const [remarks, setRemarks] = useState('');

  // KYC Upload States
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        setLoadingConfig(true);
        const [catRes, bankRes] = await Promise.all([
          loanService.getCategories(),
          bankService.getActiveBanks(),
        ]);
        if (catRes.status === 'success') {
          setCategories(catRes.data || []);
          if (catRes.data?.length > 0) {
            setLoanCategory(catRes.data[0]._id);
          }
        }
        if (bankRes.status === 'success') {
          const activeOnly = (bankRes.data || []).filter(
            (b) => (b.status === 'active' || b.status === 'ACTIVE') && !b.isDeleted
          );
          setBanks(activeOnly);
        }
      } catch (err) {
        console.error('Failed to load form config:', err);
        setError('Failed to load loan categories or banks. Please try refreshing.');
      } finally {
        setLoadingConfig(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form Validations
    if (!customerName.trim()) {
      setError('Customer Full Name is required.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!city.trim()) {
      setError('City is required.');
      return;
    }
    if (!loanCategory) {
      setError('Please select a loan category.');
      return;
    }
    const amountNum = Number(requiredLoanAmount);
    if (!amountNum || amountNum < 10000) {
      setError('Loan amount must be at least ₹10,000.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', cleanPhone);
      formData.append('customerEmail', customerEmail.trim().toLowerCase());
      formData.append('panNumber', panNumber.trim().toUpperCase());
      formData.append('city', city.trim());
      formData.append('employmentType', employmentType);
      formData.append('otherEmploymentDetails', employmentType === 'Other' ? otherEmploymentDetails.trim() : '');
      formData.append('monthlyIncome', monthlyIncome || '0');
      formData.append('loanCategory', loanCategory);
      formData.append('requiredLoanAmount', amountNum);
      if (preferredBank) formData.append('preferredBank', preferredBank);
      formData.append('remarks', remarks.trim());

      if (aadhaarFile) formData.append('aadhaarCard', aadhaarFile);
      if (panFile) formData.append('panCard', panFile);
      if (bankProofFile) formData.append('bankProof', bankProofFile);

      const res = await employeeService.createLead(formData);
      if (res.status === 'success') {
        setSuccess(`Lead ${res.data?.leadId} sourced and logged successfully!`);
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setPanNumber('');
        setCity('');
        setEmploymentType('Salaried');
        setOtherEmploymentDetails('');
        setMonthlyIncome('');
        setRequiredLoanAmount('');
        setPreferredBank('');
        setRemarks('');
        setAadhaarFile(null);
        setPanFile(null);
        setBankProofFile(null);

        setTimeout(() => {
          navigate('/employee/lead-processing');
        }, 1500);
      }
    } catch (err) {
      console.error('Lead creation error:', err);
      setError(err.response?.data?.message || 'Failed to submit lead. Please check the fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Direct Lead Sourcing</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Create Customer Lead</h2>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Log a new loan application file sourced directly by you. The file will be assigned directly to your desk.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-700">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border shadow-sm space-y-6">
        {/* Section 1: Customer Details */}
        <div>
          <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-red" />
            <span>1. Customer Personal Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Full Customer Name <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Mobile Number (10 Digits) <span className="text-brand-red">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                maxLength={10}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                PAN Card Number (Optional)
              </label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary uppercase focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Customer City / Location <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Employment Profile */}
        <div className="pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-red" />
            <span>2. Employment & Income</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Employment Type <span className="text-brand-red">*</span>
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed Professional">Self-Employed Professional</option>
                <option value="Self-Employed Business">Self-Employed Business</option>
                <option value="Director / Partner">Director / Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {employmentType === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                  Employment Details <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  value={otherEmploymentDetails}
                  onChange={(e) => setOtherEmploymentDetails(e.target.value)}
                  placeholder="Specify employment (e.g. Freelancer, Consultant)"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Net Monthly In-Hand Income (₹)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 75000"
                min={0}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Loan Requirement */}
        <div className="pt-4 border-t border-brand-border">
          <h3 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-red" />
            <span>3. Loan Facility & Target Institution</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Loan Category <span className="text-brand-red">*</span>
              </label>
              <select
                value={loanCategory}
                onChange={(e) => setLoanCategory(e.target.value)}
                disabled={loadingConfig}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Required Loan Amount (₹) <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                value={requiredLoanAmount}
                onChange={(e) => setRequiredLoanAmount(e.target.value)}
                placeholder="e.g. 2500000"
                min={10000}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Preferred Lending Partner (Optional)
              </label>
              <select
                value={preferredBank}
                onChange={(e) => setPreferredBank(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
              >
                <option value="">Any Suitable Lending Bank / NBFC</option>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.bankCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                Internal Underwriting Remarks (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any special customer notes, bureau score, or eligibility observations..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Mandatory KYC Verification Documents */}
        <div className="pt-4 border-t border-brand-border">
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

        {/* Submit Button */}
        <div className="pt-4 border-t border-brand-border flex justify-end">
          <button
            type="submit"
            disabled={submitting || loadingConfig}
            className="px-6 py-3 rounded-2xl bg-brand-red hover:bg-brand-deepRed text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Lead...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Generate Lead File</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
