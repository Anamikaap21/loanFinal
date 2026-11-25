import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Lead from '../models/Lead.js';
import LoanCategory from '../models/LoanCategory.js';
import Bank from '../models/Bank.js';
import Payout from '../models/Payout.js';
import Invoice from '../models/Invoice.js';

import {
  calculateCommissionAndTds,
  generateInvoicePDF,
  generateAndPersistInvoice,
} from '../services/invoiceService.js';

test('RealCred Phase 8: Financial Integration, Payout Eligibility & PDF Invoicing Suite', async (t) => {
  let server;
  let baseUrl = '';
  let adminToken = '';
  let partnerToken = '';
  let otherPartnerToken = '';
  let partnerUser = null;
  let partner = null;
  let otherPartnerUser = null;
  let otherPartner = null;
  let createdLead = null;
  let createdPayout = null;
  let createdInvoice = null;

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

  t.after(async () => {
    // Cleanup
    if (createdInvoice) {
      const pdfPath = path.join(process.cwd(), 'backend', 'uploads', 'invoices', `${createdInvoice.invoiceNumber}.pdf`);
      if (fs.existsSync(pdfPath)) {
        try { fs.unlinkSync(pdfPath); } catch (e) {}
      }
      await Invoice.deleteOne({ _id: createdInvoice._id });
    }
    if (createdPayout) await Payout.deleteOne({ _id: createdPayout._id });
    if (createdLead) await Lead.deleteOne({ _id: createdLead._id });
    if (partnerUser) await User.deleteOne({ _id: partnerUser._id });
    if (partner) await Partner.deleteOne({ _id: partner._id });
    if (otherPartnerUser) await User.deleteOne({ _id: otherPartnerUser._id });
    if (otherPartner) await Partner.deleteOne({ _id: otherPartner._id });
    server.close();
  });

  // 1. Admin Login
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emailOrPhone: ENV.INITIAL_ADMIN.email,
      password: ENV.INITIAL_ADMIN.password,
      role: 'admin',
    }),
  });
  const adminJson = await adminLoginRes.json();
  assert.strictEqual(adminLoginRes.status, 200, 'Admin authenticated');
  adminToken = adminJson.data.token;

  // 2. Partner Registration
  const pEmail = `p8_partner_${Date.now()}@realcred.test`;
  const regPartnerRes = await fetch(`${baseUrl}/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikas Aggarwal',
      email: pEmail,
      password: 'PartnerPass123!',
      phone: '9988776655',
      businessName: 'Aggarwal Capital Services',
      city: 'Noida',
    }),
  });
  const regPartnerJson = await regPartnerRes.json();
  assert.strictEqual(regPartnerRes.status, 201, 'Partner registered');
  partnerToken = regPartnerJson.data.token;
  partnerUser = regPartnerJson.data.user;
  partner = await Partner.findOne({ user: partnerUser._id });

  // 3. Other Partner Registration for isolation tests
  const otherPEmail = `p8_other_${Date.now()}@realcred.test`;
  const regOtherRes = await fetch(`${baseUrl}/auth/register-partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sunita Mehra',
      email: otherPEmail,
      password: 'PartnerPass123!',
      phone: '9911224455',
      businessName: 'Mehra Financials',
      city: 'Delhi',
    }),
  });
  const regOtherJson = await regOtherRes.json();
  otherPartnerToken = regOtherJson.data.token;
  otherPartnerUser = regOtherJson.data.user;
  otherPartner = await Partner.findOne({ user: otherPartnerUser._id });

  const testCategory = await LoanCategory.findOne({ isActive: true });

  await t.test('1. Financial Engine - Strict 5% Statutory TDS (Sec 194H) Calculation', async () => {
    // ₹10,00,000 loan at 1.5% commission:
    // Gross: 15,000 | TDS (5%): 750 | Net: 14,250
    const calc = calculateCommissionAndTds({
      disbursedAmount: 1000000,
      commissionRate: 1.5,
      commissionType: 'percentage',
      tdsRate: 5,
    });

    assert.strictEqual(calc.disbursedLoanAmount, 1000000);
    assert.strictEqual(calc.grossCommissionAmount, 15000);
    assert.strictEqual(calc.tdsAmount, 750);
    assert.strictEqual(calc.netPayoutAmount, 14250);
  });

  await t.test('2. Lead Payout Eligibility - Partner vs Direct Website Lead Isolation', async () => {
    // A. Direct Website Lead -> strictly ineligible
    const webLead = new Lead({
      leadId: `RCL-WEB-${Date.now().toString().slice(-4)}`,
      source: 'website',
      customerName: 'Direct Customer',
      customerPhone: '9812345678',
      city: 'Noida',
      loanCategory: testCategory._id,
      requiredLoanAmount: 2000000,
      status: 'Disbursement',
      disbursedAmount: 2000000,
    });
    await webLead.save();

    assert.strictEqual(webLead.source, 'website');
    assert.strictEqual(webLead.partnerId, null);
    assert.strictEqual(webLead.isEligibleForPayout, false);
    assert.strictEqual(webLead.payoutStatus, 'not_eligible');
    await Lead.deleteOne({ _id: webLead._id });

    // B. Partner Lead -> becomes eligible on Disbursement
    createdLead = new Lead({
      leadId: `RCL-PTR-${Date.now().toString().slice(-4)}`,
      source: 'partner',
      partnerId: partner._id,
      customerName: 'Praveen Singhal',
      customerPhone: '9876501234',
      city: 'Noida',
      loanCategory: testCategory._id,
      requiredLoanAmount: 3000000,
      status: 'Sanction',
      sanctionedAmount: 3000000,
    });
    await createdLead.save();
    assert.strictEqual(createdLead.isEligibleForPayout, false);

    // Advance to Disbursement
    createdLead.status = 'Disbursement';
    createdLead.disbursedAmount = 3000000;
    await createdLead.save();
    assert.strictEqual(createdLead.isEligibleForPayout, true);
    assert.strictEqual(createdLead.payoutStatus, 'eligible');
  });

  await t.test('3. Duplicate Payout Prevention - Enforced by Unique Index on Payout.lead', async () => {
    // Create initial payout
    createdPayout = new Payout({
      payoutNumber: `RCPAY-P8-${Date.now().toString().slice(-5)}`,
      lead: createdLead._id,
      partner: partner._id,
      partnerUser: partnerUser._id,
      disbursedLoanAmount: 3000000,
      commissionType: 'percentage',
      commissionRate: 1.5,
      grossCommissionAmount: 45000,
      tdsRate: 5,
      tdsAmount: 2250,
      netPayoutAmount: 42750,
      status: 'completed',
    });
    await createdPayout.save();
    assert.ok(createdPayout._id);

    // Attempt to create duplicate payout for the exact same lead -> must reject with duplicate key error (code 11000)
    let duplicateRejected = false;
    try {
      const duplicatePayout = new Payout({
        payoutNumber: `RCPAY-P8-DUP-${Date.now().toString().slice(-5)}`,
        lead: createdLead._id,
        partner: partner._id,
        partnerUser: partnerUser._id,
        disbursedLoanAmount: 3000000,
        commissionType: 'percentage',
        commissionRate: 1.5,
        grossCommissionAmount: 45000,
        tdsRate: 5,
        tdsAmount: 2250,
        netPayoutAmount: 42750,
        status: 'pending',
      });
      await duplicatePayout.save();
    } catch (err) {
      duplicateRejected = true;
      assert.strictEqual(err.code, 11000, 'MongoDB duplicate key code 11000 on Payout.lead');
    }
    assert.strictEqual(duplicateRejected, true, 'Duplicate payout creation was strictly prevented');
  });

  await t.test('4. PDF Invoice Generation - RealCred PDFKit Engine Generates File on Disk', async () => {
    createdInvoice = await generateAndPersistInvoice(createdPayout._id, adminJson.data.user.id);

    assert.ok(createdInvoice._id);
    assert.ok(createdInvoice.invoiceNumber.startsWith('RCINV-'));
    assert.strictEqual(createdInvoice.financialSummary.grossCommissionAmount, 45000);
    assert.strictEqual(createdInvoice.financialSummary.tdsAmount, 2250);
    assert.strictEqual(createdInvoice.financialSummary.totalPayable, 42750);
    assert.strictEqual(createdInvoice.pdfFileName, `${createdInvoice.invoiceNumber}.pdf`);

    // Verify physical file was written to disk
    const expectedDiskPath = path.join(process.cwd(), 'backend', 'uploads', 'invoices', `${createdInvoice.invoiceNumber}.pdf`);
    assert.strictEqual(fs.existsSync(expectedDiskPath), true, 'PDF file was generated and persisted to disk');

    const stat = fs.statSync(expectedDiskPath);
    assert.ok(stat.size > 1000, 'PDF file size is non-trivial (> 1KB)');
  });

  await t.test('5. PDF Invoice Download & Role Isolation - Admin & Partner Access Verification', async () => {
    // A. Admin downloads PDF invoice: 200 OK
    const adminPdfRes = await fetch(`${baseUrl}/admin/invoices/${createdInvoice._id}/pdf`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminPdfRes.status, 200, 'Admin can download PDF');
    const adminContentType = adminPdfRes.headers.get('content-type');
    assert.ok(adminContentType?.includes('application/pdf'), 'Returns application/pdf');

    // B. Partner downloads their own PDF invoice: 200 OK
    const partnerPdfRes = await fetch(`${baseUrl}/partner/invoices/${createdInvoice._id}/pdf`, {
      headers: { Authorization: `Bearer ${partnerToken}` },
    });
    assert.strictEqual(partnerPdfRes.status, 200, 'Owner Partner can download PDF');

    // C. Other Partner tries to download Partner 1 PDF invoice: 403 Forbidden
    const otherPartnerPdfRes = await fetch(`${baseUrl}/partner/invoices/${createdInvoice._id}/pdf`, {
      headers: { Authorization: `Bearer ${otherPartnerToken}` },
    });
    assert.strictEqual(otherPartnerPdfRes.status, 403, 'Other Partner is blocked with 403 Forbidden');
  });
});
