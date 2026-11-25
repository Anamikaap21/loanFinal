import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  User,
  Calendar,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';

export default function EmployeeSupportDesk() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resolution Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('contacted');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCallbacks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await employeeService.getAssignedCallbacks(params);
      if (res.status === 'success') {
        setCallbacks(res.data);
      }
    } catch (err) {
      console.error('Failed to load callbacks:', err);
      setError('Unable to load assigned customer inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
  }, [statusFilter]);

  const handleUpdateCallback = async (e) => {
    e.preventDefault();
    if (!selectedCallback) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await employeeService.updateCallback(selectedCallback._id, {
        status: updateStatus,
        remarks: remarks.trim(),
      });

      setSuccess(`Inquiry for ${selectedCallback.name} marked as "${updateStatus}".`);
      setModalOpen(false);
      fetchCallbacks();
    } catch (err) {
      console.error('Update callback error:', err);
      setError(err.response?.data?.message || 'Failed to update callback.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCallbacks = callbacks.filter((cb) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      cb.name?.toLowerCase().includes(term) ||
      cb.phone?.toLowerCase().includes(term) ||
      cb.loanCategory?.toLowerCase().includes(term)
    );
  });

  const pendingCount = callbacks.filter((c) => c.status === 'pending').length;
  const contactedCount = callbacks.filter((c) => c.status === 'contacted').length;
  const completedCount = callbacks.filter((c) => c.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Customer Relationship & Tele-Calling Desk</span>
        </div>
        <h2 className="text-2xl font-black text-white">Support & Callback Requests</h2>
        <p className="text-xs text-brand-grey">
          Customer callback inquiries from realcred.in assigned to your desk for telephonic consultation and loan onboarding.
        </p>
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

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-brand-grey hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-brand-dark border border-brand-border/60">
          <div className="text-[10px] uppercase font-bold text-brand-grey">Total Inquiries</div>
          <div className="text-2xl font-black text-white mt-1">{callbacks.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-brand-dark border border-amber-500/30">
          <div className="text-[10px] uppercase font-bold text-amber-400">Pending Call</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-brand-dark border border-blue-500/30">
          <div className="text-[10px] uppercase font-bold text-blue-400">Contacted</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{contactedCount}</div>
        </div>
        <div className="p-4 rounded-2xl bg-brand-dark border border-emerald-500/30">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Resolved & Closed</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Inquiry Statuses</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-xs text-brand-grey whitespace-nowrap">
            Showing: <span className="text-white font-bold">{filteredCallbacks.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 min-w-[150px]">Customer Details</th>
                <th className="py-3.5 px-4">Product of Interest</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Preferred Slot</th>
                <th className="py-3.5 px-4 max-w-xs">Customer Message</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading assigned customer inquiries...
                  </td>
                </tr>
              ) : filteredCallbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-grey">
                    No callback requests found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredCallbacks.map((cb) => (
                  <tr key={cb._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{cb.name}</div>
                      <div className="text-[11px] text-blue-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <PhoneCall className="w-3 h-3" />
                        <span>{cb.phone}</span>
                      </div>
                      {cb.email && (
                        <div className="text-[10px] text-brand-grey">{cb.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {cb.loanCategory || 'General Loan'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{cb.preferredTimeSlot || 'Anytime'}</div>
                      <div className="text-[10px] text-brand-grey">
                        {new Date(cb.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-brand-grey" title={cb.message}>
                        {cb.message || 'Customer requested a callback regarding loan details.'}
                      </p>
                      {cb.remarks && (
                        <div className="text-[10px] text-emerald-400 mt-1">
                          Officer Note: {cb.remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                          cb.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : cb.status === 'contacted'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : cb.status === 'cancelled'
                            ? 'bg-brand-red/15 text-brand-red border border-brand-red/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {cb.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCallback(cb);
                          setUpdateStatus(cb.status || 'contacted');
                          setRemarks(cb.remarks || '');
                          setModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-600/30 text-[11px] font-semibold transition"
                      >
                        Update / Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Update Callback Inquiry</h3>
            <p className="text-xs text-brand-grey mb-4">
              Customer: <span className="text-white font-bold">{selectedCallback?.name}</span> ({selectedCallback?.phone})
            </p>

            <form onSubmit={handleUpdateCallback} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending (Call not placed)</option>
                  <option value="contacted">Contacted (In discussion / file requested)</option>
                  <option value="completed">Completed (Resolved / Applied for loan)</option>
                  <option value="cancelled">Cancelled (Not interested / Invalid number)</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Call Resolution Notes / Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record customer response, requirement, or appointment details..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
