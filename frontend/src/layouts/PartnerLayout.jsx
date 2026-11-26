import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  PlusCircle,
  FileSpreadsheet,
  GitBranch,
  CreditCard,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export default function PartnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/crm-login', { replace: true });
  };

  // If partner is restricted or in resubmission state, redirect to resubmission desk
  React.useEffect(() => {
    const regStatus = (user?.registrationStatus || '').toUpperCase();
    if (regStatus === 'RESUBMISSION_REQUIRED' || regStatus === 'REUPLOAD_REQUIRED' || user?.isRestricted) {
      navigate('/partner/resubmit-documents', { replace: true });
    }
  }, [user, navigate]);

  const navItems = [
    { label: 'Dashboard', path: '/partner/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/partner/profile', icon: User },
    { label: 'Create New Lead', path: '/partner/create-lead', icon: PlusCircle },
    { label: 'My Leads', path: '/partner/my-leads', icon: FileSpreadsheet },
    { label: 'Lead Pipeline', path: '/partner/pipeline', icon: GitBranch },
    { label: 'My Payouts', path: '/partner/my-payouts', icon: CreditCard },
    { label: 'My Invoices', path: '/partner/my-invoices', icon: Receipt },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-full bg-brand-bg text-brand-textPrimary flex min-w-0 max-w-full overflow-hidden relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-brand-border flex flex-col justify-between overflow-hidden shadow-sm transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-brand-border shrink-0 bg-white">
          <Logo to="/partner/dashboard" subtitle="PARTNER PORTAL" size="md" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-textSecondary hover:text-brand-textPrimary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${active
                  ? 'bg-brand-red text-white shadow-sm shadow-brand-red/20'
                  : 'text-brand-textSecondary hover:bg-brand-redLight hover:text-brand-red'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-brand-textSecondary'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center font-bold text-xs shrink-0">
                P
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-brand-textPrimary truncate">{user?.name || 'Partner'}</div>
                <div className="text-[10px] text-brand-red truncate font-semibold">Active Partner</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-white hover:bg-brand-redLight text-brand-textSecondary hover:text-brand-red border border-brand-border hover:border-brand-red/30 text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full h-screen lg:ml-64 overflow-hidden">
        <header className="h-20 bg-white border-b border-brand-border px-3 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-brand-textPrimary">Channel Partner Dashboard</h1>
              <p className="text-xs text-brand-textSecondary">Direct lead creation & commission earnings</p>
            </div>
          </div>

          <Link
            to="/partner/create-lead"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase bg-brand-red hover:bg-brand-deepRed text-white shadow-sm shadow-brand-red/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Lead</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto bg-brand-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
