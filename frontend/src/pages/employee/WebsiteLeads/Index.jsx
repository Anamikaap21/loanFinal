import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X, 
  GitBranch, 
  Eye,
  FileCheck 
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';

export default function EmployeeWebsiteLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Modal
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
      const res = await employeeService.getAssignedWebsiteLeads({ search, status: statusFilter });
      if (res.status === 'success') {
        setLeads(res.data);
      }
    } catch (err) {
      console.error('Failed to load assigned website leads:', err);
      setError('Unable to fetch your assigned website files.');
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
      if (newStatus === 'Sanction' && sanctionedAmount) {
        payload.sanctionedAmount = Number(sanctionedAmount);
      }
      if (newStatus === 'Disbursement') {
        payload.disbursedAmount = Number(disbursedAmount) || selectedLead.requiredLoanAmount;
      }

      await employeeService.updateLeadStatus(selectedLead._id, payload);
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
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Website Direct Customer Desk</span>
        </div>
        <h2 className="text-2xl font-black text-white">Assigned Website Leads</h2>
        <p className="text-xs text-brand-grey">
          Customer loan inquiries submitted directly via realcred.in and assigned to your desk for bank login & sanction.
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Customer, Phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <div className="text-xs text-brand-grey whitespace-nowrap">
            Assigned: <span className="text-white font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3.5 px-4 min-w-[150px]">Customer Details</th>
                <th className="py-3.5 px-4">Loan Facility</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Required (INR)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">KYC Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Current Stage</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading assigned website leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    No website customer leads currently assigned to your desk.
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
                      <div className="text-[11px] text-brand-grey">{lead.customerPhone} • {lead.city}</div>
                      {lead.employmentType && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {lead.employmentType}
                          {lead.otherEmploymentDetails ? ` (${lead.otherEmploymentDetails})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{lead.loanCategory?.name || 'Loan'}</div>
                      <div className="text-[10px] text-brand-grey">Bank: {lead.preferredBank?.name || 'Best Match'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
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
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : lead.status === 'Cancelled'
                          ? 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        to={`/employee/lead-processing?id=${lead._id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-brand-lightGrey hover:text-white border border-brand-border text-[11px] font-semibold transition"
                      >
                        <Eye className="w-3 h-3 text-blue-400" />
                        <span>Process File</span>
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNewStatus(lead.status);
                          setSanctionedAmount(lead.sanctionedAmount || lead.requiredLoanAmount);
                          setDisbursedAmount(lead.disbursedAmount || lead.requiredLoanAmount);
                          setStatusRemarks('');
                          setStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/30 text-[11px] font-semibold transition"
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

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Advance Stage</h3>
            <p className="text-xs text-brand-grey mb-4">
              File: <span className="font-mono text-blue-400 font-bold">{selectedLead?.leadId}</span> ({selectedLead?.customerName})
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Lifecycle Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {newStatus === 'Disbursement' && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">
                    Disbursed Loan Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={disbursedAmount}
                    onChange={(e) => setDisbursedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-black border border-emerald-500/40 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Processing Remarks / Bank Reference
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. KYC verified. Bank portal application submitted..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
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
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20"
                >
                  Confirm Stage Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
