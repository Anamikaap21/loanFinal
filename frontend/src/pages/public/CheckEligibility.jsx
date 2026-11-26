import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator,
  IndianRupee,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Info,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';
import loanService from '../../services/loanService.js';

// Format currency to Indian Rupees (e.g., ₹45,00,000)
const formatCurrency = (val) => {
  const num = Math.round(Number(val) || 0);
  return '₹' + num.toLocaleString('en-IN');
};

// Compact Indian format (e.g., 5 Lakhs, 1.5 Crores)
const formatCompactIndian = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(2)} Crore${cr > 1 ? 's' : ''}`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk % 1 === 0 ? lk : lk.toFixed(1)} Lakh${lk > 1 ? 's' : ''}`;
  }
  return formatCurrency(num);
};

export default function CheckEligibility() {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  // Categories fetched from backend or default fallback
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Form states
  const [monthlyIncome, setMonthlyIncome] = useState('75000');
  const [existingEmi, setExistingEmi] = useState('15000');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [requiredAmount, setRequiredAmount] = useState(4500000); // 45 Lakhs default

  // Results & calculation state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Default fallback categories
  const fallbackCategories = useMemo(
    () => [
      { _id: 'cat_home', name: 'Home Loan', slug: 'home-loan', benchmarkRate: 8.5, defaultTenureYears: 20 },
      { _id: 'cat_personal', name: 'Personal Loan', slug: 'personal-loan', benchmarkRate: 12.5, defaultTenureYears: 5 },
      { _id: 'cat_business', name: 'Business Loan', slug: 'business-loan', benchmarkRate: 14.0, defaultTenureYears: 5 },
      { _id: 'cat_lap', name: 'Loan Against Property', slug: 'loan-against-property', benchmarkRate: 10.0, defaultTenureYears: 15 },
      { _id: 'cat_education', name: 'Education Loan', slug: 'education-loan', benchmarkRate: 10.5, defaultTenureYears: 10 },
      { _id: 'cat_vehicle', name: 'Vehicle / Car Loan', slug: 'vehicle-loan', benchmarkRate: 9.5, defaultTenureYears: 7 },
    ],
    []
  );

  // Fetch active categories from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setIsLoadingCategories(true);
        const res = await loanService.getCategories();
        if (isMounted) {
          const list = (res.data || []).filter(
            (c) => c.isActive !== false && (c.status || '').toLowerCase() !== 'inactive'
          );
          if (list.length > 0) {
            setCategories(list);
            setSelectedCategoryId(list[0]._id);
          } else {
            setCategories(fallbackCategories);
            setSelectedCategoryId(fallbackCategories[0]._id);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCategories(fallbackCategories);
          setSelectedCategoryId(fallbackCategories[0]._id);
        }
      } finally {
        if (isMounted) setIsLoadingCategories(false);
      }
    };

    fetchCats();
    return () => {
      isMounted = false;
    };
  }, [fallbackCategories]);

  // Selected category benchmark rules
  const activeCategoryMeta = useMemo(() => {
    const cat = categories.find((c) => c._id === selectedCategoryId) || categories[0] || fallbackCategories[0];
    const catName = (cat?.name || '').toLowerCase();

    let benchmarkRate = 10.0;
    let tenureYears = 15;

    if (catName.includes('home')) {
      benchmarkRate = 8.5;
      tenureYears = 20;
    } else if (catName.includes('personal')) {
      benchmarkRate = 12.5;
      tenureYears = 5;
    } else if (catName.includes('business')) {
      benchmarkRate = 14.0;
      tenureYears = 5;
    } else if (catName.includes('property') || catName.includes('lap')) {
      benchmarkRate = 10.0;
      tenureYears = 15;
    } else if (catName.includes('education')) {
      benchmarkRate = 10.5;
      tenureYears = 10;
    } else if (catName.includes('car') || catName.includes('vehicle')) {
      benchmarkRate = 9.5;
      tenureYears = 7;
    }

    return {
      category: cat,
      benchmarkRate,
      tenureYears,
    };
  }, [categories, selectedCategoryId, fallbackCategories]);

  // Execute eligibility calculation
  const handleCalculate = (e) => {
    if (e) e.preventDefault();
    setValidationError('');

    const income = parseFloat(String(monthlyIncome).replace(/,/g, ''));
    const emi = parseFloat(String(existingEmi || 0).replace(/,/g, '')) || 0;

    if (isNaN(income) || income <= 0) {
      setValidationError('Please enter a valid monthly net income greater than 0.');
      return;
    }

    if (emi < 0) {
      setValidationError('Existing monthly EMI obligations cannot be negative.');
      return;
    }

    if (emi >= income) {
      setValidationError('Existing monthly EMIs cannot be equal to or higher than total monthly income.');
      return;
    }

    // Determine FOIR (Fixed Obligation to Income Ratio)
    let foirPercent = 50;
    if (employmentType === 'Salaried') {
      if (income < 35000) foirPercent = 45;
      else if (income < 75000) foirPercent = 50;
      else if (income < 150000) foirPercent = 55;
      else foirPercent = 65;
    } else {
      // Self Employed
      if (income < 50000) foirPercent = 50;
      else if (income < 150000) foirPercent = 60;
      else foirPercent = 65;
    }

    const foirRatio = foirPercent / 100;
    const maxPermissibleTotalEmi = Math.round(income * foirRatio);
    const availableEmiCapacity = Math.max(0, maxPermissibleTotalEmi - emi);

    const { benchmarkRate, tenureYears, category } = activeCategoryMeta;
    const monthlyRate = benchmarkRate / 12 / 100;
    const totalMonths = tenureYears * 12;

    // Requested Loan EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    const requestedMonthlyEmi =
      factor > 1 ? Math.round((requiredAmount * monthlyRate * factor) / (factor - 1)) : 0;

    // Max Eligible Loan via Present Value formula: AvailableEMI * ((1+r)^n - 1) / (r * (1+r)^n)
    let maxEligibleLoan = 0;
    if (availableEmiCapacity > 0 && factor > 1) {
      const rawEligible = (availableEmiCapacity * (factor - 1)) / (monthlyRate * factor);
      // Round to nearest ₹10,000 for clean bank-style quote
      maxEligibleLoan = Math.round(rawEligible / 10000) * 10000;
    }

    // Cap max eligible at reasonable ceiling (e.g. ₹20 Crores max)
    maxEligibleLoan = Math.min(200000000, maxEligibleLoan);

    // Indicative Status
    let status = 'eligible'; // 'eligible' | 'partial' | 'ineligible'
    let statusLabel = 'High Approval Probability';
    let statusBadgeText = 'Eligible';

    if (availableEmiCapacity <= 0) {
      status = 'ineligible';
      statusLabel = 'Obligations Exceed Standard Bank FOIR';
      statusBadgeText = 'Not Eligible';
    } else if (maxEligibleLoan < requiredAmount) {
      status = 'partial';
      statusLabel = 'Partially Eligible (Lower Amount)';
      statusBadgeText = 'Partially Eligible';
    } else {
      status = 'eligible';
      statusLabel = 'High Approval Probability';
      statusBadgeText = 'Eligible';
    }

    const resultPayload = {
      income,
      existingEmi: emi,
      employmentType,
      categoryName: category?.name || 'Loan',
      categorySlug: category?.slug || '',
      categoryId: category?._id || '',
      requiredAmount,
      tenureYears,
      benchmarkRate,
      foirPercent,
      maxPermissibleTotalEmi,
      availableEmiCapacity,
      requestedMonthlyEmi,
      maxEligibleLoan,
      status,
      statusLabel,
      statusBadgeText,
    };

    setCalculationResult(resultPayload);
    setHasCalculated(true);

    // Smooth scroll down to result after a brief frame
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Quick preset income helper
  const handleSelectIncomePreset = (val) => {
    setMonthlyIncome(String(val));
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-textPrimary font-sans overflow-x-hidden">
      {/* ========================================================
          A. HERO SECTION
          Light blue/grey background (#F4F7FB)
          Badge: CREDIT CAPACITY ESTIMATION
          Main heading: Check Loan Eligibility Online
          Subtitle: Find out how much loan amount you can qualify for...
      ======================================================== */}
      <section className="bg-[#F4F7FB] border-b border-brand-border py-12 sm:py-16 md:py-20 px-4 text-center w-full min-w-0 box-border">
        <div className="max-w-4xl mx-auto">
          {/* Small outlined badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-slate-300 text-slate-700 bg-white shadow-sm mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-brand-red" />
            <span>CREDIT CAPACITY ESTIMATION</span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#111827] tracking-tight mb-4">
            Check Loan Eligibility Online
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Find out how much loan amount you can qualify for based on your net income and existing obligations.
          </p>
        </div>
      </section>

      {/* ========================================================
          B. CALCULATOR CARD
          Large white card, centered, rounded-3xl, subtle shadow, light border
      ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 sm:-mt-10 mb-20 relative z-10 w-full min-w-0 box-border">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-border shadow-xl p-5 sm:p-8 lg:p-10 transition-all w-full min-w-0 box-border overflow-hidden">
          {/* Card Header */}
          <div className="border-b border-brand-border pb-6 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-textPrimary mb-2">
              Check Your Loan Eligibility
            </h2>
            <p className="text-sm sm:text-base text-brand-textSecondary leading-relaxed">
              Estimate a possible borrowing amount from the values entered below. This local calculation is not a lender decision or pre-approval.
            </p>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Please check your inputs</p>
                <p>{validationError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCalculate} className="space-y-8">
            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* Column 1 - Field 1: MONTHLY NET INCOME */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  MONTHLY NET INCOME (₹) <span className="text-brand-red">*</span>
                </label>
                <div className="relative rounded-xl border border-brand-border focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full pl-8 pr-4 py-3.5 bg-transparent rounded-xl text-base font-semibold text-brand-textPrimary placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-brand-textSecondary">
                    In-hand salary / net business profit.
                  </p>
                  {/* Quick Preset Badges */}
                  <div className="hidden sm:flex gap-1">
                    {[50000, 75000, 100000].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => handleSelectIncomePreset(preset)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-brand-redLight hover:text-brand-red text-slate-600 transition"
                      >
                        ₹{preset / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2 - Field 3: EMPLOYMENT TYPE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  EMPLOYMENT TYPE <span className="text-brand-red">*</span>
                </label>
                <div className="relative rounded-xl border border-brand-border focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15 transition-all">
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-transparent rounded-xl text-base font-semibold text-brand-textPrimary focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Salaried">Salaried (MNC / Corporate / Govt)</option>
                    <option value="Self Employed">Self Employed (Business / Professional)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-brand-textSecondary mt-1.5">
                  Select your primary occupation category.
                </p>
              </div>

              {/* Column 1 - Field 2: EXISTING MONTHLY EMI OBLIGATIONS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  EXISTING MONTHLY EMI OBLIGATIONS (₹)
                </label>
                <div className="relative rounded-xl border border-brand-border focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={existingEmi}
                    onChange={(e) => setExistingEmi(e.target.value)}
                    placeholder="e.g. 15000 (Enter 0 if none)"
                    className="w-full pl-8 pr-4 py-3.5 bg-transparent rounded-xl text-base font-semibold text-brand-textPrimary placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <p className="text-xs text-brand-textSecondary mt-1.5">
                  Current active car, personal, or other EMIs.
                </p>
              </div>

              {/* Column 2 - Field 4: DESIRED LOAN CATEGORY */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  DESIRED LOAN CATEGORY <span className="text-brand-red">*</span>
                </label>
                <div className="relative rounded-xl border border-brand-border focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15 transition-all">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    disabled={isLoadingCategories}
                    className="w-full px-4 py-3.5 bg-transparent rounded-xl text-base font-semibold text-brand-textPrimary focus:outline-none appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-brand-textSecondary mt-1.5">
                  Benchmark: ~{activeCategoryMeta.benchmarkRate}% interest rate over {activeCategoryMeta.tenureYears} years.
                </p>
              </div>
            </div>

            {/* ========================================================
                D. SLIDER SECTION: REQUIRED LOAN AMOUNT
                Min: ₹5 Lakhs, Max: ₹2 Crores, Default: ₹45 Lakhs
            ======================================================== */}
            <div className="pt-4 border-t border-brand-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  REQUIRED LOAN AMOUNT
                </label>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-red tracking-tight">
                  {formatCurrency(requiredAmount)}
                </div>
              </div>

              {/* Slider Input with active track gradient */}
              <div className="relative py-2">
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="50000"
                  value={requiredAmount}
                  onChange={(e) => setRequiredAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-red focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #D71938 0%, #D71938 ${
                      ((requiredAmount - 500000) / (20000000 - 500000)) * 100
                    }%, #E2E8F0 ${
                      ((requiredAmount - 500000) / (20000000 - 500000)) * 100
                    }%, #E2E8F0 100%)`,
                  }}
                />
              </div>

              {/* Labels below slider */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mt-2">
                <span>₹5 Lakhs</span>
                <span>₹1 Crore</span>
                <span>₹2 Crores</span>
              </div>
            </div>

            {/* ========================================================
                E. BUTTON: Calculate Eligibility Score
                Dark styling (#18181B), white bold text, red accent
            ======================================================== */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl sm:rounded-2xl bg-[#18181B] hover:bg-black text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.99] group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-brand-red group-hover:rotate-12 transition-transform duration-300" />
              <span>Calculate Eligibility Score</span>
            </button>
          </form>

          {/* ========================================================
              F. CALCULATION & RESULTS SECTION
          ======================================================== */}
          {hasCalculated && calculationResult && (
            <div ref={resultsRef} className="mt-10 pt-8 border-t-2 border-brand-border w-full min-w-0 box-border">
              {/* Status Header Banner */}
              <div
                className={`w-full min-w-0 box-border p-4 sm:p-6 rounded-2xl border mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden ${
                  calculationResult.status === 'eligible'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : calculationResult.status === 'partial'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-3.5 min-w-0 flex-1">
                  {calculationResult.status === 'eligible' ? (
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0 mt-0.5" />
                  ) : calculationResult.status === 'partial' ? (
                    <Info className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[11px] sm:text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                          calculationResult.status === 'eligible'
                            ? 'bg-emerald-200 text-emerald-800'
                            : calculationResult.status === 'partial'
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-rose-200 text-rose-800'
                        }`}
                      >
                        {calculationResult.statusBadgeText}
                      </span>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold break-words">
                        {calculationResult.statusLabel}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed break-words">
                      {calculationResult.status === 'eligible' &&
                        `You have a robust debt-to-income profile! You qualify for up to ${formatCompactIndian(
                          calculationResult.maxEligibleLoan
                        )}, which easily satisfies your requested ${formatCompactIndian(
                          calculationResult.requiredAmount
                        )}.`}
                      {calculationResult.status === 'partial' &&
                        `Based on standard banking guidelines (${calculationResult.foirPercent}% FOIR), your income qualifies you for ${formatCompactIndian(
                          calculationResult.maxEligibleLoan
                        )}. You can bridge the gap by adding a co-applicant or extending tenure.`}
                      {calculationResult.status === 'ineligible' &&
                        `Your existing monthly commitments (${formatCurrency(
                          calculationResult.existingEmi
                        )}) exceed the maximum allowable debt obligation limit for your declared monthly income.`}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-start md:self-center bg-white/70 px-3.5 py-2 rounded-xl border border-black/5">
                  <span className="text-[11px] text-slate-500 font-medium block">Standard FOIR:</span>
                  <div className="text-base sm:text-lg font-bold text-slate-800">
                    {calculationResult.foirPercent}% of Income
                  </div>
                </div>
              </div>

              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 w-full min-w-0 box-border">
                {/* 1. Estimated Eligible Amount */}
                <div className="min-w-0 w-full p-4 sm:p-5 rounded-2xl bg-brand-redLight/40 border border-brand-red/25 shadow-sm flex flex-col justify-between box-border overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-red mb-2 break-words leading-tight">
                    ESTIMATED ELIGIBLE AMOUNT
                  </div>
                  <div
                    className="font-extrabold text-brand-red my-1 tracking-tight break-all truncate tabular-nums"
                    style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)' }}
                    title={formatCurrency(calculationResult.maxEligibleLoan)}
                  >
                    {formatCurrency(calculationResult.maxEligibleLoan)}
                  </div>
                  <div className="text-xs text-slate-600 font-medium truncate mt-1">
                    {formatCompactIndian(calculationResult.maxEligibleLoan)} max capacity
                  </div>
                </div>

                {/* 2. Requested Loan Amount */}
                <div className="min-w-0 w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between box-border overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 break-words leading-tight">
                    REQUESTED LOAN AMOUNT
                  </div>
                  <div
                    className="font-extrabold text-slate-900 my-1 tracking-tight break-all truncate tabular-nums"
                    style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)' }}
                    title={formatCurrency(calculationResult.requiredAmount)}
                  >
                    {formatCurrency(calculationResult.requiredAmount)}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-1">
                    {calculationResult.categoryName} ({calculationResult.tenureYears} Yrs)
                  </div>
                </div>

                {/* 3. Monthly EMI Capacity */}
                <div className="min-w-0 w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between box-border overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 break-words leading-tight">
                    MONTHLY EMI CAPACITY
                  </div>
                  <div
                    className="font-extrabold text-slate-900 my-1 tracking-tight break-all truncate tabular-nums"
                    style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)' }}
                    title={formatCurrency(calculationResult.availableEmiCapacity)}
                  >
                    {formatCurrency(calculationResult.availableEmiCapacity)}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-1">
                    Permissible under FOIR
                  </div>
                </div>

                {/* 4. Estimated Monthly EMI */}
                <div className="min-w-0 w-full p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm flex flex-col justify-between box-border overflow-hidden">
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 break-words leading-tight">
                    ESTIMATED MONTHLY EMI
                  </div>
                  <div
                    className="font-extrabold text-slate-900 my-1 tracking-tight break-all truncate tabular-nums"
                    style={{ fontSize: 'clamp(1.15rem, 1.8vw, 1.6rem)' }}
                    title={formatCurrency(calculationResult.requestedMonthlyEmi)}
                  >
                    {formatCurrency(calculationResult.requestedMonthlyEmi)}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-1">
                    @ ~{calculationResult.benchmarkRate}% for requested loan
                  </div>
                </div>
              </div>

              {/* Visual Comparison Bar */}
              <div className="w-full min-w-0 box-border bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 mb-6 sm:mb-8 overflow-hidden">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-bold text-slate-700 mb-2.5">
                  <span className="min-w-0 truncate">Capacity Fulfillment Analysis</span>
                  <span className="text-brand-red font-extrabold shrink-0">
                    {calculationResult.maxEligibleLoan > 0
                      ? `${Math.min(
                          200,
                          Math.round(
                            (calculationResult.maxEligibleLoan / calculationResult.requiredAmount) * 100
                          )
                        )}% of requested loan`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      calculationResult.status === 'eligible'
                        ? 'bg-emerald-500'
                        : calculationResult.status === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (calculationResult.maxEligibleLoan / calculationResult.requiredAmount) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-slate-500 mt-2.5">
                  <span className="shrink-0">₹0</span>
                  <span className="shrink-0">Requested: {formatCompactIndian(calculationResult.requiredAmount)}</span>
                  <span className="shrink-0 font-medium text-slate-700">Eligible: {formatCompactIndian(calculationResult.maxEligibleLoan)}</span>
                </div>
              </div>

              {/* Action Buttons & Call to Action */}
              <div className="w-full min-w-0 box-border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-redLight to-white border border-brand-red/25 overflow-hidden">
                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-bold text-brand-textPrimary break-words leading-snug">
                    Ready to turn this estimate into an approved loan?
                  </h4>
                  <p className="text-xs sm:text-sm text-brand-textSecondary mt-1 break-words leading-relaxed">
                    Apply directly online with instant document upload and partner bank match.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 min-w-0 w-full lg:w-auto">
                  <Link
                    to={`/apply-loan?category=${
                      calculationResult.categorySlug || calculationResult.categoryId
                    }&amount=${
                      calculationResult.status === 'eligible'
                        ? calculationResult.requiredAmount
                        : calculationResult.maxEligibleLoan || calculationResult.requiredAmount
                    }&income=${calculationResult.income}&employmentType=${encodeURIComponent(
                      calculationResult.employmentType
                    )}`}
                    state={{
                      categorySlug: calculationResult.categorySlug,
                      amount:
                        calculationResult.status === 'eligible'
                          ? calculationResult.requiredAmount
                          : calculationResult.maxEligibleLoan || calculationResult.requiredAmount,
                      income: calculationResult.income,
                      employmentType: calculationResult.employmentType,
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white font-bold text-sm shadow-md hover:shadow-lg transition-all text-center whitespace-nowrap min-w-0"
                  >
                    <span>Apply for This Loan</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-brand-border transition text-center whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Modify</span>
                  </button>
                </div>
              </div>

              {/* Banker's Regulatory Disclaimer */}
              <div className="w-full min-w-0 box-border mt-6 sm:mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="min-w-0 flex-1 break-words">
                  <strong>Disclaimer & Calculation Terms:</strong> This eligibility check uses standard Indian retail banking Fixed Obligation to Income Ratio (FOIR) models with indicative rates for {calculationResult.categoryName}. Actual loan sanction, applicable interest rate, processing charges, and approved loan amount are subject to underwriting guidelines, credit bureau score (CIBIL / Experian), technical/legal property valuation, bank credit policies, and document verification by our lending partners.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          G. HOW LOAN ELIGIBILITY IS CALCULATED (Informative Section)
      ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-red mb-2 block">
            HOW IT WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-textPrimary">
            Factors Influencing Your Loan Eligibility
          </h2>
          <p className="text-sm sm:text-base text-brand-textSecondary max-w-xl mx-auto mt-2">
            Lenders evaluate multiple criteria before determining your maximum borrowing capacity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-redLight flex items-center justify-center text-brand-red mb-4">
              <Percent className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary mb-2">FOIR Ratio</h3>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Banks limit total monthly debt obligations (including your new loan) to typically 45%–65% of your regular net monthly income.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-redLight flex items-center justify-center text-brand-red mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary mb-2">Credit Score (CIBIL)</h3>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              A credit score of 750 or higher demonstrates disciplined repayment history and commands preferential interest rates and higher loan amounts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-brand-redLight flex items-center justify-center text-brand-red mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary mb-2">Tenure & Age</h3>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Opting for a longer tenure lowers your monthly installment, thereby increasing your eligibility for a higher principal loan amount.
            </p>
          </div>
        </div>

        {/* Quick CTA box */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-brand-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-red text-white flex items-center justify-center flex-shrink-0">
              <Calculator className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-brand-textPrimary">Want to calculate exact EMIs?</h4>
              <p className="text-sm text-brand-textSecondary">
                Use our interactive EMI Calculator to compare interest rates and tenure schedules.
              </p>
            </div>
          </div>
          <Link
            to="/#emi-calculator"
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm text-center transition flex items-center justify-center gap-2"
          >
            <span>Open EMI Calculator</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
