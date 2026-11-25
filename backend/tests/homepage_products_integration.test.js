import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import { Bank, LoanCategory, Lead, User } from '../models/index.js';

test('REALCRED - Homepage Our Products Database-Driven Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';
  let adminToken = '';
  let adminUser = null;
  let createdBankId = null;
  let testLeadId = null;

  // Start ephemeral server
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

  // Admin user & token setup
  adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Homepage Admin',
      email: `admin_hp_${Date.now()}@realcred.in`,
      phone: '9900118833',
      role: 'admin',
      password: 'AdminPassword123!',
      status: 'active',
    });
  }

  adminToken = jwt.sign(
    { userId: adminUser._id, role: 'admin', email: adminUser.email },
    ENV.JWT_SECRET,
    { expiresIn: '1h' }
  );

  await t.test('1. Verify zero dummy/test records in MongoDB and GET /api/loans/categories', async () => {
    // Check loancategories collection directly
    const testCategoriesInDb = await LoanCategory.find({
      slug: { $regex: '^test-' },
    });
    assert.strictEqual(
      testCategoriesInDb.length,
      0,
      'There must be zero test loan categories remaining in MongoDB'
    );

    // Call GET /api/loans/categories
    const res = await fetch(`${baseUrl}/loans/categories`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, 'success');
    assert.ok(json.data.length >= 5, 'Must contain the 5 genuine core categories');

    const testCategoriesInApi = json.data.filter((c) => c.slug.startsWith('test-') || c.name.startsWith('Test Loan'));
    assert.strictEqual(
      testCategoriesInApi.length,
      0,
      'Public GET /api/loans/categories must not return any test records'
    );
  });

  await t.test('2. GET /api/loans/homepage-products returns active database-driven products', async () => {
    const res = await fetch(`${baseUrl}/loans/homepage-products`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, 'success');
    assert.ok(Array.isArray(json.data), 'Returns an array of products');

    // All returned products must be active and non-deleted
    for (const prod of json.data) {
      assert.strictEqual(prod.status.toLowerCase(), 'active');
      assert.ok(prod.bankName, 'Product must have bankName');
      assert.ok(prod.bankCode, 'Product must have bankCode');
      assert.ok(prod.interestRateRange, 'Product must have interestRateRange');
      assert.ok(prod.features && prod.features.length > 0, 'Product must have features');
    }
  });

  await t.test('3. Admin creates a new bank -> immediately appears on homepage products', async () => {
    const uniqueCode = `BHP${Date.now().toString().slice(-4)}`;
    const createRes = await fetch(`${baseUrl}/admin/banks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: `Bank of Innovation ${uniqueCode}`,
        bankCode: uniqueCode,
        description: 'Next-gen institutional lending partner for enterprises.',
        interestRateRange: { min: 9.1, max: 13.8 },
        maxTenureMonths: 240,
        processingFeeDetails: '0.75% + GST',
        status: 'active',
      }),
    });

    const createJson = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    createdBankId = createJson.data._id;
    assert.ok(createdBankId, 'New bank created');

    // Verify it immediately appears on public homepage products
    const hpRes = await fetch(`${baseUrl}/loans/homepage-products`);
    const hpJson = await hpRes.json();
    const found = hpJson.data.find((p) => p.bankId.toString() === createdBankId.toString());
    assert.ok(found, 'Newly created active bank must appear immediately in homepage products');
    assert.strictEqual(found.bankCode, uniqueCode);
  });

  await t.test('4. Admin marks bank INACTIVE -> immediately disappears from homepage products', async () => {
    const toggleRes = await fetch(`${baseUrl}/admin/banks/${createdBankId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });

    const toggleJson = await toggleRes.json();
    assert.strictEqual(toggleRes.status, 200);
    assert.strictEqual(toggleJson.data.status, 'inactive');

    // Verify it immediately disappears from public homepage products
    const hpRes = await fetch(`${baseUrl}/loans/homepage-products`);
    const hpJson = await hpRes.json();
    const found = hpJson.data.find((p) => p.bankId.toString() === createdBankId.toString());
    assert.strictEqual(
      found,
      undefined,
      'Inactive bank must NOT appear on homepage products'
    );

    // Verify it also disappears from active banks endpoint
    const bankRes = await fetch(`${baseUrl}/banks/active`);
    const bankJson = await bankRes.json();
    const foundBank = bankJson.data.find((b) => b._id.toString() === createdBankId.toString());
    assert.strictEqual(
      foundBank,
      undefined,
      'Inactive bank must NOT appear in public active banks'
    );
  });

  await t.test('5. Admin reactivates bank -> immediately reappears on homepage products', async () => {
    const toggleRes = await fetch(`${baseUrl}/admin/banks/${createdBankId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'active' }),
    });

    const toggleJson = await toggleRes.json();
    assert.strictEqual(toggleRes.status, 200);
    assert.strictEqual(toggleJson.data.status, 'active');

    // Verify it immediately reappears on public homepage products
    const hpRes = await fetch(`${baseUrl}/loans/homepage-products`);
    const hpJson = await hpRes.json();
    const found = hpJson.data.find((p) => p.bankId.toString() === createdBankId.toString());
    assert.ok(found, 'Reactivated bank must reappear immediately in homepage products');
  });

  await t.test('6. Application submission rejects inactive banks and accepts active banks', async () => {
    const genuineCat = await LoanCategory.findOne({ slug: 'home-loan' });
    assert.ok(genuineCat);

    // 1. Submit with active bank -> Success (201)
    const validRes = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Rajesh Test Sharma',
        mobileNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: 'Mumbai',
        loanCategoryId: genuineCat._id,
        preferredBankId: createdBankId,
        requiredLoanAmount: 2500000,
        employmentType: 'Salaried',
      }),
    });
    const validJson = await validRes.json();
    assert.strictEqual(validRes.status, 201);
    testLeadId = validJson.data.leadId;

    // 2. Deactivate bank
    await fetch(`${baseUrl}/admin/banks/${createdBankId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'inactive' }),
    });

    // 3. Submit with deactivated bank -> Rejection (400)
    const invalidRes = await fetch(`${baseUrl}/loans/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Sunil Test Kumar',
        mobileNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        city: 'Delhi',
        loanCategoryId: genuineCat._id,
        preferredBankId: createdBankId,
        requiredLoanAmount: 3000000,
        employmentType: 'Salaried',
      }),
    });
    const invalidJson = await invalidRes.json();
    assert.strictEqual(invalidRes.status, 400);
    assert.ok(
      invalidJson.message.includes('inactive or unavailable'),
      `Expected message to contain 'inactive or unavailable', got '${invalidJson.message}'`
    );
  });

  await t.test('7. Admin deletes bank -> immediately disappears from homepage products', async () => {
    const delRes = await fetch(`${baseUrl}/admin/banks/${createdBankId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delJson = await delRes.json();
    assert.strictEqual(delRes.status, 200);

    // Verify it is not in homepage products
    const hpRes = await fetch(`${baseUrl}/loans/homepage-products`);
    const hpJson = await hpRes.json();
    const found = hpJson.data.find((p) => p.bankId.toString() === createdBankId.toString());
    assert.strictEqual(found, undefined, 'Deleted bank must not appear in homepage products');
  });

  // Teardown
  if (createdBankId) {
    await Bank.deleteOne({ _id: createdBankId });
  }
  if (testLeadId) {
    await Lead.deleteOne({ leadId: testLeadId });
  }

  server.close();
  await mongoose.disconnect();
});
