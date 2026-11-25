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
import Invoice from '../models/Invoice.js';

test('RealCred Admin Module Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';
  let adminToken = '';
  let employeeToken = '';
  let testLeadId = '';
  let testPartnerLeadId = '';
  let testEmployeeId = '';
  let testPartnerId = '';
  let testBankId = '';
  let testPayoutId = '';
  let testCallbackId = '';

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

  // 1. Log in as Super Admin
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

  // 2. Ensure an Employee exists and log in
  const empTimestamp = Date.now().toString().slice(-4);
  const empEmail = `officer_${empTimestamp}@realcred.in`;
  const empPhone = `98${Date.now().toString().slice(-8)}`;

  const createEmpRes = await fetch(`${baseUrl}/admin/employees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Loan Officer Rajesh',
      email: empEmail,
      phone: empPhone,
      password: 'Password@123',
      designation: 'Senior Loan Underwriter',
      department: 'Credit Operations',
    }),
  });
  const createEmpData = await createEmpRes.json();
  assert.equal(createEmpRes.status, 201);
  testEmployeeId = createEmpData.data._id;

  const empLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: empEmail,
      password: 'Password@123',
      role: 'employee',
    }),
  });
  const empLoginData = await empLoginRes.json();
  assert.equal(empLoginRes.status, 200);
  employeeToken = empLoginData.data.token;

  // 3. Register a Partner
  const partnerTimestamp = Date.now().toString().slice(-4);
  const partnerEmail = `dsa_${partnerTimestamp}@realcred.in`;
  const partnerPhone = `99${Date.now().toString().slice(-8)}`;

  const partnerRegRes = await fetch(`${baseUrl}/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Apex Finance DSA',
      email: partnerEmail,
      phone: partnerPhone,
      password: 'Password@123',
      city: 'Noida',
      businessName: 'Apex Financial Services LLP',
      panNumber: 'ABCDE1234F',
    }),
  });
  const partnerRegData = await partnerRegRes.json();
  assert.equal(partnerRegRes.status, 201);
  testPartnerId = partnerRegData.data.partner._id;

  // 4. Create sample Website Lead
  const category = await LoanCategory.findOne({ isActive: true });
  const bank = await Bank.findOne({ status: 'active' });

  const webLead = new Lead({
    leadId: `RCL-W-${Date.now().toString().slice(-6)}`,
    source: 'website',
    partnerId: null,
    customerName: 'Direct Customer A',
    customerPhone: '9812345678',
    customerEmail: 'customerA@example.com',
    city: 'Noida',
    loanCategory: category._id,
    categoryName: category.name,
    preferredBank: bank._id,
    bankName: bank.name,
    requiredLoanAmount: 2500000,
    status: 'Lead',
  });
  await webLead.save();
  testLeadId = webLead._id.toString();

  // 5. Create sample Partner Lead
  const partnerLead = new Lead({
    leadId: `RCL-P-${Date.now().toString().slice(-6)}`,
    source: 'partner',
    partnerId: testPartnerId,
    customerName: 'Partner Referred Borrower B',
    customerPhone: '9887654321',
    customerEmail: 'borrowerB@example.com',
    city: 'Delhi',
    loanCategory: category._id,
    categoryName: category.name,
    preferredBank: bank._id,
    bankName: bank.name,
    requiredLoanAmount: 4000000,
    status: 'Lead',
    isEligibleForPayout: false,
    payoutStatus: 'not_eligible',
  });
  await partnerLead.save();
  testPartnerLeadId = partnerLead._id.toString();

  // 6. Create sample callback request
  const callback = new CallbackRequest({
    requestNumber: `RCCB-TEST-${Date.now().toString().slice(-4)}`,
    customerName: 'Callback User Test',
    mobileNumber: '9811122233',
    status: 'pending',
  });
  await callback.save();
  testCallbackId = callback._id.toString();

  await t.test('1. Security Guard - Rejects Unauthenticated & Non-Admin Access', async () => {
    // No token
    const noTokenRes = await fetch(`${baseUrl}/admin/dashboard/metrics`);
    assert.equal(noTokenRes.status, 401);

    // Non-admin token (Employee trying to access Admin route)
    const empRes = await fetch(`${baseUrl}/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    const empData = await empRes.json();
    assert.equal(empRes.status, 403);
    assert.match(empData.message, /Access denied/i);
  });

  await t.test('2. GET /api/admin/dashboard/metrics - Computes live statistics & charts', async () => {
    const res = await fetch(`${baseUrl}/admin/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.status, 'success');
    assert.ok(data.data.summary.totalLeads >= 2);
    assert.ok(data.data.statusBreakdown.Lead >= 2);
    assert.ok(Array.isArray(data.data.recentLeads));
    assert.ok(Array.isArray(data.data.monthlyStats));
  });

  await t.test('3. Bank Management CRUD - Create, Read, Update, Status Toggle', async () => {
    // Create Bank
    const createRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Test Partner Bank ${Date.now().toString().slice(-4)}`,
        bankCode: `TBK${Date.now().toString().slice(-3)}`,
        description: 'Automated test bank entity',
        contactDetails: {
          contactPerson: 'Mr. Test Officer',
          email: 'officer@testbk.com',
          phone: '9988776655',
        },
        interestRateRange: { min: 8.9, max: 14.5 },
      }),
    });
    const createData = await createRes.json();
    assert.equal(createRes.status, 201);
    testBankId = createData.data._id;

    // Update Bank
    const updateRes = await fetch(`${baseUrl}/admin/banks/${testBankId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        processingFeeDetails: 'Flat 0.5% + GST for RealCred clients',
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.processingFeeDetails, 'Flat 0.5% + GST for RealCred clients');

    // Toggle Bank status
    const toggleRes = await fetch(`${baseUrl}/admin/banks/${testBankId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleData = await toggleRes.json();
    assert.equal(toggleRes.status, 200);
    assert.equal(toggleData.data.status, 'inactive');
  });

  await t.test('4. Partner Management - List and Update Commission Slab', async () => {
    const listRes = await fetch(`${baseUrl}/admin/partners`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.ok(listData.count >= 1);

    const updateRes = await fetch(`${baseUrl}/admin/partners/${testPartnerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        defaultCommissionRate: 2.25,
        notes: 'Premium tier DSA commission agreed.',
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.defaultCommissionRate, 2.25);
  });

  await t.test('5. Lead Management - Dual Views (Website Leads vs Partner Leads)', async () => {
    // Website Leads endpoint
    const webRes = await fetch(`${baseUrl}/admin/website-leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const webData = await webRes.json();
    assert.equal(webRes.status, 200);
    const hasOnlyWebsite = webData.data.every((l) => l.source === 'website');
    assert.ok(hasOnlyWebsite);

    // Partner Leads endpoint
    const partnerRes = await fetch(`${baseUrl}/admin/partner-leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const partnerData = await partnerRes.json();
    assert.equal(partnerRes.status, 200);
    const hasOnlyPartner = partnerData.data.every((l) => l.source === 'partner');
    assert.ok(hasOnlyPartner);
  });

  await t.test('6. Lead Assignment - Assign lead to Employee & Log LeadAssignment', async () => {
    const assignRes = await fetch(`${baseUrl}/admin/leads/${testLeadId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        employeeId: testEmployeeId,
        notes: 'Priority high-value file. Complete KYC check today.',
      }),
    });
    const assignData = await assignRes.json();
    assert.equal(assignRes.status, 200);
    assert.equal(assignData.data.assignedTo._id, testEmployeeId);

    // Verify employee count incremented
    const emp = await Employee.findById(testEmployeeId);
    assert.ok(emp.assignedLeadsCount >= 1);
  });

  await t.test('7. Lead Lifecycle & Automatic Payout Generation on Disbursement', async () => {
    // Progress Partner Lead: Lead -> In Process -> Sanction -> Disbursement
    const sanctionRes = await fetch(`${baseUrl}/admin/leads/${testPartnerLeadId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Sanction',
        sanctionedAmount: 4000000,
        sanctionReferenceNumber: 'SANCT-2026-001',
        remarks: 'Sanction letter issued by partner bank.',
      }),
    });
    const sanctionData = await sanctionRes.json();
    assert.equal(sanctionRes.status, 200);
    assert.equal(sanctionData.data.status, 'Sanction');

    // Progress to Disbursement: MUST trigger immediate payout eligibility and auto-generate Payout
    const disburseRes = await fetch(`${baseUrl}/admin/leads/${testPartnerLeadId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'Disbursement',
        disbursedAmount: 4000000,
        disbursementReferenceNumber: 'DISB-2026-999',
        remarks: 'Disbursed directly into borrower account.',
      }),
    });
    const disburseData = await disburseRes.json();
    assert.equal(disburseRes.status, 200);
    assert.equal(disburseData.data.status, 'Disbursement');
    assert.equal(disburseData.data.isEligibleForPayout, true);
    assert.equal(disburseData.data.payoutStatus, 'pending');

    // Verify Payout record was created
    const payout = await Payout.findOne({ lead: testPartnerLeadId });
    assert.ok(payout);
    assert.equal(payout.disbursedLoanAmount, 4000000);
    assert.equal(payout.status, 'pending');
    testPayoutId = payout._id.toString();
  });

  await t.test('8. Payout Management - Override Commission, Status Update, and Complete', async () => {
    const updateRes = await fetch(`${baseUrl}/admin/payouts/${testPayoutId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        commissionRate: 2.0,
        grossCommissionAmount: 80000,
        tdsAmount: 4000,
        netPayoutAmount: 76000,
        status: 'completed',
        paymentDetails: {
          paymentMethod: 'bank_transfer',
          transactionReference: 'NEFT202611239999',
        },
        remarks: 'Approved and transferred via corporate net banking.',
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.status, 'completed');
    assert.equal(updateData.data.netPayoutAmount, 76000);

    // Verify lead status was updated to completed payout
    const updatedLead = await Lead.findById(testPartnerLeadId);
    assert.equal(updatedLead.payoutStatus, 'completed');
  });

  await t.test('9. Invoice Generation - Generate official invoice snapshot', async () => {
    const invRes = await fetch(`${baseUrl}/admin/invoices/generate/${testPayoutId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const invData = await invRes.json();
    assert.equal(invRes.status, 201);
    assert.match(invData.data.invoiceNumber, /^RCINV-/);
    assert.equal(invData.data.financialSummary.totalPayable, 76000);

    // Fetch all invoices
    const listRes = await fetch(`${baseUrl}/admin/invoices`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    assert.equal(listRes.status, 200);
    assert.ok(listData.count >= 1);
  });

  await t.test('10. Support & Callbacks - Resolution and Remarks', async () => {
    const updateRes = await fetch(`${baseUrl}/admin/callbacks/${testCallbackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'completed',
        remarks: 'Client contacted, loan application form submitted.',
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.status, 'completed');
  });

  await t.test('11. Website CMS Content - Read and Update', async () => {
    const getRes = await fetch(`${baseUrl}/admin/website-content`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(getRes.status, 200);

    const updateRes = await fetch(`${baseUrl}/admin/website-content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tagline: 'Your Loan. One Guided Route.',
      }),
    });
    assert.equal(updateRes.status, 200);
  });

  // Teardown
  server.close();
  await Lead.deleteMany({ customerName: { $regex: /Customer A|Borrower B/ } });
  await Bank.deleteMany({ bankCode: { $regex: /^TBK/ } });
  await CallbackRequest.deleteMany({ requestNumber: { $regex: /RCCB-TEST/ } });
  await mongoose.disconnect();
  process.exit(0);
});
