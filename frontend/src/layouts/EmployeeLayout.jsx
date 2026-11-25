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
          <Link to="/employee/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-600/20">
              RC
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                REAL<span className="text-brand-red">CRED</span>
              </div>
              <div className="text-[9px] font-bold tracking-wider text-blue-400 uppercase">
                OPERATIONS DESK
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
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
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                E
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{user?.name || 'Employee'}</div>
                <div className="text-[10px] text-brand-grey truncate">{user?.email || 'Operations Desk'}</div>
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

      {/* Main Viewport */}
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
              <h1 className="text-base font-bold text-white">Employee Processing Portal</h1>
              <p className="text-xs text-brand-grey">Assigned lead pipeline & bank login execution</p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Active Loan Officer</span>
            <span className="sm:hidden">Loan Officer</span>
          </span>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
