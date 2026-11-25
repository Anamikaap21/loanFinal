import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const roleMeta = {
  admin: {
    title: 'Super Administrator',
    badge: 'Executive Control',
    icon: ShieldCheck,
    color: 'text-brand-red border-brand-red/40 bg-brand-red/10',
    description: 'Enter your administrative credentials to access full platform governance.',
    identifierLabel: 'Administrator Email / User ID',
    identifierPlaceholder: 'admin@realcred.in',
    buttonText: 'Login to Administrator Dashboard',
  },
  employee: {
    title: 'Operations Employee',
    badge: 'Processing Desk',
    icon: UserCheck,
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    description: 'Enter your employee credentials to process assigned loan applications.',
    identifierLabel: 'Employee Email / Phone',
    identifierPlaceholder: 'employee@realcred.in / 9876543210',
    buttonText: 'Login to Employee Dashboard',
  },
  partner: {
    title: 'Channel Partner / DSA',
    badge: 'Partner Network',
    icon: Briefcase,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    description: 'Enter your partner credentials to manage leads, pipeline, and payouts.',
    identifierLabel: 'Partner Email / Mobile Number',
    identifierPlaceholder: 'partner@example.com / 9876543210',
    buttonText: 'Login to Partner Dashboard',
  },
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, selectedRole, setSelectedRole } = useAuth();

  // Role resolution: query param takes precedence, then context
  const activeRole = searchParams.get('role') || selectedRole;

  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If no role has been chosen, redirect to role selection first
  useEffect(() => {
    if (!activeRole || !['admin', 'employee', 'partner'].includes(activeRole)) {
      navigate('/crm-login', { replace: true });
    } else if (activeRole !== selectedRole) {
      setSelectedRole(activeRole);
    }
  }, [activeRole, selectedRole, navigate, setSelectedRole]);

  // NOTE: Previous session auto-redirect has been removed.
  // Selecting a role card MUST open the login form and require fresh credentials.
  // No user is authenticated into any dashboard without explicit credential verification.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.emailOrPhone.trim()) {
      setError('Please enter your User ID, Email, or Mobile Number.');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        emailOrPhone: formData.emailOrPhone,
        password: formData.password,
        role: activeRole,
      });

      navigate(result.redirectPath || `/${activeRole}/dashboard`, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const apiMessage =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!activeRole || !roleMeta[activeRole]) {
    return null;
  }

  const currentMeta = roleMeta[activeRole];
  const Icon = currentMeta.icon;

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col justify-between selection:bg-brand-red selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-brand-border/40 bg-brand-dark/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-brand-red/20">
              RC
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                REAL<span className="text-brand-red">CRED</span>
              </div>
              <div className="text-[10px] text-brand-grey font-medium tracking-wider uppercase">
                Your Loan. One Guided Route.
              </div>
            </div>
          </Link>

          <Link
            to="/crm-login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-grey hover:text-white px-3.5 py-1.5 rounded-lg border border-brand-border/50 hover:border-brand-grey/50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Role Selection
          </Link>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="max-w-md w-full mx-auto px-4 py-12 flex-1 flex flex-col justify-center min-w-0 max-w-full">
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-brand-cardBorder shadow-2xl min-w-0 max-w-full">
          {/* Active Role Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${currentMeta.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10 text-brand-grey">
                  {currentMeta.badge}
                </span>
                <h2 className="text-lg font-bold text-white mt-1">{currentMeta.title}</h2>
              </div>
            </div>
            <Link
              to="/crm-login"
              className="inline-flex items-center gap-1 text-xs text-brand-redAccent hover:text-white font-semibold transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </Link>
          </div>

          <p className="text-xs text-brand-grey mb-6 leading-relaxed">
            {currentMeta.description}
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-brand-red/40 text-red-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey uppercase tracking-wider mb-2">
                {currentMeta.identifierLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-grey">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="emailOrPhone"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  placeholder={currentMeta.identifierPlaceholder}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm placeholder-brand-grey/50 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-brand-lightGrey uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-grey">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your account password"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-black/60 border border-brand-border text-white text-sm placeholder-brand-grey/50 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-grey hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-red/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>{currentMeta.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Links for Partners */}
          {activeRole === 'partner' && (
            <div className="mt-6 pt-6 border-t border-white/5 text-center">
              <span className="text-xs text-brand-grey">Not registered as a partner yet? </span>
              <Link
                to="/partner-registration"
                className="text-xs font-bold text-brand-redAccent hover:underline"
              >
                Register Now
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-border/40 py-6 text-center text-xs text-brand-grey">
        <p>&copy; {new Date().getFullYear()} RealCred Technology Private Limited. Official Domain: https://realcred.in</p>
      </footer>
    </div>
  );
}
