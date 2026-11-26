import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Briefcase,
  Layers,
  TrendingUp,
  Clock,
  FileText,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  Award,
  Sparkles,
  Landmark
} from 'lucide-react';
import loanService from '../../services/loanService.js';
import bankService from '../../services/bankService.js';
import EMICalculator from '../../components/common/EMICalculator.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          loanService.getCategories(),
          loanService.getHomepageProducts(),
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error('Failed to load categories or live products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Strictly filter only ACTIVE and NON-DELETED records
  const activeProducts = (products || []).filter(
    (p) => (p.status || '').toLowerCase() === 'active' && !p.isDeleted
  );
  const activeCategories = (categories || []).filter(
    (c) => c.isActive !== false && (c.status || '').toLowerCase() !== 'inactive' && !c.slug?.startsWith('test-')
  );

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 border-b border-brand-border bg-gradient-to-b from-brand-redLight/40 via-white to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-border text-xs text-brand-textSecondary mb-8 shadow-sm">
              <Building2 className="w-4 h-4 text-brand-red" />
              <span className="font-semibold tracking-wide">REALCRED TECHNOLOGY PRIVATE LIMITED</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-brand-textPrimary tracking-tight leading-tight mb-6">
              Your Loan. <span className="text-brand-red">One Guided Route.</span>
            </h1>

            <p className="text-lg sm:text-2xl text-brand-textSecondary font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
              A Single Point of Contact for Your Loan Requirements.
            </p>

            <p className="text-sm sm:text-base text-brand-textSecondary max-w-2xl mx-auto mb-12">
              Corporate loan distribution and financial services connecting individual borrowers and growing enterprises with top Banking & NBFC institutions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/apply-loan"
                className="px-7 py-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-red/30 transition flex items-center gap-2"
              >
                <span>Apply for Loan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/request-callback"
                className="px-7 py-4 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition shadow-sm flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-brand-red" />
                <span>Request a Callback</span>
              </Link>

              <Link
                to="/partner-registration"
                className="px-7 py-4 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition shadow-sm flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-brand-red" />
                <span>Become a Partner</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About RealCred Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-red mb-3">
              <Sparkles className="w-4 h-4" />
              <span>About RealCred</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary tracking-tight leading-snug mb-6">
              A Single Point of Contact for Your Loan Requirements.
            </h2>
            <div className="space-y-4 text-sm text-brand-textSecondary leading-relaxed">
              <p>
                RealCred Technology Private Limited is a corporate loan distribution and financial services company connecting customers with suitable banking and NBFC solutions.
              </p>
              <p>
                We understand that approaching multiple banks, managing documentation and coordinating loan applications can be complicated. RealCred simplifies this experience by providing customers with one dedicated point of contact.
              </p>
              <p>
                From understanding financial requirements and identifying suitable lending institutions to application processing, documentation and bank coordination, our team assists customers throughout their loan journey, up to disbursement.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase text-brand-textPrimary hover:text-brand-red transition"
              >
                <span>Read Full Corporate Overview</span>
                <ChevronRight className="w-4 h-4 text-brand-red" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-md space-y-6">
            <h3 className="text-base font-bold text-brand-textPrimary uppercase tracking-wider border-b border-brand-border pb-3">
              Why RealCred Stands Out
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-brand-redLight text-brand-red shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-textPrimary">Dedicated Relationship Management</h4>
                  <p className="text-xs text-brand-textSecondary mt-0.5">One expert point of contact managing all lending institution follow-ups.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-brand-redLight text-brand-red shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-textPrimary">Multi-Bank Solution Matching</h4>
                  <p className="text-xs text-brand-textSecondary mt-0.5">We identify the optimal interest rates, eligibility criteria, and sanction limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-brand-redLight text-brand-red shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-textPrimary">Faster Payout Commitments for Partners</h4>
                  <p className="text-xs text-brand-textSecondary mt-0.5">Dependable business support, transparent processes and timely payouts for DSAs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Products & Partner Banks (Dynamic from MongoDB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red">Credit Solutions & Lending Partners</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary mt-1">Our Products</h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-2">
            Active loan facilities and institutional banking partners fetched directly from our live MongoDB database.
          </p>

          {/* Toggle Tab Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
              }`}
            >
              All Active Products & Banks ({activeProducts.length + activeCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('banks')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'banks'
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
              }`}
            >
              Banking Partners ({activeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'categories'
                  ? 'bg-brand-red text-white shadow-sm'
                  : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
              }`}
            >
              Loan Facilities ({activeCategories.length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-brand-textSecondary">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Loading active products and banks from RealCred database...</p>
          </div>
        ) : (activeTab === 'all' && activeProducts.length === 0 && activeCategories.length === 0) ||
          (activeTab === 'banks' && activeProducts.length === 0) ||
          (activeTab === 'categories' && activeCategories.length === 0) ? (
          <div className="py-16 px-6 text-center bg-white rounded-2xl border border-brand-border max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-redLight border border-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary mb-2">No Loan Products Currently Available</h3>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              No loan products are currently available. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0 items-stretch">
            {/* 1. Active Bank Products (Derived from Admin Bank Management MongoDB collection) */}
            {(activeTab === 'all' || activeTab === 'banks') &&
              activeProducts.map((bank) => (
                <div
                  key={`bank-${bank.bankId || bank._id}`}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-brand-border flex flex-col justify-between hover:border-brand-red/50 hover:shadow-md transition group min-w-0 h-full shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        {bank.logoUrl ? (
                          <img
                            src={bank.logoUrl}
                            alt={bank.name || bank.bankName}
                            className="h-6 max-w-[80px] object-contain rounded shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Landmark className="w-4 h-4 text-brand-red shrink-0" />
                        )}
                        <span className="font-mono text-[10px] text-brand-red bg-brand-redLight border border-brand-red/20 px-2 py-0.5 rounded shrink-0 font-semibold">
                          {bank.bankCode}
                        </span>
                      </div>
                      {/* Active Product Badge ONLY for active banks */}
                      {((bank.status || '').toLowerCase() === 'active' && !bank.isDeleted) && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Active Product</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-brand-textPrimary mb-2 group-hover:text-brand-red transition break-words [overflow-wrap:anywhere] [word-break:break-word]">
                      {bank.name || bank.bankName}
                    </h3>

                    <p className="text-xs text-brand-textSecondary line-clamp-3 mb-4 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                      {bank.description || 'Premier institutional lending partner providing competitive retail and commercial financing.'}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-brand-border text-[11px] min-w-0">
                      <div className="flex justify-between text-brand-textSecondary gap-2">
                        <span className="shrink-0">Interest Rate:</span>
                        <span className="text-brand-textPrimary font-semibold text-right">
                          {bank.interestRateRange?.min ?? 8.5}% – {bank.interestRateRange?.max ?? 14.5}% p.a.
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-textSecondary gap-2">
                        <span className="shrink-0">Max Tenure:</span>
                        <span className="text-brand-textPrimary font-semibold text-right">
                          Up to {bank.maxTenureYears || Math.round((bank.maxTenureMonths || 360) / 12)} Years
                        </span>
                      </div>
                      <div className="flex justify-between text-brand-textSecondary gap-2">
                        <span className="shrink-0">Processing Fee:</span>
                        <span className="text-emerald-600 font-medium truncate max-w-[150px] text-right">
                          {bank.processingFeeDetails || 'Up to 1% + GST'}
                        </span>
                      </div>
                    </div>

                    {bank.features && bank.features.length > 0 && (
                      <div className="space-y-1.5 pt-3 mt-3 border-t border-brand-border min-w-0">
                        {bank.features.slice(0, 2).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-brand-textSecondary min-w-0">
                            <CheckCircle2 className="w-3 h-3 text-brand-red shrink-0" />
                            <span className="truncate min-w-0 flex-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-brand-border flex items-center justify-between gap-3 min-w-0">
                    <span className="text-[11px] text-brand-textSecondary font-mono shrink-0">
                      Partner Bank
                    </span>

                    <Link
                      to={`/apply-loan?bank=${bank.bankId || bank._id}`}
                      className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}

            {/* 2. Active Loan Categories (Only displayed if isActive === true) */}
            {(activeTab === 'all' || activeTab === 'categories') &&
              activeCategories.map((product) => (
                <div
                  key={`cat-${product._id}`}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-brand-border flex flex-col justify-between hover:border-brand-red/50 hover:shadow-md transition group min-w-0 h-full shadow-sm"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-brand-redLight text-brand-red border border-brand-red/20 truncate">
                        ₹{(product.minAmount / 100000).toFixed(0)}L - ₹{(product.maxAmount / 10000000).toFixed(0)}Cr
                      </span>
                      {product.isActive && (product.status || '').toLowerCase() !== 'inactive' && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Active Product</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-brand-textPrimary mb-2 group-hover:text-brand-red transition break-words [overflow-wrap:anywhere] [word-break:break-word]">
                      {product.name}
                    </h3>

                    <p className="text-xs text-brand-textSecondary line-clamp-3 mb-6 leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word]">
                      {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                      <div className="space-y-2 mb-6 pt-4 border-t border-brand-border min-w-0">
                        <span className="text-[11px] font-bold uppercase text-brand-textPrimary tracking-wider block mb-2">
                          Key Features:
                        </span>
                        {product.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-brand-textSecondary min-w-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-red shrink-0" />
                            <span className="truncate min-w-0 flex-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-brand-border flex items-center justify-between gap-3 min-w-0">
                    <Link
                      to={`/products/${product.slug}`}
                      className="text-xs font-bold text-brand-textSecondary hover:text-brand-red transition flex items-center gap-1 shrink-0"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/apply-loan?category=${product._id}`}
                      className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 shrink-0"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* 4. Interactive Loan EMI Calculator */}
      <EMICalculator />

      {/* 5. How We Work (The Guided Route) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-red">Our Methodology</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary mt-1">How We Work</h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-2">
            A structured, 4-step guided route from requirement discovery to disbursement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm relative">
            <div className="text-3xl font-black text-brand-red/30 mb-3">01</div>
            <h4 className="text-base font-bold text-brand-textPrimary mb-2">Requirement Analysis</h4>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              We assess your financial background, funding requirement, and preferred timeline to determine lending feasibility.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm relative">
            <div className="text-3xl font-black text-brand-red/30 mb-3">02</div>
            <h4 className="text-base font-bold text-brand-textPrimary mb-2">Lender Matching</h4>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              We identify the most suitable Banks and NBFCs offering competitive interest rates and tailored terms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm relative">
            <div className="text-3xl font-black text-brand-red/30 mb-3">03</div>
            <h4 className="text-base font-bold text-brand-textPrimary mb-2">Document Coordination</h4>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              Our team assists in file preparation, digital verification, RCU checks, and bank login coordination.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm relative">
            <div className="text-3xl font-black text-brand-red/30 mb-3">04</div>
            <h4 className="text-base font-bold text-brand-textPrimary mb-2">Sanction & Disbursement</h4>
            <p className="text-xs text-brand-textSecondary leading-relaxed">
              We follow up with bank operations until sanction issuance, documentation signing, and funds release.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Vision, Mission & Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="p-8 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red">OUR VISION</span>
            <h3 className="text-2xl font-bold text-brand-textPrimary">A Better Way to Connect with Credit.</h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
              To create a simpler and more accessible loan distribution experience where customers can explore suitable banking solutions through one trusted relationship, without having to independently navigate multiple institutions.
            </p>
            <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
              We aspire to build a business ecosystem where customer convenience and partner growth progress together.
            </p>
          </div>

          {/* Mission */}
          <div className="p-8 rounded-3xl bg-white border border-brand-border shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red">OUR MISSION</span>
            <h3 className="text-2xl font-bold text-brand-textPrimary">We Coordinate. We Support. We Stay Connected.</h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
              Our mission is to simplify the loan application journey by understanding customer requirements, identifying suitable Banks and NBFCs and coordinating the process from application login to disbursement.
            </p>
            <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
              For our DSA and Channel Partners, our commitment is to provide reliable business support, transparent payout processes and faster payout releases through clear operational commitments.
            </p>
          </div>
        </div>

        {/* Commitment & Values */}
        <div className="mt-8 p-8 rounded-3xl bg-white border border-brand-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-red">OUR COMMITMENT</span>
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                  <h4 className="text-sm font-bold text-brand-textPrimary mb-1">For Customers:</h4>
                  <p className="text-xs text-brand-textSecondary">
                    One dedicated relationship for loan guidance, documentation and bank coordination throughout the application journey.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                  <h4 className="text-sm font-bold text-brand-textPrimary mb-1">For Channel Partners:</h4>
                  <p className="text-xs text-brand-textSecondary">
                    Dependable business support, transparent communication and timely payout commitments.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary">OUR CORE VALUES</span>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  'Customer Convenience',
                  'Partner Commitment',
                  'Transparency',
                  'Operational Speed',
                  'Responsible Business Practices',
                  'Long-Term Relationships',
                ].map((val, i) => (
                  <div key={i} className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0"></div>
                    <span className="text-xs font-semibold text-brand-textPrimary">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-brand-border shadow-md flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-red">Headquarters</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-brand-textPrimary">RealCred Corporate Office</h3>
            <p className="text-xs text-brand-textSecondary flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
              <span>D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, Uttar Pradesh 201301, India.</span>
            </p>
            <div className="flex flex-wrap items-center gap-6 text-xs text-brand-textSecondary">
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-red" />
                <span>7048976349 / 8527710939</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-red" />
                <span>info@realcred.in</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://maps.google.com/?q=28.583136,77.318749"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition shadow-sm flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-brand-red" />
              <span>Get Directions</span>
            </a>

            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-brand-red/25 flex items-center gap-2"
            >
              <span>Contact Advisory Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
