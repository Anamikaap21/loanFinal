import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Upload,
  FileText,
  LogOut,
  Building2,
  User,
  Landmark,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import partnerService from '../../../services/partnerService.js';
import documentService from '../../../services/documentService.js';

export default function PartnerResubmitDocuments() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected replacement files mapped by docId
  const [replacementFiles, setReplacementFiles] = useState({});
  const [submittingDocId, setSubmittingDocId] = useState(null);

  const fetchKycStatus = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError('');

      const res = await partnerService.getKycStatus();
      if (res.status === 'success') {
        setKycData(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner KYC status:', err);
      setError('Unable to load current registration status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/crm-login', { replace: true });
  };

  const handleFileChange = (docId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only PDF, JPG, JPEG, and PNG files are accepted.');
      return;
    }

    setReplacementFiles((prev) => ({
      ...prev,
      [docId]: file,
    }));
  };

  const handleResubmit = async (docId) => {
    const file = replacementFiles[docId];
    if (!file) {
      alert('Please choose a replacement file first.');
      return;
    }

    try {
      setSubmittingDocId(docId);
      setError('');
      setSuccess('');

      const res = await partnerService.resubmitDocument(docId, file);
      if (res.status === 'success') {
        setSuccess('Document replacement uploaded successfully. Your file is now pending Admin verification.');
        setReplacementFiles((prev) => {
          const updated = { ...prev };
          delete updated[docId];
          return updated;
        });
        await fetchKycStatus(true);
      }
    } catch (err) {
      console.error('Failed to resubmit document:', err);
      setError(err.response?.data?.message || 'Failed to resubmit document. Please try again.');
    } finally {
      setSubmittingDocId(null);
    }
  };

  const regStatus = (kycData?.registrationStatus || 'PENDING').toUpperCase();
  const isResubmissionReq = regStatus === 'RESUBMISSION_REQUIRED' || regStatus === 'REUPLOAD_REQUIRED';
  const isPending = regStatus === 'PENDING';
  const isApproved = regStatus === 'APPROVED';
  const isRejected = regStatus === 'REJECTED';

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-brand-grey font-semibold">Loading partner registration file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-brand-dark border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-emerald-600/20">
            RC
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1">
              REAL<span className="text-brand-red">CRED</span>
            </div>
            <div className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">
              Partner Verification Portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchKycStatus(true)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-grey hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-brand-red/10 text-brand-grey hover:text-brand-red border border-white/10 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Global Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Verification Status Banner */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            isApproved
              ? 'bg-emerald-950/20 border-emerald-500/30'
              : isRejected
              ? 'bg-brand-red/10 border-brand-red/30'
              : isResubmissionReq
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-blue-500/10 border-blue-500/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isApproved
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isRejected
                    ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                    : isResubmissionReq
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                }`}
              >
                {isApproved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Partner Account Approved & Active</span>
                  </>
                ) : isRejected ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Registration Rejected</span>
                  </>
                ) : isResubmissionReq ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Action Required: Document Resubmission</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Admin Verification</span>
                  </>
                )}
              </span>

              <h2 className="text-xl font-black text-white">
                {isResubmissionReq
                  ? 'Document Re-upload Requested by Admin'
                  : isPending
                  ? 'Your KYC Documents are Under Admin Review'
                  : isApproved
                  ? 'Account Activated Successfully'
                  : 'Partner Registration Declined'}
              </h2>

              <p className="text-xs text-brand-lightGrey max-w-2xl leading-relaxed">
                {isResubmissionReq
                  ? kycData?.reuploadRemarks ||
                    'RealCred Administration has requested you to replace one or more submitted KYC documents. Please inspect the feedback below and upload updated files.'
                  : isPending
                  ? 'Your registration has been submitted successfully. Your KYC documents are pending Admin verification. Your Partner CRM account will be activated after approval.'
                  : isApproved
                  ? 'Your account is active. You can now access your full Partner CRM dashboard.'
                  : kycData?.rejectionRemarks ||
                    'Your registration could not be approved due to compliance criteria.'}
              </p>
            </div>

            {/* Registration ID pill */}
            <div className="p-4 rounded-2xl bg-brand-black/60 border border-white/5 space-y-1 text-xs shrink-0 font-mono">
              <span className="text-[10px] text-brand-grey block uppercase tracking-wider">
                Registration ID
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {kycData?.registrationId || 'PREG-PENDING'}
              </span>
              <div className="text-[10px] text-brand-grey">
                DSA Code: <strong className="text-white">{kycData?.partnerCode}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Documents To Resubmit */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Partner KYC Documents</span>
            </h3>
            <span className="text-xs font-mono text-brand-grey">
              {kycData?.verifiedCount || 0} of 3 Mandatory Docs Cleared
            </span>
          </div>

          <div className="space-y-4">
            {kycData?.documents?.map((doc) => {
              const status = (doc.verificationStatus || 'pending').toLowerCase();
              const isDocVerified = status === 'verified';
              const isDocRejected = status === 'rejected';
              const isDocReupload = status === 'reupload_required' || status === 'action_required';
              const needsAction = isDocReupload || isDocRejected;

              return (
                <div
                  key={doc._id}
                  className={`p-5 rounded-2xl bg-brand-dark border transition-all space-y-3 ${
                    isDocVerified
                      ? 'border-emerald-500/30'
                      : needsAction
                      ? 'border-amber-500/40 bg-amber-500/[0.02]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isDocVerified
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : needsAction
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{doc.title}</h4>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isDocVerified
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : isDocRejected
                                ? 'bg-brand-red/15 text-brand-red border-brand-red/30'
                                : isDocReupload
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {isDocVerified ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified by Admin</span>
                              </>
                            ) : isDocRejected ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Rejected</span>
                              </>
                            ) : isDocReupload ? (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                <span>Resubmission Requested</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>Pending Admin Review</span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-brand-grey">
                          Current File: <span className="text-white">{doc.originalName || doc.fileName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin feedback / instructions */}
                  {doc.reuploadReason && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <strong className="block text-amber-400 font-semibold mb-0.5">Admin Instructions:</strong>
                      {doc.reuploadReason}
                    </div>
                  )}

                  {doc.rejectionReason && (
                    <div className="p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-xs text-brand-red">
                      <strong className="block text-red-400 font-semibold mb-0.5">Rejection Reason:</strong>
                      {doc.rejectionReason}
                    </div>
                  )}

                  {/* Resubmission File Upload Form (Only shown if action requested) */}
                  {needsAction && (
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <label className="block text-xs font-semibold text-brand-lightGrey">
                        Choose Replacement File (PDF, JPG, PNG up to 10MB):
                      </label>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,image/jpeg,image/jpg,image/png"
                          onChange={(e) => handleFileChange(doc._id, e.target.files?.[0] || null)}
                          className="flex-1 bg-brand-black border border-brand-border/60 rounded-xl p-2 text-xs text-brand-lightGrey file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() => handleResubmit(doc._id)}
                          disabled={!replacementFiles[doc._id] || submittingDocId === doc._id}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          {submittingDocId === doc._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>Upload & Resubmit</span>
                        </button>
                      </div>

                      {replacementFiles[doc._id] && (
                        <p className="text-[11px] font-mono text-emerald-400">
                          Ready to upload: {replacementFiles[doc._id].name} (
                          {(replacementFiles[doc._id].size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resubmission History */}
        {kycData?.resubmissionHistory && kycData.resubmissionHistory.length > 0 && (
          <div className="p-5 rounded-2xl bg-brand-dark border border-white/5 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Resubmission History
            </span>
            <div className="space-y-1.5 text-xs text-brand-grey font-mono">
              {kycData.resubmissionHistory.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-400 capitalize">{item.documentType?.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{new Date(item.submittedAt).toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span className="text-white">{item.reason || 'Resubmitted replacement'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
