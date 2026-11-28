import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  X,
  AlertTriangle
} from 'lucide-react';
import adminService from '../../../services/adminService.js';
import { getVerifiedBankLogo } from '../../../utils/bankLogos.js';

export default function BankManagement() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bankCode: '',
    logoUrl: '',
    description: '',
    category: 'Private Banks',
    roi: '',
    maxLTV: '',
    maxTenure: '',
    processingTime: '',
    contactPerson: '',
    email: '',
    phone: '',
    minROI: 8.5,
    maxROI: 14.5,
    maxTenureMonths: 360,
    processingFee: 'Up to 1% + GST',
    status: 'active',
  });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const res = await adminService.getBanks({ search, status: statusFilter, category: categoryFilter });
      if (res.status === 'success') {
        setBanks(res.data);
      }
    } catch (err) {
      console.error('Failed to load banks:', err);
      setError(err.response?.data?.message || 'Failed to fetch banking partners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, [search, statusFilter, categoryFilter]);

  const openCreateModal = () => {
    setEditingBank(null);
    setFormData({
      name: '',
      bankCode: '',
      logoUrl: '',
      description: '',
      category: 'Private Banks',
      roi: '',
      maxLTV: '',
      maxTenure: '',
      processingTime: '',
      contactPerson: '',
      email: '',
      phone: '',
      minROI: 8.5,
      maxROI: 14.5,
      maxTenureMonths: 360,
      processingFee: 'Up to 1% + GST',
      status: 'active',
    });
    setModalOpen(true);
  };

  const openEditModal = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name,
      bankCode: bank.bankCode,
      logoUrl: bank.logoUrl || '',
      description: bank.description || '',
      category: bank.category || 'Private Banks',
      roi: bank.roi || '',
      maxLTV: bank.maxLTV || '',
      maxTenure: bank.maxTenure || '',
      processingTime: bank.processingTime || '',
      contactPerson: bank.contactDetails?.contactPerson || '',
      email: bank.contactDetails?.email || '',
      phone: bank.contactDetails?.phone || '',
      minROI: bank.interestRateRange?.min ?? 8.5,
      maxROI: bank.interestRateRange?.max ?? 14.5,
      maxTenureMonths: bank.maxTenureMonths ?? 360,
      processingFee: bank.processingFeeDetails || 'Up to 1% + GST',
      status: bank.status || 'active',
    });
    setModalOpen(true);
  };

  const openDeleteModal = (bank) => {
    setBankToDelete(bank);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.bankCode.trim()) {
      setError('Bank Name and Bank Code are required.');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        bankCode: formData.bankCode.trim().toUpperCase(),
        logoUrl: formData.logoUrl.trim(),
        description: formData.description.trim(),
        category: formData.category,
        roi: formData.roi.trim(),
        maxLTV: formData.maxLTV.trim(),
        maxTenure: formData.maxTenure.trim(),
        processingTime: formData.processingTime.trim(),
        contactDetails: {
          contactPerson: formData.contactPerson.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
        },
        interestRateRange: {
          min: Number(formData.minROI),
          max: Number(formData.maxROI),
        },
        maxTenureMonths: Number(formData.maxTenureMonths),
        processingFeeDetails: formData.processingFee.trim(),
        status: formData.status,
      };

      if (editingBank) {
        await adminService.updateBank(editingBank._id, payload);
        setSuccess(`Bank '${formData.name}' updated successfully.`);
      } else {
        await adminService.createBank(payload);
        setSuccess(`Bank '${formData.name}' registered successfully.`);
      }

      setModalOpen(false);
      await fetchBanks();
    } catch (err) {
      console.error('Error saving bank:', err);
      setError(err.response?.data?.message || 'Failed to save bank record.');
    }
  };

  const toggleStatus = async (bank) => {
    try {
      setError('');
      setSuccess('');
      const res = await adminService.toggleBankStatus(bank._id);
      setSuccess(res.message || `Bank '${bank.name}' status updated.`);
      await fetchBanks();
    } catch (err) {
      console.error('Failed to toggle bank status:', err);
      setError(err.response?.data?.message || 'Failed to update bank status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bankToDelete) return;

    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');
      const res = await adminService.deleteBank(bankToDelete._id);
      setSuccess(res.message || `Bank '${bankToDelete.name}' deleted successfully.`);
      setDeleteModalOpen(false);
      setBankToDelete(null);
      await fetchBanks();
    } catch (err) {
      console.error('Failed to delete bank:', err);
      setError(err.response?.data?.message || 'Failed to delete bank record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <Landmark className="w-3.5 h-3.5" />
            <span>Financial Institutions Desk</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Bank Management</h2>
          <p className="text-xs text-brand-textSecondary">
            Configure partner banks, interest rate brackets, nodal contacts, processing fees, and active/inactive visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Partner Bank</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center justify-between text-xs text-brand-red">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-brand-textSecondary hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-brand-textSecondary hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Filter & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by bank name or code..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Categories</option>
            <option value="PSU Banks">PSU Banks</option>
            <option value="Private Banks">Private Banks</option>
            <option value="NBFCs">NBFCs</option>
          </select>
        </div>

        <div className="text-xs text-brand-textSecondary self-end sm:self-center">
          Total Banks: <span className="text-brand-textPrimary font-bold">{banks.length}</span>
        </div>
      </div>

      {/* Banks Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 w-[200px]">Bank Name & Code</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">ROI & Max LTV</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tenure & Turnaround</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Processing Fee</th>
                <th className="py-3.5 px-4">Contact Officer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading banking partners...
                  </td>
                </tr>
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-textSecondary">
                    No banking partners found matching criteria.
                  </td>
                </tr>
              ) : (
                banks.map((bank) => (
                  <tr key={bank._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const logoSrc = getVerifiedBankLogo(bank);
                          return logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={bank.name}
                              className="h-6 w-6 object-contain rounded bg-white p-0.5 shrink-0 border border-brand-border"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded bg-brand-redLight text-brand-red flex items-center justify-center shrink-0 border border-brand-red/20">
                              <Landmark className="w-3.5 h-3.5" />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="font-bold text-brand-textPrimary text-sm">{bank.name}</div>
                          <span className="font-mono text-[10px] text-brand-red bg-brand-redLight px-2 py-0.5 rounded border border-brand-red/20">
                            {bank.bankCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${bank.category === 'PSU Banks'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : bank.category === 'NBFCs'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                        {bank.category || 'Private Banks'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-brand-textPrimary">
                        {bank.roi || `${bank.interestRateRange?.min ?? 8.5}% – ${bank.interestRateRange?.max ?? 14.0}%`}
                      </div>
                      <div className="text-[11px] font-medium text-emerald-700">
                        Max LTV: {bank.maxLTV || '75%'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-textSecondary whitespace-nowrap">
                      <div className="font-medium text-brand-textPrimary">
                        {bank.maxTenure || `Up to ${Math.round((bank.maxTenureMonths || 360) / 12)} Years`}
                      </div>
                      <div className="text-[11px] text-brand-red font-semibold">
                        {bank.processingTime || '10-15 days'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-textSecondary">
                      {bank.processingFeeDetails || 'Standard'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-brand-textPrimary font-medium">{bank.contactDetails?.contactPerson || 'N/A'}</div>
                      <div className="text-[11px] text-brand-textSecondary flex flex-col gap-0.5">
                        {bank.contactDetails?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-brand-textSecondary" />
                            {bank.contactDetails.phone}
                          </span>
                        )}
                        {bank.contactDetails?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-brand-textSecondary" />
                            {bank.contactDetails.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(bank)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${(bank.status || '').toLowerCase() === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                          }`}
                        title="Click to toggle Active / Inactive"
                      >
                        {(bank.status || '').toLowerCase() === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(bank)}
                          className="p-1.5 rounded-lg bg-white hover:bg-brand-redLight text-brand-textSecondary hover:text-brand-red border border-brand-border transition"
                          title="Edit Bank"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(bank)}
                          className="p-1.5 rounded-lg bg-white hover:bg-brand-redLight text-brand-textSecondary hover:text-brand-red border border-brand-border hover:border-brand-red/40 transition"
                          title="Delete Bank"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg hover:bg-brand-border transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-brand-textPrimary mb-1">
              {editingBank ? 'Edit Banking Partner' : 'Register New Partner Bank'}
            </h3>
            <p className="text-xs text-brand-textSecondary mb-6">
              Configure institution details, rate brackets, and public website display.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Bank Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Bank Code <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankCode}
                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                    placeholder="e.g. HDFC"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs uppercase font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Institution Category <span className="text-brand-red">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="PSU Banks">PSU Banks (10)</option>
                    <option value="Private Banks">Private Banks (10)</option>
                    <option value="NBFCs">NBFCs (17)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    ROI Range Display
                  </label>
                  <input
                    type="text"
                    value={formData.roi}
                    onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                    placeholder="e.g. 7.25% - 8.00%"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Max LTV Ratio
                  </label>
                  <input
                    type="text"
                    value={formData.maxLTV}
                    onChange={(e) => setFormData({ ...formData, maxLTV: e.target.value })}
                    placeholder="e.g. 80% or 90%"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Processing Turnaround
                  </label>
                  <input
                    type="text"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                    placeholder="e.g. 10-15 days"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Logo Image URL <span className="text-brand-textSecondary font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Description / Public Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description for public product display..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Min ROI (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.minROI}
                    onChange={(e) => setFormData({ ...formData, minROI: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Max ROI (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.maxROI}
                    onChange={(e) => setFormData({ ...formData, maxROI: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Max Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.maxTenure}
                    onChange={(e) => setFormData({ ...formData, maxTenure: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="active">Active (Visible on Website)</option>
                    <option value="inactive">Inactive (Hidden from Public)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Processing Fee Standard Note
                  </label>
                  <input
                    type="text"
                    value={formData.processingFee}
                    onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                    placeholder="e.g. Up to 1% + GST"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-brand-border">
                  <h4 className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider mb-2">
                    Nodal Contact Officer
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Ankit Mehra"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="credit.nodal@bank.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-lg shadow-brand-red/20"
                >
                  {editingBank ? 'Save Changes' : 'Create Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && bankToDelete && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-redLight border border-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-center text-lg font-bold text-brand-textPrimary mb-2">
              Confirm Bank Deletion
            </h3>

            <p className="text-center text-xs text-brand-textSecondary leading-relaxed mb-6">
              Are you sure you want to delete <span className="text-brand-textPrimary font-bold">{bankToDelete.name}</span> ({bankToDelete.bankCode})?
              <br /><br />
              <span className="text-[11px] text-brand-textSecondary block bg-brand-bg p-3 rounded-xl border border-brand-border">
                Note: If this bank is referenced in existing leads or loan applications, it will be safely soft-deleted to protect historical audit trails. If unreferenced, it will be permanently removed from MongoDB. In both cases, it will immediately disappear from the public website and loan application forms.
              </span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setDeleteModalOpen(false); setBankToDelete(null); }}
                className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Bank</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
