import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileSpreadsheet,
  Network,
  GitBranch,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCheck,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/common/Logo.jsx';

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/crm-login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { label: 'Create Lead', path: '/employee/create-lead', icon: PlusCircle },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Assigned Website Leads', path: '/employee/website-leads', icon: FileSpreadsheet },
    { label: 'Assigned Partner Leads', path: '/employee/partner-leads', icon: Network },
    { label: 'Lead Processing', path: '/employee/lead-processing', icon: GitBranch },
    { label: 'Document Verification', path: '/employee/document-verification', icon: ShieldCheck },
    { label: 'Support / Callbacks', path: '/employee/support', icon: HelpCircle },
  ];

  const isActive = (path) => {
    if (path === '/employee/dashboard') return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

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
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-brand-border flex flex-col justify-between overflow-hidden shadow-sm transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-brand-border shrink-0 bg-white">
          <Logo to="/employee/dashboard" subtitle="OPERATIONS DESK" size="md" />
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

        <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-brand-redLight text-brand-red border border-brand-red/20 flex items-center justify-center font-bold text-xs shrink-0">
                E
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-brand-textPrimary truncate">{user?.name || 'Employee'}</div>
                <div className="text-[10px] text-brand-textSecondary truncate">{user?.email || 'Operations Desk'}</div>
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

      {/* Main Viewport */}
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
              <h1 className="text-base font-bold text-brand-textPrimary">Employee Processing Portal</h1>
              <p className="text-xs text-brand-textSecondary">Assigned lead pipeline & bank login execution</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Active Loan Officer</span>
            <span className="sm:hidden">Loan Officer</span>
          </span>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto bg-brand-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
