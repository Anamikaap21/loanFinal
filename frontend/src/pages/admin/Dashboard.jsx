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
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-brand-border relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/25 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RealCred Super Administrator Command</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-textPrimary">
              Executive Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of customer loan applications, channel partner network, loan officer pipeline, and disbursed financial commissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-brand-redLight border border-brand-border text-xs font-semibold text-brand-textSecondary hover:text-brand-red transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Stats</span>
            </button>
            <Link
              to="/admin/lead-pipeline"
              className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-md shadow-brand-red/20 flex items-center gap-1.5"
            >
              <span>Manage Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Primary 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-brand-border hover:border-brand-red/50 transition shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Total Leads Logged</span>
            <div className="p-2.5 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-brand-textPrimary">{summary.totalLeads || 0}</div>
          <div className="text-[11px] text-brand-textSecondary mt-2 flex items-center gap-2">
            <span className="text-brand-textPrimary font-semibold">{summary.websiteLeads || 0} Direct Web</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">{summary.partnerLeads || 0} Partner DSA</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border hover:border-brand-red/50 transition shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Disbursement Volume</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">
            ₹{((summary.totalDisbursementVolume || 0) / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-brand-textSecondary mt-2">
            Conversion Rate: <span className="text-brand-textPrimary font-bold">{summary.conversionRate || '0.0'}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border hover:border-brand-red/50 transition shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Active Channel Partners</span>
            <div className="p-2.5 rounded-xl bg-brand-redLight text-brand-red border border-brand-red/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-brand-textPrimary">{summary.totalPartners || 0}</div>
          <div className="text-[11px] text-brand-textSecondary mt-2 flex items-center justify-between">
            <span>Verified partner network</span>
            <Link to="/admin/partners" className="text-brand-red font-semibold hover:underline">View All</Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border hover:border-brand-red/50 transition shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-brand-textSecondary uppercase tracking-wider">Pending Payouts</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            ₹{((summary.pendingPayoutAmount || 0) / 1000).toFixed(0)}K
          </div>
          <div className="text-[11px] text-brand-textSecondary mt-2 flex items-center justify-between">
            <span>{summary.pendingPayoutsCount || 0} files pending</span>
            <Link to="/admin/payouts" className="text-amber-600 font-semibold hover:underline">Review Desk</Link>
          </div>
        </div>
      </div>

      {/* 8-Stage Lifecycle Funnel Strip */}
      <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-textSecondary mb-4 flex items-center gap-2">
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
                    ? 'bg-emerald-50 border-emerald-200'
                    : isCancelled
                      ? 'bg-red-50 border-brand-red/30'
                      : 'bg-brand-bg border-brand-border'
                  }`}
              >
                <div className="text-[10px] text-brand-textSecondary font-semibold truncate mb-1">{stage}</div>
                <div className={`text-xl font-black ${isDisbursed ? 'text-emerald-600' : isCancelled ? 'text-brand-red' : 'text-brand-textPrimary'
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
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-brand-textPrimary">Disbursement Volume Trends (6 Months)</h3>
              <p className="text-[11px] text-brand-textSecondary">Cumulative value in INR disbursed across partner banks</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-red" />
              <span className="text-brand-textSecondary">Disbursed Volume</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="disburseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D71938" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D71938" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="month" stroke="#666666" fontSize={11} />
                <YAxis
                  stroke="#666666"
                  fontSize={11}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5', color: '#242424', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Disbursement']}
                />
                <Area
                  type="monotone"
                  dataKey="disbursement"
                  stroke="#D71938"
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
          <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
            <h3 className="text-sm font-bold text-brand-textPrimary mb-4">Quick Executive Shortcuts</h3>
            <div className="space-y-2.5">
              <Link
                to="/admin/banks"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 hover:bg-brand-redLight/20 transition text-xs group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-redLight text-brand-red group-hover:scale-105 transition">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-brand-textPrimary">Bank Management</div>
                    <div className="text-[10px] text-brand-textSecondary">{summary.totalBanks || 5} Partner Banks configured</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-textSecondary group-hover:text-brand-red transition" />
              </Link>

              <Link
                to="/admin/employees"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 hover:bg-brand-redLight/20 transition text-xs group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-redLight text-brand-red group-hover:scale-105 transition">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-brand-textPrimary">Loan Officers Desk</div>
                    <div className="text-[10px] text-brand-textSecondary">{summary.totalEmployees || 1} Officers Active</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-textSecondary group-hover:text-brand-red transition" />
              </Link>

              <Link
                to="/admin/support"
                className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border hover:border-brand-red/50 hover:bg-brand-redLight/20 transition text-xs group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-redLight text-brand-red group-hover:scale-105 transition">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-brand-textPrimary">Customer Callbacks</div>
                    <div className="text-[10px] text-brand-textSecondary">{summary.pendingCallbacks || 0} Pending callbacks</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-brand-textSecondary group-hover:text-brand-red transition" />
              </Link>
            </div>
          </div>

          {/* Pending Callbacks Alert Card */}
          {recentCallbacks.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-brand-textPrimary flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-brand-red" />
                  Recent Callback Requests
                </h4>
                <Link to="/admin/support" className="text-[11px] text-brand-red font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-2">
                {recentCallbacks.slice(0, 3).map((cb) => (
                  <div key={cb._id} className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-brand-textPrimary">{cb.customerName}</span>
                      <span className="text-[10px] font-mono text-brand-textSecondary">{cb.requestNumber}</span>
                    </div>
                    <div className="text-[11px] text-brand-textSecondary mt-0.5">
                      Phone: <span className="text-brand-textPrimary font-medium">{cb.mobileNumber}</span> • Preferred: {cb.preferredContactTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent 10 Leads Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-brand-textPrimary">Recent Loan Applications & Pipeline Leads</h3>
            <p className="text-[11px] text-brand-textSecondary">Latest files logged through website and channel partner network</p>
          </div>
          <Link
            to="/admin/lead-pipeline"
            className="text-xs font-bold text-brand-red hover:text-brand-deepRed transition flex items-center gap-1 shrink-0"
          >
            <span>View Full Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
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
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-textSecondary">
                    No leads recorded yet. Applications submitted via website or partner portal will appear here.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-red">
                      {lead.leadId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-textPrimary">{lead.customerName}</div>
                      <div className="text-[11px] text-brand-textSecondary">{lead.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${lead.source === 'website'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-brand-redLight text-brand-red border border-brand-red/20'
                        }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-brand-textSecondary">
                      {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-textPrimary font-mono">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lead.status === 'Cancelled'
                            ? 'bg-red-50 text-brand-red border border-brand-red/30'
                            : 'bg-brand-bg text-brand-textPrimary border border-brand-border'
                        }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.assignedTo?.user?.name ? (
                        <span className="text-brand-textPrimary font-medium">{lead.assignedTo.user.name}</span>
                      ) : (
                        <span className="text-brand-textSecondary italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/lead-pipeline"
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-red hover:text-white border border-brand-border text-[11px] font-semibold transition shadow-sm"
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
