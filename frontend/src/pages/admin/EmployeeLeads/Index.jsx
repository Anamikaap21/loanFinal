import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Eye, 
  X, 
  ArrowUpRight,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard
} from 'lucide-react';
import adminService from '../../../services/adminService.js';
import loanService from '../../../services/loanService.js';

export default function EmployeeLeads() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [newStatus, setNewStatus] = useState('Lead');
  const [disbursedAmount, setDisbursedAmount] = useState('');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
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
      setError('');
      const params = {
        search,
        status: statusFilter,
        category: categoryFilter,
      };
      if (employeeFilter !== 'all') {
        params.employeeId = employeeFilter;
      }

      const [leadsRes, empRes, catRes] = await Promise.all([
        adminService.getEmployeeLeads(params),
        adminService.getEmployees({ status: 'active' }),
        loanService.getCategories().catch(() => ({ status: 'error', data: [] })),
      ]);

      if (leadsRes.status === 'success') {
        setLeads(leadsRes.data || []);
      }
      if (empRes.status === 'success') {
        setEmployees(empRes.data || []);
      }
      if (catRes.status === 'success') {
        setCategories(catRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load employee leads:', err);
      setError('Unable to fetch employee leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, employeeFilter, categoryFilter, statusFilter]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      await adminService.assignLead(selectedLead._id, {
        employeeId: selectedEmployeeId,
        notes: assignNotes,
      });
      setSuccess(`Lead ${selectedLead.leadId} re-assigned to officer.`);
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
      const payload = {
        status: newStatus,
        remarks: statusRemarks,
      };
      if (newStatus === 'Sanction') {
        payload.sanctionedAmount = Number(sanctionedAmount) || selectedLead.requiredLoanAmount;
      }
      if (newStatus === 'Disbursement') {
        payload.disbursedAmount = Number(disbursedAmount) || selectedLead.requiredLoanAmount;
      }

      await adminService.updateLeadStatus(selectedLead._id, payload);
      setSuccess(`Lead ${selectedLead.leadId} advanced to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update lead status.');
    }
  };

  // Client-side date filter if specified
  const filteredLeads = leads.filter((lead) => {
    if (!dateFilter) return true;
    const leadDate = new Date(lead.createdAt).toISOString().split('T')[0];
    return leadDate === dateFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee Lead Desk • Direct Sourcing</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Employee Leads</h2>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Customer loan applications sourced and submitted by internal loan officers & executives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-brand-border text-right shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-brand-textSecondary font-bold">Total Employee Leads</div>
            <div className="text-xl font-black text-brand-red">{filteredLeads.length}</div>
          </div>
          <button
            onClick={fetchLeads}
            className="p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition shadow-sm"
            title="Refresh Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Multi-Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone, Lead ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          />
        </div>

        {/* Filter by Employee */}
        <div>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Sourcing Employees</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.user?.name || emp.employeeId} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Loan Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Stage */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Lead Stages</option>
            {stages.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Date */}
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            title="Filter by creation date"
          />
        </div>
      </div>

      {/* Main Employee Leads Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[1200px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Lead ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Customer Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Mobile Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Email</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Loan Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Loan Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">KYC Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">City</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Employee Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Employee ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Creation Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Current Stage</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading employee leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-brand-textSecondary">
                    No employee-sourced leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const empName = lead.creatorEmployeeName || lead.creatorEmployee?.user?.name || lead.assignedTo?.user?.name || 'Operations Officer';
                  const empId = lead.creatorEmployeeId || lead.creatorEmployee?.employeeId || lead.assignedTo?.employeeId || 'RCE-LO';
                  const formattedDate = new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={lead._id} className="hover:bg-brand-redLight/20 transition-colors">
                      {/* 1. Lead ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-textPrimary whitespace-nowrap">
                        {lead.leadId}
                      </td>

                      {/* 2. Customer Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-brand-textPrimary">{lead.customerName}</div>
                        {lead.employmentType && (
                          <div className="text-[10px] text-emerald-700 font-medium">
                            {lead.employmentType}
                            {lead.otherEmploymentDetails ? ` (${lead.otherEmploymentDetails})` : ''}
                          </div>
                        )}
                      </td>

                      {/* 3. Mobile Number */}
                      <td className="py-3.5 px-4 font-mono text-brand-textPrimary whitespace-nowrap">
                        {lead.customerPhone}
                      </td>

                      {/* 4. Email */}
                      <td className="py-3.5 px-4 text-brand-textSecondary whitespace-nowrap">
                        {lead.customerEmail || <span className="italic text-brand-textSecondary/60">Not provided</span>}
                      </td>

                      {/* 5. Loan Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-brand-textPrimary">
                          {lead.loanCategory?.name || lead.categoryName || 'General Facility'}
                        </span>
                      </td>

                      {/* 6. Loan Amount */}
                      <td className="py-3.5 px-4 font-bold text-emerald-700 whitespace-nowrap">
                        ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                      </td>

                      {/* KYC Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          lead.documentVerificationStatus === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : lead.documentVerificationStatus === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
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

                      {/* 7. City */}
                      <td className="py-3.5 px-4 text-brand-textSecondary whitespace-nowrap">
                        {lead.city}
                      </td>

                      {/* 8. Employee Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-brand-textPrimary">{empName}</div>
                      </td>

                      {/* 9. Employee ID */}
                      <td className="py-3.5 px-4 font-mono text-brand-textSecondary whitespace-nowrap">
                        {empId}
                      </td>

                      {/* 10. Lead Creation Date */}
                      <td className="py-3.5 px-4 text-brand-textSecondary whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* 11. Current Stage */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : lead.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-brand-bg text-brand-textPrimary border border-brand-border'
                        }`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border transition shadow-sm"
                          title="View Lead File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setSelectedEmployeeId(lead.assignedTo?._id || lead.creatorEmployee?._id || '');
                            setAssignNotes('');
                            setAssignModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-white hover:bg-brand-bg text-brand-textPrimary border border-brand-border text-[11px] font-medium transition shadow-sm"
                          title="Assign Officer"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setNewStatus(lead.status);
                            setSanctionedAmount(lead.sanctionedAmount || lead.requiredLoanAmount);
                            setDisbursedAmount(lead.disbursedAmount || lead.requiredLoanAmount);
                            setStatusRemarks('');
                            setStatusModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-brand-red hover:bg-brand-deepRed text-white text-[11px] font-bold transition shadow-sm"
                          title="Advance Stage"
                        >
                          Advance
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DETAIL VIEW MODAL */}
      {detailModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-brand-border p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-brand-red">{selectedLead.leadId}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-redLight text-brand-red border border-brand-red/20 uppercase">
                    Employee Sourced
                  </span>
                </div>
                <h3 className="text-lg font-bold text-brand-textPrimary mt-1">{selectedLead.customerName}</h3>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 rounded-xl bg-brand-bg hover:bg-brand-border text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Customer Mobile</span>
                <span className="font-mono text-brand-textPrimary font-medium">{selectedLead.customerPhone}</span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Email Address</span>
                <span className="text-brand-textPrimary font-medium">{selectedLead.customerEmail || 'N/A'}</span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Employment Type</span>
                <span className="text-brand-textPrimary font-medium">
                  {selectedLead.employmentType}
                  {selectedLead.otherEmploymentDetails ? ` (${selectedLead.otherEmploymentDetails})` : ''}
                </span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">City</span>
                <span className="text-brand-textPrimary font-medium">{selectedLead.city}</span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Loan Category</span>
                <span className="text-brand-textPrimary font-medium">
                  {selectedLead.loanCategory?.name || selectedLead.categoryName || 'General Facility'}
                </span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Required Amount</span>
                <span className="text-emerald-700 font-bold text-sm">
                  ₹{Number(selectedLead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Sourcing Officer</span>
                <span className="text-brand-textPrimary font-semibold">
                  {selectedLead.creatorEmployeeName || selectedLead.creatorEmployee?.user?.name || 'Loan Officer'}
                </span>
                <span className="text-[10px] text-brand-textSecondary block mt-0.5">
                  ID: {selectedLead.creatorEmployeeId || selectedLead.creatorEmployee?.employeeId || 'N/A'}
                </span>
              </div>
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border">
                <span className="text-brand-textSecondary block mb-1">Assigned Processing Officer</span>
                <span className="text-brand-textPrimary font-semibold">
                  {selectedLead.assignedTo?.user?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            {selectedLead.remarks && (
              <div className="bg-brand-bg p-3.5 rounded-xl border border-brand-border text-xs">
                <span className="text-brand-textSecondary block mb-1">Officer Notes / Remarks:</span>
                <p className="text-brand-textPrimary leading-relaxed">{selectedLead.remarks}</p>
              </div>
            )}

            {/* Lifecycle History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">Lifecycle History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedLead.statusHistory || []).map((h, idx) => (
                  <div key={idx} className="bg-brand-bg p-2.5 rounded-xl border border-brand-border text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-brand-textPrimary">{h.status}</span>
                      {h.remarks && <p className="text-[11px] text-brand-textSecondary mt-0.5">{h.remarks}</p>}
                    </div>
                    <div className="text-right text-[10px] text-brand-textSecondary">
                      <div>{h.changedByName || 'System'}</div>
                      <div>{new Date(h.changedAt).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-brand-border">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border transition"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN OFFICER MODAL */}
      {assignModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-textPrimary">Assign Operations Officer</h3>
              <button onClick={() => setAssignModalOpen(false)} className="text-brand-textSecondary hover:text-brand-textPrimary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-brand-textSecondary">
              Select an active loan officer to process file <span className="font-mono text-brand-red font-bold">{selectedLead.leadId}</span>.
            </p>
            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-textPrimary font-semibold mb-1">Operations Officer</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                >
                  <option value="">Select an officer</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.user?.name} ({emp.employeeId} - {emp.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-brand-textPrimary font-semibold mb-1">Assignment Remarks</label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Instructions for the assigned officer..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary placeholder:text-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-brand-bg border border-brand-border text-brand-textPrimary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold shadow-md shadow-brand-red/20"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADVANCE STAGE MODAL */}
      {statusModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl border border-brand-border p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-base font-bold text-brand-textPrimary">Advance Lifecycle Stage</h3>
              <button onClick={() => setStatusModalOpen(false)} className="text-brand-textSecondary hover:text-brand-textPrimary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-brand-textSecondary">
              Update stage for <span className="font-mono text-brand-red font-bold">{selectedLead.leadId}</span> ({selectedLead.customerName}).
            </p>
            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-textPrimary font-semibold mb-1">Target Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                >
                  {stages.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'Sanction' && (
                <div>
                  <label className="block text-brand-textPrimary font-semibold mb-1">Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    value={sanctionedAmount}
                    onChange={(e) => setSanctionedAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              )}

              {newStatus === 'Disbursement' && (
                <div>
                  <label className="block text-brand-textPrimary font-semibold mb-1">Disbursed Amount (₹)</label>
                  <input
                    type="number"
                    value={disbursedAmount}
                    onChange={(e) => setDisbursedAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              )}

              <div>
                <label className="block text-brand-textPrimary font-semibold mb-1">Status Update Remarks</label>
                <textarea
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Notes explaining this stage transition..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary placeholder:text-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-brand-bg border border-brand-border text-brand-textPrimary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold shadow-md shadow-brand-red/20"
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
