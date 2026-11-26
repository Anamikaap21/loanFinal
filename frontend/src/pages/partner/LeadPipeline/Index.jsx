import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';

export default function PartnerLeadPipeline() {
  const [pipelineData, setPipelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    Lead: 'Initial application logged into system.',
    Login: 'Submitted to bank / NBFC underwriting desk.',
    'In Process': 'Field investigation, legal & technical review.',
    Sanction: 'Sanction letter issued with approved loan limit.',
    Disbursement: 'Loan proceeds credited to customer account.',
    PDD: 'Post-disbursement compliance & document reconciliation.',
    Payout: 'Commission accounted and cleared for transfer.',
    Cancelled: 'File declined or withdrawn.',
  };

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await partnerService.getPipeline();
      if (res.status === 'success') {
        setPipelineData(res.data);
      }
    } catch (err) {
      console.error('Failed to load pipeline:', err);
      setError('Unable to load live loan pipeline tracker.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-textSecondary font-medium">Reconciling pipeline stages...</p>
        </div>
      </div>
    );
  }

  const pipeline = pipelineData?.pipeline || {};
  const totalCount = pipelineData?.totalCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>RealCred 8-Stage Tracker</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Live Loan Pipeline</h2>
          <p className="text-xs text-brand-textSecondary">
            Track each customer referral across RealCred's 8 banking operations milestones in real time.
          </p>
        </div>

        <button
          onClick={fetchPipeline}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-brand-bg border border-brand-border text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary transition flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-red" />
          <span>Refresh Stages</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/20 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Horizontal Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const filesInStage = pipeline[stage] || [];
          const isTerminal = ['Disbursement', 'PDD', 'Payout'].includes(stage);
          const isCancelled = stage === 'Cancelled';

          return (
            <div
              key={stage}
              className={`p-4 rounded-3xl border flex flex-col justify-between space-y-3 shadow-sm ${
                isTerminal && filesInStage.length > 0
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : isCancelled && filesInStage.length > 0
                  ? 'bg-brand-redLight/20 border-brand-red/30'
                  : 'bg-white border-brand-border'
              }`}
            >
              {/* Stage Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-brand-textPrimary uppercase tracking-wider">
                    {stage}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      isTerminal
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCancelled
                        ? 'bg-brand-redLight text-brand-red border border-brand-red/30'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {filesInStage.length}
                  </span>
                </div>
                <p className="text-[10px] text-brand-textSecondary leading-tight">
                  {stageDescriptions[stage]}
                </p>
              </div>

              {/* Files in this stage */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filesInStage.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-brand-textSecondary italic">
                    No files in {stage}
                  </div>
                ) : (
                  filesInStage.map((lead) => (
                    <div
                      key={lead._id}
                      className="p-3 rounded-2xl bg-brand-bg border border-brand-border text-xs space-y-1 hover:border-brand-red/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-brand-red text-[11px]">
                          {lead.leadId}
                        </span>
                        <span className="text-[10px] text-brand-textSecondary">
                          {new Date(lead.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="font-bold text-brand-textPrimary truncate">{lead.customerName}</div>
                      <div className="text-[10px] text-brand-textSecondary flex items-center justify-between">
                        <span>{lead.loanCategory?.name || 'Loan'}</span>
                        <span className="font-bold text-emerald-700">
                          ₹{Number(lead.requiredLoanAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {lead.disbursedAmount > 0 && (
                        <div className="pt-1 border-t border-brand-border text-[10px] text-emerald-700 font-semibold flex items-center justify-between">
                          <span>Disbursed:</span>
                          <span>₹{Number(lead.disbursedAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
