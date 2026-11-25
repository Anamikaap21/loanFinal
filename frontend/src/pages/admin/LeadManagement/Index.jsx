import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Search, 
  Filter, 
  UserCheck, 
  CheckCircle, 
  AlertCircle, 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Lead Detail / History Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [leadDetail, setLeadDetail] = useState(null);

  // Status Progression Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('Lead');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [disbursedAmount, setDisbursedAmount] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

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
      const [leadsRes, empRes] = await Promise.all([
        adminService.getLeads({ search, source: sourceFilter, status: statusFilter }),
        adminService.getEmployees({ status: 'active' }),
      ]);
      if (leadsRes.status === 'success') {
        setLeads(leadsRes.data);
      }
      if (empRes.status === 'success') {
        setEmployees(empRes.data);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
      setError('Unable to fetch lead pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, sourceFilter, statusFilter]);

  const viewLeadDetail = async (leadId) => {
    try {
      const res = await adminService.getLeadById(leadId);
      if (res.status === 'success') {
        setLeadDetail(res.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
      setError('Failed to fetch file details.');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        status: newStatus,
        remarks: statusRemarks,
      };
      if (newStatus === 'Sanction' && sanctionedAmount) {
        payload.sanctionedAmount = Number(sanctionedAmount);
      }
      if (newStatus === 'Disbursement') {
        payload.disbursedAmount = Number(disbursedAmount) || selectedLead.requiredLoanAmount;
      }

      await adminService.updateLeadStatus(selectedLead._id, payload);
      setSuccess(`Lead ${selectedLead.leadId} progressed to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Status error:', err);
      setError(err.response?.data?.message || 'Failed to update stage.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Unified Enterprise Pipeline</span>
        </div>
        <h2 className="text-2xl font-black text-white">Lead Management & 8-Stage Tracker</h2>
        <p className="text-xs text-brand-grey">
          Master loan pipeline overseeing Lead, Login, In Process, Sanction, Disbursement, PDD, Payout, and Cancelled stages.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Customer Name, Phone, City..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Sources (Web, Employee & Partner)</option>
            <option value="website">Direct Website Inquiries</option>
            <option value="employee">Employee Generated Leads</option>
            <option value="partner">Channel Partner Referrals</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All 8 Lifecycle Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Leads Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-4 px-5 whitespace-nowrap">Lead ID</th>
                <th className="py-4 px-5 min-w-[180px]">Customer Details</th>
                <th className="py-4 px-5 whitespace-nowrap">Origin Source</th>
                <th className="py-4 px-5">Loan Category</th>
                <th className="py-4 px-5 whitespace-nowrap">Amount</th>
                <th className="py-4 px-5 whitespace-nowrap">KYC Status</th>
                <th className="py-4 px-5 whitespace-nowrap">Stage</th>
                <th className="py-4 px-5">Assigned Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading pipeline...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-white whitespace-nowrap">
                      {lead.leadId}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white text-sm">{lead.customerName}</div>
                      <div className="text-xs text-brand-grey">{lead.customerPhone}</div>
                      {lead.employmentType && (
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          {lead.employmentType}
                          {lead.otherEmploymentDetails ? ` (${lead.otherEmploymentDetails})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.source === 'website'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : lead.source === 'employee'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-medium text-brand-lightGrey">
                        {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-bold text-white text-sm whitespace-nowrap">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        lead.documentVerificationStatus === 'verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : lead.documentVerificationStatus === 'rejected'
                          ? 'bg-brand-red/10 text-brand-red border-brand-red/25'
                          : ['action_required', 'reupload_required'].includes(lead.documentVerificationStatus)
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                      }`}>
                        {lead.documentVerificationStatus === 'verified'
                          ? 'Verified'
                          : lead.documentVerificationStatus === 'rejected'
                          ? 'Rejected'
                          : ['action_required', 'reupload_required'].includes(lead.documentVerificationStatus)
                          ? 'Action Req.'
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${
                        ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : lead.status === 'Cancelled'
                          ? 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {lead.assignedTo?.user?.name ? (
                        <div className="text-white font-medium">{lead.assignedTo.user.name}</div>
                      ) : (
                        <span className="text-brand-grey italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DETAIL & HISTORY MODAL */}
      {detailModalOpen && leadDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDetailModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-brand-red bg-brand-red/10 px-2 py-0.5 rounded">
                {leadDetail.lead.leadId}
              </span>
              <span className="text-xs text-brand-grey uppercase">• {leadDetail.lead.source} Origin</span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4">
              {leadDetail.lead.customerName}
            </h3>

            {/* Snapshot Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
              <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
                <span className="text-brand-grey">Loan Facility</span>
                <div className="font-bold text-white mt-0.5">{leadDetail.lead.loanCategory?.name || 'Loan'}</div>
              </div>
              <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
                <span className="text-brand-grey">Amount</span>
                <div className="font-bold text-emerald-400 mt-0.5">
                  ₹{Number(leadDetail.lead.requiredLoanAmount).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
                <span className="text-brand-grey">Preferred Bank</span>
                <div className="font-bold text-white mt-0.5">{leadDetail.lead.preferredBank?.name || 'Any'}</div>
              </div>
              <div className="p-3 rounded-xl bg-brand-black border border-brand-border">
                <span className="text-brand-grey">Current Stage</span>
                <div className="font-bold text-brand-red mt-0.5">{leadDetail.lead.status}</div>
              </div>
            </div>

            {/* Audit Trail / Status Progression History */}
            <div className="space-y-3 pt-3 border-t border-brand-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Lifecycle Progression History
              </h4>
              <div className="space-y-2">
                {leadDetail.lead.statusHistory?.map((hist, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-brand-black/60 border border-brand-border/60 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white">{hist.status}</span>
                      <span className="text-[10px] text-brand-grey">{new Date(hist.changedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-brand-lightGrey text-[11px]">{hist.remarks || 'Stage updated'}</p>
                    <div className="text-[10px] text-brand-grey mt-1">
                      Updated by: {hist.changedByName || 'System'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-card border border-brand-border text-xs font-semibold text-white hover:bg-white/5 transition"
              >
                Close File Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCE STATUS MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Advance Pipeline Stage</h3>
            <p className="text-xs text-brand-grey mb-4">
              Lead: <span className="font-mono text-brand-red font-bold">{selectedLead?.leadId}</span>
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Select Next Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'Sanction' && (
                <div>
                  <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                    Sanctioned Loan Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={sanctionedAmount}
                    onChange={(e) => setSanctionedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              )}

              {newStatus === 'Disbursement' && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Final Disbursed Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={disbursedAmount}
                    onChange={(e) => setDisbursedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Officer Remarks / Documentation Notes
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Sanction letter issued by HDFC Bank. Bank legal check clear..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-card border border-brand-border text-xs font-semibold text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition"
                >
                  Update Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
