import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileSpreadsheet,
  Network,
  GitBranch,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  PhoneCall,
  ArrowUpRight,
  Clock,
  AlertCircle,
  RefreshCw,
  Landmark
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext.jsx';
import adminService from '../../services/adminService.js';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getDashboardMetrics();
      if (res.status === 'success') {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setError('Unable to load dashboard data. Please check connection.');
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
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-grey font-medium">Aggregating RealCred executive metrics...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const statusBreakdown = data?.statusBreakdown || {};
  const monthlyStats = data?.monthlyStats || [];
  const recentLeads = data?.recentLeads || [];
  const recentCallbacks = data?.recentCallbacks || [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-dark border border-brand-border/60 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/25 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RealCred Super Administrator Command</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Executive Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-brand-grey mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of customer loan applications, channel partner network, loan officer pipeline, and disbursed financial commissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className="px-3.5 py-2 rounded-xl bg-brand-card hover:bg-white/5 border border-brand-border text-xs font-semibold text-brand-lightGrey hover:text-white transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </button>
            <Link
              to="/admin/lead-pipeline"
              className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 flex items-center gap-1.5"
            >
              <span>Manage Pipeline</span>
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

      {/* Primary 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Total Leads Logged</span>
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{summary.totalLeads || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center gap-2">
            <span className="text-white font-medium">{summary.websiteLeads || 0} Direct Web</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">{summary.partnerLeads || 0} Partner DSA</span>
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Disbursement Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ₹{((summary.totalDisbursementVolume || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-brand-grey mt-2">
            Conversion Rate: <span className="text-white font-bold">{summary.conversionRate || '0.0'}%</span>
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Active Channel Partners</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{summary.totalPartners || 0}</div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>Auto-activated network</span>
            <Link to="/admin/partners" className="text-blue-400 hover:underline">View All</Link>
          </div>
        </div>

        <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-grey uppercase tracking-wider">Pending Payouts</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-400">
            ₹{((summary.pendingPayoutAmount || 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-[11px] text-brand-grey mt-2 flex items-center justify-between">
            <span>{summary.pendingPayoutsCount || 0} files pending approval</span>
            <Link to="/admin/payouts" className="text-purple-400 hover:underline">Review Desk</Link>
          </div>
        </div>
      </div>

      {/* 8-Stage Lifecycle Funnel Strip */}
      <div className="bg-brand-dark p-5 rounded-2xl border border-brand-border/60">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-grey mb-4 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-brand-red" />
          Lead Progression Stages (8-Stage Pipeline)
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="lg:col-span-2 bg-brand-dark p-6 rounded-3xl border border-brand-border/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Disbursement Volume Trends (6 Months)</h3>
              <p className="text-[11px] text-brand-grey">Cumulative value in INR disbursed across partner banks</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              <span className="text-brand-grey">Disbursed Volume</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="disburseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8102E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#737373" fontSize={11} />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Disbursement']}
                />
                <Area
                  type="monotone"
                  dataKey="disbursement"
                  stroke="#C8102E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#disburseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Action Shortcuts & Callback Inquiries */}
        <div className="space-y-6">
          <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60">
            <h3 className="text-sm font-bold text-white mb-4">Quick Executive Shortcuts</h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/banks"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-black/60 border border-brand-border hover:border-brand-red/40 transition text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-brand-red group-hover:scale-105 transition">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Bank Management</div>
                    <div className="text-[10px] text-brand-grey">{summary.totalBanks || 5} Partner Banks configured</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-grey group-hover:text-brand-red transition" />
              </Link>

              <Link
                to="/admin/employees"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-black/60 border border-brand-border hover:border-brand-red/40 transition text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-blue-400 group-hover:scale-105 transition">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Loan Officers Desk</div>
                    <div className="text-[10px] text-brand-grey">{summary.totalEmployees || 1} Officers Active</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-grey group-hover:text-blue-400 transition" />
              </Link>

              <Link
                to="/admin/support"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-black/60 border border-brand-border hover:border-brand-red/40 transition text-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 text-emerald-400 group-hover:scale-105 transition">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Customer Callbacks</div>
                    <div className="text-[10px] text-brand-grey">{summary.pendingCallbacks || 0} Pending callbacks</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-grey group-hover:text-emerald-400 transition" />
              </Link>
            </div>
          </div>

          {/* Pending Callbacks Alert Card */}
          {recentCallbacks.length > 0 && (
            <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-red" />
                  Recent Callback Requests
                </h4>
                <Link to="/admin/support" className="text-[11px] text-brand-red font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentCallbacks.slice(0, 3).map((cb) => (
                  <div key={cb._id} className="p-2.5 rounded-xl bg-brand-black/60 border border-brand-border/50 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{cb.customerName}</span>
                      <span className="text-[10px] font-mono text-brand-grey">{cb.requestNumber}</span>
                    </div>
                    <div className="text-[11px] text-brand-grey mt-0.5">
                      Phone: <span className="text-white">{cb.mobileNumber}</span> • Preferred: {cb.preferredContactTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent 10 Leads Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="p-6 border-b border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Loan Applications & Pipeline Leads</h3>
            <p className="text-[11px] text-brand-grey">Latest files logged through website and channel partner network</p>
          </div>
          <Link
            to="/admin/lead-pipeline"
            className="text-xs font-bold text-brand-red hover:text-brand-redHover transition flex items-center gap-1 shrink-0"
          >
            <span>View Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3 px-4 min-w-[150px]">Customer</th>
                <th className="py-3 px-4 whitespace-nowrap">Source</th>
                <th className="py-3 px-4">Loan Category</th>
                <th className="py-3 px-4 whitespace-nowrap">Required (INR)</th>
                <th className="py-3 px-4 whitespace-nowrap">Current Stage</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No leads recorded yet. Applications submitted via website or partner portal will appear here.
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
                      <div className="text-[11px] text-brand-grey">{lead.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${lead.source === 'website'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : lead.status === 'Cancelled'
                            ? 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.assignedTo?.user?.name ? (
                        <span className="text-white font-medium">{lead.assignedTo.user.name}</span>
                      ) : (
                        <span className="text-brand-grey italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/lead-pipeline"
                        className="px-2.5 py-1 rounded-lg bg-brand-card hover:bg-brand-red hover:text-white border border-brand-border text-[11px] font-semibold transition"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
