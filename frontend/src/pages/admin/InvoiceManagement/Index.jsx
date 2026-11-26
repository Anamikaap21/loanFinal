import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Eye,
  Download,
  CheckCircle,
  Printer,
  X,
  Building2,
  Calendar,
  IndianRupee
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await adminService.getInvoices();
      if (res.status === 'success') {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openPreview = (inv) => {
    setSelectedInvoice(inv);
    setModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
          <Receipt className="w-3.5 h-3.5" />
          <span>Accounting & Fiscal Records</span>
        </div>
        <h2 className="text-2xl font-black text-brand-textPrimary">Invoice Management Desk</h2>
        <p className="text-xs text-brand-textSecondary">
          Official commission payout invoices generated for channel partners. Complete immutable snapshots with TDS deduction breakdowns.
        </p>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Invoice Number</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Invoice Date</th>
                <th className="py-3.5 px-4">Partner Name & Code</th>
                <th className="py-3.5 px-4">Lead File Reference</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Gross Commission</th>
                <th className="py-3.5 px-4 whitespace-nowrap">TDS (5%)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Net Total (INR)</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-brand-textSecondary">
                    No partner payout invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-textPrimary">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-brand-textSecondary">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-textPrimary">{inv.partnerDetails?.partnerName}</div>
                      <span className="font-mono text-[10px] text-brand-red bg-brand-redLight px-1.5 py-0.5 rounded font-semibold border border-brand-red/20">
                        {inv.partnerDetails?.partnerCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-textPrimary">
                      {inv.loanReference?.leadCode}
                      <div className="text-[11px] font-sans text-brand-textSecondary font-normal">{inv.loanReference?.customerName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-textPrimary">
                      ₹{Number(inv.financialSummary?.grossCommissionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-brand-textSecondary">
                      ₹{Number(inv.financialSummary?.tdsAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                      ₹{Number(inv.financialSummary?.totalPayable || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPreview(inv)}
                        className="px-2.5 py-1 rounded-lg bg-brand-bg hover:bg-brand-border/60 text-brand-textPrimary border border-brand-border text-[11px] font-semibold transition inline-flex items-center gap-1.5"
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

      {/* INVOICE PREVIEW MODAL */}
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto print:bg-white print:text-black">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Print Header */}
            <div className="border-b border-brand-border pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-brand-red flex items-center justify-center font-bold text-white text-sm">
                      RC
                    </div>
                    <span className="text-lg font-black text-brand-textPrimary">REAL<span className="text-brand-red">CRED</span></span>
                  </div>
                  <div className="text-[10px] text-brand-textSecondary">{selectedInvoice.companyDetails?.name}</div>
                  <div className="text-[10px] text-brand-textSecondary">{selectedInvoice.companyDetails?.address}</div>
                  <div className="text-[10px] text-brand-textSecondary">Email: {selectedInvoice.companyDetails?.email} • Web: {selectedInvoice.companyDetails?.domain}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs uppercase font-bold text-brand-red">Commission Invoice</div>
                  <div className="text-base font-mono font-black text-brand-textPrimary mt-0.5">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-[11px] text-brand-textSecondary mt-1">Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Billed To / Partner Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-textSecondary text-[10px] uppercase font-bold tracking-wider">Channel Partner (Billed To)</span>
                <div className="font-bold text-brand-textPrimary mt-1 text-sm">{selectedInvoice.partnerDetails?.partnerName}</div>
                <div className="text-brand-textSecondary">{selectedInvoice.partnerDetails?.businessName}</div>
                <div className="text-brand-textSecondary">Code: <span className="font-mono text-brand-textPrimary font-semibold">{selectedInvoice.partnerDetails?.partnerCode}</span></div>
                <div className="text-brand-textSecondary">PAN: <span className="font-mono text-brand-textPrimary font-semibold">{selectedInvoice.partnerDetails?.panNumber || 'N/A'}</span></div>
              </div>

              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border">
                <span className="text-brand-textSecondary text-[10px] uppercase font-bold tracking-wider">Disbursed Loan Reference</span>
                <div className="font-bold text-brand-textPrimary mt-1">{selectedInvoice.loanReference?.loanCategory}</div>
                <div className="text-brand-textSecondary">Borrower: {selectedInvoice.loanReference?.customerName}</div>
                <div className="text-brand-textSecondary">Lead Ref: <span className="font-mono text-brand-textPrimary font-semibold">{selectedInvoice.loanReference?.leadCode}</span></div>
                <div className="text-brand-textSecondary">Disbursed: <span className="font-bold text-emerald-600">₹{Number(selectedInvoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            {/* Financial Line Items */}
            <div className="rounded-xl border border-brand-border overflow-hidden mb-6">
              <table className="w-full text-xs">
                <thead className="bg-brand-bg text-brand-textSecondary uppercase">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Description</th>
                    <th className="py-2.5 px-4 text-center">Rate</th>
                    <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border text-brand-textPrimary">
                  <tr>
                    <td className="py-3 px-4">
                      Gross Referral Commission on Loan Disbursal (₹{Number(selectedInvoice.loanReference?.disbursedLoanAmount || 0).toLocaleString('en-IN')})
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-brand-textPrimary">
                      {selectedInvoice.financialSummary?.commissionRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand-textPrimary">
                      ₹{Number(selectedInvoice.financialSummary?.grossCommissionAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-brand-textSecondary">
                      TDS Deduction (Tax Deducted at Source under Sec 194H)
                    </td>
                    <td className="py-3 px-4 text-center text-brand-textSecondary">5.0%</td>
                    <td className="py-3 px-4 text-right text-brand-red font-semibold">
                      - ₹{Number(selectedInvoice.financialSummary?.tdsAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-brand-redLight/40 font-bold text-sm">
                    <td colSpan={2} className="py-3 px-4 text-brand-textPrimary">
                      Total Net Payout Payable
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-black">
                      ₹{Number(selectedInvoice.financialSummary?.totalPayable || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-brand-bg hover:bg-brand-border/60 text-brand-textPrimary border border-brand-border text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-brand-red" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
