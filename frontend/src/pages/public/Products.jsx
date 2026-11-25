import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Briefcase, 
  UserCheck, 
  Landmark, 
  CreditCard, 
  ChevronRight, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import loanService from '../../services/loanService.js';

// Helper to determine the relevant icon for each loan category
const getCategoryIcon = (slug = '', name = '') => {
  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('home') || n.includes('home')) return Home;
  if (s.includes('property') || n.includes('property') || s.includes('lap')) return Building2;
  if (s.includes('business') || n.includes('business')) return Briefcase;
  if (s.includes('personal') || n.includes('personal')) return UserCheck;
  if (s.includes('od') || s.includes('overdraft') || n.includes('overdraft') || n.includes('credit')) return Landmark;
  return CreditCard;
};

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await loanService.getCategories();
        const activeOnly = (res.data || []).filter(
          (c) => c.isActive !== false && (c.status || '').toLowerCase() !== 'inactive' && !c.slug?.startsWith('test-')
        );
        setCategories(activeOnly);
      } catch (err) {
        console.error('Error fetching loan categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12 min-w-0 max-w-full">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-card border border-brand-border/60 text-xs text-brand-grey mb-4">
          <Sparkles className="w-4 h-4 text-brand-red" />
          <span>Tailored Credit Portfolios</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Our Loan <span className="gradient-text-red">Products</span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-brand-grey max-w-2xl mx-auto">
          Explore our complete range of institutional credit solutions tailored for individual borrowers and expanding enterprises.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center text-brand-grey">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Fetching active loan products from RealCred database...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 text-center glass-card rounded-3xl border border-brand-cardBorder max-w-md mx-auto p-8">
          <CreditCard className="w-10 h-10 text-brand-red mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Loan Products Available</h3>
          <p className="text-xs text-brand-grey">Please check back soon or contact our customer desk.</p>
        </div>
      ) : (
        /* Compact Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0 items-stretch">
          {categories.map((product) => {
            const IconComponent = getCategoryIcon(product.slug, product.name);
            const shortDescription = product.tagline || product.description || 'Reliable institutional credit facility with transparent documentation.';

            return (
              <div
                key={product._id}
                className="bg-[#19191B] rounded-2xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between hover:border-brand-red/40 hover:-translate-y-1 transition duration-300 shadow-xl group min-w-0 h-full"
              >
                {/* Top Section: Icon, Name & One-line Description */}
                <div className="min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-brand-red group-hover:text-white transition duration-300 shrink-0">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-red transition break-words [overflow-wrap:anywhere] [word-break:break-word]">
                    {product.name}
                  </h3>

                  <p className="text-xs text-brand-grey leading-relaxed mt-2 line-clamp-3 break-words [overflow-wrap:anywhere] [word-break:break-word]">
                    {shortDescription}
                  </p>
                </div>

                {/* Bottom Section: Two Action Buttons ONLY */}
                <div className="pt-5 mt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                  <Link
                    to={`/products/${product.slug}`}
                    className="py-2.5 px-3 rounded-xl bg-brand-card hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-brand-border transition text-center flex items-center justify-center gap-1.5 min-w-0"
                  >
                    <span className="truncate">View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>

                  <Link
                    to={`/apply-loan?category=${product._id}`}
                    className="py-2.5 px-3 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-brand-red/20 text-center flex items-center justify-center gap-1.5 min-w-0"
                  >
                    <span className="truncate">Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
