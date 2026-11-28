import React from 'react';
import { 
  CheckCircle2, 
  Landmark, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Percent,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg lg:max-w-none mx-auto select-none">
      {/* 1. Ambient Background Glows & Geometric Tech Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] bg-gradient-to-tr from-brand-red/10 via-brand-redLight to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative dashed background orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] border border-brand-border/80 rounded-full pointer-events-none animate-spin-slow opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] h-[240px] sm:h-[320px] border border-dashed border-brand-red/20 rounded-full pointer-events-none opacity-70" />

      {/* 2. Main Centerpiece Card: 3D-Style Financial Approval Illustration & Portal */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl border border-brand-border rounded-3xl p-5 sm:p-7 shadow-2xl shadow-brand-red/5 overflow-hidden transition-all duration-300 hover:shadow-brand-red/15">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/70 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-red/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-brand-textSecondary ml-2 tracking-wide font-medium">
              realcred.in/approval-desk
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>INSTITUTION VERIFIED</span>
          </div>
        </div>

        {/* Modern 3D-Style Illustration: Person Receiving Loan Approval & Digital Credit Portal */}
        <div className="relative py-2 px-1 flex items-center justify-center">
          <svg
            viewBox="0 0 460 260"
            className="w-full h-auto max-h-[260px] drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="portalGrad" x1="0" y1="0" x2="460" y2="260" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8F8FA" />
                <stop offset="1" stopColor="#FFF1F3" />
              </linearGradient>
              <linearGradient id="brandRedGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#D71938" />
                <stop offset="1" stopColor="#B5122D" />
              </linearGradient>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="goldCoinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#FBBF24" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="suitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#1E293B" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#FCD34D" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Isometric Podium Base */}
            <ellipse cx="230" cy="232" rx="190" ry="24" fill="#E2E8F0" opacity="0.6" />
            <ellipse cx="230" cy="226" rx="170" ry="18" fill="url(#portalGrad)" />

            {/* Digital Banking Backdrop Display Screen */}
            <rect x="70" y="24" width="320" height="190" rx="20" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            
            {/* Screen Header Bar */}
            <rect x="70" y="24" width="320" height="32" rx="20" fill="#F8FAFC" />
            <circle cx="95" cy="40" r="4" fill="#D71938" />
            <circle cx="107" cy="40" r="4" fill="#F59E0B" />
            <circle cx="119" cy="40" r="4" fill="#10B981" />
            <rect x="145" y="34" width="140" height="12" rx="6" fill="#E2E8F0" opacity="0.7" />

            {/* Digital Speedometer / Credit Meter (Score 825) */}
            <g transform="translate(100, 75)">
              <path d="M 0 50 A 45 45 0 0 1 90 50" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
              <path d="M 0 50 A 45 45 0 0 1 78 18" fill="none" stroke="url(#emeraldGrad)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="45" cy="48" r="5" fill="#0F172A" />
              <line x1="45" y1="48" x2="68" y2="24" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <text x="45" y="65" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="bold" fontFamily="sans-serif">825</text>
              <text x="45" y="75" textAnchor="middle" fill="#10B981" fontSize="7" fontWeight="bold" fontFamily="sans-serif">EXCELLENT</text>
            </g>

            {/* Growth Curve Chart */}
            <g transform="translate(230, 80)">
              <path d="M 0 45 Q 35 35 60 18 T 120 5" fill="none" stroke="url(#brandRedGrad)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="120" cy="5" r="4" fill="#D71938" />
              {/* Vertical guideline dashes */}
              <line x1="30" y1="50" x2="30" y2="38" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="60" y1="50" x2="60" y2="18" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="90" y1="50" x2="90" y2="12" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="120" y1="50" x2="120" y2="5" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="60" y="62" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="sans-serif">Sanction Probability: 99.8%</text>
            </g>

            {/* 3D-Style Character: Smart Professional Receiving Approval */}
            <g transform="translate(195, 62)">
              {/* Shadow beneath character */}
              <ellipse cx="40" cy="155" rx="35" ry="8" fill="#CBD5E1" opacity="0.6" />

              {/* Legs / Trousers */}
              <rect x="26" y="118" width="12" height="40" rx="5" fill="#0F172A" />
              <rect x="42" y="118" width="12" height="40" rx="5" fill="#0F172A" />
              {/* Shoes */}
              <rect x="22" y="152" width="18" height="6" rx="3" fill="#1E293B" />
              <rect x="42" y="152" width="18" height="6" rx="3" fill="#1E293B" />

              {/* Body / Suit Jacket */}
              <path d="M 18 68 L 62 68 L 56 122 L 24 122 Z" fill="url(#suitGrad)" />
              {/* White Shirt Collar & Red Tie */}
              <polygon points="35,68 45,68 40,82" fill="#FFFFFF" />
              <polygon points="38,72 42,72 40,94" fill="url(#brandRedGrad)" />

              {/* Left Arm Raised welcoming loan sanction */}
              <path d="M 22 72 Q 6 86 16 98" fill="none" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" />
              {/* Hand */}
              <circle cx="16" cy="100" r="4.5" fill="#FBBF24" />

              {/* Right Arm Holding Sanction Tablet / Certificate */}
              <path d="M 58 72 Q 72 88 64 104" fill="none" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" />
              <circle cx="64" cy="105" r="4.5" fill="#FBBF24" />

              {/* Sanction Document in Hand */}
              <g transform="translate(58, 92) rotate(-8)">
                <rect x="0" y="0" width="30" height="40" rx="3" fill="#FFFFFF" stroke="#D71938" strokeWidth="1.5" />
                <rect x="4" y="6" width="22" height="3" rx="1.5" fill="#D71938" />
                <rect x="4" y="12" width="18" height="2" rx="1" fill="#94A3B8" />
                <rect x="4" y="16" width="20" height="2" rx="1" fill="#94A3B8" />
                <rect x="4" y="20" width="15" height="2" rx="1" fill="#94A3B8" />
                {/* Official Gold Seal with Green Ribbon */}
                <circle cx="20" cy="30" r="4" fill="url(#goldCoinGrad)" />
                <path d="M 18 32 L 20 37 L 22 32" fill="#10B981" />
              </g>

              {/* Head & Face */}
              <ellipse cx="40" cy="48" rx="13" ry="15" fill="#FBBF24" />
              {/* Modern Professional Haircut */}
              <path d="M 26 44 C 26 32 54 32 54 44 C 54 39 48 35 40 35 C 32 35 27 39 26 44 Z" fill="#0F172A" />
              {/* Friendly Facial Expression */}
              <circle cx="36" cy="48" r="1.5" fill="#0F172A" />
              <circle cx="45" cy="48" r="1.5" fill="#0F172A" />
              <path d="M 37 54 Q 40 58 44 54" fill="none" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Stack of 3D Golden Rupee Coins */}
            <g transform="translate(90, 184)">
              <ellipse cx="25" cy="22" rx="18" ry="7" fill="url(#goldCoinGrad)" stroke="#B45309" strokeWidth="1" />
              <rect x="7" y="16" width="36" height="6" fill="#F59E0B" />
              <ellipse cx="25" cy="16" rx="18" ry="7" fill="url(#goldCoinGrad)" stroke="#B45309" strokeWidth="1" />
              <rect x="7" y="10" width="36" height="6" fill="#F59E0B" />
              <ellipse cx="25" cy="10" rx="18" ry="7" fill="url(#goldCoinGrad)" stroke="#FBBF24" strokeWidth="1.2" />
              <text x="25" y="13.5" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="900" fontFamily="sans-serif">₹</text>
            </g>

            {/* Institutional Approval Stamp Icon */}
            <g transform="translate(330, 160)">
              <circle cx="20" cy="20" r="18" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" />
              <path d="M 12 20 L 17 25 L 28 14" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <text x="20" y="44" textAnchor="middle" fill="#059669" fontSize="7" fontWeight="bold" fontFamily="sans-serif">APPROVED</text>
            </g>
          </svg>
        </div>

        {/* Live Disbursal Milestone Bar */}
        <div className="mt-3 pt-3 border-t border-brand-border/70 flex items-center justify-between text-xs text-brand-textSecondary">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-brand-textPrimary">100% Secure Process</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-brand-red font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Disbursal: 24-48 Hrs</span>
          </div>
        </div>
      </div>

      {/* 3. Floating Card #1: "Loan Approved" Status Badge (Top-Left / Top-Center) */}
      <div className="absolute -top-6 -left-3 sm:-left-6 z-20 animate-float-slow">
        <div className="bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl p-3.5 sm:p-4 shadow-xl shadow-brand-red/10 flex items-center gap-3 max-w-[240px] sm:max-w-[260px] hover:scale-105 transition-transform duration-300">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>
            <h4 className="text-sm font-black text-brand-textPrimary mt-0.5 truncate">
              Loan Approved!
            </h4>
            <div className="text-xs font-bold text-emerald-600 font-mono mt-0.5 flex items-center gap-1">
              <span>₹1 Cr</span>
              <span className="text-[10px] text-brand-textSecondary font-sans font-normal">Sanctioned</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Floating Card #2: Banking Institution Network Badge (Top-Right) */}
      <div className="absolute -top-4 -right-2 sm:-right-4 z-20 animate-float-reverse">
        <div className="bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-black/5 flex items-center gap-2.5 hover:scale-105 transition-transform duration-300">
          <div className="w-9 h-9 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-semibold text-brand-textSecondary block uppercase tracking-wider">
              Lending Network
            </span>
            <span className="text-xs font-black text-brand-textPrimary flex items-center gap-1">
              <span>50 Active Banks</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </span>
          </div>
        </div>
      </div>

      {/* 5. Floating Element #3: 3D Metallic Golden Rupee Coin (Bottom-Left) */}
      <div className="absolute -bottom-5 -left-2 sm:-left-4 z-20 animate-float-gentle">
        <div className="bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-black/5 flex items-center gap-2.5 hover:scale-105 transition-transform duration-300">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-amber-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-amber-500/40 border border-amber-200">
            ₹
          </div>
          <div className="text-left pr-1">
            <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">
              Best Rate Match
            </span>
            <span className="text-xs font-black text-brand-textPrimary">
              Lowest EMI Route
            </span>
          </div>
        </div>
      </div>

      {/* 6. Floating Element #4: Competitive ROI Badge (Bottom-Right) */}
      <div className="absolute -bottom-6 -right-2 sm:-right-5 z-20 animate-float-slow">
        <div className="bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-brand-red/10 flex items-center gap-2 hover:scale-105 transition-transform duration-300">
          <div className="w-8 h-8 rounded-xl bg-brand-red text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-red/30">
            <Percent className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-semibold text-brand-textSecondary block">
              Interest Rate
            </span>
            <span className="text-xs font-black text-brand-red font-mono">
              From 7.10% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* 7. Floating Micro-Element: Document Sanction Chip */}
      <div className="hidden sm:flex absolute top-1/2 -right-6 z-20 animate-float-reverse">
        <div className="bg-white/90 backdrop-blur-md border border-brand-border rounded-xl px-2.5 py-1.5 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-brand-textPrimary">
          <FileText className="w-3.5 h-3.5 text-brand-red" />
          <span>Paperless KYC</span>
        </div>
      </div>
    </div>
  );
}
