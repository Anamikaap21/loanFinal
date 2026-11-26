import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading, role, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-brand-textPrimary">
        <Logo withLink={false} size="lg" className="mb-6" />
        <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-brand-textSecondary">Authenticating RealCred Session...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to CRM role selection / login flow
  if (!isAuthenticated || !user) {
    return <Navigate to="/crm-login" state={{ from: location }} replace />;
  }

  // Check role authorization: If current user's role is not in allowedRoles -> Explicit 403 Access Denied
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-brand-black text-white flex flex-col items-center justify-center px-4 selection:bg-brand-red selection:text-white">
        <div className="p-8 sm:p-10 rounded-2xl glass-card border border-brand-red/30 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center mx-auto text-brand-red">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-brand-red/10 text-brand-red border border-brand-red/20">
              403 Forbidden
            </span>
            <h2 className="text-2xl font-black text-white mt-3">Access Denied</h2>
            <p className="text-xs text-brand-grey mt-2 leading-relaxed">
              You do not have administrative permission to access this portal. Your authenticated role is{' '}
              <span className="text-white font-bold uppercase">'{role}'</span>, but this section requires{' '}
              <span className="text-brand-red font-bold uppercase">'{allowedRoles.join(' or ')}'</span> authorization.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => {
                if (role === 'admin') window.location.href = '/admin/dashboard';
                else if (role === 'employee') window.location.href = '/employee/dashboard';
                else if (role === 'partner') window.location.href = '/partner/dashboard';
                else window.location.href = '/crm-login';
              }}
              className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-redAccent text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-brand-red/20"
            >
              Return to My Authorized Dashboard
            </button>
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/crm-login';
              }}
              className="w-full py-3 rounded-xl bg-brand-card hover:bg-white/5 text-brand-grey hover:text-white text-xs font-semibold uppercase tracking-wider border border-brand-border transition"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
