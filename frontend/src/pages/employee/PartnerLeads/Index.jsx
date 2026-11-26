import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Network, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Briefcase, 
  X, 
  GitBranch,
  Eye 
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';

export default function EmployeePartnerLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Progression Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('Lead');
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
      const res = await employeeService.getAssignedPartnerLeads({ search, status: statusFilter });
      if (res.status === 'success') {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner leads:', err);
      setError('Unable to fetch your assigned partner referral files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        status: newStatus,
        remarks: statusRemarks,
      };
      if (newStatus === 'Disbursement') {
        payload.disbursedAmount = Number(disbursedAmount) || selectedLead.requiredLoanAmount;
      }

      await employeeService.updateLeadStatus(selectedLead._id, payload);
      setSuccess(`Partner file ${selectedLead.leadId} advanced. Payout eligibility auto-triggered.`);
      setStatusModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Status error:', err);
      setError(err.response?.data?.message || 'Failed to update stage.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
          <Network className="w-3.5 h-3.5" />
          <span>Channel Partner DSA Files</span>
        </div>
        <h2 className="text-2xl font-black text-brand-textPrimary">Assigned Partner Leads</h2>
        <p className="text-xs text-brand-textSecondary">
          Channel partner borrower referrals assigned to your operations desk. Progress files through bank sanction to disbursement.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-700">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Borrower, Partner..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <div className="text-xs text-brand-textSecondary whitespace-nowrap">
            Assigned: <span className="text-brand-textPrimary font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[950px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3.5 px-4 min-w-[150px]">Referring Partner</th>
                <th className="py-3.5 px-4 min-w-[150px]">Borrower Name & Contact</th>
                <th className="py-3.5 px-4">Loan Facility</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">KYC Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Stage</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Payout Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading assigned partner referrals...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-textSecondary">
                    No partner referrals currently assigned to your desk.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-textPrimary">
                      {lead.leadId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-textPrimary">
                        {lead.partnerId?.user?.name || lead.partnerId?.businessName || 'DSA Partner'}
                      </div>
                      <span className="font-mono text-[10px] text-brand-red bg-brand-redLight px-1.5 py-0.5 rounded font-semibold border border-brand-red/20">
                        {lead.partnerId?.partnerCode || 'RCP-PARTNER'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-textPrimary">{lead.customerName}</div>
                      <div className="text-[11px] text-brand-textSecondary">{lead.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-textPrimary">
                      {lead.loanCategory?.name || 'General Loan'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        lead.documentVerificationStatus === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : lead.documentVerificationStatus === 'rejected'
                          ? 'bg-brand-redLight text-brand-red border-brand-red/25'
                          : ['action_required', 'reupload_required'].includes(lead.documentVerificationStatus)
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
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
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lead.status === 'Cancelled'
                          ? 'bg-brand-redLight text-brand-red border border-brand-red/30'
                          : 'bg-brand-bg text-brand-textPrimary border border-brand-border'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.payoutStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : lead.isEligibleForPayout
                          ? 'bg-brand-redLight text-brand-red border border-brand-red/20'
                          : 'text-brand-textSecondary'
                      }`}>
                        {lead.payoutStatus === 'completed' ? 'Paid' : lead.isEligibleForPayout ? 'Eligible' : 'Pending Disb.'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/employee/lead-processing?id=${lead._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-bg hover:bg-brand-border/60 text-brand-textPrimary border border-brand-border text-[11px] font-semibold transition"
                      >
                        <Eye className="w-3 h-3 text-brand-red" />
                        <span>Process File</span>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNewStatus(lead.status);
                          setDisbursedAmount(lead.disbursedAmount || lead.requiredLoanAmount);
                          setStatusRemarks('');
                          setStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-redLight hover:bg-brand-red hover:text-white text-brand-red border border-brand-red/25 text-[11px] font-semibold transition"
                      >
                        Advance Stage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STAGE MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-textPrimary mb-1">Advance Partner File</h3>
            <p className="text-xs text-brand-textSecondary mb-4">
              File: <span className="font-mono text-brand-red font-bold">{selectedLead?.leadId}</span>
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Lifecycle Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'Disbursement' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <label className="block text-xs font-semibold text-emerald-800 mb-1">
                    Disbursed Amount (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={disbursedAmount}
                    onChange={(e) => setDisbursedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                  <p className="text-[10px] text-emerald-600 mt-1">
                    *Advancing to Disbursement automatically logs commission payout eligibility for partner {selectedLead?.partnerId?.partnerCode}.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Underwriter Notes
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Sanction letter issued by ICICI Bank. Agreement signed..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm"
                >
                  Update Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
