import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';
import Lead, { EMPLOYMENT_TYPES } from '../models/Lead.js';
import LoanApplication from '../models/LoanApplication.js';
import LoanCategory from '../models/LoanCategory.js';

test('RealCred: EmploymentType Validation, Persistence & Website Leads Verification Suite', async (t) => {
  let server;
  let baseUrl = '';
  let adminToken = '';
  let partnerToken = '';
  let partnerUser = null;
  let partner = null;
  let adminUser = null;
  let testCategory = null;
  const createdLeadIds = [];
  const createdAppIds = [];

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

  // Ensure test loan category exists
  testCategory = await LoanCategory.findOne({ isActive: true });
  if (!testCategory) {
    testCategory = await LoanCategory.create({
      name: 'Test Personal Facility',
      slug: 'test-personal-facility-' + Date.now(),
      description: 'Test Facility for validation verification',
      minAmount: 10000,
      maxAmount: 10000000,
      interestRateStartingFrom: 10.5,
      isActive: true,
    });
  }

  // Ensure admin user exists for admin queries
  adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'System Test Admin',
      email: `testadmin_${Date.now()}@realcred.in`,
      phone: '9999988888',
      role: 'admin',
      password: 'TestPassword123!',
      isActive: true,
    });
  }

  // Ensure partner exists
  const partnerEmail = `partner_emp_test_${Date.now()}@test.com`;
  partnerUser = await User.create({
    name: 'Test Partner DSA',
    email: partnerEmail,
    phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
    role: 'partner',
    password: 'PartnerPassword123!',
    isActive: true,
  });

  partner = await Partner.create({
    user: partnerUser._id,
    businessName: 'Apex Capital Associates',
    partnerType: 'DSA',
    partnerCode: `RCP-TEST-${Date.now().toString().slice(-4)}`,
    status: 'approved',
    phone: partnerUser.phone,
    email: partnerEmail,
    commissionRate: 1.5,
  });

  // Login tokens
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminUser.email, password: 'AdminPassword123!' }),
  });
  const adminLoginData = await adminLoginRes.json();
  if (adminLoginData.token) {
    adminToken = adminLoginData.token;
  } else {
    // If standard admin password differed, generate token with jwt
    const jwt = (await import('jsonwebtoken')).default;
    adminToken = jwt.sign(
      { id: adminUser._id, role: 'admin', email: adminUser.email },
      ENV.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  const jwt = (await import('jsonwebtoken')).default;
  partnerToken = jwt.sign(
    { id: partnerUser._id, role: 'partner', email: partnerUser.email },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  t.after(async () => {
    // Cleanup created data
    if (createdAppIds.length > 0) {
      await LoanApplication.deleteMany({ _id: { $in: createdAppIds } });
    }
    if (createdLeadIds.length > 0) {
      await Lead.deleteMany({ _id: { $in: createdLeadIds } });
    }
    if (partner) await Partner.deleteOne({ _id: partner._id });
    if (partnerUser) await User.deleteOne({ _id: partnerUser._id });

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  await t.test('1. Verify schema constants and enum values are exported and complete', () => {
    assert.ok(Array.isArray(EMPLOYMENT_TYPES), 'EMPLOYMENT_TYPES must be exported as an array');
    const requiredTypes = [
      'Salaried',
      'Self-Employed Professional',
      'Self-Employed Business',
      'Director / Partner',
      'Other',
      'salaried',
      'self_employed',
      'business',
      'other',
    ];
    for (const t of requiredTypes) {
      assert.ok(EMPLOYMENT_TYPES.includes(t), `EMPLOYMENT_TYPES must include "${t}"`);
    }
  });

  await t.test('2. Public Website Loan Application: test all valid employmentType options', async () => {
    const testCases = [
      { employmentType: 'Salaried', details: '', expectedDetails: '' },
      { employmentType: 'Self-Employed Professional', details: '', expectedDetails: '' },
      { employmentType: 'Self-Employed Business', details: '', expectedDetails: '' },
      { employmentType: 'Director / Partner', details: '', expectedDetails: '' },
      { employmentType: 'Other', details: 'Freelance AI Engineer & Technical Architect', expectedDetails: 'Freelance AI Engineer & Technical Architect' },
      // Backward-compatibility tests
      { employmentType: 'salaried', details: '', expectedDetails: '' },
      { employmentType: 'self_employed', details: '', expectedDetails: '' },
      { employmentType: 'business', details: '', expectedDetails: '' },
      { employmentType: 'other', details: 'Independent Contract Researcher', expectedDetails: 'Independent Contract Researcher' },
    ];

    for (const tc of testCases) {
      const payload = {
        fullName: `Applicant ${tc.employmentType.replace(/[^a-zA-Z]/g, '')}`,
        email: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: 'Gurugram',
        loanCategory: testCategory._id.toString(),
        loanAmount: 2500000,
        employmentType: tc.employmentType,
        otherEmploymentDetails: tc.details,
        monthlyIncome: 120000,
      };

      const res = await fetch(`${baseUrl}/loans/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      assert.equal(res.status, 201, `Failed for employmentType "${tc.employmentType}": ${JSON.stringify(data)}`);
      assert.equal(data.status, 'success');
      assert.ok(data.data.applicationId, 'Must return applicationId');
      assert.ok(data.data.leadId, 'Must return leadId');

      createdAppIds.push(data.data.applicationId);
      createdLeadIds.push(data.data.leadId);

      // Verify in MongoDB directly
      const savedLead = await Lead.findById(data.data.leadId);
      assert.ok(savedLead, `Lead ${data.data.leadId} must be saved in MongoDB`);
      assert.equal(savedLead.employmentType, tc.employmentType, `Lead employmentType mismatch for ${tc.employmentType}`);
      assert.equal(savedLead.otherEmploymentDetails, tc.expectedDetails, `Lead otherEmploymentDetails mismatch`);
      assert.equal(savedLead.source, 'website');

      const savedApp = await LoanApplication.findById(data.data.applicationId);
      assert.ok(savedApp, `LoanApplication ${data.data.applicationId} must be saved in MongoDB`);
      assert.equal(savedApp.employmentType, tc.employmentType, `LoanApplication employmentType mismatch`);
      assert.equal(savedApp.otherEmploymentDetails, tc.expectedDetails, `LoanApplication otherEmploymentDetails mismatch`);
    }
  });

  await t.test('3. Partner Lead Submission: test "Other" and specialized employment types', async () => {
    const partnerCases = [
      {
        employmentType: 'Other',
        details: 'Organic Farmer & Agro Distributor',
      },
      {
        employmentType: 'Director / Partner',
        details: '',
      },
      {
        employmentType: 'other',
        details: 'Digital Media Creator',
      },
    ];

    for (const pc of partnerCases) {
      const payload = {
        customerName: `Partner Client ${pc.employmentType.replace(/[^a-zA-Z]/g, '')}`,
        customerPhone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerEmail: `partnerlead_${Date.now()}@client.com`,
        city: 'Noida',
        loanCategory: testCategory._id.toString(),
        requiredLoanAmount: 4000000,
        employmentType: pc.employmentType,
        otherEmploymentDetails: pc.details,
        monthlyIncome: 180000,
        remarks: `Referred by partner with employment type ${pc.employmentType}`,
      };

      const res = await fetch(`${baseUrl}/partner/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${partnerToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      assert.equal(res.status, 201, `Partner lead creation failed for ${pc.employmentType}: ${JSON.stringify(data)}`);
      assert.equal(data.status, 'success');
      assert.ok(data.data.leadId, 'Partner lead must have leadId');

      const partnerLeadDoc = await Lead.findOne({ leadId: data.data.leadId });
      assert.ok(partnerLeadDoc, 'Partner lead doc must exist in MongoDB');
      createdLeadIds.push(partnerLeadDoc._id);

      assert.equal(partnerLeadDoc.employmentType, pc.employmentType);
      assert.equal(partnerLeadDoc.otherEmploymentDetails, pc.details);
      assert.equal(partnerLeadDoc.source, 'partner');
      assert.equal(partnerLeadDoc.partnerId.toString(), partner._id.toString());
    }
  });

  await t.test('4. Validation Enforcement: invalid employmentType MUST be rejected with 400 (enum restrictions intact)', async () => {
    // 4a. Public website with invalid employmentType
    const invalidPublicPayload = {
      fullName: 'Invalid Enum Test User',
      email: `invalid_${Date.now()}@test.com`,
      phone: '9900112233',
      city: 'Delhi',
      loanCategory: testCategory._id.toString(),
      loanAmount: 1000000,
      employmentType: 'TotallyInvalidJobType',
      monthlyIncome: 50000,
    };

    const pubRes = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPublicPayload),
    });

    const pubData = await pubRes.json();
    assert.equal(pubRes.status, 400, 'Public API must reject invalid employmentType with HTTP 400');
    assert.match(pubData.message, /invalid employment type/i, 'Error message should clearly describe invalid employment type');

    // 4b. Partner lead with invalid employmentType
    const invalidPartnerPayload = {
      customerName: 'Invalid Partner Client',
      customerPhone: '9900112244',
      customerEmail: `invalid_partner_${Date.now()}@test.com`,
      city: 'Delhi',
      loanCategory: testCategory._id.toString(),
      requiredLoanAmount: 1000000,
      employmentType: 'UnrecognizedRole',
      monthlyIncome: 60000,
    };

    const partnerRes = await fetch(`${baseUrl}/partner/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify(invalidPartnerPayload),
    });

    const partnerData = await partnerRes.json();
    assert.equal(partnerRes.status, 400, 'Partner API must reject invalid employmentType with HTTP 400');
    assert.match(partnerData.message, /invalid employment type/i, 'Error message should clearly describe invalid employment type');
  });

  await t.test('5. Verify that created leads appear in Admin -> Website Leads endpoint', async () => {
    const res = await fetch(`${baseUrl}/admin/website-leads`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Admin website leads fetch failed: ${JSON.stringify(data)}`);
    assert.equal(data.status, 'success');
    assert.ok(Array.isArray(data.data), 'data.data must be an array of leads');

    // Find the lead we created with "Other" and verify its details
    const otherLead = data.data.find(
      (l) => l.employmentType === 'Other' && l.otherEmploymentDetails === 'Freelance AI Engineer & Technical Architect'
    );
    assert.ok(otherLead, 'Admin website-leads must include the lead created with employmentType="Other" and details');
    assert.equal(otherLead.employmentType, 'Other');
    assert.equal(otherLead.otherEmploymentDetails, 'Freelance AI Engineer & Technical Architect');
    assert.equal(otherLead.source, 'website');
  });
});
