import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ArrowLeft, 
  Building2, 
  Clock, 
  IndianRupee, 
  ShieldCheck, 
  Calculator,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import loanService from '../../services/loanService.js';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await loanService.getCategoryBySlug(slug);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product details:', err);
        setError('Product details not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center text-brand-grey min-w-0 max-w-full">
        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading loan product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4 min-w-0 max-w-full">
        <h2 className="text-2xl font-bold text-brand-textPrimary mb-2 break-words">Product Not Found</h2>
        <p className="text-xs text-brand-textSecondary mb-6 break-words">The requested loan product could not be located in our catalog.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase border border-brand-border shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Loan Products</span>
        </Link>
      </div>
    );
  }

  // Format tenure and amounts safely
  const minTenureYears = Math.round((product.minTenureMonths || 12) / 12);
  const maxTenureYears = Math.round((product.maxTenureMonths || 360) / 12);
  const minAmountFormatted = product.minAmount ? `₹${(product.minAmount / 100000).toFixed(0)} Lakhs` : '₹50,000';
  const maxAmountFormatted = product.maxAmount ? `₹${(product.maxAmount / 10000000).toFixed(0)} Crores` : '₹10 Crores';

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12 min-w-0 max-w-full overflow-hidden">
      {/* Back button */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-textSecondary hover:text-brand-red transition"
        >
          <ArrowLeft className="w-4 h-4 text-brand-red shrink-0" />
          <span>Back to All Loan Products</span>
        </Link>
      </div>

      {/* Main Product Header Card */}
      <div className="bg-white p-6 sm:p-10 lg:p-12 rounded-3xl border border-brand-border shadow-md relative overflow-hidden min-w-0 max-w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-redLight/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-8 border-b border-brand-border min-w-0">
          <div className="max-w-3xl min-w-0 flex-1 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red block mb-1">
              RealCred Institutional Credit Solution
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-textPrimary tracking-tight leading-tight break-words [overflow-wrap:anywhere] [word-break:break-word]">
              {product.name}
            </h1>
            <p className="text-sm sm:text-base text-brand-textSecondary mt-2 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-line">
              {product.tagline || 'Institutional funding route with complete documentation coordination.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 min-w-0 w-full lg:w-auto">
            <Link
              to="/#emi-calculator"
              className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition flex items-center justify-center gap-2 text-center shadow-sm"
            >
              <Calculator className="w-4 h-4 text-brand-red shrink-0" />
              <span>Calculate EMI</span>
            </Link>

            <Link
              to={`/apply-loan?category=${product._id}`}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-red/30 transition flex items-center justify-center gap-2 text-center"
            >
              <span>Apply for this Loan</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Detailed Description / Overview & Funding Scope */}
        <div className="pt-8 max-w-4xl min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-3">
            Overview & Funding Scope
          </h3>
          <p className="text-sm text-brand-textSecondary leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Quick Loan Specifications Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-brand-border text-left text-xs min-w-0">
          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-brand-textSecondary mb-1 font-medium">
              <IndianRupee className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span className="truncate">Loan Amount Range</span>
            </div>
            <div className="text-brand-textPrimary font-bold font-mono text-sm break-words [overflow-wrap:anywhere]">
              {minAmountFormatted} - {maxAmountFormatted}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-brand-textSecondary mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span className="truncate">Repayment Tenure</span>
            </div>
            <div className="text-brand-textPrimary font-bold font-mono text-sm break-words [overflow-wrap:anywhere]">
              {minTenureYears} - {maxTenureYears} Years
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-brand-textSecondary mb-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Lending Partners</span>
            </div>
            <div className="text-brand-textPrimary font-bold text-sm break-words [overflow-wrap:anywhere]">
              Tier-1 Banks & NBFCs
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-brand-textSecondary mb-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Assistance Mode</span>
            </div>
            <div className="text-brand-textPrimary font-bold text-sm break-words [overflow-wrap:anywhere]">
              100% Guided Route
            </div>
          </div>
        </div>
      </div>

      {/* Structured Information Columns: Features, Eligibility, Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0 items-stretch">
        {/* Column 1: Features & Benefits */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border space-y-4 shadow-sm min-w-0 flex flex-col h-full">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border min-w-0">
            <div className="p-2 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider truncate">
              Features & Benefits
            </h4>
          </div>
          <ul className="space-y-3 flex-1 min-w-0">
            {product.features && product.features.length > 0 ? (
              product.features.map((f, i) => (
                <li key={i} className="text-xs text-brand-textSecondary flex items-start gap-2.5 leading-relaxed min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-red shrink-0 mt-0.5" />
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal">
                    {f}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-brand-textSecondary italic">Features will be customized based on applicant profile.</li>
            )}
          </ul>
        </div>

        {/* Column 2: Eligibility Norms */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border space-y-4 shadow-sm min-w-0 flex flex-col h-full">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border min-w-0">
            <div className="p-2 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider truncate">
              Eligibility Norms
            </h4>
          </div>
          <ul className="space-y-3 flex-1 min-w-0">
            {product.eligibility && product.eligibility.length > 0 ? (
              product.eligibility.map((e, i) => (
                <li key={i} className="text-xs text-brand-textSecondary flex items-start gap-2.5 leading-relaxed min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-red shrink-0 mt-0.5" />
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal">
                    {e}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-brand-textSecondary italic">Standard bank underwriting norms apply.</li>
            )}
          </ul>
        </div>

        {/* Column 3: Documentation Required */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-brand-border space-y-4 shadow-sm min-w-0 flex flex-col h-full">
          <div className="flex items-center gap-2 pb-3 border-b border-brand-border min-w-0">
            <div className="p-2 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-brand-textPrimary uppercase tracking-wider truncate">
              Documentation Required
            </h4>
          </div>
          <ul className="space-y-3 flex-1 min-w-0">
            {product.requiredDocuments && product.requiredDocuments.length > 0 ? (
              product.requiredDocuments.map((d, i) => (
                <li key={i} className="text-xs text-brand-textSecondary flex items-start gap-2.5 leading-relaxed min-w-0">
                  <FileText className="w-3.5 h-3.5 text-brand-red shrink-0 mt-0.5" />
                  <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal">
                    {d}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-brand-textSecondary italic">Standard KYC and financial records required.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Conversion Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-brand-textPrimary break-words [overflow-wrap:anywhere] [word-break:break-word]">
            Ready to apply for your {product.name}?
          </h3>
          <p className="text-xs text-brand-textSecondary mt-1 break-words [overflow-wrap:anywhere] [word-break:break-word]">
            Get personalized assistance from our dedicated loan underwriting officers.
          </p>
        </div>

        <Link
          to={`/apply-loan?category=${product._id}`}
          className="px-6 sm:px-8 py-3.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-brand-red/30 flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto text-center"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
