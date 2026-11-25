import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  MessageSquare, 
  X 
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function SupportDesk() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resolution Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [newStatus, setNewStatus] = useState('completed');
  const [remarks, setRemarks] = useState('');

  const fetchCallbacks = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCallbacks({ status: statusFilter });
      if (res.status === 'success') {
        setCallbacks(res.data);
      }
    } catch (err) {
      console.error('Failed to load callbacks:', err);
      setError('Unable to fetch callback requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
  }, [statusFilter]);

  const handleResolve = async (e) => {
    e.preventDefault();

    try {
      await adminService.updateCallback(selectedCallback._id, {
        status: newStatus,
        remarks,
      });
      setSuccess(`Callback request ${selectedCallback.requestNumber} updated.`);
      setModalOpen(false);
      fetchCallbacks();
    } catch (err) {
      console.error('Resolve callback error:', err);
      setError('Failed to update callback request.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Customer Advisory Inquiries</span>
        </div>
        <h2 className="text-2xl font-black text-white">Support & Callbacks Desk</h2>
        <p className="text-xs text-brand-grey">
          Customer callback requests scheduled via the public website. Track preferred contact time slots and resolution notes.
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
      <div className="flex justify-between items-center bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          <option value="all">All Inquiries</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="text-xs text-brand-grey">
          Total Requests: <span className="text-white font-bold">{callbacks.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Request Ref</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Loan Interest</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Preferred Time Window</th>
                <th className="py-3.5 px-4 max-w-xs">Customer Note</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading callback inquiries...
                  </td>
                </tr>
              ) : callbacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    No callback inquiries found.
                  </td>
                </tr>
              ) : (
                callbacks.map((cb) => (
                  <tr key={cb._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {cb.requestNumber}
                      <div className="text-[10px] text-brand-grey font-sans font-normal">
                        {new Date(cb.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{cb.customerName}</div>
                      <div className="text-[11px] text-brand-grey">{cb.mobileNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {cb.loanType || 'General Inquiry'}
                    </td>
                    <td className="py-3.5 px-4 text-brand-lightGrey">
                      {cb.preferredContactTime || 'Anytime'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-brand-grey">
                      {cb.message || 'No additional note'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        cb.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : cb.status === 'contacted'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : cb.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {cb.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedCallback(cb);
                          setNewStatus(cb.status === 'pending' ? 'completed' : cb.status);
                          setRemarks(cb.remarks || '');
                          setModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-brand-card hover:bg-white/10 text-white border border-brand-border text-[11px] font-semibold transition"
                      >
                        Resolve
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

            <h3 className="text-base font-bold text-white mb-1">Resolve Callback Request</h3>
            <p className="text-xs text-brand-grey mb-4">
              Customer: <span className="text-white font-bold">{selectedCallback?.customerName}</span> ({selectedCallback?.mobileNumber})
            </p>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted (Follow-up scheduled)</option>
                  <option value="completed">Completed (Lead file logged)</option>
                  <option value="cancelled">Cancelled (Not interested / wrong number)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Resolution Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Spoke with customer. Explained Home Loan eligibility. Loan application submitted..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-card border border-brand-border text-xs font-semibold text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
