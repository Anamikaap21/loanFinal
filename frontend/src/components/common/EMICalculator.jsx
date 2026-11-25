import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  RotateCcw,
  ArrowRight,
  IndianRupee,
  Percent,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Sparkles
} from 'lucide-react';

export default function EMICalculator() {
  // Default values
  const DEFAULT_AMOUNT = 2500000;
  const DEFAULT_RATE = 8.75;
  const DEFAULT_TENURE = 15;
  const DEFAULT_TENURE_UNIT = 'Years';

  // State
  const [loanAmount, setLoanAmount] = useState(String(DEFAULT_AMOUNT));
  const [interestRate, setInterestRate] = useState(String(DEFAULT_RATE));
  const [tenure, setTenure] = useState(String(DEFAULT_TENURE));
  const [tenureUnit, setTenureUnit] = useState(DEFAULT_TENURE_UNIT);

  // Quick preset amounts for user convenience
  const amountPresets = [
    { label: '₹10 L', value: 1000000 },
    { label: '₹25 L', value: 2500000 },
    { label: '₹50 L', value: 5000000 },
    { label: '₹75 L', value: 7500000 },
    { label: '₹1 Cr', value: 10000000 },
  ];

  // Quick preset tenures
  const tenurePresets = [
    { label: '5 Yrs', value: 5, unit: 'Years' },
    { label: '10 Yrs', value: 10, unit: 'Years' },
    { label: '15 Yrs', value: 15, unit: 'Years' },
    { label: '20 Yrs', value: 20, unit: 'Years' },
    { label: '25 Yrs', value: 25, unit: 'Years' },
  ];

  // Calculations
  const calculation = useMemo(() => {
    const rawP = parseFloat(loanAmount.replace(/,/g, ''));
    const P = !isNaN(rawP) && rawP > 0 ? rawP : 0;

    const rawRate = parseFloat(interestRate);
    const annualRate = !isNaN(rawRate) && rawRate >= 0 ? rawRate : 0;
    const monthlyRate = annualRate / 12 / 100;

    const rawTenure = parseFloat(tenure);
    const validTenure = !isNaN(rawTenure) && rawTenure > 0 ? rawTenure : 0;
    const N = tenureUnit === 'Years' ? Math.round(validTenure * 12) : Math.round(validTenure);

    let emi = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (P > 0 && N > 0) {
      if (monthlyRate === 0) {
        // Special case: 0% interest rate
        emi = Math.round(P / N);
        totalPayable = P;
        totalInterest = 0;
      } else {
        const factor = Math.pow(1 + monthlyRate, N);
        if (isFinite(factor) && factor > 1) {
          emi = Math.round((P * monthlyRate * factor) / (factor - 1));
          totalPayable = Math.round(emi * N);
          totalInterest = Math.max(0, totalPayable - P);
        } else {
          emi = Math.round(P / N);
          totalPayable = P;
          totalInterest = 0;
        }
      }
    }

    // Principal vs Interest ratio percentages for visual bar
    const principalPercent = totalPayable > 0 ? Math.round((P / totalPayable) * 100) : 50;
    const interestPercent = totalPayable > 0 ? Math.max(0, 100 - principalPercent) : 50;

    return {
      principal: P,
      annualRate,
      months: N,
      emi,
      totalPayable,
      totalInterest,
      principalPercent,
      interestPercent,
    };
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  // Validation messages
  const validationErrors = useMemo(() => {
    const errors = {};
    const rawP = parseFloat(loanAmount.replace(/,/g, ''));
    if (loanAmount.trim() === '') {
      errors.loanAmount = 'Please enter a loan amount.';
    } else if (isNaN(rawP) || rawP <= 0) {
      errors.loanAmount = 'Loan amount must be a positive number.';
    } else if (rawP < 10000) {
      errors.loanAmount = 'Minimum loan amount is ₹10,000.';
    }

    const rawRate = parseFloat(interestRate);
    if (interestRate.trim() === '') {
      errors.interestRate = 'Please enter an interest rate.';
    } else if (isNaN(rawRate) || rawRate < 0) {
      errors.interestRate = 'Interest rate cannot be negative.';
    } else if (rawRate > 50) {
      errors.interestRate = 'Interest rate cannot exceed 50% p.a.';
    }

    const rawTenure = parseFloat(tenure);
    if (tenure.trim() === '') {
      errors.tenure = 'Please enter the loan tenure.';
    } else if (isNaN(rawTenure) || rawTenure <= 0) {
      errors.tenure = 'Tenure must be greater than zero.';
    } else if (tenureUnit === 'Years' && rawTenure > 40) {
      errors.tenure = 'Maximum tenure is 40 years.';
    } else if (tenureUnit === 'Months' && rawTenure > 480) {
      errors.tenure = 'Maximum tenure is 480 months (40 years).';
    }

    return errors;
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  // Reset to default values
  const handleReset = () => {
    setLoanAmount(String(DEFAULT_AMOUNT));
    setInterestRate(String(DEFAULT_RATE));
    setTenure(String(DEFAULT_TENURE));
    setTenureUnit(DEFAULT_TENURE_UNIT);
  };

  // Safe numeric amount input handler
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setLoanAmount(value);
  };

  // Safe rate input handler (allow decimal)
  const handleRateChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    // Allow at most one decimal point
    const parts = value.split('.');
    if (parts.length > 2) return;
    setInterestRate(value);
  };

  // Safe tenure input handler (integers only)
  const handleTenureChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setTenure(value);
  };

  // Unit switch converter
  const handleUnitToggle = (newUnit) => {
    if (newUnit === tenureUnit) return;
    const currentVal = parseFloat(tenure);
    if (!isNaN(currentVal) && currentVal > 0) {
      if (newUnit === 'Months' && tenureUnit === 'Years') {
        setTenure(String(Math.round(currentVal * 12)));
      } else if (newUnit === 'Years' && tenureUnit === 'Months') {
        const inYears = Math.round((currentVal / 12) * 10) / 10;
        setTenure(String(inYears));
      }
    }
    setTenureUnit(newUnit);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="emi-calculator">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/25 text-xs text-brand-red font-semibold mb-3">
          <Calculator className="w-3.5 h-3.5" />
          <span>RealCred Financial Tools</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Loan EMI Calculator</h2>
        <p className="text-xs sm:text-sm text-brand-grey mt-2">
          Calculate your estimated monthly installment with zero guesswork. Enter loan parameters manually below.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-[#19191B] rounded-3xl border border-white/10 p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden min-w-0 max-w-full">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start min-w-0">
          {/* LEFT COLUMN: MANUAL INPUT FIELDS (NO SLIDERS) */}
          <div className="lg:col-span-7 space-y-6 min-w-0 w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-grey">
                Manual Loan Parameters
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-brand-grey hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                title="Restore default calculator values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* FIELD 1: LOAN AMOUNT */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-brand-red" />
                  <span>Loan Amount (₹)</span>
                </label>
                {calculation.principal > 0 && (
                  <span className="text-xs font-mono font-bold text-brand-redAccent">
                    ₹{calculation.principal.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-grey select-none">
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={loanAmount}
                  onChange={handleAmountChange}
                  placeholder="e.g. 2500000"
                  className={`w-full pl-9 pr-4 py-3 rounded-2xl bg-[#111111] border text-white text-sm font-mono placeholder:text-brand-grey focus:outline-none focus:ring-2 transition ${
                    validationErrors.loanAmount
                      ? 'border-brand-red focus:ring-brand-red/50'
                      : 'border-white/10 focus:ring-brand-red/50 focus:border-brand-red'
                  }`}
                />
              </div>

              {/* Validation error or formatted helper */}
              {validationErrors.loanAmount ? (
                <p className="text-[11px] text-brand-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.loanAmount}</span>
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-brand-grey uppercase tracking-wider mr-1">Presets:</span>
                  {amountPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setLoanAmount(String(preset.value))}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition ${
                        calculation.principal === preset.value
                          ? 'bg-brand-red text-white border-brand-red font-bold'
                          : 'bg-white/5 text-brand-grey hover:text-white border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FIELD 2: INTEREST RATE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-400" />
                  <span>Annual Interest Rate (% p.a.)</span>
                </label>
                {calculation.annualRate >= 0 && (
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {calculation.annualRate}% p.a.
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={interestRate}
                  onChange={handleRateChange}
                  placeholder="e.g. 8.75"
                  className={`w-full pl-4 pr-12 py-3 rounded-2xl bg-[#111111] border text-white text-sm font-mono placeholder:text-brand-grey focus:outline-none focus:ring-2 transition ${
                    validationErrors.interestRate
                      ? 'border-brand-red focus:ring-brand-red/50'
                      : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-grey select-none">
                  % p.a.
                </span>
              </div>

              {validationErrors.interestRate && (
                <p className="text-[11px] text-brand-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.interestRate}</span>
                </p>
              )}
            </div>

            {/* FIELD 3: LOAN TENURE (MANUAL INPUT + YEARS/MONTHS TOGGLE) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Loan Tenure ({tenureUnit})</span>
                </label>
                {calculation.months > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {tenureUnit === 'Years'
                      ? `${tenure} Yrs = ${calculation.months} Mos`
                      : `${tenure} Mos = ${(calculation.months / 12).toFixed(1)} Yrs`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                {/* Numeric Tenure Input */}
                <div className="sm:col-span-7 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tenure}
                    onChange={handleTenureChange}
                    placeholder={tenureUnit === 'Years' ? 'e.g. 15' : 'e.g. 180'}
                    className={`w-full px-4 py-3 rounded-2xl bg-[#111111] border text-white text-sm font-mono placeholder:text-brand-grey focus:outline-none focus:ring-2 transition ${
                      validationErrors.tenure
                        ? 'border-brand-red focus:ring-brand-red/50'
                        : 'border-white/10 focus:ring-emerald-500/50 focus:border-emerald-500'
                    }`}
                  />
                </div>

                {/* Years / Months Unit Switcher */}
                <div className="sm:col-span-5 grid grid-cols-2 p-1 bg-[#111111] rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('Years')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      tenureUnit === 'Years'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-brand-grey hover:text-white'
                    }`}
                  >
                    Years
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('Months')}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      tenureUnit === 'Months'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-brand-grey hover:text-white'
                    }`}
                  >
                    Months
                  </button>
                </div>
              </div>

              {/* Tenure validation or Presets */}
              {validationErrors.tenure ? (
                <p className="text-[11px] text-brand-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.tenure}</span>
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-brand-grey uppercase tracking-wider mr-1">Presets:</span>
                  {tenurePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setTenure(String(preset.value));
                        setTenureUnit(preset.unit);
                      }}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition ${
                        tenureUnit === preset.unit && parseFloat(tenure) === preset.value
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-white/5 text-brand-grey hover:text-white border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CALCULATION RESULTS CARD */}
          <div className="lg:col-span-5 bg-[#111111] p-5 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6 min-w-0 w-full">
            {/* Primary Result: Monthly EMI */}
            <div className="text-center pb-6 border-b border-white/10 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-grey block mb-1">
                Estimated Monthly EMI
              </span>
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-redAccent font-mono tracking-tight break-words [overflow-wrap:anywhere]">
                ₹{calculation.emi.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-brand-grey mt-2">
                For {calculation.months} monthly instalments @ {calculation.annualRate}% p.a.
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="space-y-3">
              {/* 1. Principal Loan Amount */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-brand-lightGrey font-medium">Principal Loan Amount</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-white font-mono">
                  ₹{calculation.principal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* 2. Total Interest Payable */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-brand-lightGrey font-medium">Total Interest Payable</span>
                </div>
                <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">
                  ₹{calculation.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              {/* 3. Total Amount Payable */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-white font-bold">Total Amount Payable</span>
                </div>
                <span className="text-xs sm:text-sm font-black text-white font-mono">
                  ₹{calculation.totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Visual ratio bar: Principal vs Interest */}
            {calculation.totalPayable > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="h-2 rounded-full overflow-hidden flex bg-white/5">
                  <div
                    style={{ width: `${calculation.principalPercent}%` }}
                    className="bg-blue-500 h-full transition-all duration-300"
                    title={`Principal: ${calculation.principalPercent}%`}
                  />
                  <div
                    style={{ width: `${calculation.interestPercent}%` }}
                    className="bg-amber-400 h-full transition-all duration-300"
                    title={`Interest: ${calculation.interestPercent}%`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-brand-grey font-medium">
                  <span className="text-blue-400 font-mono">Principal: {calculation.principalPercent}%</span>
                  <span className="text-amber-400 font-mono">Interest: {calculation.interestPercent}%</span>
                </div>
              </div>
            )}

            {/* APPLY FOR LOAN BUTTON */}
            <div className="pt-2">
              <Link
                to={`/apply-loan?amount=${calculation.principal}&tenure=${tenure}%20${tenureUnit}&rate=${calculation.annualRate}`}
                className="w-full py-4 rounded-2xl bg-brand-red hover:bg-brand-redAccent text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-brand-red/30 transition flex items-center justify-center gap-2 group"
              >
                <span>APPLY FOR LOAN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[10px] text-center text-brand-grey mt-2">
                Clicking will prefill this loan amount on your application form.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
