import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import EmployeeLayout from '../layouts/EmployeeLayout.jsx';
import PartnerLayout from '../layouts/PartnerLayout.jsx';

// Route Guards
import ProtectedRoute from './ProtectedRoute.jsx';

// Auth Pages
import RoleSelection from '../pages/auth/RoleSelection.jsx';
import Login from '../pages/auth/Login.jsx';

// Public Pages
import Home from '../pages/public/Home.jsx';
import About from '../pages/public/About.jsx';
import Products from '../pages/public/Products.jsx';
import ProductDetails from '../pages/public/ProductDetails.jsx';
import OurTeam from '../pages/public/OurTeam.jsx';
import Contact from '../pages/public/Contact.jsx';
import PrivacyPolicy from '../pages/public/PrivacyPolicy.jsx';
import ApplyLoan from '../pages/public/ApplyLoan.jsx';
import RequestCallback from '../pages/public/RequestCallback.jsx';
import PartnerRegistration from '../pages/public/PartnerRegistration.jsx';

// Admin Module Pages (Phase 5)
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import WebsiteManagement from '../pages/admin/WebsiteManagement/Index.jsx';
import BankManagement from '../pages/admin/BankManagement/Index.jsx';
import LoanCategoryManagement from '../pages/admin/LoanCategoryManagement/Index.jsx';
import EmployeeManagement from '../pages/admin/EmployeeManagement/Index.jsx';
import PartnerManagement from '../pages/admin/PartnerManagement/Index.jsx';
import PartnerVerification from '../pages/admin/PartnerVerification/Index.jsx';
import WebsiteLeads from '../pages/admin/WebsiteLeads/Index.jsx';
import EmployeeLeads from '../pages/admin/EmployeeLeads/Index.jsx';
import PartnerLeads from '../pages/admin/PartnerLeads/Index.jsx';
import LeadManagement from '../pages/admin/LeadManagement/Index.jsx';
import SupportDesk from '../pages/admin/Support/Index.jsx';
import PayoutManagement from '../pages/admin/PayoutManagement/Index.jsx';
import InvoiceManagement from '../pages/admin/InvoiceManagement/Index.jsx';

// Employee Module Pages (Phase 6)
import EmployeeDashboard from '../pages/employee/Dashboard.jsx';
import EmployeeCreateLead from '../pages/employee/CreateLead/Index.jsx';
import EmployeeProfile from '../pages/employee/Profile/Index.jsx';
import EmployeeWebsiteLeads from '../pages/employee/WebsiteLeads/Index.jsx';
import EmployeePartnerLeads from '../pages/employee/PartnerLeads/Index.jsx';
import EmployeeLeadProcessing from '../pages/employee/LeadProcessing/Index.jsx';
import EmployeeDocumentVerification from '../pages/employee/DocumentVerification/Index.jsx';
import EmployeeDocumentVerificationDetails from '../pages/employee/DocumentVerification/Details.jsx';
import EmployeeSupportDesk from '../pages/employee/Support/Index.jsx';

// Partner Module Pages (Phase 7)
import PartnerDashboard from '../pages/partner/Dashboard.jsx';
import PartnerProfile from '../pages/partner/Profile/Index.jsx';
import PartnerCreateLead from '../pages/partner/CreateLead/Index.jsx';
import PartnerMyLeads from '../pages/partner/MyLeads/Index.jsx';
import PartnerLeadPipeline from '../pages/partner/LeadPipeline/Index.jsx';
import PartnerMyPayouts from '../pages/partner/MyPayouts/Index.jsx';
import PartnerMyInvoices from '../pages/partner/MyInvoices/Index.jsx';
import PartnerResubmitDocuments from '../pages/partner/ResubmitDocuments/Index.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Website Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/team" element={<OurTeam />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/apply-loan" element={<ApplyLoan />} />
        <Route path="/request-callback" element={<RequestCallback />} />
        <Route path="/partner-registration" element={<PartnerRegistration />} />
      </Route>

      {/* Centralized Authentication Routes */}
      <Route path="/crm-login" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Admin CRM Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="website" element={<WebsiteManagement />} />
        <Route path="banks" element={<BankManagement />} />
        <Route path="categories" element={<LoanCategoryManagement />} />
        <Route path="loan-categories" element={<Navigate to="/admin/categories" replace />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="partners" element={<PartnerManagement />} />
        <Route path="partner-verification" element={<PartnerVerification />} />
        <Route path="website-leads" element={<WebsiteLeads />} />
        <Route path="employee-leads" element={<EmployeeLeads />} />
        <Route path="partner-leads" element={<PartnerLeads />} />
        <Route path="lead-pipeline" element={<LeadManagement />} />
        <Route path="support" element={<SupportDesk />} />
        <Route path="payouts" element={<PayoutManagement />} />
        <Route path="invoices" element={<InvoiceManagement />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Protected Employee CRM Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="create-lead" element={<EmployeeCreateLead />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="website-leads" element={<EmployeeWebsiteLeads />} />
        <Route path="partner-leads" element={<EmployeePartnerLeads />} />
        <Route path="lead-processing" element={<EmployeeLeadProcessing />} />
        <Route path="document-verification" element={<EmployeeDocumentVerification />} />
        <Route path="document-verification/:id" element={<EmployeeDocumentVerificationDetails />} />
        <Route path="support" element={<EmployeeSupportDesk />} />
        <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
      </Route>

      {/* Restricted Partner Document Resubmission Route */}
      <Route
        path="/partner/resubmit-documents"
        element={
          <ProtectedRoute allowedRoles={['partner']}>
            <PartnerResubmitDocuments />
          </ProtectedRoute>
        }
      />

      {/* Protected Partner CRM Routes */}
      <Route
        path="/partner"
        element={
          <ProtectedRoute allowedRoles={['partner']}>
            <PartnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/partner/dashboard" replace />} />
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="profile" element={<PartnerProfile />} />
        <Route path="create-lead" element={<PartnerCreateLead />} />
        <Route path="my-leads" element={<PartnerMyLeads />} />
        <Route path="pipeline" element={<PartnerLeadPipeline />} />
        <Route path="lead-pipeline" element={<Navigate to="/partner/pipeline" replace />} />
        <Route path="my-payouts" element={<PartnerMyPayouts />} />
        <Route path="my-invoices" element={<PartnerMyInvoices />} />
        <Route path="*" element={<Navigate to="/partner/dashboard" replace />} />
      </Route>

      {/* Global Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
