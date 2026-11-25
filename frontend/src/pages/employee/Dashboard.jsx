import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  FileSpreadsheet,
  Network,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  PhoneCall,
  RefreshCw,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import employeeService from '../../services/employeeService.js';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeService.getDashboardMetrics();
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load employee metrics:', err);
      setError('Unable to load employee dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-grey font-medium">Loading your assigned loan desk...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const statusBreakdown = data?.statusBreakdown || {};
  const recentLeads = data?.recentLeads || [];
  const assignedCallbacks = data?.assignedCallbacks || [];
  const employeeInfo = data?.employee || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-dark border border-brand-border/60 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 mb-3">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Operations Desk • ID: {employeeInfo.employeeId || 'RCE-LO'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Welcome back, {user?.name || 'Loan Officer'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-grey mt-1 max-w-2xl leading-relaxed">
              Designation: <span className="text-white font-medium">{employeeInfo.designation || 'Loan Underwriter'}</span> ({employeeInfo.department || 'Loan Operations'}). Manage your assigned files through sanction and disbursement.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className="px-3.5 py-2 rounded-xl bg-brand-card hover:bg-white/5 border border-brand-border text-xs font-semibold text-brand-lightGrey hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Desk</span>
            </button>
            <Link
              to="/employee/create-lead"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <span>+ Create Lead</span>
            </Link>
            <Link
              to="/employee/lead-processing"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
            >
              <span>Process Files</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Total Files Assigned</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{summary.totalAssigned || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center gap-2">
            <span className="text-white font-medium">{summary.assignedWebsiteLeads || 0} Web</span>
            <span>•</span>
            <span className="text-purple-400 font-medium">{summary.assignedPartnerLeads || 0} Partner</span>
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Sanctioned Files</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{summary.sanctionedCount || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2">
            Bank credit sanction issued
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Disbursed Volume</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400">
            ₹{((summary.totalDisbursedVolume || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-brand-grey mt-2">
            {summary.disbursedCount || 0} files disbursed
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Pending Inquiries</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{summary.pendingCallbacks || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>Customer callback queue</span>
            <Link to="/employee/support" className="text-amber-400 hover:underline">Support</Link>
          </div>
        </div>
      </div>

      {/* 8-Stage Funnel Status Breakdown */}
      <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-grey mb-4 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
          My Assigned Files by Lifecycle Stage
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(statusBreakdown).map(([stage, count]) => {
            const isDisbursed = ['Disbursement', 'PDD', 'Payout'].includes(stage);
            const isCancelled = stage === 'Cancelled';
            return (
              <div
                key={stage}
                className={`p-3 rounded-xl border text-center transition ${isDisbursed
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isCancelled
                      ? 'bg-brand-red/5 border-brand-red/20'
                      : 'bg-brand-black/60 border-brand-border/50'
                  }`}
              >
                <div className="text-[10px] text-brand-grey font-semibold truncate mb-1">{stage}</div>
                <div className={`text-xl font-black ${isDisbursed ? 'text-emerald-400' : isCancelled ? 'text-brand-red' : 'text-white'
                  }`}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Assigned Leads & Callbacks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent 5 Leads */}
        <div className="lg:col-span-2 bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-brand-border/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recently Updated Files</h3>
              <p className="text-[11px] text-brand-grey">Your assigned active applications</p>
            </div>
            <Link
              to="/employee/lead-processing"
              className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Full Worklist</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto min-w-0 max-w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-brand-black/60 text-brand-grey uppercase font-semibold border-b border-brand-border/50">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Lead ID</th>
                  <th className="py-3 px-4 min-w-[140px]">Customer</th>
                  <th className="py-3 px-4">Loan Facility</th>
                  <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 whitespace-nowrap">Stage</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-brand-grey">
                      No files currently assigned to your desk.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {lead.leadId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{lead.customerName}</div>
                        <div className="text-[10px] text-brand-grey">{lead.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.loanCategory?.name || 'General Loan'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : lead.status === 'Cancelled'
                              ? 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/employee/lead-processing"
                          className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/30 text-[11px] font-semibold transition"
                        >
                          Process
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Callback Queue Card */}
        <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Callback Assistance Queue
            </h3>
            <Link to="/employee/support" className="text-xs text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {assignedCallbacks.length === 0 ? (
              <p className="text-xs text-brand-grey py-4 text-center">
                No pending customer callback requests.
              </p>
            ) : (
              assignedCallbacks.slice(0, 4).map((cb) => (
                <div key={cb._id} className="p-3 rounded-2xl bg-brand-black/60 border border-brand-border/60 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white">{cb.customerName}</span>
                    <span className="font-mono text-[10px] text-brand-grey">{cb.requestNumber}</span>
                  </div>
                  <div className="text-[11px] text-brand-grey">
                    Phone: <span className="text-white font-medium">{cb.mobileNumber}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 mt-1">
                    Slot: {cb.preferredContactTime || 'Anytime'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
