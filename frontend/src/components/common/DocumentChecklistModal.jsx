import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Percent, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';

export default function DocumentChecklistModal({ isOpen, onClose, product }) {
  if (!isOpen || !product) return null;

  const checklist = (product.documentChecklist && product.documentChecklist.length > 0)
    ? product.documentChecklist
    : (product.requiredDocuments && product.requiredDocuments.length > 0)
      ? product.requiredDocuments
      : [
          'PAN Card & Aadhaar Card',
          'Latest Income Proof / Salary Slips / ITR',
          'Last 6-12 Months Bank Account Statements',
          'Address Proof & Identity Proof',
          'Relevant Property or Business Continuity Proof',
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-brand-border z-10 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative subtle background blob */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-redLight/50 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-brand-border relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-white bg-brand-red px-2.5 py-0.5 rounded-md shadow-sm">
                {product.shortName || 'LOAN'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                Active Facility
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-brand-textPrimary break-words">
              {product.name}
            </h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Official Document Checklist & Verification Requirements
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-bg transition shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Facility Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 relative z-10">
          <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-center">
            <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">ROI Range</span>
            <span className="text-xs font-bold text-brand-textPrimary truncate block">
              {product.baseInterestRate || `${product.minInterestRate || 8.5}% - ${product.maxInterestRate || 15}%`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-center">
            <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">Max Tenure</span>
            <span className="text-xs font-bold text-brand-textPrimary truncate block">
              {product.maximumTenure || `${Math.round((product.maxTenureMonths || 360) / 12)} Years`}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-center">
            <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">Max Limit</span>
            <span className="text-xs font-bold text-brand-textPrimary truncate block">
              {product.maximumFacility || (product.maxAmount ? `₹${(product.maxAmount / 10000000).toFixed(0)} Cr` : '₹50 Lakhs')}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-center">
            <span className="text-[10px] text-brand-textSecondary block uppercase font-medium">Turnaround</span>
            <span className="text-xs font-bold text-brand-red truncate block">
              {product.processingTime || '5-7 Days'}
            </span>
          </div>
        </div>

        {/* Checklist Content */}
        <div className="relative z-10 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
            <FileText className="w-4 h-4 text-brand-red shrink-0" />
            <span>Required Documents ({checklist.length})</span>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-brand-bg/60 border border-brand-border hover:border-brand-red/30 transition text-xs text-brand-textPrimary"
              >
                <div className="w-5 h-5 rounded-full bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span className="flex-1 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>

          {/* Verification Advisory Note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2 mt-4">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>RealCred Verification Desk:</strong> Keep clear, self-attested soft copies (PDF or JPG) ready. Our loan officer will guide you through instant institutional verification.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-5 mt-5 border-t border-brand-border flex items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary text-xs font-semibold border border-brand-border transition"
          >
            Close
          </button>

          <Link
            to={`/apply-loan?category=${product._id}`}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-2"
          >
            <span>Apply for this Loan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
