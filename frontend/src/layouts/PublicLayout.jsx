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

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about' },
    { label: 'Our Products', path: '/products' },
    { label: 'Our Team', path: '/team' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/privacy-policy' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col font-sans selection:bg-brand-red selection:text-white">
      {/* Top Banner */}
      <div className="bg-brand-dark border-b border-white/5 py-2 px-4 text-xs text-brand-grey hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <Phone className="w-3.5 h-3.5 text-brand-red" />
              <span>7048976349 / 8527710939</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition">
              <Mail className="w-3.5 h-3.5 text-brand-red" />
              <span>info@realcred.in</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Corporate Loan Distribution & Banking Solutions</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-red flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-lg shadow-brand-red/25 group-hover:scale-105 transition-transform">
              RC
            </div>
            <div>
              <div className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                REAL<span className="text-brand-red">CRED</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-brand-grey font-medium tracking-wider uppercase">
                Your Loan. One Guided Route.
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-brand-redAccent font-bold'
                    : 'text-brand-lightGrey hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs: CRM Login & Apply */}
          <div className="hidden sm:flex items-center gap-3">
            {/* MANDATORY: CRM Login must be clearly visible in the navbar */}
            <Link
              to="/crm-login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-card hover:bg-brand-card/80 text-white border border-brand-border hover:border-brand-red/50 transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-red" />
              <span>CRM Login</span>
            </Link>

            <Link
              to="/apply-loan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-red hover:bg-brand-redAccent text-white shadow-lg shadow-brand-red/25 transition"
            >
              <span>Apply for Loan</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              to="/crm-login"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-red text-white sm:hidden"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>CRM</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-brand-card text-brand-grey hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-dark/95 border-b border-brand-border/40 px-4 pt-3 pb-6 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.path) ? 'text-brand-red font-bold' : 'text-brand-lightGrey hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <Link
                to="/partner-registration"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-emerald-400 hover:text-emerald-300"
              >
                Become a Channel Partner
              </Link>
              <Link
                to="/request-callback"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-brand-lightGrey hover:text-white"
              >
                Request a Callback
              </Link>
            </div>
            <div className="pt-3 border-t border-white/5 space-y-2">
              <Link
                to="/crm-login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase bg-brand-card text-white border border-brand-border"
              >
                <LogIn className="w-4 h-4 text-brand-red" />
                <span>CRM Login (Admin / Employee / Partner)</span>
              </Link>
              <Link
                to="/apply-loan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase bg-brand-red text-white"
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

      {/* Footer */}
      <footer className="border-t border-brand-border/40 bg-brand-dark/90 text-brand-grey text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Identity */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center font-bold text-sm text-white">
                  RC
                </div>
                <span className="text-base font-extrabold text-white">
                  REAL<span className="text-brand-red">CRED</span>
                </span>
              </div>
              <p className="text-xs text-brand-grey mb-3">
                RealCred Technology Private Limited is a corporate loan distribution company connecting customers with suitable banking & NBFC solutions.
              </p>
              <p className="text-[11px] font-semibold text-brand-lightGrey">
                Tagline: Your Loan. One Guided Route.
              </p>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Navigation</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="hover:text-white transition">About RealCred</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Loan Products</Link></li>
                <li><Link to="/team" className="hover:text-white transition">Our Leadership Team</Link></li>
                <li><Link to="/partner-registration" className="hover:text-white transition">Become a Channel Partner</Link></li>
                <li><Link to="/crm-login" className="hover:text-white transition font-semibold text-brand-redAccent">CRM Access Portal</Link></li>
              </ul>
            </div>

            {/* Col 3: Loan Products */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Loan Solutions</h4>
              <ul className="space-y-2">
                <li><Link to="/products" className="hover:text-white transition">Home Loan</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Loan Against Property</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Business Loan</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Personal Loan</Link></li>
                <li><Link to="/products" className="hover:text-white transition">OD – Overdraft Facility</Link></li>
              </ul>
            </div>

            {/* Col 4: Corporate Office */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Corporate Office</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span>D-9, Ground Floor, Workshala, Vyapar Marg, Block D, Noida Sector 3, Noida, UP 201301</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-red shrink-0" />
                  <span>7048976349, 8527710939</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-red shrink-0" />
                  <span>info@realcred.in</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
            <p>&copy; {new Date().getFullYear()} RealCred Technology Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              <span>•</span>
              <a href="https://realcred.in" target="_blank" rel="noreferrer" className="hover:text-white transition">realcred.in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
