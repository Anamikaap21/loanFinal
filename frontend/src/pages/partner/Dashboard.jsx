import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  FileSpreadsheet,
  GitBranch,
  CreditCard,
  Receipt,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import partnerService from '../../services/partnerService.js';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await partnerService.getDashboardMetrics();
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner metrics:', err);
      setError('Unable to load channel partner metrics.');
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
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-grey font-medium">Loading partner workspace...</p>
        </div>
      </div>
    );
  }

  const partner = data?.partner || {};
  const summary = data?.summary || {};
  const statusBreakdown = data?.statusBreakdown || {};
  const recentLeads = data?.recentLeads || [];
  const recentPayouts = data?.recentPayouts || [];

  const stages = [
    'Lead',
    'Login',
    'In Process',
    'Sanction',
    'Disbursement',
    'PDD',
    'Payout',
    'Cancelled',
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-dark border border-brand-border/60 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Partner Code: {partner.partnerCode || 'RCP-PARTNER'}</span>
              <span className="text-white/40">•</span>
              <span>Commission: {partner.defaultCommissionRate || 1.5}%</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.name || 'Channel Partner'}
            </h2>
            <p className="text-xs sm:text-sm text-brand-grey mt-1 max-w-xl leading-relaxed">
              Business: <span className="text-white font-medium">{partner.businessName || 'Independent Partner'}</span>. Submit customer loan inquiries, monitor live banking sanction stages, and reconcile earned commissions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchMetrics}
              className="px-3.5 py-2.5 rounded-xl bg-brand-card hover:bg-white/5 border border-brand-border text-xs font-semibold text-brand-lightGrey hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/partner/create-lead"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Lead</span>
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

      {/* Financial & Pipeline KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-brand-dark border border-brand-border/60 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">
              Total Leads Submitted
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{summary.totalLeadsSubmitted || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>In Pipeline:</span>
            <span className="text-blue-400 font-bold">{summary.activePipelineCount || 0} files</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-dark border border-brand-border/60 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">
              Disbursed Loan Volume
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{Number(summary.totalDisbursedVolume || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>Disbursed Files:</span>
            <span className="text-white font-bold">{summary.disbursedCount || 0}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-dark border border-brand-border/60 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">
              Total Commission Earned
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-400">
            ₹{Number(summary.totalEarnedPayout || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>Pending Payout:</span>
            <span className="text-amber-400 font-bold">
              ₹{Number(summary.pendingPayout || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-brand-dark border border-brand-border/60 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">
              Official Invoices
            </span>
            <div className="p-2 rounded-lg bg-brand-red/10 text-brand-red">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{summary.invoicesCount || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>Settlement:</span>
            <span className="text-emerald-400 font-medium">TDS Compliant</span>
          </div>
        </div>
      </div>

      {/* 8-Stage Funnel Breakdown */}
      <div className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Live Referral Pipeline Funnel</h3>
            <p className="text-xs text-brand-grey">
              Distribution of your customer loan files across RealCred's 8 operational stages.
            </p>
          </div>
          <Link
            to="/partner/pipeline"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {stages.map((st) => {
            const count = statusBreakdown[st] || 0;
            const isTerminal = ['Disbursement', 'PDD', 'Payout'].includes(st);
            const isCancelled = st === 'Cancelled';

            return (
              <div
                key={st}
                className={`p-3.5 rounded-2xl border text-center transition ${
                  isTerminal && count > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : isCancelled && count > 0
                    ? 'bg-brand-red/10 border-brand-red/30'
                    : 'bg-brand-black/60 border-brand-border/40'
                }`}
              >
                <div
                  className={`text-lg font-black ${
                    isTerminal ? 'text-emerald-400' : isCancelled ? 'text-brand-red' : 'text-white'
                  }`}
                >
                  {count}
                </div>
                <div className="text-[10px] font-semibold text-brand-grey mt-1 truncate" title={st}>
                  {st}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Leads vs Recent Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Recent Referral Files</span>
            </h3>
            <Link
              to="/partner/my-leads"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View All Leads →
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-grey">
                No leads submitted yet. Click "Submit New Lead" to refer your first customer.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead._id}
                  className="p-3.5 rounded-2xl bg-brand-black/60 border border-brand-border/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{lead.leadId}</span>
                      <span className="text-[10px] text-brand-grey">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold text-brand-lightGrey mt-0.5">
                      {lead.customerName} • {lead.loanCategory?.name || 'Loan'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-emerald-400">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                        ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : lead.status === 'Cancelled'
                          ? 'bg-brand-red/15 text-brand-red'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Recent Commission Payouts</span>
            </h3>
            <Link
              to="/partner/my-payouts"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View All Payouts →
            </Link>
          </div>

          <div className="space-y-3">
            {recentPayouts.length === 0 ? (
              <div className="p-8 text-center text-xs text-brand-grey">
                No payouts generated yet. Payouts are automatically created once files reach Disbursement.
              </div>
            ) : (
              recentPayouts.map((payout) => (
                <div
                  key={payout._id}
                  className="p-3.5 rounded-2xl bg-brand-black/60 border border-brand-border/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-white">{payout.payoutNumber}</div>
                    <div className="text-[10px] text-brand-grey mt-0.5">
                      File: {payout.lead?.customerName} ({payout.lead?.leadId})
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-purple-400">
                      ₹{Number(payout.netPayoutAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize mt-1 ${
                        payout.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {payout.status}
                    </span>
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
