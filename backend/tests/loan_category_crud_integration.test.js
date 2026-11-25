import test from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import LoanCategory from '../models/LoanCategory.js';

test('REALCRED CRM - Loan Category Management & Public Website End-to-End Integration Test Suite', async (t) => {
  let server;
  let baseUrl = '';

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(ENV.MONGO_URI || ENV.MONGODB_URI || 'mongodb://127.0.0.1:27017/realcred');
  }

  const runId = Date.now().toString();
  const JWT_SECRET = ENV.JWT_SECRET || 'realcred_jwt_development_secret_key_2026';

  // Create Admin and Non-Admin (Employee) test users
  const adminUser = await User.create({
    name: 'Category Admin Tester',
    email: `cat_admin_${runId}@realcred.in`,
    phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'AdminPassword123!',
    role: 'admin',
    status: 'active',
  });
  const adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  const empUser = await User.create({
    name: 'Category Emp Tester',
    email: `cat_emp_${runId}@realcred.in`,
    phone: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: 'EmpPassword123!',
    role: 'employee',
    status: 'active',
  });
  const empToken = jwt.sign({ id: empUser._id, role: 'employee' }, JWT_SECRET, { expiresIn: '1h' });

  let createdCategory = null;

  // 1. Authorization Guards
  await t.test('1. Security: Unauthenticated request to Admin Category endpoints returns 401', async () => {
    const res = await fetch(`${baseUrl}/admin/loan-categories`);
    assert.strictEqual(res.status, 401);
  });

  await t.test('2. Security: Non-admin (Employee) token receives 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/admin/loan-categories`, {
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  // 2. Admin List Categories
  await t.test('3. Admin can list all loan categories via /admin/loan-categories', async () => {
    const res = await fetch(`${baseUrl}/admin/loan-categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.status, 'success');
    assert.ok(Array.isArray(body.data));
  });

  // 3. Admin Create Category
  await t.test('4. Admin can create a new loan category with full parameters', async () => {
    const newCatPayload = {
      name: `Equipment Finance ${runId}`,
      tagline: 'High-speed heavy machinery and office asset financing.',
      description: 'Institutional asset financing designed for manufacturing, logistics, and healthcare expansion.',
      iconName: 'Briefcase',
      minAmount: 1000000,
      maxAmount: 25000000,
      minInterestRate: 9.25,
      maxInterestRate: 14.5,
      minTenureMonths: 24,
      maxTenureMonths: 120,
      displayOrder: 99,
      status: 'active',
      features: ['Up to 85% asset valuation financing', 'Quick 48-hour sanctions', 'Zero prepayment charges after 12 months'],
      eligibility: ['Minimum 3 years business operations', 'Annual turnover >= ₹1 Crore', 'CIBIL score 700+'],
      requiredDocuments: ['PAN & GST registration certificate', 'Audited balance sheets (2 years)', 'Equipment proforma invoice'],
    };

    const res = await fetch(`${baseUrl}/admin/loan-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newCatPayload),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.status, 'success');
    assert.ok(body.data._id);
    assert.strictEqual(body.data.name, newCatPayload.name);
    assert.strictEqual(body.data.status, 'active');
    assert.strictEqual(body.data.isActive, true);
    assert.ok(body.data.slug.includes('equipment-finance'));

    createdCategory = body.data;
  });

  // 4. Public Site Immediate Visibility
  await t.test('5. Newly created category is immediately visible on Public website endpoints', async () => {
    // Check listing
    const resList = await fetch(`${baseUrl}/loans/categories`);
    const listBody = await resList.json();
    assert.strictEqual(resList.status, 200);
    const foundInList = listBody.data.find((c) => c._id === createdCategory._id);
    assert.ok(foundInList, 'Category should be present in public listing');
    assert.strictEqual(foundInList.name, createdCategory.name);

    // Check slug details endpoint
    const resDetails = await fetch(`${baseUrl}/loans/categories/${createdCategory.slug}`);
    const detailsBody = await resDetails.json();
    assert.strictEqual(resDetails.status, 200);
    assert.strictEqual(detailsBody.data.name, createdCategory.name);
    assert.strictEqual(detailsBody.data.minInterestRate, 9.25);
    assert.strictEqual(detailsBody.data.features.length, 3);
  });

  // 5. Admin Deactivate / Toggle Status
  await t.test('6. Admin can toggle status to INACTIVE', async () => {
    const resToggle = await fetch(`${baseUrl}/admin/loan-categories/${createdCategory._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleBody = await resToggle.json();
    assert.strictEqual(resToggle.status, 200);
    assert.strictEqual(toggleBody.data.status, 'inactive');
    assert.strictEqual(toggleBody.data.isActive, false);

    // Admin endpoint can still see it
    const resAdmin = await fetch(`${baseUrl}/admin/loan-categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminBody = await resAdmin.json();
    const foundAdmin = adminBody.data.find((c) => c._id === createdCategory._id);
    assert.ok(foundAdmin);
    assert.strictEqual(foundAdmin.status, 'inactive');
  });

  // 6. Public Site Immediate Invisibility
  await t.test('7. INACTIVE category immediately disappears from Public website', async () => {
    // Should NOT appear in public listing
    const resList = await fetch(`${baseUrl}/loans/categories`);
    const listBody = await resList.json();
    assert.strictEqual(resList.status, 200);
    const foundInList = listBody.data.find((c) => c._id === createdCategory._id);
    assert.strictEqual(foundInList, undefined, 'Inactive category must NOT be present on public website');

    // Slug detail query must return 404
    const resDetails = await fetch(`${baseUrl}/loans/categories/${createdCategory.slug}`);
    assert.strictEqual(resDetails.status, 404);
  });

  // 7. Admin Reactivate
  await t.test('8. Admin can reactivate category, making it live on Public website again', async () => {
    const resToggle = await fetch(`${baseUrl}/admin/loan-categories/${createdCategory._id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const toggleBody = await resToggle.json();
    assert.strictEqual(resToggle.status, 200);
    assert.strictEqual(toggleBody.data.status, 'active');
    assert.strictEqual(toggleBody.data.isActive, true);

    // Immediately visible again
    const resList = await fetch(`${baseUrl}/loans/categories`);
    const listBody = await resList.json();
    const foundInList = listBody.data.find((c) => c._id === createdCategory._id);
    assert.ok(foundInList, 'Reactivated category should appear again on public website');
  });

  // 8. Admin Update Category
  await t.test('9. Admin can update category specifications and changes reflect immediately', async () => {
    const updatedTagline = 'Updated heavy machinery financing with revised lowest rate 8.99%.';
    const resUpdate = await fetch(`${baseUrl}/admin/loan-categories/${createdCategory._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        tagline: updatedTagline,
        minInterestRate: 8.99,
      }),
    });

    const updateBody = await resUpdate.json();
    assert.strictEqual(resUpdate.status, 200);
    assert.strictEqual(updateBody.data.tagline, updatedTagline);
    assert.strictEqual(updateBody.data.minInterestRate, 8.99);

    // Public website immediately returns updated values
    const resPublic = await fetch(`${baseUrl}/loans/categories/${createdCategory.slug}`);
    const publicBody = await resPublic.json();
    assert.strictEqual(publicBody.data.tagline, updatedTagline);
    assert.strictEqual(publicBody.data.minInterestRate, 8.99);
  });

  // 9. Admin Soft Delete
  await t.test('10. Admin can safely soft-delete category, removing it from public view', async () => {
    const resDelete = await fetch(`${baseUrl}/admin/loan-categories/${createdCategory._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const deleteBody = await resDelete.json();
    assert.strictEqual(resDelete.status, 200);
    assert.strictEqual(deleteBody.status, 'success');

    // Public website returns 404
    const resPublic = await fetch(`${baseUrl}/loans/categories/${createdCategory.slug}`);
    assert.strictEqual(resPublic.status, 404);

    // Default admin listing does not return deleted categories
    const resAdmin = await fetch(`${baseUrl}/admin/loan-categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminBody = await resAdmin.json();
    const foundAdmin = adminBody.data.find((c) => c._id === createdCategory._id);
    assert.strictEqual(foundAdmin, undefined);
  });

  // Cleanup
  t.after(async () => {
    try {
      if (createdCategory) {
        await LoanCategory.deleteOne({ _id: createdCategory._id });
      }
      await User.deleteMany({ _id: { $in: [adminUser._id, empUser._id] } });
    } catch (e) {
      console.error('Cleanup error:', e);
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });
});
