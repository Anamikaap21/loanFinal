import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  X,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import adminService from '../../../services/adminService.js';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    designation: 'Loan Officer',
    department: 'Loan Operations',
    employeeId: '',
    city: 'Noida',
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await adminService.getEmployees({ search });
      if (res.status === 'success') {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError('Failed to fetch employee list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await adminService.createEmployee({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        designation: formData.designation.trim(),
        department: formData.department.trim(),
        employeeId: formData.employeeId.trim(),
        address: { city: formData.city.trim() },
      });

      setSuccess(`Employee created successfully with ID ${res.data.employeeId}.`);
      setModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        designation: 'Loan Officer',
        department: 'Loan Operations',
        employeeId: '',
        city: 'Noida',
      });
      fetchEmployees();
    } catch (err) {
      console.error('Create employee error:', err);
      setError(err.response?.data?.message || 'Failed to create employee account.');
    }
  };

  const toggleStatus = async (employee) => {
    try {
      await adminService.toggleEmployeeStatus(employee._id);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setError('Failed to update employee account status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-redLight text-brand-red border border-brand-red/20 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Operations & Underwriting Staff</span>
          </div>
          <h2 className="text-2xl font-black text-brand-textPrimary">Employee Management</h2>
          <p className="text-xs text-brand-textSecondary">
            Create loan officers, manage designations, monitor assigned active files, and control CRM access.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-lg shadow-brand-red/20 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Loan Officer</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-brand-redLight border border-brand-red/30 flex items-center gap-3 text-xs text-brand-red">
          <AlertCircle className="w-4 h-4 text-brand-red shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-brand-textSecondary absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs placeholder:text-brand-textSecondary/60 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
          />
        </div>
        <div className="text-xs text-brand-textSecondary">
          Active Officers: <span className="text-brand-textPrimary font-bold">{employees.filter(e => e.accountStatus === 'active').length}</span> of {employees.length}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-sm min-w-0 max-w-full">
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-brand-bg text-brand-textSecondary uppercase tracking-wider font-semibold border-b border-brand-border">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Officer Name & ID</th>
                <th className="py-3.5 px-4">Designation & Department</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Assigned Leads</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-textSecondary">
                    <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading employee directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-textSecondary">
                    No loan officers found.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-brand-redLight/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-brand-textPrimary text-sm">{emp.user?.name || 'Loan Officer'}</div>
                      <span className="font-mono text-[10px] text-brand-red bg-brand-redLight px-2 py-0.5 rounded border border-brand-red/20">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-brand-textPrimary font-semibold">{emp.designation}</div>
                      <div className="text-[11px] text-brand-textSecondary">{emp.department}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-brand-textPrimary">{emp.user?.email}</div>
                      <div className="text-[11px] text-brand-textSecondary">{emp.user?.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-bg border border-brand-border text-brand-textPrimary font-bold">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-brand-red" />
                        <span>{emp.assignedLeadsCount || 0} Files</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(emp)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                          emp.accountStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {emp.accountStatus === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleStatus(emp)}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-brand-bg text-brand-textPrimary border border-brand-border text-[11px] font-semibold transition"
                      >
                        {emp.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-brand-textPrimary/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-brand-border max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary bg-brand-bg hover:bg-brand-border transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-brand-textPrimary mb-1">
              Add New Loan Officer
            </h3>
            <p className="text-xs text-brand-textSecondary mb-6">
              Create employee account with CRM access to process loan applications.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Full Name <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Mobile Number <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Official Email <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@realcred.in"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Password <span className="text-brand-red">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Underwriter"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Loan Operations"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Employee ID <span className="text-brand-textSecondary font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="Leave empty for auto RCE-XXXX"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs uppercase font-mono focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-textPrimary mb-1">
                    Base City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Noida / Delhi NCR"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-textPrimary text-xs focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-brand-border text-xs font-semibold text-brand-textPrimary hover:bg-brand-bg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-red hover:bg-brand-deepRed text-white text-xs font-bold transition shadow-lg shadow-brand-red/20"
                >
                  Confirm & Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
