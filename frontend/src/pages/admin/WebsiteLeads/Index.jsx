import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowUpRight, 
  X, 
  GitBranch 
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function WebsiteLeads() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [newStatus, setNewStatus] = useState('Lead');
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
        adminService.getWebsiteLeads({ search, status: statusFilter }),
        adminService.getEmployees({ status: 'active' }),
      ]);
      if (leadsRes.status === 'success') {
        setLeads(leadsRes.data);
      }
      if (empRes.status === 'success') {
        setEmployees(empRes.data);
      }
    } catch (err) {
      console.error('Failed to load website leads:', err);
      setError('Unable to fetch website leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      await adminService.assignLead(selectedLead._id, {
        employeeId: selectedEmployeeId,
        notes: assignNotes,
      });
      setSuccess(`Lead ${selectedLead.leadId} assigned successfully.`);
      setAssignModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Assign error:', err);
      setError(err.response?.data?.message || 'Failed to assign lead.');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    try {
      await adminService.updateLeadStatus(selectedLead._id, {
        status: newStatus,
        remarks: statusRemarks,
      });
      setSuccess(`Lead ${selectedLead.leadId} status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Direct Website Inquiries</span>
        </div>
        <h2 className="text-2xl font-black text-white">Website Leads Desk</h2>
        <p className="text-xs text-brand-grey">
          Customer applications submitted directly via realcred.in. Strictly isolated from channel partners with no partner association or payout eligibility.
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

      {/* Filter Strip */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Lead ID, Customer Name, Phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Lifecycle Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <div className="text-xs text-brand-grey whitespace-nowrap">
            Count: <span className="text-white font-bold">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[920px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3.5 px-4 min-w-[180px]">Customer Details</th>
                <th className="py-3.5 px-4">Loan Facility</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Required Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">KYC Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Stage</th>
                <th className="py-3.5 px-4">Assigned Officer</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading website leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No direct website applications found.
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
                        {lead.customerPhone} {lead.city ? `• ${lead.city}` : ''}
                      </div>
                      {lead.employmentType && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          {lead.employmentType}
                          {lead.otherEmploymentDetails ? ` (${lead.otherEmploymentDetails})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">
                        {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                      </div>
                      <div className="text-[10px] text-brand-grey">
                        Pref: {lead.preferredBank?.name || lead.bankName || 'Any Suitable'}
                      </div>
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
                          : 'bg-white/10 text-white border border-white/20'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.assignedTo?.user?.name ? (
                        <div className="text-white font-medium">{lead.assignedTo.user.name}</div>
                      ) : (
                        <span className="text-brand-grey italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setSelectedEmployeeId(lead.assignedTo?._id || '');
                          setAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-card hover:bg-white/10 text-white border border-brand-border text-[11px] font-semibold transition"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNewStatus(lead.status);
                          setStatusRemarks('');
                          setStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-red/10 hover:bg-brand-red hover:text-white text-brand-red border border-brand-red/30 text-[11px] font-semibold transition"
                      >
                        Update Stage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ASSIGN MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Assign Lead to Loan Officer</h3>
            <p className="text-xs text-brand-grey mb-4">
              Lead: <span className="font-mono text-brand-red font-bold">{selectedLead?.leadId}</span> ({selectedLead?.customerName})
            </p>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Select Loan Officer
                </label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="">-- Choose Officer --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name} ({emp.employeeId} - {emp.assignedLeadsCount || 0} active files)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Assignment Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Call client, collect 6-month bank statements..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-card border border-brand-border text-xs font-semibold text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <h3 className="text-base font-bold text-white mb-1">Update Lifecycle Stage</h3>
            <p className="text-xs text-brand-grey mb-4">
              Lead: <span className="font-mono text-brand-red font-bold">{selectedLead?.leadId}</span>
            </p>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Progression Stage
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

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Status Remarks / Underwriter Notes
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Sanction letter received from HDFC Bank. Property legal search initiated..."
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
                  Save Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
