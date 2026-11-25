import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Percent, 
  TrendingUp, 
  Building2, 
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService from '../../../services/adminService.js';

export default function PartnerManagement() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    panNumber: '',
    defaultCommissionRate: 1.5,
    accountStatus: 'active',
    notes: '',
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPartners({ search });
      if (res.status === 'success') {
        setPartners(res.data);
      }
    } catch (err) {
      console.error('Failed to load partners:', err);
      setError('Failed to fetch channel partner network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [search]);

  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      businessName: partner.businessName || '',
      panNumber: partner.panNumber || '',
      defaultCommissionRate: partner.defaultCommissionRate || 1.5,
      accountStatus: partner.accountStatus,
      notes: partner.notes || '',
    });
    setModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await adminService.updatePartner(editingPartner._id, {
        businessName: formData.businessName.trim(),
        panNumber: formData.panNumber.trim().toUpperCase(),
        defaultCommissionRate: Number(formData.defaultCommissionRate),
        accountStatus: formData.accountStatus,
        notes: formData.notes.trim(),
      });

      setSuccess(`Partner '${editingPartner.partnerCode}' updated successfully.`);
      setModalOpen(false);
      fetchPartners();
    } catch (err) {
      console.error('Update partner error:', err);
      setError(err.response?.data?.message || 'Failed to update partner details.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Channel Partner & DSA Network</span>
          </div>
          <h2 className="text-2xl font-black text-white">Partner Management</h2>
          <p className="text-xs text-brand-grey">
            Monitor registered Direct Selling Agents (DSA), verify PAN/GST credentials, set custom commission slabs, and inspect referral performance.
          </p>
        </div>

        <Link
          to="/admin/partner-verification"
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Partner Verification Desk</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
        </Link>
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

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by partner code, name, PAN..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div className="text-xs text-brand-grey">
          Total Partners: <span className="text-white font-bold">{partners.length}</span>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Partner Code & Name</th>
                <th className="py-3.5 px-4">Agency / Business</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 whitespace-nowrap">PAN Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Commission Slab</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Performance</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading channel partner network...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No channel partners found matching criteria.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{partner.user?.name || 'Partner'}</div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-brand-red bg-brand-red/10 px-2 py-0.5 rounded font-bold">
                          {partner.partnerCode}
                        </span>
                        {partner.registrationId && (
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                            {partner.registrationId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{partner.businessName || 'Individual Freelancer'}</div>
                      <div className="text-[11px] text-brand-grey">{partner.address?.city || 'India'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-brand-lightGrey">{partner.user?.email}</div>
                      <div className="text-[11px] text-brand-grey">{partner.user?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {partner.panNumber || 'Pending'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-brand-black border border-brand-border text-emerald-400 font-bold text-xs">
                        {partner.defaultCommissionRate || 1.5}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-semibold">
                        ₹{Number(partner.totalDisbursedAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-brand-grey">
                        {partner.totalLeadsSubmitted || 0} Files Submitted
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        partner.accountStatus === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {partner.accountStatus === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(partner)}
                        className="px-2.5 py-1 rounded-lg bg-brand-card hover:bg-white/10 text-brand-lightGrey hover:text-white border border-brand-border text-[11px] font-semibold transition"
                      >
                        Edit Slab
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              Configure Channel Partner
            </h3>
            <p className="text-xs text-brand-grey mb-6">
              Partner Code: <span className="text-brand-red font-mono font-bold">{editingPartner?.partnerCode}</span>
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Business / Agency Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Apex Financial Solutions"
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs uppercase font-mono focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Default Commission Rate (% of Disbursed Loan)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    value={formData.defaultCommissionRate}
                    onChange={(e) => setFormData({ ...formData, defaultCommissionRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                  <span className="absolute right-3.5 top-2 text-xs text-brand-grey font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Account Status
                </label>
                <select
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="active">Active (Full submission & payout access)</option>
                  <option value="suspended">Suspended (Temporarily frozen)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-lightGrey mb-1">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. VIP channel partner approved for expedited payouts..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-card border border-brand-border text-xs font-semibold text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/20"
                >
                  Save Partner Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
