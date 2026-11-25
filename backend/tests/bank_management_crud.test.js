import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Bank from '../models/Bank.js';
import Lead from '../models/Lead.js';
import LoanCategory from '../models/LoanCategory.js';
import LoanApplication from '../models/LoanApplication.js';
import Partner from '../models/Partner.js';

test('RealCred: Comprehensive Bank Management CRUD, Synchronization & Deletion Verification Suite', async (t) => {
  let server;
  let baseUrl = '';
  let adminToken = '';
  let employeeToken = '';
  let partnerToken = '';
  let adminUser = null;
  let employeeUser = null;
  let partnerUser = null;
  let testCategory = null;

  const createdBankIds = [];
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

  // Ensure loan category exists
  testCategory = await LoanCategory.findOne({ isActive: true });
  if (!testCategory) {
    testCategory = await LoanCategory.create({
      name: 'Corporate Credit Facility',
      slug: 'corporate-credit-' + Date.now(),
      description: 'Test category for bank association',
      minAmount: 50000,
      maxAmount: 50000000,
      interestRateStartingFrom: 9.0,
      isActive: true,
    });
  }

  // Create or find Admin User
  adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Bank Test Admin',
      email: `admin_bank_${Date.now()}@realcred.in`,
      phone: '9900118822',
      role: 'admin',
      password: 'AdminPassword123!',
      status: 'active',
    });
  }

  // Create Employee and Partner users for security verification
  const empEmail = `emp_bank_${Date.now()}@realcred.in`;
  employeeUser = await User.create({
    name: 'Loan Officer Test',
    email: empEmail,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    role: 'employee',
    password: 'EmployeePassword123!',
    status: 'active',
  });

  const partEmail = `part_bank_${Date.now()}@realcred.in`;
  partnerUser = await User.create({
    name: 'DSA Partner Test',
    email: partEmail,
    phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
    role: 'partner',
    password: 'PartnerPassword123!',
    status: 'active',
  });

  const partnerDoc = await Partner.create({
    user: partnerUser._id,
    partnerCode: `RCP-${Date.now().toString().slice(-6)}`,
    businessName: 'Apex Channel Partners',
    businessType: 'Proprietorship',
    accountStatus: 'active',
  });

  const jwt = (await import('jsonwebtoken')).default;
  adminToken = jwt.sign(
    { userId: adminUser._id, role: 'admin', email: adminUser.email },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );
  employeeToken = jwt.sign(
    { userId: employeeUser._id, role: 'employee', email: employeeUser.email },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );
  partnerToken = jwt.sign(
    { userId: partnerUser._id, role: 'partner', email: partnerUser.email },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  t.after(async () => {
    // Cleanup
    if (createdLeadIds.length > 0) {
      await Lead.deleteMany({ _id: { $in: createdLeadIds } });
    }
    if (createdAppIds.length > 0) {
      await LoanApplication.deleteMany({ _id: { $in: createdAppIds } });
    }
    if (createdBankIds.length > 0) {
      await Bank.deleteMany({ _id: { $in: createdBankIds } });
    }
    if (employeeUser) await User.deleteOne({ _id: employeeUser._id });
    if (partnerDoc) await Partner.deleteOne({ _id: partnerDoc._id });
    if (partnerUser) await User.deleteOne({ _id: partnerUser._id });

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // TEST 1: Security checks - only Admin can perform CRUD
  await t.test('1. Security: Employee & Partner cannot manage banks', async () => {
    const payload = {
      name: 'Unauthorized Bank',
      bankCode: 'UNAUTH',
    };

    // Employee attempt
    const empRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify(payload),
    });
    assert.equal(empRes.status, 403, 'Employee must be rejected with HTTP 403 Forbidden');

    // Partner attempt
    const partRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify(payload),
    });
    assert.equal(partRes.status, 403, 'Partner must be rejected with HTTP 403 Forbidden');

    // Unauthenticated attempt
    const unauthRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(unauthRes.status, 401, 'Unauthenticated user must be rejected with HTTP 401');
  });

  // TEST 2: CREATE - Add Bank with validation & uniqueness
  let createdBank = null;
  await t.test('2. CREATE: Admin can add a new bank with valid coordinates', async () => {
    const payload = {
      name: 'IndusInd Bank Limited',
      bankCode: 'INDUS',
      logoUrl: 'https://cdn.realcred.in/logos/indusind.png',
      description: 'Premier private sector banking partner for business and commercial facilities.',
      contactDetails: {
        contactPerson: 'Sandeep Varma',
        email: 'credit.indus@indusind.com',
        phone: '9811223344',
      },
      status: 'active',
      interestRateRange: { min: 9.15, max: 14.85 },
      maxTenureMonths: 240,
      processingFeeDetails: '0.75% + GST',
    };

    const res = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Bank creation failed: ${JSON.stringify(data)}`);
    assert.equal(data.status, 'success');
    assert.ok(data.data._id, 'Bank must have MongoDB _id');
    assert.equal(data.data.name, 'IndusInd Bank Limited');
    assert.equal(data.data.bankCode, 'INDUS');
    assert.equal(data.data.status, 'active');

    createdBank = data.data;
    createdBankIds.push(createdBank._id);

    // Verify stored in MongoDB
    const docInDb = await Bank.findById(createdBank._id);
    assert.ok(docInDb, 'Bank must be saved in MongoDB database');
    assert.equal(docInDb.name, 'IndusInd Bank Limited');
    assert.equal(docInDb.isDeleted, false);

    // Prevent duplicate entry with same name or code
    const dupRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'IndusInd Bank Limited',
        bankCode: 'INDUS',
      }),
    });
    const dupData = await dupRes.json();
    assert.equal(dupRes.status, 400, 'Duplicate bank entry must be rejected with HTTP 400');
    assert.match(dupData.message, /already exists/i);
  });

  // TEST 3: READ - Display Banks on Admin and Public Website
  await t.test('3. READ: New bank appears in Admin list and Public Website active banks', async () => {
    // 3a. Admin list
    const adminRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    assert.equal(adminRes.status, 200);
    assert.ok(adminData.data.some((b) => b._id === createdBank._id), 'Created bank must appear in Admin bank list');

    // 3b. Public active banks endpoint
    const pubRes = await fetch(`${baseUrl}/banks/active`);
    const pubData = await pubRes.json();
    assert.equal(pubRes.status, 200);
    const pubBank = pubData.data.find((b) => b._id === createdBank._id);
    assert.ok(pubBank, 'Created bank must immediately appear in Public Website active banks');
    assert.equal(pubBank.name, 'IndusInd Bank Limited');
  });

  // TEST 4: UPDATE - Edit Bank details
  await t.test('4. UPDATE: Admin can edit bank name, ROI and details, reflected immediately', async () => {
    const updatePayload = {
      name: 'IndusInd Premier Banking',
      description: 'Updated premium corporate banking desk',
      interestRateRange: { min: 8.85, max: 14.25 },
      maxTenureMonths: 300,
      processingFeeDetails: '0.50% + GST (Special Campaign)',
    };

    const res = await fetch(`${baseUrl}/admin/banks/${createdBank._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    const data = await res.json();
    assert.equal(res.status, 200, `Bank update failed: ${JSON.stringify(data)}`);
    assert.equal(data.status, 'success');
    assert.equal(data.data.name, 'IndusInd Premier Banking');
    assert.equal(data.data.interestRateRange.min, 8.85);

    // Verify in MongoDB directly
    const updatedDoc = await Bank.findById(createdBank._id);
    assert.equal(updatedDoc.name, 'IndusInd Premier Banking');
    assert.equal(updatedDoc.interestRateRange.min, 8.85);

    // Verify Public Website reflects updated details
    const pubRes = await fetch(`${baseUrl}/banks/active`);
    const pubData = await pubRes.json();
    const pubBank = pubData.data.find((b) => b._id === createdBank._id);
    assert.ok(pubBank, 'Public Website must show updated bank');
    assert.equal(pubBank.name, 'IndusInd Premier Banking');
    assert.equal(pubBank.interestRateRange.min, 8.85);
  });

  // TEST 5: DEACTIVATE & ACTIVATE (Status Toggle)
  await t.test('5. STATUS TOGGLE: Deactivated bank disappears from public selection; Reactivated bank reappears', async () => {
    // 5a. Deactivate via PATCH status
    const deactRes = await fetch(`${baseUrl}/admin/banks/${createdBank._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deactData = await deactRes.json();
    assert.equal(deactRes.status, 200);
    assert.equal(deactData.data.status, 'inactive');

    // Verify in Admin list with inactive status
    const adminRes = await fetch(`${baseUrl}/admin/banks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    const adminBank = adminData.data.find((b) => b._id === createdBank._id);
    assert.equal(adminBank.status, 'inactive');

    // Verify it DISAPPEARS from Public Website active banks
    const pubRes1 = await fetch(`${baseUrl}/banks/active`);
    const pubData1 = await pubRes1.json();
    const pubBankInactive = pubData1.data.find((b) => b._id === createdBank._id);
    assert.equal(pubBankInactive, undefined, 'Inactive bank MUST NOT appear in Public active banks');

    // Verify Admin status filter: ?status=inactive returns the bank
    const filterInactiveRes = await fetch(`${baseUrl}/admin/banks?status=inactive`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filterInactiveData = await filterInactiveRes.json();
    assert.equal(filterInactiveRes.status, 200);
    assert.ok(
      filterInactiveData.data.some((b) => b._id === createdBank._id),
      'Inactive bank must be included in ?status=inactive filter'
    );

    // Verify Admin status filter: ?status=active EXCLUDES the bank
    const filterActiveRes = await fetch(`${baseUrl}/admin/banks?status=active`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const filterActiveData = await filterActiveRes.json();
    assert.equal(filterActiveRes.status, 200);
    assert.equal(
      filterActiveData.data.some((b) => b._id === createdBank._id),
      false,
      'Inactive bank must be excluded from ?status=active filter'
    );

    // Verify Admin search: ?search=IndusInd finds the bank
    const searchRes = await fetch(`${baseUrl}/admin/banks?search=IndusInd`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const searchData = await searchRes.json();
    assert.equal(searchRes.status, 200);
    assert.ok(
      searchData.data.some((b) => b._id === createdBank._id),
      'Bank search must return matching bank'
    );

    // SECURITY & DATA INTEGRITY: Public Loan Application with Inactive Bank MUST BE REJECTED
    const pubAppRes = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Manish Sharma',
        mobileNumber: '9811223399',
        email: 'manish@test.com',
        city: 'Mumbai',
        loanCategoryId: testCategory._id,
        preferredBankId: createdBank._id, // INACTIVE BANK ID
        requiredLoanAmount: 2500000,
        employmentType: 'Salaried',
      }),
    });
    const pubAppData = await pubAppRes.json();
    assert.equal(
      pubAppRes.status,
      400,
      'Public application using inactive bank must be rejected with HTTP 400'
    );
    assert.match(
      pubAppData.message,
      /inactive or unavailable/i,
      'Error message must state bank is inactive or unavailable'
    );

    // SECURITY & DATA INTEGRITY: Partner Lead Submission with Inactive Bank MUST BE REJECTED
    const partLeadRes = await fetch(`${baseUrl}/partner/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${partnerToken}`,
      },
      body: JSON.stringify({
        customerName: 'Priya Verma',
        customerPhone: '9822334455',
        customerEmail: 'priya@test.com',
        city: 'Pune',
        loanCategory: testCategory._id,
        preferredBank: createdBank._id, // INACTIVE BANK ID
        requiredLoanAmount: 3500000,
        employmentType: 'Salaried',
      }),
    });
    const partLeadData = await partLeadRes.json();
    assert.equal(
      partLeadRes.status,
      400,
      'Partner lead using inactive bank must be rejected with HTTP 400'
    );
    assert.match(
      partLeadData.message,
      /inactive or unavailable/i,
      'Partner lead error message must state bank is inactive or unavailable'
    );

    // 5b. Reactivate via PATCH status
    const reactRes = await fetch(`${baseUrl}/admin/banks/${createdBank._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const reactData = await reactRes.json();
    assert.equal(reactRes.status, 200);
    assert.equal(reactData.data.status, 'active');

    // Verify it REAPPEARS on Public Website
    const pubRes2 = await fetch(`${baseUrl}/banks/active`);
    const pubData2 = await pubRes2.json();
    const pubBankActive = pubData2.data.find((b) => b._id === createdBank._id);
    assert.ok(pubBankActive, 'Reactivated bank MUST reappear on Public active banks');
    assert.equal(pubBankActive.status, 'active');

    // Verify Public Loan Application with now-active bank SUCCEEDS
    const pubAppActiveRes = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Manish Sharma Reactivated',
        mobileNumber: '9811223388',
        email: 'manish_act@test.com',
        city: 'Mumbai',
        loanCategoryId: testCategory._id,
        preferredBankId: createdBank._id, // ACTIVE BANK ID
        requiredLoanAmount: 2500000,
        employmentType: 'Salaried',
      }),
    });
    const pubAppActiveData = await pubAppActiveRes.json();
    assert.equal(
      pubAppActiveRes.status,
      201,
      `Application with reactivated bank must succeed: ${JSON.stringify(pubAppActiveData)}`
    );
    if (pubAppActiveData.data?.lead?._id) {
      createdLeadIds.push(pubAppActiveData.data.lead._id);
    }
    if (pubAppActiveData.data?.application?._id) {
      createdAppIds.push(pubAppActiveData.data.application._id);
    }
  });

  // TEST 6: DELETE (Case A: No Historical Leads -> Hard Delete)
  await t.test('6. DELETE (Unassociated Bank): Completely deletes record from MongoDB and public selection', async () => {
    const unassociatedBank = await Bank.create({
      name: `Unassociated Bank ${Date.now()}`,
      bankCode: `UNASSOC_${Date.now().toString().slice(-4)}`,
      status: 'active',
      isDeleted: false,
    });
    createdBankIds.push(unassociatedBank._id);

    const delRes = await fetch(`${baseUrl}/admin/banks/${unassociatedBank._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const delData = await delRes.json();
    assert.equal(delRes.status, 200, `Delete failed: ${JSON.stringify(delData)}`);
    assert.equal(delData.status, 'success');
    assert.equal(delData.data.strategy, 'hard_delete');

    // Verify physically removed from MongoDB
    const docInDb = await Bank.findById(unassociatedBank._id);
    assert.equal(docInDb, null, 'Unassociated bank must be completely removed from MongoDB');

    // Verify GONE from Admin bank list
    const adminRes = await fetch(`${baseUrl}/admin/banks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    assert.equal(adminData.data.some((b) => b._id.toString() === unassociatedBank._id.toString()), false, 'Deleted bank must not appear in Admin list');

    // Verify GONE from Public active banks
    const pubRes = await fetch(`${baseUrl}/banks/active`);
    const pubData = await pubRes.json();
    assert.equal(pubData.data.some((b) => b._id.toString() === unassociatedBank._id.toString()), false, 'Deleted bank must not appear on Public Website');
  });

  // TEST 7: DELETE (Case B: Historical Lead Association -> Soft Delete Preserving Leads)
  await t.test('7. DELETE (Associated Bank): Preserves historical leads while removing bank from public selection', async () => {
    // Create a bank
    const newBank = await Bank.create({
      name: 'Kotak Mahindra Capital',
      bankCode: `KOTAK_${Date.now().toString().slice(-4)}`,
      status: 'active',
      isDeleted: false,
    });
    createdBankIds.push(newBank._id);

    // Create a lead associated with this bank
    const historicalLead = await Lead.create({
      leadId: `LEAD-TEST-BANK-${Date.now().toString().slice(-4)}`,
      customerName: 'Aarav Malhotra',
      customerPhone: '9877112233',
      customerEmail: 'aarav@test.com',
      city: 'Delhi',
      loanCategory: testCategory._id,
      preferredBank: newBank._id,
      requiredLoanAmount: 5000000,
      employmentType: 'Salaried',
      source: 'website',
      status: 'In Process',
    });
    createdLeadIds.push(historicalLead._id);

    // Delete the bank via Admin DELETE API
    const delRes = await fetch(`${baseUrl}/admin/banks/${newBank._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const delData = await delRes.json();
    assert.equal(delRes.status, 200, `Delete failed: ${JSON.stringify(delData)}`);
    assert.equal(delData.status, 'success');
    assert.equal(delData.data.strategy, 'soft_delete');

    // Verify historical lead is completely intact
    const verifyLead = await Lead.findById(historicalLead._id);
    assert.ok(verifyLead, 'Historical lead record must NOT be deleted');
    assert.equal(verifyLead.preferredBank.toString(), newBank._id.toString(), 'Historical preferredBank reference must be preserved');

    // Verify bank doc is flagged as isDeleted in MongoDB
    const bankDoc = await Bank.findById(newBank._id);
    assert.ok(bankDoc, 'Soft-deleted bank document is retained for historical foreign key integrity');
    assert.equal(bankDoc.isDeleted, true);
    assert.equal(bankDoc.status, 'inactive');

    // Verify bank does NOT appear in Admin active banks list
    const adminRes = await fetch(`${baseUrl}/admin/banks`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    assert.equal(adminData.data.some((b) => b._id.toString() === newBank._id.toString()), false, 'Soft-deleted bank must not appear in Admin list');

    // Verify bank does NOT appear on Public Website active banks
    const pubRes = await fetch(`${baseUrl}/banks/active`);
    const pubData = await pubRes.json();
    assert.equal(pubData.data.some((b) => b._id.toString() === newBank._id.toString()), false, 'Soft-deleted bank must not appear on Public Website');
  });
});
