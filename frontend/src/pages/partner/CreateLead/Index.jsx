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
  ArrowRight
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';
import loanService from '../../../services/loanService.js';
import bankService from '../../../services/bankService.js';
import KycDocumentUploadFields from '../../../components/common/KycDocumentUploadFields.jsx';

export default function PartnerCreateLead() {
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
          setCategories(catRes.data);
          if (catRes.data.length > 0) {
            setLoanCategory(catRes.data[0]._id);
          }
        }
        if (bankRes.status === 'success') {
          const activeOnly = (bankRes.data || []).filter(
            (b) => (b.status || '').toLowerCase() === 'active' && !b.isDeleted
          );
          setBanks(activeOnly);
        }
      } catch (err) {
        console.error('Failed to load form metadata:', err);
        setError('Unable to load loan categories or bank partners.');
      } finally {
        setLoadingConfig(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !city.trim() || !requiredLoanAmount) {
      setError('Please fill in all mandatory customer and loan fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('customerName', customerName.trim());
      formData.append('customerPhone', customerPhone.trim());
      formData.append('customerEmail', customerEmail.trim());
      formData.append('panNumber', panNumber.trim().toUpperCase());
      formData.append('city', city.trim());
      formData.append('employmentType', employmentType);
      formData.append('otherEmploymentDetails', ['Other', 'other'].includes(employmentType) ? otherEmploymentDetails.trim() : '');
      formData.append('monthlyIncome', monthlyIncome || '0');
      formData.append('loanCategory', loanCategory);
      formData.append('requiredLoanAmount', requiredLoanAmount);
      if (preferredBank) formData.append('preferredBank', preferredBank);
      formData.append('remarks', remarks.trim());

      if (aadhaarFile) formData.append('aadhaarCard', aadhaarFile);
      if (panFile) formData.append('panCard', panFile);
      if (bankProofFile) formData.append('bankProof', bankProofFile);

      const res = await partnerService.createLead(formData);
      setSuccess(`Loan Referral "${res.data?.leadId || 'Success'}" submitted successfully! RealCred operations desk will review.`);

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
      setRemarks('');
      setAadhaarFile(null);
      setPanFile(null);
      setBankProofFile(null);

      setTimeout(() => {
        navigate('/partner/my-leads');
      }, 1500);
    } catch (err) {
      console.error('Create lead error:', err);
      setError(err.response?.data?.message || 'Failed to submit loan referral.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Channel Partner Lead Generation</span>
        </div>
        <h2 className="text-2xl font-black text-white">Submit New Loan Referral</h2>
        <p className="text-xs text-brand-grey">
          Directly submit your customer's loan requirement into RealCred's centralized banking pipeline.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-6">
        {/* Section 1: Customer Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-xs font-bold text-emerald-400">
            <User className="w-4 h-4" />
            <span>Customer / Applicant Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Applicant Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Mobile Number *</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Email Address (Optional)</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">PAN Card Number (Optional)</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="e.g. ABCDE1234F"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs uppercase placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">City / Location *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Noida, Delhi, Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Employment Type *</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed Professional">Self-Employed Professional</option>
                <option value="Self-Employed Business">Self-Employed Business</option>
                <option value="Director / Partner">Director / Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {['Other', 'other'].includes(employmentType) && (
              <div className="sm:col-span-2">
                <label className="block text-brand-lightGrey mb-1 font-semibold">Employment Details (Required for 'Other') *</label>
                <input
                  type="text"
                  value={otherEmploymentDetails}
                  onChange={(e) => setOtherEmploymentDetails(e.target.value)}
                  placeholder="Specify employment / profession details (e.g. Freelancer, Consultant, Agriculturist)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Monthly In-Hand Income (₹)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Loan Facility Requirement */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-xs font-bold text-emerald-400">
            <IndianRupee className="w-4 h-4" />
            <span>Loan Facility Coordinates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Loan Product Category *</label>
              <select
                value={loanCategory}
                onChange={(e) => setLoanCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} (from {cat.interestRateStartingFrom || 8.5}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Required Loan Amount (₹) *</label>
              <input
                type="number"
                value={requiredLoanAmount}
                onChange={(e) => setRequiredLoanAmount(e.target.value)}
                placeholder="e.g. 2500000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
                min={10000}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-brand-lightGrey mb-1 font-semibold">Preferred Bank / NBFC (Optional)</label>
              <select
                value={preferredBank}
                onChange={(e) => setPreferredBank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Any / Best Bank Match Selected by RealCred</option>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.bankCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-brand-lightGrey mb-1 font-semibold">Partner Remarks / Special Case Details</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter client's CIBIL score if known, existing obligations, property status, or preferred bank officer..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Mandatory KYC Verification Documents */}
        <div className="pt-4 border-t border-white/5">
          <KycDocumentUploadFields
            aadhaarFile={aadhaarFile}
            setAadhaarFile={setAadhaarFile}
            panFile={panFile}
            setPanFile={setPanFile}
            bankProofFile={bankProofFile}
            setBankProofFile={setBankProofFile}
            accentColor="emerald"
            isOptional={false}
          />
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-[11px] text-brand-grey">
            Submitting this referral automatically links your Partner ID and preserves payout eligibility upon bank disbursement.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting File...</span>
              </>
            ) : (
              <>
                <span>Submit Referral</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
