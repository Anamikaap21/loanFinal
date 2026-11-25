import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  PlusCircle,
  Calendar,
  Building2,
  Clock,
  IndianRupee,
  ShieldCheck,
  History
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';

export default function PartnerMyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  // Lead Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedLeadData, setSelectedLeadData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await partnerService.getMyLeads(params);
      if (res.status === 'success') {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner leads:', err);
      setError('Unable to fetch your referred loan leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleOpenDetails = async (id) => {
    try {
      setLoadingDetails(true);
      setDetailsModalOpen(true);
      const res = await partnerService.getLeadDetails(id);
      if (res.status === 'success') {
        setSelectedLeadData(res.data);
      }
    } catch (err) {
      console.error('Lead details error:', err);
      setError('Unable to load file details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Referred Files Directory</span>
          </div>
          <h2 className="text-2xl font-black text-white">My Submitted Leads</h2>
          <p className="text-xs text-brand-grey">
            Directory of customer loan applications referred through your channel partner account.
          </p>
        </div>

        <Link
          to="/partner/create-lead"
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Referral</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-brand-grey hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Customer, Phone, City..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <div className="text-xs text-brand-grey whitespace-nowrap">
            Total Referred: <span className="text-white font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[920px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3.5 px-4 min-w-[150px]">Customer Details</th>
                <th className="py-3.5 px-4">Loan Product</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Loan Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">KYC Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Lifecycle Stage</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Payout Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading your referred leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No leads found matching your search. Click "New Referral" to submit customer requirements.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {lead.leadId}
                      <div className="text-[10px] text-brand-grey font-sans font-normal">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{lead.customerName}</div>
                      <div className="text-[11px] text-brand-grey">
                        {lead.customerPhone} • {lead.city}
                      </div>
                      {lead.employmentType && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {lead.employmentType}
                          {lead.otherEmploymentDetails ? ` (${lead.otherEmploymentDetails})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{lead.loanCategory?.name || 'Loan'}</div>
                      <div className="text-[10px] text-brand-grey">
                        Bank: {lead.preferredBank?.name || 'Any'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-400">
                        ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                      </div>
                      {lead.disbursedAmount > 0 && (
                        <div className="text-[10px] text-brand-grey">
                          Disbursed: ₹{Number(lead.disbursedAmount).toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          lead.documentVerificationStatus === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : lead.documentVerificationStatus === 'rejected'
                            ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                            : ['action_required', 'reupload_required'].includes(lead.documentVerificationStatus)
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {lead.documentVerificationStatus === 'verified'
                          ? 'Verified'
                          : lead.documentVerificationStatus === 'rejected'
                          ? 'Rejected'
                          : ['action_required', 'reupload_required'].includes(lead.documentVerificationStatus)
                          ? 'Action Req.'
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : lead.status === 'Cancelled'
                            ? 'bg-brand-red/15 text-brand-red border border-brand-red/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          lead.isEligibleForPayout
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-brand-grey'
                        }`}
                      >
                        {lead.isEligibleForPayout ? 'Eligible' : 'In Pipeline'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(lead._id)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-600/20 text-brand-grey hover:text-emerald-400 transition"
                        title="View Full File Tracker"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DETAILS & TIMELINE MODAL */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingDetails || !selectedLeadData ? (
              <div className="py-12 text-center text-xs text-brand-grey">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading file timeline...
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {selectedLeadData.lead.leadId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ['Disbursement', 'PDD', 'Payout'].includes(selectedLeadData.lead.status)
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : selectedLeadData.lead.status === 'Cancelled'
                          ? 'bg-brand-red/15 text-brand-red'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                    >
                      {selectedLeadData.lead.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {selectedLeadData.lead.customerName}
                  </h3>
                  <p className="text-xs text-brand-grey">
                    {selectedLeadData.lead.customerPhone} • {selectedLeadData.lead.city}
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-2xl bg-brand-black/60 border border-brand-border/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-brand-grey block">Product</span>
                    <span className="font-semibold text-white">
                      {selectedLeadData.lead.loanCategory?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-grey block">Requested Amount</span>
                    <span className="font-bold text-white">
                      ₹{Number(selectedLeadData.lead.requiredLoanAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-grey block">Disbursed Amount</span>
                    <span className="font-bold text-emerald-400">
                      ₹{Number(selectedLeadData.lead.disbursedAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payout Information if Eligible */}
                {selectedLeadData.payout && (
                  <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
                    <div className="font-bold text-purple-400 flex items-center justify-between">
                      <span>Associated Partner Commission Payout</span>
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20">
                        {selectedLeadData.payout.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-brand-grey block">Commission Rate:</span>
                        <span className="font-bold text-white">
                          {selectedLeadData.payout.commissionRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-grey block">Gross Amount:</span>
                        <span className="font-bold text-white">
                          ₹{Number(selectedLeadData.payout.grossCommissionAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-grey block">Net Payable:</span>
                        <span className="font-bold text-emerald-400">
                          ₹{Number(selectedLeadData.payout.netPayoutAmount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* KYC Documents Section */}
                <div className="p-4 rounded-2xl bg-brand-black/60 border border-brand-border/60 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>KYC Verification Documents</span>
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedLeadData.lead.documentVerificationStatus === 'verified'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : selectedLeadData.lead.documentVerificationStatus === 'rejected'
                          ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                          : ['action_required', 'reupload_required'].includes(
                              selectedLeadData.lead.documentVerificationStatus
                            )
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {selectedLeadData.lead.documentVerificationStatus === 'verified'
                        ? 'All Documents Verified'
                        : selectedLeadData.lead.documentVerificationStatus === 'rejected'
                        ? 'Documents Rejected'
                        : ['action_required', 'reupload_required'].includes(
                            selectedLeadData.lead.documentVerificationStatus
                          )
                        ? 'Re-upload Action Required'
                        : 'Verification Pending'}
                    </span>
                  </div>

                  {selectedLeadData.documents?.length === 0 ? (
                    <p className="text-[11px] text-brand-grey italic">No documents attached to this referral.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedLeadData.documents?.map((doc) => (
                        <div
                          key={doc._id}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-white text-xs">{doc.title}</div>
                            <div className="text-[10px] text-brand-grey font-mono mt-0.5">
                              {doc.originalName || doc.fileName}
                            </div>
                            {doc.reuploadReason && (
                              <div className="text-[10px] text-amber-300 mt-1">
                                Note: {doc.reuploadReason}
                              </div>
                            )}
                            {doc.rejectionReason && (
                              <div className="text-[10px] text-brand-red mt-1">
                                Reason: {doc.rejectionReason}
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              doc.verificationStatus === 'verified'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : doc.verificationStatus === 'rejected'
                                ? 'bg-brand-red/15 text-brand-red'
                                : ['reupload_required', 're-upload required'].includes(
                                    doc.verificationStatus
                                  )
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-blue-500/15 text-blue-400'
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Timeline History */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RealCred Operational Audit Trail</span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedLeadData.lead.statusHistory?.map((hist, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-brand-black border border-brand-border/40 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-blue-400">{hist.status}</span>
                          <span className="text-[10px] text-brand-grey">
                            {new Date(hist.changedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-brand-lightGrey">{hist.remarks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
