import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Landmark, 
  FileText, 
  Search,
  SlidersHorizontal,
  Home as HomeIcon,
  Briefcase,
  UserCheck,
  CreditCard
} from 'lucide-react';
import loanService from '../../services/loanService.js';
import bankService from '../../services/bankService.js';
import DocumentChecklistModal from '../../components/common/DocumentChecklistModal.jsx';
import { getVerifiedBankLogo } from '../../utils/bankLogos.js';

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [bankCategoryFilter, setBankCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityForChecklist, setSelectedFacilityForChecklist] = useState(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, bankRes] = await Promise.all([
          loanService.getCategories(),
          loanService.getHomepageProducts(),
        ]);
        const activeCats = (catRes.data || []).filter(
          (c) => c.isActive !== false && (c.status || '').toLowerCase() !== 'inactive' && !c.slug?.startsWith('test-')
        );
        const activeB = (bankRes.data || []).filter(
          (b) => (b.status || '').toLowerCase() === 'active' && !b.isDeleted
        );
        setCategories(activeCats);
        setBanks(activeB);
      } catch (err) {
        console.error('Error fetching loan products & banks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const psuCount = banks.filter((b) => b.category === 'PSU Banks').length;
  const pvtCount = banks.filter((b) => b.category === 'Private Banks').length;
  const nbfcCount = banks.filter((b) => b.category === 'NBFCs').length;

  // Search filtering
  const q = searchQuery.trim().toLowerCase();
  const filteredCategories = categories.filter((cat) => {
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.shortName?.toLowerCase().includes(q) ||
      cat.tagline?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  const filteredBanks = banks.filter((b) => {
    const matchesCategory = bankCategoryFilter === 'all' || b.category === bankCategoryFilter;
    if (!matchesCategory) return false;
    if (!q) return true;
    return (
      b.name?.toLowerCase().includes(q) ||
      b.bankName?.toLowerCase().includes(q) ||
      b.bankCode?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q)
    );
  });

  const totalActiveCount = banks.length + categories.length;

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12 min-w-0 max-w-full">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-brand-border text-xs text-brand-textSecondary mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-red" />
          <span>Institutional Lending Catalog</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-brand-textPrimary tracking-tight leading-tight">
          Our Loan <span className="text-brand-red">Products & Banks</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-brand-textSecondary max-w-2xl mx-auto leading-relaxed">
          Access competitive institutional capital through our verified network of 37 banking institutions and 4 customized retail and commercial loan facilities.
        </p>

        {/* Dynamic 3-Tab Filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setBankCategoryFilter('all');
            }}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              activeTab === 'all'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
            }`}
          >
            All Active Products & Banks ({totalActiveCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('banks')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              activeTab === 'banks'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
            }`}
          >
            Banking Partners ({banks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              activeTab === 'categories'
                ? 'bg-brand-red text-white shadow-brand-red/20'
                : 'bg-white text-brand-textSecondary hover:text-brand-red border border-brand-border'
            }`}
          >
            Loan Facilities ({categories.length})
          </button>
        </div>

        {/* Sub-category Filter for Banking Partners */}
        {(activeTab === 'banks' || activeTab === 'all') && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 pt-3 border-t border-brand-border/60">
            <span className="text-[11px] font-semibold text-brand-textSecondary uppercase tracking-wider mr-1">
              Bank Category:
            </span>
            <button
              type="button"
              onClick={() => setBankCategoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                bankCategoryFilter === 'all'
                  ? 'bg-brand-textPrimary text-white shadow-sm'
                  : 'bg-white text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border'
              }`}
            >
              All ({banks.length})
            </button>
            <button
              type="button"
              onClick={() => setBankCategoryFilter('PSU Banks')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                bankCategoryFilter === 'PSU Banks'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              PSU Banks ({psuCount})
            </button>
            <button
              type="button"
              onClick={() => setBankCategoryFilter('Private Banks')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                bankCategoryFilter === 'Private Banks'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              Private Banks ({pvtCount})
            </button>
            <button
              type="button"
              onClick={() => setBankCategoryFilter('NBFCs')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                bankCategoryFilter === 'NBFCs'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              NBFCs ({nbfcCount})
            </button>
          </div>
        )}

        {/* Quick Search Bar */}
        <div className="max-w-md mx-auto mt-6 relative">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search bank name, code, or loan facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-brand-border text-xs text-brand-textPrimary placeholder:text-brand-textSecondary focus:outline-none focus:border-brand-red transition shadow-xs"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center text-brand-textSecondary">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Fetching active loan products and partner institutions from RealCred database...</p>
        </div>
      ) : (activeTab === 'all' && filteredCategories.length === 0 && filteredBanks.length === 0) ||
        (activeTab === 'banks' && filteredBanks.length === 0) ||
        (activeTab === 'categories' && filteredCategories.length === 0) ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-brand-border max-w-md mx-auto p-8 shadow-sm">
          <CreditCard className="w-10 h-10 text-brand-red mx-auto mb-3" />
          <h3 className="text-lg font-bold text-brand-textPrimary mb-1">No Matching Products Found</h3>
          <p className="text-xs text-brand-textSecondary">
            {searchQuery ? `No results matching "${searchQuery}". Please clear your search.` : 'Please check back soon or contact our customer desk.'}
          </p>
        </div>
      ) : (
        /* Unified Responsive Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0 items-stretch">
          {/* 1. Loan Facilities Cards */}
          {(activeTab === 'all' || activeTab === 'categories') &&
            filteredCategories.map((facility) => {
              const checklistCount = facility.documentChecklist?.length || facility.requiredDocuments?.length || 6;
              return (
                <div
                  key={`cat-${facility._id}`}
                  className="bg-white p-6 sm:p-7 rounded-2xl border border-brand-border flex flex-col justify-between hover:border-brand-red/50 hover:shadow-lg hover:-translate-y-0.5 transition duration-200 group min-w-0 h-full shadow-sm relative overflow-hidden"
                >
                  <div className="min-w-0">
                    {/* Header Badges */}
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

          {/* 2. Banking Partners Cards */}
          {(activeTab === 'all' || activeTab === 'banks') &&
            filteredBanks.map((bank) => {
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
                    {/* Header Badges */}
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
    </div>
  );
}
