import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  IndianRupee,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Download,
  AlertTriangle,
  History,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CreditCard,
  Landmark,
  Briefcase
} from 'lucide-react';
import adminService from '../../../services/adminService.js';
import documentService from '../../../services/documentService.js';

export default function PartnerVerification() {
  const [partners, setPartners] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPartners: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    resubmissionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected Partner for Detail View / Modal
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Document action modals (reject / request-reupload / preview)
  const [actionModal, setActionModal] = useState({
    type: null, // 'verify-doc' | 'reject-doc' | 'reupload-doc' | 'approve-partner' | 'reject-partner' | 'resubmit-partner' | 'preview-doc'
    doc: null,
  });
  const [actionRemarks, setActionRemarks] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Document Preview Modal State
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMime, setPreviewMime] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Expandable audit trail accordion
  const [expandedAudits, setExpandedAudits] = useState({});

  const fetchPartners = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError('');

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminService.getPartnerVerifications(params);
      if (res.status === 'success') {
        setPartners(res.data || []);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to load partner verifications:', err);
      setError('Unable to load partner verification requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPartners();
  };

  const openPartnerDetails = async (partner) => {
    setSelectedPartner(partner);
    setLoadingDetails(true);
    setError('');
    try {
      const res = await adminService.getPartnerVerificationDetails(partner._id);
      if (res.status === 'success') {
        setPartnerDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner details:', err);
      setError('Failed to fetch detailed verification file.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const closePartnerDetails = () => {
    setSelectedPartner(null);
    setPartnerDetails(null);
  };

  const toggleAudit = (docId) => {
    setExpandedAudits((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  // Preview Document Handler
  const handlePreviewDoc = async (doc) => {
    try {
      setPreviewLoading(true);
      setActionModal({ type: 'preview-doc', doc });
      const blob = await documentService.viewDocumentBlob(doc._id);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setPreviewMime(doc.mimeType || blob.type || 'application/pdf');
    } catch (err) {
      console.error('Failed to preview document:', err);
      setActionError('Unable to render document preview. Try downloading instead.');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download Document Handler
  const handleDownloadDoc = async (doc) => {
    try {
      await documentService.downloadDocument(doc._id, doc.originalName || `${doc.title}.pdf`);
    } catch (err) {
      console.error('Failed to download document:', err);
      setError('Failed to download document file.');
    }
  };

  const openActionModal = (type, doc = null) => {
    setActionError('');
    setActionRemarks('');
    setActionModal({ type, doc });
  };

  const closeActionModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setActionModal({ type: null, doc: null });
    setActionRemarks('');
    setActionError('');
  };

  // Execute Verification Actions
  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!actionModal.type || !selectedPartner) return;

    setActionError('');
    setSubmittingAction(true);

    try {
      const pId = selectedPartner._id;
      const dId = actionModal.doc?._id;

      if (actionModal.type === 'verify-doc') {
        await adminService.verifyPartnerDocument(pId, dId, actionRemarks);
        setSuccess(`Document "${actionModal.doc.title}" verified successfully.`);
      } else if (actionModal.type === 'reject-doc') {
        if (!actionRemarks.trim()) {
          setActionError('Rejection reason is mandatory.');
          setSubmittingAction(false);
          return;
        }
        await adminService.rejectPartnerDocument(pId, dId, actionRemarks.trim());
        setSuccess(`Document "${actionModal.doc.title}" was marked rejected.`);
      } else if (actionModal.type === 'reupload-doc') {
        if (!actionRemarks.trim()) {
          setActionError('Specific instructions for re-upload are mandatory.');
          setSubmittingAction(false);
          return;
        }
        await adminService.requestReuploadPartnerDocument(pId, dId, actionRemarks.trim());
        setSuccess(`Re-upload requested for "${actionModal.doc.title}".`);
      } else if (actionModal.type === 'approve-partner') {
        const res = await adminService.approvePartnerRegistration(pId);
        setSuccess(res.message || 'Partner approved and activated successfully.');
      } else if (actionModal.type === 'reject-partner') {
        if (!actionRemarks.trim()) {
          setActionError('Rejection remarks are mandatory.');
          setSubmittingAction(false);
          return;
        }
        await adminService.rejectPartnerRegistration(pId, actionRemarks.trim());
        setSuccess('Partner registration has been rejected.');
      } else if (actionModal.type === 'resubmit-partner') {
        if (!actionRemarks.trim()) {
          setActionError('Resubmission instructions are mandatory.');
          setSubmittingAction(false);
          return;
        }
        await adminService.requestPartnerResubmission(pId, actionRemarks.trim());
        setSuccess('Partner registration status set to RESUBMISSION_REQUIRED.');
      }

      closeActionModal();
      // Refresh current partner details and master table
      await openPartnerDetails(selectedPartner);
      await fetchPartners(true);
    } catch (err) {
      console.error('Action failed:', err);
      setActionError(err.response?.data?.message || 'Operation failed. Please check inputs.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Partner Approval & Compliance Desk</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Partner Verification Desk</h2>
          <p className="text-xs text-brand-textSecondary mt-0.5">
            Review channel partner registration requests, verify PAN, Aadhaar, and Bank Proof credentials, and grant Partner CRM access.
          </p>
        </div>

        <button
          onClick={() => fetchPartners(true)}
          disabled={refreshing}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition flex items-center gap-2 text-xs font-semibold shadow-sm"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-4 h-4 text-brand-red ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Requests</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center justify-between gap-3 text-xs text-brand-red">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-brand-textSecondary hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Metric Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verification */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Pending Admin Review
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-brand-textPrimary font-mono">{metrics.pendingCount}</div>
          <p className="text-[10px] text-brand-textSecondary">Awaiting KYC document approval</p>
        </div>

        {/* Fully Approved */}
        <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Approved & Active
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-brand-textPrimary font-mono">{metrics.approvedCount}</div>
          <p className="text-[10px] text-brand-textSecondary">Active in Partner CRM</p>
        </div>

        {/* Resubmission Required */}
        <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Resubmission Required
            </span>
            <RotateCcw className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-brand-textPrimary font-mono">{metrics.resubmissionCount}</div>
          <p className="text-[10px] text-brand-textSecondary">Partner action requested</p>
        </div>

        {/* Rejected */}
        <div className="p-4 rounded-2xl bg-white border border-brand-red/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-brand-red uppercase tracking-wider">
              Rejected Requests
            </span>
            <XCircle className="w-4 h-4 text-brand-red" />
          </div>
          <div className="text-2xl font-black text-brand-textPrimary font-mono">{metrics.rejectedCount}</div>
          <p className="text-[10px] text-brand-textSecondary">Access strictly blocked</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Registration ID, Partner Code, Name, Phone, PAN..."
            className="w-full bg-white border border-brand-border rounded-xl pl-10 pr-4 py-2 text-xs text-brand-textPrimary placeholder-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red shadow-sm"
          />
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-brand-border text-xs shadow-sm">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'RESUBMISSION_REQUIRED', label: 'Resubmission Req.' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-brand-red text-white shadow-md'
                  : 'text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-bg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partner Requests Table */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-textSecondary font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Registration & Partner ID</th>
                <th className="py-3 px-4">Partner Details</th>
                <th className="py-3 px-4">Bank Details</th>
                <th className="py-3 px-4">KYC Documents</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading verification requests...</span>
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-textSecondary">
                    <ShieldCheck className="w-8 h-8 text-brand-textSecondary/40 mx-auto mb-2" />
                    <p className="font-semibold text-brand-textPrimary">No partner verification requests found</p>
                    <p className="text-[11px] text-brand-textSecondary mt-0.5">
                      New partner registrations requiring Admin approval will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                partners.map((partner) => {
                  const regStatus = (partner.registrationStatus || 'PENDING').toUpperCase();
                  const isApproved = regStatus === 'APPROVED';
                  const isRejected = regStatus === 'REJECTED';
                  const isResubmission =
                    regStatus === 'RESUBMISSION_REQUIRED' || regStatus === 'REUPLOAD_REQUIRED';

                  const verifiedCount = partner.documentsSummary?.verifiedCount || 0;
                  const totalMandatory = 3;
                  const progress = partner.documentsSummary?.progressPercent || 0;

                  return (
                    <tr
                      key={partner._id}
                      className="hover:bg-brand-redLight/20 transition-colors"
                    >
                      {/* IDs */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-brand-textPrimary text-xs">
                          {partner.registrationId || 'PREG-PENDING'}
                        </div>
                        <div className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-bg text-brand-red font-mono border border-brand-border">
                          {partner.partnerCode}
                        </div>
                      </td>

                      {/* Partner Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-textPrimary text-xs">
                          {partner.user?.name || 'Unnamed Partner'}
                        </div>
                        <div className="text-[11px] text-brand-textSecondary flex items-center gap-2 mt-0.5">
                          <span>{partner.user?.phone || 'No phone'}</span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{partner.user?.email}</span>
                        </div>
                        {partner.businessName && (
                          <div className="text-[10px] text-blue-700 font-medium mt-0.5">
                            {partner.businessName}
                          </div>
                        )}
                      </td>

                      {/* Bank Details */}
                      <td className="py-3.5 px-4">
                        <div className="text-brand-textPrimary font-medium text-xs">
                          {partner.bankDetails?.bankName || 'Bank Name Not Specified'}
                        </div>
                        <div className="text-[11px] font-mono text-brand-textSecondary mt-0.5">
                          A/C: {partner.bankDetails?.accountNumber || 'N/A'}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 uppercase font-semibold">
                          IFSC: {partner.bankDetails?.ifscCode || 'N/A'}
                        </div>
                      </td>

                      {/* KYC Docs Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs text-brand-textPrimary">
                            {verifiedCount}/{totalMandatory}
                          </span>
                          <span className="text-[10px] text-brand-textSecondary">Verified</span>
                        </div>
                        <div className="w-24 h-1.5 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                          <div
                            className={`h-full rounded-full ${
                              progress === 100
                                ? 'bg-emerald-500'
                                : isRejected
                                ? 'bg-brand-red'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isResubmission
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved & Active</span>
                            </>
                          ) : isRejected ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Rejected</span>
                            </>
                          ) : isResubmission ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Resubmission Req.</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pending Review</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-brand-textSecondary text-[11px] font-mono whitespace-nowrap">
                        {new Date(partner.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openPartnerDetails(partner)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-md shadow-brand-red/20"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Inspect & Verify</span>
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

      {/* ========================================================== */}
      {/* PARTNER VERIFICATION DETAIL MODAL / DRAWER */}
      {/* ========================================================== */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-brand-border flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-redLight border border-brand-red/20 flex items-center justify-center text-brand-red">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-red">
                      {selectedPartner.registrationId || 'PREG-PENDING'}
                    </span>
                    <span className="text-brand-border">•</span>
                    <span className="font-mono text-xs text-brand-textPrimary font-semibold">
                      {selectedPartner.partnerCode}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-brand-textPrimary">
                    {selectedPartner.user?.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={closePartnerDetails}
                className="p-2 rounded-xl bg-white hover:bg-brand-border text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetails ? (
                <div className="py-12 text-center text-brand-textSecondary">
                  <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading partner verification file...</span>
                </div>
              ) : (
                <>
                  {/* Partner Info & Bank Details Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact & Business Info */}
                    <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-3">
                      <div className="text-xs font-bold text-brand-red uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Partner Contact Profile</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">Mobile:</span>
                          <span className="font-bold text-brand-textPrimary">{selectedPartner.user?.phone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">Email:</span>
                          <span className="font-bold text-brand-textPrimary truncate block">{selectedPartner.user?.email}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">City / State:</span>
                          <span className="font-bold text-brand-textPrimary">
                            {selectedPartner.address?.city || 'N/A'}, {selectedPartner.address?.state || ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">PAN Number:</span>
                          <span className="font-bold text-brand-textPrimary font-mono uppercase">
                            {selectedPartner.panNumber || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bank Account Details */}
                    <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border space-y-3">
                      <div className="text-xs font-bold text-brand-red uppercase tracking-wider flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Mandatory Bank Account</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">Account Holder:</span>
                          <span className="font-bold text-brand-textPrimary">
                            {selectedPartner.bankDetails?.accountHolderName || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">Bank Name:</span>
                          <span className="font-bold text-brand-textPrimary">
                            {selectedPartner.bankDetails?.bankName || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">Account Number:</span>
                          <span className="font-bold text-brand-textPrimary font-mono">
                            {selectedPartner.bankDetails?.accountNumber || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-brand-textSecondary block">IFSC Code:</span>
                          <span className="font-bold text-emerald-700 font-mono uppercase font-semibold">
                            {selectedPartner.bankDetails?.ifscCode || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-brand-border">
                      <h4 className="text-xs font-black text-brand-textPrimary uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-red" />
                        <span>Mandatory Partner KYC Documents (3 Compulsory Files)</span>
                      </h4>
                      <span className="text-[11px] font-mono text-brand-textSecondary">
                        {partnerDetails?.documentsSummary?.verifiedCount || 0}/3 Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {partnerDetails?.documents?.map((doc) => {
                        const status = (doc.verificationStatus || 'pending').toLowerCase();
                        const isVerified = status === 'verified';
                        const isRejected = status === 'rejected';
                        const isReupload =
                          status === 'reupload_required' || status === 'action_required';

                        return (
                          <div
                            key={doc._id}
                            className={`p-4 rounded-2xl bg-white border transition-all space-y-3 shadow-sm ${
                              isVerified
                                ? 'border-emerald-300'
                                : isRejected
                                ? 'border-brand-red/30'
                                : isReupload
                                ? 'border-amber-300'
                                : 'border-brand-border hover:border-brand-red/40'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                    isVerified
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : isRejected
                                      ? 'bg-brand-redLight text-brand-red border-brand-red/20'
                                      : isReupload
                                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-brand-textPrimary">{doc.title}</h5>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        isVerified
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : isRejected
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : isReupload
                                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}
                                    >
                                      {isVerified ? 'Verified' : isRejected ? 'Rejected' : isReupload ? 'Re-upload Req.' : 'Pending Review'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-mono text-brand-textSecondary">
                                    <span className="text-brand-textPrimary truncate max-w-xs">
                                      {doc.originalName || doc.fileName}
                                    </span>
                                    <span>•</span>
                                    <span>{doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* View & Download Buttons */}
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <button
                                  onClick={() => handlePreviewDoc(doc)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border flex items-center gap-1.5 transition shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={() => handleDownloadDoc(doc)}
                                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border flex items-center gap-1.5 transition shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5 text-brand-textSecondary" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>

                            {/* Remarks / Reasons */}
                            {isVerified && doc.verificationRemarks && (
                              <div className="text-xs text-emerald-800 pl-2 border-l-2 border-emerald-500">
                                <span className="font-semibold">Verification Note:</span> {doc.verificationRemarks}
                              </div>
                            )}
                            {isRejected && doc.rejectionReason && (
                              <div className="text-xs text-brand-red pl-2 border-l-2 border-brand-red">
                                <span className="font-semibold">Rejection Reason:</span> {doc.rejectionReason}
                              </div>
                            )}
                            {isReupload && doc.reuploadReason && (
                              <div className="text-xs text-amber-800 pl-2 border-l-2 border-amber-500">
                                <span className="font-semibold">Instructions:</span> {doc.reuploadReason}
                              </div>
                            )}

                            {/* Individual Document Actions */}
                            <div className="pt-2 border-t border-brand-border flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                {!isVerified && (
                                  <button
                                    onClick={() => openActionModal('verify-doc', doc)}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify & Approve</span>
                                  </button>
                                )}
                                {!isRejected && (
                                  <button
                                    onClick={() => openActionModal('reject-doc', doc)}
                                    className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                )}
                                {!isReupload && (
                                  <button
                                    onClick={() => openActionModal('reupload-doc', doc)}
                                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Request Re-upload</span>
                                  </button>
                                )}
                              </div>

                              {doc.verificationHistory && doc.verificationHistory.length > 0 && (
                                <button
                                  onClick={() => toggleAudit(doc._id)}
                                  className="text-[11px] text-brand-textSecondary hover:text-brand-textPrimary flex items-center gap-1 transition"
                                >
                                  <History className="w-3 h-3" />
                                  <span>History ({doc.verificationHistory.length})</span>
                                  {expandedAudits[doc._id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>

                            {/* Expanded Audit Trail */}
                            {expandedAudits[doc._id] && doc.verificationHistory && (
                              <div className="pt-2 pl-3 border-l-2 border-brand-border space-y-1.5 text-[11px]">
                                {doc.verificationHistory.map((item, idx) => (
                                  <div key={idx} className="text-brand-textSecondary">
                                    <strong className="text-brand-textPrimary capitalize">{item.newStatus || item.action}</strong>
                                    {' '}— {new Date(item.timestamp).toLocaleString('en-IN')}: {item.remarks}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Partner Approval Gate Section */}
                  <div className="p-5 rounded-2xl bg-brand-bg border border-brand-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-black text-brand-textPrimary flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Final Partner Approval Decision</span>
                        </h4>
                        <p className="text-xs text-brand-textSecondary mt-0.5">
                          {partnerDetails?.documentsSummary?.allMandatoryVerified
                            ? 'All 3 mandatory KYC documents are verified. You can now approve and activate this Channel Partner account.'
                            : 'Partner account cannot be approved until all 3 mandatory KYC documents (Aadhaar, PAN, Bank Proof) are individually approved.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Final Approve Button */}
                        <button
                          onClick={() => openActionModal('approve-partner')}
                          disabled={!partnerDetails?.documentsSummary?.allMandatoryVerified}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Activate Partner</span>
                        </button>

                        {/* Request Resubmission */}
                        <button
                          onClick={() => openActionModal('resubmit-partner')}
                          className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Request Resubmission</span>
                        </button>

                        {/* Reject Partner */}
                        <button
                          onClick={() => openActionModal('reject-partner')}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Application</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ACTION CONFIRMATION MODAL */}
      {/* ========================================================== */}
      {actionModal.type && actionModal.type !== 'preview-doc' && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl border border-brand-border p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h4 className="text-sm font-black text-brand-textPrimary flex items-center gap-2">
                {actionModal.type === 'verify-doc' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve Document</span>
                  </>
                )}
                {actionModal.type === 'reject-doc' && (
                  <>
                    <XCircle className="w-4 h-4 text-brand-red" />
                    <span>Reject Document</span>
                  </>
                )}
                {actionModal.type === 'reupload-doc' && (
                  <>
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Request Re-upload</span>
                  </>
                )}
                {actionModal.type === 'approve-partner' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Approve & Activate Partner</span>
                  </>
                )}
                {actionModal.type === 'reject-partner' && (
                  <>
                    <XCircle className="w-4 h-4 text-brand-red" />
                    <span>Reject Partner Application</span>
                  </>
                )}
                {actionModal.type === 'resubmit-partner' && (
                  <>
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Request Partner Resubmission</span>
                  </>
                )}
              </h4>
              <button onClick={closeActionModal} className="text-brand-textSecondary hover:text-brand-textPrimary">
                <X className="w-4 h-4" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-brand-redLight border border-brand-red/30 text-xs text-brand-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="space-y-4">
              {actionModal.type === 'approve-partner' ? (
                <p className="text-xs text-brand-textSecondary leading-relaxed">
                  Are you sure you want to approve this partner? Their account status will become{' '}
                  <strong className="text-emerald-700">ACTIVE</strong> and they will be able to log in to the Partner CRM with their registered credentials.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-textPrimary flex items-center justify-between">
                    <span>
                      {actionModal.type === 'verify-doc'
                        ? 'Verification Remarks (Optional)'
                        : 'Mandatory Reason / Instructions *'}
                    </span>
                    {actionModal.type !== 'verify-doc' && (
                      <span className="text-[10px] text-brand-red font-bold">Required</span>
                    )}
                  </label>
                  <textarea
                    rows={3}
                    required={actionModal.type !== 'verify-doc'}
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    placeholder={
                      actionModal.type === 'verify-doc'
                        ? 'e.g. Details verified against NSDL/UIDAI'
                        : 'Enter mandatory remarks / specific instructions...'
                    }
                    className="w-full bg-white border border-brand-border rounded-xl p-3 text-xs text-brand-textPrimary focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submittingAction}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary border border-brand-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 ${
                    actionModal.type === 'reject-doc' || actionModal.type === 'reject-partner'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                      : actionModal.type === 'reupload-doc' || actionModal.type === 'resubmit-partner'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {submittingAction && (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>Confirm Decision</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DOCUMENT PREVIEW MODAL */}
      {/* ========================================================== */}
      {actionModal.type === 'preview-doc' && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl border border-brand-border flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-red" />
                <div>
                  <h4 className="text-sm font-bold text-brand-textPrimary">{actionModal.doc?.title}</h4>
                  <p className="text-[11px] font-mono text-brand-textSecondary">
                    {actionModal.doc?.originalName || actionModal.doc?.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadDoc(actionModal.doc)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-brand-textSecondary" />
                  <span>Download</span>
                </button>
                <button
                  onClick={closeActionModal}
                  className="p-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary border border-brand-border transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-brand-bg/50 p-4 overflow-auto flex items-center justify-center">
              {previewLoading ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-brand-red/30 border-t-brand-red rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-brand-textSecondary font-semibold">Streaming document securely...</p>
                </div>
              ) : previewUrl ? (
                previewMime.includes('image') ? (
                  <img
                    src={previewUrl}
                    alt={actionModal.doc?.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                  />
                ) : (
                  <iframe
                    src={previewUrl}
                    title={actionModal.doc?.title}
                    className="w-full h-full rounded-lg border border-brand-border bg-white"
                  />
                )
              ) : (
                <div className="text-center text-xs text-brand-red">
                  {actionError || 'Failed to render preview. Please download the file to inspect.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
