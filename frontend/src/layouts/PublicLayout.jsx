import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Menu,
  X,
  LogIn,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import Logo from '../components/common/Logo.jsx';

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Products', path: '/products' },
    { label: 'Our Team', path: '/team' },
    { label: 'EMI Calculator', path: '/#emi-calculator' },
    { label: 'Check Eligibility', path: '/eligibility' },
    { label: 'Partner With Us', path: '/partner-registration' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path.startsWith('/#')) {
      return location.pathname === '/' && location.hash === path.substring(1);
    }
    return location.pathname === path;
  };

  // Automatically close mobile menu on route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.substring(1);
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-textPrimary flex flex-col font-sans selection:bg-brand-red selection:text-white">
      {/* Top Banner */}
      <div className="bg-brand-redLight border-b border-brand-border py-2 px-4 text-xs text-brand-textSecondary hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-brand-red transition">
              <Phone className="w-3.5 h-3.5 text-brand-red" />
              <span className="font-medium text-brand-textPrimary">7048976349 / 8527710939</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-brand-red transition">
              <Mail className="w-3.5 h-3.5 text-brand-red" />
              <span className="font-medium text-brand-textPrimary">info@realcred.in</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium">Corporate Loan Distribution & Banking Solutions</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo - Official Reusable Component */}
          <Logo variant="light" size="md" />

          {/* Desktop Navigation Links (Visible on screens >= 1280px to prevent multi-line wrapping & overlaps) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[13px] 2xl:text-sm font-semibold tracking-normal whitespace-nowrap transition-colors py-1 ${isActive(link.path)
                  ? 'text-brand-red font-bold border-b-2 border-brand-red pb-1'
                  : 'text-brand-textSecondary hover:text-brand-red'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action CTAs: CRM Login & Apply for Loan */}
          <div className="hidden xl:flex items-center gap-2.5 2xl:gap-3 shrink-0">
            <Link
              to="/crm-login"
              className="inline-flex items-center gap-1.5 px-3.5 2xl:px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red border border-brand-border hover:border-brand-red/40 transition shadow-sm shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span>CRM Login</span>
            </Link>

            <Link
              to="/apply-loan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-red hover:bg-brand-deepRed text-white shadow-md shadow-brand-red/25 transition shrink-0 whitespace-nowrap"
            >
              <span>Apply for Loan</span>
            </Link>
          </div>

          {/* Tablet & Mobile navigation trigger (< 1280px) */}
          <div className="xl:hidden flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/crm-login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold uppercase bg-white hover:bg-brand-redLight text-brand-textPrimary hover:text-brand-red border border-brand-border shadow-sm transition shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span className="hidden sm:inline">CRM Login</span>
              <span className="sm:hidden">CRM</span>
            </Link>

            <Link
              to="/apply-loan"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-red hover:bg-brand-deepRed text-white shadow-sm transition shrink-0 whitespace-nowrap"
            >
              <span>Apply</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 sm:p-2.5 rounded-xl bg-white text-brand-textSecondary hover:text-brand-red hover:bg-brand-redLight border border-brand-border focus:outline-none transition shadow-sm shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-brand-border px-4 sm:px-6 pt-3 pb-6 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-3 rounded-xl text-sm font-semibold transition ${isActive(link.path)
                  ? 'bg-brand-redLight text-brand-red font-bold'
                  : 'text-brand-textSecondary hover:bg-slate-50 hover:text-brand-red'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-brand-border space-y-2">
              <Link
                to="/partner-registration"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-semibold text-brand-red hover:bg-brand-redLight transition"
              >
                Become a Channel Partner
              </Link>
              <Link
                to="/request-callback"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 px-3 rounded-xl text-sm font-medium text-brand-textSecondary hover:bg-slate-50 hover:text-brand-textPrimary transition"
              >
                Request a Callback
              </Link>
            </div>
            <div className="pt-3 border-t border-brand-border space-y-2">
              <Link
                to="/crm-login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase bg-white hover:bg-brand-redLight text-brand-textPrimary border border-brand-border shadow-sm transition"
              >
                <LogIn className="w-4 h-4 text-brand-red" />
                <span>CRM Login (Admin / Employee / Partner)</span>
              </Link>
              <Link
                to="/apply-loan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase bg-brand-red hover:bg-brand-deepRed text-white shadow-sm transition"
              >
                <span>Apply for Loan</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page Body */}
      <main className="flex-1 min-w-0 max-w-full">
        <Outlet />
      </main>

      {/* Footer - Dark Navy #0F172A Theme */}
      <footer className="border-t border-slate-800 bg-[#0F172A] text-slate-300 text-xs selection:bg-brand-red selection:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 mb-12">
            {/* Col 1: Identity & Lending Network */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <Logo variant="dark" size="md" />
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                RealCred Technology Private Limited is a corporate loan distribution company connecting customers with suitable banking & NBFC solutions.
              </p>
              <p className="text-[11px] font-semibold text-slate-200 mb-4">
                Tagline: Your Loan. One Guided Route.
              </p>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-200 font-medium">Lending Network:</span> Partnered with 30+ leading Banks & premier NBFCs across India.
              </div>
            </div>

            {/* Col 2: Quick Links / Portals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Navigation</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/about" className="text-slate-300 hover:text-brand-red transition-colors">About RealCred</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Loan Products</Link></li>
                <li><Link to="/team" className="text-slate-300 hover:text-brand-red transition-colors">Our Leadership Team</Link></li>
                <li><Link to="/#emi-calculator" className="text-slate-300 hover:text-brand-red transition-colors">EMI Calculator</Link></li>
                <li><Link to="/eligibility" className="text-slate-300 hover:text-brand-red transition-colors font-medium text-brand-red">Check Loan Eligibility</Link></li>
                <li><Link to="/privacy-policy" className="text-slate-300 hover:text-brand-red transition-colors font-medium">Privacy Policy</Link></li>
                <li><Link to="/partner-registration" className="text-slate-300 hover:text-brand-red transition-colors">Become a Channel Partner</Link></li>
                <li><Link to="/crm-login" className="text-slate-300 hover:text-brand-red transition-colors font-semibold">CRM Access Portal</Link></li>
              </ul>
            </div>

            {/* Col 3: Loan Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Loan Solutions</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Home Loan</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Loan Against Property</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Business Loan</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Personal Loan</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">OD – Overdraft Facility</Link></li>
                <li><Link to="/products" className="text-slate-300 hover:text-brand-red transition-colors">Education Loan</Link></li>
              </ul>
            </div>

            {/* Col 4: Corporate Office */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Corporate Office</h4>
              <div className="space-y-3 text-xs mb-5">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, UP 201301</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-red shrink-0" />
                  <span className="text-slate-300">7048976349, 8527710939</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-red shrink-0" />
                  <span className="text-slate-300">info@realcred.in</span>
                </div>
              </div>

              {/* Action CTA inside Footer */}
              <Link
                to="/apply-loan"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-brand-red/25 transition-all text-center"
              >
                <span>Apply for Loan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} RealCred Technology Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="text-slate-300 hover:text-brand-red transition-colors font-medium">Privacy Policy</Link>
              <span>•</span>
              <Link to="/contact" className="text-slate-300 hover:text-brand-red transition-colors">Contact Us</Link>
              <span>•</span>
              <a href="https://realcred.in" target="_blank" rel="noreferrer" className="text-white hover:text-brand-red font-medium transition-colors">realcred.in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
