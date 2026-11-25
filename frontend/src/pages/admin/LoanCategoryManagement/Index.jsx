import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  X,
  AlertTriangle,
  Home,
  Building2,
  Briefcase,
  UserCheck,
  Landmark,
  CreditCard,
  Percent,
  Calendar,
  IndianRupee,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

// Pre-configured icon choices for easy selection
const ICON_OPTIONS = [
  { id: 'CreditCard', label: 'Credit Card / General', icon: CreditCard },
  { id: 'Home', label: 'Home Loan / Mortgage', icon: Home },
  { id: 'Building2', label: 'Property / LAP / Real Estate', icon: Building2 },
  { id: 'Briefcase', label: 'Business / Enterprise Loan', icon: Briefcase },
  { id: 'UserCheck', label: 'Personal / Salaried Loan', icon: UserCheck },
  { id: 'Landmark', label: 'Overdraft / Institutional', icon: Landmark },
];

const getCategoryIconComponent = (iconName, slug = '', name = '') => {
  if (iconName === 'Home') return Home;
  if (iconName === 'Building2') return Building2;
  if (iconName === 'Briefcase') return Briefcase;
  if (iconName === 'UserCheck') return UserCheck;
  if (iconName === 'Landmark') return Landmark;
  if (iconName === 'CreditCard') return CreditCard;

  const s = (slug || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (s.includes('home') || n.includes('home')) return Home;
  if (s.includes('property') || n.includes('property') || s.includes('lap')) return Building2;
  if (s.includes('business') || n.includes('business')) return Briefcase;
  if (s.includes('personal') || n.includes('personal')) return UserCheck;
  if (s.includes('od') || s.includes('overdraft') || n.includes('overdraft')) return Landmark;
  return CreditCard;
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  if (amount >= 10000000) {
    const val = amount / 10000000;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const val = amount / 100000;
    return `₹${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function LoanCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    iconName: 'CreditCard',
    minAmount: 50000,
    maxAmount: 50000000,
    minInterestRate: 8.5,
    maxInterestRate: 15.0,
    minTenureMonths: 12,
    maxTenureMonths: 360,
    displayOrder: 0,
    status: 'active',
    features: '',
    eligibility: '',
    requiredDocuments: '',
  });

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLoanCategories({ search, status: statusFilter });
      if (res.status === 'success') {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch loan categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search, statusFilter]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      iconName: 'CreditCard',
      minAmount: 50000,
      maxAmount: 50000000,
      minInterestRate: 8.5,
      maxInterestRate: 15.0,
      minTenureMonths: 12,
      maxTenureMonths: 360,
      displayOrder: categories.length,
      status: 'active',
      features: '',
      eligibility: '',
      requiredDocuments: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      tagline: cat.tagline || '',
      description: cat.description || '',
      iconName: cat.iconName || 'CreditCard',
      minAmount: cat.minAmount ?? 50000,
      maxAmount: cat.maxAmount ?? 50000000,
      minInterestRate: cat.minInterestRate ?? (cat.interestRateRange?.min ?? 8.5),
      maxInterestRate: cat.maxInterestRate ?? (cat.interestRateRange?.max ?? 15.0),
      minTenureMonths: cat.minTenureMonths ?? 12,
      maxTenureMonths: cat.maxTenureMonths ?? 360,
      displayOrder: cat.displayOrder ?? 0,
      status: (cat.status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
      features: Array.isArray(cat.features) ? cat.features.join('\n') : '',
      eligibility: Array.isArray(cat.eligibility) ? cat.eligibility.join('\n') : '',
      requiredDocuments: Array.isArray(cat.requiredDocuments) ? cat.requiredDocuments.join('\n') : '',
    });
    setModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    // Auto-generate slug if we are creating or if slug was empty/auto
    if (!editingCategory && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name: val, slug: generatedSlug }));
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Category Name is required.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Category Description is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        iconName: formData.iconName,
        minAmount: Number(formData.minAmount) || 0,
        maxAmount: Number(formData.maxAmount) || 0,
        minInterestRate: Number(formData.minInterestRate) || 0,
        maxInterestRate: Number(formData.maxInterestRate) || 0,
        minTenureMonths: Number(formData.minTenureMonths) || 12,
        maxTenureMonths: Number(formData.maxTenureMonths) || 360,
        displayOrder: Number(formData.displayOrder) || 0,
        status: formData.status,
        features: formData.features
          ? formData.features.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          : [],
        eligibility: formData.eligibility
          ? formData.eligibility.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          : [],
        requiredDocuments: formData.requiredDocuments
          ? formData.requiredDocuments.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
          : [],
      };

      if (editingCategory) {
        await adminService.updateLoanCategory(editingCategory._id, payload);
        setSuccess(`Loan Category '${formData.name}' updated successfully.`);
      } else {
        await adminService.createLoanCategory(payload);
        setSuccess(`Loan Category '${formData.name}' created successfully.`);
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error('Error saving loan category:', err);
      setError(err.response?.data?.message || 'Failed to save loan category.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (cat) => {
    try {
      setError('');
      setSuccess('');
      const res = await adminService.toggleLoanCategoryStatus(cat._id);
      setSuccess(res.message || `Loan Category '${cat.name}' status updated.`);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to toggle category status:', err);
      setError(err.response?.data?.message || 'Failed to update category status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');
      const res = await adminService.deleteLoanCategory(categoryToDelete._id);
      setSuccess(res.message || `Loan Category '${categoryToDelete.name}' deleted successfully.`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err.response?.data?.message || 'Failed to delete loan category.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-red/10 text-brand-red border border-brand-red/20 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Architecture & Categories Desk</span>
          </div>
          <h2 className="text-2xl font-black text-white">Loan Categories Management</h2>
          <p className="text-xs text-brand-grey">
            Configure institutional credit offerings, interest rate limits, loan limits, features, eligibility, and active public visibility.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-brand-grey hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Filter & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-dark p-4 rounded-2xl border border-brand-border/60">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-grey absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category by name, slug or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (Visible on Website)</option>
            <option value="inactive">Inactive (Hidden from Public)</option>
          </select>
        </div>

        <div className="text-xs text-brand-grey self-end sm:self-center">
          Total Categories: <span className="text-white font-bold">{categories.length}</span>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 w-[220px]">Category & Slug</th>
                <th className="py-3.5 px-4 max-w-xs">Tagline / Short Desc</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Amount Bracket</th>
                <th className="py-3.5 px-4 whitespace-nowrap">ROI Bracket</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Tenure Bracket</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading loan categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-grey">
                    No loan categories found matching criteria.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const IconComp = getCategoryIconComponent(cat.iconName, cat.slug, cat.name);
                  const isCatActive = (cat.status || '').toLowerCase() === 'active';
                  const minRate = cat.minInterestRate ?? (cat.interestRateRange?.min ?? 8.5);
                  const maxRate = cat.maxInterestRate ?? (cat.interestRateRange?.max ?? 15.0);

                  return (
                    <tr key={cat._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-white block break-words [overflow-wrap:anywhere]">{cat.name}</span>
                            <span className="text-[10px] text-brand-grey font-mono block break-all">
                              /products/{cat.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs break-words [overflow-wrap:anywhere]" title={cat.tagline || cat.description}>
                        <div className="line-clamp-2">
                          {cat.tagline || cat.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap">
                        {formatCurrency(cat.minAmount)} - {formatCurrency(cat.maxAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap">
                        {minRate}% - {maxRate}%
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white whitespace-nowrap">
                        {Math.round((cat.minTenureMonths || 12) / 12)} - {Math.round((cat.maxTenureMonths || 360) / 12)} Yrs
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleStatus(cat)}
                          title="Click to toggle Active / Inactive"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            isCatActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {isCatActive ? (
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
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => toggleStatus(cat)}
                            title={isCatActive ? 'Hide from public website' : 'Make live on public website'}
                            className={`p-1.5 rounded-lg border transition ${
                              isCatActive
                                ? 'bg-white/5 border-white/10 text-brand-grey hover:text-white hover:border-brand-red'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isCatActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => openEditModal(cat)}
                            title="Edit Category"
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-brand-grey hover:text-white hover:border-brand-red transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            title="Delete Category"
                            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-brand-grey hover:text-rose-400 hover:border-rose-400/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-brand-dark rounded-3xl border border-brand-border/80 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-brand-black/60 border-b border-brand-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Loan Category'}
                </h3>
                <p className="text-xs text-brand-grey mt-0.5">
                  Define loan specifications, eligibility rules, and public catalog visibility.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Category Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Home Loan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    URL Slug <span className="text-brand-grey font-normal">(Auto-generated or custom)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g. home-loan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red font-mono"
                  />
                </div>
              </div>

              {/* Tagline / Short Description */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Tagline / One-Line Description
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Competitive interest rates and flexible tenures for your dream residential property."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Full Detailed Description <span className="text-brand-red">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide comprehensive details about this credit product, coverage, and bank syndicate terms..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              {/* Icon Selector & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Visual Icon
                  </label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData(prev => ({ ...prev, iconName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Catalog Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="active">Active (Visible on Website)</option>
                    <option value="inactive">Inactive (Hidden from Public)</option>
                  </select>
                </div>
              </div>

              {/* Loan Amounts & Interest Rates */}
              <div className="p-4 rounded-2xl bg-brand-black/50 border border-brand-border/60 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-red">
                  Loan Sizing & Pricing Parameters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Min Loan (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, minAmount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Max Loan (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Min ROI (%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.minInterestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, minInterestRate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Max ROI (%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={formData.maxInterestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxInterestRate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-brand-border/40">
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Min Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={formData.minTenureMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, minTenureMonths: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Max Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={formData.maxTenureMonths}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTenureMonths: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-brand-grey mb-1">
                      Display Order Priority
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Features & Benefits */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Features & Key Highlights <span className="text-brand-grey font-normal">(One bullet per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.features}
                  onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="Competitive interest rates from 8.5%&#10;Up to 90% property value financing&#10;Minimal documentation & prompt sanctioning"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red font-mono text-[11px]"
                />
              </div>

              {/* Eligibility Criteria */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Eligibility Criteria <span className="text-brand-grey font-normal">(One criterion per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.eligibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, eligibility: e.target.value }))}
                  placeholder="Salaried individuals with min monthly income ₹25,000&#10;Self-employed professionals with min 2 yrs business vintage&#10;Minimum credit score of 650+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red font-mono text-[11px]"
                />
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Required Documentation <span className="text-brand-grey font-normal">(One document per line)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.requiredDocuments}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiredDocuments: e.target.value }))}
                  placeholder="PAN Card & Aadhaar Card&#10;Last 6 months bank account statements&#10;Latest 3 months salary slips or 2 years ITR"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red font-mono text-[11px]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey hover:text-white text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-brand-dark rounded-3xl border border-brand-border/80 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-white">Delete Loan Category?</h3>
              <p className="text-xs text-brand-grey leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">"{categoryToDelete.name}"</span>?
              </p>
              <div className="p-3 mt-2 rounded-xl bg-brand-black/60 border border-brand-border/60 text-left text-[11px] text-brand-lightGrey space-y-1">
                <p>• The category will immediately be removed from the public website.</p>
                <p>• Historical loan applications and leads linked to this category will remain safe.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
