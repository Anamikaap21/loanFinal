import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  GitBranch,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Upload,
  User,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  X,
  History,
  AlertTriangle,
  FolderOpen,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';
import documentService from '../../../services/documentService.js';

export default function EmployeeLeadProcessing() {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('id');

  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stage Update Form State
  const [newStatus, setNewStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [sanctionReference, setSanctionReference] = useState('');
  const [sanctionDate, setSanctionDate] = useState('');
  const [disbursedAmount, setDisbursedAmount] = useState('');
  const [disbursementReference, setDisbursementReference] = useState('');
  const [disbursementDate, setDisbursementDate] = useState('');
  const [submittingStage, setSubmittingStage] = useState(false);

  // Document Upload Modal State
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState('pan_card');
  const [docTitle, setDocTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docRemarks, setDocRemarks] = useState('');
  const [submittingDoc, setSubmittingDoc] = useState(false);

  // Document Verification Actions & Modal States
  const [docActionModal, setDocActionModal] = useState({
    type: null, // 'reject' | 'request-reupload' | 'reupload' | 'view'
    doc: null,
  });
  const [docActionReason, setDocActionReason] = useState('');
  const [reuploadFile, setReuploadFile] = useState(null);
  const [submittingDocAction, setSubmittingDocAction] = useState(false);
  const [expandedHistories, setExpandedHistories] = useState({});
  const [viewDocBlobUrl, setViewDocBlobUrl] = useState('');

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

  const stageDescriptions = {
    Lead: 'Initial customer inquiry received and verified.',
    Login: 'File logged into partner bank/NBFC loan portal.',
    'In Process': 'Credit appraisal, legal & technical valuation ongoing.',
    Sanction: 'Credit approved; formal sanction letter generated.',
    Disbursement: 'Loan proceeds released to customer account.',
    PDD: 'Post-Disbursement Documents collected and reconciled.',
    Payout: 'Commission accounted and partner payout finalized.',
    Cancelled: 'File rejected, closed or cancelled by applicant/bank.',
  };

  // Fetch all leads assigned to this employee
  const fetchAssignedLeads = async () => {
    try {
      setLoadingList(true);
      const params = {};
      if (search) params.search = search;
      if (sourceFilter !== 'all') params.source = sourceFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await employeeService.getAssignedLeads(params);
      if (res.status === 'success') {
        setLeads(res.data);

        // Select first lead or preselected
        if (res.data.length > 0) {
          if (preselectedId) {
            const found = res.data.find((l) => l._id === preselectedId);
            if (found) {
              loadLeadFull(found._id);
              return;
            }
          }
          if (!selectedLead) {
            loadLeadFull(res.data[0]._id);
          }
        } else {
          setSelectedLead(null);
          setLeadDetails(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assigned leads:', err);
      setError('Unable to fetch your assigned loan files.');
    } finally {
      setLoadingList(false);
    }
  };

  // Load detailed lead info with documents and audit history
  const loadLeadFull = async (leadId) => {
    try {
      setLoadingDetails(true);
      setError('');
      const res = await employeeService.getLeadDetails(leadId);
      if (res.status === 'success') {
        const lead = res.data.lead;
        setSelectedLead(lead);
        setLeadDetails(res.data);
        setNewStatus(lead.status);
        setSanctionedAmount(lead.sanctionedAmount || lead.requiredLoanAmount || '');
        setSanctionReference(lead.sanctionReferenceNumber || '');
        setSanctionDate(
          lead.sanctionDate ? new Date(lead.sanctionDate).toISOString().split('T')[0] : ''
        );
        setDisbursedAmount(lead.disbursedAmount || lead.requiredLoanAmount || '');
        setDisbursementReference(lead.disbursementReferenceNumber || '');
        setDisbursementDate(
          lead.disbursementDate
            ? new Date(lead.disbursementDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        );
        setRemarks('');
      }
    } catch (err) {
      console.error('Failed to load lead details:', err);
      setError('Unable to load file processing details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchAssignedLeads();
  }, [search, sourceFilter, statusFilter]);

  const handleStageUpdate = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    if (!remarks.trim()) {
      setError('A mandatory remark is required for audit trail when updating file stage.');
      return;
    }

    try {
      setSubmittingStage(true);
      setError('');
      setSuccess('');

      const payload = {
        status: newStatus,
        remarks: remarks.trim(),
      };

      if (['Sanction', 'Disbursement', 'PDD', 'Payout'].includes(newStatus)) {
        if (sanctionedAmount) payload.sanctionedAmount = Number(sanctionedAmount);
        if (sanctionReference) payload.sanctionReferenceNumber = sanctionReference.trim();
        if (sanctionDate) payload.sanctionDate = sanctionDate;
      }

      if (['Disbursement', 'PDD', 'Payout'].includes(newStatus)) {
        if (disbursedAmount) payload.disbursedAmount = Number(disbursedAmount);
        if (disbursementReference) payload.disbursementReferenceNumber = disbursementReference.trim();
        if (disbursementDate) payload.disbursementDate = disbursementDate;
      }

      const res = await employeeService.updateLeadStatus(selectedLead._id, payload);
      setSuccess(`File ${selectedLead.leadId} advanced to "${newStatus}" successfully.`);
      setRemarks('');
      await loadLeadFull(selectedLead._id);
      fetchAssignedLeads();
    } catch (err) {
      console.error('Status transition error:', err);
      setError(err.response?.data?.message || 'Failed to update file stage.');
    } finally {
      setSubmittingStage(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      setSubmittingDoc(true);
      setError('');

      const payload = {
        documentType: docType,
        title: docTitle.trim() || `${docType.replace('_', ' ').toUpperCase()} Document`,
        fileName: `${selectedLead.leadId}_${docType}_${Date.now()}.pdf`,
        filePath: `/uploads/documents/${selectedLead.leadId}_${docType}.pdf`,
        fileUrl: `/uploads/documents/${selectedLead.leadId}_${docType}.pdf`,
        fileSize: 1024 * 350,
        mimeType: 'application/pdf',
        remarks: docRemarks.trim() || `Uploaded during ${selectedLead.status} processing stage.`,
      };

      await employeeService.addLeadDocument(selectedLead._id, payload);
      setSuccess(`Document "${payload.title}" recorded successfully.`);
      setDocModalOpen(false);
      setDocTitle('');
      setDocRemarks('');
      await loadLeadFull(selectedLead._id);
    } catch (err) {
      console.error('Document upload error:', err);
      setError(err.response?.data?.message || 'Failed to add document.');
    } finally {
      setSubmittingDoc(false);
    }
  };

  // ==========================================
  // DOCUMENT VERIFICATION ACTION HANDLERS
  // ==========================================
  const handleVerifyDoc = async (doc) => {
    try {
      setSubmittingDocAction(true);
      setError('');
      await documentService.verifyDocument(doc._id, 'Document verified by Loan Officer');
      setSuccess(`${doc.title} verified successfully.`);
      await loadLeadFull(selectedLead._id);
    } catch (err) {
      console.error('Verify doc error:', err);
      setError(err.response?.data?.message || 'Failed to verify document.');
    } finally {
      setSubmittingDocAction(false);
    }
  };

  const handleRejectDoc = async (e) => {
    e.preventDefault();
    if (!docActionReason.trim()) {
      setError('A mandatory rejection reason is required.');
      return;
    }
    try {
      setSubmittingDocAction(true);
      setError('');
      await documentService.rejectDocument(docActionModal.doc._id, docActionReason.trim());
      setSuccess(`${docActionModal.doc.title} marked as Rejected.`);
      setDocActionModal({ type: null, doc: null });
      setDocActionReason('');
      await loadLeadFull(selectedLead._id);
    } catch (err) {
      console.error('Reject doc error:', err);
      setError(err.response?.data?.message || 'Failed to reject document.');
    } finally {
      setSubmittingDocAction(false);
    }
  };

  const handleRequestReuploadDoc = async (e) => {
    e.preventDefault();
    if (!docActionReason.trim()) {
      setError('A mandatory reason is required for requesting re-upload.');
      return;
    }
    try {
      setSubmittingDocAction(true);
      setError('');
      await documentService.requestReupload(docActionModal.doc._id, docActionReason.trim());
      setSuccess(`Re-upload requested for ${docActionModal.doc.title}.`);
      setDocActionModal({ type: null, doc: null });
      setDocActionReason('');
      await loadLeadFull(selectedLead._id);
    } catch (err) {
      console.error('Request reupload error:', err);
      setError(err.response?.data?.message || 'Failed to request re-upload.');
    } finally {
      setSubmittingDocAction(false);
    }
  };

  const handleReuploadReplacementDoc = async (e) => {
    e.preventDefault();
    if (!reuploadFile) {
      setError('Please choose a replacement file to upload.');
      return;
    }
    try {
      setSubmittingDocAction(true);
      setError('');
      await documentService.reuploadDocument(docActionModal.doc._id, reuploadFile);
      setSuccess(`Replacement uploaded for ${docActionModal.doc.title}. Status reset to Pending.`);
      setDocActionModal({ type: null, doc: null });
      setReuploadFile(null);
      await loadLeadFull(selectedLead._id);
    } catch (err) {
      console.error('Reupload replacement error:', err);
      setError(err.response?.data?.message || 'Failed to upload replacement document.');
    } finally {
      setSubmittingDocAction(false);
    }
  };

  const handleViewDoc = async (doc) => {
    try {
      setError('');
      const blob = await documentService.viewDocumentBlob(doc._id);
      const blobUrl = window.URL.createObjectURL(blob);
      setViewDocBlobUrl(blobUrl);
      setDocActionModal({ type: 'view', doc });
    } catch (err) {
      console.error('View doc error:', err);
      setError(err.response?.data?.message || 'Failed to stream document.');
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      setError('');
      await documentService.downloadDocument(doc._id, doc.originalName || doc.fileName || 'document.pdf');
    } catch (err) {
      console.error('Download doc error:', err);
      setError(err.response?.data?.message || 'Failed to download document.');
    }
  };

  const toggleHistory = (docId) => {
    setExpandedHistories((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  // Helper for step index
  const getCurrentStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return stages.indexOf(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Underwriting & Sanction Desk</span>
        </div>
        <h2 className="text-2xl font-black text-white">Lead Processing Desk</h2>
        <p className="text-xs text-brand-grey">
          Step-by-step 8-stage lifecycle execution, bank sanction coordinates, document vault, and audit trail.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2.5">
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
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-brand-grey hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Files Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-brand-dark p-4 rounded-3xl border border-brand-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Assigned Files ({leads.length})
              </span>
              <span className="text-[10px] text-brand-grey">Live Queue</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-brand-grey absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search file, applicant..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl bg-brand-black border border-brand-border text-white text-[11px] focus:outline-none"
              >
                <option value="all">All Sources</option>
                <option value="website">Website Leads</option>
                <option value="partner">Partner Leads</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl bg-brand-black border border-brand-border text-white text-[11px] focus:outline-none"
              >
                <option value="all">All Stages</option>
                {stages.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {loadingList ? (
              <div className="p-8 text-center text-brand-grey text-xs">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading files...
              </div>
            ) : leads.length === 0 ? (
              <div className="p-6 text-center text-xs text-brand-grey bg-brand-dark rounded-2xl border border-brand-border/40">
                No assigned loan files match the criteria.
              </div>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLead?._id === lead._id;
                return (
                  <div
                    key={lead._id}
                    onClick={() => loadLeadFull(lead._id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-brand-dark/70 hover:bg-brand-dark border-brand-border/60 hover:border-brand-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-white">
                        {lead.leadId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          lead.source === 'partner'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {lead.source === 'partner' ? 'Partner File' : 'Website Direct'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-white truncate">
                      {lead.customerName}
                    </div>
                    <div className="text-[11px] text-brand-grey flex items-center justify-between mt-1">
                      <span>{lead.loanCategory?.name || 'Loan'}</span>
                      <span className="font-bold text-emerald-400">
                        ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-brand-grey">Stage:</span>
                      <span
                        className={`font-semibold ${
                          ['Disbursement', 'PDD', 'Payout'].includes(lead.status)
                            ? 'text-emerald-400'
                            : lead.status === 'Cancelled'
                            ? 'text-brand-red'
                            : 'text-blue-400'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Processing Desk Detail (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedLead ? (
            <div className="p-12 text-center bg-brand-dark rounded-3xl border border-brand-border/60 text-brand-grey space-y-3">
              <FolderOpen className="w-10 h-10 text-brand-grey mx-auto opacity-40" />
              <div className="text-sm font-bold text-white">No File Selected</div>
              <p className="text-xs max-w-sm mx-auto">
                Select an assigned loan file from the left queue to inspect details, advance through the 8 lifecycle stages, and record documents.
              </p>
            </div>
          ) : (
            <>
              {/* Lead Top Summary Card */}
              <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-extrabold text-blue-400">
                        {selectedLead.leadId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedLead.source === 'partner'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {selectedLead.source === 'partner'
                          ? `Partner Referral: ${selectedLead.partnerId?.user?.name || 'Channel'}`
                          : 'Direct Website Lead'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white">{selectedLead.customerName}</h3>
                    <p className="text-xs text-brand-grey mt-0.5">
                      {selectedLead.customerPhone} • {selectedLead.customerEmail || 'No email'} • {selectedLead.city}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-[10px] text-brand-grey uppercase font-bold tracking-wider">
                      Requested Loan Facility
                    </div>
                    <div className="text-xl font-extrabold text-emerald-400">
                      ₹{Number(selectedLead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-brand-lightGrey mt-0.5">
                      {selectedLead.loanCategory?.name} • Bank: {selectedLead.preferredBank?.name || 'Best Match'}
                    </div>
                  </div>
                </div>

                {/* Additional Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-brand-grey text-[10px] block">Employment</span>
                    <span className="font-semibold text-white capitalize">
                      {selectedLead.employmentType || 'Salaried'}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-grey text-[10px] block">Monthly Income</span>
                    <span className="font-semibold text-white">
                      ₹{Number(selectedLead.monthlyIncome || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-grey text-[10px] block">PAN Number</span>
                    <span className="font-mono font-semibold text-white">
                      {selectedLead.panNumber || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-brand-grey text-[10px] block">Assigned Officer</span>
                    <span className="font-semibold text-blue-400">You (Assigned)</span>
                  </div>
                </div>

                {/* Overall Document Verification Status Banner */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-brand-grey font-bold uppercase tracking-wider">
                      Overall KYC Verification:
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        selectedLead.documentVerificationStatus === 'verified'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : selectedLead.documentVerificationStatus === 'rejected'
                          ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                          : ['action_required', 'reupload_required'].includes(
                              selectedLead.documentVerificationStatus
                            )
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {selectedLead.documentVerificationStatus === 'verified' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All Mandatory KYC Documents Verified</span>
                        </>
                      ) : selectedLead.documentVerificationStatus === 'rejected' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>KYC Rejected (Action Required)</span>
                        </>
                      ) : ['action_required', 'reupload_required'].includes(
                          selectedLead.documentVerificationStatus
                        ) ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Customer Re-upload Required</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Verification ({leadDetails?.documents?.filter((d) => (d.verificationStatus || '').toLowerCase() === 'verified').length || 0}/3 Required Verified)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-[11px] text-brand-grey font-medium">
                    Vault: <strong className="text-white">{leadDetails?.documents?.length || 0}</strong> attached files
                  </span>
                </div>
              </div>

              {/* 8-STAGE INTERACTIVE LIFECYCLE STEPPER */}
              <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">8-Stage Loan Lifecycle Stepper</h4>
                    <p className="text-xs text-brand-grey">
                      Official progression from initial intake to disbursement and payout.
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedLead.status === 'Cancelled'
                        ? 'bg-brand-red/10 text-brand-red border border-brand-red/30'
                        : ['Disbursement', 'PDD', 'Payout'].includes(selectedLead.status)
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    Current: {selectedLead.status}
                  </span>
                </div>

                {/* Horizontal Stepper */}
                <div className="relative py-4 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[620px]">
                    {stages.filter((s) => s !== 'Cancelled').map((stage, idx) => {
                      const currentIdx = getCurrentStepIndex(selectedLead.status);
                      const isPast = currentIdx > idx;
                      const isCurrent = currentIdx === idx;

                      return (
                        <div key={stage} className="flex-1 flex flex-col items-center relative">
                          {/* Connecting Line */}
                          {idx !== 0 && (
                            <div
                              className={`absolute top-4 -left-1/2 w-full h-0.5 z-0 ${
                                isPast || isCurrent ? 'bg-blue-600' : 'bg-white/10'
                              }`}
                            />
                          )}

                          {/* Node circle */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                              isPast
                                ? 'bg-blue-600 text-white'
                                : isCurrent
                                ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                                : 'bg-brand-card text-brand-grey border border-brand-border'
                            }`}
                          >
                            {isPast ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>

                          <span
                            className={`mt-2 text-[11px] font-semibold ${
                              isCurrent
                                ? 'text-blue-400 font-bold'
                                : isPast
                                ? 'text-white'
                                : 'text-brand-grey'
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedLead.status === 'Cancelled' && (
                  <div className="mt-2 p-3 rounded-xl bg-brand-red/10 border border-brand-red/30 text-xs text-brand-red flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>This loan file is marked as CANCELLED / REJECTED.</span>
                  </div>
                )}
              </div>

              {/* ADVANCE STAGE FORM */}
              <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-1">Advance File Stage</h4>
                <p className="text-xs text-brand-grey mb-4">
                  Select the next stage, input bank sanction/disbursement coordinates, and write mandatory remarks.
                </p>

                <form onSubmit={handleStageUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                        Transition To Stage *
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      >
                        {stages.map((st) => (
                          <option key={st} value={st}>
                            {st} — {stageDescriptions[st]}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Partner Referral Notice for Disbursement */}
                    {selectedLead.source === 'partner' &&
                      ['Disbursement', 'PDD', 'Payout'].includes(newStatus) && (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center gap-2.5 text-xs text-purple-300">
                          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>
                            Moving to Disbursement will automatically trigger partner commission calculation & payout eligibility.
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Dynamic inputs for Sanction */}
                  {['Sanction', 'Disbursement', 'PDD', 'Payout'].includes(newStatus) && (
                    <div className="p-4 rounded-2xl bg-brand-black/60 border border-brand-border/60 space-y-3">
                      <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sanction Approval Information</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Sanctioned Amount (₹)
                          </label>
                          <input
                            type="number"
                            value={sanctionedAmount}
                            onChange={(e) => setSanctionedAmount(e.target.value)}
                            placeholder="e.g. 1500000"
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Sanction Reference / Letter No.
                          </label>
                          <input
                            type="text"
                            value={sanctionReference}
                            onChange={(e) => setSanctionReference(e.target.value)}
                            placeholder="e.g. HDFC-SAN-2026-99"
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Sanction Date
                          </label>
                          <input
                            type="date"
                            value={sanctionDate}
                            onChange={(e) => setSanctionDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dynamic inputs for Disbursement */}
                  {['Disbursement', 'PDD', 'Payout'].includes(newStatus) && (
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>Disbursement & UTR Banking Information</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Disbursed Amount (₹) *
                          </label>
                          <input
                            type="number"
                            value={disbursedAmount}
                            onChange={(e) => setDisbursedAmount(e.target.value)}
                            placeholder="e.g. 1500000"
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Disbursement UTR / Account No.
                          </label>
                          <input
                            type="text"
                            value={disbursementReference}
                            onChange={(e) => setDisbursementReference(e.target.value)}
                            placeholder="e.g. UTR-AXIS-99281928"
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-brand-grey mb-1">
                            Disbursement Date
                          </label>
                          <input
                            type="date"
                            value={disbursementDate}
                            onChange={(e) => setDisbursementDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-brand-dark border border-brand-border text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                      Mandatory Processing Remarks (Audit Trail) *
                    </label>
                    <textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter verification notes, bank query responses, or reason for status advancement..."
                      className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingStage}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submittingStage ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Advancing File...</span>
                        </>
                      ) : (
                        <>
                          <span>Save & Advance Stage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* DOCUMENTS & ATTACHMENTS VAULT */}
              <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span>Document Vault & KYC Verification Desk</span>
                    </h4>
                    <p className="text-xs text-brand-grey mt-0.5">
                      Review, verify, reject, or request re-upload for customer KYC & bank proof files.
                    </p>
                  </div>
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-brand-border text-xs font-semibold transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Attach Document</span>
                  </button>
                </div>

                {/* Verification Guidance Note */}
                <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
                  <FileCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">Loan Officer Verification Responsibility:</span>
                    <p className="text-[11px] text-brand-lightGrey">
                      Verify each of the 3 mandatory documents (<strong className="text-white">Aadhaar Card</strong>, <strong className="text-white">PAN Card</strong>, and <strong className="text-white">Bank Proof</strong>). When all 3 are verified, the file automatically achieves <span className="text-emerald-400 font-bold">Verified</span> status. Pipeline stages remain independent from KYC status.
                    </p>
                  </div>
                </div>

                {leadDetails?.documents?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-brand-grey bg-brand-black/40 rounded-2xl border border-brand-border/40 space-y-2">
                    <FolderOpen className="w-8 h-8 text-brand-grey mx-auto opacity-40" />
                    <div className="text-white font-semibold">No Documents Attached Yet</div>
                    <p className="text-[11px]">
                      Customer did not attach documents at submission. Click "Attach Document" to upload on customer's behalf.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leadDetails?.documents?.map((doc) => {
                      const isVerified = (doc.verificationStatus || '').toLowerCase() === 'verified';
                      const isRejected = (doc.verificationStatus || '').toLowerCase() === 'rejected';
                      const isReupload = ['reupload_required', 're-upload required'].includes(
                        (doc.verificationStatus || '').toLowerCase()
                      );
                      const isExpanded = expandedHistories[doc._id];

                      return (
                        <div
                          key={doc._id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isVerified
                              ? 'bg-brand-black/80 border-emerald-500/30'
                              : isRejected
                              ? 'bg-brand-black/80 border-brand-red/30'
                              : isReupload
                              ? 'bg-brand-black/80 border-amber-500/30'
                              : 'bg-brand-black/80 border-brand-border/60'
                          }`}
                        >
                          {/* Document Header Row */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-white/5">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isVerified
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : isRejected
                                    ? 'bg-brand-red/10 text-brand-red border-brand-red/20'
                                    : isReupload
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}
                              >
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5 className="text-sm font-bold text-white truncate">{doc.title}</h5>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-brand-lightGrey border border-white/10 uppercase">
                                    {doc.documentType?.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-[11px] text-brand-grey mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span className="font-mono text-white/80 truncate max-w-[200px]">
                                    {doc.originalName || doc.fileName}
                                  </span>
                                  <span>•</span>
                                  <span>{doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '100 KB'}</span>
                                  <span>•</span>
                                  <span>Uploaded by <strong className="text-white capitalize">{doc.uploadedByRole || 'customer'}</strong></span>
                                  <span>•</span>
                                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="sm:text-right shrink-0">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                  isVerified
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : isRejected
                                    ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                                    : isReupload
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                }`}
                              >
                                {isVerified ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verified</span>
                                  </>
                                ) : isRejected ? (
                                  <>
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Rejected</span>
                                  </>
                                ) : isReupload ? (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Re-upload Required</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Pending Verification</span>
                                  </>
                                )}
                              </span>

                              {isVerified && doc.verifiedByName && (
                                <div className="text-[10px] text-emerald-400/80 mt-1">
                                  by {doc.verifiedByName} on {new Date(doc.verifiedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rejection / Re-upload Notice */}
                          {isRejected && doc.rejectionReason && (
                            <div className="mt-3 p-3 rounded-xl bg-brand-red/10 border border-brand-red/25 text-xs text-brand-red flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block">Rejection Reason:</span>
                                <span>{doc.rejectionReason}</span>
                              </div>
                            </div>
                          )}

                          {isReupload && doc.reuploadReason && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start gap-2">
                              <RotateCcw className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                              <div>
                                <span className="font-bold block">Re-upload Instructions:</span>
                                <span>{doc.reuploadReason}</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleViewDoc(doc)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadDoc(doc)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Download</span>
                              </button>

                              {/* Officer Verification Buttons */}
                              {!isVerified && (
                                <button
                                  type="button"
                                  onClick={() => handleVerifyDoc(doc)}
                                  disabled={submittingDocAction}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Document</span>
                                </button>
                              )}

                              {!isRejected && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocActionModal({ type: 'reject', doc });
                                    setDocActionReason('');
                                  }}
                                  disabled={submittingDocAction}
                                  className="px-3 py-1.5 rounded-lg bg-brand-red/15 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}

                              {!isReupload && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDocActionModal({ type: 'request-reupload', doc });
                                    setDocActionReason('');
                                  }}
                                  disabled={submittingDocAction}
                                  className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Request Re-upload</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setDocActionModal({ type: 'reupload', doc });
                                  setReuploadFile(null);
                                }}
                                disabled={submittingDocAction}
                                className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Replace File</span>
                              </button>
                            </div>

                            {/* Audit History Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleHistory(doc._id)}
                              className="px-2.5 py-1 rounded-lg text-brand-grey hover:text-white text-[11px] font-medium flex items-center gap-1 hover:bg-white/5 transition"
                            >
                              <History className="w-3.5 h-3.5 text-blue-400" />
                              <span>Audit History ({doc.verificationHistory?.length || 0})</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expandable Audit History Timeline */}
                          {isExpanded && (
                            <div className="mt-3.5 pt-3 border-t border-white/5 space-y-2">
                              <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <History className="w-3 h-3 text-blue-400" />
                                <span>Document Verification Audit Trail</span>
                              </div>

                              {doc.verificationHistory?.length === 0 ? (
                                <p className="text-[11px] text-brand-grey italic">No audit transitions recorded yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {[...doc.verificationHistory].reverse().map((item, hIdx) => (
                                    <div
                                      key={hIdx}
                                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] space-y-1"
                                    >
                                      <div className="flex items-center justify-between text-brand-grey">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-white capitalize">{item.newStatus?.replace('_', ' ')}</span>
                                          {item.previousStatus && (
                                            <span className="text-[10px] text-brand-grey">
                                              (from {item.previousStatus})
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-mono text-[10px]">
                                          {new Date(item.changedAt).toLocaleString()}
                                        </span>
                                      </div>
                                      {item.reason && (
                                        <p className="text-brand-lightGrey">
                                          Reason: <span className="text-white">{item.reason}</span>
                                        </p>
                                      )}
                                      <div className="text-[10px] text-brand-grey">
                                        Officer: <span className="text-blue-400">{item.changedByName || 'System / Officer'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AUDIT LOG & REMARKS HISTORY */}
              <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-400" />
                  <h4 className="text-sm font-bold text-white">Lifecycle Audit Log & Remarks</h4>
                </div>

                <div className="space-y-3">
                  {selectedLead.statusHistory?.length === 0 ? (
                    <div className="text-xs text-brand-grey">No historical transitions recorded yet.</div>
                  ) : (
                    [...selectedLead.statusHistory].reverse().map((hist, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-brand-black/60 border border-brand-border/40 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-400">{hist.status}</span>
                            {hist.previousStatus && (
                              <span className="text-[10px] text-brand-grey">
                                (from {hist.previousStatus})
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-brand-grey font-mono">
                            {new Date(hist.changedAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-brand-lightGrey">{hist.remarks}</p>

                        <div className="text-[10px] text-brand-grey pt-1 border-t border-white/5">
                          Logged by: <span className="text-white font-medium">{hist.changedByName || 'Officer'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DOCUMENT ATTACH MODAL */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDocModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Attach File Document</h3>
            <p className="text-xs text-brand-grey mb-4">
              File: <span className="font-mono text-blue-400 font-bold">{selectedLead?.leadId}</span>
            </p>

            <form onSubmit={handleAddDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Document Category *
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                  required
                >
                  <option value="pan_card">PAN Card</option>
                  <option value="aadhaar_card">Aadhaar Card</option>
                  <option value="salary_slip">Salary Slips (3 Months)</option>
                  <option value="bank_statement">Bank Statement (6 Months)</option>
                  <option value="itr">ITR / Form 16</option>
                  <option value="property_docs">Property / Collateral Docs</option>
                  <option value="other">Other Sanction Supporting Doc</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Document Title / Description *
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Customer Verified Aadhaar Card"
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Officer Notes / Verification Remarks
                </label>
                <textarea
                  rows={2}
                  value={docRemarks}
                  onChange={(e) => setDocRemarks(e.target.value)}
                  placeholder="e.g. Scanned copy verified against originals."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {submittingDoc ? 'Recording...' : 'Attach Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT INLINE PREVIEW MODAL */}
      {docActionModal.type === 'view' && docActionModal.doc && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-4xl w-full h-[85vh] p-6 shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{docActionModal.doc.title}</h3>
                  <p className="text-xs text-brand-grey font-mono">
                    {docActionModal.doc.originalName || docActionModal.doc.fileName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(docActionModal.doc)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => {
                    if (viewDocBlobUrl) window.URL.revokeObjectURL(viewDocBlobUrl);
                    setViewDocBlobUrl('');
                    setDocActionModal({ type: null, doc: null });
                  }}
                  className="p-1.5 rounded-xl text-brand-grey hover:text-white bg-white/5 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Frame / Viewer */}
            <div className="flex-1 mt-4 bg-brand-black rounded-2xl overflow-hidden border border-white/5 relative flex items-center justify-center">
              {viewDocBlobUrl ? (
                docActionModal.doc.mimeType?.startsWith('image/') ? (
                  <img
                    src={viewDocBlobUrl}
                    alt={docActionModal.doc.title}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                ) : (
                  <iframe
                    src={viewDocBlobUrl}
                    title={docActionModal.doc.title}
                    className="w-full h-full border-0"
                  />
                )
              ) : (
                <div className="text-xs text-brand-grey animate-pulse">Loading secure document stream...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REJECT DOCUMENT MODAL */}
      {docActionModal.type === 'reject' && docActionModal.doc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-brand-red/40 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDocActionModal({ type: null, doc: null })}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-brand-red font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Reject Customer Document</span>
            </div>
            <p className="text-xs text-brand-grey mb-4">
              Rejecting <strong className="text-white">{docActionModal.doc.title}</strong> will flag the document and notify applicant / referring channel.
            </p>

            <form onSubmit={handleRejectDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Mandatory Rejection Reason *
                </label>
                <textarea
                  rows={3}
                  value={docActionReason}
                  onChange={(e) => setDocActionReason(e.target.value)}
                  placeholder="e.g. Document image is blurred; name does not match application details; expired ID."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-brand-red/40 text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-brand-red"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocActionModal({ type: null, doc: null })}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDocAction || !docActionReason.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold transition shadow-lg shadow-brand-red/25 disabled:opacity-50"
                >
                  {submittingDocAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST RE-UPLOAD MODAL */}
      {docActionModal.type === 'request-reupload' && docActionModal.doc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-amber-500/40 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setDocActionModal({ type: null, doc: null })}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-sm">
              <RotateCcw className="w-5 h-5" />
              <span>Request Document Re-upload</span>
            </div>
            <p className="text-xs text-brand-grey mb-4">
              Request a replacement copy of <strong className="text-white">{docActionModal.doc.title}</strong> with instructions.
            </p>

            <form onSubmit={handleRequestReuploadDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Reason / Re-upload Instructions *
                </label>
                <textarea
                  rows={3}
                  value={docActionReason}
                  onChange={(e) => setDocActionReason(e.target.value)}
                  placeholder="e.g. Please provide a clear color scanned copy of both front and back sides."
                  className="w-full px-3 py-2 rounded-xl bg-brand-black border border-amber-500/40 text-white text-xs placeholder:text-brand-grey focus:outline-none focus:ring-1 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDocActionModal({ type: null, doc: null })}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDocAction || !docActionReason.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/25 disabled:opacity-50"
                >
                  {submittingDocAction ? 'Sending Request...' : 'Send Re-upload Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RE-UPLOAD / REPLACE FILE MODAL */}
      {docActionModal.type === 'reupload' && docActionModal.doc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-brand-dark rounded-3xl border border-blue-500/40 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setDocActionModal({ type: null, doc: null });
                setReuploadFile(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-grey hover:text-white bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold text-sm">
              <Upload className="w-5 h-5" />
              <span>Replace / Re-upload File</span>
            </div>
            <p className="text-xs text-brand-grey mb-4">
              Upload replacement file for <strong className="text-white">{docActionModal.doc.title}</strong>. This will automatically reset status to <span className="text-blue-400 font-semibold">Pending</span>.
            </p>

            <form onSubmit={handleReuploadReplacementDoc} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-lightGrey mb-1 font-semibold">
                  Choose Replacement File (PDF, JPG, PNG - Max 10MB) *
                </label>
                <input
                  type="file"
                  accept=".pdf,image/jpeg,image/jpg,image/png"
                  onChange={(e) => setReuploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-brand-grey file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
                  required
                />
                {reuploadFile && (
                  <p className="text-[11px] text-brand-lightGrey mt-2">
                    Selected: <span className="text-white font-medium">{reuploadFile.name}</span> ({(reuploadFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDocActionModal({ type: null, doc: null });
                    setReuploadFile(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDocAction || !reuploadFile}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/25 disabled:opacity-50"
                >
                  {submittingDocAction ? 'Uploading...' : 'Upload Replacement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
