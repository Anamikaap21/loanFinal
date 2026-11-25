import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Partner from '../models/Partner.js';
import Bank from '../models/Bank.js';
import LoanCategory from '../models/LoanCategory.js';
import Lead from '../models/Lead.js';
import CallbackRequest from '../models/CallbackRequest.js';
import Payout from '../models/Payout.js';

test('RealCred Employee Module Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';
  let employeeToken = '';
  let otherEmployeeToken = '';
  let adminToken = '';
  let employeeProfileId = '';
  let otherEmployeeProfileId = '';
  let assignedLeadId = '';
  let unassignedLeadId = '';
  let partnerReferralLeadId = '';
  let testPartnerId = '';
  let callbackId = '';

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGO_URI || ENV.MONGODB_URI);
  }

  // 1. Log in as Super Admin to set up clean test accounts
  const adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: ENV.INITIAL_ADMIN.email,
      password: ENV.INITIAL_ADMIN.password,
      role: 'admin',
    }),
  });
  const adminData = await adminRes.json();
  assert.equal(adminRes.status, 200);
  adminToken = adminData.data.token;

  // 2. Create Officer 1
  const ts = Date.now().toString().slice(-4);
  const emp1Email = `officer1_${ts}@realcred.in`;
  const emp1Phone = `97${Date.now().toString().slice(-8)}`;

  const createEmp1Res = await fetch(`${baseUrl}/admin/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Operations Officer Priya',
      email: emp1Email,
      phone: emp1Phone,
      password: 'Password@123',
      designation: 'Credit Underwriter',
      department: 'Underwriting',
    }),
  });
  const emp1Data = await createEmp1Res.json();
  assert.equal(createEmp1Res.status, 201);
  employeeProfileId = emp1Data.data._id;

  // Log in Officer 1
  const login1Res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: emp1Email,
      password: 'Password@123',
      role: 'employee',
    }),
  });
  const login1Data = await login1Res.json();
  assert.equal(login1Res.status, 200);
  employeeToken = login1Data.data.token;

  // 3. Create Officer 2 (to test file isolation)
  const emp2Email = `officer2_${ts}@realcred.in`;
  const emp2Phone = `96${Date.now().toString().slice(-8)}`;

  const createEmp2Res = await fetch(`${baseUrl}/admin/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Operations Officer Vikram',
      email: emp2Email,
      phone: emp2Phone,
      password: 'Password@123',
      designation: 'Loan Officer',
      department: 'Disbursement Desk',
    }),
  });
  const emp2Data = await createEmp2Res.json();
  otherEmployeeProfileId = emp2Data.data._id;

  const login2Res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: emp2Email,
      password: 'Password@123',
      role: 'employee',
    }),
  });
  const login2Data = await login2Res.json();
  otherEmployeeToken = login2Data.data.token;

  // 4. Create Channel Partner
  const partnerRes = await fetch(`${baseUrl}/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Delhi Financial Network',
      email: `delhidta_${ts}@realcred.in`,
      phone: `95${Date.now().toString().slice(-8)}`,
      password: 'Password@123',
      city: 'Delhi',
      businessName: 'Delhi Capital Associates',
    }),
  });
  const partnerData = await partnerRes.json();
  testPartnerId = partnerData.data.partner._id;

  // 5. Seed Category & Bank
  const category = await LoanCategory.findOne({ isActive: true });
  const bank = await Bank.findOne({ status: 'active' });

  // Lead Assigned to Officer 1
  const lead1 = new Lead({
    leadId: `RCL-EMP1-${Date.now().toString().slice(-6)}`,
    source: 'website',
    partnerId: null,
    customerName: 'Assigned Borrower Alpha',
    customerPhone: '9812300001',
    city: 'Noida',
    loanCategory: category._id,
    categoryName: category.name,
    preferredBank: bank._id,
    bankName: bank.name,
    requiredLoanAmount: 1800000,
    status: 'Lead',
    assignedTo: employeeProfileId,
    assignedAt: new Date(),
    statusHistory: [
      {
        status: 'Lead',
        changedByName: 'Initial System Entry',
        changedAt: new Date(),
        remarks: 'Direct website lead captured.',
      },
    ],
  });
  await lead1.save();
  assignedLeadId = lead1._id.toString();

  // Lead Assigned to Officer 2 (Unassigned to Officer 1)
  const lead2 = new Lead({
    leadId: `RCL-EMP2-${Date.now().toString().slice(-6)}`,
    source: 'website',
    partnerId: null,
    customerName: 'Assigned Borrower Beta',
    customerPhone: '9812300002',
    city: 'Gurugram',
    loanCategory: category._id,
    categoryName: category.name,
    requiredLoanAmount: 3500000,
    status: 'Lead',
    assignedTo: otherEmployeeProfileId,
    assignedAt: new Date(),
  });
  await lead2.save();
  unassignedLeadId = lead2._id.toString();

  // Partner Lead Assigned to Officer 1
  const partnerLead = new Lead({
    leadId: `RCL-PARTNER-${Date.now().toString().slice(-6)}`,
    source: 'partner',
    partnerId: testPartnerId,
    customerName: 'Partner Client Gamma',
    customerPhone: '9812300003',
    city: 'Noida',
    loanCategory: category._id,
    categoryName: category.name,
    requiredLoanAmount: 5000000,
    status: 'Lead',
    assignedTo: employeeProfileId,
    assignedAt: new Date(),
    isEligibleForPayout: false,
    payoutStatus: 'not_eligible',
  });
  await partnerLead.save();
  partnerReferralLeadId = partnerLead._id.toString();

  // Callback assigned to Officer 1
  const callback = new CallbackRequest({
    requestNumber: `RCCB-EMP-${Date.now().toString().slice(-4)}`,
    customerName: 'Support Applicant Delta',
    mobileNumber: '9877788899',
    status: 'pending',
    assignedTo: employeeProfileId,
  });
  await callback.save();
  callbackId = callback._id.toString();

  await t.test('1. Security Guard - Rejects Unauthenticated & Admin Access to Employee Gateway', async () => {
    // No token
    const noTokenRes = await fetch(`${baseUrl}/employee/dashboard/metrics`);
    assert.equal(noTokenRes.status, 401);

    // Admin token attempting to access Employee route
    const adminAccessRes = await fetch(`${baseUrl}/employee/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminAccessRes.json();
    assert.equal(adminAccessRes.status, 403);
    assert.match(adminData.message, /Access denied/i);
  });

  await t.test('2. GET /api/employee/dashboard/metrics - Personal Workload Metrics', async () => {
    const res = await fetch(`${baseUrl}/employee/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.status, 'success');
    assert.equal(data.data.summary.totalAssigned, 2); // 1 web lead + 1 partner lead
    assert.equal(data.data.summary.assignedWebsiteLeads, 1);
    assert.equal(data.data.summary.assignedPartnerLeads, 1);
    assert.equal(data.data.employee.designation, 'Credit Underwriter');
  });

  await t.test('3. Profile Management - GET & PUT /api/employee/profile', async () => {
    const getRes = await fetch(`${baseUrl}/employee/profile`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getData.data.user.name, 'Operations Officer Priya');

    // Update Profile
    const updateRes = await fetch(`${baseUrl}/employee/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        name: 'Priya Sharma (Senior Underwriter)',
        address: { city: 'Noida Sector 62' },
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.user.name, 'Priya Sharma (Senior Underwriter)');
    assert.equal(updateData.data.address.city, 'Noida Sector 62');
  });

  await t.test('4. File Isolation - Accessing Assigned Leads vs Other Officers Files', async () => {
    // Officer 1 views assigned lead -> 200 OK
    const assignedRes = await fetch(`${baseUrl}/employee/leads/${assignedLeadId}`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert.equal(assignedRes.status, 200);

    // Officer 1 attempts to view Officer 2's lead -> 403 Forbidden!
    const unassignedRes = await fetch(`${baseUrl}/employee/leads/${unassignedLeadId}`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const unassignedData = await unassignedRes.json();
    assert.equal(unassignedRes.status, 403);
    assert.match(unassignedData.message, /not assigned to your desk/i);
  });

  await t.test('5. 8-Stage Progression by Employee with Status History Audit Log', async () => {
    // Advance web lead: Lead -> Login -> In Process -> Sanction
    const loginRes = await fetch(`${baseUrl}/employee/leads/${assignedLeadId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        status: 'Login',
        remarks: 'File logged into HDFC Bank portal. Reference generated.',
      }),
    });
    const loginData = await loginRes.json();
    assert.equal(loginRes.status, 200);
    assert.equal(loginData.data.status, 'Login');

    // Verify status history audit
    assert.ok(loginData.data.statusHistory.length >= 2);
    const lastHist = loginData.data.statusHistory[loginData.data.statusHistory.length - 1];
    assert.equal(lastHist.status, 'Login');
    assert.match(lastHist.remarks, /HDFC Bank portal/i);
  });

  await t.test('6. Partner Referral Progression to Disbursement Triggers Auto Payout', async () => {
    // Officer 1 advances partner lead to Disbursement
    const disburseRes = await fetch(`${baseUrl}/employee/leads/${partnerReferralLeadId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        status: 'Disbursement',
        disbursedAmount: 5000000,
        disbursementReferenceNumber: 'DISB-EMP-2026',
        remarks: 'Direct borrower disbursement completed.',
      }),
    });
    const disburseData = await disburseRes.json();
    assert.equal(disburseRes.status, 200);

    // Verify payout was created in MongoDB
    const payout = await Payout.findOne({ lead: partnerReferralLeadId });
    assert.ok(payout, 'Payout must be automatically generated upon Disbursement');
    assert.equal(payout.disbursedLoanAmount, 5000000);
    assert.equal(payout.status, 'pending');
  });

  await t.test('7. Add Document to Lead File - POST /api/employee/leads/:id/documents', async () => {
    const docRes = await fetch(`${baseUrl}/employee/leads/${assignedLeadId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        documentType: 'pan_card',
        title: 'Borrower PAN Card Copy',
        fileName: 'pan-card.pdf',
        filePath: '/uploads/documents/pan-verified.pdf',
        fileSize: 204800,
        mimeType: 'application/pdf',
      }),
    });
    const docData = await docRes.json();
    assert.equal(docRes.status, 201);
    assert.equal(docData.data.title, 'Borrower PAN Card Copy');

    // Verify lead's documents count incremented
    const updatedLead = await Lead.findById(assignedLeadId);
    assert.ok(updatedLead.documentsCount >= 1);
  });

  await t.test('8. Support Desk - Update Assigned Callback Request', async () => {
    const cbRes = await fetch(`${baseUrl}/employee/callbacks/${callbackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        status: 'completed',
        remarks: 'Consultation call completed. Customer opted for LAP.',
      }),
    });
    const cbData = await cbRes.json();
    assert.equal(cbRes.status, 200);
    assert.equal(cbData.data.status, 'completed');
  });

  // Teardown
  server.close();
  await Lead.deleteMany({ customerName: { $regex: /Borrower Alpha|Borrower Beta|Client Gamma/ } });
  await CallbackRequest.deleteMany({ requestNumber: { $regex: /RCCB-EMP-/ } });
  await mongoose.disconnect();
  process.exit(0);
});
