import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Briefcase 
} from 'lucide-react';
import employeeService from '../../../services/employeeService.js';

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getProfile();
      if (res.status === 'success' && res.data) {
        setProfile(res.data);
        setFormData((prev) => ({
          ...prev,
          name: res.data.user?.name || '',
          phone: res.data.user?.phone || '',
          street: res.data.address?.street || '',
          city: res.data.address?.city || '',
          state: res.data.address?.state || '',
          pincode: res.data.address?.pincode || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load employee profile:', err);
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (!formData.currentPassword) {
        setError('Please enter your current password to set a new password.');
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      await employeeService.updateProfile(payload);
      setSuccess('Profile details updated successfully!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-brand-grey font-medium">Loading profile credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
          <User className="w-3.5 h-3.5" />
          <span>Employee Profile & Credentials</span>
        </div>
        <h2 className="text-2xl font-black text-white">My Officer Profile</h2>
        <p className="text-xs text-brand-grey">
          View your designation, department, and update your personal contact details or password.
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

      {/* Official Credentials Banner */}
      <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3 rounded-2xl bg-brand-black/60 border border-brand-border/50">
          <span className="text-brand-grey text-[10px] uppercase font-bold tracking-wider">Employee ID</span>
          <div className="font-mono font-bold text-blue-400 mt-1 text-sm">{profile?.employeeId}</div>
        </div>
        <div className="p-3 rounded-2xl bg-brand-black/60 border border-brand-border/50">
          <span className="text-brand-grey text-[10px] uppercase font-bold tracking-wider">Designation</span>
          <div className="font-bold text-white mt-1 text-sm">{profile?.designation}</div>
        </div>
        <div className="p-3 rounded-2xl bg-brand-black/60 border border-brand-border/50">
          <span className="text-brand-grey text-[10px] uppercase font-bold tracking-wider">Department</span>
          <div className="font-bold text-white mt-1 text-sm">{profile?.department}</div>
        </div>
        <div className="p-3 rounded-2xl bg-brand-black/60 border border-brand-border/50">
          <span className="text-brand-grey text-[10px] uppercase font-bold tracking-wider">Assigned Files</span>
          <div className="font-bold text-emerald-400 mt-1 text-sm">{profile?.assignedLeadsCount || 0} Active Files</div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Personal Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Official Email (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={profile?.user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black/50 border border-brand-border text-brand-grey text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Noida / Delhi NCR"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Password Security */}
        <div className="bg-brand-dark p-6 rounded-3xl border border-brand-border/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            Change Password
          </h3>
          <p className="text-xs text-brand-grey">
            Leave blank if you do not wish to update your login password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                minLength={6}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-lightGrey mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-black border border-brand-border text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Updating Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
