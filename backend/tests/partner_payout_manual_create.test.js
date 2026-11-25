import { test } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Lead from '../models/Lead.js';
import Payout from '../models/Payout.js';
import LoanCategory from '../models/LoanCategory.js';

const JWT_SECRET = ENV.JWT_SECRET;

test('Admin Partner Payout Manual Creation & Listing Test Suite', async (t) => {
  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/realcred');
  }

  const timestamp = Date.now();
  let adminUser, adminToken;
  let partnerUser, partnerToken, partnerDoc;
  let loanCat;
  let testLead1, testLead2;
  let server, baseUrl;

  // Start HTTP server for supertest/fetch
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  t.after(async () => {
    // Cleanup created test records
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (partnerUser) await User.deleteOne({ _id: partnerUser._id });
    if (partnerDoc) await Partner.deleteOne({ _id: partnerDoc._id });
    if (loanCat) await LoanCategory.deleteOne({ _id: loanCat._id });
    if (testLead1) await Lead.deleteOne({ _id: testLead1._id });
    if (testLead2) await Lead.deleteOne({ _id: testLead2._id });
    await Payout.deleteMany({ payoutNumber: { $regex: '^RCPAY-' } });

    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  // Setup seed data
  adminUser = await User.create({
    name: `Admin Test ${timestamp}`,
    email: `admin_${timestamp}@realcredtest.in`,
    password: 'Password@123',
    phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
    role: 'admin',
    status: 'active',
    accountStatus: 'active',
  });
  adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role }, JWT_SECRET, { expiresIn: '1h' });

  partnerUser = await User.create({
    name: `Partner Test ${timestamp}`,
    email: `partner_${timestamp}@realcredtest.in`,
    password: 'Password@123',
    phone: `98764${Math.floor(10000 + Math.random() * 90000)}`,
    role: 'partner',
    status: 'active',
    accountStatus: 'active',
  });
  partnerToken = jwt.sign({ id: partnerUser._id, role: partnerUser.role }, JWT_SECRET, { expiresIn: '1h' });

  partnerDoc = await Partner.create({
    user: partnerUser._id,
    businessName: `Test DSA Agency ${timestamp}`,
    partnerCode: `DSA-${timestamp.toString().slice(-4)}`,
    accountStatus: 'active',
    defaultCommissionRate: 1.5,
  });

  loanCat = await LoanCategory.create({
    name: `Business Loan Test ${timestamp}`,
    slug: `business-loan-test-${timestamp}`,
    description: 'Test business loan description',
    status: 'active',
  });

  testLead1 = await Lead.create({
    leadId: `LEAD-${timestamp.toString().slice(-4)}-1`,
    source: 'partner',
    partnerId: partnerDoc._id,
    customerName: 'Rahul Verma',
    customerPhone: '9876543210',
    city: 'Noida',
    loanCategory: loanCat._id,
    requiredLoanAmount: 2000000,
    disbursedAmount: 2000000,
    disbursementDate: new Date(),
    status: 'Disbursement',
    isEligibleForPayout: true,
    payoutStatus: 'eligible',
  });

  testLead2 = await Lead.create({
    leadId: `LEAD-${timestamp.toString().slice(-4)}-2`,
    source: 'partner',
    partnerId: partnerDoc._id,
    customerName: 'Anjali Sharma',
    customerPhone: '9876543211',
    city: 'Noida',
    loanCategory: loanCat._id,
    requiredLoanAmount: 1500000,
    disbursedAmount: 1500000,
    disbursementDate: new Date(),
    status: 'Disbursement',
    isEligibleForPayout: true,
    payoutStatus: 'eligible',
  });

  await t.test('1. Admin fetches partner leads for payout via /api/admin/payouts/partner-leads/:partnerId', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts/partner-leads/${partnerDoc._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
    assert.ok(body.data.length >= 2);
    const found1 = body.data.find((l) => l._id === testLead1._id.toString());
    assert.ok(found1);
    assert.equal(found1.hasExistingPayout, false);
  });

  let createdPayout1;

  await t.test('2. Admin manually creates a Percentage-based payout (1.75% on ₹20,00,000)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        partnerId: partnerDoc._id.toString(),
        leadId: testLead1._id.toString(),
        disbursedLoanAmount: 2000000,
        disbursementDate: '2026-11-20',
        commissionType: 'percentage',
        commissionRate: 1.75,
        payoutDate: '2026-11-25',
        status: 'pending',
        remarks: 'Manual payout test with 1.75% rate',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'success');
    createdPayout1 = body.data;
    assert.ok(createdPayout1.payoutNumber.startsWith('RCPAY-'));
    assert.equal(createdPayout1.disbursedLoanAmount, 2000000);
    assert.equal(createdPayout1.commissionRate, 1.75);
    // Gross: 20,00,000 * 1.75% = 35,000
    assert.equal(createdPayout1.grossCommissionAmount, 35000);
    // TDS 5%: 35,000 * 5% = 1,750
    assert.equal(createdPayout1.tdsAmount, 1750);
    // Net: 35,000 - 1,750 = 33,250
    assert.equal(createdPayout1.netPayoutAmount, 33250);
    assert.equal(createdPayout1.status, 'pending');

    // Verify lead was linked
    const updatedLead = await Lead.findById(testLead1._id);
    assert.equal(updatedLead.payoutId.toString(), createdPayout1._id.toString());
    assert.equal(updatedLead.payoutStatus, 'pending');
  });

  await t.test('3. Duplicate prevention: cannot create duplicate payout for testLead1', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        partnerId: partnerDoc._id.toString(),
        leadId: testLead1._id.toString(),
        disbursedLoanAmount: 2000000,
        commissionType: 'percentage',
        commissionRate: 1.5,
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'error');
    assert.ok(body.message.includes('already been generated'));
  });

  let createdPayout2;

  await t.test('4. Admin manually creates a Fixed-amount payout (₹25,000 fixed, status: Paid)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        partnerId: partnerDoc._id.toString(),
        leadId: testLead2._id.toString(),
        disbursedLoanAmount: 1500000,
        disbursementDate: '2026-11-22',
        commissionType: 'fixed',
        commissionRate: 25000,
        payoutDate: '2026-11-25',
        status: 'paid',
        remarks: 'Fixed fee corporate arrangement',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.status, 'success');
    createdPayout2 = body.data;
    assert.equal(createdPayout2.commissionType, 'fixed');
    assert.equal(createdPayout2.grossCommissionAmount, 25000);
    // TDS 5%: 25,000 * 5% = 1,250
    assert.equal(createdPayout2.tdsAmount, 1250);
    // Net: 25,000 - 1,250 = 23,750
    assert.equal(createdPayout2.netPayoutAmount, 23750);
    assert.equal(createdPayout2.status, 'completed'); // Normalized 'paid' -> 'completed'

    // Partner totalCommissionEarned incremented
    const updatedPartner = await Partner.findById(partnerDoc._id);
    assert.equal(updatedPartner.totalCommissionEarned, 23750);
  });

  await t.test('5. Admin fetches all payouts via GET /api/admin/payouts', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
    assert.ok(body.data.length >= 2);

    const found1 = body.data.find((p) => p.payoutNumber === createdPayout1.payoutNumber);
    const found2 = body.data.find((p) => p.payoutNumber === createdPayout2.payoutNumber);
    assert.ok(found1);
    assert.ok(found2);
  });

  await t.test('6. Admin filters payouts by status=completed', async () => {
    const res = await fetch(`${baseUrl}/api/admin/payouts?status=completed`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
    const allCompleted = body.data.every((p) => p.status === 'completed' || p.status === 'paid');
    assert.ok(allCompleted);
  });

  await t.test('7. Partner sees payouts in My Payouts with exact live summary', async () => {
    const res = await fetch(`${baseUrl}/api/partner/payouts`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
    assert.equal(body.data.payouts.length, 2);

    // Summary checks
    // Gross: 35,000 + 25,000 = 60,000
    assert.equal(body.data.summary.totalGross, 60000);
    // TDS: 1,750 + 1,250 = 3,000
    assert.equal(body.data.summary.totalTds, 3000);
    // Net: 33,250 + 23,750 = 57,000
    assert.equal(body.data.summary.totalNet, 57000);
    // Settled / Paid: 23,750
    assert.equal(body.data.summary.totalPaid, 23750);
    // Pending: 33,250
    assert.equal(body.data.summary.totalPending, 33250);
  });
});
