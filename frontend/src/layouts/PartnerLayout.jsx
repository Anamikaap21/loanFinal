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
    <div className="h-screen w-full bg-brand-black text-white flex min-w-0 max-w-full overflow-hidden relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-brand-dark border-r border-brand-border/40 flex flex-col justify-between overflow-hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 shrink-0">
          <Link to="/partner/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-emerald-600/20">
              RC
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                REAL<span className="text-brand-red">CRED</span>
              </div>
              <div className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
                PARTNER PORTAL
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-grey hover:text-white"
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-brand-lightGrey hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-brand-grey'}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-brand-black/40 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                P
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Partner'}</div>
                <div className="text-[10px] text-emerald-400 truncate font-semibold">Active Partner</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-brand-red/10 text-brand-grey hover:text-brand-red border border-white/5 hover:border-brand-red/30 text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full h-screen lg:ml-64 overflow-hidden">
        <header className="h-20 bg-brand-dark/60 backdrop-blur-md border-b border-brand-border/40 px-3 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-brand-card text-brand-grey hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white">Channel Partner Dashboard</h1>
              <p className="text-xs text-brand-grey">Direct lead creation & commission earnings</p>
            </div>
          </div>

          <Link
            to="/partner/create-lead"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Lead</span>
            <span className="sm:hidden">New</span>
          </Link>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
