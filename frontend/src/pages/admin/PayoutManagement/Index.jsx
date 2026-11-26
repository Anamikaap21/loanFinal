import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Edit3,
  IndianRupee,
  X,
  Receipt,
  Plus,
  Building,
  User,
  Calendar,
  Percent,
  ChevronDown,
  Loader2
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create Payout Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState('');
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnerLeads, setPartnerLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    partnerId: '',
    partnerCode: '',
    partnerName: '',
    leadId: '',
    leadCode: '',
    customerName: '',
    loanCategory: '',
    disbursedLoanAmount: '',
    disbursementDate: new Date().toISOString().split('T')[0],
    commissionType: 'percentage',
    commissionRate: 1.5,
    payoutDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    remarks: '',
  });

  // Selected lead has existing payout warning
  const [selectedLeadWarning, setSelectedLeadWarning] = useState('');

  // Edit / Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [commissionRate, setCommissionRate] = useState(1.5);
  const [netAmount, setNetAmount] = useState(0);
  const [payoutStatus, setPayoutStatus] = useState('pending');
  const [transactionRef, setTransactionRef] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPayouts({ status: statusFilter });
      if (res.status === 'success') {
        setPayouts(res.data);
      }
    } catch (err) {
      console.error('Failed to load payouts:', err);
      setError('Unable to fetch commission payouts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  // Open Create Payout Modal and prefetch registered partners
  const openCreateModal = async () => {
    setCreateError('');
    setSelectedLeadWarning('');
    setFormData({
      partnerId: '',
      partnerCode: '',
      partnerName: '',
      leadId: '',
      leadCode: '',
      customerName: '',
      loanCategory: '',
      disbursedLoanAmount: '',
      disbursementDate: new Date().toISOString().split('T')[0],
      commissionType: 'percentage',
      commissionRate: 1.5,
      payoutDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      remarks: '',
    });
    setPartnerLeads([]);
    setCreateModalOpen(true);

    try {
      setLoadingPartners(true);
      const res = await adminService.getPartners();
      if (res.status === 'success') {
        setPartners(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      setCreateError('Failed to load partners from database.');
    } finally {
      setLoadingPartners(false);
    }
  };

  // Handle Partner Change
  const handlePartnerChange = async (partnerId) => {
    const partner = partners.find((p) => p._id === partnerId);
    if (!partner) {
      setFormData((prev) => ({
        ...prev,
        partnerId: '',
        partnerCode: '',
        partnerName: '',
        leadId: '',
        leadCode: '',
        customerName: '',
        loanCategory: '',
        disbursedLoanAmount: '',
      }));
      setPartnerLeads([]);
      setSelectedLeadWarning('');
      return;
    }

    const defaultRate = partner.defaultCommissionRate || 1.5;
    setFormData((prev) => ({
      ...prev,
      partnerId: partner._id,
      partnerCode: partner.partnerCode || '',
      partnerName: partner.user?.name || partner.businessName || 'Partner',
      commissionRate: defaultRate,
      leadId: '',
      leadCode: '',
      customerName: '',
      loanCategory: '',
      disbursedLoanAmount: '',
    }));
    setSelectedLeadWarning('');

    // Fetch leads for this partner
    try {
      setLoadingLeads(true);
      const res = await adminService.getPartnerLeadsForPayout(partner._id);
      if (res.status === 'success') {
        setPartnerLeads(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching partner leads:', err);
      setCreateError('Failed to load leads for the selected partner.');
    } finally {
      setLoadingLeads(false);
    }
  };

  // Handle Lead Selection
  const handleLeadChange = (leadId) => {
    const lead = partnerLeads.find((l) => l._id === leadId);
    if (!lead) {
      setFormData((prev) => ({
        ...prev,
        leadId: '',
        leadCode: '',
        customerName: '',
        loanCategory: '',
        disbursedLoanAmount: '',
      }));
      setSelectedLeadWarning('');
      return;
    }

    if (lead.hasExistingPayout) {
      setSelectedLeadWarning(`Warning: Payout (${lead.existingPayoutNumber}) has already been generated for this lead file.`);
    } else {
      setSelectedLeadWarning('');
    }

    const loanAmount = lead.disbursedAmount || lead.requiredLoanAmount || lead.loanAmount || 0;
    const disbDate = lead.disbursementDate
      ? new Date(lead.disbursementDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const categoryName = typeof lead.loanCategory === 'object' && lead.loanCategory !== null
      ? lead.loanCategory.name
      : lead.categoryName || 'Loan Facility';

    setFormData((prev) => ({
      ...prev,
      leadId: lead._id,
      leadCode: lead.leadId || '',
      customerName: lead.customerName || '',
      loanCategory: categoryName,
      disbursedLoanAmount: loanAmount > 0 ? loanAmount : '',
      disbursementDate: disbDate,
    }));
  };

  // Calculations for Create Modal
  const disbursedNum = Number(formData.disbursedLoanAmount) || 0;
  const rateNum = Number(formData.commissionRate) || 0;
  let calculatedGross = 0;
  if (formData.commissionType === 'fixed') {
    calculatedGross = rateNum;
  } else {
    calculatedGross = (disbursedNum * rateNum) / 100;
  }
  calculatedGross = Math.round(calculatedGross * 100) / 100;
  const calculatedTds = Math.round(((calculatedGross * 5) / 100) * 100) / 100;
  const calculatedNet = Math.round((calculatedGross - calculatedTds) * 100) / 100;

  // Handle Create Payout Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!formData.partnerId) {
      setCreateError('Please select a partner.');
      return;
    }
    if (!formData.leadId) {
      setCreateError('Please select an associated lead file.');
      return;
    }
    if (selectedLeadWarning) {
      setCreateError('A payout has already been created for this lead. Please select an eligible lead without existing payout.');
      return;
    }
    if (disbursedNum <= 0) {
      setCreateError('Please enter a valid loan disbursed amount greater than 0.');
      return;
    }
    if (rateNum <= 0) {
      setCreateError('Please enter a valid commission rate or fixed payout amount greater than 0.');
      return;
    }
    if (!formData.payoutDate) {
      setCreateError('Please select a payout date.');
      return;
    }

    try {
      setSubmittingCreate(true);
      const payload = {
        partnerId: formData.partnerId,
        leadId: formData.leadId,
        disbursedLoanAmount: disbursedNum,
        disbursementDate: formData.disbursementDate,
        commissionType: formData.commissionType,
        commissionRate: rateNum,
        payoutDate: formData.payoutDate,
        status: formData.status,
        remarks: formData.remarks,
      };

      const res = await adminService.createPayout(payload);
      if (res.status === 'success') {
        setSuccess(`Payout ${res.data.payoutNumber} generated successfully.`);
        setCreateModalOpen(false);
        fetchPayouts();
      }
    } catch (err) {
      console.error('Failed to create payout:', err);
      setCreateError(err.response?.data?.message || 'Failed to generate payout record.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Override / Pay Modal logic
  const openOverrideModal = (payout) => {
    setSelectedPayout(payout);
    setCommissionRate(payout.commissionRate);
    setNetAmount(payout.netPayoutAmount);
    setPayoutStatus(payout.status);
    setTransactionRef(payout.paymentDetails?.transactionReference || '');
    setRemarks(payout.remarks || '');
    setOverrideModalOpen(true);
  };

  const handleOverride = async (e) => {
    e.preventDefault();
    try {
      const gross = (selectedPayout.disbursedLoanAmount * Number(commissionRate)) / 100;
      const tds = (gross * 5) / 100;
      const net = Number(netAmount) || (gross - tds);

      await adminService.updatePayout(selectedPayout._id, {
        commissionRate: Number(commissionRate),
        grossCommissionAmount: gross,
        tdsAmount: tds,
        netPayoutAmount: net,
        status: payoutStatus,
        paymentDetails: {
          transactionReference: transactionRef,
          paymentDate: (payoutStatus === 'completed' || payoutStatus === 'paid') ? new Date() : null,
          paymentMethod: 'bank_transfer',
        },
        remarks,
      });

      setSuccess(`Payout ${selectedPayout.payoutNumber} updated successfully.`);
      setOverrideModalOpen(false);
      fetchPayouts();
    } catch (err) {
      console.error('Update payout error:', err);
      setError('Failed to update payout record.');
    }
  };

  const handleGenerateInvoice = async (payout) => {
    try {
      const res = await adminService.generateInvoice(payout._id);
      setSuccess(`Invoice ${res.data.invoiceNumber} generated for payout ${payout.payoutNumber}.`);
      fetchPayouts();
    } catch (err) {
      console.error('Generate invoice error:', err);
      setError(err.response?.data?.message || 'Failed to generate invoice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Channel Partner Commission Desk</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Partner Payout</h2>
          <p className="text-xs text-brand-textSecondary">
            Automatic and manual commission payouts for disbursed partner loans. Includes administrative rate override, payment completion, and instant invoice generation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Payout</span>
        </button>
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
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          <option value="all">All Payout Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="text-xs text-brand-textSecondary">
          Total Payouts: <span className="text-brand-textPrimary font-bold">{payouts.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[1250px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-4 px-4 whitespace-nowrap min-w-[150px]">Payout Ref</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[220px]">Partner DSA</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[190px]">Lead File</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[130px]">Disbursed Amount</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[140px]">Payout Type & Rate</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[140px]">Gross & TDS</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[130px]">Net Payout (INR)</th>
                <th className="py-4 px-4 whitespace-nowrap min-w-[110px] text-center">Status</th>
                <th className="py-4 px-4 text-right whitespace-nowrap min-w-[180px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading payout records...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-textSecondary">
                    No partner payouts found. Click "Create Payout" to manually generate one.
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-brand-textPrimary whitespace-nowrap min-w-[150px] align-top">
                      <div className="text-xs">{payout.payoutNumber}</div>
                      <div className="text-[10px] text-brand-textSecondary font-sans font-normal mt-0.5">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[220px] align-top">
                      <div className="font-bold text-brand-textPrimary text-xs leading-snug whitespace-nowrap">
                        {payout.partner?.user?.name || payout.partner?.businessName || 'Channel Partner'}
                      </div>
                      {payout.partner?.businessName && payout.partner?.user?.name && payout.partner.businessName !== payout.partner.user.name && (
                        <div className="text-[10px] text-brand-textSecondary leading-tight mt-0.5 whitespace-nowrap">
                          {payout.partner.businessName}
                        </div>
                      )}
                      <div className="mt-1.5">
                        <span className="inline-flex items-center font-mono text-[10px] font-semibold text-brand-red bg-brand-redLight border border-brand-red/20 px-2 py-0.5 rounded whitespace-nowrap">
                          {payout.partner?.partnerCode || 'DSA-N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 min-w-[190px] align-top">
                      <div className="font-mono font-bold text-brand-textPrimary whitespace-nowrap tracking-tight text-xs">
                        {payout.lead?.leadId || 'N/A'}
                      </div>
                      <div className="text-[11px] text-brand-textSecondary mt-0.5 whitespace-nowrap">
                        {payout.lead?.customerName || 'Customer'}
                      </div>
                      {payout.lead?.loanCategory && (
                        <div className="text-[10px] text-brand-textSecondary mt-0.5 whitespace-nowrap">
                          {typeof payout.lead.loanCategory === 'object' ? payout.lead.loanCategory.name : payout.lead.loanCategory}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-brand-textPrimary whitespace-nowrap min-w-[130px] align-top">
                      ₹{Number(payout.disbursedLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap min-w-[140px] align-top">
                      <div className="capitalize font-semibold text-brand-textPrimary">
                        {payout.commissionType === 'fixed' ? 'Fixed (₹)' : 'Percentage (%)'}
                      </div>
                      <div className="text-[10px] text-brand-textSecondary mt-0.5">
                        {payout.commissionType === 'fixed'
                          ? `₹${Number(payout.commissionRate || 0).toLocaleString('en-IN')}`
                          : `${payout.commissionRate}%`}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap min-w-[140px] align-top">
                      <div>Gross: <span className="font-bold text-brand-textPrimary">₹{Number(payout.grossCommissionAmount || 0).toLocaleString('en-IN')}</span></div>
                      <div className="text-[10px] text-brand-textSecondary mt-0.5">TDS (5%): ₹{Number(payout.tdsAmount || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-600 text-sm whitespace-nowrap min-w-[130px] align-top">
                      ₹{Number(payout.netPayoutAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap min-w-[110px] text-center align-top">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        payout.status === 'completed' || payout.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : payout.status === 'processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {payout.status === 'completed' ? 'PAID' : payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap min-w-[180px] align-top">
                      <button
                        onClick={() => openOverrideModal(payout)}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-bg hover:bg-brand-border/60 text-brand-textPrimary border border-brand-border text-[11px] font-semibold transition inline-block"
                      >
                        Override / Pay
                      </button>
                      {!payout.isInvoiceGenerated && (
                        <button
                          onClick={() => handleGenerateInvoice(payout)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold transition inline-block"
                        >
                          Generate Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PAYOUT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-brand-border max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-1">
                <Plus className="w-3 h-3" />
                <span>Manual Generation</span>
              </div>
              <h3 className="text-lg font-bold text-brand-textPrimary">Create Partner Payout</h3>
              <p className="text-xs text-brand-textSecondary">
                Select a registered partner and an associated lead file to generate a commission payout record.
              </p>
            </div>

            {createError && (
              <div className="p-3 mb-4 rounded-xl bg-brand-redLight border border-brand-red/30 flex items-center gap-2 text-xs text-brand-red">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {selectedLeadWarning && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{selectedLeadWarning}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Partner Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Select Partner *
                  </label>
                  <select
                    value={formData.partnerId}
                    onChange={(e) => handlePartnerChange(e.target.value)}
                    required
                    disabled={loadingPartners}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="">{loadingPartners ? 'Loading partners...' : '-- Choose Registered Partner --'}</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.user?.name || p.businessName} ({p.partnerCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Partner / DSA Code
                  </label>
                  <input
                    type="text"
                    value={formData.partnerCode}
                    readOnly
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg/60 border border-brand-border text-brand-textSecondary text-xs font-mono"
                  />
                </div>
              </div>

              {/* Lead Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Associated Lead File *
                  </label>
                  <select
                    value={formData.leadId}
                    onChange={(e) => handleLeadChange(e.target.value)}
                    required
                    disabled={!formData.partnerId || loadingLeads}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red disabled:opacity-50"
                  >
                    <option value="">
                      {!formData.partnerId
                        ? '-- Select a partner first --'
                        : loadingLeads
                          ? 'Loading partner leads...'
                          : partnerLeads.length === 0
                            ? 'No leads found for this partner'
                            : '-- Choose Partner Lead --'}
                    </option>
                    {partnerLeads.map((lead) => (
                      <option key={lead._id} value={lead._id}>
                        {lead.leadId} - {lead.customerName} (₹{Number(lead.disbursedAmount || lead.requiredLoanAmount || 0).toLocaleString('en-IN')})
                        {lead.hasExistingPayout ? ` [Already Created: ${lead.existingPayoutNumber}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Lead Reference ID
                  </label>
                  <input
                    type="text"
                    value={formData.leadCode}
                    readOnly
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg/60 border border-brand-border text-brand-textSecondary text-xs font-mono"
                  />
                </div>
              </div>

              {/* Lead Coordinates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    readOnly
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg/60 border border-brand-border text-brand-textSecondary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Loan Category
                  </label>
                  <input
                    type="text"
                    value={formData.loanCategory}
                    readOnly
                    placeholder="Auto-fetched"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg/60 border border-brand-border text-brand-textSecondary text-xs"
                  />
                </div>
              </div>

              {/* Disbursement Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Loan Disbursed Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formData.disbursedLoanAmount}
                    onChange={(e) => setFormData({ ...formData, disbursedLoanAmount: e.target.value })}
                    required
                    placeholder="e.g. 1000000"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Disbursement Date *
                  </label>
                  <input
                    type="date"
                    value={formData.disbursementDate}
                    onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>

              {/* Calculation Type & Rate Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Payout Calculation Type *
                  </label>
                  <select
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="percentage">Percentage (%) of Disbursed Amount</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    {formData.commissionType === 'percentage' ? 'Payout Rate (% of Disbursed)' : 'Fixed Payout Amount (₹)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    required
                    placeholder={formData.commissionType === 'percentage' ? 'e.g. 1.5' : 'e.g. 15000'}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red font-mono"
                  />
                </div>
              </div>

              {/* Live Financial Calculations Summary Card */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-brand-textSecondary mb-1">
                  Automatic Financial Calculations
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-brand-border">
                    <div className="text-[10px] text-brand-textSecondary font-semibold">Gross Payout</div>
                    <div className="text-sm font-bold text-brand-textPrimary mt-0.5">
                      ₹{calculatedGross.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-brand-border">
                    <div className="text-[10px] text-brand-textSecondary font-semibold">TDS (5% Sec 194H)</div>
                    <div className="text-sm font-bold text-amber-600 mt-0.5">
                      ₹{calculatedTds.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-[10px] text-emerald-700 font-semibold">Net Payable</div>
                    <div className="text-sm font-black text-emerald-700 mt-0.5">
                      ₹{calculatedNet.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Date & Initial Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Payout Date *
                  </label>
                  <input
                    type="date"
                    value={formData.payoutDate}
                    onChange={(e) => setFormData({ ...formData, payoutDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Payment Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="e.g. Generated upon branch sanction letter verification..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={submittingCreate}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate || !!selectedLeadWarning}
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  {submittingCreate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Payout...</span>
                    </>
                  ) : (
                    <span>Create Payout</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERRIDE / PAY MODAL */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setOverrideModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-textPrimary mb-1">Commission Override & Settlement</h3>
            <p className="text-xs text-brand-textSecondary mb-4">
              Payout: <span className="font-mono text-brand-red font-bold">{selectedPayout?.payoutNumber}</span>
            </p>

            <form onSubmit={handleOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Commission Rate (% of ₹{Number(selectedPayout?.disbursedLoanAmount).toLocaleString('en-IN')})
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={commissionRate}
                  onChange={(e) => {
                    const r = e.target.value;
                    setCommissionRate(r);
                    const gross = (selectedPayout.disbursedLoanAmount * Number(r)) / 100;
                    setNetAmount(gross - (gross * 5) / 100);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  Net Payable Amount (INR after TDS)
                </label>
                <input
                  type="number"
                  value={netAmount}
                  onChange={(e) => setNetAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-emerald-200 text-brand-textPrimary text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Payment Status
                </label>
                <select
                  value={payoutStatus}
                  onChange={(e) => setPayoutStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing with Bank</option>
                  <option value="completed">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {(payoutStatus === 'completed' || payoutStatus === 'paid') && (
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Bank Transaction / NEFT Reference
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. NEFT202611230001"
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                  Settlement Remarks
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Processed via HDFC Corporate Net Banking..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
