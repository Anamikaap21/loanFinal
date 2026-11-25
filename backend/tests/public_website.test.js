import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { ENV } from '../config/environment.js';
import app from '../server.js';
import { Lead, LoanApplication, CallbackRequest, LoanCategory, Bank } from '../models/index.js';

test('RealCred Public Website API Integration Suite', async (t) => {
  await mongoose.connect(ENV.MONGO_URI);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  let homeLoanCategory;
  let activeBank;

  await t.test('1. GET /api/website/content - Fetches synchronized CMS content', async () => {
    const res = await fetch(`${baseUrl}/website/content`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.hero, 'Hero section must exist');
    assert.ok(data.data.about, 'About section must exist');
    assert.ok(data.data.vision_mission, 'Vision & Mission must exist');
    assert.ok(data.data.commitment, 'Commitment must exist');
    assert.ok(data.data.contact_info, 'Contact info must exist');
  });

  await t.test('2. GET /api/loans/categories - Fetches 5 Core Loan Products from MongoDB', async () => {
    const res = await fetch(`${baseUrl}/loans/categories`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.length >= 5, 'Must contain at least 5 products');
    homeLoanCategory = data.data.find((c) => c.slug === 'home-loan');
    assert.ok(homeLoanCategory, 'Home Loan category must exist');
    assert.ok(homeLoanCategory.features.length > 0);
    assert.ok(homeLoanCategory.requiredDocuments.length > 0);
  });

  await t.test('3. GET /api/loans/categories/:slug - Fetches detailed category data', async () => {
    const res = await fetch(`${baseUrl}/loans/categories/home-loan`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.data.name, 'Home Loan');
    assert.strictEqual(data.data.slug, 'home-loan');
  });

  await t.test('4. GET /api/banks/active - Fetches active lending banks for dropdowns', async () => {
    const res = await fetch(`${baseUrl}/banks/active`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.data.length >= 5, 'Must return active partner banks');
    activeBank = data.data[0];
    assert.ok(activeBank._id);
    assert.strictEqual(activeBank.status, 'active');
  });

  await t.test('5. POST /api/loans/apply - Direct Website Application with Strict Partner Isolation', async () => {
    const runId = Date.now().toString();
    const customerPhone = `95${Math.floor(10000000 + Math.random() * 90000000)}`;

    const res = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Manish Rawat',
        mobileNumber: customerPhone,
        email: `manish_${runId}@example.com`,
        city: 'Noida',
        loanCategoryId: homeLoanCategory._id,
        preferredBankId: activeBank._id,
        requiredLoanAmount: 4500000,
        employmentType: 'salaried',
        monthlyIncome: 85000,
        additionalDetails: 'Looking for 20 years tenure ready to move apartment',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.leadId, 'Lead ID must be generated');
    assert.ok(data.data.applicationNumber, 'Application Number must be generated');

    // Verify in database: Lead must have source = 'website' and partnerId = null
    const createdLead = await Lead.findOne({ leadId: data.data.leadId });
    assert.ok(createdLead);
    assert.strictEqual(createdLead.source, 'website');
    assert.strictEqual(createdLead.partnerId, null, 'Direct website lead must NEVER have partnerId');
    assert.strictEqual(createdLead.isEligibleForPayout, false);
    assert.strictEqual(createdLead.payoutStatus, 'not_eligible');

    // Verify LoanApplication record
    const application = await LoanApplication.findOne({ applicationNumber: data.data.applicationNumber });
    assert.ok(application);
    assert.strictEqual(application.fullName, 'Manish Rawat');
  });

  await t.test('6. POST /api/callbacks - Registers Customer Callback Request in MongoDB', async () => {
    const callbackPhone = `94${Math.floor(10000000 + Math.random() * 90000000)}`;

    const res = await fetch(`${baseUrl}/callbacks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Ananya Deshmukh',
        mobileNumber: callbackPhone,
        email: 'ananya@example.com',
        loanType: 'Business Loan',
        preferredContactTime: 'Evening (5 PM - 8 PM)',
        message: 'Require working capital loan for export firm',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.status, 'success');
    assert.ok(data.data.requestNumber);

    const savedCallback = await CallbackRequest.findOne({ requestNumber: data.data.requestNumber });
    assert.ok(savedCallback);
    assert.strictEqual(savedCallback.customerName, 'Ananya Deshmukh');
    assert.strictEqual(savedCallback.status, 'pending');
  });

  server.close();
  await mongoose.disconnect();
  process.exit(0);
});
