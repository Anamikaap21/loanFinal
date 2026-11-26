import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  Receipt,
  Building2,
  Calendar,
  X,
  FileCheck
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';

export default function PartnerMyPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await partnerService.getMyPayouts(params);
      if (res.status === 'success') {
        setPayouts(res.data.payouts);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load payouts:', err);
      setError('Unable to fetch your commission payout history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const filteredPayouts = payouts.filter((p) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      p.payoutNumber?.toLowerCase().includes(term) ||
      p.lead?.customerName?.toLowerCase().includes(term) ||
      p.lead?.leadId?.toLowerCase().includes(term) ||
      p.paymentDetails?.transactionReference?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Commission Settlement Desk</span>
        </div>
        <h2 className="text-2xl font-black text-brand-textPrimary">My Commission Payouts</h2>
        <p className="text-xs text-brand-textSecondary">
          Track verified disbursement commissions, 5% TDS deductions, and bank settlement transfers.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/20 flex items-center justify-between text-xs text-brand-red">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-brand-textSecondary hover:text-brand-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-sm">
          <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider">
            Gross Commission Accrued
          </span>
          <div className="text-2xl font-black text-brand-textPrimary mt-1">
            ₹{Number(summary.totalGross || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-brand-textSecondary mt-1">Before statutory tax deduction</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-brand-red/20 shadow-sm">
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">
            Statutory TDS (5% Sec 194H)
          </span>
          <div className="text-2xl font-black text-brand-red mt-1">
            ₹{Number(summary.totalTds || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-brand-textSecondary mt-1">Deposited to ITD against PAN</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Net Commission Settled
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{Number(summary.totalPaid || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-brand-textSecondary mt-1">Credited to registered bank account</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            Pending Bank Settlement
          </span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            ₹{Number(summary.totalPending || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-brand-textSecondary mt-1">Under RealCred finance clearing</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Payout ID, Lead, Customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:bg-white"
          >
            <option value="all">All Payout Statuses</option>
            <option value="pending">Pending Settlement</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed / Settled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-xs text-brand-textSecondary whitespace-nowrap">
            Payout Records: <span className="text-brand-textPrimary font-bold">{filteredPayouts.length}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Payout ID</th>
                <th className="py-3.5 px-4 min-w-[150px]">Loan Referral</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Disbursed (₹)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Commission</th>
                <th className="py-3.5 px-4 whitespace-nowrap">TDS (5%)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Net Payable (₹)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status & Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textPrimary">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading commission payouts...
                  </td>
                </tr>
              ) : filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-brand-textSecondary">
                    No payout records found. Commission records are generated automatically once referred files achieve bank disbursement.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-textPrimary">
                      {p.payoutNumber}
                      <div className="text-[10px] text-brand-textSecondary font-sans font-normal">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-textPrimary">{p.lead?.customerName || 'Customer'}</div>
                      <div className="text-[10px] font-mono text-brand-red">
                        {p.lead?.leadId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-brand-textPrimary">
                      ₹{Number(p.disbursedLoanAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-textPrimary">
                        ₹{Number(p.grossCommissionAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-brand-textSecondary">Rate: {p.commissionRate}%</div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-red font-semibold">
                      -₹{Number(p.tdsAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                      ₹{Number(p.netPayoutAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                          p.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'cancelled'
                            ? 'bg-brand-redLight text-brand-red border border-brand-red/30'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                      >
                        {p.status}
                      </span>
                      {p.paymentDetails?.transactionReference && (
                        <div className="text-[10px] font-mono text-brand-textSecondary mt-0.5 truncate max-w-xs">
                          Ref: {p.paymentDetails.transactionReference}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
