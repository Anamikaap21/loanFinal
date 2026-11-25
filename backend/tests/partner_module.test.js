import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import express from 'express';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Lead from '../models/Lead.js';
import LoanCategory from '../models/LoanCategory.js';
import Bank from '../models/Bank.js';
import Payout from '../models/Payout.js';
import Invoice from '../models/Invoice.js';

import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import partnerRoutes from '../routes/partnerRoutes.js';
import loanRoutes from '../routes/loanRoutes.js';

test('RealCred Partner Module Integration Test Suite', async (t) => {
  await connectDB();

  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/partner', partnerRoutes);
  app.use('/api/loans', loanRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  let partner1Token = '';
  let partner1User = null;
  let partner1 = null;

  let partner2Token = '';
  let partner2User = null;
  let partner2 = null;

  let testCategory = null;
  let testBank = null;
  let createdLead1 = null;

  t.after(async () => {
    // Cleanup created test records
    if (partner1User) await User.deleteOne({ _id: partner1User._id });
    if (partner1) await Partner.deleteOne({ _id: partner1._id });
    if (partner2User) await User.deleteOne({ _id: partner2User._id });
    if (partner2) await Partner.deleteOne({ _id: partner2._id });
    if (createdLead1) {
      await Lead.deleteOne({ _id: createdLead1._id });
      await Payout.deleteOne({ lead: createdLead1._id });
      await Invoice.deleteOne({ lead: createdLead1._id });
    }
    server.close();
  });

  // Setup: Register two separate partners for isolation testing
  const p1Email = `partner1_${Date.now()}@realcred.test`;
  const p2Email = `partner2_${Date.now()}@realcred.test`;

  const reg1Res = await fetch(`${baseUrl}/api/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Sharma',
      email: p1Email,
      password: 'PartnerPass123!',
      phone: '9876543210',
      businessName: 'Sharma Financial Consultancy',
      city: 'Noida',
    }),
  });
  const reg1Data = await reg1Res.json();
  assert.strictEqual(reg1Res.status, 201, 'Partner 1 registered');
  partner1Token = reg1Data.data.token;
  partner1User = reg1Data.data.user;
  partner1 = await Partner.findOne({ user: partner1User._id });

  const reg2Res = await fetch(`${baseUrl}/api/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Verma',
      email: p2Email,
      password: 'PartnerPass123!',
      phone: '9811223344',
      businessName: 'Verma Wealth Partners',
      city: 'Delhi',
    }),
  });
  const reg2Data = await reg2Res.json();
  assert.strictEqual(reg2Res.status, 201, 'Partner 2 registered');
  partner2Token = reg2Data.data.token;
  partner2User = reg2Data.data.user;
  partner2 = await Partner.findOne({ user: partner2User._id });

  // Get active Category & Bank for lead testing
  testCategory = await LoanCategory.findOne({ isActive: true });
  testBank = await Bank.findOne({ status: 'active' });

  await t.test('1. Security Guard - Rejects Unauthenticated Access to Partner Portal', async () => {
    const unauthRes = await fetch(`${baseUrl}/api/partner/dashboard/metrics`);
    assert.strictEqual(unauthRes.status, 401, '401 Unauthorized for missing token');

    const invalidRoleRes = await fetch(`${baseUrl}/api/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer invalid-token` },
    });
    assert.strictEqual(invalidRoleRes.status, 401, '401 for invalid JWT');
  });

  await t.test('2. GET /api/partner/dashboard/metrics - Live Personal Business Metrics', async () => {
    const res = await fetch(`${baseUrl}/api/partner/dashboard/metrics`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();

    assert.strictEqual(json.status, 'success');
    assert.strictEqual(json.data.partner.partnerCode, partner1.partnerCode);
    assert.strictEqual(typeof json.data.summary.totalLeadsSubmitted, 'number');
    assert.strictEqual(typeof json.data.summary.totalDisbursedVolume, 'number');
    assert.ok(json.data.statusBreakdown);
    assert.strictEqual(typeof json.data.statusBreakdown['Lead'], 'number');
  });

  await t.test('3. Profile Management - GET & PUT /api/partner/profile', async () => {
    const getRes = await fetch(`${baseUrl}/api/partner/profile`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(getRes.status, 200);
    const getJson = await getRes.json();
    assert.strictEqual(getJson.data.partnerCode, partner1.partnerCode);

    // Update banking settlement details
    const putRes = await fetch(`${baseUrl}/api/partner/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${partner1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: 'Sharma Financial Services LLP',
        panNumber: 'ABCDE1234F',
        bankDetails: {
          accountHolderName: 'Sharma Financial',
          accountNumber: '918273645501',
          bankName: 'HDFC Bank',
          ifscCode: 'HDFC0001234',
        },
      }),
    });
    assert.strictEqual(putRes.status, 200);
    const putJson = await putRes.json();
    assert.strictEqual(putJson.data.businessName, 'Sharma Financial Services LLP');
    assert.strictEqual(putJson.data.bankDetails.ifscCode, 'HDFC0001234');
    assert.strictEqual(putJson.data.panNumber, 'ABCDE1234F');
  });

  await t.test('4. Lead Creation - POST /api/partner/leads (Preserves Partner Attribution)', async () => {
    const createRes = await fetch(`${baseUrl}/api/partner/leads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${partner1Token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Amit Saxena',
        customerPhone: '9899123456',
        customerEmail: 'amit.saxena@example.com',
        city: 'Noida',
        employmentType: 'salaried',
        monthlyIncome: 85000,
        loanCategory: testCategory._id,
        requiredLoanAmount: 2500000,
        preferredBank: testBank._id,
        remarks: 'Client interested in balance transfer or fresh Home Loan.',
      }),
    });

    assert.strictEqual(createRes.status, 201, 'Lead created');
    const createJson = await createRes.json();
    assert.strictEqual(createJson.status, 'success');
    createdLead1 = createJson.data;

    assert.strictEqual(createdLead1.customerName, 'Amit Saxena');
    assert.strictEqual(createdLead1.source, 'partner');
    assert.strictEqual(createdLead1.partnerId.toString(), partner1._id.toString());
    assert.strictEqual(createdLead1.status, 'Lead');
    assert.strictEqual(createdLead1.isEligibleForPayout, false);

    // Verify partner leads submitted counter incremented
    const updatedPartner = await Partner.findById(partner1._id);
    assert.strictEqual(updatedPartner.totalLeadsSubmitted, 1);
  });

  await t.test('5. Multi-Tenant Isolation - Partner 2 Cannot Access Partner 1 Lead', async () => {
    // Partner 1 accesses their own lead: 200 OK
    const p1AccessRes = await fetch(`${baseUrl}/api/partner/leads/${createdLead1._id}`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(p1AccessRes.status, 200, 'Owner partner can access');

    // Partner 2 attempts to access Partner 1's lead: 403 Forbidden
    const p2AccessRes = await fetch(`${baseUrl}/api/partner/leads/${createdLead1._id}`, {
      headers: { Authorization: `Bearer ${partner2Token}` },
    });
    assert.strictEqual(p2AccessRes.status, 403, 'Partner 2 is blocked from Partner 1 lead');
    const p2Json = await p2AccessRes.json();
    assert.strictEqual(p2Json.status, 'error');
  });

  await t.test('6. My Leads Filtering & Search - GET /api/partner/leads', async () => {
    const listRes = await fetch(`${baseUrl}/api/partner/leads?search=Amit`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listJson = await listRes.json();
    assert.strictEqual(listJson.count, 1);
    assert.strictEqual(listJson.data[0].customerName, 'Amit Saxena');

    // Partner 2 lists their leads -> should have 0
    const p2ListRes = await fetch(`${baseUrl}/api/partner/leads`, {
      headers: { Authorization: `Bearer ${partner2Token}` },
    });
    assert.strictEqual(p2ListRes.status, 200);
    const p2ListJson = await p2ListRes.json();
    assert.strictEqual(p2ListJson.count, 0, 'Partner 2 sees only their own leads');
  });

  await t.test('7. Lead Pipeline Tracker - GET /api/partner/pipeline', async () => {
    const pipeRes = await fetch(`${baseUrl}/api/partner/pipeline`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(pipeRes.status, 200);
    const pipeJson = await pipeRes.json();

    assert.strictEqual(pipeJson.status, 'success');
    assert.ok(pipeJson.data.pipeline['Lead']);
    assert.strictEqual(pipeJson.data.pipeline['Lead'].length, 1);
  });

  await t.test('8. Payout & Invoicing Views - GET /api/partner/payouts & /api/partner/invoices', async () => {
    // 1. Advance lead to Disbursement to trigger automatic payout
    const lead = await Lead.findById(createdLead1._id);
    lead.status = 'Disbursement';
    lead.disbursedAmount = 2500000;
    lead.isEligibleForPayout = true;
    lead.payoutStatus = 'eligible';
    await lead.save();

    // Create payout record
    const payout = new Payout({
      payoutNumber: `RCPAY-TEST-${Date.now().toString().slice(-4)}`,
      lead: lead._id,
      partner: partner1._id,
      partnerUser: partner1User._id,
      disbursedLoanAmount: 2500000,
      commissionType: 'percentage',
      commissionRate: 1.5,
      grossCommissionAmount: 37500,
      tdsRate: 5,
      tdsAmount: 1875,
      netPayoutAmount: 35625,
      status: 'completed',
    });
    await payout.save();

    // Query payouts via Partner API
    const payoutRes = await fetch(`${baseUrl}/api/partner/payouts`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(payoutRes.status, 200);
    const payoutJson = await payoutRes.json();
    assert.strictEqual(payoutJson.count, 1);
    assert.strictEqual(payoutJson.data.summary.totalGross, 37500);
    assert.strictEqual(payoutJson.data.summary.totalTds, 1875);
    assert.strictEqual(payoutJson.data.summary.totalNet, 35625);

    // Create Invoice snapshot
    const invoice = new Invoice({
      invoiceNumber: `RCINV-TEST-${Date.now().toString().slice(-4)}`,
      payout: payout._id,
      partner: partner1._id,
      lead: lead._id,
      partnerDetails: {
        partnerCode: partner1.partnerCode,
        partnerName: 'Rohan Sharma',
        businessName: 'Sharma Financial Services LLP',
        phone: '9876543210',
        email: p1Email,
        address: 'Noida',
        panNumber: 'ABCDE1234F',
      },
      loanReference: {
        leadCode: lead.leadId,
        customerName: lead.customerName,
        loanCategory: 'Home Loan',
        disbursedLoanAmount: 2500000,
      },
      financialSummary: {
        commissionType: 'percentage',
        commissionRate: 1.5,
        grossCommissionAmount: 37500,
        tdsAmount: 1875,
        totalPayable: 35625,
      },
      payoutStatus: 'completed',
    });
    await invoice.save();

    // Query invoices via Partner API
    const invRes = await fetch(`${baseUrl}/api/partner/invoices`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(invRes.status, 200);
    const invJson = await invRes.json();
    assert.strictEqual(invJson.count, 1);
    assert.strictEqual(invJson.data[0].financialSummary.totalPayable, 35625);

    // Invoice details endpoint
    const invDetailRes = await fetch(`${baseUrl}/api/partner/invoices/${invoice._id}`, {
      headers: { Authorization: `Bearer ${partner1Token}` },
    });
    assert.strictEqual(invDetailRes.status, 200);

    // Partner 2 attempts to fetch Partner 1's invoice -> 403 Forbidden
    const p2InvRes = await fetch(`${baseUrl}/api/partner/invoices/${invoice._id}`, {
      headers: { Authorization: `Bearer ${partner2Token}` },
    });
    assert.strictEqual(p2InvRes.status, 403, 'Partner 2 cannot read Partner 1 invoice');
  });
});
