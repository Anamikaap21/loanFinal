import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Landmark,
  Users,
  Briefcase,
  FileSpreadsheet,
  Network,
  GitBranch,
  HelpCircle,
  CreditCard,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Layers,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/crm-login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Website Management', path: '/admin/website', icon: Globe },
    { label: 'Bank Management', path: '/admin/banks', icon: Landmark },
    { label: 'Loan Categories', path: '/admin/categories', icon: Layers },
    { label: 'Employee Management', path: '/admin/employees', icon: Users },
    { label: 'Partner Management', path: '/admin/partners', icon: Briefcase },
    { label: 'Partner Verification', path: '/admin/partner-verification', icon: ShieldCheck },
    { label: 'Website Leads', path: '/admin/website-leads', icon: FileSpreadsheet },
    { label: 'Employee Leads', path: '/admin/employee-leads', icon: UserCheck },
    { label: 'Partner Leads', path: '/admin/partner-leads', icon: Network },
    { label: 'Lead Management', path: '/admin/lead-pipeline', icon: GitBranch },
    { label: 'Support / Callbacks', path: '/admin/support', icon: HelpCircle },
    { label: 'Partner Payout', path: '/admin/payouts', icon: CreditCard },
    { label: 'Invoice Management', path: '/admin/invoices', icon: Receipt },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="h-screen w-full bg-brand-bg text-brand-textPrimary flex min-w-0 max-w-full overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-brand-border flex flex-col justify-between overflow-hidden shadow-sm transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-brand-border shrink-0 bg-white">
          <Logo to="/admin/dashboard" subtitle="ADMIN CONTROL" size="md" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-brand-textSecondary hover:text-brand-textPrimary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
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

        {/* User Card & Logout */}
        <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center font-bold text-xs shrink-0">
                A
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-brand-textPrimary truncate">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-brand-textSecondary truncate">{user?.email || 'admin@realcred.in'}</div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full h-screen lg:ml-64 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-brand-border px-3 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-brand-textPrimary">RealCred Executive Administration</h1>
              <p className="text-xs text-brand-textSecondary">Multi-bank distribution & channel management</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Super Admin Session</span>
              <span className="sm:hidden">Super Admin</span>
            </span>

            <Link
              to="/"
              target="_blank"
              className="text-xs text-brand-textSecondary hover:text-brand-red px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:border-brand-red/30 hidden sm:flex items-center gap-1.5 shadow-sm transition"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Website</span>
            </Link>
          </div>
        </header>

        {/* Dashboard Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto bg-brand-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
