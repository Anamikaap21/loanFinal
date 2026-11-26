import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  IndianRupee,
  Building2,
  Calendar,
  Layers,
  Download,
  Eye,
  Upload,
  AlertTriangle,
  History,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';
import documentService from '../../../services/documentService.js';

export default function EmployeeDocumentVerificationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals & Action States
  const [actionModal, setActionModal] = useState({
    type: null, // 'verify' | 'reject' | 'request-reupload' | 'reupload' | 'preview'
    doc: null,
  });
  const [actionRemarks, setActionRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState('');

  // Preview state
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMime, setPreviewMime] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Expanded audit trails
  const [expandedAudits, setExpandedAudits] = useState({});

  const fetchDetails = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await employeeService.getLeadDetails(id);
      if (res.status === 'success' && res.data) {
        setLead(res.data.lead);
        setDocuments(res.data.documents || []);
      } else {
        setError('Failed to load lead details.');
      }
    } catch (err) {
      console.error('Error fetching lead details for verification:', err);
      setError(err.response?.data?.message || 'Failed to load document verification record.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [id]);

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
      setActionModal({ type: 'preview', doc });
      const blob = await documentService.viewDocumentBlob(doc._id);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newUrl = URL.createObjectURL(blob);
      setPreviewUrl(newUrl);
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

  // Open Action Modal
  const openActionModal = (type, doc) => {
    setActionError('');
    setActionRemarks('');
    setSelectedFile(null);
    setActionModal({ type, doc });
  };

  const closeActionModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setActionModal({ type: null, doc: null });
    setActionRemarks('');
    setSelectedFile(null);
    setActionError('');
  };

  // Execute Verification Action
  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!actionModal.doc || !actionModal.type) return;

    setActionError('');
    setSubmittingAction(true);

    try {
      const docId = actionModal.doc._id;

      if (actionModal.type === 'verify') {
        const res = await documentService.verifyDocument(docId, actionRemarks);
        if (res.status === 'success') {
          setSuccess(`Document "${actionModal.doc.title}" verified successfully.`);
        }
      } else if (actionModal.type === 'reject') {
        if (!actionRemarks.trim()) {
          setActionError('Please provide a mandatory reason for rejecting this document.');
          setSubmittingAction(false);
          return;
        }
        const res = await documentService.rejectDocument(docId, actionRemarks.trim());
        if (res.status === 'success') {
          setSuccess(`Document "${actionModal.doc.title}" was marked rejected.`);
        }
      } else if (actionModal.type === 'request-reupload') {
        if (!actionRemarks.trim()) {
          setActionError('Please enter specific instructions for what the customer needs to re-upload.');
          setSubmittingAction(false);
          return;
        }
        const res = await documentService.requestReupload(docId, actionRemarks.trim());
        if (res.status === 'success') {
          setSuccess(`Re-upload requested for "${actionModal.doc.title}".`);
        }
      } else if (actionModal.type === 'reupload') {
        if (!selectedFile) {
          setActionError('Please select a file to upload.');
          setSubmittingAction(false);
          return;
        }
        const res = await documentService.reuploadDocument(docId, selectedFile);
        if (res.status === 'success') {
          setSuccess(`Replacement file uploaded for "${actionModal.doc.title}".`);
        }
      }

      closeActionModal();
      await fetchDetails(true);
    } catch (err) {
      console.error('Document action failed:', err);
      setActionError(err.response?.data?.message || 'Failed to complete document operation.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Compute Overall KYC Status & Metrics
  const mandatoryTypes = ['aadhaar_card', 'pan_card', 'bank_proof'];
  const verifiedCount = documents.filter(
    (d) => (d.verificationStatus || '').toLowerCase() === 'verified'
  ).length;
  const rejectedCount = documents.filter(
    (d) => (d.verificationStatus || '').toLowerCase() === 'rejected'
  ).length;
  const reuploadCount = documents.filter((d) =>
    ['reupload_required', 'action_required', 're-upload required'].includes(
      (d.verificationStatus || '').toLowerCase()
    )
  ).length;

  const totalMandatory = 3;
  const progressPercent = Math.min(100, Math.round((verifiedCount / totalMandatory) * 100));

  const overallStatus =
    lead?.documentVerificationStatus?.toLowerCase() ||
    (rejectedCount > 0
      ? 'rejected'
      : reuploadCount > 0
      ? 'reupload_required'
      : verifiedCount >= totalMandatory
      ? 'verified'
      : 'pending');

  const isFullyVerified = overallStatus === 'verified';
  const isRejected = overallStatus === 'rejected';
  const isReupload =
    overallStatus === 'action_required' ||
    overallStatus === 'reupload_required' ||
    overallStatus === 're-upload required';

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red mb-4"></div>
        <p className="text-xs text-brand-textSecondary font-semibold">Loading verification file...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-redLight border border-brand-red/20 flex items-center justify-center mx-auto mb-4 text-brand-red">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-brand-textPrimary mb-2">Lead Record Not Found</h3>
        <p className="text-xs text-brand-textSecondary mb-6">
          {error || 'This loan application does not exist or is not assigned to your desk.'}
        </p>
        <Link
          to="/employee/document-verification"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs font-semibold hover:bg-brand-bg transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Verification Queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full pb-16">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <Link
            to="/employee/document-verification"
            className="p-2 rounded-xl bg-white border border-brand-border hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition shadow-sm"
            title="Back to queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-red font-mono">
                {lead.leadId || 'LEAD'}
              </span>
              <span className="text-brand-border">•</span>
              <span className="text-xs text-brand-textSecondary uppercase tracking-wider font-semibold">
                KYC Verification File
              </span>
            </div>
            <h2 className="text-2xl font-black text-brand-textPrimary">{lead.customerName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDetails(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-brand-border hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition shadow-sm flex items-center gap-2 text-xs font-semibold"
            title="Refresh File"
          >
            <RefreshCw className={`w-4 h-4 text-brand-red ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to={`/employee/lead-processing?id=${lead._id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>Open in Lead Processing Desk</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Global Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Verification Status & Stage Gate Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isFullyVerified
            ? 'bg-emerald-50 border-emerald-200'
            : isRejected
            ? 'bg-brand-redLight border-brand-red/30'
            : isReupload
            ? 'bg-amber-50 border-amber-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                  isFullyVerified
                    ? 'bg-white text-emerald-700 border-emerald-300'
                    : isRejected
                    ? 'bg-white text-brand-red border-brand-red/30'
                    : isReupload
                    ? 'bg-white text-amber-700 border-amber-300'
                    : 'bg-white text-blue-700 border-blue-300'
                }`}
              >
                {isFullyVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>KYC Fully Verified</span>
                  </>
                ) : isRejected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>KYC Rejected</span>
                  </>
                ) : isReupload ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Customer Resubmission Required</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>KYC Verification In Progress</span>
                  </>
                )}
              </span>

              <span className="text-xs font-mono text-brand-textSecondary">
                Current Pipeline Stage:{' '}
                <strong className="text-brand-textPrimary uppercase">{lead.stage || 'In Review'}</strong>
              </span>
            </div>

            <p className="text-xs text-brand-textSecondary max-w-3xl leading-relaxed">
              {isFullyVerified
                ? 'All mandatory customer KYC and bank records have been approved. This lead file is eligible to advance to Sanction and Disbursement stages in the Lead Processing desk.'
                : isRejected
                ? 'One or more required documents were rejected. Please review rejection reasons below. The loan file cannot advance to Sanction or Disbursement until verified.'
                : isReupload
                ? 'Customer or sourcing partner has been requested to submit replacement documents. Awaiting re-upload.'
                : 'Review each submitted document below. Mandatory documents (Aadhaar Card, PAN Card, and Bank Proof) must all be verified before sanctioning or disbursement.'}
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="w-full lg:w-72 bg-white p-4 rounded-xl border border-brand-border space-y-2 shrink-0 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-brand-textSecondary font-semibold">Verification Progress</span>
              <span className="text-brand-textPrimary font-black font-mono">
                {verifiedCount}/{totalMandatory} Mandatory Docs
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-brand-border">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFullyVerified
                    ? 'bg-emerald-600'
                    : isRejected
                    ? 'bg-brand-red'
                    : isReupload
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-brand-textSecondary">
              <span>{progressPercent}% Complete</span>
              <span>{totalMandatory - verifiedCount > 0 ? `${totalMandatory - verifiedCount} pending` : 'All cleared'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lead & Customer Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-border p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <h3 className="text-sm font-black text-brand-textPrimary uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-brand-red" />
              <span>Customer Information</span>
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-bg text-brand-textSecondary border border-brand-border">
              Source: {lead.source || 'Website'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-xs font-bold text-brand-textPrimary mt-0.5 block">
                {lead.customerName || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Mobile Number
              </span>
              <a
                href={`tel:${lead.customerPhone}`}
                className="text-xs font-bold text-brand-red hover:underline mt-0.5 inline-flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>{lead.customerPhone || 'N/A'}</span>
              </a>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Email Address
              </span>
              <a
                href={`mailto:${lead.customerEmail}`}
                className="text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary mt-0.5 inline-flex items-center gap-1 truncate max-w-full"
              >
                <Mail className="w-3 h-3 text-brand-textSecondary" />
                <span className="truncate">{lead.customerEmail || 'N/A'}</span>
              </a>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                City / Location
              </span>
              <span className="text-xs font-bold text-brand-textPrimary mt-0.5 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-textSecondary" />
                <span>{lead.city || 'N/A'}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Employment Type
              </span>
              <span className="text-xs font-bold text-brand-textPrimary mt-0.5 inline-flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-brand-textSecondary" />
                <span>{lead.employmentType || 'Salaried'}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Monthly Income
              </span>
              <span className="text-xs font-bold text-brand-textPrimary mt-0.5 inline-flex items-center gap-1 font-mono">
                <IndianRupee className="w-3 h-3 text-brand-textSecondary" />
                <span>{lead.monthlyIncome ? Number(lead.monthlyIncome).toLocaleString('en-IN') : 'N/A'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Loan Request Summary */}
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-black text-brand-textPrimary uppercase tracking-wider flex items-center gap-2 border-b border-brand-border pb-4">
            <Building2 className="w-4 h-4 text-brand-red" />
            <span>Loan Application Info</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Category
              </span>
              <span className="text-xs font-bold text-brand-textPrimary">
                {lead.loanCategory?.name || 'General Loan'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Requested Amount
              </span>
              <span className="text-lg font-black text-emerald-700 font-mono">
                ₹{Number(lead.loanAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                  Preferred Bank
                </span>
                <span className="text-xs font-bold text-brand-textPrimary">
                  {lead.preferredBank?.name || 'Any Bank'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                  Tenure
                </span>
                <span className="text-xs font-bold text-brand-textPrimary">
                  {lead.tenureMonths ? `${lead.tenureMonths} Months` : 'Standard'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold text-brand-textSecondary uppercase tracking-wider block">
                Created On
              </span>
              <span className="text-xs text-brand-textSecondary font-mono">
                {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Documents Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-brand-textPrimary flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-brand-red" />
              <span>Customer KYC & Compliance Documents</span>
            </h3>
            <p className="text-xs text-brand-textSecondary mt-0.5">
              Review and verify submitted files. All 3 mandatory documents must be approved.
            </p>
          </div>

          <span className="text-xs font-mono text-brand-textSecondary">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </span>
        </div>

        {documents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-brand-border shadow-sm">
            <FileText className="w-12 h-12 text-brand-textSecondary/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-brand-textPrimary mb-1">No Documents Uploaded Yet</h4>
            <p className="text-xs text-brand-textSecondary max-w-md mx-auto mb-4">
              The applicant has not yet submitted any KYC files, or files were not attached during lead submission.
            </p>
            <Link
              to={`/employee/lead-processing?id=${lead._id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-semibold shadow-sm"
            >
              <span>Upload Document in Processing Desk</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map((doc) => {
              const docStatus = (doc.verificationStatus || 'pending').toLowerCase();
              const isDocVerified = docStatus === 'verified';
              const isDocRejected = docStatus === 'rejected';
              const isDocReupload =
                docStatus === 'reupload_required' ||
                docStatus === 'action_required' ||
                docStatus === 're-upload required';
              const isMandatory = mandatoryTypes.includes(doc.documentType);

              return (
                <div
                  key={doc._id}
                  className={`bg-white rounded-2xl border shadow-sm transition-all p-5 space-y-4 ${
                    isDocVerified
                      ? 'border-emerald-200'
                      : isDocRejected
                      ? 'border-brand-red/30'
                      : isDocReupload
                      ? 'border-amber-200'
                      : 'border-brand-border hover:border-brand-red/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Document Header & Details */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                          isDocVerified
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : isDocRejected
                            ? 'bg-brand-redLight text-brand-red border-brand-red/20'
                            : isDocReupload
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-brand-redLight text-brand-red border-brand-red/20'
                        }`}
                      >
                        <FileText className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-brand-textPrimary">{doc.title}</h4>
                          {isMandatory && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-redLight text-brand-red border border-brand-red/20 uppercase tracking-wider">
                              Mandatory KYC
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isDocVerified
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isDocRejected
                                ? 'bg-brand-redLight text-brand-red border-brand-red/30'
                                : isDocReupload
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isDocVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified</span>
                              </>
                            ) : isDocRejected ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </>
                            ) : isDocReupload ? (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                <span>Re-upload Required</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending Review</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* File metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-textSecondary font-mono">
                          <span className="text-brand-textPrimary font-semibold truncate max-w-xs">
                            {doc.originalName || doc.fileName}
                          </span>
                          <span>•</span>
                          <span>
                            {doc.fileSize
                              ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`
                              : 'PDF/Image'}
                          </span>
                          <span>•</span>
                          <span>
                            Uploaded{' '}
                            {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {doc.uploadedBy && (
                            <>
                              <span>•</span>
                              <span>By: {doc.uploadedBy.name || 'Applicant'}</span>
                            </>
                          )}
                        </div>

                        {/* Status Remarks / Reasons */}
                        {isDocVerified && doc.verificationRemarks && (
                          <div className="text-xs text-emerald-700 pt-1">
                            <span className="font-semibold">Officer Note:</span> {doc.verificationRemarks}
                          </div>
                        )}
                        {isDocRejected && doc.rejectionReason && (
                          <div className="text-xs text-brand-red pt-1">
                            <span className="font-semibold">Rejection Reason:</span> {doc.rejectionReason}
                          </div>
                        )}
                        {isDocReupload && doc.reuploadReason && (
                          <div className="text-xs text-amber-700 pt-1">
                            <span className="font-semibold">Instructions:</span> {doc.reuploadReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View / Download Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
                      <button
                        onClick={() => handlePreviewDoc(doc)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border flex items-center gap-1.5 transition shadow-sm"
                        title="Preview Document Inline"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-red" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textPrimary text-xs font-semibold border border-brand-border flex items-center gap-1.5 transition shadow-sm"
                        title="Download Document File"
                      >
                        <Download className="w-3.5 h-3.5 text-brand-textSecondary" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Operational Action Buttons (Employee Only) */}
                  <div className="pt-3 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Verify / Approve */}
                      {!isDocVerified && (
                        <button
                          onClick={() => openActionModal('verify', doc)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>
                      )}

                      {/* Reject */}
                      {!isDocRejected && (
                        <button
                          onClick={() => openActionModal('reject', doc)}
                          className="px-3 py-1.5 rounded-xl bg-brand-redLight hover:bg-brand-red/20 text-brand-red text-xs font-bold border border-brand-red/30 transition flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Request Re-upload */}
                      {!isDocReupload && (
                        <button
                          onClick={() => openActionModal('request-reupload', doc)}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200 transition flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Re-upload</span>
                        </button>
                      )}

                      {/* Replace / Re-upload File */}
                      <button
                        onClick={() => openActionModal('reupload', doc)}
                        className="px-3 py-1.5 rounded-xl bg-brand-redLight hover:bg-brand-red/20 text-brand-red text-xs font-bold border border-brand-red/30 transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace File</span>
                      </button>
                    </div>

                    {/* Audit History Accordion Toggle */}
                    {doc.verificationHistory && doc.verificationHistory.length > 0 && (
                      <button
                        onClick={() => toggleAudit(doc._id)}
                        className="text-xs text-brand-textSecondary hover:text-brand-textPrimary flex items-center gap-1 font-semibold transition"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>Audit Trail ({doc.verificationHistory.length})</span>
                        {expandedAudits[doc._id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Audit Trail */}
                  {expandedAudits[doc._id] && doc.verificationHistory && doc.verificationHistory.length > 0 && (
                    <div className="pt-3 border-t border-brand-border space-y-2">
                      <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">
                        Verification History & Timeline
                      </span>
                      <div className="space-y-2 pl-3 border-l-2 border-brand-border">
                        {doc.verificationHistory.map((item, idx) => (
                          <div key={idx} className="text-xs space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-brand-textPrimary capitalize">
                                {item.action || 'Updated'}
                              </span>
                              <span className="text-brand-border">•</span>
                              <span className="text-brand-textSecondary font-mono text-[11px]">
                                {new Date(item.timestamp || item.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {item.remarks && (
                              <p className="text-brand-textSecondary text-[11px]">
                                Remarks: {item.remarks}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* ACTION MODAL (Verify / Reject / Request Re-upload / Replace) */}
      {/* ========================================================== */}
      {actionModal.type && actionModal.type !== 'preview' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-brand-border p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <h3 className="text-base font-black text-brand-textPrimary flex items-center gap-2">
                {actionModal.type === 'verify' && (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Approve & Verify Document</span>
                  </>
                )}
                {actionModal.type === 'reject' && (
                  <>
                    <XCircle className="w-5 h-5 text-brand-red" />
                    <span>Reject Document</span>
                  </>
                )}
                {actionModal.type === 'request-reupload' && (
                  <>
                    <RotateCcw className="w-5 h-5 text-amber-600" />
                    <span>Request Customer Re-upload</span>
                  </>
                )}
                {actionModal.type === 'reupload' && (
                  <>
                    <Upload className="w-5 h-5 text-brand-red" />
                    <span>Replace Document File</span>
                  </>
                )}
              </h3>
              <button
                onClick={closeActionModal}
                disabled={submittingAction}
                className="text-brand-textSecondary hover:text-brand-textPrimary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-textSecondary space-y-1">
              <div>
                <span className="text-brand-textSecondary">Document:</span>{' '}
                <strong className="text-brand-textPrimary">{actionModal.doc?.title}</strong>
              </div>
              <div>
                <span className="text-brand-textSecondary">Lead:</span>{' '}
                <span className="font-mono text-brand-textPrimary">{lead.customerName} ({lead.leadId})</span>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-brand-redLight border border-brand-red/30 text-xs text-brand-red flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAction} className="space-y-4">
              {actionModal.type === 'verify' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-textPrimary">
                    Verification Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    placeholder="e.g. Details verified against PAN NSDL database / clear photo"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-brand-textPrimary focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              )}

              {actionModal.type === 'reject' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-textPrimary flex items-center justify-between">
                    <span>Rejection Reason</span>
                    <span className="text-[10px] text-brand-red font-bold">Mandatory</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    placeholder="Enter explicit reason for rejection (e.g. Name mismatch, illegible text, expired document)..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-xs text-brand-textPrimary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
                  />
                </div>
              )}

              {actionModal.type === 'request-reupload' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-brand-textPrimary flex items-center justify-between">
                    <span>Re-upload Instructions for Customer / Partner</span>
                    <span className="text-[10px] text-amber-600 font-bold">Mandatory</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    placeholder="Explain clearly what document the customer needs to re-upload (e.g. Please provide a clear colored scan with all 4 corners visible)..."
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-3 text-xs text-brand-textPrimary focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              )}

              {actionModal.type === 'reupload' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-brand-textPrimary flex items-center justify-between">
                    <span>Select Replacement File</span>
                    <span className="text-[10px] text-brand-textSecondary">PDF, JPG, PNG (Max 10MB)</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-2.5 text-xs text-brand-textSecondary file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-red file:text-white hover:file:bg-brand-deepRed cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
                  />
                  {selectedFile && (
                    <p className="text-[11px] text-brand-red font-mono">
                      Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={submittingAction}
                  className="px-4 py-2.5 rounded-xl bg-brand-bg hover:bg-gray-200 text-brand-textPrimary text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-md ${
                    actionModal.type === 'verify'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : actionModal.type === 'reject'
                      ? 'bg-brand-red hover:bg-brand-deepRed shadow-brand-red/20'
                      : actionModal.type === 'request-reupload'
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                      : 'bg-brand-red hover:bg-brand-deepRed shadow-brand-red/20'
                  }`}
                >
                  {submittingAction && (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {actionModal.type === 'verify'
                      ? 'Confirm & Approve'
                      : actionModal.type === 'reject'
                      ? 'Confirm Rejection'
                      : actionModal.type === 'request-reupload'
                      ? 'Send Re-upload Request'
                      : 'Upload File'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* DOCUMENT PREVIEW MODAL */}
      {/* ========================================================== */}
      {actionModal.type === 'preview' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-2xl border border-brand-border flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
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
                  className="p-1.5 rounded-xl bg-white hover:bg-brand-bg text-brand-textSecondary hover:text-brand-textPrimary transition shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
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
                    className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
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
