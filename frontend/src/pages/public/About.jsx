import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, CheckCircle2, ShieldCheck, HeartHandshake, Eye, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 sm:space-y-16 min-w-0 max-w-full">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-border/60 text-xs text-brand-grey mb-6">
          <Building2 className="w-4 h-4 text-brand-red" />
          <span>REALCRED TECHNOLOGY PRIVATE LIMITED</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          About <span className="gradient-text-red">RealCred</span>
        </h1>
        <p className="mt-3 text-base text-brand-lightGrey font-medium">
          Your Loan. One Guided Route.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="glass-card p-8 sm:p-12 rounded-3xl border border-brand-cardBorder space-y-6 max-w-4xl mx-auto text-sm sm:text-base text-brand-grey leading-relaxed">
        <h2 className="text-2xl font-bold text-white pb-3 border-b border-white/5">
          A Single Point of Contact for Your Loan Requirements.
        </h2>

        <p>
          RealCred Technology Private Limited is a corporate loan distribution and financial services company connecting customers with suitable banking and NBFC solutions.
        </p>

        <p>
          We understand that approaching multiple banks, managing documentation and coordinating loan applications can be complicated. RealCred simplifies this experience by providing customers with one dedicated point of contact.
        </p>

        <p>
          From understanding financial requirements and identifying suitable lending institutions to application processing, documentation and bank coordination, our team assists customers throughout their loan journey, up to disbursement.
        </p>

        <p>
          We also work towards building a stronger business ecosystem for our DSA and Channel Partners through dedicated support, transparent processes and faster payout commitments.
        </p>

        <p className="font-semibold text-white">
          Our focus is to make loan facilitation more organised for customers and business relationships more dependable for partners.
        </p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-3xl glass-card border border-brand-cardBorder space-y-4">
          <div className="w-10 h-10 rounded-xl bg-brand-red/10 text-brand-red flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-redAccent">OUR VISION</span>
          <h3 className="text-2xl font-bold text-white">A Better Way to Connect with Credit.</h3>
          <p className="text-xs sm:text-sm text-brand-grey leading-relaxed">
            To create a simpler and more accessible loan distribution experience where customers can explore suitable banking solutions through one trusted relationship, without having to independently navigate multiple institutions.
          </p>
          <p className="text-xs sm:text-sm text-brand-grey leading-relaxed">
            We aspire to build a business ecosystem where customer convenience and partner growth progress together.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-card border border-brand-cardBorder space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">OUR MISSION</span>
          <h3 className="text-2xl font-bold text-white">We Coordinate. We Support. We Stay Connected.</h3>
          <p className="text-xs sm:text-sm text-brand-grey leading-relaxed">
            Our mission is to simplify the loan application journey by understanding customer requirements, identifying suitable Banks and NBFCs and coordinating the process from application login to disbursement.
          </p>
          <p className="text-xs sm:text-sm text-brand-grey leading-relaxed">
            For our DSA and Channel Partners, our commitment is to provide reliable business support, transparent payout processes and faster payout releases through clear operational commitments.
          </p>
          <p className="text-xs sm:text-sm text-white font-medium">
            We aim to make every loan application easier to manage and every business relationship stronger.
          </p>
        </div>
      </div>

      {/* Commitment & Values */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-brand-cardBorder max-w-5xl mx-auto">
        <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/5">
          Our Commitment & Core Values
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <h4 className="text-sm font-bold text-white mb-2">For Customers:</h4>
            <p className="text-xs text-brand-grey leading-relaxed">
              One dedicated relationship for loan guidance, documentation and bank coordination throughout the application journey.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5">
            <h4 className="text-sm font-bold text-white mb-2">For Channel Partners:</h4>
            <p className="text-xs text-brand-grey leading-relaxed">
              Dependable business support, transparent communication and timely payout commitments.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-lightGrey block mb-3">
            Core Values Guiding Our Operations:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              'Customer Convenience',
              'Partner Commitment',
              'Transparency',
              'Operational Speed',
              'Responsible Business Practices',
              'Long-Term Relationships',
            ].map((val, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                <span className="text-xs font-semibold text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-6">
        <Link
          to="/apply-loan"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-red/25 transition"
        >
          <span>Start Your Guided Loan Application</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
