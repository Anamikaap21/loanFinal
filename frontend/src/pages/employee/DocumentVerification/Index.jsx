import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  Building2,
  Phone,
  User,
  ArrowRight,
  Filter,
  RefreshCw,
  AlertTriangle,
  FolderOpen,
  Calendar,
  IndianRupee,
  Layers,
  ChevronRight
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';

export default function EmployeeDocumentVerification() {
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState({
    totalAssigned: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    reuploadCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchVerificationLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (sourceFilter !== 'all') params.source = sourceFilter;
      if (statusFilter !== 'all') params.verificationStatus = statusFilter;

      const res = await employeeService.getDocumentVerificationLeads(params);
      if (res.status === 'success') {
        setLeads(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load verification queue:', err);
      setError('Unable to load document verification queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationLeads();
  }, [sourceFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVerificationLeads();
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KYC Compliance & Verification Module</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Document Verification Desk</h2>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Review, verify, reject, or request re-upload for customer KYC & bank proof documentation across your assigned files.
          </p>
        </div>

        <button
          onClick={fetchVerificationLeads}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition shadow-sm flex items-center gap-2 text-xs font-semibold"
          title="Refresh Queue"
        >
          <RefreshCw className="w-4 h-4 text-brand-red" />
          <span className="hidden sm:inline">Refresh Queue</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/20 flex items-center gap-3 text-xs text-brand-red">
          <AlertTriangle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Metric Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-textSecondary uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600">{metrics.pendingCount}</div>
          <div className="text-[10px] text-brand-textSecondary mt-1">Awaiting officer KYC review</div>
        </div>

        {/* Fully Verified */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-textSecondary uppercase tracking-wider">
              Fully Verified
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{metrics.verifiedCount}</div>
          <div className="text-[10px] text-brand-textSecondary mt-1">All 3 mandatory docs approved</div>
        </div>

        {/* Resubmission Required */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-textSecondary uppercase tracking-wider">
              Resubmission Req.
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.reuploadCount}</div>
          <div className="text-[10px] text-brand-textSecondary mt-1">Re-upload requested from client</div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-2xl border border-brand-red/20 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-textSecondary uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-redLight text-brand-red flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-brand-red">{metrics.rejectedCount}</div>
          <div className="text-[10px] text-brand-textSecondary mt-1">Flagged / rejected files</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Customer Name, or Mobile Number..."
            className="w-full pl-10 pr-24 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1.5 rounded-lg bg-brand-red hover:bg-brand-deepRed text-white text-[11px] font-bold transition shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          >
            <option value="all">All Verification Statuses</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Fully Verified</option>
            <option value="action_required">Resubmission Required</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          >
            <option value="all">All Sources</option>
            <option value="website">Website Leads</option>
            <option value="partner">Partner Referrals</option>
            <option value="employee">Employee Leads</option>
          </select>

          <div className="text-xs text-brand-textSecondary whitespace-nowrap hidden lg:block">
            Files: <span className="text-brand-textPrimary font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Master Leads Verification Table */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[1100px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-4 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-4 px-4 min-w-[170px]">Customer Details</th>
                <th className="py-4 px-4 whitespace-nowrap">Source</th>
                <th className="py-4 px-4">Loan Facility</th>
                <th className="py-4 px-4 whitespace-nowrap">Loan Amount</th>
                <th className="py-4 px-4 whitespace-nowrap">Docs Submitted</th>
                <th className="py-4 px-4 min-w-[150px]">Verification Progress</th>
                <th className="py-4 px-4 whitespace-nowrap">Overall Status</th>
                <th className="py-4 px-4 whitespace-nowrap">Last Updated</th>
                <th className="py-4 px-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading assigned verification files...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-brand-textSecondary space-y-2">
                    <FolderOpen className="w-8 h-8 text-brand-textSecondary mx-auto opacity-40" />
                    <div className="text-brand-textPrimary font-semibold">No Leads Matching Filters</div>
                    <p className="text-[11px] max-w-sm mx-auto">
                      All assigned customer files are currently reviewed or no files match the selected filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const isVerified = (lead.documentVerificationStatus || '').toLowerCase() === 'verified';
                  const isRejected = (lead.documentVerificationStatus || '').toLowerCase() === 'rejected';
                  const isReupload = ['action_required', 'reupload_required', 're-upload required'].includes(
                    (lead.documentVerificationStatus || '').toLowerCase()
                  );
                  const summary = lead.documentsSummary || {
                    totalSubmitted: lead.documentsCount || 0,
                    verifiedCount: isVerified ? 3 : 0,
                    mandatoryTotal: 3,
                    progressPercent: isVerified ? 100 : 0,
                  };

                  return (
                    <tr key={lead._id} className="hover:bg-brand-redLight/20 transition-colors">
                      {/* Lead ID */}
                      <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                        <span className="text-brand-red">{lead.leadId}</span>
                        <div className="text-[10px] text-brand-textSecondary font-sans font-normal">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-textPrimary text-sm">{lead.customerName}</div>
                        <div className="text-xs text-brand-textSecondary">{lead.customerPhone}</div>
                        {lead.city && (
                          <div className="text-[10px] text-brand-textSecondary mt-0.5">{lead.city}</div>
                        )}
                      </td>

                      {/* Lead Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.source === 'website'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : lead.source === 'employee'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {lead.source}
                        </span>
                      </td>

                      {/* Loan Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-textPrimary">
                          {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                        </div>
                        <div className="text-[10px] text-brand-textSecondary">
                          Bank: {lead.preferredBank?.name || 'Any Suitable'}
                        </div>
                      </td>

                      {/* Required Loan Amount */}
                      <td className="py-3.5 px-4 font-bold text-emerald-700 whitespace-nowrap">
                        ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Documents Submitted */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-xs font-semibold text-brand-textPrimary">
                          <FileText className="w-3.5 h-3.5 text-brand-red" />
                          <span>{summary.totalSubmitted} Files</span>
                        </span>
                      </td>

                      {/* Verification Progress */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold">
                            <span className="text-brand-textSecondary">
                              {summary.verifiedCount} / {summary.mandatoryTotal} Verified
                            </span>
                            <span
                              className={
                                summary.progressPercent === 100 ? 'text-emerald-700 font-bold' : 'text-brand-red font-bold'
                              }
                            >
                              {summary.progressPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                summary.progressPercent === 100 ? 'bg-emerald-600' : 'bg-brand-red'
                              }`}
                              style={{ width: `${summary.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Overall Verification Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-brand-redLight text-brand-red border-brand-red/30'
                              : isReupload
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isVerified ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Fully Verified</span>
                            </>
                          ) : isRejected ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </>
                          ) : isReupload ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Resubmission Req.</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Verification</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 text-brand-textSecondary text-[11px] whitespace-nowrap font-mono">
                        {new Date(lead.updatedAt || lead.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Action: View & Verify */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/employee/document-verification/${lead._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>View & Verify</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
