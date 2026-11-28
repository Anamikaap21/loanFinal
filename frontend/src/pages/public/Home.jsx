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
  Landmark,
  Percent,
  Calendar,
  IndianRupee
} from 'lucide-react';
import loanService from '../../services/loanService.js';
import bankService from '../../services/bankService.js';
import EMICalculator from '../../components/common/EMICalculator.jsx';
import DocumentChecklistModal from '../../components/common/DocumentChecklistModal.jsx';
import HeroVisual from "../../components/common/HeroVisual.jsx";
import { getVerifiedBankLogo } from '../../utils/bankLogos.js';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [bankCategoryFilter, setBankCategoryFilter] = useState('all');
  const [selectedFacilityForChecklist, setSelectedFacilityForChecklist] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

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
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-brand-border bg-gradient-to-b from-brand-redLight/40 via-white to-transparent">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-redLight/50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Tagline, Headings, Supporting Copy & CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-border text-xs text-brand-textSecondary shadow-sm">
                <Building2 className="w-4 h-4 text-brand-red" />
                <span className="font-semibold tracking-wide">
                  REALCRED TECHNOLOGY PRIVATE LIMITED
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-textPrimary tracking-tight leading-[1.12]">
                Your Loan.{" "}
                <span className="text-brand-red block sm:inline">One Guided Route.</span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-brand-textSecondary font-semibold leading-relaxed">
                A Single Point of Contact for Your Loan Requirements.
              </p>

              <p className="text-sm sm:text-base text-brand-textSecondary max-w-xl leading-relaxed">
                Corporate loan distribution and financial services connecting
                individual borrowers and growing enterprises with top Banking &
                NBFC institutions.
              </p>

              {/* CTAs (Left-aligned, exact original routes & links) */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/apply-loan"
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-red/30 transition flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Apply for Loan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/request-callback"
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition shadow-sm flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <PhoneCall className="w-4 h-4 text-brand-red" />
                  <span>Request a Callback</span>
                </Link>

                <Link
                  to="/partner-registration"
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red text-xs font-bold uppercase tracking-wider border border-brand-border transition shadow-sm flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Briefcase className="w-4 h-4 text-brand-red" />
                  <span>Become a Partner</span>
                </Link>
              </div>

              {/* Quick Trust Highlights Strip */}
              <div className="pt-4 border-t border-brand-border/70 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-brand-textSecondary">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-red" />
                  <span className="font-semibold text-brand-textPrimary">37+ Banking Partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-brand-textPrimary">Instant Disbursal Route</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-semibold text-brand-textPrimary">Zero Hidden Fees</span>
                </div>
              </div>
            </div>

            {/* Right Column: Loan Approval & Finance 3D Visual */}
            <div className="lg:col-span-5 w-full flex items-center justify-center pt-6 lg:pt-0">
              <HeroVisual />
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

      {/* 3. Our Products & Partner Banks (Dynamic from MongoDB Atlas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-redLight border border-brand-red/20 text-xs text-brand-red font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-red" />
            <span>Institutional Credit Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary tracking-tight">
            Our <span className="text-brand-red">Products</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-2">
            Active loan facilities and institutional banking partners fetched directly from our live MongoDB database.
          </p>

          {/* Dynamic 3-Tab Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setBankCategoryFilter('all');
              }}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${activeTab === 'all'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red hover:bg-brand-redLight/30 border border-brand-border'
                }`}
            >
              All Active Products & Banks ({activeProducts.length + activeCategories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banks')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${activeTab === 'banks'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red hover:bg-brand-redLight/30 border border-brand-border'
                }`}
            >
              Banking Partners ({activeProducts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${activeTab === 'categories'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red hover:bg-brand-redLight/30 border border-brand-border'
                }`}
            >
              Loan Facilities ({activeCategories.length})
            </button>
          </div>

          {/* Sub-category Filter for Banking Partners (when banks are visible) */}
          {(activeTab === 'banks' || activeTab === 'all') && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-brand-border/60">
              <span className="text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mr-1">
                Bank Category:
              </span>
              <button
                type="button"
                onClick={() => setBankCategoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${bankCategoryFilter === 'all'
                  ? 'bg-brand-textPrimary text-white shadow-sm'
                  : 'bg-white text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border'
                  }`}
              >
                All ({activeProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setBankCategoryFilter('PSU Banks')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${bankCategoryFilter === 'PSU Banks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
                  }`}
              >
                PSU Banks ({activeProducts.filter((b) => b.category === 'PSU Banks').length})
              </button>
              <button
                type="button"
                onClick={() => setBankCategoryFilter('Private Banks')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${bankCategoryFilter === 'Private Banks'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
                  }`}
              >
                Private Banks ({activeProducts.filter((b) => b.category === 'Private Banks').length})
              </button>
              <button
                type="button"
                onClick={() => setBankCategoryFilter('NBFCs')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${bankCategoryFilter === 'NBFCs'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
              >
                NBFCs ({activeProducts.filter((b) => b.category === 'NBFCs').length})
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-brand-textSecondary">
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
            {/* 1. Active Loan Facilities (Categories) */}
            {(activeTab === 'all' || activeTab === 'categories') &&
              activeCategories.map((facility) => {
                const checklistCount = facility.documentChecklist?.length || facility.requiredDocuments?.length || 6;
                return (
                  <div
                    key={`cat-${facility._id}`}
                    className="bg-white p-6 sm:p-7 rounded-2xl border border-brand-border flex flex-col justify-between hover:border-brand-red/50 hover:shadow-lg hover:-translate-y-0.5 transition duration-200 group min-w-0 h-full shadow-sm relative overflow-hidden"
                  >
                    {/* Facility Header Badge */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between mb-3.5 gap-2 min-w-0 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold text-white bg-brand-red px-2.5 py-0.5 rounded shadow-sm shrink-0">
                            {facility.shortName || 'LOAN'}
                          </span>
                          <span className="text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider truncate">
                            Institutional Facility
                          </span>
                        </div>
                        {facility.isActive && (facility.status || '').toLowerCase() !== 'inactive' && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-brand-textPrimary mb-1.5 group-hover:text-brand-red transition break-words">
                        {facility.name}
                      </h3>

                      <p className="text-xs text-brand-textSecondary line-clamp-2 mb-4 leading-relaxed break-words">
                        {facility.tagline || facility.description}
                      </p>

                      {/* 4 Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-brand-bg/70 border border-brand-border text-xs mb-4">
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Base Interest
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {facility.baseInterestRate || `${facility.minInterestRate || 8.5}% - ${facility.maxInterestRate || 15}%`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Max Facility
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {facility.maximumFacility || (facility.maxAmount ? `₹${(facility.maxAmount / 10000000).toFixed(0)} Cr` : '₹50 Lakhs')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Max Tenure
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {facility.maximumTenure || `${Math.round((facility.maxTenureMonths || 360) / 12)} Years`}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Turnaround
                          </span>
                          <span className="font-bold text-brand-red truncate block">
                            {facility.processingTime || '2-7 Days'}
                          </span>
                        </div>
                      </div>

                      {/* Document Checklist Trigger Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFacilityForChecklist(facility);
                          setIsChecklistModalOpen(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-brand-redLight/40 border border-brand-border hover:border-brand-red/40 text-brand-textPrimary hover:text-brand-red text-xs font-semibold flex items-center justify-between gap-2 transition shadow-xs group/btn mb-2"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-brand-red shrink-0" />
                          <span>Required Documents</span>
                        </span>
                        <span className="text-[10px] font-bold text-brand-red bg-brand-redLight px-2 py-0.5 rounded-full border border-brand-red/20 shrink-0">
                          {checklistCount} Items
                        </span>
                      </button>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-4 mt-2 border-t border-brand-border flex items-center justify-between gap-2 min-w-0">
                      <Link
                        to={`/products/${facility.slug}`}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-brand-bg text-brand-textSecondary hover:text-brand-red text-xs font-bold border border-brand-border transition flex items-center gap-1 shrink-0"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/apply-loan?category=${facility._id}`}
                        className="py-2 px-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 shrink-0"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}

            {/* 2. Active Banking Partners */}
            {(activeTab === 'all' || activeTab === 'banks') &&
              (bankCategoryFilter === 'all'
                ? activeProducts
                : activeProducts.filter((b) => b.category === bankCategoryFilter)
              ).map((bank) => {
                const categoryColorClass =
                  bank.category === 'PSU Banks'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : bank.category === 'NBFCs'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div
                    key={`bank-${bank.bankId || bank._id}`}
                    className="bg-white p-6 sm:p-7 rounded-2xl border border-brand-border flex flex-col justify-between hover:border-brand-red/50 hover:shadow-lg hover:-translate-y-0.5 transition duration-200 group min-w-0 h-full shadow-sm"
                  >
                    <div className="min-w-0">
                      {/* Bank Header: Badges & Status */}
                      <div className="flex items-center justify-between mb-3.5 gap-2 min-w-0 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="font-mono text-[10px] text-brand-red bg-brand-redLight border border-brand-red/20 px-2 py-0.5 rounded font-semibold shrink-0">
                            {bank.bankCode}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${categoryColorClass}`}>
                            {bank.category || 'Private Banks'}
                          </span>
                        </div>
                        {((bank.status || '').toLowerCase() === 'active' && !bank.isDeleted) && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      {/* Bank Official Logo & Name */}
                      {(() => {
                        const verifiedLogo = getVerifiedBankLogo(bank);
                        return (
                          <div className="flex items-center gap-3.5 mb-3 min-w-0">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white border border-brand-border p-1.5 flex items-center justify-center shrink-0 shadow-xs group-hover:border-brand-red/40 transition">
                              {verifiedLogo ? (
                                <img
                                  src={verifiedLogo}
                                  alt={`${bank.name || bank.bankName} Official Logo`}
                                  className="w-full h-full object-contain"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextElementSibling) {
                                      e.currentTarget.nextElementSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                style={{ display: verifiedLogo ? 'none' : 'flex' }}
                                className="w-full h-full items-center justify-center text-brand-red"
                              >
                                <Building2 className="w-6 h-6 text-brand-red" />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-base sm:text-lg font-bold text-brand-textPrimary group-hover:text-brand-red transition break-words line-clamp-2 leading-snug">
                                {bank.name || bank.bankName}
                              </h3>
                            </div>
                          </div>
                        );
                      })()}

                      <p className="text-xs text-brand-textSecondary line-clamp-2 mb-4 leading-relaxed break-words">
                        {bank.description || 'Premier institutional lending partner providing competitive retail and commercial financing.'}
                      </p>

                      {/* 4 Key Metrics Grid */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-brand-bg/70 border border-brand-border text-xs mb-4">
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Interest Rate (ROI)
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {bank.roi || (bank.interestRateRange ? `${bank.interestRateRange.min}% – ${bank.interestRateRange.max}%` : '7.25% - 8.00%')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Max LTV
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {bank.maxLTV || '80%'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Max Tenure
                          </span>
                          <span className="font-bold text-brand-textPrimary truncate block">
                            {bank.maxTenure || (bank.maxTenureMonths ? `Up to ${Math.round(bank.maxTenureMonths / 12)} Years` : '30 Years')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary uppercase font-medium block">
                            Processing Time
                          </span>
                          <span className="font-bold text-brand-red truncate block">
                            {bank.processingTime || '10-15 days'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="pt-4 mt-2 border-t border-brand-border flex items-center justify-between gap-3 min-w-0">
                      <span className="text-[11px] text-brand-textSecondary font-mono shrink-0">
                        Institutional Partner
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
                );
              })}
          </div>
        )}

        {/* Reusable Document Checklist Modal */}
        <DocumentChecklistModal
          isOpen={isChecklistModalOpen}
          onClose={() => {
            setIsChecklistModalOpen(false);
            setSelectedFacilityForChecklist(null);
          }}
          product={selectedFacilityForChecklist}
        />
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
