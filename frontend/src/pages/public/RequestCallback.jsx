import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  ArrowRight,
  Headphones
} from 'lucide-react';
import loanService from '../../services/loanService.js';

export default function RequestCallback() {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    loanType: 'General Loan Inquiry',
    preferredContactTime: 'Anytime',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const loanOptions = [
    'General Loan Inquiry',
    'Home Loan',
    'Loan Against Property (LAP)',
    'Business Loan',
    'Personal Loan',
    'OD – Overdraft Facility',
    'Balance Transfer & Top-Up',
  ];

  const timeSlots = [
    { label: 'Morning (9:00 AM – 12:00 PM)', value: 'Morning (9 AM - 12 PM)' },
    { label: 'Afternoon (12:00 PM – 4:00 PM)', value: 'Afternoon (12 PM - 4 PM)' },
    { label: 'Evening (4:00 PM – 8:00 PM)', value: 'Evening (4 PM - 8 PM)' },
    { label: 'Anytime (Immediate)', value: 'Anytime' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'Please enter your name';
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Please enter your mobile number';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
      errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const res = await loanService.requestCallback({
        customerName: formData.customerName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        loanType: formData.loanType,
        preferredContactTime: formData.preferredContactTime,
        message: formData.message.trim(),
      });

      if (res.status === 'success') {
        setSuccessData(res.data);
      } else {
        setSubmitError(res.message || 'Unable to submit callback request.');
      }
    } catch (err) {
      console.error('Callback request error:', err);
      setSubmitError(
        err.response?.data?.message || 'Failed to register callback request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      loanType: 'General Loan Inquiry',
      preferredContactTime: 'Anytime',
      message: '',
    });
  };

  // SUCCESS STATE
  if (successData) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-textSecondary py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-w-0 max-w-full">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-border p-6 sm:p-8 text-center shadow-xl relative overflow-hidden min-w-0">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-red" />
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-brand-textPrimary mb-2">Callback Registered!</h2>
          <p className="text-xs text-brand-textSecondary mb-6">
            Thank you, <span className="text-brand-textPrimary font-semibold">{successData.customerName}</span>. Our loan advisory desk will call you during your preferred time window.
          </p>

          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border text-left mb-6 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-brand-border pb-2">
              <span className="text-brand-textSecondary">Request Reference</span>
              <span className="font-mono font-bold text-brand-red">{successData.requestNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-textSecondary">Preferred Window</span>
              <span className="font-semibold text-brand-textPrimary">{successData.preferredContactTime}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-redLight hover:text-brand-red transition-colors shadow-sm"
            >
              New Request
            </button>
            <Link
              to="/"
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-red text-xs font-bold text-white hover:bg-brand-deepRed transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-red/25"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="min-h-screen bg-brand-bg text-brand-textSecondary py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-w-0 max-w-full">
      <div className="max-w-4xl mx-auto min-w-0">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red text-xs font-semibold uppercase tracking-wider mb-4">
            <PhoneCall className="w-4 h-4" />
            <span>Direct Advisory Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-textPrimary tracking-tight">
            Request a Free Advisory Callback
          </h1>
          <p className="mt-3 text-base sm:text-lg text-brand-textSecondary max-w-2xl mx-auto">
            Have questions about loan eligibility, interest rates, or documentation? Leave your contact details and our senior loan specialist will call you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-md">
            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-brand-red/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <p className="text-xs text-brand-red">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                  Your Full Name <span className="text-brand-red">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Alok Verma"
                  className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${
                    formErrors.customerName ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                  }`}
                />
                {formErrors.customerName && <p className="mt-1 text-[11px] text-brand-red">{formErrors.customerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className={`w-full pl-12 pr-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${
                        formErrors.mobileNumber ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
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
                    placeholder="alok.verma@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl bg-white border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 shadow-sm ${
                      formErrors.email ? 'border-brand-red focus:ring-brand-red' : 'border-brand-border focus:ring-brand-red focus:border-brand-red'
                    }`}
                  />
                  {formErrors.email && <p className="mt-1 text-[11px] text-brand-red">{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                  Interested Loan Facility
                </label>
                <select
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red shadow-sm"
                >
                  {loanOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-red" />
                  Preferred Callback Time Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition-colors shadow-sm ${
                        formData.preferredContactTime === slot.value
                          ? 'bg-brand-redLight border-brand-red text-brand-textPrimary font-semibold'
                          : 'bg-white border-brand-border text-brand-textSecondary hover:text-brand-red hover:bg-brand-bg'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredContactTime"
                        value={slot.value}
                        checked={formData.preferredContactTime === slot.value}
                        onChange={handleChange}
                        className="accent-brand-red"
                      />
                      <span>{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1.5">
                  Specific Query or Requirement <span className="text-brand-textSecondary font-normal">(Optional)</span>
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details such as loan amount needed, preferred bank, or property location..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/50 focus:outline-none focus:ring-1 focus:ring-brand-red resize-none shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white font-bold text-xs tracking-wide transition-colors shadow-md shadow-brand-red/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Registering Callback Request...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Callback Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Direct Contact Side Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider flex items-center gap-2">
                <Headphones className="w-4 h-4 text-brand-red" />
                Prefer Instant Calling?
              </h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                Connect directly with our loan advisory managers right now:
              </p>
              <div className="space-y-3 pt-2">
                <a
                  href="tel:+919289223377"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-textSecondary">Primary Desk</div>
                    <div className="text-xs font-bold text-brand-textPrimary">+91 92892 23377</div>
                  </div>
                </a>

                <a
                  href="tel:+919289223378"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-textSecondary">Secondary Desk</div>
                    <div className="text-xs font-bold text-brand-textPrimary">+91 92892 23378</div>
                  </div>
                </a>

                <a
                  href="mailto:contact@realcred.in"
                  className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 transition-colors shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-textSecondary">Email Inquiry</div>
                    <div className="text-xs font-bold text-brand-textPrimary">contact@realcred.in</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-border p-6 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-brand-textPrimary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-red" />
                Corporate Office
              </h4>
              <p className="text-xs text-brand-textSecondary leading-relaxed">
                RealCred Technology Private Limited<br />
                D-9, Ground Floor, Workshala, Vyapar Marg,<br />
                Block D, Noida Sector 3, Noida, UP 201301
              </p>
              <div className="pt-2 text-[11px] text-brand-textSecondary">
                Operating Hours: Monday – Saturday (9:30 AM – 6:30 PM IST)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
