import React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, UserCheck, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../components/common/Logo.jsx';
import Login from './Login.jsx';

const roles = [
  {
    id: 'admin',
    title: 'Super Administrator',
    badge: 'Executive Control',
    icon: ShieldCheck,
    color: 'from-red-600/20 to-red-900/10 border-brand-red/40',
    iconBg: 'bg-brand-red/10 text-brand-red border-brand-red/30',
    description: 'Complete system governance, lead allocation, employee & partner management, bank master, payouts, and invoices.',
    benefits: ['Full Pipeline Visibility', 'Lead Assignment Engine', 'Disbursement & Payouts', 'PDF Invoice Generation'],
  },
  {
    id: 'employee',
    title: 'Operations Employee',
    badge: 'Processing Desk',
    icon: UserCheck,
    color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30',
    iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    description: 'Assigned lead lifecycle processing (Lead → Login → In Process → Sanction → Disbursement), RCU verification, and callback resolution.',
    benefits: ['Assigned Leads Only', 'Stage Status History', 'Document Verification', 'Callback Follow-up'],
  },
  {
    id: 'partner',
    title: 'Channel Partner / DSA',
    badge: 'Partner Network',
    icon: Briefcase,
    color: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30',
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Self-service partner portal to create customer loan applications, track real-time pipeline status, view payouts, and download invoices.',
    benefits: ['Direct Lead Creation', 'Real-time Pipeline Tracker', 'Disbursement Commissions', 'Instant Tax Invoices'],
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setSelectedRole } = useAuth();

  const roleParam = searchParams.get('role');
  if (roleParam && ['admin', 'employee', 'partner'].includes(roleParam)) {
    return <Login />;
  }

  const handleSelectRole = (roleId) => {
    setSelectedRole(roleId);
    navigate(`/login?role=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-textPrimary flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Header */}
      <header className="border-b border-brand-border bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo variant="light" size="md" />

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-textSecondary hover:text-brand-red px-3.5 py-1.5 rounded-lg border border-brand-border bg-white hover:border-brand-red/30 transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Website
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex-1 flex flex-col justify-center min-w-0 max-w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-brand-redLight text-brand-red border border-brand-red/30 mb-4">
            Step 1: Role Authentication
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-textPrimary tracking-tight leading-tight">
            Select Your <span className="text-brand-red">RealCred Portal</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-brand-textSecondary">
            Please select your organizational role to proceed with secure multi-tenant CRM authentication.
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectRole(item.id)}
                className="group relative bg-white p-7 rounded-2xl cursor-pointer border border-brand-border hover:border-brand-red hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between min-w-0 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border text-brand-textSecondary">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-brand-textPrimary mb-2 group-hover:text-brand-red transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-brand-textSecondary leading-relaxed mb-6">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-8 pt-4 border-t border-brand-border">
                    {item.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-brand-textSecondary">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-red"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md group-hover:shadow-brand-red/30"
                >
                  <span>Continue as {item.title.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Channel Partner Registration Prompt */}
        <div className="text-center mt-12 pt-8 border-t border-brand-border max-w-xl mx-auto">
          <p className="text-xs text-brand-textSecondary">
            Are you a financial advisor or loan distributor looking to partner with RealCred?
          </p>
          <Link
            to="/partner-registration"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-brand-red hover:underline transition"
          >
            <span>Register as a New Channel Partner (Instant Activation)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border bg-white py-6 text-center text-xs text-brand-textSecondary">
        <p>&copy; {new Date().getFullYear()} RealCred Technology Private Limited. Official Domain: https://realcred.in</p>
      </footer>
    </div>
  );
}
