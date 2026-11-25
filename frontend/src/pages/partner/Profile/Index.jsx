import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Building2,
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Phone,
  Mail,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import partnerService from '../../../services/partnerService.js';
import { useAuth } from '../../../context/AuthContext.jsx';

export default function PartnerProfile() {
  const { user, setUser } = useAuth();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'banking' | 'security'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullAddress, setFullAddress] = useState('');

  // Bank Form State
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await partnerService.getProfile();
      if (res.status === 'success') {
        const p = res.data;
        setPartner(p);
        setName(p.user?.name || '');
        setPhone(p.user?.phone || '');
        setBusinessName(p.businessName || '');
        setPanNumber(p.panNumber || '');
        setCity(p.address?.city || '');
        setState(p.address?.state || '');
        setPincode(p.address?.pincode || '');
        setFullAddress(p.address?.fullAddress || '');

        setAccountHolderName(p.bankDetails?.accountHolderName || '');
        setAccountNumber(p.bankDetails?.accountNumber || '');
        setBankName(p.bankDetails?.bankName || '');
        setIfscCode(p.bankDetails?.ifscCode || '');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Unable to load partner profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name,
        phone,
        businessName,
        panNumber,
        address: {
          city,
          state,
          pincode,
          fullAddress,
        },
      };

      const res = await partnerService.updateProfile(payload);
      setSuccess('Business profile updated successfully.');
      if (user) {
        setUser({ ...user, name, phone });
      }
      setPartner(res.data);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanking = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        bankDetails: {
          accountHolderName,
          accountNumber,
          bankName,
          ifscCode,
        },
      };

      const res = await partnerService.updateProfile(payload);
      setSuccess('Settlement banking coordinates saved successfully.');
      setPartner(res.data);
    } catch (err) {
      console.error('Update banking error:', err);
      setError(err.response?.data?.message || 'Failed to update bank details.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await partnerService.updateProfile({
        currentPassword,
        newPassword,
      });

      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Channel Partner Settings</span>
        </div>
        <h2 className="text-2xl font-black text-white">Partner Profile & Payout Banking</h2>
        <p className="text-xs text-brand-grey">
          Manage your business information, PAN, contact numbers, and bank account for commission payouts.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center gap-3 text-xs text-white">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Identity Summary Card */}
      <div className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
            {partner?.partnerCode?.slice(-3) || 'RCP'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400">{partner?.partnerCode}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                {partner?.accountStatus || 'Active'}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">{partner?.businessName || user?.name}</h3>
            <p className="text-xs text-brand-grey">{partner?.user?.email} • {partner?.user?.phone}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-white/5 sm:pl-6">
          <div className="text-[10px] uppercase font-bold text-brand-grey">Default Commission Rate</div>
          <div className="text-2xl font-black text-emerald-400">{partner?.defaultCommissionRate || 1.5}%</div>
          <div className="text-[10px] text-brand-grey">Calculated on Disbursed Amount</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-brand-grey hover:bg-white/5 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Business & Contact Info</span>
        </button>

        <button
          onClick={() => setActiveTab('banking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'banking'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-brand-grey hover:bg-white/5 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Settlement Banking Coordinates</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-brand-grey hover:bg-white/5 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Account Security</span>
        </button>
      </div>

      {/* TAB 1: Business Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white mb-2">Business & Personal Information</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Contact Person Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Mobile Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Business / Firm / Agency Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Financial Consultants"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">PAN Card Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="e.g. ABCDE1234F"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-brand-lightGrey mb-1 font-semibold">Complete Office / Residential Address</label>
              <textarea
                rows={2}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Street address, building, landmark..."
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Settlement Banking */}
      {activeTab === 'banking' && (
        <form onSubmit={handleSaveBanking} className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Bank Account Coordinates for Direct Commission Transfers</span>
          </div>
          <p className="text-xs text-brand-grey">
            All disbursement commissions will be settled to this verified bank account after mandatory 5% TDS deduction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Account Holder Name *</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="As per bank passbook"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Bank Name *</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank, ICICI Bank"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Account Number *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 50100291827364"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">IFSC Code *</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Bank Coordinates'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="p-6 rounded-3xl bg-brand-dark border border-brand-border/60 shadow-xl space-y-4 max-w-lg">
          <h4 className="text-sm font-bold text-white mb-2">Change Password</h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Current Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-brand-lightGrey mb-1 font-semibold">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
