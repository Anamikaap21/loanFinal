import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  CheckCircle,
  AlertCircle,
  Eye,
  Printer,
  Download,
  Building2,
  Calendar,
  X,
  CreditCard,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';

export default function PartnerMyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invoice Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await partnerService.getMyInvoices();
      if (res.status === 'success') {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to load partner invoices:', err);
      setError('Unable to fetch official commission invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleOpenPreview = async (id) => {
    try {
      setLoadingDetails(true);
      setPreviewModalOpen(true);
      const res = await partnerService.getInvoiceDetails(id);
      if (res.status === 'success') {
        setSelectedInvoice(res.data);
      }
    } catch (err) {
      console.error('Invoice details error:', err);
      setError('Unable to load invoice preview.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Receipt className="w-3.5 h-3.5" />
          <span>Accounting & Official Billing</span>
        </div>
        <h2 className="text-2xl font-black text-white">My Commission Invoices</h2>
        <p className="text-xs text-brand-grey">
          Official RealCred Technology Private Limited tax and commission invoice snapshots for your records.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-brand-grey hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-brand-dark rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-brand-black/60 text-brand-grey uppercase tracking-wider font-semibold border-b border-brand-border/50">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Invoice Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Invoice Date</th>
                <th className="py-3.5 px-4 min-w-[150px]">Loan Customer Ref</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Disbursed Volume (₹)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Rate (%)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Net Commission (₹)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-brand-lightGrey">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading commission invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-grey">
                    No invoices generated yet. Invoices are issued once payout settlement snapshots are approved.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">
                        {inv.loanReference?.customerName || inv.lead?.customerName}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-400">
                        {inv.loanReference?.leadCode || inv.lead?.leadId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{Number(inv.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {inv.financialSummary?.commissionRate}%
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-sm">
                      ₹{Number(inv.financialSummary?.totalPayable || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold capitalize ${
                          inv.payoutStatus === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {inv.payoutStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenPreview(inv._id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-600/20 text-brand-lightGrey hover:text-emerald-400 text-xs font-semibold transition flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL REALCRED INVOICE PRINTABLE MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm print:p-0">
          <div className="bg-brand-dark rounded-3xl border border-brand-border max-w-3xl w-full p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:max-h-none print:shadow-none print:border-none">
            {/* Header Controls (Hidden on Print) */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5 print:hidden">
              <span className="text-xs font-bold text-brand-grey uppercase">Official Commission Invoice</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 rounded-xl text-brand-grey hover:text-white bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingDetails || !selectedInvoice ? (
              <div className="py-16 text-center text-xs text-brand-grey">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Rendering invoice snapshot...
              </div>
            ) : (
              <div className="space-y-6 pt-6 print:pt-0">
                {/* Brand Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10 print:border-gray-200">
                  <div>
                    <div className="text-xl font-black text-white print:text-black tracking-tight flex items-center gap-1">
                      REAL<span className="text-brand-red">CRED</span>
                    </div>
                    <div className="text-[11px] font-bold text-brand-red tracking-wider uppercase mt-0.5">
                      {selectedInvoice.companyDetails?.tagline || 'Your Loan. One Guided Route.'}
                    </div>
                    <div className="text-xs text-brand-grey print:text-gray-600 mt-2 max-w-sm leading-relaxed">
                      {selectedInvoice.companyDetails?.name}
                      <br />
                      {selectedInvoice.companyDetails?.address}
                      <br />
                      Phone: {selectedInvoice.companyDetails?.phone} | Email: {selectedInvoice.companyDetails?.email}
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-lg font-black font-mono text-emerald-400 print:text-emerald-700">
                      {selectedInvoice.invoiceNumber}
                    </div>
                    <div className="text-xs text-brand-grey print:text-gray-600 mt-1">
                      Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-2 ${
                        selectedInvoice.payoutStatus === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 print:border print:border-emerald-700'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      Payment: {selectedInvoice.payoutStatus}
                    </span>
                  </div>
                </div>

                {/* Recipient & Reference Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4 border-b border-white/10 print:border-gray-200">
                  <div>
                    <span className="text-[10px] text-brand-grey print:text-gray-500 uppercase font-bold block mb-1">
                      Channel Partner Details
                    </span>
                    <div className="font-bold text-white print:text-black text-sm">
                      {selectedInvoice.partnerDetails?.partnerName}
                    </div>
                    {selectedInvoice.partnerDetails?.businessName && (
                      <div className="text-brand-lightGrey print:text-gray-700">
                        {selectedInvoice.partnerDetails.businessName}
                      </div>
                    )}
                    <div className="text-brand-grey print:text-gray-600 font-mono mt-0.5">
                      Code: {selectedInvoice.partnerDetails?.partnerCode}
                    </div>
                    {selectedInvoice.partnerDetails?.panNumber && (
                      <div className="text-brand-grey print:text-gray-600 font-mono">
                        PAN: {selectedInvoice.partnerDetails.panNumber}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-brand-grey print:text-gray-500 uppercase font-bold block mb-1">
                      Referred Loan Coordinates
                    </span>
                    <div className="font-bold text-white print:text-black">
                      Customer: {selectedInvoice.loanReference?.customerName}
                    </div>
                    <div className="font-mono text-emerald-400 print:text-emerald-700">
                      Lead ID: {selectedInvoice.loanReference?.leadCode}
                    </div>
                    <div className="text-brand-grey print:text-gray-600 mt-0.5">
                      Product: {selectedInvoice.loanReference?.loanCategory}
                    </div>
                    <div className="text-brand-grey print:text-gray-600">
                      Disbursed Amount: ₹{Number(selectedInvoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Itemized Calculation Table */}
                <div className="rounded-2xl border border-brand-border/60 print:border-gray-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-brand-black/60 print:bg-gray-100 text-brand-grey print:text-gray-600 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Line Item Description</th>
                        <th className="py-3 px-4 text-center">Rate</th>
                        <th className="py-3 px-4 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/40 print:divide-gray-200 text-brand-lightGrey print:text-black">
                      <tr>
                        <td className="py-3.5 px-4 font-semibold text-white print:text-black">
                          Loan Referral & Underwriting Facilitation Commission
                          <div className="text-[10px] text-brand-grey print:text-gray-500 font-normal">
                            Calculated on verified bank disbursement of ₹{Number(selectedInvoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">
                          {selectedInvoice.financialSummary?.commissionRate}%
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white print:text-black">
                          ₹{Number(selectedInvoice.financialSummary?.grossCommissionAmount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-brand-red font-semibold">
                          Less: Statutory TDS under Section 194H (5%)
                        </td>
                        <td className="py-3 px-4 text-center text-brand-red">5%</td>
                        <td className="py-3 px-4 text-right font-bold text-brand-red">
                          -₹{Number(selectedInvoice.financialSummary?.tdsAmount || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-brand-black/40 print:bg-gray-50 font-black text-sm">
                        <td colSpan={2} className="py-4 px-4 text-white print:text-black uppercase">
                          Net Payable Commission
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-400 print:text-emerald-700 font-black text-base">
                          ₹{Number(selectedInvoice.financialSummary?.totalPayable || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer Notes */}
                <div className="pt-4 border-t border-white/10 print:border-gray-200 text-[10px] text-brand-grey print:text-gray-500 leading-relaxed">
                  <p>
                    This is an electronically generated and certified commission billing statement by RealCred Technology Private Limited. TDS will be deposited to the Income Tax Department of India against the Partner's PAN registered in records.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
